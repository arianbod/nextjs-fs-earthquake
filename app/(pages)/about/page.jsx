// File: app/about/page.js
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import Data from '@/utils/Data.json';

export default function AboutPage() {
	return (
		<div className='min-h-screen'>
			<main className='container mx-auto px-4 py-16'>
				<h1 className='text-5xl font-bold text-center mb-8'>
					About QuakeWisee!
				</h1>
				<div className='text-xl text-center mb-12 space-y-6'>
					<p>{Data.description}</p>
					<h2 className='text-3xl font-semibold mt-8 mb-4'>
						{Data.welcomeTitle}
					</h2>
					<p>{Data.welcomeDescription}</p>
					<ul className='list-disc list-inside text-left max-w-2xl mx-auto'>
						{Data.objectives.map((objective, index) => (
							<li
								key={index}
								className='mb-2'>
								{objective}
							</li>
						))}
					</ul>
				</div>
				<div className='flex justify-center space-x-4'>
					<Link href='/'>
						<Button
							size='lg'
							variant='outline'
							className='text-lg'>
							<ArrowLeft className='mr-2' /> Back to Home
						</Button>
					</Link>
					<Link href='/assessment/1'>
						<Button
							size='lg'
							className='text-lg'>
							Start Assessment <ArrowRight className='ml-2' />
						</Button>
					</Link>
				</div>
				<p className='font-extrabold capitalize text-center mt-20'>
					{Data.text}
				</p>
			</main>
		</div>
	);
}
