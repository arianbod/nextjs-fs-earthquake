import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Wrap Next.js navigation APIs with locale-aware versions
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
