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

export const logger = winston.createLogger({
    level: 'info',
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
            filename: path.join(logsDir, 'latest.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),

        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),

        new winston.transports.File({
            filename: path.join(logsDir, 'success.log'),
            level: 'info',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});
