'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	X,
	Copy,
	Check,
	Facebook,
	Twitter,
	Linkedin,
	MessageCircle,
	Mail,
	QrCode,
	Download,
	Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import QRCode from 'qrcode';

/**
 * ShareModal - Social sharing modal with QR code
 * Enables users to share their assessment results via multiple channels
 */
export function ShareModal({
	isOpen,
	onClose,
	assessmentId,
	score,
	buildingName
}) {
	const t = useTranslations('Share');
	const [copied, setCopied] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState('');
	const canvasRef = useRef(null);

	const shareUrl = typeof window !== 'undefined'
		? `${window.location.origin}/result/${assessmentId}`
		: '';

	const shareTitle = buildingName
		? t('shareTitle', { building: buildingName })
		: t('shareTitleGeneric');

	const shareText = t('shareText', { score: Math.round(score || 0) });

	// Generate QR code
	useEffect(() => {
		if (isOpen && shareUrl) {
			QRCode.toDataURL(shareUrl, {
				width: 200,
				margin: 2,
				color: {
					dark: '#1f2937',
					light: '#ffffff'
				}
			}).then(setQrCodeUrl).catch(console.error);
		}
	}, [isOpen, shareUrl]);

	// Copy link to clipboard
	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	// Download QR code
	const downloadQrCode = () => {
		if (qrCodeUrl) {
			const link = document.createElement('a');
			link.download = `quakewise-qr-${assessmentId}.png`;
			link.href = qrCodeUrl;
			link.click();
		}
	};

	// Share via Web Share API (mobile)
	const nativeShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: shareTitle,
					text: shareText,
					url: shareUrl
				});
			} catch (err) {
				if (err.name !== 'AbortError') {
					console.error('Share failed:', err);
				}
			}
		}
	};

	// Social share URLs
	const socialLinks = {
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
		twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
		whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
		email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
	};

	const openSocialLink = (platform) => {
		window.open(socialLinks[platform], '_blank', 'width=600,height=400');
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
							<Share2 className="w-5 h-5 text-violet-500" />
							{t('shareResults')}
						</h2>
						<button
							onClick={onClose}
							className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>

					{/* Content */}
					<div className="p-6 space-y-6">
						{/* Copy Link Section */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								{t('shareLink')}
							</label>
							<div className="flex gap-2">
								<input
									type="text"
									value={shareUrl}
									readOnly
									className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 truncate"
								/>
								<Button
									onClick={copyLink}
									variant="outline"
									size="sm"
									className={copied ? 'bg-green-50 border-green-500 text-green-600' : ''}
								>
									{copied ? (
										<Check className="w-4 h-4" />
									) : (
										<Copy className="w-4 h-4" />
									)}
								</Button>
							</div>
						</div>

						{/* Social Buttons */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
								{t('shareOn')}
							</label>
							<div className="grid grid-cols-5 gap-3">
								<SocialButton
									icon={Facebook}
									color="bg-[#1877F2]"
									label="Facebook"
									onClick={() => openSocialLink('facebook')}
								/>
								<SocialButton
									icon={Twitter}
									color="bg-[#1DA1F2]"
									label="Twitter"
									onClick={() => openSocialLink('twitter')}
								/>
								<SocialButton
									icon={Linkedin}
									color="bg-[#0A66C2]"
									label="LinkedIn"
									onClick={() => openSocialLink('linkedin')}
								/>
								<SocialButton
									icon={MessageCircle}
									color="bg-[#25D366]"
									label="WhatsApp"
									onClick={() => openSocialLink('whatsapp')}
								/>
								<SocialButton
									icon={Mail}
									color="bg-gray-600"
									label="Email"
									onClick={() => openSocialLink('email')}
								/>
							</div>
						</div>

						{/* Native Share Button (mobile) */}
						{typeof navigator !== 'undefined' && navigator.share && (
							<Button
								onClick={nativeShare}
								className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600"
							>
								<Share2 className="w-4 h-4" />
								{t('shareViaDevice')}
							</Button>
						)}

						{/* QR Code Section */}
						<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
							<div className="flex items-center justify-between mb-3">
								<label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
									<QrCode className="w-4 h-4" />
									{t('qrCode')}
								</label>
								<Button
									onClick={downloadQrCode}
									variant="ghost"
									size="sm"
									className="gap-1 text-xs"
								>
									<Download className="w-3 h-3" />
									{t('download')}
								</Button>
							</div>
							<div className="flex justify-center p-4 bg-white rounded-lg border border-gray-200">
								{qrCodeUrl ? (
									<img
										src={qrCodeUrl}
										alt="QR Code"
										className="w-40 h-40"
									/>
								) : (
									<div className="w-40 h-40 bg-gray-100 animate-pulse rounded" />
								)}
							</div>
							<p className="text-xs text-center text-gray-500 mt-2">
								{t('qrCodeHint')}
							</p>
						</div>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

// Social button component
const SocialButton = ({ icon: Icon, color, label, onClick }) => (
	<button
		onClick={onClick}
		className={`${color} p-3 rounded-xl text-white hover:opacity-90 transition-opacity flex items-center justify-center`}
		title={label}
	>
		<Icon className="w-5 h-5" />
	</button>
);

export default ShareModal;
