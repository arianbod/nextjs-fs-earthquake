import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import 'whatwg-fetch';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-openai-api-key';
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_SEISMIC_API_ENDPOINT = 'https://test-seismic-api.com';
process.env.NEXT_PUBLIC_SEISMIC_API_KEY = 'test-seismic-key';
process.env.SENDGRID_API_KEY = 'test-sendgrid-key';
process.env.FROM_EMAIL = 'test@example.com';
process.env.FROM_NAME = 'Test Sender';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.DEFAULT_LANGUAGE = 'en';
process.env.NODE_ENV = 'test';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Clerk authentication
vi.mock('@clerk/nextjs', () => ({
  auth: () => ({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
  }),
  useAuth: () => ({
    userId: 'test-user-id',
    isSignedIn: true,
    isLoaded: true,
  }),
  useUser: () => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isLoaded: true,
  }),
  ClerkProvider: ({ children }) => children,
  SignIn: () => null,
  SignUp: () => null,
  UserButton: () => null,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => {
      return (props) => {
        const { children, ...otherProps } = props || {};
        return { ...otherProps, children };
      };
    },
  }),
  AnimatePresence: (props) => props?.children || null,
}));

// Suppress console errors in tests (optional - comment out if you need to see errors)
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
