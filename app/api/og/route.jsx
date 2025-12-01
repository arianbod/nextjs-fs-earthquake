import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);

		const score = searchParams.get('score') || '0';
		const building = searchParams.get('building') || 'Building Assessment';
		const grade = searchParams.get('grade') || 'N/A';

		const scoreNum = parseFloat(score);
		const isGood = scoreNum >= 70;

		// Color scheme based on score
		const bgGradient = isGood
			? 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)'
			: scoreNum >= 50
				? 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)'
				: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)';

		const accentColor = isGood ? '#10B981' : scoreNum >= 50 ? '#F59E0B' : '#EF4444';

		return new ImageResponse(
			(
				<div
					style={{
						height: '100%',
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						background: bgGradient,
						padding: '40px',
					}}
				>
					{/* Main Card */}
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: 'white',
							borderRadius: '32px',
							padding: '60px 80px',
							boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
							maxWidth: '1000px',
						}}
					>
						{/* Logo/Brand */}
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '12px',
								marginBottom: '30px',
							}}
						>
							<div
								style={{
									width: '48px',
									height: '48px',
									backgroundColor: '#7C3AED',
									borderRadius: '12px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<svg width="28" height="28" viewBox="0 0 24 24" fill="white">
									<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<span
								style={{
									fontSize: '32px',
									fontWeight: 'bold',
									color: '#1F2937',
								}}
							>
								QuakeWise
							</span>
						</div>

						{/* Score Circle */}
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: '200px',
								height: '200px',
								borderRadius: '100px',
								background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}40 100%)`,
								border: `8px solid ${accentColor}`,
								marginBottom: '24px',
							}}
						>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
								}}
							>
								<span
									style={{
										fontSize: '72px',
										fontWeight: 'bold',
										color: accentColor,
										lineHeight: '1',
									}}
								>
									{Math.round(scoreNum)}
								</span>
								<span
									style={{
										fontSize: '24px',
										color: '#6B7280',
									}}
								>
									/100
								</span>
							</div>
						</div>

						{/* Grade Badge */}
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '12px',
								backgroundColor: `${accentColor}15`,
								padding: '12px 28px',
								borderRadius: '50px',
								marginBottom: '20px',
							}}
						>
							<span
								style={{
									fontSize: '28px',
									fontWeight: 'bold',
									color: accentColor,
								}}
							>
								Grade {grade}
							</span>
							<span
								style={{
									fontSize: '24px',
									color: '#6B7280',
								}}
							>
								•
							</span>
							<span
								style={{
									fontSize: '24px',
									color: '#4B5563',
								}}
							>
								{isGood ? 'Safe Building' : scoreNum >= 50 ? 'Needs Attention' : 'At Risk'}
							</span>
						</div>

						{/* Building Name */}
						<div
							style={{
								fontSize: '28px',
								color: '#374151',
								textAlign: 'center',
								maxWidth: '600px',
							}}
						>
							{building.length > 50 ? building.substring(0, 50) + '...' : building}
						</div>
					</div>

					{/* Footer */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							marginTop: '30px',
							color: 'white',
							fontSize: '20px',
							opacity: 0.9,
						}}
					>
						Earthquake Safety Assessment • quakewise.com
					</div>
				</div>
			),
			{
				width: 1200,
				height: 630,
			}
		);
	} catch (error) {
		console.error('OG Image generation error:', error);
		return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
	}
}
