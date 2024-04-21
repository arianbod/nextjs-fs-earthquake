'use client'
import React from 'react'
import One from '@/components/1';
import Two from '@/components/2';
import Three from '@/components/3';
import ThreeTwo from '@/components/3-2';
import StepFour from '@/components/4';
import StepFive from '@/components/5';
import StepSix from '@/components/6';
import Seven from '@/components/7';
import Eight from '@/components/8';
import Nine from '@/components/9';
const page = ({ params }) => {
    let step = params.steps;
    console.log(params);
    return (
        <>
            {step == 1 && <One />}
            {step == 2 && <Two />}
            {step == 3 && <Three />}
            {step == '3-2' && <ThreeTwo />}
            {step == 4 && <StepFour />}
            {step == 5 && <StepFive />}
            {step == 6 && <StepSix />}
            {step == 7 && <Seven />}
            {step == 8 && <Eight />}
            {step == 9 && <Nine />}
        </>
    )
}

export default page