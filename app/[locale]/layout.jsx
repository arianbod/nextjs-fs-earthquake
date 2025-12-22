'use client';

import React from 'react';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import Providers from '../providers';
import Navbar from '@/components/navigation/Navbar';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import "../globals.css"
import '../voice-assistant-bundle.css'

// We'll load messages on the server and pass them to the client
// For now, we import them statically (will be optimized later)
import enMessages from '@/messages/en.json';
import trMessages from '@/messages/tr.json';

const messages = {
  en: enMessages,
  tr: trMessages,
};

const LocaleLayout = ({ children, params }) => {
  const pathname = usePathname();

  // Extract locale from params or pathname
  const localeMatch = pathname.match(/^\/(en|tr)/);
  const locale = localeMatch ? localeMatch[1] : 'en';

  return (
    <html lang={locale} className="min-h-screen">
      <head>
        <Script
          src='/cdn/voice-assistant-bundle.js'
          strategy='beforeInteractive'
          id='voice-assistant-script'
        />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
        <Script
          strategy='afterInteractive'
          id='voice-assistant-init'
          dangerouslySetInnerHTML={{
            __html: `
              const websiteInfo = \`
# QuakeWise AI Assistant - Earthquake Safety Assessment Platform

## Platform Overview
QuakeWise is an AI-powered earthquake safety assessment platform that helps building owners and occupants evaluate seismic risks. We use advanced AI image analysis and FEMA-based methodologies to provide comprehensive safety evaluations.

## Key Features
- AI-powered photo analysis for automatic building information extraction
- FEMA-based rapid screening procedures
- 95% accuracy rate validated against professional assessments
- Instant results in just 5 minutes
- Direct connection to structural engineers when needed

## Assessment Process (Simplified)
Our assessment now includes AI-powered analysis that automatically extracts building information from photos:

1. **Location Detection**: Pinpoint your building's exact location for seismic zone data
2. **AI Photo Analysis**: Upload building photos for automatic information extraction
3. **Building Information**: Review and confirm AI-extracted data
4. **Structural System**: Verify detected structural type
5. **Irregularity Assessment**: Check for unusual building features
6. **Plan Definition**: Map your building's layout
7. **Modification History**: Document any building changes
8. **Specific Conditions**: Note any visible issues
9. **Additional Loads**: Account for extra weight
10. **Neighbor Buildings**: Assess adjacent structures

## AI Analysis Capabilities
Our AI can automatically detect:
- Number of stories
- Structural system type
- Building materials
- Approximate dimensions
- Material condition
- Structural irregularities
- Construction period estimates

## Important Notes
- AI-extracted information can be reviewed and modified
- Upload multiple photos from different angles for better accuracy
- The more photos provided, the more accurate the analysis
- All extracted data is presented for user confirmation

## Safety Recommendations
Based on your assessment results, we provide:
- Safety score interpretation (0-100%)
- Risk level categorization
- Specific improvement recommendations
- Professional consultation referrals when needed
              \`;

              // Ensure VoiceAssistant is available before initializing
              if (typeof VoiceAssistant !== 'undefined') {
                VoiceAssistant.init({
                  backendUrl: 'wss://aiagent.babaai.live',
                  assistantName: 'QuakeWise Assistant',
                  websiteContext: {
                    name: 'QuakeWise',
                    description: 'AI-Powered Earthquake Safety Assessment Platform',
                    customInstructions: websiteInfo,
                  },
                });
              } else {
                console.warn('VoiceAssistant is not loaded yet - retrying in 1 second');
                setTimeout(() => {
                  if (typeof VoiceAssistant !== 'undefined') {
                    VoiceAssistant.init({
                      backendUrl: 'wss://aiagent.babaai.live',
                      assistantName: 'QuakeWise Assistant',
                      websiteContext: {
                        name: 'QuakeWise',
                        description: 'AI-Powered Earthquake Safety Assessment Platform',
                        customInstructions: websiteInfo,
                      },
                    });
                  }
                }, 1000);
              }
            `,
          }}
        />
        <NextIntlClientProvider locale={locale} messages={messages[locale]}>
          <Providers>
            <div className="grid grid-cols-1 h-screen">
              <div className="flex flex-col h-full">
                <Navbar />

                {/* Page children */}
                <main className="flex-grow overflow-y-auto container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
                  {children}
                </main>
              </div>
            </div>
            <Toaster position="top-right" richColors />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
