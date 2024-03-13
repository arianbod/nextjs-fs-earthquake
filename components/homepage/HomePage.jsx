import React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';

const HomePage = () => {
	return (
		<main>
			<Link href='/1'>
				<Button>lets start</Button>
			</Link>
		</main>
	);
};

export default HomePage;
