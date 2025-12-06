'use client';

import { useTranslations } from 'next-intl';
import AlertSettings from '@/components/alerts/AlertSettings';
import RecentEarthquakes from '@/components/alerts/RecentEarthquakes';
import AlertNotificationList from '@/components/alerts/AlertNotificationList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, AlertTriangle, Bell } from 'lucide-react';

export default function AlertsPage() {
  const t = useTranslations('Alerts');

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('description')}
        </p>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t('thresholds')}
          </TabsTrigger>
          <TabsTrigger value="earthquakes" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {t('recentEarthquakes')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {t('notifications')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <AlertSettings />
        </TabsContent>

        <TabsContent value="earthquakes">
          <RecentEarthquakes hours={72} minMagnitude={2.5} limit={50} />
        </TabsContent>

        <TabsContent value="notifications">
          <AlertNotificationList limit={50} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
