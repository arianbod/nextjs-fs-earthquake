import { EventEmitter } from './utils.js';

    // =============================================================================
    // WEBSOCKET LIVE CLIENT (Based on your websocket-live-client.ts)
    // =============================================================================

export class WebSocketLiveClient extends EventEmitter {
        constructor(backendUrl, apiKey = null) {
            super();
            this.backendUrl = backendUrl;
            this.apiKey = apiKey;
            this.ws = null;
            this._status = 'disconnected';
            this._model = null;
            this.config = null;
            this.reconnectAttempts = 0;
            this.maxReconnectAttempts = 5;
            this.reconnectDelay = 1000;

            this.send = this.send.bind(this);
        }

        get status() {
            return this._status;
        }

        get model() {
            return this._model;
        }

        getConfig() {
            return { ...this.config };
        }

        log(type, message) {
            const log = {
                date: new Date(),
                type,
                message,
            };
            this.emit('log', log);
        }

        setupWebSocket() {
            try {
                // Add API key to WebSocket URL if provided
                let wsUrl = this.backendUrl;
                if (this.apiKey) {
                    const separator = wsUrl.includes('?') ? '&' : '?';
                    wsUrl += `${separator}apiKey=${encodeURIComponent(this.apiKey)}`;
                }

                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log('Connected to backend WebSocket');
                    this._status = 'connected';
                    this.reconnectAttempts = 0;
                    this.emit('open');
                    this.log('client.open', 'Connected to backend');
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleBackendMessage(data);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                this.ws.onclose = (event) => {
                    console.log('WebSocket connection closed:', event.code, event.reason);
                    this._status = 'disconnected';
                    this.emit('close', event);
                    this.log(
                        'client.close',
                        `Disconnected: ${event.reason || 'Connection closed'}`
                    );

                    // Attempt to reconnect if not a clean close
                    if (
                        event.code !== 1000 &&
                        this.reconnectAttempts < this.maxReconnectAttempts
                    ) {
                        setTimeout(() => {
                            this.reconnectAttempts++;
                            console.log(
                                `Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
                            );
                            this.setupWebSocket();
                        }, this.reconnectDelay * this.reconnectAttempts);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.emit('error', error);
                    this.log('client.error', 'WebSocket connection error');
                };
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error);
                this._status = 'disconnected';
            }
        }

        handleBackendMessage(data) {
            switch (data.type) {
                case 'connected':
                    this.emit('open');
                    break;
                case 'disconnected':
                    this._status = 'disconnected';
                    this.emit('close', new CloseEvent('close'));
                    break;
                case 'setupComplete':
                    this.emit('setupcomplete');
                    break;
                case 'content':
                    this.emit('content', data.data);
                    break;
                case 'audio':
                    const audioBuffer = Utils.base64ToArrayBuffer(data.data);
                    this.emit('audio', audioBuffer);
                    break;
                case 'toolCall':
                    this.emit('toolcall', data.data);
                    break;
                case 'toolCallCancellation':
                    this.emit('toolcallcancellation', data.data);
                    break;
                case 'interrupted':
                    this.emit('interrupted');
                    break;
                case 'turnComplete':
                    this.emit('turncomplete');
                    break;
                case 'error':
                    this.emit('error', new ErrorEvent('error', { message: data.message }));
                    break;
                case 'log':
                    this.emit('log', data.data);
                    break;
                default:
                    console.log('Unknown message type from backend:', data.type);
            }
        }

        sendToBackend(message) {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(message));
            } else {
                console.warn('WebSocket not connected, message not sent:', message);
            }
        }

        async connect(model, config) {
            if (this._status === 'connected' || this._status === 'connecting') {
                return false;
            }

            this._status = 'connecting';
            this.config = config;
            this._model = model;

            this.setupWebSocket();

            return new Promise((resolve) => {
                const onOpen = () => {
                    this.sendToBackend({
                        type: 'connect',
                        model,
                        config,
                    });
                    this.off('open', onOpen);
                    resolve(true);
                };

                const onError = () => {
                    this.off('error', onError);
                    this.off('open', onOpen);
                    resolve(false);
                };

                this.on('open', onOpen);
                this.on('error', onError);
            });
        }

        disconnect() {
            if (this._status === 'disconnected') {
                return false;
            }

            this.sendToBackend({
                type: 'disconnect',
            });

            if (this.ws) {
                this.ws.close(1000, 'Client disconnect');
                this.ws = null;
            }

            this._status = 'disconnected';
            this.log('client.close', 'Disconnected');
            return true;
        }

        sendRealtimeInput(chunks) {
            if (this._status !== 'connected') return;

            this.sendToBackend({
                type: 'sendRealtimeInput',
                data: chunks,
            });

            let hasAudio = false;
            let hasVideo = false;
            for (const ch of chunks) {
                if (ch.mimeType.includes('audio')) {
                    hasAudio = true;
                }
                if (ch.mimeType.includes('image')) {
                    hasVideo = true;
                }
                if (hasAudio && hasVideo) {
                    break;
                }
            }
            const message =
                hasAudio && hasVideo
                    ? 'audio + video'
                    : hasAudio
                        ? 'audio'
                        : hasVideo
                            ? 'video'
                            : 'unknown';
            this.log('client.realtimeInput', message);
        }

        sendToolResponse(toolResponse) {
            if (this._status !== 'connected') return;

            if (
                toolResponse.functionResponses &&
                toolResponse.functionResponses.length
            ) {
                this.sendToBackend({
                    type: 'sendToolResponse',
                    data: toolResponse,
                });
                this.log('client.toolResponse', toolResponse);
            }
        }

        send(parts, turnComplete = true) {
            if (this._status !== 'connected') return;

            this.sendToBackend({
                type: 'send',
                data: { turns: parts, turnComplete },
            });

            this.log('client.send', {
                turns: Array.isArray(parts) ? parts : [parts],
                turnComplete,
            });
        }
    }

    // =============================================================================
    // AUDIO RECORDER
    // =============================================================================

