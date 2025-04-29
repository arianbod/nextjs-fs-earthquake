// components/navigation/LinksDropdown.jsx
'use client';
import React from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { links } from '@/utils/links';
import Link from 'next/link';

const LinksDropdown = () => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				asChild
				className='lg:hidden'>
				<Button
					variant='ghost'
					size='icon'>
					<Menu className='h-5 w-5' />
					<span className='sr-only'>Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='start'
				className='w-56'>
				{links.map(({ href, label, icon }) => (
					<DropdownMenuItem
						key={href}
						className='p-0'>
						<Link
							href={href}
							className='flex items-center gap-2 px-3 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-800'>
							{icon}
							<span>{label}</span>
						</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default LinksDropdown;
