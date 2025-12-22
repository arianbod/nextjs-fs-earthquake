'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

const languages = [
	{ code: 'en', label: 'English', flag: '🇺🇸' },
	{ code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
	{ code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const LanguageToggle = () => {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

	const handleLanguageChange = (newLocale) => {
		router.replace(pathname, { locale: newLocale });
	};

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
							<Button
								variant="ghost"
								size="icon"
								className="transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
							>
								<Globe className="h-5 w-5" />
								<span className="sr-only">Change language</span>
							</Button>
						</motion.div>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>{currentLanguage.label}</p>
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="end" className="w-40">
				{languages.map((lang) => (
					<DropdownMenuItem
						key={lang.code}
						onClick={() => handleLanguageChange(lang.code)}
						className={`flex items-center gap-2 cursor-pointer ${
							locale === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
						}`}
					>
						<span className="text-lg">{lang.flag}</span>
						<span>{lang.label}</span>
						{locale === lang.code && (
							<span className="ml-auto text-blue-500">✓</span>
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default LanguageToggle;
