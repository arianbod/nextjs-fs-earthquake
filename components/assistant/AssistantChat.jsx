/* eslint-disable */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowBigUp, Video, Mic, Building2 } from 'lucide-react';
import { useAssistant } from '@/context/AssistantContext';
import { motion, AnimatePresence } from 'framer-motion';
import TypingIndicator from './TypingIndicator';
import ChatMessage from './ChatMessage';
import Link from 'next/link';

const AssistantChat = () => {
	const { messages, sendMessage, isLoading, sendConferenceNotification } =
		useAssistant();
	const [input, setInput] = useState('');
	const [isComposing, setIsComposing] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);
	const containerRef = useRef(null);
	const recognitionRef = useRef(null);

	const scrollToBottom = (behavior = 'smooth') => {
		messagesEndRef.current?.scrollIntoView({ behavior });
	};

	useEffect(() => {
		scrollToBottom(messages.length === 1 ? 'auto' : 'smooth');
	}, [messages, isLoading]);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;
		sendMessage(input);
		setInput('');
		scrollToBottom('auto');
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
			handleSubmit(e);
		}
	};

	const handleStartConference = async () => {
		const currentTimestamp = new Date().getTime();
		const conferenceUrl = `https://conf.babaai.ca/${currentTimestamp}`;

		try {
			const userEmail = 'h.f.gate@gmail.com';
			const relevantMessages = messages.filter(
				(msg) =>
					msg.content?.trim() &&
					(msg.role === 'user' || msg.role === 'assistant')
			);

			const result = await sendConferenceNotification(
				userEmail,
				conferenceUrl,
				relevantMessages
			);

			if (result.success) {
				window.open(conferenceUrl, '_blank');
			} else {
				console.error(
					'Failed to send expert consultation request:',
					result.error
				);
			}
		} catch (error) {
			console.error('Error starting expert consultation:', error);
		}
	};

	const startVoiceRecognition = () => {
		if (
			!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
		) {
			alert("Your browser doesn't support voice recognition.");
			return;
		}

		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		recognitionRef.current = new SpeechRecognition();
		recognitionRef.current.continuous = false;
		recognitionRef.current.interimResults = false;
		recognitionRef.current.start();
		setIsRecording(true);

		recognitionRef.current.onresult = (event) => {
			let transcript = '';
			for (let i = event.resultIndex; i < event.results.length; i++) {
				if (event.results[i].isFinal) {
					transcript += event.results[i][0].transcript;
				}
			}
			setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
		};

		recognitionRef.current.onend = () => {
			setIsRecording(false);
		};

		recognitionRef.current.onerror = (e) => {
			console.error('Voice recognition error:', e);
			setIsRecording(false);
		};
	};

	const stopVoiceRecognition = () => {
		if (recognitionRef.current) {
			recognitionRef.current.stop();
			setIsRecording(false);
		}
	};

	const handleVoiceInputToggle = () => {
		if (isRecording) {
			stopVoiceRecognition();
		} else {
			startVoiceRecognition();
		}
	};

	return (
		<div
			className='flex flex-col h-full bg-white dark:bg-blue-950'
			ref={containerRef}>
			{/* Welcome message */}
			{messages.length === 0 && (
				<div className='flex-1 flex items-center justify-center p-8 text-center'>
					<div className='max-w-md mx-auto'>
						<h3 className='text-2xl font-semibold mb-4 text-gray-800 dark:text-blue-100 flex items-center justify-center gap-2'>
							<Building2 className='w-6 h-6' />
							Earthquake Impact Assessment
						</h3>
						<h4 className='text-xl mb-4 text-gray-700 dark:text-blue-200'>
							Supported by Assistant Professor Hamid F Ghatte
						</h4>
						<p className='text-base text-gray-600 dark:text-blue-200 mb-4'>
							I'll help you assess your building's earthquake safety through a
							simple conversation. Just describe your building, and I'll guide
							you through the process step by step.
						</p>
						<div className='grid gap-4'>
							<div className='grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-blue-200'>
								<div className='bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg'>
									<p className='font-semibold'>10,000+</p>
									<p>Buildings Assessed</p>
								</div>
								<div className='bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg'>
									<p className='font-semibold'>95%</p>
									<p>Accuracy Rate</p>
								</div>
							</div>
							<button
								onClick={handleStartConference}
								className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 mx-auto'>
								<Video className='w-5 h-5' />
								Connect with Expert
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Messages section */}
			<div className='flex-1 overflow-y-auto p-6 space-y-2'>
				{messages.map((message, index) => (
					<ChatMessage
						key={message.id}
						message={message}
						isLast={index === messages.length - 1}
					/>
				))}
				<AnimatePresence>
					{isLoading && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							className='flex justify-start'>
							<TypingIndicator />
						</motion.div>
					)}
				</AnimatePresence>
				<div ref={messagesEndRef} />
			</div>

			{/* Input section */}
			<div className='border-t border-blue-200 dark:border-blue-800 p-4 bg-blue-50 dark:bg-blue-950/50'>
				<form
					onSubmit={handleSubmit}
					className='max-w-4xl mx-auto'>
					<div className='flex items-center gap-3'>
						<div className='flex-1 relative'>
							<textarea
								ref={inputRef}
								rows={1}
								value={input}
								onChange={(e) => {
									setInput(e.target.value);
									e.target.style.height = 'auto';
									e.target.style.height =
										Math.min(e.target.scrollHeight, 150) + 'px';
								}}
								onKeyDown={handleKeyDown}
								onCompositionStart={() => setIsComposing(true)}
								onCompositionEnd={() => setIsComposing(false)}
								placeholder='Describe your building or ask any questions...'
								className='w-full bg-white dark:bg-blue-900 rounded-2xl px-4 py-3
                                    text-gray-900 dark:text-blue-100 placeholder-gray-500 dark:placeholder-blue-400
                                    min-h-[48px] max-h-[150px] resize-none shadow-sm
                                    border border-blue-200 dark:border-blue-700
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                    transition-all duration-200
                                    overflow-hidden hover:overflow-auto
                                    [&::-webkit-scrollbar]:w-1.5
                                    [&::-webkit-scrollbar-track]:bg-transparent
                                    [&::-webkit-scrollbar-thumb]:bg-blue-300
                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                    dark:[&::-webkit-scrollbar-thumb]:bg-blue-600'
								disabled={isLoading}
							/>
						</div>

						<motion.button
							type='button'
							onClick={handleVoiceInputToggle}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
								isRecording
									? 'bg-red-600 hover:bg-red-700'
									: 'bg-blue-300 hover:bg-blue-400'
							}`}
							disabled={isLoading}>
							<Mic className='w-6 h-6 text-white' />
						</motion.button>

						<motion.button
							type='submit'
							disabled={!input.trim() || isLoading}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className='p-3 bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 
                                disabled:bg-blue-300 dark:disabled:bg-blue-700
                                disabled:cursor-not-allowed flex-shrink-0 transition-all duration-200
                                shadow-sm hover:shadow-md'>
							<ArrowBigUp className='w-6 h-6 text-white' />
						</motion.button>
					</div>

					<Link
						href='https://babaai.ca'
						className='text-blue-900/50 dark:text-blue-300/50 text-xs text-center flex place-content-center place-items-center mt-2'>
						Learn more about assistant!
					</Link>
				</form>
			</div>

			{/* Expert consultation button */}
			{messages.length > 0 && (
				<div className='absolute bottom-20 right-4'>
					<motion.button
						onClick={handleStartConference}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg text-white'>
						<Video className='w-5 h-5' />
					</motion.button>
				</div>
			)}
		</div>
	);
};

export default AssistantChat;
