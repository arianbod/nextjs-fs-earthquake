import React from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlignLeft } from 'lucide-react';
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
					variant='outline'
					size='icon'>
					<AlignLeft />
					<span className='sr-only'>Toggle links</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className='w-52 lg:hidden'
				align='start'
				sideOffset={25}>
				{links.map(({ href, label, icon }) => {
					return (
						<DropdownMenuItem key={href}>
							<Link
								href={href}
								className='flex items-center gap-x-2'>
								{icon} <span className='capitalize'>{label}</span>
							</Link>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default LinksDropdown;
