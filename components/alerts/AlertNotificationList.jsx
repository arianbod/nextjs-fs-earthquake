'use client';

import { useAlertNotifications } from '@/hooks/useAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, BellOff, Check, CheckCheck, MapPin, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

// Priority colors
function getPriorityColor(priority) {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'HIGH':
      return 'bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'NORMAL':
      return 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

function getPriorityBadge(priority, t) {
  switch (priority) {
    case 'CRITICAL':
      return <Badge variant="destructive">{t('critical') || 'Critical'}</Badge>;
    case 'HIGH':
      return <Badge className="bg-orange-500">{t('high') || 'High'}</Badge>;
    case 'NORMAL':
      return <Badge variant="secondary">{t('normal') || 'Normal'}</Badge>;
    default:
      return <Badge variant="outline">{t('low') || 'Low'}</Badge>;
  }
}

export default function AlertNotificationList({ limit = 20 }) {
  const t = useTranslations('Alerts');
  const locale = useLocale();
  const dateLocale = locale === 'tr' ? tr : enUS;

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    isMarkingRead,
  } = useAlertNotifications({ limit });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('notifications') || 'Notifications'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('notifications') || 'Notifications'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('errorLoadingNotifications') || 'Failed to load notifications'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('notifications') || 'Notifications'}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={isMarkingRead}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              {t('markAllRead') || 'Mark all read'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <BellOff className="w-8 h-8 mb-2" />
            <p className="text-sm">{t('noNotifications') || 'No notifications'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                t={t}
                dateLocale={dateLocale}
                onMarkRead={() => markAsRead([notification.id])}
                isMarkingRead={isMarkingRead}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NotificationItem({ notification, t, dateLocale, onMarkRead, isMarkingRead }) {
  const {
    title,
    body,
    priority,
    distanceKm,
    status,
    createdAt,
    earthquake,
  } = notification;

  const isRead = status === 'READ';
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: dateLocale,
  });

  return (
    <div
      className={`p-3 rounded-lg border-l-4 transition-colors ${getPriorityColor(priority)} ${
        isRead ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getPriorityBadge(priority, t)}
            {earthquake && (
              <span className="text-sm font-mono font-bold">
                M{earthquake.magnitude.toFixed(1)}
              </span>
            )}
          </div>
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs mt-1 line-clamp-2">{body}</p>
          <div className="flex items-center gap-3 mt-2 text-xs opacity-75">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
            {distanceKm !== undefined && distanceKm !== null && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {Math.round(distanceKm)} km
              </span>
            )}
          </div>
        </div>
        {!isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkRead}
            disabled={isMarkingRead}
            title={t('markAsRead') || 'Mark as read'}
          >
            <Check className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
