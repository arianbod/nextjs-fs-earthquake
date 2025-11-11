/**
 * Usage Tracking Service for QuakeWise External API
 * Handles database operations for API usage tracking and analytics
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Database file location
const DB_PATH = process.env.API_DATABASE_PATH || path.join(process.cwd(), 'data', 'api_usage.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Gets database instance (singleton pattern)
 */
let dbInstance = null;
function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
    });
    dbInstance.pragma('journal_mode = WAL'); // Better performance
    initializeDatabase();
  }
  return dbInstance;
}

/**
 * Initializes database schema
 */
function initializeDatabase() {
  const db = dbInstance;
  const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');

  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Tracks an API request
 */
export async function trackApiUsage({
  appId,
  userId = null,
  endpoint,
  method,
  statusCode,
  responseTimeMs,
  errorCode = null,
  ipAddress = null,
  userAgent = null,
  requestSizeBytes = 0,
  responseSizeBytes = 0
}) {
  const db = getDb();

  try {
    const stmt = db.prepare(`
      INSERT INTO api_usage (
        app_id, user_id, endpoint, method,
        status_code, response_time_ms, error_code,
        ip_address, user_agent,
        request_size_bytes, response_size_bytes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      appId,
      userId,
      endpoint,
      method,
      statusCode,
      responseTimeMs,
      errorCode,
      ipAddress,
      userAgent,
      requestSizeBytes,
      responseSizeBytes
    );

    // Update last_used_at for app
    const updateStmt = db.prepare(`
      UPDATE api_apps
      SET last_used_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateStmt.run(appId);

    return { success: true };
  } catch (error) {
    console.error('Failed to track API usage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Records an API error
 */
export async function trackApiError({
  appId,
  userId = null,
  endpoint,
  errorCode,
  errorMessage,
  stackTrace = null,
  requestBody = null
}) {
  const db = getDb();

  try {
    const stmt = db.prepare(`
      INSERT INTO api_errors (
        app_id, user_id, endpoint, error_code,
        error_message, stack_trace, request_body
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      appId,
      userId,
      endpoint,
      errorCode,
      errorMessage,
      stackTrace,
      requestBody ? JSON.stringify(requestBody) : null
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to track API error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Checks and updates rate limit for an app
 * @returns {Object} - { allowed: boolean, remaining: number, resetAt: Date }
 */
export function checkRateLimit(appId, windowType = 'hour') {
  const db = getDb();

  try {
    // Get app's rate limit
    const appStmt = db.prepare('SELECT tier, rate_limit_per_hour, rate_limit_per_day FROM api_apps WHERE id = ? AND status = "active"');
    const app = appStmt.get(appId);

    if (!app) {
      return { allowed: false, error: 'App not found or inactive' };
    }

    const limit = windowType === 'hour' ? app.rate_limit_per_hour : app.rate_limit_per_day;

    // Calculate window start time
    const now = new Date();
    let windowStart;
    if (windowType === 'hour') {
      windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    } else {
      windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Get or create rate limit record
    const checkStmt = db.prepare(`
      SELECT request_count FROM rate_limits
      WHERE app_id = ? AND window_start = ? AND window_type = ?
    `);
    const record = checkStmt.get(appId, windowStart.toISOString(), windowType);

    const currentCount = record ? record.request_count : 0;

    if (currentCount >= limit) {
      const resetAt = new Date(windowStart);
      resetAt.setHours(resetAt.getHours() + (windowType === 'hour' ? 1 : 24));

      return {
        allowed: false,
        remaining: 0,
        limit: limit,
        resetAt: resetAt.toISOString(),
        tier: app.tier
      };
    }

    // Increment counter
    const upsertStmt = db.prepare(`
      INSERT INTO rate_limits (app_id, window_start, window_type, request_count)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(app_id, window_start, window_type)
      DO UPDATE SET request_count = request_count + 1
    `);
    upsertStmt.run(appId, windowStart.toISOString(), windowType);

    const resetAt = new Date(windowStart);
    resetAt.setHours(resetAt.getHours() + (windowType === 'hour' ? 1 : 24));

    return {
      allowed: true,
      remaining: limit - currentCount - 1,
      limit: limit,
      resetAt: resetAt.toISOString(),
      tier: app.tier
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: false, error: error.message };
  }
}

/**
 * Gets usage statistics for an app
 */
export function getAppUsageStats(appId, days = 7) {
  const db = getDb();

  try {
    const stmt = db.prepare(`
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as total_requests,
        SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as successful_requests,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as failed_requests,
        AVG(response_time_ms) as avg_response_time,
        MAX(response_time_ms) as max_response_time
      FROM api_usage
      WHERE app_id = ?
        AND timestamp >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `);

    const stats = stmt.all(appId, days);

    return { success: true, stats };
  } catch (error) {
    console.error('Failed to get usage stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets endpoint usage breakdown for an app
 */
export function getEndpointUsage(appId, days = 7) {
  const db = getDb();

  try {
    const stmt = db.prepare(`
      SELECT
        endpoint,
        COUNT(*) as request_count,
        AVG(response_time_ms) as avg_response_time,
        SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count
      FROM api_usage
      WHERE app_id = ?
        AND timestamp >= datetime('now', '-' || ? || ' days')
      GROUP BY endpoint
      ORDER BY request_count DESC
    `);

    const endpoints = stmt.all(appId, days);

    return { success: true, endpoints };
  } catch (error) {
    console.error('Failed to get endpoint usage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Registers a new platform app
 */
export function registerApp({ appId, name, tier = 'free', platformToken }) {
  const db = getDb();

  try {
    // Hash the platform token
    const tokenHash = crypto.createHash('sha256').update(platformToken).digest('hex');

    const stmt = db.prepare(`
      INSERT INTO api_apps (id, name, tier, platform_token_hash)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(appId, name, tier, tokenHash);

    return { success: true, appId };
  } catch (error) {
    console.error('Failed to register app:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gets app details by ID
 */
export function getApp(appId) {
  const db = getDb();

  try {
    const stmt = db.prepare(`
      SELECT id, name, tier, rate_limit_per_hour, rate_limit_per_day,
             status, created_at, last_used_at
      FROM api_apps
      WHERE id = ?
    `);

    const app = stmt.get(appId);

    if (!app) {
      return { success: false, error: 'App not found' };
    }

    return { success: true, app };
  } catch (error) {
    console.error('Failed to get app:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates app tier and rate limits
 */
export function updateAppTier(appId, tier) {
  const db = getDb();

  const tierLimits = {
    free: { hour: 100, day: 1000 },
    pro: { hour: 1000, day: 10000 },
    enterprise: { hour: 10000, day: 100000 }
  };

  const limits = tierLimits[tier] || tierLimits.free;

  try {
    const stmt = db.prepare(`
      UPDATE api_apps
      SET tier = ?, rate_limit_per_hour = ?, rate_limit_per_day = ?
      WHERE id = ?
    `);

    stmt.run(tier, limits.hour, limits.day, appId);

    return { success: true };
  } catch (error) {
    console.error('Failed to update app tier:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cleans up old rate limit records (run periodically)
 */
export function cleanupOldRateLimits(daysOld = 7) {
  const db = getDb();

  try {
    const stmt = db.prepare(`
      DELETE FROM rate_limits
      WHERE window_start < datetime('now', '-' || ? || ' days')
    `);

    const result = stmt.run(daysOld);

    console.log(`Cleaned up ${result.changes} old rate limit records`);
    return { success: true, deleted: result.changes };
  } catch (error) {
    console.error('Failed to cleanup rate limits:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Closes database connection
 */
export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Export database instance for direct queries if needed
export { getDb };
