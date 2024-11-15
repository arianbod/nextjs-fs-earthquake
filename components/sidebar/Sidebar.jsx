// components/navigation/Sidebar.jsx
'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { links } from '@/utils/links';
import { Button } from '@/components/ui/button';
import Logo from '@/assets/main.png';

const Sidebar = () => {
	const pathname = usePathname();

	return (
		<div className='h-full py-8 px-4'>
			{/* Logo */}
			<Link
				href='/'
				className='block mb-8'>
				<div className='flex justify-center'>
					<Image
						src={Logo}
						alt='logo'
						className='w-32 h-32 rounded-full border-4 border-blue-100 dark:border-blue-900'
						priority
					/>
				</div>
			</Link>

			{/* Navigation Links */}
			<nav className='space-y-2'>
				{links.map(({ href, icon, label }) => {
					const isActive = pathname === href;
					return (
						<Link
							href={href}
							key={href}>
							<Button
								variant={isActive ? 'default' : 'ghost'}
								className={`w-full justify-start ${
									isActive
										? 'bg-blue-600 text-white hover:bg-blue-700'
										: 'hover:bg-gray-100 dark:hover:bg-gray-800'
								}`}>
								{icon}
								<span className='ml-2'>{label}</span>
							</Button>
						</Link>
					);
				})}
			</nav>
		</div>
	);
};

export default Sidebar;
