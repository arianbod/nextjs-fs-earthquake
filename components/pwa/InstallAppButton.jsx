'use client';

import React, { useState } from 'react';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Install App Button Component
 *
 * Shows an install button when PWA installation is available.
 * For iOS devices, shows instructions for manual installation.
 *
 * Variants:
 * - "button": Standard button
 * - "banner": Full-width banner at top/bottom
 * - "floating": Floating action button
 */
export function InstallAppButton({ variant = 'button', className = '' }) {
  const { canInstall, isInstalled, isIOS, promptInstall, dismissPrompt } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Don't render if already installed
  if (isInstalled) {
    return null;
  }

  // Handle install click
  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    setIsInstalling(true);
    try {
      await promptInstall();
    } finally {
      setIsInstalling(false);
    }
  };

  // For iOS, always show button (with instructions modal)
  // For others, only show if canInstall is true
  if (!canInstall && !isIOS) {
    return null;
  }

  // Standard button variant
  if (variant === 'button') {
    return (
      <>
        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          className={`gap-2 ${className}`}
          variant="outline"
        >
          <Download className="h-4 w-4" />
          {isInstalling ? 'Installing...' : 'Install App'}
        </Button>

        <IOSInstructionsDialog
          open={showIOSInstructions}
          onClose={() => setShowIOSInstructions(false)}
        />
      </>
    );
  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <>
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg ${className}`}
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Install QuakeWise</p>
                <p className="text-sm text-blue-100">
                  Get instant access and offline support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Install
              </Button>
              <button
                onClick={dismissPrompt}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <IOSInstructionsDialog
          open={showIOSInstructions}
          onClose={() => setShowIOSInstructions(false)}
        />
      </>
    );
  }

  // Floating button variant
  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className={`fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-105 ${className}`}
          aria-label="Install App"
        >
          <Download className="h-6 w-6" />
        </button>

        <IOSInstructionsDialog
          open={showIOSInstructions}
          onClose={() => setShowIOSInstructions(false)}
        />
      </>
    );
  }

  return null;
}

/**
 * iOS Installation Instructions Dialog
 */
function IOSInstructionsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Install QuakeWise on iOS
          </DialogTitle>
          <DialogDescription>
            Follow these steps to add QuakeWise to your home screen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold">
              1
            </div>
            <div>
              <p className="font-medium">Tap the Share button</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Look for the <Share className="h-4 w-4 inline" /> icon at the bottom of Safari
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold">
              2
            </div>
            <div>
              <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Look for the <Plus className="h-4 w-4 inline" /> icon in the menu
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold">
              3
            </div>
            <div>
              <p className="font-medium">Tap "Add"</p>
              <p className="text-sm text-muted-foreground">
                QuakeWise will appear on your home screen
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InstallAppButton;
