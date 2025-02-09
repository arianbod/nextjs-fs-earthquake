import React from 'react';
import { ReactNode } from 'react';

import { RiTeamLine } from 'react-icons/ri';
import { FaInfoCircle, FaBlog, FaChalkboardTeacher } from 'react-icons/fa';
import { MdOutlineContactMail, MdOutlineEventNote } from 'react-icons/md';
import { IoHomeOutline, IoImageOutline } from 'react-icons/io5';
import { GiMoneyStack } from 'react-icons/gi';

export interface MenuItem {
	title: string;
	url: string;
	icon: ReactNode;
}

export const menuItems: MenuItem[] = [
	{ title: 'Events', icon: <MdOutlineEventNote />, url: '/events' },
	{ title: 'Education', icon: <FaChalkboardTeacher />, url: '/education' },
	{ title: 'Blog', icon: <FaBlog />, url: '/blog' },
	{ title: 'Members', icon: <RiTeamLine />, url: '/members' },
	// { title: 'Gallery', icon: <IoImageOutline />, url: '/gallery' },
	{ title: 'About', icon: <FaInfoCircle />, url: '/about' },
	{ title: 'Contact', icon: <MdOutlineContactMail />, url: '/contact' },
	{ title: 'Donate', icon: <GiMoneyStack />, url: '/donate' },
];

export const global = {
	title: `The Women's Organization of Iran`,
};

export const homePage = {
	heroTitle: 'Empowering Women for a Better Future',
	heroText: "Join us in our mission to advance women's rights and equality.",
	heroButton: 'Get Involved',
	aboutTitle: 'About Us',
	aboutText:
		"The Women's Organization of Iran is dedicated to advancing the social, cultural, and legal status of women in Iran and around the world. Since our founding in 1966, we have been at the forefront of promoting women's rights through education, advocacy, and community engagement.",
	programsTitle: 'Our Programs',
	empowermentTitle: 'Empowerment Programs',
	empowermentText:
		'We provide literacy classes, vocational training, and legal advice to empower women with the skills they need to succeed.',
	advocacyTitle: 'Advocacy and Legal Support',
	advocacyText:
		"Our advocacy efforts ensure women's rights are protected and their voices are heard by policymakers.",
	communityTitle: 'Community Engagement',
	communityText:
		'We organize community events, workshops, and support groups to foster a sense of belonging and mutual support among women.',
};

export const aboutPage = {
	aboutTitle: 'About Us',
	aboutText:
		"The Women's Organization of Iran is dedicated to advancing the social, cultural, and legal status of women in Iran and around the world. Since our founding in 1966, we have been at the forefront of promoting women's rights through education, advocacy, and community engagement.",
};

export const programsPage = {
	programsTitle: 'Our Programs',
	empowermentTitle: 'Empowerment Programs',
	empowermentText:
		'We provide literacy classes, vocational training, and legal advice to empower women with the skills they need to succeed.',
	advocacyTitle: 'Advocacy and Legal Support',
	advocacyText:
		"Our advocacy efforts ensure women's rights are protected and their voices are heard by policymakers.",
	communityTitle: 'Community Engagement',
	communityText:
		'We organize community events, workshops, and support groups to foster a sense of belonging and mutual support among women.',
};

export const getInvolvedPage = {
	getInvolvedTitle: 'Get Involved',
	joinUsTitle: 'Join Us',
	joinUsText:
		"Become a member of WOI and be part of a vibrant community dedicated to women's empowerment.",
	volunteerTitle: 'Volunteer',
	volunteerText:
		'Your time and skills can make a significant impact. Volunteer with us and contribute to our programs and initiatives.',
	donateTitle: 'Donate',
	donateText:
		'Your generous donations help us continue our vital work. Support us today and help create a brighter future for women in Iran.',
};

export const teamPage = {
	teamTitle: 'Our Team',
	teamIntro:
		"We are coming together from a wide variety of backgrounds and experiences. Our skilled team is the backbone of WOI, dedicated to advancing women's rights and empowerment.",
	members: [
		{
			name: 'Homa Ehsan',
			title: 'President',
			image: '/images/homa-ehsan.webp',
			description:
				'Homa Ehsan has been leading WOI with vision and dedication, advocating for women’s rights and equality in Iran and beyond.',
		},
		{
			name: 'Rozita Manteghi',
			title: 'Vice President',
			image: '/images/rozita-manteghi.webp',
			description:
				'Rozita Manteghi supports the President in leading WOI, focusing on strategic planning and program development.',
		},
		{
			name: 'Fariba Majd Nia',
			title: 'Office Manager',
			image: '/images/fariba-majd-nia.webp',
			description:
				'Fariba Majd Nia oversees the daily operations of WOI, ensuring that our programs run smoothly and efficiently.',
		},
		{
			name: 'Parry Sabahat',
			title: 'Treasurer',
			image: '/images/parry-sabahat.webp',
			description:
				'Parry Sabahat manages WOI’s finances, ensuring transparency and accountability in all our financial dealings.',
		},
		{
			name: 'Nadia Vakili',
			title: "Member, Women's rights activist",
			image: '/images/nadia-vakili.webp',
			description:
				'Nadia Vakili is a passionate advocate for women’s rights, working tirelessly to promote gender equality and social justice.',
		},
		{
			name: 'Foorogh Shams',
			title: 'Bookkeeper',
			image: '/images/foorogh-shamc.webp',
			description:
				'Foorogh Shamc handles the bookkeeping at WOI, maintaining accurate financial records and supporting our treasurer.',
		},
		{
			name: 'Rokhsareh Sabaghian',
			title: 'Member',
			image: '/images/rokhsareh-sabaghian.webp',
			description:
				'Rokhsareh Sabaghian contributes to our community outreach and engagement efforts, helping to build strong connections with our members.',
		},
		// {
		// 	name: 'Afsaneh Rostami',
		// 	title: "Member, Writer, Women's rights activist",
		// 	image: '/images/afsaneh-rostami.webp',
		// 	description:
		// 		'Afsaneh Rostami is a talented writer and activist, using her skills to raise awareness about women’s issues and advocate for change.',
		// },
		{
			name: 'Fatemeh Minaei',
			title: 'Office Manager',
			image: '/images/fatemeh-minaei.webp',
			description:
				'Fatemeh Minaei manages our office operations, ensuring that everything runs smoothly and efficiently.',
		},
		{
			name: 'Parvaneh Farid',
			title: 'Product Manager',
			image: '/images/parvaneh-farid.webp',
			description:
				'Parvaneh Farid oversees the development and delivery of our products and services, ensuring they meet the needs of our members.',
		},
		// {
		// 	name: 'Donya Nasiri',
		// 	title: "Member, Women's rights activist",
		// 	image: '/images/donya-nasiri.webp',
		// 	description:
		// 		'Donya Nasiri is a dedicated activist, working to promote women’s rights and gender equality through various initiatives.',
		// },
	],
};

