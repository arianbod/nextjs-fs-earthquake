import { EventEmitter, Utils } from './utils.js';
import { AudioWorklets } from './worklets.js';

export class AudioRecorder extends EventEmitter {
        constructor(sampleRate = 16000, silenceTimeout = 1000) {
            super();
            this.sampleRate = sampleRate;
            this.stream = undefined;
            this.audioContext = undefined;
            this.contextSampleRate = sampleRate;
            this.source = undefined;
            this.recording = false;
            this.recordingWorklet = undefined;
            this.vuWorklet = undefined;
            this.starting = null;
            this.silenceTimeout = silenceTimeout;
            this.lastActiveTime = 0;
            this.silenceCheck = null;
            this.isSilent = false;
        }

        async start(externalContext) {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Could not request user media");
            }

            this.starting = new Promise(async (resolve, reject) => {
                try {
                    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    if (externalContext) {
                        this.audioContext = externalContext;
                        if (this.audioContext.state === 'suspended') {
                            try {
                                this.audioContext.resume();
                            } catch (err) {
                                console.error('Failed to resume provided AudioContext:', err);
                            }
                        }
                    } else {
                        this.audioContext = await Utils.audioContext({ sampleRate: this.sampleRate });
                    }
                    this.contextSampleRate = this.audioContext.sampleRate;
                    this.source = this.audioContext.createMediaStreamSource(this.stream);

                    const workletName = "audio-recorder-worklet";
                    const src = Utils.createWorkletFromSrc(workletName, AudioWorklets.AudioRecordingWorklet);

                    await this.audioContext.audioWorklet.addModule(src);
                    this.recordingWorklet = new AudioWorkletNode(
                        this.audioContext,
                        workletName,
                    );

                    this.recordingWorklet.port.onmessage = async (ev) => {
                        const arrayBuffer = ev.data.data.int16arrayBuffer;
                        if (arrayBuffer) {
                            let int16 = new Int16Array(arrayBuffer);
                            if (this.contextSampleRate !== this.sampleRate) {
                                int16 = await this.resampleTo16k(int16);
                            }
                            const arrayBufferString = Utils.arrayBufferToBase64(int16.buffer);
                            this.emit("data", arrayBufferString);
                        }
                    };
                    this.source.connect(this.recordingWorklet);

                    // Volume meter worklet
                    const vuWorkletName = "vu-meter";
                    await this.audioContext.audioWorklet.addModule(
                        Utils.createWorkletFromSrc(vuWorkletName, AudioWorklets.VolMeterWorklet),
                    );
                    this.vuWorklet = new AudioWorkletNode(this.audioContext, vuWorkletName);
                    this.vuWorklet.port.onmessage = (ev) => {
                        const vol = ev.data.volume;
                        this.emit("volume", vol);
                        if (vol > 0.01) {
                            this.lastActiveTime = Date.now();
                            this.isSilent = false;
                        }
                    };

                    this.source.connect(this.vuWorklet);
                    this.isSilent = false;
                    this.lastActiveTime = Date.now();
                    this.silenceCheck = setInterval(() => {
                        if (Date.now() - this.lastActiveTime > this.silenceTimeout && !this.isSilent) {
                            this.isSilent = true;
                            this.emit("silence");
                        }
                    }, 200);
                    this.recording = true;
                    resolve();
                    this.starting = null;
                } catch (error) {
                    reject(error);
                }
            });

            return this.starting;
        }

        stop() {
            const handleStop = () => {
                this.source?.disconnect();
                this.stream?.getTracks().forEach((track) => track.stop());
                this.stream = undefined;
                this.recordingWorklet = undefined;
                this.vuWorklet = undefined;
                if (this.silenceCheck) {
                    clearInterval(this.silenceCheck);
                    this.silenceCheck = null;
                }
                this.recording = false;
                this.isSilent = false;
            };

            if (this.starting) {
                this.starting.then(handleStop);
                return;
            }
            handleStop();
        }

        async resampleTo16k(int16Array) {
            if (this.contextSampleRate === this.sampleRate) {
                return int16Array;
            }

            const float32 = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
                float32[i] = int16Array[i] / 32768;
            }

            const lengthInSamples = Math.ceil(float32.length * this.sampleRate / this.contextSampleRate);
            const offlineCtx = new OfflineAudioContext(1, lengthInSamples, this.sampleRate);
            const buffer = offlineCtx.createBuffer(1, float32.length, this.contextSampleRate);
            buffer.copyToChannel(float32, 0);
            const source = offlineCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(offlineCtx.destination);
            source.start(0);
            const rendered = await offlineCtx.startRendering();
            const renderedData = rendered.getChannelData(0);
            const result = new Int16Array(renderedData.length);
            for (let i = 0; i < renderedData.length; i++) {
                const s = Math.max(-1, Math.min(1, renderedData[i]));
                result[i] = s * 32768;
            }
            return result;
        }
    }

    // =============================================================================
    // AUDIO STREAMER
    // =============================================================================

