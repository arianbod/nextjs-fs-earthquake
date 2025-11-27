'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AssessmentCard, { AssessmentCardSkeleton } from './AssessmentCard';
import EmptyState from './EmptyState';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  getUserAssessments,
  archiveAssessment,
  duplicateAssessment,
} from '@/lib/actions/assessment';

const ITEMS_PER_PAGE = 10;

export default function AssessmentList() {
  const router = useRouter();
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);

  const fetchAssessments = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      const currentOffset = reset ? 0 : offset;

      const statusFilter = filter === 'all' ? null :
        filter === 'drafts' ? 'IN_PROGRESS' :
        filter === 'complete' ? 'COMPLETE' : null;

      const result = await getUserAssessments({
        status: statusFilter,
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
      });

      if (result.success) {
        if (reset) {
          setAssessments(result.assessments);
          setOffset(ITEMS_PER_PAGE);
        } else {
          setAssessments((prev) => [...prev, ...result.assessments]);
          setOffset((prev) => prev + ITEMS_PER_PAGE);
        }
        setHasMore(result.hasMore);
        setTotal(result.total);
      } else {
        toast.error('Failed to load assessments');
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  }, [filter, offset]);

  // Initial load and filter change
  useEffect(() => {
    setOffset(0);
    fetchAssessments(true);
  }, [filter]);

  const handleDuplicate = async (id) => {
    try {
      const result = await duplicateAssessment(id);
      if (result.success) {
        toast.success('Assessment duplicated');
        // Refresh list
        fetchAssessments(true);
        // Optionally navigate to the new assessment
        // router.push(`/assessment/1?id=${result.assessmentId}`);
      } else {
        toast.error(result.error || 'Failed to duplicate');
      }
    } catch (error) {
      console.error('Error duplicating:', error);
      toast.error('Failed to duplicate assessment');
    }
  };

  const handleDeleteClick = (id) => {
    const assessment = assessments.find((a) => a.id === id);
    setAssessmentToDelete(assessment);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assessmentToDelete) return;

    try {
      const result = await archiveAssessment(assessmentToDelete.id);
      if (result.success) {
        toast.success('Assessment deleted');
        setAssessments((prev) =>
          prev.filter((a) => a.id !== assessmentToDelete.id)
        );
        setTotal((prev) => prev - 1);
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete assessment');
    }
  };

  const handleShare = (id, action) => {
    if (action === 'copied') {
      toast.success('Link copied to clipboard');
    }
  };

  const handleLoadMore = () => {
    fetchAssessments(false);
  };

  // Empty state
  if (!isLoading && assessments.length === 0 && filter === 'all') {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="drafts">In Progress</TabsTrigger>
            <TabsTrigger value="complete">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        {total > 0 && (
          <span className="text-sm text-muted-foreground">
            {total} assessment{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Assessment cards */}
      <div className="space-y-3">
        {isLoading && assessments.length === 0 ? (
          // Initial loading
          Array.from({ length: 3 }).map((_, i) => (
            <AssessmentCardSkeleton key={i} />
          ))
        ) : assessments.length === 0 ? (
          // Empty filtered state
          <div className="text-center py-8 text-muted-foreground">
            No {filter === 'drafts' ? 'in-progress' : filter} assessments found.
          </div>
        ) : (
          // Assessment list
          assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onDuplicate={handleDuplicate}
              onDelete={handleDeleteClick}
              onShare={handleShare}
            />
          ))
        )}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAssessmentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        assessmentTitle={
          assessmentToDelete?.location?.fullAddress ||
          assessmentToDelete?.title ||
          'this assessment'
        }
      />
    </div>
  );
}
