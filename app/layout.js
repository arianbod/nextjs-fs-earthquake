'use client';

import React from 'react';
import Providers from './providers';
import Navbar from '@/components/navigation/Navbar';
import { Progress } from '@/components/ui/progress';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { usePathname } from 'next/navigation';
import AssessmentSteps from '@/components/AssessmentSteps';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import Head from 'next/head';
import "./globals.css";

const MainLayout = ({ children }) => {
  const pathname = usePathname();
  const isAssessmentPath = pathname.includes('/assessment/');
  const match = pathname.match(/\/assessment\/(\d+)/);
  const currentStep = match ? parseInt(match[1], 10) : 0;
  const progress = currentStep
    ? (currentStep / AssessmentSteps.length) * 100
    : 0;

  return (
    <html className="min-h-screen" lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />

        {/* Theme Color */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#3b82f6" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1e40af" />

        {/* App Info */}
        <meta name="application-name" content="Earthquake Safety" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EQ Safety" />
        <meta name="description" content="AI-powered earthquake safety assessment for buildings in Turkey" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Splash Screens for iOS */}
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-2048-2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1668-2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1536-2048.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1125-2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1242-2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-828-1792.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1242-2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-750-1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-640-1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />

        {/* SEO */}
        <meta name="keywords" content="earthquake, safety, assessment, building, Turkey, structural, seismic" />
        <meta name="author" content="Earthquake Safety Assessment" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Earthquake Safety Assessment" />
        <meta property="og:description" content="AI-powered earthquake safety assessment for buildings" />
        <meta property="og:site_name" content="Earthquake Safety" />
        <meta property="og:image" content="/icons/icon-512x512.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Earthquake Safety Assessment" />
        <meta name="twitter:description" content="AI-powered earthquake safety assessment" />
        <meta name="twitter:image" content="/icons/icon-512x512.png" />

        <title>Earthquake Safety Assessment</title>
      </head>
      <body className="min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800">
        <Providers>
          <div className="grid grid-cols-1 h-full">
            <div className="flex flex-col">
              <Navbar />

              {/* Assessment progress bar */}
              {isAssessmentPath && (
                <div className="container mx-auto px-4 py-2 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Assessment Progress</span>
                    <span className="text-sm font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2 bg-gray-200 dark:bg-gray-700"
                  />
                  <Breadcrumb currentStep={currentStep} />
                </div>
              )}

              {/* Page children */}
              <main className="flex-grow container mx-auto px-4 ">
                {children}
              </main>
            </div>
          </div>

          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
};

export default MainLayout;
