'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for handling PWA installation prompt
 *
 * Usage:
 * const { canInstall, isInstalled, promptInstall, isIOS } = usePWAInstall();
 *
 * if (canInstall) {
 *   return <button onClick={promptInstall}>Install App</button>;
 * }
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true;
      setIsInstalled(isStandalone);
    };

    // Check if iOS (needs different install instructions)
    const checkIOS = () => {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      setIsIOS(isIOSDevice);
    };

    checkInstalled();
    checkIOS();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e);
      setCanInstall(true);
      console.log('[PWA] Install prompt available');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App was installed');
      setDeferredPrompt(null);
      setCanInstall(false);
      setIsInstalled(true);

      // Track installation if analytics is available
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'pwa_installed');
      }
    };

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        setIsInstalled(true);
        setCanInstall(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  // Trigger the install prompt
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return { accepted: false, outcome: 'unavailable' };
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;

      console.log('[PWA] Install prompt outcome:', outcome);

      // Clear the deferred prompt - it can only be used once
      setDeferredPrompt(null);

      if (outcome === 'accepted') {
        setCanInstall(false);
      }

      return { accepted: outcome === 'accepted', outcome };
    } catch (error) {
      console.error('[PWA] Install prompt error:', error);
      return { accepted: false, outcome: 'error', error };
    }
  }, [deferredPrompt]);

  // Dismiss the install prompt (user chose not to install now)
  const dismissPrompt = useCallback(() => {
    setCanInstall(false);
    // Store dismissal in localStorage to not show again for a while
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  }, []);

  // Check if prompt was recently dismissed
  const wasRecentlyDismissed = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) return false;

    const dismissedTime = parseInt(dismissed, 10);
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Don't show again for 7 days after dismissal
    return daysSinceDismissed < 7;
  }, []);

  return {
    canInstall: canInstall && !wasRecentlyDismissed(),
    isInstalled,
    isIOS,
    promptInstall,
    dismissPrompt,
  };
}

export default usePWAInstall;
