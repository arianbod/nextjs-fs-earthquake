'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats, AssessmentList } from '@/components/dashboard';
import { getDashboardStats } from '@/lib/actions/assessment';
import RecentEarthquakes from '@/components/alerts/RecentEarthquakes';
import AlertNotificationList from '@/components/alerts/AlertNotificationList';
import { Plus, Building2, AlertTriangle, Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const tAlerts = useTranslations('Alerts');
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const result = await getDashboardStats();
        if (result.success) {
          setStats(result.stats);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/assessment/1">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {t('newButton')}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <DashboardStats stats={stats} isLoading={isLoadingStats} />
      </div>

      {/* Main Content - Tabbed View */}
      <Tabs defaultValue="assessments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {t('title')}
          </TabsTrigger>
          <TabsTrigger value="earthquakes" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {tAlerts('recentEarthquakes')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {tAlerts('notifications')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessments">
          <AssessmentList />
        </TabsContent>

        <TabsContent value="earthquakes">
          <RecentEarthquakes hours={24} minMagnitude={3} limit={20} />
        </TabsContent>

        <TabsContent value="notifications">
          <AlertNotificationList limit={30} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
