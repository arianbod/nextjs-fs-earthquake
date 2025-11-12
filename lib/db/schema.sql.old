-- QuakeWise External API Database Schema
-- SQLite schema for tracking API usage, apps, and rate limits

-- Platform apps registry
-- Stores information about external applications using the API
CREATE TABLE IF NOT EXISTS api_apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform_token_hash TEXT NOT NULL UNIQUE,
  tier TEXT DEFAULT 'free' CHECK(tier IN ('free', 'pro', 'enterprise')),
  rate_limit_per_hour INTEGER DEFAULT 100,
  rate_limit_per_day INTEGER DEFAULT 1000,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME,
  metadata TEXT, -- JSON string for additional app metadata
  UNIQUE(id)
);

-- Create index on platform_token_hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_api_apps_token ON api_apps(platform_token_hash);
CREATE INDEX IF NOT EXISTS idx_api_apps_status ON api_apps(status);

-- Usage tracking
-- Records every API call for analytics and billing
CREATE TABLE IF NOT EXISTS api_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  user_id TEXT, -- From JWT token
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  response_time_ms INTEGER,
  status_code INTEGER,
  error_code TEXT,
  ip_address TEXT,
  user_agent TEXT,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  FOREIGN KEY (app_id) REFERENCES api_apps(id) ON DELETE CASCADE
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_api_usage_app_id ON api_usage(app_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_app_timestamp ON api_usage(app_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);

-- Rate limit tracking
-- Tracks API calls per time window for rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  app_id TEXT NOT NULL,
  window_start DATETIME NOT NULL,
  window_type TEXT NOT NULL CHECK(window_type IN ('hour', 'day', 'minute')),
  request_count INTEGER DEFAULT 0,
  PRIMARY KEY (app_id, window_start, window_type),
  FOREIGN KEY (app_id) REFERENCES api_apps(id) ON DELETE CASCADE
);

-- Create index for fast rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_app_window ON rate_limits(app_id, window_start, window_type);

-- API tokens (optional - for revocation tracking)
-- Tracks issued JWT tokens if needed for revocation
CREATE TABLE IF NOT EXISTS api_tokens (
  token_id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  revoked BOOLEAN DEFAULT 0,
  revoked_at DATETIME,
  revoke_reason TEXT,
  FOREIGN KEY (app_id) REFERENCES api_apps(id) ON DELETE CASCADE
);

-- Create indexes for token management
CREATE INDEX IF NOT EXISTS idx_api_tokens_app_id ON api_tokens(app_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON api_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_revoked ON api_tokens(revoked);
CREATE INDEX IF NOT EXISTS idx_api_tokens_expires_at ON api_tokens(expires_at);

-- Error logs
-- Detailed error tracking for debugging
CREATE TABLE IF NOT EXISTS api_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT,
  user_id TEXT,
  endpoint TEXT NOT NULL,
  error_code TEXT NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  request_body TEXT, -- JSON string (be careful with PII)
  resolved BOOLEAN DEFAULT 0,
  FOREIGN KEY (app_id) REFERENCES api_apps(id) ON DELETE SET NULL
);

-- Create indexes for error tracking
CREATE INDEX IF NOT EXISTS idx_api_errors_app_id ON api_errors(app_id);
CREATE INDEX IF NOT EXISTS idx_api_errors_timestamp ON api_errors(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_errors_error_code ON api_errors(error_code);
CREATE INDEX IF NOT EXISTS idx_api_errors_resolved ON api_errors(resolved);

-- Usage summary (for analytics)
-- Materialized view-like table for quick stats
CREATE TABLE IF NOT EXISTS api_usage_summary (
  app_id TEXT NOT NULL,
  date DATE NOT NULL,
  endpoint TEXT NOT NULL,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  avg_response_time_ms REAL,
  total_data_bytes INTEGER DEFAULT 0,
  PRIMARY KEY (app_id, date, endpoint),
  FOREIGN KEY (app_id) REFERENCES api_apps(id) ON DELETE CASCADE
);

-- Create index for summary queries
CREATE INDEX IF NOT EXISTS idx_api_usage_summary_app_date ON api_usage_summary(app_id, date);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_api_apps_timestamp
AFTER UPDATE ON api_apps
FOR EACH ROW
BEGIN
  UPDATE api_apps SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Views for common queries

-- Active apps view
CREATE VIEW IF NOT EXISTS v_active_apps AS
SELECT
  id,
  name,
  tier,
  rate_limit_per_hour,
  rate_limit_per_day,
  created_at,
  last_used_at
FROM api_apps
WHERE status = 'active';

-- Daily usage stats view
CREATE VIEW IF NOT EXISTS v_daily_usage_stats AS
SELECT
  app_id,
  DATE(timestamp) as date,
  COUNT(*) as total_requests,
  SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as successful_requests,
  SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as failed_requests,
  AVG(response_time_ms) as avg_response_time,
  MAX(response_time_ms) as max_response_time,
  MIN(response_time_ms) as min_response_time
FROM api_usage
GROUP BY app_id, DATE(timestamp);

-- Popular endpoints view
CREATE VIEW IF NOT EXISTS v_popular_endpoints AS
SELECT
  endpoint,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response_time,
  SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as success_count,
  SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count
FROM api_usage
WHERE timestamp >= datetime('now', '-7 days')
GROUP BY endpoint
ORDER BY request_count DESC;

-- Error frequency view
CREATE VIEW IF NOT EXISTS v_error_frequency AS
SELECT
  error_code,
  endpoint,
  COUNT(*) as occurrence_count,
  MAX(timestamp) as last_occurred
FROM api_errors
WHERE timestamp >= datetime('now', '-7 days')
GROUP BY error_code, endpoint
ORDER BY occurrence_count DESC;

-- Sample data (commented out - uncomment to insert test data)
-- INSERT INTO api_apps (id, name, platform_token_hash, tier, rate_limit_per_hour)
-- VALUES ('test-app-1', 'Test Application', 'hashed_token_here', 'pro', 1000);
