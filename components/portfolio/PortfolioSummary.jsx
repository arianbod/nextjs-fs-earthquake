'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Shield,
  Clock,
  Target,
} from 'lucide-react';

export default function PortfolioSummary({ stats }) {
  const t = useTranslations('Portfolio');

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()?.replace(' ', '')) {
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'veryhigh': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Properties */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{t('stats.total')}</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalProperties}</p>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{t('stats.avgScore')}</span>
          </div>
          <p className={`text-2xl font-bold ${stats.averageScore ? getScoreColor(stats.averageScore) : ''}`}>
            {stats.averageScore !== null ? `${stats.averageScore}%` : '-'}
          </p>
        </CardContent>
      </Card>

      {/* Risk Distribution */}
      <Card className="col-span-2 sm:col-span-1 lg:col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{t('stats.riskBreakdown')}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {stats.byRisk.low > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                {stats.byRisk.low} {t('risk.low')}
              </Badge>
            )}
            {stats.byRisk.moderate > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                {stats.byRisk.moderate} {t('risk.moderate')}
              </Badge>
            )}
            {stats.byRisk.high > 0 && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">
                {stats.byRisk.high} {t('risk.high')}
              </Badge>
            )}
            {stats.byRisk.veryHigh > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                {stats.byRisk.veryHigh} {t('risk.veryHigh')}
              </Badge>
            )}
            {stats.totalProperties === 0 && (
              <span className="text-xs text-muted-foreground">{t('stats.noData')}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-muted-foreground">{t('stats.completed')}</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </CardContent>
      </Card>

      {/* Needs Attention */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-muted-foreground">{t('stats.needsAttention')}</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {stats.inProgress + stats.draft + stats.needsReassessment}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
