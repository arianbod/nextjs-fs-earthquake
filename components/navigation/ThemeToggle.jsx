// components/navigation/ThemeToggle.jsx
'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
	};

	if (!mounted) {
		return (
			<Button
				variant='ghost'
				size='icon'
				className='hover:bg-gray-100 dark:hover:bg-gray-800'
				disabled>
				<Sun className='h-5 w-5' />
				<span className='sr-only'>Toggle theme</span>
			</Button>
		);
	}

	return (
		<Button
			variant='ghost'
			size='icon'
			onClick={toggleTheme}
			className='hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'>
			{resolvedTheme === 'dark' ? (
				<Moon className='h-5 w-5 text-yellow-300' />
			) : (
				<Sun className='h-5 w-5 text-yellow-500' />
			)}
			<span className='sr-only'>
				{resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			</span>
		</Button>
	);
};

export default ThemeToggle;
