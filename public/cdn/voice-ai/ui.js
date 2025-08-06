export class VoiceAssistantUI {
        constructor(config) {
            this.config = config;
            this.container = null;
            this.isMinimized = config.startMinimized || false;
            this.isConnected = false;
            this.isListening = false;
            this.isTalking = false;
            this.isPaused = false;
            this.volume = 0;
            this.statusText = 'Ready to start';
            this.videoPreview = null;

            // Feature flags
            this.features = {
                video: config.features?.video || false,
                screenShare: config.features?.screenShare || false,
                fileUpload: config.features?.fileUpload || false,
            };

            // Video states
            this.isWebcamActive = false;
            this.isScreenShareActive = false;

            // Callbacks
            this.onStartSession = null;
            this.onStopSession = null;
            this.onPauseSession = null;
            this.onToggleVideo = null;
            this.onToggleScreenShare = null;
            this.onFileUpload = null;
            this.onPrepareAudioContext = null;

            this.init();
        }

        init() {
            this.container = document.createElement('div');
            this.container.className = `voice-assistant-container ${this.config.theme} position-${this.config.position}`;

            this.addStyles();
            this.createUI();
            this.createVideoPreview();
            document.body.appendChild(this.container);
            this.setupAudioVisualizer();
        }

        addStyles() {
            if (!document.getElementById('voice-assistant-stylesheet')) {
                const link = document.createElement('link');
                link.id = 'voice-assistant-stylesheet';
                link.rel = 'stylesheet';
                link.href = 'voice-assistant-bundle.css';
                document.head.appendChild(link);
            }
        }

        createVideoPreview() {
            this.videoPreview = document.createElement('div');
            this.videoPreview.className = 'video-preview';
            this.videoPreview.innerHTML = `
                <video autoplay muted playsinline></video>
                <div class="video-label">Camera</div>
            `;
            document.body.appendChild(this.videoPreview);
        }

        showVideoPreview(stream, label = 'Camera') {
            if (this.videoPreview) {
                const video = this.videoPreview.querySelector('video');
                const labelEl = this.videoPreview.querySelector('.video-label');
                video.srcObject = stream;
                labelEl.textContent = label;
                this.videoPreview.classList.add('active');
            }
        }

        hideVideoPreview() {
            if (this.videoPreview) {
                const video = this.videoPreview.querySelector('video');
                video.srcObject = null;
                this.videoPreview.classList.remove('active');
            }
        }

        createUI() {
            if (this.isMinimized) {
                this.createMinimizedUI();
            } else {
                this.createFullUI();
            }
        }

        createFullUI() {
            this.container.innerHTML = `
          <div class="voice-assistant-widget">
            <div class="widget-header">
              <h3 class="widget-title">
                <div class="status-dot" id="status-dot"></div>
                AI Assistant
              </h3>
              <button class="minimize-btn" id="minimize-btn" title="Minimize">—</button>
            </div>
            
            <div class="audio-visualizer" id="audio-visualizer">
              ${Array(16).fill(0).map((_, i) => `<div class="audio-bar" data-bar="${i}"></div>`).join('')}
            </div>
            
            <div class="main-controls">
              <button class="primary-action start" id="primary-action">
                <span id="action-icon">🎤</span>
                <span id="action-text">Start Conversation</span>
              </button>
              
              <div class="secondary-controls">
                <button class="control-btn" id="pause-btn" disabled>
                  <span>⏸️</span>
                  Pause
                </button>
                <button class="control-btn danger" id="stop-btn" disabled>
                  <span>⏹️</span>
                  Stop
                </button>
              </div>
            </div>
            
            ${this.createFeatureButtons()}
            
            <div class="status-text" id="status-text">${this.statusText}</div>
          </div>
        `;
            this.setupEventListeners();
        }

        createFeatureButtons() {
            if (!this.features.video && !this.features.screenShare && !this.features.fileUpload) {
                return '';
            }

            let buttons = '';

            if (this.features.video) {
                buttons += `
            <button class="feature-btn" id="video-btn" disabled>
              <span>📹</span>
              Video
            </button>
          `;
            }

            if (this.features.screenShare) {
                buttons += `
            <button class="feature-btn" id="screen-btn" disabled>
              <span>🖥️</span>
              Screen
            </button>
          `;
            }

            if (this.features.fileUpload) {
                buttons += `
            <button class="feature-btn" id="file-btn" disabled>
              <span>📎</span>
              File
            </button>
          `;
            }

            return `<div class="features-row">${buttons}</div>`;
        }

        createMinimizedUI() {
            this.container.innerHTML = `
          <div class="voice-assistant-minimized ${this.isConnected ? 'active' : ''}" id="minimized-widget" title="AI Assistant">AI</div>
        `;
            const minimizedWidget = this.container.querySelector('#minimized-widget');
            minimizedWidget.addEventListener('click', () => {
                this.isMinimized = false;
                this.createUI();
            });
        }

        setupEventListeners() {
            const primaryAction = this.container.querySelector('#primary-action');
            const pauseBtn = this.container.querySelector('#pause-btn');
            const stopBtn = this.container.querySelector('#stop-btn');
            const minimizeBtn = this.container.querySelector('#minimize-btn');
            const videoBtn = this.container.querySelector('#video-btn');
            const screenBtn = this.container.querySelector('#screen-btn');
            const fileBtn = this.container.querySelector('#file-btn');

            primaryAction?.addEventListener('click', () => {
                // Allow host page to prepare AudioContext before we pre-warm it
                this.onPrepareAudioContext?.();

                if (!this.isConnected) {
                    this.startSession();
                }
            });

            pauseBtn?.addEventListener('click', () => {
                this.pauseSession();
            });

            stopBtn?.addEventListener('click', () => {
                this.stopSession();
            });

            minimizeBtn?.addEventListener('click', () => {
                this.isMinimized = true;
                this.createUI();
            });

            videoBtn?.addEventListener('click', () => {
                this.toggleVideo();
            });

            screenBtn?.addEventListener('click', () => {
                this.toggleScreenShare();
            });

            fileBtn?.addEventListener('click', () => {
                this.openFileUpload();
            });
        }

        setupAudioVisualizer() {
            this.visualizerInterval = setInterval(() => {
                const bars = this.container.querySelectorAll('.audio-bar');
                if (!bars.length) return;
                bars.forEach((bar, index) => {
                    if (this.isListening && this.volume > 0) {
                        const height = Math.min(24, 4 + (this.volume * 200 * (0.5 + Math.random() * 0.5)));
                        bar.style.height = `${height}px`;
                        bar.classList.add('active');
                    } else if (this.isTalking) {
                        const height = 4 + Math.random() * 20;
                        bar.style.height = `${height}px`;
                        bar.classList.add('active');
                    } else {
                        bar.style.height = '4px';
                        bar.classList.remove('active');
                    }
                });
            }, 100);
        }

        // Action methods
        startSession() {
            if (this.onStartSession) {
                this.onStartSession();
            }
        }

        pauseSession() {
            this.isPaused = !this.isPaused;
            if (this.onPauseSession) {
                this.onPauseSession(this.isPaused);
            }
            this.updateUI();
        }

        stopSession() {
            if (this.onStopSession) {
                this.onStopSession();
            }
        }

        toggleVideo() {
            this.isWebcamActive = !this.isWebcamActive;
            if (this.onToggleVideo) {
                this.onToggleVideo();
            }
            this.updateVideoButton();
        }

        toggleScreenShare() {
            this.isScreenShareActive = !this.isScreenShareActive;
            if (this.onToggleScreenShare) {
                this.onToggleScreenShare();
            }
            this.updateScreenButton();
        }

        openFileUpload() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*,audio/*,video/*,.pdf,.txt,.docx';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file && this.onFileUpload) {
                    this.onFileUpload(file);
                }
            };
            input.click();
        }

        // Update methods
        updateConnectionStatus(connected) {
            this.isConnected = connected;
            this.updateUI();
        }

        updateListeningStatus(listening) {
            this.isListening = listening;
            this.updateUI();
        }

        updateTalkingStatus(talking) {
            this.isTalking = talking;
            this.updateUI();
        }

        updateVolume(volume) {
            this.volume = volume;
        }

        updateStatus(text) {
            this.statusText = text;
            const statusEl = this.container.querySelector('#status-text');
            if (statusEl) {
                statusEl.textContent = text;
            }
        }

        updateVideoButton() {
            const videoBtn = this.container.querySelector('#video-btn');
            if (videoBtn) {
                if (this.isWebcamActive) {
                    videoBtn.classList.add('active');
                    videoBtn.innerHTML = '<span>📹</span>Stop Video';
                } else {
                    videoBtn.classList.remove('active');
                    videoBtn.innerHTML = '<span>📹</span>Video';
                }
            }
        }

        updateScreenButton() {
            const screenBtn = this.container.querySelector('#screen-btn');
            if (screenBtn) {
                if (this.isScreenShareActive) {
                    screenBtn.classList.add('active');
                    screenBtn.innerHTML = '<span>🖥️</span>Stop Share';
                } else {
                    screenBtn.classList.remove('active');
                    screenBtn.innerHTML = '<span>🖥️</span>Screen';
                }
            }
        }

        updateUI() {
            const statusDot = this.container.querySelector('#status-dot');
            const primaryAction = this.container.querySelector('#primary-action');
            const actionIcon = this.container.querySelector('#action-icon');
            const actionText = this.container.querySelector('#action-text');
            const pauseBtn = this.container.querySelector('#pause-btn');
            const stopBtn = this.container.querySelector('#stop-btn');
            const videoBtn = this.container.querySelector('#video-btn');
            const screenBtn = this.container.querySelector('#screen-btn');
            const fileBtn = this.container.querySelector('#file-btn');

            // Update status dot
            if (statusDot) {
                statusDot.className = 'status-dot';
                if (this.isConnected) {
                    if (this.isTalking) {
                        statusDot.classList.add('talking');
                    } else if (this.isListening) {
                        statusDot.classList.add('listening');
                    } else {
                        statusDot.classList.add('connected');
                    }
                }
            }

            // Update primary action
            if (primaryAction && actionIcon && actionText) {
                if (!this.isConnected) {
                    primaryAction.className = 'primary-action start';
                    actionIcon.textContent = '🎤';
                    actionText.textContent = 'Start Conversation';
                } else {
                    primaryAction.className = 'primary-action active';
                    if (this.isPaused) {
                        actionIcon.textContent = '▶️';
                        actionText.textContent = 'Resume';
                    } else if (this.isListening) {
                        actionIcon.textContent = '🔴';
                        actionText.textContent = 'Listening...';
                    } else if (this.isTalking) {
                        actionIcon.textContent = '🔊';
                        actionText.textContent = 'Speaking...';
                    } else {
                        actionIcon.textContent = '✅';
                        actionText.textContent = 'Connected';
                    }
                }
            }

            // Update control buttons
            if (pauseBtn) {
                pauseBtn.disabled = !this.isConnected;
                pauseBtn.innerHTML = this.isPaused ? '<span>▶️</span>Resume' : '<span>⏸️</span>Pause';
            }

            if (stopBtn) {
                stopBtn.disabled = !this.isConnected;
            }

            // Update feature buttons
            [videoBtn, screenBtn, fileBtn].forEach(btn => {
                if (btn) {
                    btn.disabled = !this.isConnected;
                }
            });

            // Update status text
            let status = '';
            if (!this.isConnected) {
                status = 'Ready to start conversation';
            } else if (this.isPaused) {
                status = 'Session paused';
            } else if (this.isTalking) {
                status = 'AI is speaking...';
            } else if (this.isListening) {
                status = 'Listening to your voice...';
            } else {
                status = 'Connected and ready';
            }

            // Add video status
            if (this.isWebcamActive) {
                status += ' (Video On)';
            } else if (this.isScreenShareActive) {
                status += ' (Screen Sharing)';
            }

            this.updateStatus(status);
        }

        destroy() {
            if (this.visualizerInterval) {
                clearInterval(this.visualizerInterval);
            }
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            if (this.videoPreview && this.videoPreview.parentNode) {
                this.videoPreview.parentNode.removeChild(this.videoPreview);
            }
        }
    }

    // // Add this to your VoiceAssistant bundle right after the VoiceAssistantUI class definition
    // // This creates AudioContext IMMEDIATELY on button click, preserving the user gesture

    // // iOS Safari Immediate AudioContext Creation
    // (function () {
    //     'use strict';

    //     const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    //         /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    //     if (!isIOSSafari) return;

    //     console.log('🍎 iOS Safari: Setting up immediate AudioContext creation');

    //     // Store pre-created AudioContext globally
    //     let iOSAudioContext = null;

    //     // Function to create AudioContext immediately from user gesture
    //     function createImmediateAudioContext() {
    //         if (iOSAudioContext) return iOSAudioContext;

    //         console.log('🍎 iOS Safari: Creating AudioContext IMMEDIATELY from button click');

    //         try {
    //             // Create AudioContext right now while we have user gesture
    //             iOSAudioContext = new (window.AudioContext || window.webkitAudioContext)();

    //             // The "createGain" trick from research - ensures clock starts
    //             iOSAudioContext.createGain();

    //             // Resume if suspended
    //             if (iOSAudioContext.state === 'suspended') {
    //                 iOSAudioContext.resume().then(() => {
    //                     console.log('✅ iOS Safari: AudioContext resumed successfully');
    //                 }).catch(err => {
    //                     console.error('❌ iOS Safari: AudioContext resume failed:', err);
    //                 });
    //             }

    //             console.log('✅ iOS Safari: AudioContext created immediately, state:', iOSAudioContext.state);
    //             return iOSAudioContext;

    //         } catch (error) {
    //             console.error('❌ iOS Safari: Immediate AudioContext creation failed:', error);
    //             return null;
    //         }
    //     }

    //     // Override Utils.audioContext to use pre-created context
    //     document.addEventListener('DOMContentLoaded', () => {
    //         if (typeof Utils !== 'undefined') {
    //             const originalAudioContext = Utils.audioContext;

    //             Utils.audioContext = async function (options = {}) {
    //                 if (iOSAudioContext) {
    //                     console.log('🍎 iOS Safari: Using pre-created AudioContext from Utils.audioContext');
    //                     return iOSAudioContext;
    //                 }

    //                 // Fallback to original
    //                 console.log('🍎 iOS Safari: No pre-created AudioContext, using original Utils.audioContext');
    //                 return originalAudioContext(options);
    //             };

    //             console.log('✅ iOS Safari: Utils.audioContext overridden to use pre-created context');
    //         }
    //     });

    //     // Expose the pre-warm function so the UI can trigger it
    //     window.prewarmAudioContextForIOS = createImmediateAudioContext;

    //     console.log('✅ iOS Safari: Immediate AudioContext creation system ready');
    // })();

    // =============================================================================
    // MAIN VOICE ASSISTANT CLASS - ENHANCED WITH VIDEO
    // =============================================================================

