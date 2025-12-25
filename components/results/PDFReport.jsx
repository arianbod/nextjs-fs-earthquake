'use client';

import React from 'react';
import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	Image,
	Font,
	pdf
} from '@react-pdf/renderer';

// Register fonts (using default fonts for now)
Font.register({
	family: 'Roboto',
	fonts: [
		{ src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
		{ src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
	]
});

// Styles
const styles = StyleSheet.create({
	page: {
		flexDirection: 'column',
		backgroundColor: '#ffffff',
		padding: 40,
		fontFamily: 'Roboto',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 30,
		paddingBottom: 20,
		borderBottomWidth: 2,
		borderBottomColor: '#7C3AED',
	},
	logo: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	logoText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#7C3AED',
	},
	reportDate: {
		fontSize: 10,
		color: '#6B7280',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#1F2937',
		textAlign: 'center',
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 14,
		color: '#6B7280',
		textAlign: 'center',
		marginBottom: 30,
	},
	scoreSection: {
		alignItems: 'center',
		marginBottom: 30,
		padding: 20,
		backgroundColor: '#F3F4F6',
		borderRadius: 8,
	},
	scoreCircle: {
		width: 120,
		height: 120,
		borderRadius: 60,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10,
	},
	scoreText: {
		fontSize: 42,
		fontWeight: 'bold',
	},
	scoreLabel: {
		fontSize: 12,
		color: '#6B7280',
	},
	gradeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 10,
	},
	gradeBadge: {
		padding: '8 16',
		borderRadius: 20,
		marginRight: 10,
	},
	gradeText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#ffffff',
	},
	statusText: {
		fontSize: 14,
		color: '#374151',
	},
	section: {
		marginBottom: 25,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#1F2937',
		marginBottom: 12,
		paddingBottom: 6,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	infoGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	infoItem: {
		width: '50%',
		marginBottom: 10,
	},
	infoLabel: {
		fontSize: 10,
		color: '#6B7280',
		marginBottom: 2,
	},
	infoValue: {
		fontSize: 12,
		color: '#1F2937',
		fontWeight: 'bold',
	},
	findingRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 10,
		padding: 10,
		backgroundColor: '#F9FAFB',
		borderRadius: 6,
	},
	findingIndicator: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 10,
		marginTop: 4,
	},
	findingContent: {
		flex: 1,
	},
	findingText: {
		fontSize: 11,
		color: '#1F2937',
		marginBottom: 2,
	},
	findingDetail: {
		fontSize: 9,
		color: '#6B7280',
	},
	recommendation: {
		flexDirection: 'row',
		marginBottom: 8,
		padding: 10,
		borderLeftWidth: 3,
		borderLeftColor: '#7C3AED',
		backgroundColor: '#F5F3FF',
	},
	recommendationNumber: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#7C3AED',
		marginRight: 10,
	},
	recommendationText: {
		fontSize: 11,
		color: '#374151',
		flex: 1,
	},
	footer: {
		position: 'absolute',
		bottom: 30,
		left: 40,
		right: 40,
		textAlign: 'center',
		paddingTop: 15,
		borderTopWidth: 1,
		borderTopColor: '#E5E7EB',
	},
	footerText: {
		fontSize: 8,
		color: '#9CA3AF',
	},
	disclaimer: {
		marginTop: 20,
		padding: 15,
		backgroundColor: '#FEF3C7',
		borderRadius: 6,
	},
	disclaimerTitle: {
		fontSize: 10,
		fontWeight: 'bold',
		color: '#92400E',
		marginBottom: 5,
	},
	disclaimerText: {
		fontSize: 8,
		color: '#92400E',
		lineHeight: 1.4,
	},
	qrSection: {
		alignItems: 'center',
		marginTop: 20,
		padding: 15,
		backgroundColor: '#F3F4F6',
		borderRadius: 8,
	},
	qrLabel: {
		fontSize: 10,
		color: '#6B7280',
		marginBottom: 8,
	},
	qrPlaceholder: {
		width: 80,
		height: 80,
		backgroundColor: '#E5E7EB',
		borderRadius: 4,
	},
	onlineLink: {
		fontSize: 9,
		color: '#7C3AED',
		marginTop: 8,
	},
});

