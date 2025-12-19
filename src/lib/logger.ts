/**
 * Structured logging with Pino
 *
 * Features:
 * - Pretty console output for CLI
 * - JSON file logging for debugging
 * - Context-aware child loggers
 */

import pino from 'pino';
import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Generate timestamped log filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const logFilePath = path.join(logsDir, `migration-${timestamp}.log`);

// File transport for persistent logging
const fileTransport = pino.transport({
  target: 'pino/file',
  options: { destination: logFilePath },
});

// Pretty console transport for CLI output
const prettyTransport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
});

// Create multi-destination logger
const streams = [
  { stream: fileTransport },
  { stream: prettyTransport, level: process.env.LOG_LEVEL || 'info' },
];

/**
 * Main logger instance
 */
export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'debug', // File gets everything
    base: {
      app: 'bc-migration',
    },
  },
  pino.multistream(streams)
);

/**
 * Get the current log file path
 */
export function getLogFilePath(): string {
  return logFilePath;
}

/**
 * Create a child logger with additional context
 */
export function createChildLogger(context: Record<string, unknown>): pino.Logger {
  return logger.child(context);
}

/**
 * Migration-specific loggers for common contexts
 */
export const migrationLogger = {
  assessment: logger.child({ phase: 'assessment' }),
  categories: logger.child({ phase: 'categories' }),
  products: logger.child({ phase: 'products' }),
  customers: logger.child({ phase: 'customers' }),
  orders: logger.child({ phase: 'orders' }),
  validation: logger.child({ phase: 'validation' }),
};

/**
 * Log an API request/response for debugging
 */
export function logApiCall(
  method: string,
  url: string,
  status?: number,
  duration?: number,
  error?: unknown
): void {
  const data = {
    method,
    url,
    status,
    duration,
    error: error instanceof Error ? error.message : error,
  };

  if (error) {
    logger.error(data, `API call failed: ${method} ${url}`);
  } else {
    logger.debug(data, `API call: ${method} ${url}`);
  }
}

/**
 * Log migration item processing
 */
export function logItemProcessed(
  phase: string,
  itemId: number,
  success: boolean,
  details?: Record<string, unknown>
): void {
  const data = {
    phase,
    itemId,
    success,
    ...details,
  };

  if (success) {
    logger.debug(data, `Processed ${phase} item ${itemId}`);
  } else {
    logger.warn(data, `Failed to process ${phase} item ${itemId}`);
  }
}

/**
 * Log migration phase summary
 */
export function logPhaseSummary(
  phase: string,
  total: number,
  succeeded: number,
  failed: number,
  skipped: number,
  duration: number
): void {
  logger.info(
    {
      phase,
      total,
      succeeded,
      failed,
      skipped,
      duration,
      successRate: total > 0 ? ((succeeded / total) * 100).toFixed(1) + '%' : 'N/A',
    },
    `Phase ${phase} completed: ${succeeded}/${total} succeeded`
  );
}
