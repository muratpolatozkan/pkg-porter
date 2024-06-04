const { createLogger, format, transports } = require('winston'); // Importing winston for logging
const DailyRotateFile = require('winston-daily-rotate-file'); // Importing daily rotate file transport for log rotation
const path = require('path'); // Importing path module to handle file paths

let logger = null;

// Check if logging is enabled through environment variable
if (process.env.USE_LOGGER === 'true') {
    // Create a logger instance with specified configurations
    logger = createLogger({
        level: 'info', // Set log level to info
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss' // Timestamp format
            }),
            format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`) // Log message format
        ),
        transports: [
            new transports.Console(), // Log to console
            new DailyRotateFile({
                // Update the path to store logs in the parent directory
                filename: path.join(__dirname, '..', 'logs', 'application-%DATE%.log'), 
                datePattern: 'YYYY-MM-DD', // Rotate daily
                zippedArchive: true, // Compress logs
                maxSize: '20m', // Max size of log file before rotation
                maxFiles: '14d' // Keep logs for 14 days
            })
        ]
    });
}

/**
 * Custom log function to handle logging based on environment variable
 * @param {string} level - The log level (info, warn, error, etc.)
 * @param {string} message - The log message
 */
const log = (level, message) => {
    if (process.env.USE_LOGGER === 'true' && logger) {
        // If logging is enabled, log through winston logger
        logger.log({ level, message });
    } else {
        // Otherwise, log to console
        console.log(`${new Date().toISOString()} ${level}: ${message}`);
    }
};

// Exporting the logger instance and the custom log function
module.exports = {
    logger,
    log
};