export class AudioStreamer {
        constructor(context) {
            this.context = context;
            this.sampleRate = 24000;
            this.bufferSize = 7680;
            this.audioQueue = [];
            this.isPlaying = false;
            this.isStreamComplete = false;
            this.checkInterval = null;
            this.scheduledTime = 0;
            this.initialBufferTime = 0.1;
            this.gainNode = this.context.createGain();
            this.source = this.context.createBufferSource();
            this.endOfQueueAudioSource = null;
            this.gainNode.connect(this.context.destination);
            this.onComplete = () => { };
        }

        async addWorklet(workletName, workletSrc, handler) {
            const src = Utils.createWorkletFromSrc(workletName, workletSrc);
            await this.context.audioWorklet.addModule(src);
            const worklet = new AudioWorkletNode(this.context, workletName);
            worklet.port.onmessage = handler;
            worklet.connect(this.gainNode);
            return worklet;
        }

        _processPCM16Chunk(chunk) {
            const float32Array = new Float32Array(chunk.length / 2);
            const dataView = new DataView(chunk.buffer);

            for (let i = 0; i < chunk.length / 2; i++) {
                try {
                    const int16 = dataView.getInt16(i * 2, true);
                    float32Array[i] = int16 / 32768;
                } catch (e) {
                    console.error(e);
                }
            }
            return float32Array;
        }

        addPCM16(chunk) {
            this.isStreamComplete = false;
            let processingBuffer = this._processPCM16Chunk(chunk);

            while (processingBuffer.length >= this.bufferSize) {
                const buffer = processingBuffer.slice(0, this.bufferSize);
                this.audioQueue.push(buffer);
                processingBuffer = processingBuffer.slice(this.bufferSize);
            }

            if (processingBuffer.length > 0) {
                this.audioQueue.push(processingBuffer);
            }

            if (!this.isPlaying) {
                this.isPlaying = true;
                this.scheduledTime = this.context.currentTime + this.initialBufferTime;
                this.scheduleNextBuffer();
            }
        }

        createAudioBuffer(audioData) {
            const audioBuffer = this.context.createBuffer(
                1,
                audioData.length,
                this.sampleRate
            );
            audioBuffer.getChannelData(0).set(audioData);
            return audioBuffer;
        }

        scheduleNextBuffer() {
            const SCHEDULE_AHEAD_TIME = 0.2;

            while (
                this.audioQueue.length > 0 &&
                this.scheduledTime < this.context.currentTime + SCHEDULE_AHEAD_TIME
            ) {
                const audioData = this.audioQueue.shift();
                const audioBuffer = this.createAudioBuffer(audioData);
                const source = this.context.createBufferSource();

                if (this.audioQueue.length === 0) {
                    if (this.endOfQueueAudioSource) {
                        this.endOfQueueAudioSource.onended = null;
                    }
                    this.endOfQueueAudioSource = source;
                    source.onended = () => {
                        if (
                            !this.audioQueue.length &&
                            this.endOfQueueAudioSource === source
                        ) {
                            this.endOfQueueAudioSource = null;
                            this.onComplete();
                        }
                    };
                }

                source.buffer = audioBuffer;
                source.connect(this.gainNode);

                const startTime = Math.max(this.scheduledTime, this.context.currentTime);
                source.start(startTime);
                this.scheduledTime = startTime + audioBuffer.duration;
            }

            if (this.audioQueue.length === 0) {
                if (this.isStreamComplete) {
                    this.isPlaying = false;
                    if (this.checkInterval) {
                        clearInterval(this.checkInterval);
                        this.checkInterval = null;
                    }
                } else {
                    if (!this.checkInterval) {
                        this.checkInterval = setInterval(() => {
                            if (this.audioQueue.length > 0) {
                                this.scheduleNextBuffer();
                            }
                        }, 100);
                    }
                }
            } else {
                const nextCheckTime =
                    (this.scheduledTime - this.context.currentTime) * 1000;
                setTimeout(
                    () => this.scheduleNextBuffer(),
                    Math.max(0, nextCheckTime - 50)
                );
            }
        }

        stop() {
            this.isPlaying = false;
            this.isStreamComplete = true;
            this.audioQueue = [];
            this.scheduledTime = this.context.currentTime;

            if (this.checkInterval) {
                clearInterval(this.checkInterval);
                this.checkInterval = null;
            }

            this.gainNode.gain.linearRampToValueAtTime(
                0,
                this.context.currentTime + 0.1
            );

            setTimeout(() => {
                this.gainNode.disconnect();
                this.gainNode = this.context.createGain();
                this.gainNode.connect(this.context.destination);
            }, 200);
        }

        async resume() {
            if (this.context.state === "suspended") {
                await this.context.resume();
            }
            this.isStreamComplete = false;
            this.scheduledTime = this.context.currentTime + this.initialBufferTime;
            this.gainNode.gain.setValueAtTime(1, this.context.currentTime);
        }

        complete() {
            this.isStreamComplete = true;
            this.onComplete();
        }
    }

    // =============================================================================
    // UI STYLES - ENHANCED WITH VIDEO CONTROLS
    // =============================================================================


    // =============================================================================
    // UI COMPONENTS - ENHANCED WITH VIDEO SUPPORT
    // =============================================================================

