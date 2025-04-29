'use client';

import React from 'react';
import Providers from './providers';
import Navbar from '@/components/navigation/Navbar';
import Sidebar from '@/components/sidebar/Sidebar';
import { Progress } from '@/components/ui/progress';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { usePathname } from 'next/navigation';
import AssessmentSteps from '@/components/AssessmentSteps';
import "./globals.css"
const MainLayout = ({ children }) => {
  const pathname = usePathname();
  const isAssessmentPath = pathname.includes('/assessment/');
  const match = pathname.match(/\/assessment\/(\d+)/);
  const currentStep = match ? parseInt(match[1], 10) : 0;
  const progress = currentStep
    ? (currentStep / AssessmentSteps.length) * 100
    : 0;

  return (
    <html className="min-h-screen">
      <body className="min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800">
        <Providers>
          <div className="grid grid-cols-1 lg:grid-cols-5 h-full">

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-1 sticky top-0 h-screen bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 shadow-sm z-10">
              <Sidebar currentStep={currentStep} />
            </aside>

            {/* Main content */}
            <div className="col-span-1 lg:col-span-4 flex flex-col">
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
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
};

export default MainLayout;
