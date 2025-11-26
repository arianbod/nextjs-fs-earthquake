'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Eye, FlaskConical } from 'lucide-react';

/**
 * ExpertModeToggle - Toggle between simple and expert views
 *
 * Simple by default, expert details on demand.
 * This is the core UX principle of the redesign.
 */
export function ExpertModeToggle({
  expertMode,
  setExpertMode,
  className
}) {
  return (
    <div className={cn(
      "flex items-center justify-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-full",
      className
    )}>
      <button
        onClick={() => setExpertMode(false)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          !expertMode
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        )}
      >
        <Eye className="h-4 w-4" />
        Simple
      </button>
      <button
        onClick={() => setExpertMode(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          expertMode
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        )}
      >
        <FlaskConical className="h-4 w-4" />
        Expert
      </button>
    </div>
  );
}

export default ExpertModeToggle;
