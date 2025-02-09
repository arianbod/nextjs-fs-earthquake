// components/assistant/AssistantWrapper.jsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import AnimatedAssistantButton from './AssistantButton';
import AssistantPanel from './AssistantPanel';

// Dynamically import assistant components to reduce initial bundle size
// const AssistantButton = dynamic(() => import('./AssistantButton'), {
// 	ssr: false,
// 	loading: () => null,
// });

// const AssistantPanel = dynamic(() => import('./AssistantPanel'), {
// 	ssr: false,
// 	loading: () => null,
// });

const AssistantWrapper = () => {
	return (
		<>
			<AnimatedAssistantButton />
			<AssistantPanel />
		</>
	);
};

export default AssistantWrapper;
