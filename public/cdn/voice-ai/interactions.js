import { EventEmitter } from './utils.js';

export class Webcam extends EventEmitter {
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

export class ScreenCapture extends EventEmitter {
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

export class VideoStreamer {
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

export class PageAccessor extends EventEmitter {
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
