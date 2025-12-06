'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Building2, Layers, AlertTriangle } from 'lucide-react';
import ComparisonChart from './ComparisonChart';

const riskLevelConfig = {
  LOW: { color: 'bg-green-500', text: 'text-green-700', label: 'Low Risk' },
  MODERATE: { color: 'bg-yellow-500', text: 'text-yellow-700', label: 'Moderate Risk' },
  HIGH: { color: 'bg-orange-500', text: 'text-orange-700', label: 'High Risk' },
  'VERY HIGH': { color: 'bg-red-500', text: 'text-red-700', label: 'Very High Risk' },
};

const gradeColors = {
  A: 'bg-green-100 text-green-800 border-green-200',
  B: 'bg-lime-100 text-lime-800 border-lime-200',
  C: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  D: 'bg-orange-100 text-orange-800 border-orange-200',
  E: 'bg-red-100 text-red-800 border-red-200',
};

export default function ComparisonView({ assessments }) {
  const t = useTranslations('Compare');

  if (!assessments || assessments.length < 2) {
    return null;
  }

  // Prepare chart data
  const chartData = assessments.map((a, index) => ({
    name: a.location?.city || a.title || `Building ${index + 1}`,
    overall: a.safetyResult?.overallScore || 0,
    structural: a.safetyResult?.structuralScore || 0,
    foundation: a.safetyResult?.foundationScore || 0,
    material: a.safetyResult?.materialScore || 0,
    irregularity: a.safetyResult?.irregularityScore || 0,
    site: a.safetyResult?.siteScore || 0,
  }));

  const scoreCategories = [
    { key: 'overall', label: t('overallScore'), icon: Building2 },
    { key: 'structural', label: t('structuralScore'), icon: Layers },
    { key: 'foundation', label: t('foundationScore'), icon: Building2 },
    { key: 'material', label: t('materialScore'), icon: Building2 },
    { key: 'irregularity', label: t('irregularityScore'), icon: AlertTriangle },
    { key: 'site', label: t('siteScore'), icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('visualComparison')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="radar" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="radar">{t('radarChart')}</TabsTrigger>
              <TabsTrigger value="bar">{t('barChart')}</TabsTrigger>
            </TabsList>
            <TabsContent value="radar">
              <ComparisonChart type="radar" data={chartData} />
            </TabsContent>
            <TabsContent value="bar">
              <ComparisonChart type="bar" data={chartData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Side-by-Side Cards */}
      <div className={`grid gap-4 ${assessments.length === 2 ? 'md:grid-cols-2' : assessments.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
        {assessments.map((assessment, index) => {
          const riskConfig = riskLevelConfig[assessment.safetyResult?.riskLevel] || riskLevelConfig.MODERATE;
          const grade = assessment.safetyResult?.safetyRating || 'C';
          const gradeClass = gradeColors[grade] || gradeColors.C;

          return (
            <Card key={assessment.id} className="relative overflow-hidden">
              {/* Color indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${riskConfig.color}`} />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {assessment.location?.city || assessment.title || t('untitled')}
                    </CardTitle>
                    {assessment.location?.fullAddress && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {assessment.location.fullAddress}
                      </p>
                    )}
                  </div>
                  <Badge className={`ml-2 text-lg px-2 ${gradeClass}`}>
                    {grade}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Overall Score */}
                <div className="text-center py-3 bg-muted/50 rounded-lg">
                  <div className="text-4xl font-bold">
                    {Math.round(assessment.safetyResult?.overallScore || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('overallScore')}</div>
                  <Badge variant="outline" className={`mt-2 ${riskConfig.text}`}>
                    {riskConfig.label}
                  </Badge>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-2">
                  {scoreCategories.slice(1).map((category) => {
                    const score = assessment.safetyResult?.[`${category.key}Score`] || 0;
                    const Icon = category.icon;
                    return (
                      <div key={category.key} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Icon className="w-3 h-3" />
                          {category.label}
                        </span>
                        <span className="font-medium">{Math.round(score)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Building Info */}
                <div className="pt-3 border-t space-y-1 text-xs text-muted-foreground">
                  {assessment.buildingInfo?.numberOfFloors && (
                    <div className="flex justify-between">
                      <span>{t('floors')}</span>
                      <span className="font-medium text-foreground">{assessment.buildingInfo.numberOfFloors}</span>
                    </div>
                  )}
                  {assessment.buildingInfo?.buildingAge && (
                    <div className="flex justify-between">
                      <span>{t('buildingAge')}</span>
                      <span className="font-medium text-foreground">{assessment.buildingInfo.buildingAge} {t('years')}</span>
                    </div>
                  )}
                  {assessment.buildingInfo?.structuralSystem && (
                    <div className="flex justify-between">
                      <span>{t('structure')}</span>
                      <span className="font-medium text-foreground truncate ml-2">{assessment.buildingInfo.structuralSystem}</span>
                    </div>
                  )}
                  {assessment.location?.earthquakeZone && (
                    <div className="flex justify-between">
                      <span>{t('seismicZone')}</span>
                      <span className="font-medium text-foreground">{t('zone')} {assessment.location.earthquakeZone}</span>
                    </div>
                  )}
                </div>

                {/* Retrofit Cost */}
                {assessment.safetyResult?.estimatedRetrofitCost && (
                  <div className="pt-3 border-t">
                    <div className="text-xs text-muted-foreground mb-1">{t('estimatedRetrofitCost')}</div>
                    <div className="font-semibold text-sm">
                      ${assessment.safetyResult.estimatedRetrofitCost.toLocaleString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('comparisonSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Best Overall */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <span className="font-medium text-green-700 dark:text-green-400">
                {t('highestScore')}
              </span>
              <span className="font-bold">
                {assessments.reduce((best, a) =>
                  (a.safetyResult?.overallScore || 0) > (best.safetyResult?.overallScore || 0) ? a : best
                ).location?.city || t('untitled')}
              </span>
            </div>

            {/* Needs Most Attention */}
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <span className="font-medium text-orange-700 dark:text-orange-400">
                {t('lowestScore')}
              </span>
              <span className="font-bold">
                {assessments.reduce((worst, a) =>
                  (a.safetyResult?.overallScore || 100) < (worst.safetyResult?.overallScore || 100) ? a : worst
                ).location?.city || t('untitled')}
              </span>
            </div>

            {/* Score Range */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">{t('scoreRange')}</span>
              <span className="font-bold">
                {Math.round(Math.min(...assessments.map(a => a.safetyResult?.overallScore || 0)))} - {Math.round(Math.max(...assessments.map(a => a.safetyResult?.overallScore || 0)))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
