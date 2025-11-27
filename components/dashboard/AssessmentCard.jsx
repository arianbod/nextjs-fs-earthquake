'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Calendar,
  MoreVertical,
  Eye,
  Copy,
  Share2,
  Trash2,
  Play,
} from 'lucide-react';

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    variant: 'secondary',
    color: 'bg-gray-100 text-gray-700',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    variant: 'default',
    color: 'bg-blue-100 text-blue-700',
  },
  COMPLETE: {
    label: 'Complete',
    variant: 'success',
    color: 'bg-green-100 text-green-700',
  },
  ARCHIVED: {
    label: 'Archived',
    variant: 'outline',
    color: 'bg-gray-50 text-gray-500',
  },
};

const riskLevelConfig = {
  Low: { color: 'text-green-600', bg: 'bg-green-50' },
  Moderate: { color: 'text-yellow-600', bg: 'bg-yellow-50' },
  High: { color: 'text-orange-600', bg: 'bg-orange-50' },
  'Very High': { color: 'text-red-600', bg: 'bg-red-50' },
};

const gradeColors = {
  A: 'text-green-600 bg-green-50',
  B: 'text-blue-600 bg-blue-50',
  C: 'text-yellow-600 bg-yellow-50',
  D: 'text-orange-600 bg-orange-50',
  E: 'text-red-600 bg-red-50',
};

export default function AssessmentCard({
  assessment,
  onDuplicate,
  onDelete,
  onShare,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const status = statusConfig[assessment.status] || statusConfig.DRAFT;
  const address = assessment.location?.fullAddress ||
    assessment.location?.city ||
    assessment.title ||
    'Untitled Assessment';
  const score = assessment.safetyResult?.overallScore;
  const grade = assessment.safetyResult?.safetyRating;
  const riskLevel = assessment.safetyResult?.riskLevel;

  const formattedDate = new Date(assessment.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isComplete = assessment.status === 'COMPLETE';
  const isDraft = assessment.status === 'DRAFT' || assessment.status === 'IN_PROGRESS';

  const handleCopyLink = () => {
    const url = `${window.location.origin}/result/${assessment.id}`;
    navigator.clipboard.writeText(url);
    onShare?.(assessment.id, 'copied');
  };

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Main info */}
          <div className="flex-1 min-w-0">
            {/* Address */}
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <h3 className="font-medium text-sm line-clamp-2">{address}</h3>
            </div>

            {/* Meta info row */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
              <Badge className={status.color} variant="secondary">
                {status.label}
              </Badge>
            </div>

            {/* Score display for complete assessments */}
            {isComplete && score !== null && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{Math.round(score)}%</span>
                  {grade && (
                    <span className={`px-2 py-0.5 rounded text-sm font-semibold ${gradeColors[grade] || ''}`}>
                      {grade}
                    </span>
                  )}
                </div>
                {riskLevel && (
                  <span className={`text-xs px-2 py-1 rounded ${riskLevelConfig[riskLevel]?.bg || ''} ${riskLevelConfig[riskLevel]?.color || ''}`}>
                    {riskLevel} Risk
                  </span>
                )}
              </div>
            )}

            {/* Progress indicator for drafts */}
            {isDraft && (
              <div className="text-xs text-muted-foreground">
                Step {assessment.currentStep || 1} of 11
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Primary action button */}
            {isComplete ? (
              <Link href={`/result/${assessment.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </Link>
            ) : (
              <Link href={`/assessment/${assessment.currentStep || 1}?id=${assessment.id}`}>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-1" />
                  Continue
                </Button>
              </Link>
            )}

            {/* Dropdown menu */}
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isComplete && (
                  <>
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => onDuplicate?.(assessment.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDelete?.(assessment.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton
export function AssessmentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
            <div className="flex items-center gap-3 mb-3">
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
