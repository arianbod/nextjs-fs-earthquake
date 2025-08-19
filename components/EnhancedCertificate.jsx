// components/EnhancedCertificate.jsx
import React, { useState, useEffect } from 'react';
import Data from '@/utils/Data.json';
import { Shield, CheckCircle2, Calendar, Building, MapPin, Award, QrCode, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EnhancedCertificate = ({ score, userInput }) => {
	const [selectedLanguage, setSelectedLanguage] = useState('tr');

	// Load saved language from localStorage
	useEffect(() => {
		const savedLanguage = localStorage.getItem('certificateLanguage');
		if (savedLanguage) {
			setSelectedLanguage(savedLanguage);
		}
	}, []);

	// Save language to localStorage
	const handleLanguageChange = (language) => {
		setSelectedLanguage(language);
		localStorage.setItem('certificateLanguage', language);
	};

	const getValue = (key) => {
		const lowerKey = key.toLowerCase();
		return userInput[key] || userInput[lowerKey] || 'N/A';
	};

	// Current date formatting
	const currentDate = new Date();
	const formattedDate = new Intl.DateTimeFormat(selectedLanguage === 'tr' ? 'tr-TR' : 'en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(currentDate);

	// Certificate number generation
	const certificateNumber = `QW-${currentDate.getFullYear()}-${Math.floor(
		Math.random() * 100000
	)
		.toString()
		.padStart(5, '0')}`;

	// Multi-language translations
	const translations = {
		tr: {
			universityName: "ANTALYA BİLİM ÜNİVERSİTESİ",
			department: "İnşaat Mühendisliği Bölümü",
			certificateTitle: "Deprem Güvenliği Performans Sertifikası",
			maxSafeMagnitude: "Maksimum Güvenli Büyüklük",
			buildingSafeUpTo: "Bina Güvenli Sınır:",
			richter: "Richter",
			certificationText: "Bu sertifika, ",
			locationText: " konumunda bulunan binanın QuakeWise değerlendirme sistemi tarafından kapsamlı olarak analiz edildiğini onaylar.",
			assessmentResults: "Değerlendirme Sonuçları",
			overallSafetyScore: "Genel Güvenlik Skoru:",
			structuralIntegrity: "Yapısal Bütünlük:",
			earthquakeImpact: "Deprem Etkisi:",
			buildingType: "Bina Tipi:",
			typeOfEarthquake: "Deprem Tipi:",
			soilType: "Zemin Tipi:",
			designRegulation: "Tasarım Yönetmeliği:",
			numberOfStories: "Kat Sayısı:",
			professionalInterpretation: "Profesyonel Değerlendirme",
			certificateNumber: "Sertifika Numarası:",
			dateOfIssuance: "Düzenleme Tarihi:",
			validUntil: "Geçerlilik Süresi:",
			assessedBy: "Değerlendiren:",
			verifiedBy: "Onaylayan:",
			authorizedSignature: "Yetkili İmza",
			officialSeal: "QuakeWise Resmi Mührü",
			disclaimer1: "Bu sertifika sağlanan bilgilere dayanmaktadır ve genel bir değerlendirme niteliğindedir.",
			disclaimer2: "Kapsamlı yapısal analiz için lütfen lisanslı bir inşaat mühendisi ile görüşün."
		},
		en: {
			universityName: "ANTALYA BILIM UNIVERSITY",
			department: "Department of Structural Engineering",
			certificateTitle: "Earthquake Safety Performance Certificate",
			maxSafeMagnitude: "Maximum Safe Magnitude",
			buildingSafeUpTo: "Building Safe Up To:",
			richter: "Richter",
			certificationText: "This is to certify that the building located at ",
			locationText: " has been thoroughly analyzed by the QuakeWise assessment system.",
			assessmentResults: "Assessment Results",
			overallSafetyScore: "Overall Safety Score:",
			structuralIntegrity: "Structural Integrity:",
			earthquakeImpact: "Earthquake Impact:",
			buildingType: "Building Type:",
			typeOfEarthquake: "Type of Earthquake:",
			soilType: "Soil Type:",
			designRegulation: "Design Regulation:",
			numberOfStories: "Number of Stories:",
			professionalInterpretation: "Professional Interpretation",
			certificateNumber: "Certificate Number:",
			dateOfIssuance: "Date of Issuance:",
			validUntil: "Valid Until:",
			assessedBy: "Assessed By:",
			verifiedBy: "Verified By:",
			authorizedSignature: "Authorized Signature",
			officialSeal: "Official Seal of QuakeWise",
			disclaimer1: "This certificate is based on the information provided and serves as a general assessment.",
			disclaimer2: "For a comprehensive structural analysis, please consult with a licensed professional engineer."
		},
		de: {
			universityName: "ANTALYA BILIM UNIVERSITÄT",
			department: "Abteilung für Bauingenieurwesen",
			certificateTitle: "Erdbebensicherheits-Leistungszertifikat",
			maxSafeMagnitude: "Maximale Sichere Stärke",
			buildingSafeUpTo: "Gebäude Sicher Bis:",
			richter: "Richter",
			certificationText: "Hiermit wird bescheinigt, dass das Gebäude am Standort ",
			locationText: " durch das QuakeWise-Bewertungssystem gründlich analysiert wurde.",
			assessmentResults: "Bewertungsergebnisse",
			overallSafetyScore: "Gesamtsicherheitswert:",
			structuralIntegrity: "Strukturelle Integrität:",
			earthquakeImpact: "Erdbebenauswirkung:",
			buildingType: "Gebäudetyp:",
			typeOfEarthquake: "Art des Erdbebens:",
			soilType: "Bodentyp:",
			designRegulation: "Entwurfsverordnung:",
			numberOfStories: "Anzahl der Stockwerke:",
			professionalInterpretation: "Professionelle Interpretation",
			certificateNumber: "Zertifikatsnummer:",
			dateOfIssuance: "Ausstellungsdatum:",
			validUntil: "Gültig bis:",
			assessedBy: "Bewertet von:",
			verifiedBy: "Verifiziert von:",
			authorizedSignature: "Autorisierte Unterschrift",
			officialSeal: "Offizielles Siegel von QuakeWise",
			disclaimer1: "Dieses Zertifikat basiert auf den bereitgestellten Informationen und dient als allgemeine Bewertung.",
			disclaimer2: "Für eine umfassende strukturelle Analyse wenden Sie sich bitte an einen lizenzierten Bauingenieur."
		},
		ru: {
			universityName: "УНИВЕРСИТЕТ АНТАЛИЯ БИЛИМ",
			department: "Факультет Строительной Инженерии",
			certificateTitle: "Сертификат Сейсмической Безопасности",
			maxSafeMagnitude: "Максимальная Безопасная Магнитуда",
			buildingSafeUpTo: "Здание Безопасно До:",
			richter: "Рихтер",
			certificationText: "Настоящим удостоверяется, что здание, расположенное по адресу ",
			locationText: ", было тщательно проанализировано системой оценки QuakeWise.",
			assessmentResults: "Результаты Оценки",
			overallSafetyScore: "Общий Показатель Безопасности:",
			structuralIntegrity: "Структурная Целостность:",
			earthquakeImpact: "Воздействие Землетрясения:",
			buildingType: "Тип Здания:",
			typeOfEarthquake: "Тип Землетрясения:",
			soilType: "Тип Почвы:",
			designRegulation: "Проектные Нормы:",
			numberOfStories: "Количество Этажей:",
			professionalInterpretation: "Профессиональная Интерпретация",
			certificateNumber: "Номер Сертификата:",
			dateOfIssuance: "Дата Выдачи:",
			validUntil: "Действителен До:",
			assessedBy: "Оценено:",
			verifiedBy: "Проверено:",
			authorizedSignature: "Авторизованная Подпись",
			officialSeal: "Официальная Печать QuakeWise",
			disclaimer1: "Данный сертификат основан на предоставленной информации и служит общей оценкой.",
			disclaimer2: "Для комплексного структурного анализа обратитесь к лицензированному инженеру-строителю."
		}
	};

	const t = translations[selectedLanguage] || translations.tr;

	return (
		<div className='bg-white print:bg-white border-8 border-double border-blue-600 p-8 max-w-3xl mx-auto rounded-lg shadow-lg certificate-container print:shadow-none'>
			{/* Language Toggle */}
			<div className='flex justify-center gap-2 mb-6 no-print'>
				<Languages className='w-5 h-5 text-blue-600 mr-2' />
				{['TR', 'EN', 'DE', 'RU'].map((lang) => (
					<Button
						key={lang}
						variant={selectedLanguage === lang.toLowerCase() ? 'default' : 'outline'}
						size='sm'
						onClick={() => handleLanguageChange(lang.toLowerCase())}
						className='px-3 py-1 text-xs'
					>
						{lang}
					</Button>
				))}
			</div>

			{/* Header */}
			<div className='text-center border-b-4 border-blue-600 pb-6 mb-6'>
				<div className='flex items-center justify-between mb-6'>
					{/* University Logo */}
					<div className="w-24 h-24 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
						<span className="text-xs text-gray-600">University Logo</span>
					</div>
					
					{/* Central Content */}
					<div className='flex-1 mx-6'>
						<h1 className='text-2xl font-bold text-blue-800 mb-2'>{t.universityName}</h1>
						<h2 className='text-lg text-blue-600 font-medium mb-3'>{t.department}</h2>
						<div className='flex items-center justify-center mb-2'>
							<Award className='w-8 h-8 text-blue-600 mr-3' />
							<h3 className='text-xl text-blue-800 font-bold'>{t.certificateTitle}</h3>
						</div>
					</div>

					{/* QR Code */}
					<div className="w-24 h-24 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
						<QrCode className="w-16 h-16 text-gray-600" />
					</div>
				</div>
			</div>

			{/* Maximum Safe Magnitude Box */}
			<div className='bg-blue-50 border-4 border-blue-200 rounded-xl p-6 mb-8 text-center'>
				<h3 className='text-2xl font-bold text-blue-800 mb-2'>{t.maxSafeMagnitude}</h3>
				<div className='bg-white border-2 border-blue-300 rounded-lg p-4 inline-block'>
					<p className='text-3xl font-bold text-blue-600'>{t.buildingSafeUpTo}</p>
					<p className='text-5xl font-bold text-green-600 mt-2'>5.5 {t.richter}</p>
				</div>
			</div>

			{/* Main Content */}
			<div className='space-y-6 mb-8'>
				<p className='text-center text-lg text-gray-700 mb-6'>
					{t.certificationText}
					<span className='font-semibold'>
						{userInput.location
							? `Latitude: ${userInput.location.latitude.toFixed(
									6
							  )}, Longitude: ${userInput.location.longitude.toFixed(6)}`
							: 'the specified location'}
					</span>
					{t.locationText}
				</p>

				{/* Assessment Results */}
				<div className='bg-gray-50 p-6 rounded-lg border border-gray-200'>
					<h3 className='text-xl font-bold text-gray-800 mb-4 flex items-center'>
						<CheckCircle2 className='w-6 h-6 text-green-600 mr-2' />
						{t.assessmentResults}
					</h3>
					<div className='grid md:grid-cols-2 gap-6'>
						<div>
							<div className='space-y-3'>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>{t.overallSafetyScore}</span>
									<span className='font-bold text-green-600'>
										{Number(score.overallScore || 0).toFixed(2)}%
									</span>
								</div>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>{t.structuralIntegrity}</span>
									<span className='font-semibold'>
										{Number(score.structuralIntegrity || 0).toFixed(2)}%
									</span>
								</div>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>{t.earthquakeImpact}</span>
									<span className='font-semibold'>
										{score.earthquakeImpact}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>{t.buildingType}</span>
									<span className='font-semibold'>{score.buildingType}</span>
								</div>
							</div>
						</div>
						<div>
							<div className='space-y-3'>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>{t.typeOfEarthquake}</span>
									<span className='font-semibold'>
										{getValue('typeOfEarthquake')}
									</span>
								</div>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>{t.soilType}</span>
									<span className='font-semibold'>
										{getValue('typeOfSoil')}
									</span>
								</div>
								<div className='flex justify-between items-center border-b pb-2'>
									<span className='text-gray-600'>{t.designRegulation}</span>
									<span className='font-semibold'>
										{getValue('designRegulation')}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-gray-600'>{t.numberOfStories}</span>
									<span className='font-semibold'>
										{getValue('numberOfStories')}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Interpretation */}
				<div className='bg-blue-50 p-6 rounded-lg border border-blue-200'>
					<h3 className='text-xl font-bold text-blue-800 mb-2'>
						{t.professionalInterpretation}
					</h3>
					<p className='text-blue-700'>{score.interpretation}</p>
				</div>
			</div>

			{/* Footer */}
			<div className='border-t-2 border-gray-200 pt-6'>
				<div className='flex flex-col sm:flex-row justify-between mb-6'>
					<div>
						<p className='text-gray-700'>
							<span className='font-semibold'>{t.certificateNumber}</span>{' '}
							{certificateNumber}
						</p>
						<p className='text-gray-700'>
							<span className='font-semibold'>{t.dateOfIssuance}</span>{' '}
							{formattedDate}
						</p>
						<p className='text-gray-700'>
							<span className='font-semibold'>{t.validUntil}</span>{' '}
							{new Date(
								new Date().setFullYear(new Date().getFullYear() + 2)
							).toLocaleDateString(selectedLanguage === 'tr' ? 'tr-TR' : 'en-US')}
						</p>
					</div>
					<div className='mt-4 sm:mt-0'>
						<p className='text-gray-700'>
							<span className='font-semibold'>{t.assessedBy}</span> QuakeWise AI
							Assessment System
						</p>
						<p className='text-gray-700'>
							<span className='font-semibold'>{t.verifiedBy}</span> Prof. Hamid F
							Ghatte
						</p>
					</div>
				</div>

				<div className='flex justify-between mt-8 pt-4 border-t border-gray-200'>
					<div>
						<div className='border-t-2 border-black pt-2 flex items-center'>
							<Shield className='w-5 h-5 mr-2 text-blue-700' />
							<span className='font-semibold'>{t.authorizedSignature}</span>
						</div>
					</div>
					<div>
						<div className='border-t-2 border-black pt-2 text-center'>
							<span className='font-semibold'>{t.officialSeal}</span>
						</div>
					</div>
				</div>

				<div className='mt-8 text-center text-xs text-gray-500'>
					<p>{t.disclaimer1}</p>
					<p>{t.disclaimer2}</p>
				</div>
			</div>

			{/* Print Styles */}
			<style jsx>{`
				@media print {
					.certificate-container {
						max-width: none !important;
						box-shadow: none !important;
						border-radius: 0 !important;
						margin: 0 !important;
						padding: 20mm !important;
						font-size: 12pt !important;
						page-break-after: always;
					}
					
					.no-print {
						display: none !important;
					}
					
					body {
						-webkit-print-color-adjust: exact !important;
						color-adjust: exact !important;
					}
					
					h1, h2, h3 {
						color: #1e40af !important;
					}
				}
			`}</style>
		</div>
	);
};

export default EnhancedCertificate;
