'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, BarChart3, Share2, Download } from 'lucide-react';
import AssessmentSelector from '@/components/compare/AssessmentSelector';
import ComparisonView from '@/components/compare/ComparisonView';
import { getUserAssessments, getAssessment } from '@/lib/actions/assessment';

const MAX_COMPARISONS = 4;

export default function ComparePage() {
  const t = useTranslations('Compare');
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Load initial IDs from URL
  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const ids = idsParam.split(',').slice(0, MAX_COMPARISONS);
      setSelectedIds(ids);
    }
  }, [searchParams]);

  // Load user's completed assessments for selection
  useEffect(() => {
    async function loadAssessments() {
      setIsLoading(true);
      try {
        const result = await getUserAssessments({ status: 'COMPLETE', limit: 50 });
        if (result.success) {
          setAssessments(result.assessments || []);
        }
      } catch (error) {
        console.error('Error loading assessments:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssessments();
  }, []);

  // Load full comparison data when IDs change
  useEffect(() => {
    async function loadComparisonData() {
      if (selectedIds.length === 0) {
        setComparisonData([]);
        return;
      }

      setLoadingComparison(true);
      try {
        const results = await Promise.all(
          selectedIds.map(id => getAssessment(id, false))
        );
        const validAssessments = results
          .filter(r => r.success && r.assessment)
          .map(r => r.assessment);
        setComparisonData(validAssessments);
      } catch (error) {
        console.error('Error loading comparison data:', error);
      } finally {
        setLoadingComparison(false);
      }
    }
    loadComparisonData();
  }, [selectedIds]);

  // Update URL when selections change
  useEffect(() => {
    if (selectedIds.length > 0) {
      const url = new URL(window.location.href);
      url.searchParams.set('ids', selectedIds.join(','));
      window.history.replaceState({}, '', url.toString());
    }
  }, [selectedIds]);

  const handleAddAssessment = (id) => {
    if (!selectedIds.includes(id) && selectedIds.length < MAX_COMPARISONS) {
      setSelectedIds([...selectedIds, id]);
    }
    setShowSelector(false);
  };

  const handleRemoveAssessment = (id) => {
    setSelectedIds(selectedIds.filter(i => i !== id));
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const canAddMore = selectedIds.length < MAX_COMPARISONS;
  const availableAssessments = assessments.filter(a => !selectedIds.includes(a.id));

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('subtitle')}
          </p>
        </div>

        {selectedIds.length > 1 && (
          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" />
            {t('shareComparison')}
          </Button>
        )}
      </div>

      {/* Selection Bar */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>{t('selectedBuildings')}</span>
            <Badge variant="outline">
              {selectedIds.length} / {MAX_COMPARISONS}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {/* Selected assessment pills */}
            {comparisonData.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm"
              >
                <span className="font-medium truncate max-w-[200px]">
                  {assessment.location?.city || assessment.title || t('untitled')}
                </span>
                {assessment.safetyResult?.overallScore && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(assessment.safetyResult.overallScore)}%
                  </Badge>
                )}
                <button
                  onClick={() => handleRemoveAssessment(assessment.id)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add button */}
            {canAddMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSelector(true)}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('addBuilding')}
              </Button>
            )}
          </div>

          {selectedIds.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('noSelection')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Assessment Selector Modal */}
      {showSelector && (
        <AssessmentSelector
          assessments={availableAssessments}
          onSelect={handleAddAssessment}
          onClose={() => setShowSelector(false)}
        />
      )}

      {/* Comparison View */}
      {loadingComparison ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : selectedIds.length >= 2 ? (
        <ComparisonView assessments={comparisonData} />
      ) : selectedIds.length === 1 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">{t('needMoreBuildings')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('addOneMore')}
            </p>
            <Button onClick={() => setShowSelector(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('addBuilding')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">{t('getStarted')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('selectToCompare')}
            </p>
            {assessments.length > 0 ? (
              <Button onClick={() => setShowSelector(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                {t('selectBuildings')}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('noAssessments')}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
