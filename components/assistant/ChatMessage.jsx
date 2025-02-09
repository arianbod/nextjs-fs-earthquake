import React from 'react';
import { motion } from 'framer-motion';
import {
	MessageCircle,
	Check,
	CheckCheck,
	HelpCircle,
	Phone,
	Mail,
	MapPin,
	Clock,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ======================================
// 1) REGEX DETECTION
// ======================================
const phoneRegex = /\d{3}[-\s]?\d{3}[-\s]?\d{4}/;
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const addressRegex =
	/\d+\s+[A-Za-z\s,]+(?:Road|Street|Ave|Boulevard|Rd|St|Dr|Avenue|Drive).*[A-Z]{2}\s+[A-Z0-9]{3}/i;

function isPhoneNumber(text) {
	return phoneRegex.test(text);
}
function isEmail(text) {
	return emailRegex.test(text);
}
function isAddress(text) {
	return addressRegex.test(text);
}
function isBusinessHours(text) {
	return /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun).*(?:am|pm|hours|:)/i.test(
		text
	);
}

function isRTL(text) {
	const rtlChars =
		/[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
	return rtlChars.test(text.charAt(0));
}

// ======================================
// 2) KEYWORD HIGHLIGHTING
// ======================================
/**
 * highlightText(content, rules)
 * Applies a list of { pattern: RegExp, replacement: string } rules
 * to the `content` string, returning a new string.
 */
function highlightText(content, rules) {
	if (typeof content !== 'string') {
		// Not a string, so just return as-is (or do something else).
		console.warn('highlightText received non-string:', content);
		return content;
	}

	let output = content;
	for (const { pattern, replacement } of rules) {
		output = output.replace(pattern, replacement);
	}
	return output;
}

// Our highlight rules (adjust as needed)
const highlightRules = [
	{ pattern: /cable solution/g, replacement: '_cable solution_' },
	{ pattern: /custom solutions/g, replacement: '_custom solutions_' },
	{
		pattern:
			/standard items|technical specifications|specifications provided|sample availability|response for custom|same-day quote/gi,
		replacement: '**$&**',
	},
	// If you want to remove "[object Object]" entirely, you could do:
	// { pattern: /\[object Object\]/g, replacement: '' },
];

// ======================================
// 3) CONTACT & HOURS COMPONENTS
// ======================================
const ContactButton = ({ type, content, className = '' }) => {
	let href, icon, text, bg;

	switch (type) {
		case 'phone':
			href = `tel:${content.replace(/[^\d]/g, '')}`;
			icon = <Phone className='w-4 h-4' />;
			text = `Call: ${content}`;
			bg = 'bg-green-500 hover:bg-green-600';
			break;
		case 'email':
			href = `mailto:${content}`;
			icon = <Mail className='w-4 h-4' />;
			text = `Email: ${content}`;
			bg = 'bg-blue-500 hover:bg-blue-600';
			break;
		case 'address':
			href = `https://maps.google.com/?q=${encodeURIComponent(content)}`;
			icon = <MapPin className='w-4 h-4' />;
			text = 'View Map';
			bg = 'bg-purple-500 hover:bg-purple-600';
			break;
		case 'hours':
			href = '#';
			icon = <Clock className='w-4 h-4' />;
			text = 'View Hours';
			bg = 'bg-orange-500 hover:bg-orange-600';
			break;
		default:
			href = '#';
			icon = null;
			text = content;
			bg = 'bg-gray-500 hover:bg-gray-600';
	}

	return (
		<a
			href={href}
			target={type === 'address' ? '_blank' : undefined}
			rel={type === 'address' ? 'noopener noreferrer' : undefined}
			className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white 
        transition-all transform hover:scale-105 ${bg} hover:shadow-md ${className}`}>
			{icon}
			<span className='text-sm font-medium'>{text}</span>
		</a>
	);
};

const ContactInfoGroup = ({ phone, email, address }) => {
	if (!phone && !email && !address) return null;
	return (
		<div className='mt-2 flex flex-wrap gap-2 items-center'>
			{phone && (
				<ContactButton
					type='phone'
					content={phone}
				/>
			)}
			{email && (
				<ContactButton
					type='email'
					content={email}
				/>
			)}
			{address && (
				<ContactButton
					type='address'
					content={address}
				/>
			)}
		</div>
	);
};

const BusinessHoursCard = ({ hoursText }) => {
	const lines = hoursText
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean)
		.map((line) => {
			const [day, hours] = line.split(':').map((part) => part.trim());
			return { day, hours };
		});

	if (!lines.length) return null;

	return (
		<div className='mt-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg'>
			<h4 className='font-semibold mb-2'>Business Hours</h4>
			<div className='grid grid-cols-2 gap-y-1'>
				{lines.map(({ day, hours }, idx) => (
					<React.Fragment key={idx}>
						<div className='font-medium'>{day}:</div>
						<div>{hours}</div>
					</React.Fragment>
				))}
			</div>
		</div>
	);
};

// ======================================
// 4) QUESTIONS COMPONENT
// ======================================
const QuestionList = ({ questions }) => {
	const processQuestions = (text) =>
		text
			.split('\n')
			.filter((line) => line.trim().endsWith('?'))
			.map((line) => line.trim())
			.filter((q) => q && !q.toLowerCase().includes('questions for you'));

	const questionList = processQuestions(questions);
	if (!questionList.length) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 5 }}
			animate={{ opacity: 1, y: 0 }}
			className='mt-4 space-y-2 bg-black/5 dark:bg-white/5 rounded-lg p-3'>
			<div className='flex items-center gap-1.5 text-inherit font-medium text-sm pb-2 border-b border-black/10 dark:border-white/10'>
				<HelpCircle className='w-3.5 h-3.5' />
				<span>Questions for you:</span>
			</div>
			{questionList.map((question, index) => (
				<motion.div
					key={index}
					initial={{ opacity: 0, x: -5 }}
					animate={{ opacity: 1, x: 0, transition: { delay: index * 0.1 } }}
					className='flex items-start gap-2 pl-1'>
					<span className='flex-shrink-0 opacity-75 font-medium text-sm'>
						{index + 1}.
					</span>
					<span className='text-sm leading-relaxed'>{question}</span>
				</motion.div>
			))}
		</motion.div>
	);
};

// ======================================
// 5) CUSTOM MARKDOWN RENDERING
// ======================================
const MarkdownComponents = (isUser) => ({
	h1: ({ children }) => (
		<h1
			className={`text-xl font-bold mb-4 ${
				isUser ? 'text-white' : 'text-gray-900 dark:text-gray-50'
			} leading-relaxed`}>
			{children}
		</h1>
	),
	h2: ({ children }) => (
		<h2
			className={`text-lg font-semibold mb-3 ${
				isUser ? 'text-white' : 'text-gray-800 dark:text-gray-100'
			} leading-relaxed`}>
			{children}
		</h2>
	),
	h3: ({ children }) => (
		<h3
			className={`text-base font-medium mb-2 ${
				isUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'
			} leading-relaxed`}>
			{children}
		</h3>
	),
	a: ({ children, href }) => (
		<a
			href={href}
			className={`${
				isUser
					? 'text-white hover:text-blue-100'
					: 'text-blue-600 dark:text-blue-400 hover:underline'
			} font-medium inline-flex items-center gap-1 group`}
			target='_blank'
			rel='noopener noreferrer'>
			{children}
			<span className='inline-block transition-transform group-hover:translate-x-0.5'>
				→
			</span>
		</a>
	),
	code: ({ inline, children, ...props }) => {
		if (inline) {
			return (
				<code
					className={`px-1.5 py-0.5 rounded-md ${
						isUser
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
					} font-mono text-sm border ${
						isUser
							? 'border-blue-500'
							: 'border-gray-200 dark:border-gray-700/50'
					}`}
					{...props}>
					{children}
				</code>
			);
		}
		return (
			<div className='relative group'>
				<pre
					className={`my-3 p-4 rounded-lg overflow-x-auto border ${
						isUser
							? 'bg-blue-600 border-blue-500 text-white'
							: 'bg-gray-100 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700/50'
					}`}>
					<code
						className={`font-mono text-sm ${
							isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'
						} block`}
						{...props}>
						{children}
					</code>
				</pre>
				<div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
					<button
						className='text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors'
						onClick={() => navigator.clipboard.writeText(children)}>
						Copy
					</button>
				</div>
			</div>
		);
	},
	strong: ({ children }) => (
		<strong
			className={`font-semibold ${
				isUser
					? 'text-white bg-blue-600'
					: 'text-gray-900 dark:text-gray-50 bg-blue-50 dark:bg-blue-900/20'
			} px-1.5 py-0.5 rounded`}>
			{children}
		</strong>
	),
	em: ({ children }) => (
		<em
			className={`${
				isUser ? 'text-white' : 'text-blue-600 dark:text-blue-400'
			} font-medium not-italic`}>
			{children}
		</em>
	),
	ul: ({ children }) => (
		<ul className='mb-3 space-y-2 list-none'>
			{React.Children.map(children, (child) => (
				<li className='flex items-start gap-2'>
					<span className={`${isUser ? 'text-white' : 'text-blue-500'} mt-1`}>
						•
					</span>
					{child}
				</li>
			))}
		</ul>
	),
	ol: ({ children }) => (
		<ol className='mb-3 space-y-2'>
			{React.Children.map(children, (child, index) => (
				<li className='flex items-start gap-2'>
					<span
						className={`${
							isUser ? 'text-white' : 'text-gray-500 dark:text-gray-400'
						} min-w-[1.25rem]`}>
						{index + 1}.
					</span>
					{child}
				</li>
			))}
		</ol>
	),
	li: ({ children }) => {
		const text = React.Children.toArray(children).join('');
		const direction = isRTL(text) ? 'rtl' : 'ltr';
		return (
			<div
				className={`${
					isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'
				} leading-relaxed`}
				dir={direction}
				style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}>
				{children}
			</div>
		);
	},
	blockquote: ({ children }) => {
		const text = React.Children.toArray(children).join('');
		const direction = isRTL(text) ? 'rtl' : 'ltr';
		return (
			<blockquote
				className={`my-4 ${
					direction === 'rtl'
						? 'pr-4 border-r-4 rounded-l-lg pl-2'
						: 'pl-4 border-l-4 rounded-r-lg pr-2'
				}
        ${
					isUser
						? 'border-white/30 bg-white/10'
						: 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
				} py-2`}
				dir={direction}>
				<div
					className={`${
						isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'
					} italic`}
					style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}>
					{children}
				</div>
			</blockquote>
		);
	},

	// Overridden <p> to parse contact info & hours
	p: ({ children }) => {
		const rawText = React.Children.toArray(children).join('');
		const direction = isRTL(rawText) ? 'rtl' : 'ltr';
		const lines = rawText.split('\n').filter((l) => l.trim());

		const parsedElements = lines.map((line, idx) => {
			const hasPhone = isPhoneNumber(line);
			const hasEmail = isEmail(line);
			const hasAddress = isAddress(line);
			const hasHours = isBusinessHours(line);

			// If the line is purely "business hours"
			if (hasHours && !hasPhone && !hasEmail && !hasAddress) {
				return (
					<BusinessHoursCard
						key={idx}
						hoursText={line}
					/>
				);
			}
			// If the line has contact info
			if (hasPhone || hasEmail || hasAddress) {
				const phoneMatch = hasPhone ? line.match(phoneRegex)[0] : null;
				const emailMatch = hasEmail ? line.match(emailRegex)[0] : null;
				const addressMatch = hasAddress ? line.match(addressRegex)[0] : null;

				return (
					<div
						key={idx}
						className='my-4 space-y-2'>
						<p
							className={`text-base leading-relaxed ${
								isRTL(line) ? 'rtl' : 'ltr'
							} ${isUser ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}
							style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}>
							{line}
						</p>
						<ContactInfoGroup
							phone={phoneMatch}
							email={emailMatch}
							address={addressMatch}
						/>
					</div>
				);
			}
			// Otherwise, normal paragraph
			return (
				<p
					key={idx}
					className={`text-base leading-relaxed mb-3 last:mb-0 ${
						isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'
					}`}
					dir={direction}
					style={{ textAlign: direction === 'rtl' ? 'right' : 'left' }}>
					{line}
				</p>
			);
		});

		return <>{parsedElements}</>;
	},
});

