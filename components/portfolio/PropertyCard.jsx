'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  MoreVertical,
  Eye,
  Pencil,
  FolderPlus,
  Trash2,
  Star,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function PropertyCard({
  assessment,
  selected,
  onSelect,
  onAddToGroup,
  onEditNickname,
  viewMode = 'grid',
}) {
  const t = useTranslations('Portfolio');

  const getRiskBadgeClass = (level) => {
    switch (level?.toLowerCase()?.replace(' ', '')) {
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'veryhigh': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETE':
        return <Badge variant="outline" className="text-xs bg-green-50 text-green-700">{t('status.COMPLETE')}</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">{t('status.IN_PROGRESS')}</Badge>;
      case 'DRAFT':
        return <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">{t('status.DRAFT')}</Badge>;
      default:
        return null;
    }
  };

  // Get image to display
  const image = assessment.images?.[0];
  const imageUrl = image?.thumbnailData || image?.imageData;

  // Check if needs reassessment (completed more than 1 year ago)
  const needsReassessment = assessment.status === 'COMPLETE' &&
    assessment.completedAt &&
    new Date(assessment.completedAt) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  if (viewMode === 'list') {
    return (
      <Card className={`transition-all ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-3 flex items-center gap-3">
          {/* Selection Checkbox */}
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(assessment.id)}
            className="shrink-0"
          />

          {/* Image */}
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={assessment.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{assessment.displayName}</span>
              {assessment.priority > 0 && (
                <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">
                {assessment.location?.city || t('noLocation')}
              </span>
            </div>
          </div>

          {/* Groups */}
          <div className="hidden sm:flex gap-1 shrink-0">
            {assessment.groups?.slice(0, 2).map(({ group }) => (
              <Badge
                key={group.id}
                variant="outline"
                className="text-xs"
                style={{ borderColor: group.color, color: group.color }}
              >
                {group.name}
              </Badge>
            ))}
            {assessment.groups?.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{assessment.groups.length - 2}
              </Badge>
            )}
          </div>

          {/* Status & Risk */}
          <div className="flex items-center gap-2 shrink-0">
            {getStatusBadge(assessment.status)}
            {assessment.safetyResult?.riskLevel && (
              <Badge className={`text-xs ${getRiskBadgeClass(assessment.safetyResult.riskLevel)}`}>
                {assessment.safetyResult.overallScore
                  ? `${Math.round(assessment.safetyResult.overallScore)}%`
                  : assessment.safetyResult.riskLevel}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/result/${assessment.id}`} className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {t('actions.view')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditNickname(assessment)}>
                <Pencil className="w-4 h-4 mr-2" />
                {t('actions.rename')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddToGroup(assessment)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                {t('actions.addToGroup')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className={`transition-all hover:shadow-md ${selected ? 'ring-2 ring-primary' : ''}`}>
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={assessment.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(assessment.id)}
            className="bg-white/80 backdrop-blur"
          />
        </div>

        {/* Priority Star */}
        {assessment.priority > 0 && (
          <div className="absolute top-2 right-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 drop-shadow" />
          </div>
        )}

        {/* Reassessment Warning */}
        {needsReassessment && (
          <div className="absolute bottom-2 left-2">
            <Badge className="text-xs bg-amber-100 text-amber-700 gap-1">
              <Clock className="w-3 h-3" />
              {t('needsReassessment')}
            </Badge>
          </div>
        )}

        {/* Risk Badge */}
        {assessment.safetyResult?.riskLevel && (
          <div className="absolute bottom-2 right-2">
            <Badge className={`text-xs ${getRiskBadgeClass(assessment.safetyResult.riskLevel)}`}>
              {assessment.safetyResult.overallScore
                ? `${Math.round(assessment.safetyResult.overallScore)}%`
                : assessment.safetyResult.riskLevel}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium truncate">{assessment.displayName}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {assessment.location?.district || assessment.location?.city || t('noLocation')}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/result/${assessment.id}`} className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {t('actions.view')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditNickname(assessment)}>
                <Pencil className="w-4 h-4 mr-2" />
                {t('actions.rename')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddToGroup(assessment)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                {t('actions.addToGroup')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Groups */}
        {assessment.groups?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {assessment.groups.slice(0, 2).map(({ group }) => (
              <Badge
                key={group.id}
                variant="outline"
                className="text-xs"
                style={{ borderColor: group.color, color: group.color }}
              >
                {group.name}
              </Badge>
            ))}
            {assessment.groups.length > 2 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{assessment.groups.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Status */}
        <div className="mt-2">
          {getStatusBadge(assessment.status)}
        </div>
      </CardContent>
    </Card>
  );
}
