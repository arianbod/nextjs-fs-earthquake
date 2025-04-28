'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	PlusCircle,
	ClipboardList,
	PieChart,
	MapPin,
	Building,
	AlertTriangle,
	ArrowRight,
} from 'lucide-react';
import { nanoid } from 'nanoid';

const DashboardPage = () => {
	// Sample data - would come from a database in a real app
	const recentAssessments = [
		{
			id: 'a1',
			buildingName: 'Home',
			address: '123 Main St',
			riskLevel: 'Low',
			date: '2023-04-15',
		},
		{
			id: 'a2',
			buildingName: 'Office Building',
			address: '456 Business Ave',
			riskLevel: 'Medium',
			date: '2023-03-22',
		},
	];

	const getRiskBadgeClass = (riskLevel) => {
		switch (riskLevel.toLowerCase()) {
			case 'low':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
			case 'medium':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
			case 'high':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
		}
	};

	return (
		<div className='container py-8 max-w-6xl'>
			<h1 className='text-3xl font-bold mb-6'>Dashboard</h1>

			{/* Quick actions */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
				<div className='bg-card rounded-lg shadow-sm border p-6 flex flex-col items-center text-center'>
					<PlusCircle
						size={32}
						className='mb-4 text-primary'
					/>
					<h3 className='font-medium mb-2'>Start New Assessment</h3>
					<p className='text-muted-foreground text-sm mb-4'>
						Begin a new earthquake risk assessment for your building
					</p>
					<Button
						asChild
						className='mt-auto'>
						<Link href='/start-assessment'>Start Now</Link>
					</Button>
				</div>

				<div className='bg-card rounded-lg shadow-sm border p-6 flex flex-col items-center text-center'>
					<ClipboardList
						size={32}
						className='mb-4 text-primary'
					/>
					<h3 className='font-medium mb-2'>View Assessments</h3>
					<p className='text-muted-foreground text-sm mb-4'>
						Review your previously completed building assessments
					</p>
					<Button
						asChild
						variant='outline'
						className='mt-auto'>
						<Link href='/assessments'>View All</Link>
					</Button>
				</div>

				<div className='bg-card rounded-lg shadow-sm border p-6 flex flex-col items-center text-center'>
					<PieChart
						size={32}
						className='mb-4 text-primary'
					/>
					<h3 className='font-medium mb-2'>Risk Reports</h3>
					<p className='text-muted-foreground text-sm mb-4'>
						Access detailed earthquake risk reports and analyses
					</p>
					<Button
						asChild
						variant='outline'
						className='mt-auto'>
						<Link href='/reports'>View Reports</Link>
					</Button>
				</div>
			</div>

			{/* Recent assessments */}
			<h2 className='text-xl font-semibold mb-4 flex items-center'>
				Recent Assessments
				<Button
					variant='ghost'
					size='sm'
					asChild
					className='ml-auto'>
					<Link
						href='/assessments'
						className='flex items-center gap-x-1'>
						View All <ArrowRight size={16} />
					</Link>
				</Button>
			</h2>

			<div className='bg-card rounded-lg shadow-sm border overflow-hidden mb-8'>
				{recentAssessments.length > 0 ? (
					<div className='divide-y'>
						{recentAssessments.map((assessment) => (
							<div
								key={assessment.id}
								className='p-4 hover:bg-muted/50 transition-colors'>
								<Link
									href={`/assessment/${assessment.id}`}
									className='block'>
									<div className='flex items-start justify-between'>
										<div>
											<h3 className='font-medium'>{assessment.buildingName}</h3>
											<div className='flex items-center text-sm text-muted-foreground mt-1'>
												<MapPin
													size={14}
													className='mr-1'
												/>
												{assessment.address}
											</div>
											<div className='flex items-center gap-3 mt-2'>
												<span
													className={`text-xs px-2 py-1 rounded-full ${getRiskBadgeClass(
														assessment.riskLevel
													)}`}>
													{assessment.riskLevel} Risk
												</span>
												<span className='text-xs text-muted-foreground'>
													Assessed on{' '}
													{new Date(assessment.date).toLocaleDateString()}
												</span>
											</div>
										</div>
										<Button
											size='sm'
											variant='ghost'
											className='mt-1'>
											View Details
										</Button>
									</div>
								</Link>
							</div>
						))}
					</div>
				) : (
					<div className='p-8 text-center'>
						<div className='mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4'>
							<ClipboardList
								size={20}
								className='text-muted-foreground'
							/>
						</div>
						<h3 className='font-medium mb-2'>No assessments yet</h3>
						<p className='text-muted-foreground text-sm mb-4'>
							Start your first earthquake risk assessment now
						</p>
						<Button asChild>
							<Link href='/start-assessment'>Start Assessment</Link>
						</Button>
					</div>
				)}
			</div>

			{/* Local earthquake risk info */}
			<h2 className='text-xl font-semibold mb-4'>Local Risk Information</h2>
			<div className='bg-card rounded-lg shadow-sm border p-6'>
				<div className='flex items-start gap-4'>
					<div className='flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center dark:bg-yellow-900'>
						<AlertTriangle
							size={20}
							className='text-yellow-600 dark:text-yellow-300'
						/>
					</div>
					<div>
						<h3 className='font-medium mb-2'>Earthquake Risk in Your Area</h3>
						<p className='text-muted-foreground mb-4'>
							Your location has a moderate risk of seismic activity. Buildings
							in this area should be assessed regularly to ensure they meet
							current safety standards.
						</p>
						<div className='flex flex-wrap gap-3'>
							<Button
								variant='outline'
								size='sm'>
								View Risk Map
							</Button>
							<Button
								variant='outline'
								size='sm'>
								Local Building Codes
							</Button>
							<Button
								variant='outline'
								size='sm'>
								Safety Resources
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardPage;
