'use client';

import React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const HomePage = () => {
	const t = useTranslations('Home');

	return (
		<main>
			<Link href='/1'>
				<Button>{t('letsStart')}</Button>
			</Link>
		</main>
	);
};

export default HomePage;
