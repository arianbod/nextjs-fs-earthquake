import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useUserInput } from '@/context/UserInputContext';
import { Button } from '@/components/ui/button';
import {
	analyzeImagesWithAI,
	processBuildingPhotoAnalysis,
	prepareImageForAnalysis,
} from '@/lib/imageAnalysis';
import {
	Camera,
	X,
	Check,
	Sparkles,
	ArrowRight,
	Plus,
	Loader2,
	RotateCcw,
	Pencil,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

const AIPhotoStep = ({ userInput, updateUserInput, onNext, saveImagesToDb }) => {
	const t = useTranslations('Steps.aiPhoto');
	const pathname = usePathname();
	const locale = pathname?.startsWith('/tr') ? 'tr' : 'en';

	const { storeUploadedPhotos, saveAiPhotoAnalysisToDb, saveTitleAndDescription } = useUserInput();
	const [images, setImages] = useState([]);
	const [analyzing, setAnalyzing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [results, setResults] = useState(null);
	const [error, setError] = useState(null);
	const [showCelebration, setShowCelebration] = useState(false);
	const [isRestoring, setIsRestoring] = useState(true);
	const [editableTitle, setEditableTitle] = useState('');
	const [editableDescription, setEditableDescription] = useState('');
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const fileRef = useRef(null);
	const cameraRef = useRef(null);

	// Restore from context
	useEffect(() => {
		if (userInput.uploadedPhotos?.length > 0 && images.length === 0 && isRestoring) {
			setImages(userInput.uploadedPhotos.map(p => ({ ...p, url: p.base64 })));
			if (userInput.aiAnalysisComplete && userInput.aiAnalysisData) {
				setResults(userInput.aiAnalysisData);
			}
		}
		setIsRestoring(false);
	}, [userInput.uploadedPhotos, userInput.aiAnalysisComplete, userInput.aiAnalysisData]);

	// Sync to context
	useEffect(() => {
		if (!isRestoring && images.length > 0) {
			storeUploadedPhotos(images.map(img => ({
				id: img.id, base64: img.base64 || img.url, name: img.name,
				size: img.size, type: img.type, analyzed: img.analyzed || false,
			})));
		}
	}, [images, isRestoring, storeUploadedPhotos]);

	const toBase64 = (file) => new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});

	const handleUpload = useCallback(async (files) => {
		setError(null);
		const valid = Array.from(files).filter(f =>
			f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024
		).slice(0, 10 - images.length);

		const newImages = await Promise.all(valid.map(async (file) => ({
			id: Math.random().toString(36).substr(2, 9),
			file, base64: await toBase64(file), url: await toBase64(file),
			name: file.name, size: file.size, type: file.type, analyzed: false,
		})));

		setImages(prev => [...prev, ...newImages]);

		if (saveImagesToDb && userInput.assessmentId && newImages.length > 0) {
			try {
				await saveImagesToDb(newImages.map(img => ({
					imageData: img.base64, mimeType: img.type || 'image/jpeg',
					fileName: img.name, fileSize: img.size, analyzed: false,
				})), 'USER_UPLOAD');
			} catch (e) { console.error('DB save failed:', e); }
		}
	}, [images.length, saveImagesToDb, userInput.assessmentId]);

	const analyze = async () => {
		if (images.length === 0) return;
		setAnalyzing(true);
		setProgress(0);
		setResults(null);
		setError(null);

		try {
			setProgress(20);
			const prepared = await Promise.all(images.map(img => prepareImageForAnalysis(img.file)));
			setProgress(40);
			const result = await analyzeImagesWithAI(prepared, 'building');
			setProgress(80);

			if (!result?.analysis) throw new Error('Analysis failed');

			const processed = processBuildingPhotoAnalysis(result);
			setProgress(100);
			setResults(processed);
			setShowCelebration(true);
			setImages(prev => prev.map(img => ({ ...img, analyzed: true })));

			// Set editable title and description from AI suggestions
			if (processed?.suggestedTitle) {
				setEditableTitle(processed.suggestedTitle);
			}
			if (processed?.suggestedDescription) {
				setEditableDescription(processed.suggestedDescription);
			}

			if (processed) {
				let stories = processed.buildingCharacteristics?.stories;
				if (typeof stories === 'string') stories = parseInt(stories) || null;

				updateUserInput({
					aiAnalysisData: processed, aiAnalysisComplete: true,
					numberOfStories: stories,
					structuralSystem: processed.buildingCharacteristics?.structuralSystem || null,
					buildingType: processed.buildingCharacteristics?.type || null,
					materialCondition: processed.buildingCharacteristics?.materialCondition || null,
					constructionPeriod: processed.buildingCharacteristics?.constructionPeriod || null,
				});

				if (saveAiPhotoAnalysisToDb) {
					try { await saveAiPhotoAnalysisToDb(processed); } catch (e) { console.error(e); }
				}
			}

			setTimeout(() => setShowCelebration(false), 2500);
		} catch (err) {
			setError(err.message || 'Analysis failed');
			setResults(null);
		} finally {
			setAnalyzing(false);
		}
	};

	const skip = () => {
		updateUserInput({ aiAnalysisData: null, aiAnalysisComplete: false });
		onNext();
	};

	const hasPhotos = images.length > 0;
	const isComplete = results && !results.error;

	// Celebration burst
	const Celebration = () => (
		<AnimatePresence>
			{showCelebration && (
				<div className="fixed inset-0 pointer-events-none z-50">
					{[...Array(40)].map((_, i) => (
						<motion.div
							key={i}
							initial={{ x: '50vw', y: '50vh', scale: 0 }}
							animate={{
								x: `${50 + (Math.random() - 0.5) * 100}vw`,
								y: `${50 + (Math.random() - 0.5) * 100}vh`,
								scale: [0, 1.5, 0],
								rotate: Math.random() * 720,
							}}
							transition={{ duration: 1.2 + Math.random() * 0.5, ease: "easeOut" }}
							className={`absolute w-2 h-2 rounded-full ${
								['bg-emerald-400', 'bg-blue-400', 'bg-violet-400', 'bg-amber-400', 'bg-rose-400'][i % 5]
							}`}
						/>
					))}
				</div>
			)}
		</AnimatePresence>
	);

	return (
		<div className="min-h-[60vh] flex flex-col">
			<Celebration />

			{/* Hidden inputs */}
			<input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
				onChange={(e) => handleUpload(e.target.files)} />
			<input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
				onChange={(e) => handleUpload(e.target.files)} />

			{/* EMPTY STATE - Big bold camera */}
			{!hasPhotos && !analyzing && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex-1 flex flex-col items-center justify-center px-4"
				>
					<motion.button
						onClick={() => cameraRef.current?.click()}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="relative mb-8 group"
					>
						{/* Pulsing rings */}
						<motion.div
							animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
							transition={{ duration: 2, repeat: Infinity }}
							className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
						/>
						<motion.div
							animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
							transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
							className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
						/>
						{/* Main button */}
						<div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
							<Camera className="w-14 h-14 text-white" />
						</div>
					</motion.button>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
					>
						{t('snapBuilding')}
					</motion.h1>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="text-gray-500 dark:text-gray-400 mb-8"
					>
						{t('aiDetectsEverything')}
					</motion.p>

					<motion.button
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						onClick={() => fileRef.current?.click()}
						className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
					>
						{t('uploadFromGallery')}
					</motion.button>

					<motion.button
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
						onClick={skip}
						className="text-xs text-gray-400 hover:text-gray-600"
					>
						{t('skipForNow')}
					</motion.button>
				</motion.div>
			)}

			{/* PHOTOS STATE */}
			{hasPhotos && !analyzing && !isComplete && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex-1 flex flex-col p-4"
				>
					{/* Photo grid */}
					<div className="grid grid-cols-3 gap-2 mb-6">
						{images.map((img, i) => (
							<motion.div
								key={img.id}
								initial={{ scale: 0, rotate: -10 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={{ delay: i * 0.05, type: "spring", stiffness: 400 }}
								className="relative aspect-square rounded-2xl overflow-hidden group"
							>
								<img src={img.url} alt="" className="w-full h-full object-cover" />
								<button
									onClick={() => setImages(prev => prev.filter(p => p.id !== img.id))}
									className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
								>
									<X className="w-3 h-3 text-white" />
								</button>
							</motion.div>
						))}
						{images.length < 10 && (
							<motion.button
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => fileRef.current?.click()}
								className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-violet-400 flex items-center justify-center transition-colors"
							>
								<Plus className="w-8 h-8 text-gray-400" />
							</motion.button>
						)}
					</div>

					{/* Analyze button */}
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="mt-auto"
					>
						<Button
							onClick={analyze}
							size="lg"
							className="w-full h-14 text-lg gap-3 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-600 hover:opacity-90 shadow-xl shadow-violet-500/25"
						>
							<Sparkles className="w-5 h-5" />
							{t('analyzeWithAI')}
						</Button>
					</motion.div>
				</motion.div>
			)}

			{/* ANALYZING STATE */}
			{analyzing && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex-1 flex flex-col items-center justify-center p-4"
				>
					{/* Scanning animation over photos */}
					<div className="relative w-full max-w-xs mb-8">
						<div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
							{images.slice(0, 6).map((img) => (
								<div key={img.id} className="aspect-square relative overflow-hidden">
									<img src={img.url} alt="" className="w-full h-full object-cover" />
								</div>
							))}
						</div>
						{/* Scan line */}
						<motion.div
							animate={{ top: ['0%', '100%', '0%'] }}
							transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
							className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-lg shadow-violet-400"
							style={{ filter: 'blur(2px)' }}
						/>
						{/* Glow overlay */}
						<motion.div
							animate={{ opacity: [0.1, 0.3, 0.1] }}
							transition={{ duration: 1.5, repeat: Infinity }}
							className="absolute inset-0 bg-gradient-to-b from-violet-500/20 to-blue-500/20 rounded-2xl"
						/>
					</div>

					<motion.div
						animate={{ scale: [1, 1.1, 1] }}
						transition={{ duration: 1, repeat: Infinity }}
						className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-4"
					>
						<Loader2 className="w-5 h-5 animate-spin" />
						<span className="font-medium">{t('analyzing')}</span>
					</motion.div>

					{/* Progress bar */}
					<div className="w-full max-w-xs h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
						<motion.div
							className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
							initial={{ width: 0 }}
							animate={{ width: `${progress}%` }}
						/>
					</div>
				</motion.div>
			)}

			{/* COMPLETE STATE */}
			{isComplete && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex-1 flex flex-col p-4 overflow-y-auto"
				>
					{/* Success header */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", stiffness: 300 }}
						className="flex items-center justify-center gap-3 mb-4"
					>
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
							<Check className="w-5 h-5 text-white" strokeWidth={3} />
						</div>
						<span className="text-lg font-bold text-gray-900 dark:text-white">{t('analysisComplete')}</span>
					</motion.div>

					{/* Editable Title & Description */}
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.15 }}
						className="mb-4"
					>
						<div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800"
						>
							<div className="flex items-center gap-2 mb-3">
								<Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								<span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('nameAssessment')}</span>
							</div>

							<Input
								value={editableTitle}
								onChange={(e) => setEditableTitle(e.target.value)}
								placeholder={t('titlePlaceholder')}
								className="mb-2 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 focus:border-blue-400"
							/>

							<Textarea
								value={editableDescription}
								onChange={(e) => setEditableDescription(e.target.value)}
								placeholder={t('descriptionPlaceholder')}
								rows={2}
								className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 focus:border-blue-400 resize-none text-sm"
							/>

							<p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2">
								{t('aiSuggestedTitle')}
							</p>
						</div>
					</motion.div>

					{/* Results card */}
					<motion.div
						initial={{ y: 40, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2 }}
						className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 mb-4"
					>
						<div className="grid grid-cols-2 gap-3">
							<ResultItem
								label={t('stories')}
								value={results?.buildingCharacteristics?.stories || '?'}
								large
							/>
							<ResultItem
								label={t('type')}
								value={results?.buildingCharacteristics?.type?.split(' ')[0] || '?'}
							/>
							<ResultItem
								label={t('era')}
								value={results?.buildingCharacteristics?.constructionPeriod || '?'}
							/>
							<ResultItem
								label={t('condition')}
								value={results?.buildingCharacteristics?.materialCondition || '?'}
							/>
						</div>
					</motion.div>

					{/* Actions */}
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="mt-auto space-y-3"
					>
						<Button
							onClick={async () => {
								// Save title/description to database before continuing
								if (editableTitle || editableDescription) {
									updateUserInput({
										title: editableTitle || undefined,
										description: editableDescription || undefined,
									});
									// Also persist to database
									await saveTitleAndDescription(editableTitle, editableDescription);
								}
								onNext();
							}}
							size="lg"
							className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:opacity-90 shadow-xl shadow-emerald-500/25"
						>
							{t('continue')}
							<ArrowRight className="w-5 h-5" />
						</Button>
						<button
							onClick={() => { setResults(null); setImages(prev => prev.map(img => ({ ...img, analyzed: false }))); }}
							className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center gap-1.5"
						>
							<RotateCcw className="w-3.5 h-3.5" />
							{t('reAnalyze')}
						</button>
					</motion.div>
				</motion.div>
			)}

			{/* ERROR STATE */}
			{error && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mx-4 mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800"
				>
					<p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
					<div className="flex gap-2">
						<Button size="sm" variant="outline" onClick={() => setError(null)}>
							{t('tryAgain')}
						</Button>
						<Button size="sm" variant="ghost" onClick={skip}>
							{t('skip')}
						</Button>
					</div>
				</motion.div>
			)}

			{/* Minimal footer nav */}
			{!analyzing && (
				<div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 dark:border-gray-800">
					<Link href={`/${locale}/assessment/2`} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
						{t('back')}
					</Link>
					{!isComplete && hasPhotos && (
						<button onClick={skip} className="text-sm text-gray-400 hover:text-gray-600">
							{t('skip')}
						</button>
					)}
				</div>
			)}
		</div>
	);
};

// Simple result item component
const ResultItem = ({ label, value, large }) => (
	<div className="text-center">
		<div className={`font-bold text-gray-900 dark:text-white ${large ? 'text-3xl' : 'text-lg'} capitalize`}>
			{value}
		</div>
		<div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
	</div>
);

export default AIPhotoStep;
