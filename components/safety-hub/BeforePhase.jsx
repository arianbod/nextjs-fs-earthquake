'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Package,
  Users,
  FileText,
  Home,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Building2
} from 'lucide-react';
import Link from 'next/link';

// Checklist categories and items
const CHECKLIST_DATA = {
  supplies: {
    icon: Package,
    items: [
      'water', 'food', 'flashlight', 'batteries', 'firstAid',
      'medications', 'radio', 'charger', 'cash', 'blankets', 'whistle', 'mask'
    ]
  },
  family: {
    icon: Users,
    items: ['meetingPoint', 'emergencyContacts', 'childPlan', 'petPlan']
  },
  home: {
    icon: Home,
    items: ['secureHeavyItems', 'gasShutoff', 'waterShutoff', 'exitRoutes', 'extinguisher', 'smokeDetector', 'structuralCheck', 'glassFilm']
  },
  documents: {
    icon: FileText,
    items: ['idCopies', 'insuranceDocs', 'medicalRecords', 'propertyDocs', 'emergencyNumbers']
  }
};

const STORAGE_KEY = 'quakewise-preparedness-checklist';

export default function BeforePhase({ assessment }) {
  const t = useTranslations('SafetyHub.before');
  const [checklist, setChecklist] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setChecklist(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse checklist:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (Object.keys(checklist).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
    }
  }, [checklist]);

  const toggleItem = (category, item) => {
    setChecklist(prev => ({
      ...prev,
      [`${category}.${item}`]: !prev[`${category}.${item}`]
    }));
  };

  const getCategoryProgress = (category) => {
    const items = CHECKLIST_DATA[category].items;
    const completed = items.filter(item => checklist[`${category}.${item}`]).length;
    return { completed, total: items.length, percent: Math.round((completed / items.length) * 100) };
  };

  const getOverallProgress = () => {
    let completed = 0;
    let total = 0;
    Object.keys(CHECKLIST_DATA).forEach(category => {
      const items = CHECKLIST_DATA[category].items;
      total += items.length;
      completed += items.filter(item => checklist[`${category}.${item}`]).length;
    });
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const overall = getOverallProgress();

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{t('overallProgress')}</span>
            <span className="text-sm text-muted-foreground">
              {overall.completed}/{overall.total} {t('itemsComplete')}
            </span>
          </div>
          <Progress value={overall.percent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {overall.percent === 100 ? t('allComplete') : t('keepGoing')}
          </p>
        </CardContent>
      </Card>

      {/* Checklist Categories */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(CHECKLIST_DATA).map(([categoryKey, category]) => {
          const Icon = category.icon;
          const progress = getCategoryProgress(categoryKey);
          const isExpanded = expandedCategory === categoryKey;
          const isComplete = progress.percent === 100;

          return (
            <Card
              key={categoryKey}
              className={`transition-all cursor-pointer ${
                isComplete ? 'border-green-300 bg-green-50/50 dark:bg-green-900/10' : ''
              }`}
              onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                    <Icon className={`w-5 h-5 ${isComplete ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t(`categories.${categoryKey}`)}</span>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {progress.completed}/{progress.total}
                        </Badge>
                      )}
                    </div>
                    <Progress value={progress.percent} className="h-1 mt-2" />
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>

                {/* Expanded Items */}
                {isExpanded && (
                  <div
                    className="mt-4 pt-4 border-t space-y-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {category.items.map(item => (
                      <label
                        key={item}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={checklist[`${categoryKey}.${item}`] || false}
                          onCheckedChange={() => toggleItem(categoryKey, item)}
                        />
                        <span className={`text-sm ${checklist[`${categoryKey}.${item}`] ? 'line-through text-muted-foreground' : ''}`}>
                          {t(`items.${item}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Emergency Kit Guide */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t('emergencyKit.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t('emergencyKit.description')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <span className="font-medium block">3 {t('emergencyKit.days')}</span>
              <span className="text-muted-foreground">{t('emergencyKit.waterSupply')}</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <span className="font-medium block">3 {t('emergencyKit.days')}</span>
              <span className="text-muted-foreground">{t('emergencyKit.foodSupply')}</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <span className="font-medium block">{t('emergencyKit.firstAidKit')}</span>
              <span className="text-muted-foreground">{t('emergencyKit.perPerson')}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4 gap-2">
            <Download className="w-4 h-4" />
            {t('emergencyKit.downloadGuide')}
          </Button>
        </CardContent>
      </Card>

      {/* Link to Assessment */}
      {assessment && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{t('assessmentLink.title')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('assessmentLink.description')}
                </p>
                <Link href={`/result/${assessment.id}`}>
                  <Button variant="link" className="p-0 h-auto mt-2 gap-1">
                    {t('assessmentLink.viewResults')}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AFAD Resources Link */}
      <div className="text-center">
        <a
          href="https://www.afad.gov.tr/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          {t('afadLink')}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
