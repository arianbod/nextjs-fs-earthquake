'use client';

import { useRecentEarthquakes } from '@/hooks/useAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Clock, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

// Magnitude color coding
function getMagnitudeColor(magnitude) {
  if (magnitude >= 6.0) return 'bg-red-600 text-white';
  if (magnitude >= 5.0) return 'bg-orange-500 text-white';
  if (magnitude >= 4.0) return 'bg-yellow-500 text-black';
  if (magnitude >= 3.0) return 'bg-green-500 text-white';
  return 'bg-gray-400 text-white';
}

function getMagnitudeLabel(magnitude) {
  if (magnitude >= 6.0) return 'Critical';
  if (magnitude >= 5.0) return 'Strong';
  if (magnitude >= 4.0) return 'Moderate';
  if (magnitude >= 3.0) return 'Light';
  return 'Minor';
}

export default function RecentEarthquakes({ hours = 24, minMagnitude = 3, limit = 10, lat, lng, radius }) {
  const t = useTranslations('Alerts');
  const locale = useLocale();
  const dateLocale = locale === 'tr' ? tr : enUS;

  const { data, isLoading, error } = useRecentEarthquakes({
    hours,
    minMagnitude,
    lat,
    lng,
    radius,
    enabled: true,
  });

  const earthquakes = data?.earthquakes?.slice(0, limit) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t('recentEarthquakes') || 'Recent Earthquakes'}
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
            <AlertTriangle className="w-5 h-5" />
            {t('recentEarthquakes') || 'Recent Earthquakes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('errorLoading') || 'Failed to load earthquake data'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t('recentEarthquakes') || 'Recent Earthquakes'}
          </span>
          <Badge variant="outline" className="font-normal">
            {t('last24Hours') || `Last ${hours}h`}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {earthquakes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('noRecentEarthquakes') || 'No significant earthquakes in the last 24 hours'}
          </p>
        ) : (
          <div className="space-y-3">
            {earthquakes.map((eq) => (
              <EarthquakeItem
                key={eq.id}
                earthquake={eq}
                t={t}
                dateLocale={dateLocale}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EarthquakeItem({ earthquake, t, dateLocale }) {
  const { magnitude, location, region, eventTime, depth, source, distanceKm } = earthquake;

  const timeAgo = formatDistanceToNow(new Date(eventTime), {
    addSuffix: true,
    locale: dateLocale,
  });

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      {/* Magnitude Badge */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getMagnitudeColor(magnitude)}`}>
        {magnitude.toFixed(1)}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium text-sm truncate">
            {location || region || t('unknownLocation') || 'Unknown location'}
          </div>
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {source}
          </Badge>
        </div>

        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
          {depth && (
            <span>
              {t('depth') || 'Depth'}: {depth.toFixed(1)} km
            </span>
          )}
          {distanceKm !== undefined && (
            <span className="flex items-center gap-1 text-primary">
              <MapPin className="w-3 h-3" />
              {Math.round(distanceKm)} km
            </span>
          )}
        </div>
      </div>

      {/* Link to source */}
      <a
        href={`https://deprem.afad.gov.tr/event-detail/${earthquake.sourceId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 p-1 hover:bg-background rounded"
        title={t('viewDetails') || 'View details'}
      >
        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
      </a>
    </div>
  );
}
