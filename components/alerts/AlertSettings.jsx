'use client';

import { useState, useEffect } from 'react';
import { useAlertPreferences, usePushSubscription } from '@/hooks/useAlerts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Mail, Clock, MapPin, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function AlertSettings() {
  const t = useTranslations('Alerts');
  const { preferences, isLoading, updatePreferences, isUpdating } = useAlertPreferences();
  const { isSupported, isSubscribed, subscribe, unsubscribe, isLoading: pushLoading } = usePushSubscription();

  const [localPrefs, setLocalPrefs] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  useEffect(() => {
    if (localPrefs && preferences) {
      const changed = JSON.stringify(localPrefs) !== JSON.stringify(preferences);
      setHasChanges(changed);
    }
  }, [localPrefs, preferences]);

  const handleSave = async () => {
    try {
      await updatePreferences(localPrefs);
      toast.success(t('settingsSaved') || 'Settings saved');
    } catch (error) {
      toast.error(t('saveFailed') || 'Failed to save settings');
    }
  };

  const handleEnablePush = async () => {
    try {
      await subscribe();
      toast.success(t('pushEnabled') || 'Push notifications enabled');
    } catch (error) {
      toast.error(error.message || t('pushFailed') || 'Failed to enable push notifications');
    }
  };

  const handleDisablePush = async () => {
    try {
      await unsubscribe();
      toast.success(t('pushDisabled') || 'Push notifications disabled');
    } catch (error) {
      toast.error(error.message || 'Failed to disable push notifications');
    }
  };

  if (isLoading || !localPrefs) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('title') || 'Earthquake Alerts'}
          </CardTitle>
          <CardDescription>
            {t('description') || 'Receive real-time notifications when earthquakes occur near your assessed locations'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="alerts-enabled" className="font-medium">
              {t('enableAlerts') || 'Enable Earthquake Alerts'}
            </Label>
            <Switch
              id="alerts-enabled"
              checked={localPrefs.alertsEnabled}
              onCheckedChange={(checked) =>
                setLocalPrefs((prev) => ({ ...prev, alertsEnabled: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('channels') || 'Notification Channels'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">{t('pushNotifications') || 'Push Notifications'}</Label>
              <p className="text-sm text-muted-foreground">
                {t('pushDescription') || 'Instant alerts to your browser/device'}
              </p>
            </div>
            {!isSupported ? (
              <span className="text-sm text-muted-foreground">Not supported</span>
            ) : isSubscribed ? (
              <Button size="sm" variant="outline" onClick={handleDisablePush} disabled={pushLoading}>
                {t('disable') || 'Disable'}
              </Button>
            ) : (
              <Button size="sm" onClick={handleEnablePush} disabled={pushLoading}>
                {pushLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (t('enable') || 'Enable')}
              </Button>
            )}
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">{t('emailNotifications') || 'Email Notifications'}</Label>
              <p className="text-sm text-muted-foreground">
                {t('emailDescription') || 'For critical events only (M5.0+)'}
              </p>
            </div>
            <Switch
              checked={localPrefs.emailEnabled}
              onCheckedChange={(checked) =>
                setLocalPrefs((prev) => ({ ...prev, emailEnabled: checked }))
              }
            />
          </div>

          {localPrefs.emailEnabled && (
            <div className="pl-4 border-l-2 border-muted">
              <Label htmlFor="email">{t('emailAddress') || 'Email Address'}</Label>
              <Input
                id="email"
                type="email"
                value={localPrefs.emailAddress || ''}
                onChange={(e) =>
                  setLocalPrefs((prev) => ({ ...prev, emailAddress: e.target.value }))
                }
                placeholder="your@email.com"
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t('thresholds') || 'Alert Thresholds'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <Label>{t('minMagnitude') || 'Minimum Magnitude'}</Label>
              <span className="font-mono">M{localPrefs.minMagnitude?.toFixed(1)}</span>
            </div>
            <Slider
              value={[localPrefs.minMagnitude || 4.0]}
              onValueChange={([value]) =>
                setLocalPrefs((prev) => ({ ...prev, minMagnitude: value }))
              }
              min={2.0}
              max={7.0}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('minMagnitudeDescription') || `Only alert for earthquakes M${localPrefs.minMagnitude?.toFixed(1)} or higher`}
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>{t('maxDistance') || 'Maximum Distance'}</Label>
              <span className="font-mono">{localPrefs.maxDistanceKm} km</span>
            </div>
            <Slider
              value={[localPrefs.maxDistanceKm || 100]}
              onValueChange={([value]) =>
                setLocalPrefs((prev) => ({ ...prev, maxDistanceKm: value }))
              }
              min={10}
              max={300}
              step={10}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('maxDistanceDescription') || 'Only alert for earthquakes within this distance of your locations'}
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>{t('criticalMagnitude') || 'Critical Alert Threshold'}</Label>
              <span className="font-mono text-red-600">M{localPrefs.criticalMagnitude?.toFixed(1)}+</span>
            </div>
            <Slider
              value={[localPrefs.criticalMagnitude || 5.0]}
              onValueChange={([value]) =>
                setLocalPrefs((prev) => ({ ...prev, criticalMagnitude: value }))
              }
              min={4.0}
              max={7.0}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('criticalDescription') || 'Alerts above this magnitude always notify, ignoring quiet hours'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t('quietHours') || 'Quiet Hours'}
          </CardTitle>
          <CardDescription>
            {t('quietHoursDescription') || 'Pause non-critical alerts during these hours'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t('enableQuietHours') || 'Enable Quiet Hours'}</Label>
            <Switch
              checked={localPrefs.quietHoursEnabled}
              onCheckedChange={(checked) =>
                setLocalPrefs((prev) => ({ ...prev, quietHoursEnabled: checked }))
              }
            />
          </div>

          {localPrefs.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
              <div>
                <Label htmlFor="quiet-start">{t('startTime') || 'Start Time'}</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={localPrefs.quietHoursStart || '22:00'}
                  onChange={(e) =>
                    setLocalPrefs((prev) => ({ ...prev, quietHoursStart: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="quiet-end">{t('endTime') || 'End Time'}</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={localPrefs.quietHoursEnd || '07:00'}
                  onChange={(e) =>
                    setLocalPrefs((prev) => ({ ...prev, quietHoursEnd: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {t('quietHoursNote') || 'Critical alerts (M5.0+) will always be delivered'}
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isUpdating || !hasChanges}
        className="w-full"
      >
        {isUpdating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('saving') || 'Saving...'}
          </>
        ) : (
          t('savePreferences') || 'Save Preferences'
        )}
      </Button>
    </div>
  );
}
