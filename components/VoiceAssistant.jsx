'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import {
	VolumeIcon,
	VolumeMute,
	Mic,
	MicOff,
	MessageSquare,
	Play,
	Pause,
	XCircle,
	Loader2,
	HelpCircle,
	ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

const VoiceAssistant = ({
	stepInstructions,
	onCommandReceived = () => {},
	currentStep = '',
}) => {
	// State
	const [isOpen, setIsOpen] = useState(false);
	const [voiceEnabled, setVoiceEnabled] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [query, setQuery] = useState('');
	const [messageHistory, setMessageHistory] = useState([
		{
			role: 'assistant',
			content:
				"Hello! I'm your voice assistant. How can I help you with this assessment?",
		},
	]);
	const [isLoadingResponse, setIsLoadingResponse] = useState(false);

	// Refs
	const messageEndRef = useRef(null);
	const speechSynthesisRef = useRef(null);
	const recognitionRef = useRef(null);

	// Initialize Web Speech API (if available)
	useEffect(() => {
		// Initialize speech synthesis
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			speechSynthesisRef.current = window.speechSynthesis;
		}

		// Initialize speech recognition
		if (
			typeof window !== 'undefined' &&
			('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
		) {
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			recognitionRef.current = new SpeechRecognition();
			recognitionRef.current.continuous = false;
			recognitionRef.current.interimResults = false;

			recognitionRef.current.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				setQuery(transcript);
				handleSubmitVoiceQuery(transcript);
			};

			recognitionRef.current.onerror = (event) => {
				console.error('Speech recognition error', event.error);
				setIsListening(false);
				toast.error(
					'Voice recognition failed. Please try again or type your question.'
				);
			};

			recognitionRef.current.onend = () => {
				setIsListening(false);
			};
		}

		return () => {
			// Clean up
			if (speechSynthesisRef.current) {
				speechSynthesisRef.current.cancel();
			}
			if (recognitionRef.current) {
				recognitionRef.current.abort();
			}
		};
	}, []);

	// Scroll to bottom of messages
	useEffect(() => {
		messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messageHistory]);

	// Toggle voice functionality
	const toggleVoice = () => {
		const newState = !voiceEnabled;
		setVoiceEnabled(newState);

		if (newState && stepInstructions && stepInstructions.length > 0) {
			speak(stepInstructions[0]);
		} else if (!newState && isSpeaking) {
			stopSpeaking();
		}
	};

	// Text-to-speech function
	const speak = (text) => {
		if (!speechSynthesisRef.current) {
			toast.error('Text-to-speech is not supported in your browser.');
			return;
		}

		// Cancel any ongoing speech
		stopSpeaking();

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.rate = 1.0;
		utterance.pitch = 1.0;
		utterance.volume = 1.0;

		utterance.onstart = () => setIsSpeaking(true);
		utterance.onend = () => setIsSpeaking(false);
		utterance.onerror = () => {
			setIsSpeaking(false);
			toast.error('An error occurred with text-to-speech.');
		};

		speechSynthesisRef.current.speak(utterance);
	};

	// Stop speaking
	const stopSpeaking = () => {
		if (speechSynthesisRef.current) {
			speechSynthesisRef.current.cancel();
			setIsSpeaking(false);
		}
	};

	// Start/stop listening
	const toggleListening = () => {
		if (!recognitionRef.current) {
			toast.error('Voice recognition is not supported in your browser.');
			return;
		}

		if (isListening) {
			recognitionRef.current.stop();
			setIsListening(false);
		} else {
			try {
				recognitionRef.current.start();
				setIsListening(true);
			} catch (error) {
				console.error('Recognition error:', error);
				toast.error('Could not start voice recognition. Please try again.');
			}
		}
	};

	// Handle text query submission
	const handleSubmitTextQuery = (e) => {
		e.preventDefault();
		if (!query.trim()) return;
		handleSubmitVoiceQuery(query);
	};

	// Process queries (both voice and text)
	const handleSubmitVoiceQuery = async (text) => {
		if (!text.trim()) return;

		// Add user message to history
		setMessageHistory((prev) => [...prev, { role: 'user', content: text }]);
		setIsLoadingResponse(true);

		// In a real implementation, you would send this to an AI service like Gemini
		// Here we'll simulate a response based on common questions
		setTimeout(() => {
			let response = '';
			const lowerText = text.toLowerCase();

			// Check for navigation commands
			if (
				lowerText.includes('next') ||
				lowerText.includes('continue') ||
				lowerText.includes('go to next step')
			) {
				onCommandReceived('next');
				response = 'Moving to the next step...';
			} else if (
				lowerText.includes('back') ||
				lowerText.includes('previous') ||
				lowerText.includes('go back')
			) {
				onCommandReceived('back');
				response = 'Going back to the previous step...';
			}
			// Check for step-specific questions
			else if (currentStep === 'location') {
				if (lowerText.includes('soil type') || lowerText.includes('soil')) {
					response =
						'Soil type refers to the ground composition at your building location. Different soil types respond differently during earthquakes. For example, soft soils (ZE) typically amplify shaking compared to hard rock (ZA).';
				} else if (lowerText.includes('map') || lowerText.includes('marker')) {
					response =
						'You can drag the marker on the map to precisely position your building location. This helps us determine the seismic zone and local geological conditions.';
				} else {
					response =
						"This step is about identifying your building's location. Accurate location information helps determine seismic risk factors specific to your area. If you need to adjust the marker position, simply drag it on the map.";
				}
			} else if (currentStep === 'building') {
				if (lowerText.includes('regulation') || lowerText.includes('code')) {
					response =
						'Building design regulations have evolved over time. Selecting the correct design regulation period helps us understand which seismic standards were applied when your building was constructed.';
				} else if (
					lowerText.includes('stories') ||
					lowerText.includes('floors')
				) {
					response =
						'The number of stories affects how a building responds to earthquake forces. Taller buildings typically have longer natural periods of vibration and may be more susceptible to certain types of seismic waves.';
				} else {
					response =
						'This step collects basic information about your building, including when it was designed, how many floors it has, and other key structural attributes. This information is crucial for accurate seismic assessment.';
				}
			} else {
				response =
					"I'm here to help you complete the earthquake impact assessment. You can ask me questions about any step, and I'll guide you through the process. What would you like to know?";
			}

			// Add AI response to history
			setMessageHistory((prev) => [
				...prev,
				{ role: 'assistant', content: response },
			]);
			setIsLoadingResponse(false);
			setQuery('');

			// Speak the response if voice is enabled
			if (voiceEnabled) {
				speak(response);
			}
		}, 1000);
	};

	return (
		<>
			{/* Floating button for mobile */}
			<Button
				onClick={() => setIsOpen(true)}
				className='fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden'
				size='icon'>
				<HelpCircle size={24} />
			</Button>

			<Sheet
				open={isOpen}
				onOpenChange={setIsOpen}>
				<SheetTrigger
					asChild
					className='hidden md:flex'>
					<Button
						variant='outline'
						className='gap-2'>
						<MessageSquare size={16} />
						<span>Voice Assistant</span>
					</Button>
				</SheetTrigger>

				<SheetContent className='w-[400px] sm:max-w-md p-0 flex flex-col h-full'>
					<SheetHeader className='p-4 border-b'>
						<div className='flex items-center justify-between'>
							<SheetTitle className='flex items-center gap-2'>
								{voiceEnabled ? (
									<VolumeIcon
										size={18}
										className={
											isSpeaking ? 'text-primary animate-pulse' : 'text-primary'
										}
									/>
								) : (
									<VolumeMute size={18} />
								)}
								Voice Assistant
							</SheetTitle>

							<div className='flex items-center gap-2'>
								<Button
									variant={voiceEnabled ? 'default' : 'outline'}
									size='icon'
									onClick={toggleVoice}
									className='h-8 w-8'>
									{voiceEnabled ? (
										<VolumeIcon size={16} />
									) : (
										<VolumeMute size={16} />
									)}
								</Button>
							</div>
						</div>
						<SheetDescription>
							Ask questions or get help with the current step
						</SheetDescription>
					</SheetHeader>

					{/* Chat area */}
					<div className='flex-1 overflow-y-auto p-4 space-y-4'>
						{messageHistory.map((message, index) => (
							<div
								key={index}
								className={`flex ${
									message.role === 'user' ? 'justify-end' : 'justify-start'
								}`}>
								<div
									className={`
                  max-w-[80%] rounded-lg p-3 
                  ${
										message.role === 'user'
											? 'bg-primary text-primary-foreground ml-auto'
											: 'bg-muted'
									}
                `}>
									{message.content}
								</div>
							</div>
						))}

						{isLoadingResponse && (
							<div className='flex justify-start'>
								<div className='bg-muted rounded-lg p-3 flex items-center gap-2'>
									<Loader2
										size={16}
										className='animate-spin'
									/>
									<span>Thinking...</span>
								</div>
							</div>
						)}

						<div ref={messageEndRef} />
					</div>

					{/* Quick help */}
					{stepInstructions && stepInstructions.length > 0 && (
						<div className='border-t p-3'>
							<p className='text-xs text-muted-foreground mb-2'>
								Voice assistant can help with:
							</p>
							<div className='space-y-1'>
								{stepInstructions.map((instruction, index) => (
									<Button
										key={index}
										variant='ghost'
										size='sm'
										className='w-full justify-start h-auto py-1 px-2 text-xs'
										onClick={() => {
											if (voiceEnabled) {
												speak(instruction);
											} else {
												const truncated =
													instruction.length > 100
														? instruction.substring(0, 100) + '...'
														: instruction;
												setMessageHistory((prev) => [
													...prev,
													{ role: 'assistant', content: truncated },
												]);
											}
										}}>
										<ChevronRight
											size={12}
											className='mr-1 flex-shrink-0'
										/>
										<span className='truncate text-left'>
											{instruction.length > 40
												? instruction.substring(0, 40) + '...'
												: instruction}
										</span>
									</Button>
								))}
							</div>
						</div>
					)}

					{/* Input area */}
					<div className='border-t p-3'>
						<form
							onSubmit={handleSubmitTextQuery}
							className='flex gap-2'>
							<Input
								placeholder={
									isListening ? 'Listening...' : 'Type a question...'
								}
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className='flex-1'
								disabled={isListening}
							/>
							<Button
								type='button'
								size='icon'
								variant={isListening ? 'default' : 'outline'}
								onClick={toggleListening}
								className={isListening ? 'bg-red-500 hover:bg-red-600' : ''}
								disabled={!recognitionRef.current}>
								{isListening ? <MicOff size={16} /> : <Mic size={16} />}
							</Button>
							<Button
								type='submit'
								size='icon'
								disabled={!query.trim()}>
								<ChevronRight size={16} />
							</Button>
						</form>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
};

export default VoiceAssistant;
