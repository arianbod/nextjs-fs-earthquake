/**
 * Internal Services Registry
 * 🔒 For QuakeWise Team Only
 *
 * Pre-registered internal services that can access the QuakeWise API.
 * Each service has a unique token stored in environment variables.
 *
 * Token Management:
 * - Store tokens in team password manager (1Password/Vault)
 * - Add to Vercel environment variables for production
 * - Never commit tokens to git
 */

/**
 * Service tier definitions
 * Determines rate limits and priority
 */
export const SERVICE_TIERS = {
  WEB_APP: {
    name: 'Web Application',
    rateLimitPerHour: 10000,
    rateLimitPerDay: 100000,
    description: 'High-traffic user-facing services (web & mobile apps)'
  },
  BATCH_JOB: {
    name: 'Batch Processing',
    rateLimitPerHour: 1000,
    rateLimitPerDay: 50000,
    description: 'Background jobs and bulk processing tasks'
  },
  DEV_TESTING: {
    name: 'Development & Testing',
    rateLimitPerHour: 500,
    rateLimitPerDay: 5000,
    description: 'Development environments and automated testing'
  }
};

/**
 * Pre-registered internal QuakeWise services
 *
 * To add a new service:
 * 1. Add entry here with unique service ID
 * 2. Generate token with: npm run generate:service-tokens
 * 3. Add token to environment variables
 * 4. Store in team password manager
 * 5. Run: npm run db:seed to register in database
 */
export const INTERNAL_SERVICES = {
  'quakewise-web-app': {
    name: 'QuakeWise Web Application',
    tier: 'WEB_APP',
    tokenEnvVar: 'SERVICE_TOKEN_WEB_APP',
    description: 'Main web application frontend',
    owner: 'Web Team',
    contact: 'web-team@quakewise.com'
  },

  'quakewise-mobile-api': {
    name: 'QuakeWise Mobile API',
    tier: 'WEB_APP',
    tokenEnvVar: 'SERVICE_TOKEN_MOBILE',
    description: 'Mobile app backend service',
    owner: 'Mobile Team',
    contact: 'mobile-team@quakewise.com'
  },

  'batch-assessment-processor': {
    name: 'Batch Assessment Processor',
    tier: 'BATCH_JOB',
    tokenEnvVar: 'SERVICE_TOKEN_BATCH',
    description: 'Background job processor for bulk assessments',
    owner: 'Backend Team',
    contact: 'backend-team@quakewise.com'
  },

  'analytics-service': {
    name: 'Analytics & Reporting Service',
    tier: 'BATCH_JOB',
    tokenEnvVar: 'SERVICE_TOKEN_ANALYTICS',
    description: 'Data analytics and report generation',
    owner: 'Data Team',
    contact: 'data-team@quakewise.com'
  },

  'dev-testing-service': {
    name: 'Development Testing',
    tier: 'DEV_TESTING',
    tokenEnvVar: 'SERVICE_TOKEN_DEV',
    description: 'For development and testing purposes',
    owner: 'Engineering',
    contact: 'engineering@quakewise.com'
  },

  'dev-hfgate': {
    name: 'Developer - H.F. Gate',
    tier: 'DEV_TESTING',
    tokenEnvVar: 'SERVICE_TOKEN_DEV_HFGATE',
    description: 'Personal development access for H.F. Gate',
    owner: 'Engineering',
    contact: 'h.f.gate@gmail.com'
  },

  'dev-mohammadamin': {
    name: 'Developer - Mohammad Amin',
    tier: 'DEV_TESTING',
    tokenEnvVar: 'SERVICE_TOKEN_DEV_MOHAMMADAMIN',
    description: 'Personal development access for Mohammad Amin',
    owner: 'Engineering',
    contact: 'mohammadaminapi@gmail.com'
  }
};

/**
 * Get service configuration by ID
 */
export function getServiceById(serviceId) {
  return INTERNAL_SERVICES[serviceId] || null;
}

/**
 * Get service token from environment
 */
export function getServiceToken(serviceId) {
  const service = INTERNAL_SERVICES[serviceId];
  if (!service) return null;

  return process.env[service.tokenEnvVar] || null;
}

/**
 * Get all service IDs
 */
export function getAllServiceIds() {
  return Object.keys(INTERNAL_SERVICES);
}

/**
 * Validate if a service ID exists
 */
export function isValidServiceId(serviceId) {
  return serviceId in INTERNAL_SERVICES;
}

/**
 * Get tier configuration for a service
 */
export function getServiceTier(serviceId) {
  const service = INTERNAL_SERVICES[serviceId];
  if (!service) return null;

  return SERVICE_TIERS[service.tier];
}
