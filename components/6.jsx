import React, { useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import Data from '@/utils/Data.json';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import Option1 from '@/assets/stepFour/1.png';
import Option2 from '@/assets/stepFour/2.png';
import { nanoid } from 'nanoid';
const id = nanoid();
const Six = () => {
	const [selectedPhoto, setSelectedPhoto] = useState('');
	const [imagePreview, setImagePreview] = useState(null);
	const [manipulated, setManipulated] = useState(false);
	const stepSixData = Data.steps.find((step) => step.step === 6);

	const handleSelectionChange = (e) => {
		setSelectedPhoto(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Selected photo:', selectedPhoto);
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className='flex flex-col place-items-center gap-8'>
			<Progress value={55} />

			<h1 className='text-2xl'>{stepSixData.title}</h1>
			<p>{stepSixData.description}</p>

			<div className='flex gap-8 text-center'>
				<div
					onClick={() => setManipulated(true)}
					className={`hover:scale-110 transition-all rounded-3xl p-4  ${
						manipulated && 'border-8 border-blue-500'
					}`}>
					{' '}
					<Image
						src={Option1}
						width={200}
						height={200}
						alt='manipulated'
					/>
					<span>manipulated</span>
				</div>
				<div
					onClick={(e) => setManipulated(false)}
					className={`hover:scale-110 transition-all rounded-3xl p-4 ${
						!manipulated && 'border-8 border-blue-500'
					}`}>
					<Image
						src={Option1}
						width={200}
						height={200}
						alt='manipulated'
					/>
					<span>without manipulation</span>
				</div>
			</div>
			{manipulated ? (
				<Link
					href='/7'
					passHref>
					<Button variant=''>Next Step</Button>
				</Link>
			) : (
				<Link
					href={`/9`}
					passHref>
					<Button variant=''>next</Button>
				</Link>
			)}
		</div>
	);
};

export default Six;
