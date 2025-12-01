'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	X,
	Mail,
	Send,
	CheckCircle2,
	AlertCircle,
	Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

/**
 * EmailReportModal - Send assessment report via email
 * Allows users to email their results to themselves or others
 */
export function EmailReportModal({
	isOpen,
	onClose,
	assessmentId,
	score,
	buildingName
}) {
	const t = useTranslations('Email');
	const [email, setEmail] = useState('');
	const [additionalEmails, setAdditionalEmails] = useState('');
	const [includeDetails, setIncludeDetails] = useState(true);
	const [includePdf, setIncludePdf] = useState(true);
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState(null);

	const handleSend = async () => {
		if (!email) {
			setError(t('emailRequired'));
			return;
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError(t('invalidEmail'));
			return;
		}

		setSending(true);
		setError(null);

		try {
			// Parse additional emails
			const recipients = [email];
			if (additionalEmails) {
				const extras = additionalEmails.split(',').map(e => e.trim()).filter(e => emailRegex.test(e));
				recipients.push(...extras);
			}

			// Send email via API
			const response = await fetch('/api/email/send-report', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					recipients,
					assessmentId,
					includeDetails,
					includePdf,
					buildingName,
					score
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to send email');
			}

			setSent(true);
			setTimeout(() => {
				onClose();
				setSent(false);
				setEmail('');
				setAdditionalEmails('');
			}, 2000);
		} catch (err) {
			console.error('Email send error:', err);
			setError(t('sendFailed'));
		} finally {
			setSending(false);
		}
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
				onClick={onClose}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 20 }}
					className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
							<Mail className="w-5 h-5 text-violet-500" />
							{t('emailReport')}
						</h2>
						<button
							onClick={onClose}
							className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>

					{/* Content */}
					<div className="p-6 space-y-4">
						{sent ? (
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								className="py-8 text-center"
							>
								<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
									<CheckCircle2 className="w-8 h-8 text-green-500" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
									{t('emailSent')}
								</h3>
								<p className="text-gray-500 dark:text-gray-400">
									{t('emailSentDescription')}
								</p>
							</motion.div>
						) : (
							<>
								{/* Primary Email */}
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										{t('yourEmail')} *
									</label>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
										className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
									/>
								</div>

								{/* Additional Emails */}
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										{t('additionalEmails')}
									</label>
									<input
										type="text"
										value={additionalEmails}
										onChange={(e) => setAdditionalEmails(e.target.value)}
										placeholder="family@example.com, friend@example.com"
										className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
									/>
									<p className="text-xs text-gray-500 mt-1">{t('separateByComma')}</p>
								</div>

								{/* Options */}
								<div className="space-y-3">
									<label className="flex items-center gap-3 cursor-pointer">
										<input
											type="checkbox"
											checked={includeDetails}
											onChange={(e) => setIncludeDetails(e.target.checked)}
											className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
										/>
										<span className="text-sm text-gray-700 dark:text-gray-300">
											{t('includeDetails')}
										</span>
									</label>
									<label className="flex items-center gap-3 cursor-pointer">
										<input
											type="checkbox"
											checked={includePdf}
											onChange={(e) => setIncludePdf(e.target.checked)}
											className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
										/>
										<span className="text-sm text-gray-700 dark:text-gray-300">
											{t('includePdf')}
										</span>
									</label>
								</div>

								{/* Error Message */}
								{error && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm"
									>
										<AlertCircle className="w-4 h-4 flex-shrink-0" />
										{error}
									</motion.div>
								)}

								{/* Send Button */}
								<Button
									onClick={handleSend}
									disabled={sending || !email}
									className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 gap-2"
								>
									{sending ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											{t('sending')}
										</>
									) : (
										<>
											<Send className="w-4 h-4" />
											{t('sendReport')}
										</>
									)}
								</Button>

								{/* Preview Note */}
								<p className="text-xs text-center text-gray-500">
									{t('reportIncludesScore', { score: Math.round(score || 0) })}
								</p>
							</>
						)}
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

export default EmailReportModal;
