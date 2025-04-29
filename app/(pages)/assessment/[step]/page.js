'use client';

import { useRouter } from 'next/navigation';
import { useUserInput } from '@/context/UserInputContext';
import AssessmentSteps from '@/components/AssessmentSteps';
import ProgressBar from '@/components/ProgressBar';
import { nanoid } from 'nanoid';

export default function AssessmentStep({ params }) {
    const router = useRouter();
    const { userInput, updateUserInput } = useUserInput();
    const currentStep = parseInt(params.step);

    const handleNext = () => {
        if (currentStep < AssessmentSteps.length) {
            router.push(`/assessment/${currentStep + 1}`);
        } else {
            router.push(`/result/${nanoid()}`);
        }
    };

    const StepComponent = AssessmentSteps[currentStep - 1]?.component;

    if (!StepComponent) {
        return <div>Invalid step</div>;
    }

    return (
        <div className="container mx-auto px-4 ">
            {/* <ProgressBar currentStep={currentStep} totalSteps={AssessmentSteps.length} /> */}
            <StepComponent
                userInput={userInput}
                updateUserInput={updateUserInput}
                onNext={handleNext}
            />
        </div>
    );
}