/**
 * Team Members & Access Control
 * 🔒 For QuakeWise Internal Use Only
 *
 * Defines who can access internal API documentation and admin functions.
 * Integrates with Clerk authentication.
 *
 * To add a new team member:
 * 1. Add their email to TEAM_EMAILS array
 * 2. They must sign up/login with Clerk using that email
 * 3. Changes take effect immediately (no redeploy needed)
 */

/**
 * Team members with access to internal API documentation
 * Anyone with these emails can view /api-docs after Clerk login
 */
export const TEAM_EMAILS = [
  // Engineering Team
  'dev@quakewise.com',
  'engineering@quakewise.com',
  'backend@quakewise.com',
  'frontend@quakewise.com',

  // Leadership
  'admin@quakewise.com',
  'cto@quakewise.com',

  // Operations
  'devops@quakewise.com',
  'ops@quakewise.com',

  // External Developers (Trusted Partners)
  // These developers have been granted API access for development purposes
  'h.f.gate@gmail.com',           // H.F. Gate - Mobile App Developer
  'mohammadaminapi@gmail.com',    // Mohammad Amin - API Integration Developer
  'mohammadsharafi.official@gmail.com', // Mohammad Sharafi - Developer

  // Add individual team member emails here
  // 'john.doe@quakewise.com',
  // 'jane.smith@quakewise.com',
];

/**
 * Admin users who can manage services and access sensitive operations
 * Subset of TEAM_EMAILS with elevated permissions
 */
export const ADMIN_EMAILS = [
  'admin@quakewise.com',
  'cto@quakewise.com',
  'devops@quakewise.com',
  'mohammadsharafi.official@gmail.com',
];

/**
 * Check if email is a team member
 */
export function isTeamMember(email) {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();
  return TEAM_EMAILS.some(
    teamEmail => teamEmail.toLowerCase() === normalizedEmail
  );
}

/**
 * Check if email is an admin
 */
export function isAdmin(email) {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.some(
    adminEmail => adminEmail.toLowerCase() === normalizedEmail
  );
}

/**
 * Check if email belongs to QuakeWise domain
 * Optional additional security layer
 */
export function isQuakeWiseEmail(email) {
  if (!email) return false;

  return email.toLowerCase().endsWith('@quakewise.com');
}

/**
 * Get user role based on email
 */
export function getUserRole(email) {
  if (isAdmin(email)) return 'admin';
  if (isTeamMember(email)) return 'team';
  return 'unauthorized';
}