// Wrap the custom components
function ProcessMarkdown({ content, isUser }) {
	return (
		<ReactMarkdown components={MarkdownComponents(isUser)}>
			{content}
		</ReactMarkdown>
	);
}

// ======================================
// 6) MESSAGE CONTENT
// ======================================
function MessageContent({ content, isUser }) {
	// Split out the "Questions for you:" portion
	const parts =
		typeof content === 'string'
			? content.split(/(?=Questions for you:)/i)
			: [content]; // fallback if not a string

	const intro = parts[0] || '';
	const questions = parts.length > 1 ? parts[1] : '';

	// Apply highlighting to the "intro" portion (not the questions)
	const formattedIntro = highlightText(intro, highlightRules);

	return (
		<div className='space-y-2 text-sm'>
			{/* MAIN INTRO TEXT */}
			<div className='prose prose-sm max-w-none'>
				<ProcessMarkdown
					content={formattedIntro}
					isUser={isUser}
				/>
			</div>

			{/* QUESTIONS SECTION */}
			{questions && <QuestionList questions={questions} />}
		</div>
	);
}

// ======================================
// 7) MAIN CHAT MESSAGE COMPONENT
// ======================================
export default function ChatMessage({ message, isLast }) {
	const isUser = message.role === 'user';

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={`flex ${isUser ? 'justify-end' : 'justify-start'} group mb-6`}>
			<div
				className={`relative max-w-[85%] p-4 rounded-2xl shadow-sm 
          ${
						isUser
							? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-4 rounded-br-sm'
							: 'bg-white dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 mr-4 rounded-bl-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow'
					}`}>
				{/* RENDER THE (HIGHLIGHTED) MESSAGE CONTENT */}
				<MessageContent
					content={message.content}
					isUser={isUser}
				/>

				{/* If this is assistant's message, show "End of response" */}
				{!isUser && (
					<div className='mt-3 pt-2 flex items-center justify-end text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/50'>
						<MessageCircle className='w-3 h-3 mr-1' />
						<span>End of response</span>
					</div>
				)}

				{/* Timestamp & check status if it's a user message */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className={`absolute ${isUser ? 'left-0' : 'right-0'} -bottom-6 
            text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap
            opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
					{new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}
					{isUser && isLast && (
						<span className='ml-1'>
							{message.status === 'sent' ? (
								<Check className='w-3 h-3' />
							) : (
								<CheckCheck className='w-3 h-3' />
							)}
						</span>
					)}
				</motion.div>
			</div>
		</motion.div>
	);
}
