/**
 * Lightweight logger shared by the GitHub scripts.
 */
const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };

const STREAMS = {
  ERROR: console.error,
  WARN: console.error,
  INFO: console.log,
  DEBUG: console.log,
};

let currentLogLevel = LOG_LEVELS.WARN;

/**
 * Emit a structured log message when the level is enabled.
 * @param {'ERROR'|'WARN'|'INFO'|'DEBUG'} level
 * @param {string} message
 * @param {unknown} [data]
 */
function log(level, message, data = null) {
  if (LOG_LEVELS[level] <= currentLogLevel) {
    const timestamp = new Date().toISOString();
    const output = STREAMS[level] ?? console.log;
    output(`[${timestamp}] ${level}: ${message}`);
    if (data) output(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  }
}

/**
 * Update the current log level if the provided level is supported.
 * @param {'ERROR'|'WARN'|'INFO'|'DEBUG'} level
 */
function setLogLevel(level) {
  if (LOG_LEVELS[level] !== undefined) {
    currentLogLevel = LOG_LEVELS[level];
  }
}

/**
 * Enable verbose (debug) logging for the current process.
 */
function enableVerboseLogging() {
  setLogLevel('DEBUG');
}

export { LOG_LEVELS, log, setLogLevel, enableVerboseLogging };
