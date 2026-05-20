"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
class Logger {
    context;
    constructor(context) {
        this.context = context;
    }
    log(level, message, meta) {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        const prefix = process.env.NODE_ENV === 'development' ? '' : `[${this.context}]`;
        console.log(`${timestamp} ${level.toUpperCase()}${prefix} ${message}${metaStr}`);
    }
    debug(message, meta) { this.log('debug', message, meta); }
    info(message, meta) { this.log('info', message, meta); }
    warn(message, meta) { this.log('warn', message, meta); }
    error(message, meta) { this.log('error', message, meta); }
}
const createLogger = (context) => new Logger(context);
exports.createLogger = createLogger;
exports.default = (0, exports.createLogger)('app');
//# sourceMappingURL=logger.js.map