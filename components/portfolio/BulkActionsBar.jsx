'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import {
  Download,
  FolderPlus,
  X,
  Trash2,
  Star,
} from 'lucide-react';

export default function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onExport,
  onAddToGroup,
  onSetPriority,
  isExporting,
}) {
  const t = useTranslations('Portfolio');

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg">
        <span className="text-sm font-medium">
          {selectedCount} {t('bulk.selected')}
        </span>

        <div className="w-px h-4 bg-primary-foreground/30 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20 gap-1 h-8"
          onClick={onAddToGroup}
        >
          <FolderPlus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('bulk.addToGroup')}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20 gap-1 h-8"
          onClick={onSetPriority}
        >
          <Star className="w-4 h-4" />
          <span className="hidden sm:inline">{t('bulk.setPriority')}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20 gap-1 h-8"
          onClick={onExport}
          disabled={isExporting}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isExporting ? t('bulk.exporting') : t('bulk.export')}
          </span>
        </Button>

        <div className="w-px h-4 bg-primary-foreground/30 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
          onClick={onClearSelection}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
