// File location: src/voice-assistant-bundle.js
/**
 * Enhanced Voice Assistant Bundle - Complete Single File with Video & Screen Sharing
 * Works with any website - just include this script and call VoiceAssistant.init()
 * Based on Next.js project with WebSocket backend and Gemini integration
 */

(function (window) {
    'use strict';

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    const Utils = {
        // Convert base64 to ArrayBuffer for audio processing
        base64ToArrayBuffer(base64) {
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        },

        // Convert ArrayBuffer to base64
        arrayBufferToBase64(buffer) {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        },

        // Create audio context with user interaction handling
        async audioContext(options = {}) {
            const didInteract = new Promise((resolve) => {
                const handleInteraction = () => {
                    document.removeEventListener('pointerdown', handleInteraction);
                    document.removeEventListener('keydown', handleInteraction);
                    document.removeEventListener('click', handleInteraction);
                    resolve();
                };
                document.addEventListener('pointerdown', handleInteraction, { once: true });
                document.addEventListener('keydown', handleInteraction, { once: true });
                document.addEventListener('click', handleInteraction, { once: true });
            });

            try {
                const a = new Audio();
                a.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
                await a.play();
                return new AudioContext(options);
            } catch (e) {
                await didInteract;
                return new AudioContext(options);
            }
        },

        // Create worklet from source code
        createWorkletFromSrc(workletName, workletSrc) {
            const script = new Blob([`registerProcessor("${workletName}", ${workletSrc})`], {
                type: "application/javascript",
            });
            return URL.createObjectURL(script);
        }
    };

    // =============================================================================
    // EVENT EMITTER
    // =============================================================================

    class EventEmitter {
        constructor() {
            this.events = {};
        }

        on(event, listener) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(listener);
            return this;
        }

        off(event, listenerToRemove) {
            if (!this.events[event]) return this;
            this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
            return this;
        }

        emit(event, ...args) {
            if (!this.events[event]) return false;
            this.events[event].forEach(listener => listener.apply(this, args));
            return true;
        }
    }

    // =============================================================================
    // AUDIO WORKLETS (Inline source code)
    // =============================================================================

    const AudioWorklets = {
        // Audio recording worklet for capturing microphone input
        AudioRecordingWorklet: `
        class AudioRecordingWorklet extends AudioWorkletProcessor {
            buffer = new Int16Array(2048);
            bufferWriteIndex = 0;

            constructor() {
                super();
                this.hasAudio = false;
            }

            process(inputs) {
                if (inputs[0].length) {
                    const channel0 = inputs[0][0];
                    this.processChunk(channel0);
                }
                return true;
            }

            sendAndClearBuffer() {
                this.port.postMessage({
                    event: "chunk",
                    data: {
                        int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer,
                    },
                });
                this.bufferWriteIndex = 0;
            }

            processChunk(float32Array) {
                const l = float32Array.length;

                for (let i = 0; i < l; i++) {
                    const int16Value = float32Array[i] * 32768;
                    this.buffer[this.bufferWriteIndex++] = int16Value;
                    if (this.bufferWriteIndex >= this.buffer.length) {
                        this.sendAndClearBuffer();
                    }
                }

                if (this.bufferWriteIndex >= this.buffer.length) {
                    this.sendAndClearBuffer();
                }
            }
        }
    `,
        // Volume meter worklet for audio visualization
        VolMeterWorklet: `
        class VolMeterWorklet extends AudioWorkletProcessor {
            volume
            updateIntervalInMS
            nextUpdateFrame

            constructor() {
                super()
                this.volume = 0
                this.updateIntervalInMS = 25
                this.nextUpdateFrame = this.updateIntervalInMS
                this.port.onmessage = event => {
                    if (event.data.updateIntervalInMS) {
                        this.updateIntervalInMS = event.data.updateIntervalInMS
                    }
                }
            }

            get intervalInFrames() {
                return (this.updateIntervalInMS / 1000) * sampleRate
            }

            process(inputs) {
                const input = inputs[0]

                if (input.length > 0) {
                    const samples = input[0]
                    let sum = 0
                    let rms = 0

                    for (let i = 0; i < samples.length; ++i) {
                        sum += samples[i] * samples[i]
                    }

                    rms = Math.sqrt(sum / samples.length)
                    this.volume = Math.max(rms, this.volume * 0.7)

                    this.nextUpdateFrame -= samples.length
                    if (this.nextUpdateFrame < 0) {
                        this.nextUpdateFrame += this.intervalInFrames
                        this.port.postMessage({ volume: this.volume })
                    }
                }

                return true
            }
        }
    `
    };

    // =============================================================================
    // WEBCAM CLASS
    // =============================================================================

    class Webcam extends EventEmitter {
        constructor() {
            super();
            this.stream = null;
            this.isStreaming = false;
        }

        async start() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                this.stream = mediaStream;
                this.isStreaming = true;

                // Listen for stream end
                this.stream.getTracks().forEach((track) => {
                    track.addEventListener('ended', () => {
                        this.stop();
                    });
                });

                this.emit('started', mediaStream);
                return mediaStream;
            } catch (error) {
                console.error('Failed to start webcam:', error);
                this.emit('error', error);
                throw error;
            }
        }

        stop() {
            if (this.stream) {
                this.stream.getTracks().forEach((track) => track.stop());
                this.stream = null;
                this.isStreaming = false;
                this.emit('stopped');
            }
        }
    }

    // =============================================================================
    // SCREEN CAPTURE CLASS
    // =============================================================================

    class ScreenCapture extends EventEmitter {
        constructor() {
            super();
            this.stream = null;
            this.isStreaming = false;
        }

        async start() {
            try {
                const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                });
                this.stream = mediaStream;
                this.isStreaming = true;

                // Listen for stream end
                this.stream.getTracks().forEach((track) => {
                    track.addEventListener('ended', () => {
                        this.stop();
                    });
                });

                this.emit('started', mediaStream);
                return mediaStream;
            } catch (error) {
                console.error('Failed to start screen capture:', error);
                this.emit('error', error);
                throw error;
            }
        }

        stop() {
            if (this.stream) {
                this.stream.getTracks().forEach((track) => track.stop());
                this.stream = null;
                this.isStreaming = false;
                this.emit('stopped');
            }
        }
    }

    // =============================================================================
    // VIDEO STREAMER CLASS
    // =============================================================================

    class VideoStreamer {
        constructor(client) {
            this.client = client;
            this.canvas = null;
            this.context = null;
            this.video = null;
            this.isStreaming = false;
            this.frameInterval = null;
            this.frameRate = 0.5; // 0.5 FPS to reduce bandwidth
        }

        start(videoStream) {
            if (!videoStream || this.isStreaming) return;

            // Create hidden video element
            this.video = document.createElement('video');
            this.video.style.display = 'none';
            this.video.autoplay = true;
            this.video.playsInline = true;
            this.video.srcObject = videoStream;
            document.body.appendChild(this.video);

            // Create hidden canvas for frame processing
            this.canvas = document.createElement('canvas');
            this.canvas.style.display = 'none';
            this.context = this.canvas.getContext('2d');
            document.body.appendChild(this.canvas);

            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth * 0.25; // Scale down for performance
                this.canvas.height = this.video.videoHeight * 0.25;
                this.startFrameCapture();
            };

            this.isStreaming = true;
        }

        startFrameCapture() {
            if (!this.isStreaming || !this.video || !this.canvas || !this.context) return;

            const captureFrame = () => {
                if (!this.isStreaming) return;

                try {
                    if (this.canvas.width > 0 && this.canvas.height > 0) {
                        this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                        const base64 = this.canvas.toDataURL('image/jpeg', 0.7);
                        const data = base64.slice(base64.indexOf(',') + 1);

                        // Send frame to client
                        this.client.sendRealtimeInput([{
                            mimeType: 'image/jpeg',
                            data
                        }]);
                    }
                } catch (error) {
                    console.error('Error capturing video frame:', error);
                }

                // Schedule next frame
                if (this.isStreaming) {
                    this.frameInterval = setTimeout(captureFrame, 1000 / this.frameRate);
                }
            };

            captureFrame();
        }

        stop() {
            this.isStreaming = false;

            if (this.frameInterval) {
                clearTimeout(this.frameInterval);
                this.frameInterval = null;
            }

            if (this.video) {
                this.video.remove();
                this.video = null;
            }

            if (this.canvas) {
                this.canvas.remove();
                this.canvas = null;
                this.context = null;
            }
        }
    }

    // =============================================================================
    // PAGE ACCESS & MONITORING CLASS
    // =============================================================================

    class PageAccessor extends EventEmitter {
        constructor() {
            super();
            this.isMonitoring = false;
            this.observers = [];
            this.lastInteraction = null;
            this.pageData = {};
            this.interactionLog = [];
            this.maxLogEntries = 50;
        }

        start() {
            if (this.isMonitoring) return;

            this.isMonitoring = true;
            this.capturePageContext();
            this.setupDOMObserver();
            this.setupInteractionTracking();
            this.setupVisibilityTracking();

            // console.log('Page monitoring started');
            this.emit('started');
        }

        stop() {
            if (!this.isMonitoring) return;

            this.isMonitoring = false;
            this.observers.forEach(observer => observer.disconnect());
            this.observers = [];
            this.removeEventListeners();

            // console.log('Page monitoring stopped');
            this.emit('stopped');
        }

        // Capture comprehensive page context
        capturePageContext() {
            this.pageData = {
                // Basic page info
                url: window.location.href,
                title: document.title,
                domain: window.location.hostname,
                timestamp: new Date().toISOString(),

                // Metadata
                metadata: this.extractMetadata(),

                // Page structure
                structure: this.analyzePageStructure(),

                // Visible content
                content: this.extractVisibleContent(),

                // Forms and inputs
                forms: this.analyzeForms(),

                // Interactive elements
                buttons: this.findButtons(),
                links: this.findLinks(),

                // Media elements
                images: this.extractImages(),
                videos: this.findVideos(),

                // E-commerce specific
                products: this.detectProducts(),

                // Error states
                errors: this.findErrorElements(),

                // Current viewport
                viewport: this.getViewportInfo()
            };

            // console.log('Page context captured', this.pageData);

            this.emit('pageContextCaptured', this.pageData);
            return this.pageData;
        }

        // Extract page metadata
        extractMetadata() {
            const metadata = {};

            // Standard meta tags
            document.querySelectorAll('meta').forEach(meta => {
                const name = meta.getAttribute('name') || meta.getAttribute('property');
                const content = meta.getAttribute('content');
                if (name && content) {
                    metadata[name] = content;
                }
            });

            // OpenGraph and Twitter cards
            metadata.ogTitle = document.querySelector('meta[property="og:title"]')?.content;
            metadata.ogDescription = document.querySelector('meta[property="og:description"]')?.content;
            metadata.ogImage = document.querySelector('meta[property="og:image"]')?.content;

            return metadata;
        }

        // Analyze page structure and layout
        analyzePageStructure() {
            return {
                hasNavigation: !!document.querySelector('nav, [role="navigation"]'),
                hasHeader: !!document.querySelector('header, [role="banner"]'),
                hasFooter: !!document.querySelector('footer, [role="contentinfo"]'),
                hasMain: !!document.querySelector('main, [role="main"]'),
                hasSidebar: !!document.querySelector('aside, .sidebar'),
                headingStructure: this.getHeadingStructure(),
                landmarks: this.findLandmarks(),
                sections: document.querySelectorAll('section').length,
                articles: document.querySelectorAll('article').length
            };
        }

        getHeadingStructure() {
            const headings = [];
            document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
                if (this.isElementVisible(heading)) {
                    headings.push({
                        level: parseInt(heading.tagName.charAt(1)),
                        text: heading.textContent.trim(),
                        id: heading.id || null
                    });
                }
            });
            return headings;
        }

        findLandmarks() {
            const landmarks = [];
            document.querySelectorAll('[role]').forEach(el => {
                const role = el.getAttribute('role');
                if (['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search'].includes(role)) {
                    landmarks.push({
                        role,
                        element: el.tagName.toLowerCase(),
                        text: el.textContent.slice(0, 100).trim()
                    });
                }
            });
            return landmarks;
        }

        // Extract visible text content
        extractVisibleContent() {
            const content = {
                paragraphs: [],
                lists: [],
                tables: [],
                mainContent: '',
                totalWords: 0
            };

            // Main content paragraphs
            document.querySelectorAll('p').forEach(p => {
                if (this.isElementVisible(p) && p.textContent.trim().length > 20) {
                    content.paragraphs.push(p.textContent.trim());
                }
            });

            // Lists
            document.querySelectorAll('ul, ol').forEach(list => {
                if (this.isElementVisible(list)) {
                    const items = Array.from(list.querySelectorAll('li')).map(li => li.textContent.trim());
                    if (items.length > 0) {
                        content.lists.push({
                            type: list.tagName.toLowerCase(),
                            items: items.slice(0, 10) // Limit to 10 items
                        });
                    }
                }
            });

            // Tables
            document.querySelectorAll('table').forEach(table => {
                if (this.isElementVisible(table)) {
                    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
                    const rowCount = table.querySelectorAll('tr').length;
                    content.tables.push({ headers, rowCount });
                }
            });

            // Main content area
            const mainEl = document.querySelector('main, [role="main"], .main-content, #main');
            if (mainEl && mainEl.textContent.trim()) {
                content.mainContent = mainEl.textContent.slice(0, 500).trim();
            } else {
                const bodyText = document.body.textContent.trim();
                if (bodyText) {
                    content.mainContent = bodyText.slice(0, 500);
                }
            }

            content.totalWords = document.body.textContent.split(/\s+/).length;

            return content;
        }

        // Analyze forms and inputs
        analyzeForms() {
            const forms = [];

            document.querySelectorAll('form').forEach(form => {
                if (this.isElementVisible(form)) {
                    const formData = {
                        action: form.action || '',
                        method: form.method || 'get',
                        fields: [],
                        hasValidation: false
                    };

                    // Analyze form fields
                    form.querySelectorAll('input, select, textarea').forEach(field => {
                        const fieldInfo = {
                            type: field.type || field.tagName.toLowerCase(),
                            name: field.name || '',
                            placeholder: field.placeholder || '',
                            required: field.required,
                            value: field.type === 'password' ? '[hidden]' : field.value,
                            label: this.getFieldLabel(field),
                            hasError: field.classList.contains('error') ||
                                field.getAttribute('aria-invalid') === 'true'
                        };

                        if (fieldInfo.hasError) formData.hasValidation = true;
                        formData.fields.push(fieldInfo);
                    });

                    forms.push(formData);
                }
            });

            return forms;
        }

        getFieldLabel(field) {
            // Try multiple methods to find field label
            const id = field.id;
            if (id) {
                const label = document.querySelector(`label[for="${id}"]`);
                if (label) return label.textContent.trim();
            }

            const parentLabel = field.closest('label');
            if (parentLabel) return parentLabel.textContent.trim();

            const ariaLabel = field.getAttribute('aria-label');
            if (ariaLabel) return ariaLabel;

            return '';
        }

        // Find interactive elements
        findButtons() {
            const buttons = [];
            document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]').forEach(btn => {
                if (this.isElementVisible(btn)) {
                    buttons.push({
                        text: btn.textContent.trim() || btn.value || '',
                        type: btn.type || 'button',
                        disabled: btn.disabled,
                        classes: Array.from(btn.classList),
                        id: btn.id || null
                    });
                }
            });
            return buttons.slice(0, 20); // Limit results
        }

        findLinks() {
            const links = [];
            document.querySelectorAll('a[href]').forEach(link => {
                if (this.isElementVisible(link) && link.textContent.trim()) {
                    links.push({
                        text: link.textContent.trim(),
                        href: link.href,
                        isExternal: link.hostname !== window.location.hostname,
                        target: link.target || ''
                    });
                }
            });
            return links.slice(0, 30); // Limit results
        }

        // Extract images with context
        extractImages() {
            const images = [];
            document.querySelectorAll('img').forEach(img => {
                if (this.isElementVisible(img)) {
                    images.push({
                        src: img.src,
                        alt: img.alt || '',
                        title: img.title || '',
                        width: img.naturalWidth || img.width,
                        height: img.naturalHeight || img.height,
                        isDecorative: !img.alt && img.getAttribute('role') === 'presentation'
                    });
                }
            });
            return images.slice(0, 15); // Limit results
        }

        findVideos() {
            const videos = [];
            document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').forEach(video => {
                if (this.isElementVisible(video)) {
                    videos.push({
                        type: video.tagName.toLowerCase(),
                        src: video.src || video.getAttribute('data-src') || '',
                        title: video.title || '',
                        duration: video.duration || null,
                        isPlaying: !video.paused
                    });
                }
            });
            return videos;
        }

        // Detect e-commerce product information
        detectProducts() {
            const products = [];

            // Common product selectors
            const productSelectors = [
                '.product',
                '[data-product]',
                '.item',
                '.product-item',
                '.product-card'
            ];

            productSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(product => {
                    if (this.isElementVisible(product)) {
                        const productInfo = {
                            name: this.findProductName(product),
                            price: this.findProductPrice(product),
                            image: this.findProductImage(product),
                            description: this.findProductDescription(product),
                            rating: this.findProductRating(product),
                            availability: this.findProductAvailability(product)
                        };

                        if (productInfo.name || productInfo.price) {
                            products.push(productInfo);
                        }
                    }
                });
            });

            return products.slice(0, 10); // Limit results
        }

        findProductName(product) {
            const nameSelectors = ['h1', 'h2', 'h3', '.product-name', '.title', '.name'];
            for (const selector of nameSelectors) {
                const el = product.querySelector(selector);
                if (el && el.textContent.trim()) {
                    return el.textContent.trim();
                }
            }
            return '';
        }

        findProductPrice(product) {
            const priceSelectors = ['.price', '.cost', '[data-price]', '.amount'];
            for (const selector of priceSelectors) {
                const el = product.querySelector(selector);
                if (el && el.textContent.trim()) {
                    return el.textContent.trim();
                }
            }
            return '';
        }

        findProductImage(product) {
            const img = product.querySelector('img');
            return img ? { src: img.src, alt: img.alt } : null;
        }

        findProductDescription(product) {
            const descSelectors = ['.description', '.summary', 'p'];
            for (const selector of descSelectors) {
                const el = product.querySelector(selector);
                if (el && el.textContent.trim().length > 20) {
                    return el.textContent.trim().slice(0, 200);
                }
            }
            return '';
        }

        findProductRating(product) {
            const ratingEl = product.querySelector('.rating, .stars, [data-rating]');
            return ratingEl ? ratingEl.textContent.trim() : '';
        }

        findProductAvailability(product) {
            const stockEl = product.querySelector('.stock, .availability, .in-stock, .out-of-stock');
            return stockEl ? stockEl.textContent.trim() : '';
        }

        // Find error elements and validation states
        findErrorElements() {
            const errors = [];

            // Form validation errors
            document.querySelectorAll('.error, .invalid, [aria-invalid="true"]').forEach(el => {
                if (this.isElementVisible(el)) {
                    errors.push({
                        type: 'validation',
                        element: el.tagName.toLowerCase(),
                        message: el.textContent.trim(),
                        field: el.name || el.id || ''
                    });
                }
            });

            // Error messages
            document.querySelectorAll('.error-message, .alert-error, .notification-error').forEach(el => {
                if (this.isElementVisible(el)) {
                    errors.push({
                        type: 'message',
                        message: el.textContent.trim()
                    });
                }
            });

            return errors;
        }

        // Get current viewport and scroll information
        getViewportInfo() {
            return {
                width: window.innerWidth,
                height: window.innerHeight,
                scrollX: window.scrollX,
                scrollY: window.scrollY,
                scrollHeight: document.documentElement.scrollHeight,
                scrollPercent: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100) || 0
            };
        }

        // Setup DOM mutation observer
        setupDOMObserver() {
            const observer = new MutationObserver((mutations) => {
                let hasSignificantChange = false;

                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Check if added nodes contain significant content
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const text = node.textContent || '';
                                if (text.length > 50 || node.querySelector('img, video, form, button')) {
                                    hasSignificantChange = true;
                                }
                            }
                        });
                    }
                });

                if (hasSignificantChange) {
                    this.emit('domChanged', {
                        type: 'content_added',
                        timestamp: new Date().toISOString()
                    });

                    // Debounce page context updates
                    clearTimeout(this.updateTimeout);
                    this.updateTimeout = setTimeout(() => {
                        this.capturePageContext();
                    }, 1000);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: false
            });

            this.observers.push(observer);
        }

        // Setup interaction tracking
        setupInteractionTracking() {
            // Click tracking
            this.clickHandler = (e) => {
                const interaction = {
                    type: 'click',
                    element: e.target.tagName.toLowerCase(),
                    text: e.target.textContent?.trim().slice(0, 100) || '',
                    classes: Array.from(e.target.classList),
                    id: e.target.id || '',
                    timestamp: new Date().toISOString(),
                    coordinates: { x: e.clientX, y: e.clientY }
                };

                this.logInteraction(interaction);
                this.emit('userInteraction', interaction);
            };

            // Form input tracking
            this.inputHandler = (e) => {
                if (e.target.type === 'password') return; // Skip password fields

                const interaction = {
                    type: 'input',
                    element: e.target.tagName.toLowerCase(),
                    inputType: e.target.type || '',
                    name: e.target.name || '',
                    placeholder: e.target.placeholder || '',
                    value: e.target.value?.slice(0, 100) || '', // Limit value length
                    timestamp: new Date().toISOString()
                };

                this.logInteraction(interaction);
                this.emit('userInteraction', interaction);
            };

            // Scroll tracking (throttled)
            this.scrollHandler = this.throttle(() => {
                const interaction = {
                    type: 'scroll',
                    scrollY: window.scrollY,
                    scrollPercent: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100) || 0,
                    timestamp: new Date().toISOString()
                };

                this.emit('userInteraction', interaction);
            }, 500);

            // URL change tracking (for SPAs)
            this.urlChangeHandler = () => {
                const interaction = {
                    type: 'navigation',
                    url: window.location.href,
                    timestamp: new Date().toISOString()
                };

                this.logInteraction(interaction);
                this.emit('userInteraction', interaction);

                // Re-capture page context on navigation
                setTimeout(() => {
                    this.capturePageContext();
                }, 500);
            };

            // Add event listeners
            document.addEventListener('click', this.clickHandler, true);
            document.addEventListener('input', this.inputHandler, true);
            window.addEventListener('scroll', this.scrollHandler);
            window.addEventListener('popstate', this.urlChangeHandler);

            // Watch for pushState/replaceState (SPA navigation)
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;

            history.pushState = function (...args) {
                originalPushState.apply(this, args);
                setTimeout(() => this.urlChangeHandler(), 0);
            }.bind(this);

            history.replaceState = function (...args) {
                originalReplaceState.apply(this, args);
                setTimeout(() => this.urlChangeHandler(), 0);
            }.bind(this);
        }

        // Setup visibility change tracking
        setupVisibilityTracking() {
            this.visibilityHandler = () => {
                const interaction = {
                    type: 'visibility_change',
                    hidden: document.hidden,
                    timestamp: new Date().toISOString()
                };

                this.emit('userInteraction', interaction);
            };

            document.addEventListener('visibilitychange', this.visibilityHandler);
        }

        // Remove event listeners
        removeEventListeners() {
            if (this.clickHandler) {
                document.removeEventListener('click', this.clickHandler, true);
            }
            if (this.inputHandler) {
                document.removeEventListener('input', this.inputHandler, true);
            }
            if (this.scrollHandler) {
                window.removeEventListener('scroll', this.scrollHandler);
            }
            if (this.urlChangeHandler) {
                window.removeEventListener('popstate', this.urlChangeHandler);
            }
            if (this.visibilityHandler) {
                document.removeEventListener('visibilitychange', this.visibilityHandler);
            }
        }

        // Utility methods
        isElementVisible(element) {
            if (!element) return false;
            const style = window.getComputedStyle(element);
            return style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0' &&
                element.offsetHeight > 0;
        }

        logInteraction(interaction) {
            this.interactionLog.push(interaction);
            if (this.interactionLog.length > this.maxLogEntries) {
                this.interactionLog.shift();
            }
            this.lastInteraction = interaction;
        }

        throttle(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Public API methods
        getCurrentPageData() {
            return { ...this.pageData };
        }

        getRecentInteractions(count = 10) {
            return this.interactionLog.slice(-count);
        }

        getElementContext(selector) {
            const element = document.querySelector(selector);
            if (!element) return null;

            return {
                tag: element.tagName.toLowerCase(),
                text: element.textContent?.trim().slice(0, 200) || '',
                classes: Array.from(element.classList),
                id: element.id || '',
                visible: this.isElementVisible(element),
                attributes: Object.fromEntries(
                    Array.from(element.attributes).map(attr => [attr.name, attr.value])
                ),
                position: element.getBoundingClientRect()
            };
        }

        searchPageContent(query) {
            const results = [];
            const searchTerm = query.toLowerCase();

            // Search in page text
            document.querySelectorAll('*').forEach(el => {
                if (el.children.length === 0 && this.isElementVisible(el)) { // Text nodes only
                    const text = el.textContent.trim();
                    if (text.toLowerCase().includes(searchTerm) && text.length > 10) {
                        results.push({
                            type: 'text',
                            element: el.tagName.toLowerCase(),
                            text: text.slice(0, 200),
                            context: el.closest('section, article, div[class], nav')?.className || ''
                        });
                    }
                }
            });

            return results.slice(0, 10);
        }
    }

    // =============================================================================
    // WEBSOCKET LIVE CLIENT (Based on your websocket-live-client.ts)
    // =============================================================================

    class WebSocketLiveClient extends EventEmitter {
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

    class AudioRecorder extends EventEmitter {
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

    class AudioStreamer {
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

    class VoiceAssistantUI {
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