'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SafetyScoreHero - Big, clear safety score display
 *
 * The main "wow" moment of results - a large, easily understood score
 * with grade letter and simple interpretation.
 */
export function SafetyScoreHero({
  score,
  isPassing,
  className
}) {
  const scoreValue = parseFloat(score?.overallScore || 0);
  const scorePercentage = parseInt(scoreValue);

  // Determine grade letter
  const getGrade = (score) => {
    if (score >= 90) return { letter: 'A', label: 'Excellent', color: 'text-green-600' };
    if (score >= 80) return { letter: 'B', label: 'Good', color: 'text-green-500' };
    if (score >= 70) return { letter: 'C', label: 'Acceptable', color: 'text-yellow-500' };
    if (score >= 60) return { letter: 'D', label: 'Needs Work', color: 'text-orange-500' };
    return { letter: 'F', label: 'At Risk', color: 'text-red-500' };
  };

  const grade = getGrade(scoreValue);

  // Simple interpretation based on score
  const getInterpretation = (score) => {
    if (score >= 80) return 'Your building can withstand most earthquake scenarios safely.';
    if (score >= 70) return 'Your building has adequate earthquake protection with minor concerns.';
    if (score >= 60) return 'Your building may need improvements for optimal earthquake safety.';
    return 'Your building has significant vulnerabilities that should be addressed.';
  };

  return (
    <div className={cn(
      "text-center py-8 px-6",
      className
    )}>
      {/* Score Circle */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-gray-200 dark:text-gray-700"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r="44"
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className={cn(
              isPassing ? "text-green-500" : "text-yellow-500",
              "transition-all duration-1000 ease-out"
            )}
            strokeWidth="6"
            strokeDasharray={`${scorePercentage * 2.76} 276.5`}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="44"
            cx="50"
            cy="50"
          />
        </svg>

        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "text-5xl font-bold",
            isPassing ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
          )}>
            {scorePercentage}
          </span>
          <span className="text-lg text-gray-500 dark:text-gray-400">/100</span>
        </div>
      </div>

      {/* Grade Badge */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full font-bold text-2xl",
          isPassing
            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
        )}>
          {grade.letter}
        </div>
        <div className="text-left">
          <p className={cn("font-semibold text-lg", grade.color)}>
            {grade.label}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isPassing ? 'Building is safe' : 'Needs attention'}
          </p>
        </div>
      </div>

      {/* Simple Interpretation */}
      <div className={cn(
        "max-w-md mx-auto p-4 rounded-lg",
        isPassing
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
      )}>
        <div className="flex items-start gap-3">
          {isPassing ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          )}
          <p className={cn(
            "text-sm",
            isPassing ? "text-green-700 dark:text-green-300" : "text-yellow-700 dark:text-yellow-300"
          )}>
            {getInterpretation(scoreValue)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SafetyScoreHero;
