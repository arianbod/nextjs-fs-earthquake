/**
 * API Logging Service for QuakeWise External API
 * Structured logging for monitoring, debugging, and analytics
 */

import fs from 'fs';
import path from 'path';

// Log levels
export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

// Log directory
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Formats log entry as JSON
 */
function formatLogEntry(level, message, metadata = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  });
}

/**
 * Writes log to file
 */
function writeLog(level, message, metadata = {}) {
  const logEntry = formatLogEntry(level, message, metadata);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const colors = {
      DEBUG: '\x1b[36m',   // Cyan
      INFO: '\x1b[32m',    // Green
      WARN: '\x1b[33m',    // Yellow
      ERROR: '\x1b[31m',   // Red
      CRITICAL: '\x1b[35m' // Magenta
    };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}[${level}]${reset}`, message, metadata);
  }

  // Write to file
  const date = new Date().toISOString().split('T')[0];
  const logFile = path.join(LOG_DIR, `api-${date}.log`);

  try {
    fs.appendFileSync(logFile, logEntry + '\n');
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

/**
 * Logger class
 */
class ApiLogger {
  constructor(context = {}) {
    this.context = context;
  }

  /**
   * Creates a child logger with additional context
   */
  child(additionalContext) {
    return new ApiLogger({ ...this.context, ...additionalContext });
  }

  /**
   * Debug level logging
   */
  debug(message, metadata = {}) {
    writeLog(LogLevel.DEBUG, message, { ...this.context, ...metadata });
  }

  /**
   * Info level logging
   */
  info(message, metadata = {}) {
    writeLog(LogLevel.INFO, message, { ...this.context, ...metadata });
  }

  /**
   * Warning level logging
   */
  warn(message, metadata = {}) {
    writeLog(LogLevel.WARN, message, { ...this.context, ...metadata });
  }

  /**
   * Error level logging
   */
  error(message, metadata = {}, error = null) {
    const errorMetadata = { ...this.context, ...metadata };

    if (error instanceof Error) {
      errorMetadata.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    writeLog(LogLevel.ERROR, message, errorMetadata);
  }

  /**
   * Critical level logging
   */
  critical(message, metadata = {}, error = null) {
    const errorMetadata = { ...this.context, ...metadata };

    if (error instanceof Error) {
      errorMetadata.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    writeLog(LogLevel.CRITICAL, message, errorMetadata);
  }

  /**
   * Logs API request
   */
  logRequest(request, metadata = {}) {
    const url = new URL(request.url);

    this.info('API Request', {
      ...metadata,
      method: request.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: {
        'user-agent': request.headers.get('user-agent'),
        'content-type': request.headers.get('content-type'),
        'x-forwarded-for': request.headers.get('x-forwarded-for')
      }
    });
  }

  /**
   * Logs API response
   */
  logResponse(request, response, duration, metadata = {}) {
    const url = new URL(request.url);

    this.info('API Response', {
      ...metadata,
      method: request.method,
      path: url.pathname,
      statusCode: response.status,
      duration: `${duration}ms`
    });
  }

  /**
   * Logs API error
   */
  logApiError(request, error, metadata = {}) {
    const url = new URL(request.url);

    this.error('API Error', {
      ...metadata,
      method: request.method,
      path: url.pathname
    }, error);
  }
}

/**
 * Creates a logger instance
 */
export function createLogger(context = {}) {
  return new ApiLogger(context);
}

/**
 * Default logger instance
 */
export const logger = new ApiLogger();

/**
 * Middleware to log API requests/responses
 */
export function createLoggingMiddleware() {
  return async (request, handler) => {
    const requestLogger = createLogger({
      requestId: generateRequestId()
    });

    // Log incoming request
    requestLogger.logRequest(request);

    const startTime = Date.now();

    try {
      // Execute handler
      const response = await handler(request);
      const duration = Date.now() - startTime;

      // Log successful response
      requestLogger.logResponse(request, response, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      requestLogger.logApiError(request, error, { duration: `${duration}ms` });

      throw error;
    }
  };
}

/**
 * Generates unique request ID
 */
function generateRequestId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `req_${timestamp}_${random}`;
}

/**
 * Cleans up old log files
 */
export function cleanupOldLogs(daysToKeep = 30) {
  try {
    const files = fs.readdirSync(LOG_DIR);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      const filePath = path.join(LOG_DIR, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtime.getTime();

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old log file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Failed to cleanup old logs:', error);
  }
}

export default logger;
