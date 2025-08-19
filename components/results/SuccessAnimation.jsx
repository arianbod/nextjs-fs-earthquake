import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Star, Sparkles } from 'lucide-react';

const SuccessAnimation = ({ score, show = true, onComplete }) => {
	const [isVisible, setIsVisible] = useState(show);
	const [showConfetti, setShowConfetti] = useState(false);
	const overallScore = parseFloat(score?.overallScore || 0);
	const isPassingScore = overallScore >= 70;

	useEffect(() => {
		if (show && isPassingScore) {
			setIsVisible(true);
			setShowConfetti(true);
			
			// Auto-dismiss after 3 seconds
			const timer = setTimeout(() => {
				setIsVisible(false);
				if (onComplete) {
					onComplete();
				}
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [show, isPassingScore, onComplete]);

	// Only show animation for passing scores
	if (!isPassingScore) {
		return null;
	}

	// Confetti particles configuration
	const confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
	const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
		id: i,
		color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
		initialX: Math.random() * window.innerWidth,
		initialY: -10,
		rotation: Math.random() * 360,
		scale: 0.5 + Math.random() * 0.5,
		delay: Math.random() * 0.5
	}));

	const containerVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.5,
				staggerChildren: 0.1
			}
		},
		exit: {
			opacity: 0,
			scale: 0.8,
			transition: { duration: 0.3 }
		}
	};

	const childVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: "easeOut" }
		}
	};

	const checkmarkVariants = {
		hidden: { scale: 0, rotate: -180 },
		visible: {
			scale: 1,
			rotate: 0,
			transition: {
				type: "spring",
				stiffness: 260,
				damping: 20,
				delay: 0.2
			}
		}
	};

	const pulseVariants = {
		animate: {
			scale: [1, 1.1, 1],
			transition: {
				duration: 2,
				repeat: Infinity,
				ease: "easeInOut"
			}
		}
	};

	const sparkleVariants = {
		animate: {
			scale: [0, 1, 0],
			rotate: [0, 180, 360],
			opacity: [0, 1, 0],
			transition: {
				duration: 1.5,
				repeat: Infinity,
				ease: "easeInOut",
				staggerChildren: 0.2
			}
		}
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					exit="exit"
					onClick={() => setIsVisible(false)}
				>
					{/* Confetti Animation */}
					{showConfetti && (
						<div className="absolute inset-0 pointer-events-none overflow-hidden">
							{confettiParticles.map((particle) => (
								<motion.div
									key={particle.id}
									className="absolute w-3 h-3 rounded"
									style={{
										backgroundColor: particle.color,
										left: particle.initialX,
										top: particle.initialY,
										scale: particle.scale
									}}
									initial={{
										y: -10,
										x: 0,
										rotate: 0,
										opacity: 1
									}}
									animate={{
										y: window.innerHeight + 50,
										x: [-50, 50, -30, 30, 0],
										rotate: particle.rotation,
										opacity: [1, 1, 0.5, 0]
									}}
									transition={{
										duration: 3,
										delay: particle.delay,
										ease: "easeOut"
									}}
								/>
							))}
						</div>
					)}

					{/* Main Success Card */}
					<motion.div
						className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center relative overflow-hidden"
						variants={childVariants}
					>
						{/* Background Glow Effect */}
						<div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 opacity-50"></div>
						
						{/* Content */}
						<div className="relative z-10">
							{/* Success Icon */}
							<motion.div
								className="relative mx-auto mb-6"
								variants={checkmarkVariants}
							>
								<motion.div
									className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
									variants={pulseVariants}
									animate="animate"
								>
									<CheckCircle2 className="w-12 h-12 text-green-600" />
								</motion.div>
								
								{/* Sparkles around the icon */}
								<motion.div
									className="absolute -top-2 -right-2"
									variants={sparkleVariants}
									animate="animate"
								>
									<Sparkles className="w-6 h-6 text-yellow-500" />
								</motion.div>
								<motion.div
									className="absolute -bottom-2 -left-2"
									variants={sparkleVariants}
									animate="animate"
									style={{ animationDelay: '0.5s' }}
								>
									<Star className="w-5 h-5 text-blue-500" />
								</motion.div>
								<motion.div
									className="absolute top-0 left-0"
									variants={sparkleVariants}
									animate="animate"
									style={{ animationDelay: '1s' }}
								>
									<Star className="w-4 h-4 text-purple-500" />
								</motion.div>
							</motion.div>

							{/* Congratulations Text */}
							<motion.h2
								className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
								variants={childVariants}
							>
								🎉 Congratulations!
							</motion.h2>

							<motion.p
								className="text-lg text-gray-600 dark:text-gray-300 mb-4"
								variants={childVariants}
							>
								Your building has achieved an excellent safety score!
							</motion.p>

							{/* Score Display */}
							<motion.div
								className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6"
								variants={childVariants}
							>
								<div className="text-3xl font-bold text-green-600 mb-1">
									{overallScore}%
								</div>
								<div className="text-sm text-green-700 dark:text-green-300">
									Safety Score
								</div>
							</motion.div>

							{/* Achievement Badges */}
							<motion.div
								className="flex justify-center gap-4 mb-6"
								variants={childVariants}
							>
								<div className="text-center">
									<div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2">
										<Star className="w-6 h-6 text-yellow-600" />
									</div>
									<span className="text-xs text-gray-600 dark:text-gray-400">Certified</span>
								</div>
								<div className="text-center">
									<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
										<CheckCircle2 className="w-6 h-6 text-blue-600" />
									</div>
									<span className="text-xs text-gray-600 dark:text-gray-400">Verified</span>
								</div>
								<div className="text-center">
									<div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
										<Sparkles className="w-6 h-6 text-green-600" />
									</div>
									<span className="text-xs text-gray-600 dark:text-gray-400">Excellent</span>
								</div>
							</motion.div>

							{/* Message */}
							<motion.p
								className="text-sm text-gray-500 dark:text-gray-400"
								variants={childVariants}
							>
								Your building meets all safety standards for earthquake resistance.
								You can now download your certificate!
							</motion.p>

							{/* Auto-dismiss indicator */}
							<motion.div
								className="mt-4 text-xs text-gray-400"
								variants={childVariants}
							>
								This message will auto-dismiss in a few seconds
							</motion.div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default SuccessAnimation;