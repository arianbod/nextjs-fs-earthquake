'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserInput } from '@/context/UserInputContext';
import AssessmentSteps from '@/components/AssessmentSteps';
import { Loader2 } from 'lucide-react';

export default function AssessmentStep({ params }) {
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
    } = useUserInput();

    const currentStep = parseInt(params.step);
    const assessmentIdFromUrl = searchParams.get('id');
    const [isInitializing, setIsInitializing] = useState(true);

    // Load assessment from DB if ID in URL and not already loaded
    useEffect(() => {
        const initializeAssessment = async () => {
            if (assessmentIdFromUrl && userInput.assessmentId !== assessmentIdFromUrl) {
                console.log('Loading assessment from DB:', assessmentIdFromUrl);
                await loadAssessment(assessmentIdFromUrl);
            }
            setIsInitializing(false);
        };

        initializeAssessment();
    }, [assessmentIdFromUrl]);

    // Handle step completion and navigation
    const handleNext = async () => {
        // Save data to DB based on current step
        try {
            switch (currentStep) {
                case 1: // Location step
                    await saveLocationToDb();
                    break;
                case 2: // AI Photo step
                    // Images are saved in the step component after AI analysis
                    await saveWeatherToDb();
                    break;
                case 3: // Building Info step
                    await saveBuildingInfoToDb();
                    break;
                case 4: // Optional Details step
                    // Optional step - data saved incrementally
                    break;
            }
        } catch (error) {
            console.error('Error saving step data:', error);
            // Continue anyway - localStorage backup exists
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

    const StepComponent = AssessmentSteps[currentStep - 1]?.component;

    if (!StepComponent) {
        return <div>Invalid step</div>;
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
            <StepComponent
                userInput={userInput}
                updateUserInput={updateUserInput}
                onNext={handleNext}
                currentStep={currentStep}
                assessmentId={userInput.assessmentId}
                saveImagesToDb={saveImagesToDb}
            />
        </div>
    );
}