export const missionPage = {
	missionTitle: 'Our Mission',
	missionText:
		'Our mission is to empower women through education, advocacy, and community engagement. We strive to create an inclusive environment where women from all backgrounds can thrive.',
};

export const contactPage = {
	contactTitle: 'Contact Us',
	contactForm: {
		nameLabel: 'Name',
		emailLabel: 'Email',
		messageLabel: 'Message',
		submitButton: 'Send',
	},
	getInTouchTitle: 'Get in Touch',
	getInTouchText:
		"We'd love to hear from you! Whether you have a question, feedback, or want to get involved, feel free to reach out.",
	email: 'info@iranianwomenorganization.com',
	phone: '+33 977 217 211',
	whatsapp: '+33 782 61 86 63',
	address: "Women's Organization of Iran\n123 Example Street, City, Country",
	socialMedia: {
		telegram: 'https://t.me/iranianwomenorganization',
		facebook: 'https://www.facebook.com/iranianwomenorganization',
	},
};

export const galleryPage = {
	galleryTitle: 'Gallery',
	galleryIntro: 'Explore photos and videos from our events and activities.',
};

export const blogPage = {
	blogTitle: 'Our Blog',
	blogIntro:
		"Read our latest articles and updates. Our blog features stories of women's empowerment, expert insights on gender equality, and updates on our latest initiatives. Stay informed and inspired by the work we do.",
	sections: [
		{
			title: 'Free Speech',
			url: '/blog/free-speech',
			description:
				"Explore articles on freedom of speech and its impact on women's rights and social justice.",
		},
		{
			title: 'Instagram Feeder',
			url: '/blog/instagram',
			description:
				'Stay updated with our latest Instagram posts and stories, showcasing our events and initiatives.',
		},
		{
			title: 'Youtube Feeder',
			url: '/blog/youtube',
			description:
				'Watch videos from our YouTube channel, including interviews, webinars, and event highlights.',
		},
	],
};

export const eventsPage = {
	eventsTitle: 'Events',
	eventsIntro: 'Join us for upcoming events and activities.',
	sections: [
		{ title: 'Event List', url: '/events/list' },
		{ title: 'Create Event', url: '/events/create' },
		{ title: 'Add to Calendar', url: '/events/calendar' },
		{ title: 'Platform for Others', url: '/events/platform' },
		{ title: 'National and Special Events Live Stream', url: '/events/live' },
		{ title: 'Email Marketing', url: '/events/email' },
	],
};
export const donatePage = {
	donateTitle: 'Donate',
	donateIntro:
		'Support our mission by making a donation. Your contribution helps us continue our vital work in empowering women and promoting gender equality. Every donation, big or small, makes a significant impact.',
	membershipTitle: 'Membership in Our Members',
	membershipFee: '$60',
	donationOptions: [
		{
			amount: '$10',
			description: 'Support a single workshop for women in need.',
		},
		{
			amount: '$25',
			description: 'Provide educational materials for a group of women.',
		},
		{ amount: '$50', description: 'Sponsor a community outreach event.' },
		{
			amount: '$100',
			description: 'Fund a scholarship for a deserving student.',
		},
		{
			custom: true,
			description:
				'Enter a custom amount to support our various programs and initiatives.',
		},
	],
	howToDonate:
		'You can donate online via our secure payment gateway or contact us for other donation methods. All donations are tax-deductible and greatly appreciated.',
	donorRecognition:
		'We recognize and appreciate all our donors for their generous contributions. Donors will receive regular updates on the impact of their donations and invitations to special events.',
};

export const educationPage = {
	educationTitle: 'Education',
	educationIntro:
		'We offer live classes and educational resources to empower women with knowledge and skills.',
	sections: [
		{ title: 'Live Class each week one session', url: '/education/live' },
		{ title: 'Class List', url: '/education/classes' },
		{ title: 'Form Registration', url: '/education/register' },
	],
};

export const seo = {
	optimizationTitle: 'SEO Optimization',
	optimizationText:
		'Our website is optimized for search engines to increase visibility and reach.',
};

export const boardPage = {
	boardTitle: 'Our Board',
	boardIntro:
		"Meet the dedicated leaders who guide the Women's Organization of Iran.",
	members: [
		// Members data similar to teamPage in previous response
	],
};

export const membersPage = {
	membersTitle: 'Our Members',
	membersIntro:
		'We have a diverse group of members dedicated to our mission of empowering women.',
	members: [
		// Members data similar to teamPage in previous response
	],
};
