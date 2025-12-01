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

// Helper function to get grade
const getGrade = (score) => {
	if (score >= 90) return { letter: 'A', label: 'Excellent', color: '#10B981' };
	if (score >= 80) return { letter: 'B', label: 'Good', color: '#22C55E' };
	if (score >= 70) return { letter: 'C', label: 'Acceptable', color: '#EAB308' };
	if (score >= 60) return { letter: 'D', label: 'Needs Work', color: '#F97316' };
	return { letter: 'F', label: 'At Risk', color: '#EF4444' };
};

// Generate findings based on user input and safety result
const generateFindings = (safetyResult, userInput) => {
	const findings = [];
	const score = parseFloat(safetyResult?.overallScore || 0);

	// Structural System
	const structuralScore = parseFloat(safetyResult?.structuralIntegrity || 0);
	findings.push({
		text: `Structural System: ${userInput?.structuralSystem || 'Standard construction'}`,
		detail: structuralScore >= 70 ? 'Good structural integrity' : 'May need reinforcement',
		type: structuralScore >= 70 ? 'positive' : structuralScore >= 50 ? 'warning' : 'negative'
	});

	// Building Age
	const yearBuilt = parseInt(userInput?.yearOfConstruction) || 0;
	const age = yearBuilt > 0 ? new Date().getFullYear() - yearBuilt : null;
	if (age !== null) {
		findings.push({
			text: `Built in ${yearBuilt} (${age} years old)`,
			detail: age <= 20 ? 'Modern construction standards' : age <= 40 ? 'May need seismic updates' : 'Older construction, consider evaluation',
			type: age <= 20 ? 'positive' : age <= 40 ? 'warning' : 'negative'
		});
	}

	// Stories
	const stories = parseInt(userInput?.numberOfStories) || 0;
	if (stories > 0) {
		findings.push({
			text: `${stories} story building`,
			detail: stories <= 3 ? 'Lower height reduces seismic risk' : stories <= 6 ? 'Medium-rise building' : 'Higher buildings need stronger foundations',
			type: stories <= 3 ? 'positive' : stories <= 6 ? 'neutral' : 'warning'
		});
	}

	// Earthquake Impact
	const impact = safetyResult?.earthquakeImpact || 'Unknown';
	findings.push({
		text: `Earthquake Impact: ${impact}`,
		detail: impact === 'Low' ? 'Minimal expected damage' : impact === 'Moderate' ? 'Some damage possible' : 'Higher vulnerability',
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
const SafetyReportDocument = ({ safetyResult, userInput, assessmentId }) => {
	const score = parseFloat(safetyResult?.overallScore || 0);
	const grade = getGrade(score);
	const isPassing = score >= 70;
	const findings = generateFindings(safetyResult, userInput);
	const reportDate = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

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
				<Text style={styles.title}>Earthquake Safety Assessment Report</Text>
				<Text style={styles.subtitle}>
					{userInput?.address || userInput?.city || 'Building Assessment'}
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
							{isPassing ? 'Building is Safe' : 'Needs Attention'}
						</Text>
					</View>
				</View>

				{/* Building Information */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Building Information</Text>
					<View style={styles.infoGrid}>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Location</Text>
							<Text style={styles.infoValue}>{userInput?.city || 'Not specified'}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Seismic Zone</Text>
							<Text style={styles.infoValue}>{userInput?.seismicZone || 'Not specified'}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Number of Stories</Text>
							<Text style={styles.infoValue}>{userInput?.numberOfStories || 'Not specified'}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Year Built</Text>
							<Text style={styles.infoValue}>{userInput?.yearOfConstruction || 'Not specified'}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Structural System</Text>
							<Text style={styles.infoValue}>{userInput?.structuralSystem || 'Not specified'}</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Soil Type</Text>
							<Text style={styles.infoValue}>{userInput?.soilType || 'Not specified'}</Text>
						</View>
					</View>
				</View>

				{/* Key Findings */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Key Findings</Text>
					{findings.map((finding, index) => (
						<View key={index} style={styles.findingRow}>
							<View style={[styles.findingIndicator, { backgroundColor: getIndicatorColor(finding.type) }]} />
							<View style={styles.findingContent}>
								<Text style={styles.findingText}>{finding.text}</Text>
								<Text style={styles.findingDetail}>{finding.detail}</Text>
							</View>
						</View>
					))}
				</View>

				{/* Recommendations */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Recommendations</Text>
					{isPassing ? (
						<>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>1.</Text>
								<Text style={styles.recommendationText}>Schedule annual structural inspections to maintain safety standards.</Text>
							</View>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>2.</Text>
								<Text style={styles.recommendationText}>Create an earthquake preparedness plan for all building occupants.</Text>
							</View>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>3.</Text>
								<Text style={styles.recommendationText}>Keep this report accessible for insurance and property documentation.</Text>
							</View>
						</>
					) : (
						<>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>1.</Text>
								<Text style={styles.recommendationText}>Consult a licensed structural engineer for professional evaluation.</Text>
							</View>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>2.</Text>
								<Text style={styles.recommendationText}>Explore seismic retrofitting options to strengthen the building.</Text>
							</View>
							<View style={styles.recommendation}>
								<Text style={styles.recommendationNumber}>3.</Text>
								<Text style={styles.recommendationText}>Review and improve evacuation routes for all occupants.</Text>
							</View>
						</>
					)}
				</View>

				{/* View Online */}
				{assessmentId && assessmentId !== 'preview' && (
					<View style={styles.qrSection}>
						<Text style={styles.qrLabel}>View Full Interactive Report Online</Text>
						<Text style={styles.onlineLink}>quakewise.com/result/{assessmentId}</Text>
					</View>
				)}

				{/* Disclaimer */}
				<View style={styles.disclaimer}>
					<Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
					<Text style={styles.disclaimerText}>
						This assessment is based on the information provided and serves as a general guide.
						It should not replace a professional structural engineering evaluation.
						For comprehensive structural analysis, please consult a licensed professional engineer.
					</Text>
				</View>

				{/* Footer */}
				<View style={styles.footer}>
					<Text style={styles.footerText}>
						Generated by QuakeWise - AI-Powered Earthquake Safety Assessment Platform
					</Text>
					<Text style={styles.footerText}>
						quakewise.com | Assessment ID: {assessmentId || 'N/A'}
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
