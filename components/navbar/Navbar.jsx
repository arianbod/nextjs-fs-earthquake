import React from 'react';
import LinksDropdown from './LinksDropdown';
import ModeToggle from './ThemeToggle';
import { UserButton } from '@clerk/nextjs';
const Navbar = () => {
	return (
		<nav
			className='bg-muted py-4 sm:px-16 lg:px-24 flex items-center px-4
			justify-between'>
			<div>
				<LinksDropdown />
			</div>
			<div className='flex items-center gap-x-4'>
				<ModeToggle />
				<UserButton />
			</div>
		</nav>
	);
};

export default Navbar;
