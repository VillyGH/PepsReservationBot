// Logging interface for type safety
import logger from "./logger";

interface LoggerInterface {
    error(message: string, ...meta: any[]): void;
    warn(message: string, ...meta: any[]): void;
    info(message: string, ...meta: any[]): void;
    debug(message: string, ...meta: any[]): void;
}

// Create typed loggers
export const errorLogger: LoggerInterface = {
    error: (message, ...meta) => logger.error(message, meta),
    warn: (message, ...meta) => logger.warn(message, meta),
    info: (message, ...meta) => logger.info(message, meta),
    debug: (message, ...meta) => logger.debug(message, meta)
};

export const successLogger: LoggerInterface = {
    error: (message, ...meta) => logger.error(message, meta),
    warn: (message, ...meta) => logger.warn(message, meta),
    info: (message, ...meta) => logger.info(message, meta),
    debug: (message, ...meta) => logger.debug(message, meta)
};

export const infoLogger: LoggerInterface = {
    error: (message, ...meta) => logger.error(message, meta),
    warn: (message, ...meta) => logger.warn(message, meta),
    info: (message, ...meta) => logger.info(message, meta),
    debug: (message, ...meta) => logger.debug(message, meta)
};
