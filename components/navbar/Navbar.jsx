// components/navigation/Navbar.jsx
'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LinksDropdown from './LinksDropdown';
import { UserButton } from '@clerk/nextjs';

const Navbar = () => {
	return (
		<nav className='sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'>
			<div className='container mx-auto px-4 py-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-4'>
						<LinksDropdown />
					</div>

					<div className='flex items-center space-x-4'>
						<ThemeToggle />
						<UserButton afterSignOutUrl='/' />
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
