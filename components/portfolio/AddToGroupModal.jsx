'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Plus, Folder, Building, Home, Briefcase, MapPin } from 'lucide-react';

const ICONS = {
  folder: Folder,
  building: Building,
  home: Home,
  briefcase: Briefcase,
  mapPin: MapPin,
};

export default function AddToGroupModal({
  open,
  onOpenChange,
  groups,
  assessmentIds,
  currentGroupIds = [],
  onSubmit,
  onCreateGroup,
  isLoading = false,
}) {
  const t = useTranslations('Portfolio');
  const [selectedGroups, setSelectedGroups] = useState(new Set(currentGroupIds));

  const handleToggle = (groupId) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const handleSubmit = async () => {
    const toAdd = [...selectedGroups].filter(id => !currentGroupIds.includes(id));
    const toRemove = currentGroupIds.filter(id => !selectedGroups.has(id));
    await onSubmit({ toAdd, toRemove });
  };

  const hasChanges = () => {
    const currentSet = new Set(currentGroupIds);
    if (selectedGroups.size !== currentSet.size) return true;
    for (const id of selectedGroups) {
      if (!currentSet.has(id)) return true;
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addToGroup.title')}</DialogTitle>
          <DialogDescription>
            {assessmentIds.length === 1
              ? t('addToGroup.descriptionSingle')
              : t('addToGroup.descriptionMultiple', { count: assessmentIds.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-64 overflow-y-auto py-2">
          {groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('addToGroup.noGroups')}</p>
            </div>
          ) : (
            groups.map((group) => {
              const IconComponent = ICONS[group.icon] || Folder;
              return (
                <div
                  key={group.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleToggle(group.id)}
                >
                  <Checkbox
                    checked={selectedGroups.has(group.id)}
                    onCheckedChange={() => handleToggle(group.id)}
                  />
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${group.color}20` }}
                  >
                    <IconComponent className="w-4 h-4" style={{ color: group.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{group.name}</p>
                    {group.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {group._count?.assessments || 0} {t('addToGroup.properties')}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2 sm:mr-auto"
            onClick={onCreateGroup}
          >
            <Plus className="w-4 h-4" />
            {t('addToGroup.createNew')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('addToGroup.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasChanges() || isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('addToGroup.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
