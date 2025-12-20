'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Phone,
  Camera,
  Upload,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Shield,
  ExternalLink,
  Building2,
  FileWarning,
  Flame,
  Droplets,
  Users
} from 'lucide-react';
import Link from 'next/link';

// Severity levels for damage assessment
const SEVERITY_CONFIG = {
  low: {
    color: 'bg-green-50 border-green-500 text-green-700',
    icon: CheckCircle2,
    iconColor: 'text-green-600'
  },
  moderate: {
    color: 'bg-yellow-50 border-yellow-500 text-yellow-700',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600'
  },
  high: {
    color: 'bg-orange-50 border-orange-500 text-orange-700',
    icon: AlertTriangle,
    iconColor: 'text-orange-600'
  },
  severe: {
    color: 'bg-red-50 border-red-500 text-red-700',
    icon: AlertOctagon,
    iconColor: 'text-red-600'
  }
};

// Emergency contacts
const EMERGENCY_CONTACTS = [
  { name: 'AFAD', number: '122', icon: Shield },
  { name: 'Ambulance', number: '112', icon: Users },
  { name: 'Fire', number: '110', icon: Flame },
];

export default function AfterPhase({ assessment }) {
  const t = useTranslations('SafetyHub.after');
  const [safetyConfirmed, setSafetyConfirmed] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [damageResult, setDamageResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 3) {
      setError(t('errors.maxPhotos'));
      return;
    }

    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
    setError(null);
  };

  const removePhoto = (id) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo?.preview) URL.revokeObjectURL(photo.preview);
      return prev.filter(p => p.id !== id);
    });
  };

  const analyzeDamage = async () => {
    if (photos.length === 0) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Create FormData with photos
      const formData = new FormData();
      formData.append('analysisType', 'damage_assessment');

      // Append each photo file
      for (const photo of photos) {
        formData.append('images', photo.file);
      }

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();

      // Extract analysis from response
      if (result.success && result.analysis) {
        setDamageResult(result.analysis);
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Damage analysis error:', err);
      setError(t('errors.analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial safety check
  if (safetyConfirmed === null) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('safetyCheck.title')}</h3>
            <p className="text-muted-foreground mb-6">{t('safetyCheck.question')}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => setSafetyConfirmed(true)}
              >
                <CheckCircle2 className="w-5 h-5" />
                {t('safetyCheck.yesButton')}
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="gap-2"
                onClick={() => window.location.href = 'tel:112'}
              >
                <Phone className="w-5 h-5" />
                {t('safetyCheck.noButton')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('emergencyContacts.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {EMERGENCY_CONTACTS.map((contact) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={contact.number}
                    href={`tel:${contact.number}`}
                    className="flex flex-col items-center p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-red-600 mb-1" />
                    <span className="text-lg font-bold">{contact.number}</span>
                    <span className="text-xs text-muted-foreground">{contact.name}</span>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Damage result display
  if (damageResult) {
    const severity = damageResult.severity?.toLowerCase() || 'moderate';
    const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.moderate;
    const SeverityIcon = config.icon;

    return (
      <div className="space-y-6">
        {/* Result Card */}
        <Card className={`border-2 ${config.color}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${config.color}`}>
                <SeverityIcon className={`w-8 h-8 ${config.iconColor}`} />
              </div>
              <div className="flex-1">
                <Badge className={config.color}>
                  {t(`severity.${severity}`)} {t('severity.damage')}
                </Badge>
                <p className="mt-2 text-sm">
                  {damageResult.summary || t('result.defaultSummary')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {damageResult.recommendations && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('result.recommendations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {damageResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Alert>
          <FileWarning className="w-4 h-4" />
          <AlertDescription className="text-xs">
            {t('result.disclaimer')}
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {assessment && (
            <Link href={`/assessment/1?reassess=${assessment.id}`}>
              <Button className="w-full gap-2">
                <Building2 className="w-4 h-4" />
                {t('result.startReassessment')}
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              setDamageResult(null);
              setPhotos([]);
            }}
          >
            {t('result.newAssessment')}
          </Button>
        </div>

        {/* Recovery Resources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              {t('resources.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="https://www.afad.gov.tr/"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <span className="font-medium">AFAD</span>
                <p className="text-xs text-muted-foreground">{t('resources.afadDesc')}</p>
              </a>
              <a
                href="https://www.kizilay.org.tr/"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <span className="font-medium">{t('resources.redCrescent')}</span>
                <p className="text-xs text-muted-foreground">{t('resources.redCrescentDesc')}</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Photo upload and analysis
  return (
    <div className="space-y-6">
      {/* Safety confirmed message */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-green-700 dark:text-green-300">
          {t('safetyConfirmed')}
        </AlertDescription>
      </Alert>

      {/* Photo Upload */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {t('damageAssessment.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t('damageAssessment.description')}
          </p>

          {/* Photo Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={photo.preview}
                  alt="Damage"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {photos.length < 3 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t('damageAssessment.addPhoto')}</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />

          {/* Tips */}
          <div className="p-3 bg-muted rounded-lg mb-4">
            <p className="text-xs font-medium mb-1">{t('damageAssessment.tips.title')}</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• {t('damageAssessment.tips.cracks')}</li>
              <li>• {t('damageAssessment.tips.tilting')}</li>
              <li>• {t('damageAssessment.tips.windows')}</li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full gap-2"
            disabled={photos.length === 0 || isAnalyzing}
            onClick={analyzeDamage}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('damageAssessment.analyzing')}
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                {t('damageAssessment.analyzeButton')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Gas and Water Check */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-medium mb-3">{t('utilityCheck.title')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
              <Flame className="w-5 h-5 text-amber-600 mb-1" />
              <p className="text-sm font-medium">{t('utilityCheck.gas.title')}</p>
              <p className="text-xs text-muted-foreground">{t('utilityCheck.gas.action')}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
              <Droplets className="w-5 h-5 text-blue-600 mb-1" />
              <p className="text-sm font-medium">{t('utilityCheck.water.title')}</p>
              <p className="text-xs text-muted-foreground">{t('utilityCheck.water.action')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('emergencyContacts.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {EMERGENCY_CONTACTS.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="flex-1 text-center p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <span className="text-lg font-bold block">{contact.number}</span>
                <span className="text-xs text-muted-foreground">{contact.name}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
