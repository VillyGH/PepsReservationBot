import winston from 'winston';
import path from 'path';
import fs from 'fs';

export const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

export const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
        if (stack) {
            return `${timestamp} [${level}]: ${message}\n${stack}`;
        }
        return `${timestamp} [${level}]: ${message}`;
    })
);

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
        success: 7,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        http: 'magenta',
        verbose: 'cyan',
        debug: 'green',
        silly: 'gray',
        success: 'green',
    },
};

winston.addColors(customLevels.colors);

export const logger = winston.createLogger({
    levels: customLevels.levels,
    level: 'success',
    format: logFormat,
    defaultMeta: { service: 'reservation-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                logFormat
            )
        }),

        new winston.transports.File({
            level: 'success',
            filename: path.join(logsDir, 'latest.log'),
            maxsize: 5242880,
            maxFiles: 5
        }),
    ]
});
