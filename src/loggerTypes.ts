import { logger } from "./logger.js";

interface LoggerInterface {
    error(message: string, ...meta: any[]): void;
    warn(message: string, ...meta: any[]): void;
    info(message: string, ...meta: any[]): void;
    debug(message: string, ...meta: any[]): void;
    success(message: string, ...meta: any[]): void;
}

export const infoLogger: LoggerInterface = {
    error: (message, ...meta) => logger.error(message, meta),
    warn: (message, ...meta) => logger.warn(message, meta),
    info: (message, ...meta) => logger.info(message, meta),
    debug: (message, ...meta) => logger.debug(message, meta),
    success: (message) => logger.log("success", message),
};
