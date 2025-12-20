'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
  Filter,
  X,
  LayoutGrid,
  List,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const RISK_LEVELS = ['all', 'low', 'moderate', 'high', 'veryHigh'];
const STATUS_OPTIONS = ['all', 'COMPLETE', 'IN_PROGRESS', 'DRAFT'];

export default function PropertyFilters({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  cities,
  groups,
}) {
  const t = useTranslations('Portfolio');

  const activeFilterCount = [
    filters.riskLevel !== 'all',
    filters.status !== 'all',
    filters.city !== 'all',
    filters.groupId !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFilterChange({
      riskLevel: 'all',
      status: 'all',
      city: 'all',
      groupId: 'all',
    });
  };

  const getRiskBadgeClass = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      case 'veryHigh': return 'bg-red-100 text-red-700 hover:bg-red-200';
      default: return '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Risk Level Filter */}
      <div className="flex flex-wrap gap-1">
        {RISK_LEVELS.map((risk) => (
          <Button
            key={risk}
            variant={filters.riskLevel === risk ? 'default' : 'outline'}
            size="sm"
            className={`text-xs h-8 ${
              filters.riskLevel !== risk && risk !== 'all' ? getRiskBadgeClass(risk) : ''
            }`}
            onClick={() => onFilterChange({ ...filters, riskLevel: risk })}
          >
            {risk === 'all' ? t('filters.allRisk') : t(`risk.${risk}`)}
          </Button>
        ))}
      </div>

      {/* Status & City Dropdowns */}
      <div className="flex gap-2 ml-auto">
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              {filters.status === 'all' ? t('filters.status') : t(`status.${filters.status}`)}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('filters.status')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STATUS_OPTIONS.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => onFilterChange({ ...filters, status })}
                className={filters.status === status ? 'bg-accent' : ''}
              >
                {status === 'all' ? t('filters.allStatus') : t(`status.${status}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* City Filter */}
        {cities && cities.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                {filters.city === 'all' ? t('filters.city') : filters.city}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('filters.city')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onFilterChange({ ...filters, city: 'all' })}
                className={filters.city === 'all' ? 'bg-accent' : ''}
              >
                {t('filters.allCities')}
              </DropdownMenuItem>
              {cities.map((city) => (
                <DropdownMenuItem
                  key={city}
                  onClick={() => onFilterChange({ ...filters, city })}
                  className={filters.city === city ? 'bg-accent' : ''}
                >
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Group Filter */}
        {groups && groups.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                {filters.groupId === 'all'
                  ? t('filters.group')
                  : groups.find(g => g.id === filters.groupId)?.name || t('filters.group')}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('filters.group')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onFilterChange({ ...filters, groupId: 'all' })}
                className={filters.groupId === 'all' ? 'bg-accent' : ''}
              >
                {t('filters.allGroups')}
              </DropdownMenuItem>
              {groups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => onFilterChange({ ...filters, groupId: group.id })}
                  className={filters.groupId === group.id ? 'bg-accent' : ''}
                >
                  <span
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1 text-muted-foreground"
            onClick={clearFilters}
          >
            <X className="w-3 h-3" />
            {t('filters.clear')} ({activeFilterCount})
          </Button>
        )}

        {/* View Mode Toggle */}
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0 rounded-none"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0 rounded-none"
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
