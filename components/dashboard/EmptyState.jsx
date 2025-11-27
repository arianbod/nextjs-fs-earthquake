'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Shield } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
          <Building2 className="w-12 h-12 text-blue-500" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-green-50 rounded-full flex items-center justify-center border-4 border-white">
          <Shield className="w-5 h-5 text-green-500" />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">No assessments yet</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        Start your first earthquake safety assessment to evaluate building
        vulnerability and get personalized safety recommendations.
      </p>

      <Link href="/assessment/1">
        <Button size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Start Your First Assessment
        </Button>
      </Link>

      <div className="mt-8 grid grid-cols-3 gap-6 text-center max-w-md">
        <div>
          <div className="text-2xl font-bold text-blue-600">5 min</div>
          <div className="text-xs text-muted-foreground">Average time</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">AI</div>
          <div className="text-xs text-muted-foreground">Powered analysis</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">Free</div>
          <div className="text-xs text-muted-foreground">Always free</div>
        </div>
      </div>
    </div>
  );
}
