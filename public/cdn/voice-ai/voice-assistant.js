import { Utils } from './utils.js';
import { AudioWorklets } from './worklets.js';
import { Webcam, ScreenCapture, VideoStreamer, PageAccessor } from './interactions.js';
import { WebSocketLiveClient } from './backend.js';
import { AudioRecorder, AudioStreamer } from './audio.js';
import { VoiceAssistantUI } from './ui.js';

    class VoiceAssistant {
        constructor() {
            this.client = null;
            this.audioRecorder = null;
            this.audioStreamer = null;
            this.webcam = null;
            this.screenCapture = null;
            this.videoStreamer = null;
            this.pageAccessor = null;
            this.ui = null;
            this.config = {
                backendUrl: 'wss://aiagent.babaai.live',
                model: 'models/gemini-2.0-flash-exp',
                theme: 'theme-dark',
                position: 'bottom-right',
                startMinimized: false,
                voiceName: 'Aoede',
                assistantName: 'Scarlett',
                apiKey: null,
                silenceTimeout: 1000,
                features: {
                    video: false,
                    screenShare: false,
                    fileUpload: false,
                    pageAccess: true  // Enable by default
                },
                websiteContext: null
            };
            this.connected = false;
            this.muted = true;
            this.volume = 0;
            this.isTalking = false;
            this.sessionStartTime = null;
        }

        async init(userConfig = {}) {
            // Merge user config with defaults
            this.config = {
                ...this.config,
                ...userConfig,
                features: {
                    ...this.config.features,
                    ...userConfig.features,
                    pageAccess: userConfig.features?.pageAccess !== false // Default to true
                },
                startMinimized: userConfig.startMinimized ?? this.config.startMinimized,
                assistantName: userConfig.assistantName || this.config.assistantName
            };

            // Initialize WebSocket client
            this.client = new WebSocketLiveClient(this.config.backendUrl, this.config.apiKey);

            // Initialize audio recorder
            this.audioRecorder = new AudioRecorder(16000, this.config.silenceTimeout);

            // Initialize video/screen capture if enabled
            if (this.config.features.video) {
                this.webcam = new Webcam();
            }
            if (this.config.features.screenShare) {
                this.screenCapture = new ScreenCapture();
            }

            // Initialize page access if enabled
            if (this.config.features.pageAccess) {
                this.pageAccessor = new PageAccessor();
            }

            // Initialize video streamer
            this.videoStreamer = new VideoStreamer(this.client);

            // iOS Safari: Skip AudioContext creation during init
            const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

            if (isIOSSafari) {
                console.log('🍎 iOS Safari: Deferring AudioContext creation until user interaction');
                this.audioStreamer = null; // Will be created on button click
            } else {
                // Non-iOS: Create AudioContext normally
                try {
                    const audioContext = await Utils.audioContext({ id: 'voice-assistant-audio' });
                    this.audioStreamer = new AudioStreamer(audioContext);

                    // Add volume meter worklet
                    await this.audioStreamer.addWorklet('vumeter-out', AudioWorklets.VolMeterWorklet, (ev) => {
                        this.volume = ev.data.volume;
                        this.ui?.updateVolume(this.volume);
                    });
                } catch (error) {
                    console.error('Failed to initialize audio:', error);
                }
            }

            // Initialize UI
            this.ui = new VoiceAssistantUI(this.config);
            this.ui.onPrepareAudioContext = () => {
                this.createDeferredAudioContext();
            };

            // Setup event handlers
            this.setupEventHandlers();

            console.log('Voice Assistant initialized successfully with video and page access support');
        }

        async createDeferredAudioContext() {
            if (this.audioStreamer) {
                return; // Already created
            }

            const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

            if (!isIOSSafari) {
                return; // Only for iOS Safari
            }

            console.log('🍎 iOS Safari: Creating AudioContext from user gesture');

            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                const audioContext = new AudioContextClass({ id: 'voice-assistant-audio' });

                if (audioContext.state === 'suspended') {
                    try {
                        audioContext.resume();
                    } catch (err) {
                        console.error('Failed to resume AudioContext:', err);
                    }
                }

                this.audioStreamer = new AudioStreamer(audioContext);

                // Add volume meter worklet
                await this.audioStreamer.addWorklet('vumeter-out', AudioWorklets.VolMeterWorklet, (ev) => {
                    this.volume = ev.data.volume;
                    this.ui?.updateVolume(this.volume);
                });

                console.log('✅ iOS Safari: AudioContext created successfully');
            } catch (error) {
                console.error('❌ iOS Safari: Failed to create AudioContext:', error);
            }
        }

        setupEventHandlers() {
            // Client events
            this.client.on('open', () => {
                this.connected = true;
                this.ui?.updateConnectionStatus(true);
                console.log('Connected to voice assistant');
            });

            this.client.on('close', () => {
                this.connected = false;
                this.ui?.updateConnectionStatus(false);
                this.stopAudioRecording();
                this.stopVideoStreaming();
                console.log('Disconnected from voice assistant');
            });

            this.client.on('audio', (data) => {
                this.isTalking = true;
                this.ui?.updateTalkingStatus(true);
                this.audioStreamer?.addPCM16(new Uint8Array(data));
            });

            this.client.on('interrupted', () => {
                this.audioStreamer?.stop();
                this.isTalking = false;
                this.ui?.updateTalkingStatus(false);
                if (!this.ui?.isPaused && !this.audioRecorder?.recording) {
                    this.startAudioRecording();
                }
            });

            this.client.on('turncomplete', () => {
                this.isTalking = false;
                this.ui?.updateTalkingStatus(false);
                if (!this.ui?.isPaused && !this.audioRecorder?.recording) {
                    this.startAudioRecording();
                }
            });

            // Audio recorder events
            this.audioRecorder.on('data', (base64) => {
                if (!this.ui?.isPaused) {
                    this.client.sendRealtimeInput([
                        {
                            mimeType: 'audio/pcm;rate=16000',
                            data: base64,
                        },
                    ]);
                }
            });

            this.audioRecorder.on('volume', (volume) => {
                // This volume is from microphone input, but only update UI if listening
                if (this.muted === false) {
                    this.ui?.updateVolume(volume);
                }
            });

            this.audioRecorder.on('silence', () => {
                if (!this.ui?.isPaused) {
                    this.client.send([], true);
                }
            });

            // Audio streamer events
            if (this.audioStreamer) {
                this.audioStreamer.onComplete = () => {
                    this.isTalking = false;
                    this.ui?.updateTalkingStatus(false);
                };
            }

            // Video events
            if (this.webcam) {
                this.webcam.on('started', (stream) => {
                    this.ui?.showVideoPreview(stream, 'Camera');
                    this.videoStreamer.start(stream);
                });

                this.webcam.on('stopped', () => {
                    this.ui?.hideVideoPreview();
                    this.videoStreamer.stop();
                });
            }

            if (this.screenCapture) {
                this.screenCapture.on('started', (stream) => {
                    this.ui?.showVideoPreview(stream, 'Screen');
                    this.videoStreamer.start(stream);
                });

                this.screenCapture.on('stopped', () => {
                    this.ui?.hideVideoPreview();
                    this.videoStreamer.stop();
                });
            }

            // Page access events
            if (this.pageAccessor) {
                this.pageAccessor.on('started', () => {
                    console.log('Page monitoring started');
                });

                this.pageAccessor.on('pageContextCaptured', (pageData) => {
                    // Send page context to AI
                    if (this.connected) {
                        this.sendPageContext(pageData);
                        this.sendFullPageContext(pageData);
                    }
                });

                this.pageAccessor.on('userInteraction', (interaction) => {
                    // Send significant interactions to AI
                    if (this.connected && this.shouldReportInteraction(interaction)) {
                        this.sendInteractionUpdate(interaction);
                    }
                });

                this.pageAccessor.on('domChanged', (change) => {
                    // Notify AI of significant page changes
                    if (this.connected) {
                        this.sendPageChangeNotification(change);
                    }
                });
            }

            // UI events
            this.ui.onStartSession = () => {
                this.startSession();
            };

            this.ui.onStopSession = () => {
                this.stopSession();
            };

            this.ui.onPauseSession = (isPaused) => {
                if (isPaused) {
                    this.audioStreamer?.stop();
                } else {
                    this.audioStreamer?.resume();
                }
            };

            this.ui.onToggleVideo = () => {
                this.toggleVideo();
            };

            this.ui.onToggleScreenShare = () => {
                this.toggleScreenShare();
            };

            this.ui.onFileUpload = (file) => {
                this.handleFileUpload(file);
            };
        }

        async startSession() {
            if (this.connected || !this.client) return;


            this.sessionStartTime = Date.now();

            // Start recording immediately to capture initial audio
            await this.startAudioRecording();

            // Start page monitoring if enabled
            if (this.pageAccessor) {
                this.pageAccessor.start();
            }

            // Build system instruction with page context
            let systemInstruction = 'You are a helpful AI voice assistant. Respond naturally and conversationally.';
            systemInstruction += ` Your name is ${this.config.assistantName} and you were created by BabaAI, a Toronto-based company.`;

            // Add page context to system instruction
            if (this.pageAccessor) {
                const pageData = this.pageAccessor.getCurrentPageData();
                systemInstruction += this.buildPageContextInstruction(pageData);
            }

            if (this.config.websiteContext) {
                const context = this.config.websiteContext;
                if (context.name) {
                    systemInstruction += ` You are helping users on the website "${context.name}".`;
                }
                if (context.description) {
                    systemInstruction += ` ${context.description}`;
                }
                if (context.customInstructions) {
                    systemInstruction += ` ${context.customInstructions}`;
                }
            }

            console.log('System instruction:', systemInstruction);

            const config = {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: this.config.voiceName,
                        },
                    },
                },
                systemInstruction: {
                    parts: [
                        {
                            text: systemInstruction,
                        },
                    ],
                },
            };

            try {
                const connected = await this.client.connect(this.config.model, config);
                if (connected) {
                    // Auto-start microphone after connection
                    await this.startAudioRecording();
                    // Re-send page context now that we are connected
                    if (this.pageAccessor) {
                        const currentData = this.pageAccessor.getCurrentPageData();
                        this.sendPageContext(currentData);
                        this.sendFullPageContext(currentData);
                    }
                } else {
                    console.error('Failed to connect via client');
                }
            } catch (error) {
                console.error('Failed to connect:', error);
            }
        }

        stopSession() {
            if (!this.connected || !this.client) return;

            this.stopAudioRecording();
            this.stopVideoStreaming();

            // Stop page monitoring
            if (this.pageAccessor) {
                this.pageAccessor.stop();
            }

            this.client.disconnect();
            this.sessionStartTime = null;
        }

        // Build page context instruction for AI
        buildPageContextInstruction(pageData) {
            if (!pageData) return '';

            let instruction = `\n\nCURRENT PAGE CONTEXT:
- URL: ${pageData.url}
- Title: ${pageData.title}
- Page type: ${this.determinePageType(pageData)}`;

            if (pageData.content && pageData.content.headingStructure?.length > 0) {
                instruction += `\n- Main headings: ${pageData.content.headingStructure.slice(0, 3).map(h => h.text).join(', ')}`;
            }

            if (pageData.forms && pageData.forms.length > 0) {
                instruction += `\n- Has forms with fields: ${pageData.forms[0].fields.map(f => f.label || f.name).slice(0, 3).join(', ')}`;
            }

            if (pageData.products && pageData.products.length > 0) {
                instruction += `\n- Products visible: ${pageData.products.slice(0, 2).map(p => p.name).join(', ')}`;
            }

            if (pageData.errors && pageData.errors.length > 0) {
                instruction += `\n- Page has errors or validation issues`;
            }

            instruction += `\n- Viewport: ${pageData.viewport.width}x${pageData.viewport.height}, scrolled ${pageData.viewport.scrollPercent}%`;

            instruction += `\n\nYou can help users with anything on this page. You have access to all visible content, forms, buttons, links, and can see what users are interacting with in real-time.`;

            return instruction;
        }

        determinePageType(pageData) {
            if (pageData.products && pageData.products.length > 0) return 'e-commerce/product';
            if (pageData.forms && pageData.forms.length > 0) return 'form/application';
            if (pageData.structure.hasNavigation && pageData.structure.hasMain) return 'content/website';
            if (pageData.content.articles > 0) return 'article/blog';
            return 'general webpage';
        }

        // Send page context to AI
        sendPageContext(pageData) {
            if (!this.connected) return;

            const contextMessage = {
                text: `[PAGE_CONTEXT] User is viewing: ${pageData.title} (${pageData.url}). ${this.summarizePageContent(pageData)}`
            };

            console.log('Sending page context', contextMessage);

            this.client.send([contextMessage], false);
        }

        // Send detailed page context to AI as JSON
        sendFullPageContext(pageData) {
            if (!this.connected) return;

            try {
                const json = JSON.stringify(pageData);
                const message = { text: `[PAGE_CONTEXT_JSON] ${json}` };
                console.log('Sending full page context', pageData);
                this.client.send([message], false);
            } catch (err) {
                console.error('Failed to send full page context:', err);
            }
        }

        // Send interaction updates to AI
        sendInteractionUpdate(interaction) {
            if (!this.connected) return;

            let message = '';
            switch (interaction.type) {
                case 'click':
                    message = `[USER_ACTION] Clicked on ${interaction.element}`;
                    if (interaction.text) {
                        message += `: "${interaction.text.slice(0, 50)}"`;
                    }
                    break;
                case 'input':
                    message = `[USER_ACTION] Typing in ${interaction.inputType || interaction.element} field`;
                    if (interaction.name) {
                        message += ` (${interaction.name})`;
                    }
                    break;
                case 'navigation':
                    message = `[USER_ACTION] Navigated to new page: ${interaction.url}`;
                    break;
                case 'scroll':
                    if (interaction.scrollPercent > 80) {
                        message = `[USER_ACTION] Scrolled to bottom of page (${interaction.scrollPercent}%)`;
                    } else if (interaction.scrollPercent < 20) {
                        message = `[USER_ACTION] Scrolled to top of page`;
                    }
                    break;
            }

            if (message) {
                this.client.send([{ text: message }], false);
            }
        }

        // Send page change notifications
        sendPageChangeNotification(change) {
            if (!this.connected) return;

            const message = {
                text: `[PAGE_UPDATE] Content on page was updated - ${change.type}`
            };

            this.client.send([message], false);
        }

        // Determine if interaction should be reported to AI
        shouldReportInteraction(interaction) {
            switch (interaction.type) {
                case 'click':
                    return true; // Always report clicks
                case 'input':
                    return interaction.value && interaction.value.length > 2; // Report when user types something meaningful
                case 'navigation':
                    return true; // Always report navigation
                case 'scroll':
                    return interaction.scrollPercent % 25 === 0; // Report every 25% scroll
                default:
                    return false;
            }
        }

        // Summarize page content for AI
        summarizePageContent(pageData) {
            let summary = '';

            if (pageData.content.mainContent) {
                summary += `Main content: ${pageData.content.mainContent.slice(0, 150)}...`;
            }

            if (pageData.buttons && pageData.buttons.length > 0) {
                summary += ` Available actions: ${pageData.buttons.slice(0, 3).map(b => b.text).join(', ')}.`;
            }

            if (pageData.forms && pageData.forms.length > 0) {
                summary += ` Has form with fields: ${pageData.forms[0].fields.slice(0, 3).map(f => f.label || f.name).join(', ')}.`;
            }

            return summary;
        }

        async startAudioRecording() {
            if (!this.audioRecorder || !this.connected) return;

            // iOS Safari: Ensure AudioContext exists
            await this.createDeferredAudioContext();

            try {
                const ctx = this.audioStreamer?.context;
                await this.audioRecorder.start(ctx);
                this.muted = false;
                this.ui?.updateListeningStatus(true);
            } catch (error) {
                console.error('Failed to start audio recording:', error);
            }
        }

        stopAudioRecording() {
            if (!this.audioRecorder) return;

            this.audioRecorder.stop();
            this.muted = true;
            this.ui?.updateListeningStatus(false);
        }

        async toggleVideo() {
            if (!this.webcam || !this.connected) return;

            try {
                if (this.webcam.isStreaming) {
                    this.webcam.stop();
                    this.ui.isWebcamActive = false;
                } else {
                    // Stop screen share if active
                    if (this.screenCapture?.isStreaming) {
                        this.screenCapture.stop();
                        this.ui.isScreenShareActive = false;
                        this.ui.updateScreenButton();
                    }
                    await this.webcam.start();
                    this.ui.isWebcamActive = true;
                }
                this.ui.updateVideoButton();
            } catch (error) {
                console.error('Failed to toggle video:', error);
                this.ui.isWebcamActive = false;
                this.ui.updateVideoButton();
            }
        }

        async toggleScreenShare() {
            if (!this.screenCapture || !this.connected) return;

            try {
                if (this.screenCapture.isStreaming) {
                    this.screenCapture.stop();
                    this.ui.isScreenShareActive = false;
                } else {
                    // Stop webcam if active
                    if (this.webcam?.isStreaming) {
                        this.webcam.stop();
                        this.ui.isWebcamActive = false;
                        this.ui.updateVideoButton();
                    }
                    await this.screenCapture.start();
                    this.ui.isScreenShareActive = true;
                }
                this.ui.updateScreenButton();
            } catch (error) {
                console.error('Failed to toggle screen share:', error);
                this.ui.isScreenShareActive = false;
                this.ui.updateScreenButton();
            }
        }

        stopVideoStreaming() {
            if (this.webcam?.isStreaming) {
                this.webcam.stop();
                this.ui.isWebcamActive = false;
            }
            if (this.screenCapture?.isStreaming) {
                this.screenCapture.stop();
                this.ui.isScreenShareActive = false;
            }
            this.videoStreamer?.stop();
            this.ui?.hideVideoPreview();
        }

        handleFileUpload(file) {
            // Implement file upload functionality
            console.log('File upload:', file);
            // TODO: Convert file to base64 and send via client
        }

        destroy() {
            this.stopSession();
            this.ui?.destroy();

            // Clean up audio contexts
            if (this.audioStreamer) {
                this.audioStreamer.stop();
            }

            // Clean up video
            this.stopVideoStreaming();

            // Clean up page monitoring
            if (this.pageAccessor) {
                this.pageAccessor.stop();
            }
        }

        // Public API methods
        setConfig(newConfig) {
            this.config = {
                ...this.config,
                ...newConfig,
                features: {
                    ...this.config.features,
                    ...newConfig.features
                }
            };
        }

        getStatus() {
            return {
                connected: this.connected,
                muted: this.muted,
                volume: this.volume,
                talking: this.isTalking,
                paused: this.ui?.isPaused || false,
                hasVideo: this.webcam?.isStreaming || false,
                hasScreenShare: this.screenCapture?.isStreaming || false,
                pageMonitoring: this.pageAccessor?.isMonitoring || false,
                features: this.config.features
            };
        }

        // Page access API methods
        getPageData() {
            return this.pageAccessor?.getCurrentPageData() || null;
        }

        getRecentInteractions(count = 10) {
            return this.pageAccessor?.getRecentInteractions(count) || [];
        }

        searchPageContent(query) {
            return this.pageAccessor?.searchPageContent(query) || [];
        }

        getElementInfo(selector) {
            return this.pageAccessor?.getElementContext(selector) || null;
        }

        // Force page context update
        refreshPageContext() {
            if (this.pageAccessor) {
                return this.pageAccessor.capturePageContext();
            }
            return null;
        }
    }

    // =============================================================================
    // GLOBAL API - ENHANCED
    // =============================================================================

    // Create global VoiceAssistant object
    window.VoiceAssistant = {
        instance: null,

        init(config = {}) {
            if (this.instance) {
                console.warn('Voice Assistant already initialized. Destroying previous instance.');
                this.destroy();
            }

            this.instance = new VoiceAssistant();
            this.instance.init(config);
            return this.instance;
        },

        // Quick start - one button solution
        quickStart(config = {}) {
            const assistant = this.init(config);

            // Auto-connect and start session
            setTimeout(() => {
                assistant.startSession();
            }, 500);

            return assistant;
        },

        // Enable specific features
        enableFeatures(features) {
            if (this.instance) {
                this.instance.setConfig({ features });
                // Re-render UI if features change
                this.instance.ui.features = { ...this.instance.ui.features, ...features };
                this.instance.ui.createUI();
            }
        },

        // Set website context for better AI responses
        setWebsiteContext(context) {
            if (this.instance) {
                this.instance.setConfig({ websiteContext: context });
            }
        },

        destroy() {
            if (this.instance) {
                this.instance.destroy();
                this.instance = null;
            }
        },

        getInstance() {
            return this.instance;
        },

        // Convenience methods
        startSession() {
            return this.instance?.startSession();
        },

        stopSession() {
            return this.instance?.stopSession();
        },

        pauseSession() {
            return this.instance?.ui?.pauseSession();
        },

        // Video controls
        toggleVideo() {
            return this.instance?.toggleVideo();
        },

        toggleScreenShare() {
            return this.instance?.toggleScreenShare();
        },

        // Page access controls
        getPageData() {
            return this.instance?.getPageData();
        },

        searchPage(query) {
            return this.instance?.searchPageContent(query);
        },

        getElementInfo(selector) {
            return this.instance?.getElementInfo(selector);
        },

        getRecentActivity(count = 10) {
            return this.instance?.getRecentInteractions(count);
        },

        refreshPageContext() {
            return this.instance?.refreshPageContext();
        },

        getStatus() {
            return this.instance?.getStatus() || {
                connected: false,
                muted: true,
                paused: false,
                volume: 0,
                talking: false,
                hasVideo: false,
                hasScreenShare: false,
                pageMonitoring: false,
                features: { video: false, screenShare: false, fileUpload: false, pageAccess: false }
            };
        },

        // Advanced features
        setTheme(theme) {
            if (this.instance) {
                this.instance.setConfig({ theme });
                this.instance.ui.container.className =
                    this.instance.ui.container.className.replace(/theme-\w+/, theme);
            }
        },

        setPosition(position) {
            if (this.instance) {
                this.instance.setConfig({ position });
                this.instance.ui.container.className =
                    this.instance.ui.container.className.replace(/position-[\w-]+/, `position-${position}`);
            }
        },

        // Analytics and monitoring
        getAnalytics() {
            if (!this.instance) {
                return {
                    isActive: false,
                    sessionDuration: 0,
                    featuresUsed: [],
                    currentState: 'destroyed'
                };
            }
            const status = this.getStatus();
            return {
                isActive: status.connected,
                sessionDuration: this.instance.sessionStartTime ?
                    Date.now() - this.instance.sessionStartTime : 0,
                featuresUsed: Object.keys(status.features).filter(f => status.features[f]),
                currentState: status.talking ? 'talking' :
                    (status.connected && !status.muted) ? 'listening' :
                        status.connected ? 'connected' : 'disconnected',
                videoActive: status.hasVideo,
                screenShareActive: status.hasScreenShare,
                pageMonitoring: status.pageMonitoring,
                pageData: status.pageMonitoring ? this.getPageData() : null,
                recentInteractions: status.pageMonitoring ? this.getRecentActivity(5) : []
            };
        }
    };


    // =============================================================================
    // UTILITY METHODS FOR ADVANCED FEATURES
    // =============================================================================

    // Auto-initialization based on page content
    window.VoiceAssistant.autoInit = function (selector = '[data-voice-assistant]') {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            const config = {
                backendUrl: element.dataset.backendUrl || 'wss://aiagent.babaai.live',
                theme: element.dataset.theme || 'theme-dark',
                position: element.dataset.position || 'bottom-right',
                voiceName: element.dataset.voice || 'Aoede',
                features: {
                    video: element.dataset.video === 'true',
                    screenShare: element.dataset.screenShare === 'true',
                    fileUpload: element.dataset.fileUpload === 'true'
                }
            };

            this.init(config);
        });
    };

    // WordPress integration helper
    window.VoiceAssistant.wordpress = {
        init(config = {}) {
            // WordPress-specific defaults
            const wpConfig = {
                websiteContext: {
                    name: document.title,
                    description: document.querySelector('meta[name="description"]')?.content || '',
                    purpose: 'WordPress website assistance',
                    customInstructions: 'Help users navigate this WordPress website, find content, and answer questions about the site.'
                },
                ...config
            };

            return window.VoiceAssistant.init(wpConfig);
        }
    };

    // E-commerce integration helper
    window.VoiceAssistant.ecommerce = {
        init(config = {}) {
            const ecomConfig = {
                features: {
                    video: true,
                    fileUpload: true,
                    ...config.features
                },
                websiteContext: {
                    name: document.title,
                    purpose: 'E-commerce shopping assistance',
                    customInstructions: 'Help customers find products, answer questions about items, assist with orders, and provide shopping guidance. You can view images of products if customers share them.',
                    ...config.websiteContext
                },
                ...config
            };

            return window.VoiceAssistant.init(ecomConfig);
        }
    };

    // Educational platform helper
    window.VoiceAssistant.education = {
        init(config = {}) {
            const eduConfig = {
                features: {
                    video: true,
                    screenShare: true,
                    fileUpload: true,
                    ...config.features
                },
                websiteContext: {
                    purpose: 'Educational assistance',
                    customInstructions: 'Help students with learning, answer academic questions, assist with assignments, and provide educational guidance. You can review documents and images that students share.',
                    ...config.websiteContext
                },
                ...config
            };

            return window.VoiceAssistant.init(eduConfig);
        }
    };

    // =============================================================================
    // AUTO-INITIALIZATION
    // =============================================================================

    // Auto-initialize even if this script loads *after* DOMContentLoaded
    function __vaBootstrap() {
        if (document.querySelector('[data-voice-assistant]')) {
            window.VoiceAssistant.autoInit();
        } else {
            const currentScript = document.currentScript;
            const backendUrl = currentScript?.dataset.backendUrl || 'wss://aiagent.babaai.live';
            window.VoiceAssistant.init({ backendUrl, startMinimized: true });
        }
    }

    if (document.readyState === 'loading') {
        // Script loaded before DOM is ready – wait for the event
        document.addEventListener('DOMContentLoaded', __vaBootstrap);
    } else {
        // DOMContentLoaded has already fired – run immediately
        __vaBootstrap();
    }

    // -----------------------------------------------------------------------------
    console.log('Enhanced Voice Assistant Bundle loaded successfully');
    console.log('🎤 Features: Modern UI, Audio, Video, Screen sharing, File upload');
    console.log('🚀 Quick start: VoiceAssistant.quickStart({ backendUrl: "ws://your-server.com", features: { video: true, screenShare: true } })');

})(window);