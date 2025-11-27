'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

const statIcons = {
  total: ClipboardList,
  completed: CheckCircle2,
  inProgress: Clock,
  averageScore: TrendingUp,
};

export default function DashboardStats({ stats, isLoading }) {
  if (isLoading) {
    return <DashboardStatsSkeleton />;
  }

  const statsData = [
    {
      key: 'total',
      label: 'Total Assessments',
      value: stats?.total || 0,
      icon: statIcons.total,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      key: 'completed',
      label: 'Completed',
      value: stats?.completed || 0,
      icon: statIcons.completed,
      color: 'text-green-600 bg-green-50',
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      value: stats?.inProgress || 0,
      icon: statIcons.inProgress,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      key: 'averageScore',
      label: 'Average Score',
      value: stats?.averageScore !== null ? `${stats.averageScore}%` : '-',
      icon: statIcons.averageScore,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.key}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
