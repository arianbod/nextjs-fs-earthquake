'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Folder, Building, Home, Briefcase, MapPin } from 'lucide-react';

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6B7280', // Gray
];

const ICONS = [
  { name: 'folder', Icon: Folder },
  { name: 'building', Icon: Building },
  { name: 'home', Icon: Home },
  { name: 'briefcase', Icon: Briefcase },
  { name: 'mapPin', Icon: MapPin },
];

export default function CreateGroupModal({
  open,
  onOpenChange,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const t = useTranslations('Portfolio');
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [color, setColor] = useState(initialData?.color || COLORS[0]);
  const [icon, setIcon] = useState(initialData?.icon || 'folder');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      color,
      icon,
    });

    // Reset form on success
    if (!initialData) {
      setName('');
      setDescription('');
      setColor(COLORS[0]);
      setIcon('folder');
    }
  };

  const isEdit = !!initialData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('group.editTitle') : t('group.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('group.editDescription') : t('group.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('group.name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('group.namePlaceholder')}
              maxLength={50}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('group.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('group.descriptionPlaceholder')}
              maxLength={200}
              rows={2}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>{t('group.color')}</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>{t('group.icon')}</Label>
            <div className="flex gap-2">
              {ICONS.map(({ name: iconName, Icon }) => (
                <button
                  key={iconName}
                  type="button"
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border ${
                    icon === iconName
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                  onClick={() => setIcon(iconName)}
                  aria-label={iconName}
                >
                  <Icon className="w-5 h-5" style={{ color: color }} />
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-muted">
            <Label className="text-xs text-muted-foreground mb-2 block">
              {t('group.preview')}
            </Label>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                {ICONS.find(i => i.name === icon)?.Icon && (
                  <span style={{ color }}>
                    {(() => {
                      const IconComponent = ICONS.find(i => i.name === icon)?.Icon;
                      return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
                    })()}
                  </span>
                )}
              </div>
              <span className="font-medium" style={{ color }}>
                {name || t('group.namePlaceholder')}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('group.cancel')}
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? t('group.save') : t('group.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
