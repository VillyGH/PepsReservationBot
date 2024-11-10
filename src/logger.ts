/**
 * Configurations of logger.
 */
import winston from "winston";
import winstonRotator from "winston-daily-rotate-file";

const consoleConfig = [
    new winston.transports.Console({
        'colorize': true
    })
];

const createLogger = new winston.Logger({
    'transports': consoleConfig
});

export const successLogger = createLogger;
successLogger.add(winstonRotator, {
    'name': 'access-file',
    'level': 'info',
    'filename': './logs/access.log',
    'json': false,
    'datePattern': 'yyyy-MM-dd-',
    'prepend': true
});

export const errorLogger = createLogger;
errorLogger.add(winstonRotator, {
    'name': 'error-file',
    'level': 'error',
    'filename': './logs/error.log',
    'json': false,
    'datePattern': 'yyyy-MM-dd-',
    'prepend': true
});
