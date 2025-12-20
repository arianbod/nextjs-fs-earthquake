'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Clock, AlertTriangle, Camera, MapPin, Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getUserAssessments } from '@/lib/actions/assessment';
import BeforePhase from '@/components/safety-hub/BeforePhase';
import DuringPhase from '@/components/safety-hub/DuringPhase';
import AfterPhase from '@/components/safety-hub/AfterPhase';

export default function SafetyHubPage() {
  const t = useTranslations('SafetyHub');
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'before';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAssessment() {
      try {
        const result = await getUserAssessments({ limit: 10 });
        if (result.success && result.assessments?.length > 0) {
          // Get latest completed assessment
          const completed = result.assessments.find(a => a.status === 'COMPLETE');
          setLatestAssessment(completed || result.assessments[0]);
        }
      } catch (error) {
        // Silently handle - user may not be logged in
        console.log('No assessments loaded (user may not be authenticated)');
      } finally {
        setIsLoading(false);
      }
    }
    loadAssessment();
  }, []);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'very high': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {t('description')}
        </p>
      </div>

      {/* Building Risk Summary */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ) : latestAssessment ? (
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{t('yourBuilding')}</span>
                  {latestAssessment.safetyResult?.riskLevel && (
                    <Badge className={getRiskColor(latestAssessment.safetyResult.riskLevel)}>
                      {latestAssessment.safetyResult.riskLevel} {t('risk')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {latestAssessment.location?.fullAddress ||
                     latestAssessment.location?.city ||
                     t('noAddress')}
                  </span>
                </div>
                {latestAssessment.safetyResult?.overallScore && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">{t('safetyScore')}: </span>
                    <span className="font-semibold">{Math.round(latestAssessment.safetyResult.overallScore)}%</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t('noAssessment')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="before" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">{t('before.tab')}</span>
            <span className="sm:hidden">{t('before.tabShort')}</span>
          </TabsTrigger>
          <TabsTrigger value="during" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">{t('during.tab')}</span>
            <span className="sm:hidden">{t('during.tabShort')}</span>
          </TabsTrigger>
          <TabsTrigger value="after" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">{t('after.tab')}</span>
            <span className="sm:hidden">{t('after.tabShort')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="before">
          <BeforePhase assessment={latestAssessment} />
        </TabsContent>

        <TabsContent value="during">
          <DuringPhase />
        </TabsContent>

        <TabsContent value="after">
          <AfterPhase assessment={latestAssessment} />
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-8 px-4">
        {t('disclaimer')}
      </p>
    </div>
  );
}
