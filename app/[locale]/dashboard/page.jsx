'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardStats, AssessmentList } from '@/components/dashboard';
import { getDashboardStats } from '@/lib/actions/assessment';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const result = await getDashboardStats();
        if (result.success) {
          setStats(result.stats);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Assessments</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your earthquake safety assessments
          </p>
        </div>
        <Link href="/assessment/1">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <DashboardStats stats={stats} isLoading={isLoadingStats} />
      </div>

      {/* Assessment List */}
      <AssessmentList />
    </div>
  );
}
