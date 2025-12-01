'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Building,
  Calendar,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

/**
 * KeyFindings - 3-5 bullet points summarizing the assessment
 *
 * Simple, scannable findings that tell users what matters most.
 * Color-coded for quick understanding.
 */
export function KeyFindings({
  safetyResult,
  userInput,
  className
}) {
  const t = useTranslations('Results');

  // Generate findings based on the safety result
  const generateFindings = () => {
    const findings = [];
    const score = parseFloat(safetyResult?.overallScore || 0);

    // 1. Structural System Finding
    const structuralScore = parseFloat(safetyResult?.structuralIntegrity || 0);
    findings.push({
      icon: Building,
      text: t('structuralSystem', { system: userInput?.structuralSystem || t('standardConstruction') }),
      type: structuralScore >= 70 ? 'positive' : structuralScore >= 50 ? 'warning' : 'negative',
      detail: structuralScore >= 70
        ? t('goodStructuralIntegrity')
        : t('mayNeedReinforcement')
    });

    // 2. Building Age Finding
    const yearBuilt = parseInt(userInput?.yearOfConstruction) || 0;
    const age = yearBuilt > 0 ? new Date().getFullYear() - yearBuilt : null;
    if (age !== null) {
      findings.push({
        icon: Calendar,
        text: t('builtInYear', { year: yearBuilt, age: age }),
        type: age <= 20 ? 'positive' : age <= 40 ? 'warning' : 'negative',
        detail: age <= 20
          ? t('modernConstructionStandards')
          : age <= 40
            ? t('mayNeedSeismicUpdates')
            : t('olderConstruction')
      });
    }

    // 3. Stories Finding
    const stories = parseInt(userInput?.numberOfStories) || 0;
    if (stories > 0) {
      findings.push({
        icon: Layers,
        text: t('storiesBuilding', { count: stories }),
        type: stories <= 3 ? 'positive' : stories <= 6 ? 'neutral' : 'warning',
        detail: stories <= 3
          ? t('lowerHeightReducesRisk')
          : stories <= 6
            ? t('mediumRiseBuilding')
            : t('higherBuildingsNeedStronger')
      });
    }

    // 4. Earthquake Impact Finding
    const impact = safetyResult?.earthquakeImpact || t('unknown');
    findings.push({
      icon: AlertTriangle,
      text: t('earthquakeImpact', { impact: impact }),
      type: impact === 'Low' ? 'positive' : impact === 'Moderate' ? 'warning' : 'negative',
      detail: impact === 'Low'
        ? t('minimalExpectedDamage')
        : impact === 'Moderate'
          ? t('someDamagePossible')
          : t('higherVulnerability')
    });

    // 5. Irregularity Finding (if applicable)
    const hasIrregularity = userInput?.planIrregularity === 'Irregular' ||
                           userInput?.verticalIrregularity === 'Irregular';
    if (hasIrregularity) {
      findings.push({
        icon: Info,
        text: t('structuralIrregularitiesDetected'),
        type: 'warning',
        detail: t('irregularShapesMayConcentrate')
      });
    } else if (userInput?.planIrregularity || userInput?.verticalIrregularity) {
      findings.push({
        icon: CheckCircle2,
        text: t('regularStructuralGeometry'),
        type: 'positive',
        detail: t('evenDistributionOfForces')
      });
    }

    return findings.slice(0, 5); // Max 5 findings
  };

  const findings = generateFindings();

  const getTypeStyles = (type) => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-500',
          text: 'text-green-900 dark:text-green-200',
          detail: 'text-green-600 dark:text-green-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-500',
          text: 'text-yellow-900 dark:text-yellow-200',
          detail: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'negative':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-500',
          text: 'text-red-900 dark:text-red-200',
          detail: 'text-red-600 dark:text-red-400'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          icon: 'text-gray-500',
          text: 'text-gray-900 dark:text-gray-200',
          detail: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
        {t('keyFindings')}
      </h3>

      {findings.map((finding, index) => {
        const styles = getTypeStyles(finding.type);
        const Icon = finding.icon;

        return (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              styles.bg,
              styles.border
            )}
          >
            <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", styles.icon)} />
            <div>
              <p className={cn("font-medium text-sm", styles.text)}>
                {finding.text}
              </p>
              <p className={cn("text-xs mt-0.5", styles.detail)}>
                {finding.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KeyFindings;
