// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

// Define which routes should remain public or completely ignored
const isPublicRoute = createRouteMatcher([
	'/',
	'/:locale',
	'/:locale/sign-in(.*)',
	'/:locale/sign-up(.*)',
	'/:locale/about',
	'/:locale/welcome',
]);

const isIgnoredRoute = createRouteMatcher([
	'/api(.*)',
	'/_next(.*)',
	'/favicon.ico',
	'/images(.*)',
	'/fonts(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
	// Skip API routes and static files - don't apply i18n
	if (isIgnoredRoute(req)) {
		return NextResponse.next();
	}

	// Apply i18n middleware first (handles locale detection and routing)
	const intlResponse = intlMiddleware(req);

	// If intlMiddleware returns a redirect, use it
	if (intlResponse.status !== 200) {
		return intlResponse;
	}

	// Now apply Clerk auth logic
	const { userId, redirectToSignIn } = await auth();

	// If the user isn't signed in and isn't heading to a public page, redirect
	if (!userId && !isPublicRoute(req)) {
		return redirectToSignIn();
	}

	return intlResponse;
});

export const config = {
	matcher: [
		// Match all paths except static files and Next internals
		'/((?!_next/static|_next/image|favicon.ico|api|images|fonts).*)',
	],
};
