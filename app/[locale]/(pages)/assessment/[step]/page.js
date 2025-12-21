'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserInput } from '@/context/UserInputContext';
import AssessmentSteps from '@/components/AssessmentSteps';
import { Loader2, AlertCircle, CheckCircle2, CloudOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Validation functions for each step
const validateStep = (step, userInput) => {
    switch (step) {
        case 1: // Location step
            if (!userInput.latitude || !userInput.longitude) {
                return { valid: false, error: 'Please select a location on the map' };
            }
            if (!userInput.address && !userInput.city) {
                return { valid: false, error: 'Location address could not be determined' };
            }
            return { valid: true };

        case 2: // AI Photo step - photos are optional but recommended
            return { valid: true };

        case 3: // Building Info step
            if (!userInput.numberOfStories || userInput.numberOfStories < 1) {
                return { valid: false, error: 'Please specify the number of stories' };
            }
            return { valid: true };

        case 4: // Optional Details step
            return { valid: true };

        default:
            return { valid: true };
    }
};

// Save status indicator component
const SaveStatusIndicator = ({ status, onRetry }) => {
    if (status === 'idle') return null;

    const statusConfig = {
        saving: {
            icon: <Loader2 className="h-4 w-4 animate-spin" />,
            text: 'Saving...',
            className: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        saved: {
            icon: <CheckCircle2 className="h-4 w-4" />,
            text: 'Saved',
            className: 'bg-green-50 text-green-700 border-green-200',
        },
        error: {
            icon: <CloudOff className="h-4 w-4" />,
            text: 'Save failed',
            className: 'bg-red-50 text-red-700 border-red-200',
        },
    };

    const config = statusConfig[status] || statusConfig.idle;

    return (
        <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg border ${config.className} shadow-lg z-50`}>
            {config.icon}
            <span className="text-sm font-medium">{config.text}</span>
            {status === 'error' && onRetry && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRetry}
                    className="ml-2 h-6 px-2"
                >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                </Button>
            )}
        </div>
    );
};

export default function AssessmentStep({ params }) {
    // Unwrap params Promise (Next.js 15+)
    const resolvedParams = use(params);

    const router = useRouter();
    const searchParams = useSearchParams();
    const {
        userInput,
        updateUserInput,
        loadAssessment,
        isLoadingFromDb,
        saveLocationToDb,
        saveWeatherToDb,
        saveBuildingInfoToDb,
        saveImagesToDb,
        startNewAssessment,
    } = useUserInput();

    const currentStep = parseInt(resolvedParams.step);
    const assessmentIdFromUrl = searchParams.get('id');
    const [isInitializing, setIsInitializing] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
    const [validationError, setValidationError] = useState(null);
    const [lastSaveError, setLastSaveError] = useState(null);

    // Load assessment from DB if ID in URL and not already loaded
    useEffect(() => {
        const initializeAssessment = async () => {
            if (assessmentIdFromUrl && userInput.assessmentId !== assessmentIdFromUrl) {
                console.log('Loading assessment from DB:', assessmentIdFromUrl);
                const loaded = await loadAssessment(assessmentIdFromUrl);
                if (!loaded) {
                    toast.error('Failed to load assessment', {
                        description: 'Starting a new assessment instead',
                    });
                }
            }
            setIsInitializing(false);
        };

        initializeAssessment();
    }, [assessmentIdFromUrl]);

    // Clear validation error when user makes changes
    useEffect(() => {
        setValidationError(null);
    }, [userInput.latitude, userInput.longitude, userInput.numberOfStories]);

    // Auto-hide saved status after 3 seconds
    useEffect(() => {
        if (saveStatus === 'saved') {
            const timer = setTimeout(() => setSaveStatus('idle'), 3000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    // Save function with retry logic
    const saveStepData = useCallback(async (retryCount = 0) => {
        const maxRetries = 2;

        setIsSaving(true);
        setSaveStatus('saving');
        setLastSaveError(null);

        try {
            let success = false;

            switch (currentStep) {
                case 1: // Location step
                    success = await saveLocationToDb();
                    break;
                case 2: // AI Photo step
                    success = await saveWeatherToDb();
                    break;
                case 3: // Building Info step
                    success = await saveBuildingInfoToDb();
                    break;
                case 4: // Optional Details step
                    success = true; // Optional step, always succeeds
                    break;
                default:
                    success = true;
            }

            if (success) {
                setSaveStatus('saved');
                return true;
            } else {
                throw new Error('Save returned false');
            }
        } catch (error) {
            console.error(`Error saving step ${currentStep} data (attempt ${retryCount + 1}):`, error);

            if (retryCount < maxRetries) {
                console.log(`Retrying save... (${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                return saveStepData(retryCount + 1);
            }

            setSaveStatus('error');
            setLastSaveError(error.message || 'Failed to save data');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [currentStep, saveLocationToDb, saveWeatherToDb, saveBuildingInfoToDb]);

    // Handle step completion and navigation
    const handleNext = async () => {
        // Validate current step
        const validation = validateStep(currentStep, userInput);
        if (!validation.valid) {
            setValidationError(validation.error);
            toast.error('Cannot proceed', {
                description: validation.error,
            });
            return;
        }

        // Ensure we have an assessment ID for step 1
        if (currentStep === 1 && !userInput.assessmentId) {
            setSaveStatus('saving');
            const newId = await startNewAssessment();
            if (!newId) {
                setSaveStatus('error');
                toast.error('Failed to create assessment', {
                    description: 'Please check your connection and try again',
                });
                return;
            }
        }

        // Save data to DB
        const saved = await saveStepData();

        if (!saved && currentStep === 1) {
            // Location is critical - don't proceed without it
            toast.error('Could not save location', {
                description: 'Please try again or check your connection',
                action: {
                    label: 'Retry',
                    onClick: () => handleNext(),
                },
            });
            return;
        }

        if (!saved) {
            // For other steps, warn but allow proceeding (localStorage backup)
            toast.warning('Data saved locally', {
                description: 'Will sync to cloud when connection is restored',
            });
        }

        // Navigate to next step or results
        if (currentStep < AssessmentSteps.length) {
            const nextUrl = userInput.assessmentId
                ? `/assessment/${currentStep + 1}?id=${userInput.assessmentId}`
                : `/assessment/${currentStep + 1}`;
            router.push(nextUrl);
        } else {
            // Go to results - use assessmentId if available
            const resultId = userInput.assessmentId || 'preview';
            router.push(`/result/${resultId}`);
        }
    };

    // Retry save handler
    const handleRetry = () => {
        saveStepData();
    };

    const StepComponent = AssessmentSteps[currentStep - 1]?.component;

    // Redirect to results if step exceeds total steps (handles old assessments with more steps)
    if (!StepComponent || currentStep > AssessmentSteps.length) {
        const resultId = assessmentIdFromUrl || userInput.assessmentId || 'preview';
        router.replace(`/result/${resultId}`);
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="text-muted-foreground">Redirecting to results...</p>
            </div>
        );
    }

    // Show loading while initializing from DB
    if (isInitializing || isLoadingFromDb) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="text-muted-foreground">Loading assessment...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Validation Error Alert */}
            {validationError && (
                <Alert variant="destructive" className="mb-4 mx-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{validationError}</AlertDescription>
                </Alert>
            )}

            {/* Step Component */}
            <StepComponent
                userInput={userInput}
                updateUserInput={updateUserInput}
                onNext={handleNext}
                currentStep={currentStep}
                assessmentId={userInput.assessmentId}
                saveImagesToDb={saveImagesToDb}
                isSaving={isSaving}
            />

            {/* Save Status Indicator */}
            <SaveStatusIndicator
                status={saveStatus}
                onRetry={saveStatus === 'error' ? handleRetry : null}
            />
        </div>
    );
}
