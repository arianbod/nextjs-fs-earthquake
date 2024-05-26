import {
	AreaChart,
	Layers,
	AppWindow,
	HomeIcon,
	MessageCircle,
} from 'lucide-react';
import React from 'react';

export const links = [
	{
		href: '/1',
		label: 'new',
		icon: <AppWindow />,
	},
	{
		href: '/welcome',
		label: 'about',
		icon: <Layers />,
	},
	{
		href: '/',
		label: 'home',
		icon: <HomeIcon />,
	},
	{
		href: '/chat',
		label: 'AI Assistant',
		icon: <MessageCircle />,
	},
];