// Helper function to get grade (returns translation keys)
const getGrade = (score) => {
	if (score >= 90) return { letter: 'A', labelKey: 'excellent', color: '#10B981' };
	if (score >= 80) return { letter: 'B', labelKey: 'good', color: '#22C55E' };
	if (score >= 70) return { letter: 'C', labelKey: 'acceptable', color: '#EAB308' };
	if (score >= 60) return { letter: 'D', labelKey: 'needsWork', color: '#F97316' };
	return { letter: 'F', labelKey: 'atRisk', color: '#EF4444' };
};

// Generate findings based on user input and safety result (returns translation keys)
const generateFindings = (safetyResult, userInput) => {
	const findings = [];
	const score = parseFloat(safetyResult?.overallScore || 0);

	// Structural System
	const structuralScore = parseFloat(safetyResult?.structuralIntegrity || 0);
	findings.push({
		textKey: 'structuralSystem',
		textValue: userInput?.structuralSystem || 'Standard construction',
		detailKey: structuralScore >= 70 ? 'goodIntegrity' : 'needsReinforcement',
		type: structuralScore >= 70 ? 'positive' : structuralScore >= 50 ? 'warning' : 'negative'
	});

	// Building Age
	const yearBuilt = parseInt(userInput?.yearOfConstruction) || 0;
	const age = yearBuilt > 0 ? new Date().getFullYear() - yearBuilt : null;
	if (age !== null) {
		findings.push({
			textKey: 'builtIn',
			textValues: { year: yearBuilt, age },
			detailKey: age <= 20 ? 'modernConstruction' : age <= 40 ? 'needsSeismicUpdates' : 'olderConstruction',
			type: age <= 20 ? 'positive' : age <= 40 ? 'warning' : 'negative'
		});
	}

	// Stories
	const stories = parseInt(userInput?.numberOfStories) || 0;
	if (stories > 0) {
		findings.push({
			textKey: 'storyBuilding',
			textValues: { count: stories },
			detailKey: stories <= 3 ? 'lowerHeight' : stories <= 6 ? 'mediumRise' : 'higherNeedsStronger',
			type: stories <= 3 ? 'positive' : stories <= 6 ? 'neutral' : 'warning'
		});
	}

	// Earthquake Impact
	const impact = safetyResult?.earthquakeImpact || 'Unknown';
	findings.push({
		textKey: 'earthquakeImpact',
		textValue: impact,
		detailKey: impact === 'Low' ? 'minimalDamage' : impact === 'Moderate' ? 'someDamage' : 'highVulnerability',
		type: impact === 'Low' ? 'positive' : impact === 'Moderate' ? 'warning' : 'negative'
	});

	return findings.slice(0, 5);
};

// Get indicator color
const getIndicatorColor = (type) => {
	switch (type) {
		case 'positive': return '#10B981';
		case 'warning': return '#F59E0B';
		case 'negative': return '#EF4444';
		default: return '#6B7280';
	}
};

