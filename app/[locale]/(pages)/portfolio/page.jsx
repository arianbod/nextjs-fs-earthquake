'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import {
  Building2,
  Plus,
  FolderPlus,
  Search,
  Briefcase,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

import {
  PortfolioSummary,
  PropertyFilters,
  PropertyCard,
  BulkActionsBar,
  CreateGroupModal,
  AddToGroupModal,
} from '@/components/portfolio';

import {
  getPortfolioSummary,
  getGroups,
  createGroup,
  addToGroup,
  removeFromGroup,
  bulkAddToGroup,
  updateAssessmentNickname,
} from '@/lib/actions/portfolio';

export default function PortfolioPage() {
  const t = useTranslations('Portfolio');

  // Notification state (replaces toast)
  const [notification, setNotification] = useState(null);

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3000);
  };

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [groups, setGroups] = useState([]);

  // UI state
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    status: 'all',
    city: 'all',
    groupId: 'all',
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modal state
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [addToGroupOpen, setAddToGroupOpen] = useState(false);
  const [selectedForGroup, setSelectedForGroup] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [portfolioResult, groupsResult] = await Promise.all([
        getPortfolioSummary(),
        getGroups(),
      ]);

      if (portfolioResult.success) {
        setStats(portfolioResult.stats);
        setAssessments(portfolioResult.assessments);
      }

      if (groupsResult.success) {
        setGroups(groupsResult.groups);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
      showNotification(t('errors.loadFailed'), true);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get unique cities
  const cities = useMemo(() => {
    const citySet = new Set();
    assessments.forEach(a => {
      if (a.location?.city) citySet.add(a.location.city);
    });
    return Array.from(citySet).sort();
  }, [assessments]);

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          a.displayName?.toLowerCase().includes(query) ||
          a.location?.city?.toLowerCase().includes(query) ||
          a.location?.district?.toLowerCase().includes(query) ||
          a.location?.fullAddress?.toLowerCase().includes(query) ||
          a.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Risk level filter
      if (filters.riskLevel !== 'all') {
        const risk = a.safetyResult?.riskLevel?.toLowerCase()?.replace(' ', '');
        if (risk !== filters.riskLevel) return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        if (a.status !== filters.status) return false;
      }

      // City filter
      if (filters.city !== 'all') {
        if (a.location?.city !== filters.city) return false;
      }

      // Group filter
      if (filters.groupId !== 'all') {
        const inGroup = a.groups?.some(g => g.group.id === filters.groupId);
        if (!inGroup) return false;
      }

      return true;
    });
  }, [assessments, searchQuery, filters]);

  // Selection handlers
  const handleSelect = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAssessments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssessments.map(a => a.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Group handlers
  const handleCreateGroup = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await createGroup(data);
      if (result.success) {
        setGroups(prev => [...prev, result.group]);
        setCreateGroupOpen(false);
        showNotification(t('group.created'));
      } else {
        showNotification(result.error, true);
      }
    } catch (error) {
      showNotification(t('errors.createFailed'), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToGroup = (assessment) => {
    if (assessment) {
      setSelectedForGroup([assessment.id]);
    } else {
      setSelectedForGroup([...selectedIds]);
    }
    setAddToGroupOpen(true);
  };

  const handleAddToGroupSubmit = async ({ toAdd, toRemove }) => {
    setIsSubmitting(true);
    try {
      // Add to new groups
      for (const groupId of toAdd) {
        if (selectedForGroup.length === 1) {
          await addToGroup(selectedForGroup[0], groupId);
        } else {
          await bulkAddToGroup(selectedForGroup, groupId);
        }
      }

      // Remove from groups
      for (const groupId of toRemove) {
        for (const assessmentId of selectedForGroup) {
          await removeFromGroup(assessmentId, groupId);
        }
      }

      await loadData();
      setAddToGroupOpen(false);
      setSelectedForGroup([]);
      showNotification(t('addToGroup.success'));
    } catch (error) {
      showNotification(t('errors.updateFailed'), true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNickname = async (assessment) => {
    const newNickname = prompt(t('actions.renamePrompt'), assessment.nickname || assessment.title || '');
    if (newNickname === null) return;

    try {
      const result = await updateAssessmentNickname(assessment.id, newNickname);
      if (result.success) {
        await loadData();
        showNotification(t('actions.renamed'));
      } else {
        showNotification(result.error, true);
      }
    } catch (error) {
      showNotification(t('errors.updateFailed'), true);
    }
  };

  // Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      showNotification(t('bulk.exportStarted'));
      // In production, this would call a PDF generation API
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification(t('bulk.exportComplete'));
    } catch (error) {
      showNotification(t('errors.exportFailed'), true);
    } finally {
      setIsExporting(false);
    }
  };

  // Set priority handler
  const handleSetPriority = async () => {
    showNotification(t('bulk.priorityUpdated'));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <Alert className={notification.isError ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
            {notification.isError ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            <AlertDescription className={notification.isError ? 'text-red-700' : 'text-green-700'}>
              {notification.message}
            </AlertDescription>
            <button
              onClick={() => setNotification(null)}
              className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </Alert>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateGroupOpen(true)}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            {t('group.createButton')}
          </Button>
          <Link href="/assessment/1">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t('addProperty')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {assessments.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('empty.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('empty.description')}</p>
            <Link href="/assessment/1">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('empty.addFirst')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          {stats && <PortfolioSummary stats={stats} />}

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <PropertyFilters
            filters={filters}
            onFilterChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            cities={cities}
            groups={groups}
          />

          {/* Select All */}
          {filteredAssessments.length > 0 && (
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={handleSelectAll}
              >
                {selectedIds.size === filteredAssessments.length
                  ? t('selection.deselectAll')
                  : t('selection.selectAll')} ({filteredAssessments.length})
              </Button>
            </div>
          )}

          {/* Properties Grid/List */}
          {filteredAssessments.length === 0 ? (
            <Card className="py-8">
              <CardContent className="text-center text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('search.noResults')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-2'
            }>
              {filteredAssessments.map((assessment) => (
                <PropertyCard
                  key={assessment.id}
                  assessment={assessment}
                  selected={selectedIds.has(assessment.id)}
                  onSelect={handleSelect}
                  onAddToGroup={() => handleAddToGroup(assessment)}
                  onEditNickname={() => handleEditNickname(assessment)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        onExport={handleExport}
        onAddToGroup={() => handleAddToGroup(null)}
        onSetPriority={handleSetPriority}
        isExporting={isExporting}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onSubmit={handleCreateGroup}
        isLoading={isSubmitting}
      />

      {/* Add to Group Modal */}
      <AddToGroupModal
        open={addToGroupOpen}
        onOpenChange={setAddToGroupOpen}
        groups={groups}
        assessmentIds={selectedForGroup}
        currentGroupIds={
          selectedForGroup.length === 1
            ? assessments.find(a => a.id === selectedForGroup[0])?.groups?.map(g => g.group.id) || []
            : []
        }
        onSubmit={handleAddToGroupSubmit}
        onCreateGroup={() => {
          setAddToGroupOpen(false);
          setCreateGroupOpen(true);
        }}
        isLoading={isSubmitting}
      />
    </div>
  );
}
