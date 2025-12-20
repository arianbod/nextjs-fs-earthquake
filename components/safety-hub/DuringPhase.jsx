'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Hand,
  Shield,
  Clock,
  ArrowDown,
  Grip,
  Home,
  AlertTriangle
} from 'lucide-react';

// Safety instruction steps
const SAFETY_STEPS = [
  {
    id: 'drop',
    icon: ArrowDown,
    color: 'bg-blue-600',
    iconColor: 'text-blue-600'
  },
  {
    id: 'cover',
    icon: Shield,
    color: 'bg-purple-600',
    iconColor: 'text-purple-600'
  },
  {
    id: 'holdOn',
    icon: Grip,
    color: 'bg-teal-600',
    iconColor: 'text-teal-600'
  }
];

export default function DuringPhase() {
  const t = useTranslations('SafetyHub.during');
  const [currentStep, setCurrentStep] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentStep < SAFETY_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (isRightSwipe && currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && currentStep < SAFETY_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const toggleAudio = () => {
    // Audio would be implemented here
    setIsAudioPlaying(!isAudioPlaying);
  };

  const step = SAFETY_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div
      ref={containerRef}
      className="min-h-[60vh] flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main Instruction Card */}
      <Card className={`flex-1 ${step.color} text-white border-0 relative overflow-hidden`}>
        <CardContent className="h-full flex flex-col items-center justify-center py-12 px-6 text-center relative z-10">
          {/* Step Indicator */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
            {SAFETY_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'bg-white w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6">
            <Icon className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold mb-4 uppercase tracking-wide">
            {t(`steps.${step.id}.title`)}
          </h2>

          {/* Instruction */}
          <p className="text-xl opacity-90 max-w-md mb-4">
            {t(`steps.${step.id}.instruction`)}
          </p>

          {/* Detail */}
          <p className="text-sm opacity-75 max-w-sm">
            {t(`steps.${step.id}.detail`)}
          </p>

          {/* Audio Button */}
          <Button
            variant="secondary"
            size="lg"
            className="mt-8 gap-2 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={toggleAudio}
          >
            {isAudioPlaying ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
            {t('listenButton')}
          </Button>

          {/* Navigation Arrows */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-between px-4">
            <Button
              variant="ghost"
              size="icon"
              className={`text-white/70 hover:text-white hover:bg-white/10 ${currentStep === 0 ? 'invisible' : ''}`}
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`text-white/70 hover:text-white hover:bg-white/10 ${currentStep === SAFETY_STEPS.length - 1 ? 'invisible' : ''}`}
              onClick={() => setCurrentStep(prev => prev + 1)}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Swipe hint (mobile) */}
          <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs opacity-50 sm:hidden">
            {t('swipeHint')}
          </p>
        </CardContent>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 border-4 border-white rounded-full" />
        </div>
      </Card>

      {/* Quick Tips */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
          <CardContent className="p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                {t('tips.stayAway.title')}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t('tips.stayAway.detail')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800">
          <CardContent className="p-3 flex items-start gap-2">
            <Home className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-green-800 dark:text-green-200">
                {t('tips.stayInside.title')}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {t('tips.stayInside.detail')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shaking Stopped CTA */}
      <Card className="mt-4 border-primary/30 bg-primary/5">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {t('shakingStopped.question')}
          </p>
          <Button variant="outline" className="gap-2">
            <Clock className="w-4 h-4" />
            {t('shakingStopped.button')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
