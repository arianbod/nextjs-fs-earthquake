'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun } from 'lucide-react';
const ModeToggle = () => {
	const { setTheme, theme, resolvedTheme } = useTheme();
	React.useEffect(() => {
		console.log('theme is : ', theme);
		console.log('resolvedTheme is : ', resolvedTheme);
	}, [resolvedTheme]);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					size='icon'>
					{resolvedTheme === 'dark' ? (
						<Moon className='h-[1.2rem] w-[1.2rem]' />
					) : (
						<Sun className='h-[1.2rem] w-[1.2rem]' />
					)}
					<span className='sr-only'>Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem onClick={() => setTheme('light')}>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
export default ModeToggle;
