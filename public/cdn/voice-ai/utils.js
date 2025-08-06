/**
 * Utility helpers and basic EventEmitter used by the voice assistant bundle.
 * Extracted from voice-assistant-bundle.js for modular use.
 */

export const Utils = {
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

export class EventEmitter {
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
