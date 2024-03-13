'use client';
import React from 'react';
import Logo from '@/assets/main.webp';
import { links } from '@/utils/links';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
	const pathname = usePathname();
	return (
		<aside className='py-4 px-8 bg-muted h-full'>
			<Link href='/'>
				<Image
					src={Logo}
					alt='logo'
					className='mx-auto rounded-full max-w-48'
				/>
			</Link>
			<div className='flex flex-col mt-20 gap-y-4'>
				{links.map(({ href, icon, label }) => {
					return (
						<Button
							asChild
							key={href}
							variant={pathname === href ? 'default' : 'link'}>
							<Link
								href={href}
								className='flex items-center gap-x-2'>
								{icon}
								<span className='capitalize'>{label}</span>
							</Link>
						</Button>
					);
				})}
			</div>
		</aside>
	);
};

export default Sidebar;