// PDF Document Component
const SafetyReportDocument = ({ safetyResult, userInput, assessmentId, locale = 'en', translations = {} }) => {
	const score = parseFloat(safetyResult?.overallScore || 0);
	const grade = getGrade(score);
	const isPassing = score >= 70;
	const findings = generateFindings(safetyResult, userInput);
	const reportDate = new Date().toLocaleDateString(locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	// Translation helper
	const t = (key, values) => {
		let text = translations[key] || key;
		if (values) {
			Object.keys(values).forEach(k => {
				text = text.replace(`{${k}}`, values[k]);
			});
		}
		return text;
	};

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.logo}>
						<Text style={styles.logoText}>QuakeWise</Text>
					</View>
					<Text style={styles.reportDate}>Report Generated: {reportDate}</Text>
				</View>

				{/* Title */}
				<Text style={styles.title}>{t('title')}</Text>
				<Text style={styles.subtitle}>
					{userInput?.address || userInput?.city || t('defaultTitle')}
				</Text>

				{/* Score Section */}
				<View style={styles.scoreSection}>
					<View style={[styles.scoreCircle, { backgroundColor: `${grade.color}20`, borderWidth: 4, borderColor: grade.color }]}>
						<Text style={[styles.scoreText, { color: grade.color }]}>{Math.round(score)}</Text>
						<Text style={styles.scoreLabel}>/100</Text>
					</View>
					<View style={styles.gradeRow}>
						<View style={[styles.gradeBadge, { backgroundColor: grade.color }]}>
							<Text style={styles.gradeText}>Grade {grade.letter}</Text>
						</View>
						<Text style={styles.statusText}>
							{isPassing ? t('buildingIsSafe') : t('needsAttention')}
						</Text>
					</View>
				</View>

				{/* Building Information */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t('buildingInfo')}</Text>
					<View style={styles.infoGrid}>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>{t('location')}</Text>
							<Text style={styles.infoValue}>{userInput?.city || t('notSpecified')}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>{t('seismicZone')}</Text>
							<Text style={styles.infoValue}>{userInput?.seismicZone || t('notSpecified')}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>{t('numberOfStories')}</Text>
							<Text style={styles.infoValue}>{userInput?.numberOfStories || t('notSpecified')}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>{t('yearBuilt')}</Text>
							<Text style={styles.infoValue}>{userInput?.yearOfConstruction || t('notSpecified')}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>{t('structuralSystem')}</Text>
							<Text style={styles.infoValue}>{userInput?.structuralSystem || t('notSpecified')}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>{t('soilType')}</Text>
							<Text style={styles.infoValue}>{userInput?.soilType || t('notSpecified')}</Text>
						</View>
					</View>
				</View>

				{/* Key Findings */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t('keyFindings')}</Text>
					{findings.map((finding, index) => {
						const text = finding.textValue ?
							t(finding.textKey) + ' ' + finding.textValue :
							t(finding.textKey, finding.textValues);
						return (
							<View key={index} style={styles.findingRow}>
								<View style={[styles.findingIndicator, { backgroundColor: getIndicatorColor(finding.type) }]} />
								<View style={styles.findingContent}>
									<Text style={styles.findingText}>{text}</Text>
									<Text style={styles.findingDetail}>{t(finding.detailKey)}</Text>
								</View>
							</View>
						);
					})}
				</View>

				{/* Recommendations */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{t('recommendations')}</Text>
					{isPassing ? (
						<>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>1.</Text>
								<Text style={styles.recommendationText}>{t('rec1Pass')}</Text>
							</View>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>2.</Text>
								<Text style={styles.recommendationText}>{t('rec2Pass')}</Text>
							</View>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>3.</Text>
								<Text style={styles.recommendationText}>{t('rec3Pass')}</Text>
							</View>
						</>
					) : (
						<>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>1.</Text>
								<Text style={styles.recommendationText}>{t('rec1Fail')}</Text>
							</View>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>2.</Text>
								<Text style={styles.recommendationText}>{t('rec2Fail')}</Text>
							</View>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>3.</Text>
								<Text style={styles.recommendationText}>{t('rec3Fail')}</Text>
							</View>
						</>
					)}
				</View>

				{/* View Online */}
				{assessmentId && assessmentId !== 'preview' && (
					<View style={styles.qrSection}>
						<Text style={styles.qrLabel}>{t('viewOnline')}</Text>
						<Text style={styles.onlineLink}>quakewise.com/result/{assessmentId}</Text>
					</View>
				)}

				{/* Disclaimer */}
				<View style={styles.disclaimer}>
					<Text style={styles.disclaimerTitle}>{t('disclaimerTitle')}</Text>
					<Text style={styles.disclaimerText}>
						{t('disclaimerText')}
					</Text>
				</View>

				{/* Footer */}
				<View style={styles.footer}>
					<Text style={styles.footerText}>
						{t('footerGenerated')}
					</Text>
					<Text style={styles.footerText}>
						quakewise.com | {t('assessmentId')}: {assessmentId || 'N/A'}
					</Text>
				</View>
			</Page>
		</Document>
	);
};

// Export function to generate and download PDF
export const generatePDF = async (safetyResult, userInput, assessmentId) => {
	const blob = await pdf(
		<SafetyReportDocument
			safetyResult={safetyResult}
			userInput={userInput}
			assessmentId={assessmentId}
		/>
	).toBlob();

	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `quakewise-report-${assessmentId || 'assessment'}.pdf`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export default SafetyReportDocument;
