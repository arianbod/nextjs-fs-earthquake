// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Define which routes should remain public or completely ignored
const publicRoutes = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);
const ignoredRoutes = createRouteMatcher(['/no-auth-in-this-route']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
	// Skip any routes you explicitly want fully open
	if (ignoredRoutes(req)) {
		return;
	}
	const { userId, redirectToSignIn } = await auth();
	// If the user isn’t signed in and isn’t heading to a public page, redirect
	if (!userId && !publicRoutes(req)) {
		return redirectToSignIn();
	}
});

export const config = {
	matcher: [
		// Skip static files and Next internals
		'/((?!_next/static|_next/image|favicon.ico).*)',
		// Protect your API or tRPC endpoints if desired
		'/(api|trpc)(.*)',
	],
};
