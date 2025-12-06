'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar, Building2 } from 'lucide-react';

const riskLevelConfig = {
  LOW: { color: 'bg-green-500', text: 'text-green-700' },
  MODERATE: { color: 'bg-yellow-500', text: 'text-yellow-700' },
  HIGH: { color: 'bg-orange-500', text: 'text-orange-700' },
  'VERY HIGH': { color: 'bg-red-500', text: 'text-red-700' },
};

const gradeColors = {
  A: 'bg-green-100 text-green-800 border-green-200',
  B: 'bg-lime-100 text-lime-800 border-lime-200',
  C: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  D: 'bg-orange-100 text-orange-800 border-orange-200',
  E: 'bg-red-100 text-red-800 border-red-200',
};

export default function AssessmentSelector({ assessments, onSelect, onClose }) {
  const t = useTranslations('Compare');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssessments = assessments.filter((assessment) => {
    const query = searchQuery.toLowerCase();
    const city = assessment.location?.city?.toLowerCase() || '';
    const address = assessment.location?.fullAddress?.toLowerCase() || '';
    const title = assessment.title?.toLowerCase() || '';
    return city.includes(query) || address.includes(query) || title.includes(query);
  });

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {t('selectAssessment')}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Assessment List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? t('noSearchResults') : t('noAssessmentsAvailable')}
            </div>
          ) : (
            filteredAssessments.map((assessment) => {
              const riskConfig = riskLevelConfig[assessment.safetyResult?.riskLevel] || riskLevelConfig.MODERATE;
              const grade = assessment.safetyResult?.safetyRating || 'C';
              const gradeClass = gradeColors[grade] || gradeColors.C;

              return (
                <button
                  key={assessment.id}
                  onClick={() => onSelect(assessment.id)}
                  className="w-full p-4 rounded-lg border hover:border-primary hover:bg-accent/50 transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Location */}
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">
                          {assessment.location?.city || assessment.title || t('untitled')}
                        </span>
                      </div>

                      {/* Address */}
                      {assessment.location?.fullAddress && (
                        <p className="text-sm text-muted-foreground truncate ml-6 mb-2">
                          {assessment.location.fullAddress}
                        </p>
                      )}

                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground ml-6">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(assessment.completedAt || assessment.updatedAt)}
                        </span>
                        {assessment.buildingInfo?.numberOfFloors && (
                          <span>{assessment.buildingInfo.numberOfFloors} {t('floors')}</span>
                        )}
                      </div>
                    </div>

                    {/* Score & Grade */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {assessment.safetyResult?.overallScore && (
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {Math.round(assessment.safetyResult.overallScore)}
                          </div>
                          <div className="text-xs text-muted-foreground">{t('score')}</div>
                        </div>
                      )}
                      <Badge className={`text-lg px-3 py-1 ${gradeClass}`}>
                        {grade}
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
