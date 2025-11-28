'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Check, Sparkles } from 'lucide-react';

/**
 * ScoreReveal - Dramatic score reveal with counting animation
 * The main "wow" moment when results load
 */
export function ScoreReveal({ score, onRevealComplete }) {
	const [phase, setPhase] = useState('scanning'); // scanning, counting, revealed
	const [displayScore, setDisplayScore] = useState(0);
	const [showParticles, setShowParticles] = useState(false);

	const finalScore = Math.round(parseFloat(score?.overallScore || 0));
	const isPassing = finalScore >= 70;

	// Phase transitions
	useEffect(() => {
		// Scanning phase (1.5s)
		const scanTimer = setTimeout(() => setPhase('counting'), 1500);
		return () => clearTimeout(scanTimer);
	}, []);

	// Counting animation
	useEffect(() => {
		if (phase !== 'counting') return;

		let current = 0;
		const duration = 2000; // 2 seconds
		const steps = 60;
		const increment = finalScore / steps;
		const stepDuration = duration / steps;

		const counter = setInterval(() => {
			current += increment;
			if (current >= finalScore) {
				setDisplayScore(finalScore);
				clearInterval(counter);
				setPhase('revealed');
				setShowParticles(true);
				setTimeout(() => onRevealComplete?.(), 1000);
			} else {
				setDisplayScore(Math.round(current));
			}
		}, stepDuration);

		return () => clearInterval(counter);
	}, [phase, finalScore]);

	// Get score color based on value
	const getScoreColor = (score) => {
		if (score >= 80) return { from: 'from-emerald-400', to: 'to-green-500', text: 'text-emerald-500', shadow: 'shadow-emerald-500/50' };
		if (score >= 70) return { from: 'from-green-400', to: 'to-emerald-500', text: 'text-green-500', shadow: 'shadow-green-500/50' };
		if (score >= 60) return { from: 'from-yellow-400', to: 'to-amber-500', text: 'text-yellow-500', shadow: 'shadow-yellow-500/50' };
		if (score >= 50) return { from: 'from-orange-400', to: 'to-red-500', text: 'text-orange-500', shadow: 'shadow-orange-500/50' };
		return { from: 'from-red-400', to: 'to-rose-600', text: 'text-red-500', shadow: 'shadow-red-500/50' };
	};

	const colors = getScoreColor(displayScore);

	// Particles burst
	const Particles = () => (
		<AnimatePresence>
			{showParticles && (
				<div className="absolute inset-0 pointer-events-none overflow-hidden">
					{[...Array(50)].map((_, i) => (
						<motion.div
							key={i}
							initial={{
								x: '50%',
								y: '50%',
								scale: 0,
								opacity: 1,
							}}
							animate={{
								x: `${50 + (Math.random() - 0.5) * 150}%`,
								y: `${50 + (Math.random() - 0.5) * 150}%`,
								scale: [0, 1.5, 0],
								opacity: [1, 1, 0],
								rotate: Math.random() * 720,
							}}
							transition={{
								duration: 1.5 + Math.random(),
								ease: 'easeOut',
							}}
							className={`absolute w-3 h-3 rounded-full ${
								['bg-emerald-400', 'bg-blue-400', 'bg-violet-400', 'bg-amber-400', 'bg-rose-400'][i % 5]
							}`}
						/>
					))}
				</div>
			)}
		</AnimatePresence>
	);

	return (
		<div className="relative flex flex-col items-center justify-center py-12">
			<Particles />

			{/* Scanning Phase */}
			<AnimatePresence mode="wait">
				{phase === 'scanning' && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						className="flex flex-col items-center"
					>
						{/* Scanning rings */}
						<div className="relative w-40 h-40">
							<motion.div
								animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
								transition={{ duration: 1, repeat: Infinity }}
								className="absolute inset-0 rounded-full border-4 border-blue-400"
							/>
							<motion.div
								animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
								transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
								className="absolute inset-0 rounded-full border-4 border-violet-400"
							/>
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
								className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500"
							/>
							<div className="absolute inset-0 flex items-center justify-center">
								<Shield className="w-16 h-16 text-blue-500" />
							</div>
						</div>
						<motion.p
							animate={{ opacity: [0.5, 1, 0.5] }}
							transition={{ duration: 1.5, repeat: Infinity }}
							className="mt-6 text-lg text-gray-500"
						>
							Analyzing safety data...
						</motion.p>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Counting & Revealed Phase */}
			{(phase === 'counting' || phase === 'revealed') && (
				<motion.div
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ type: 'spring', stiffness: 200 }}
					className="flex flex-col items-center"
				>
					{/* Score circle */}
					<div className="relative">
						{/* Glow effect */}
						<motion.div
							animate={phase === 'revealed' ? { scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] } : {}}
							transition={{ duration: 2, repeat: Infinity }}
							className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.from} ${colors.to} blur-xl opacity-30`}
							style={{ transform: 'scale(1.2)' }}
						/>

						{/* Main circle */}
						<div className={`relative w-48 h-48 rounded-full bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center shadow-2xl ${colors.shadow}`}>
							{/* Inner circle */}
							<div className="w-40 h-40 rounded-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
								<motion.span
									key={displayScore}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									className={`text-6xl font-bold ${colors.text}`}
								>
									{displayScore}
								</motion.span>
								<span className="text-gray-400 text-lg">/100</span>
							</div>
						</div>

						{/* Badge */}
						{phase === 'revealed' && (
							<motion.div
								initial={{ scale: 0, rotate: -180 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={{ type: 'spring', delay: 0.3 }}
								className={`absolute -bottom-2 -right-2 w-14 h-14 rounded-full ${
									isPassing ? 'bg-emerald-500' : 'bg-amber-500'
								} flex items-center justify-center shadow-lg`}
							>
								{isPassing ? (
									<Check className="w-8 h-8 text-white" strokeWidth={3} />
								) : (
									<AlertTriangle className="w-7 h-7 text-white" />
								)}
							</motion.div>
						)}
					</div>

					{/* Label */}
					{phase === 'revealed' && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							className="mt-6 text-center"
						>
							<h2 className={`text-2xl font-bold ${colors.text}`}>
								{finalScore >= 80 ? 'Excellent!' : finalScore >= 70 ? 'Good' : finalScore >= 60 ? 'Fair' : finalScore >= 50 ? 'Needs Work' : 'At Risk'}
							</h2>
							<p className="text-gray-500 mt-1">
								{isPassing ? 'Your building passed the safety assessment' : 'Some improvements recommended'}
							</p>
						</motion.div>
					)}
				</motion.div>
			)}
		</div>
	);
}

export default ScoreReveal;
