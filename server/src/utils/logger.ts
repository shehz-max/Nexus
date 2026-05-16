type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    const prefix = process.env.NODE_ENV === 'development' ? '' : `[${this.context}]`;
    console.log(`${timestamp} ${level.toUpperCase()}${prefix} ${message}${metaStr}`);
  }

  debug(message: string, meta?: any) { this.log('debug', message, meta); }
  info(message: string, meta?: any) { this.log('info', message, meta); }
  warn(message: string, meta?: any) { this.log('warn', message, meta); }
  error(message: string, meta?: any) { this.log('error', message, meta); }
}

export const createLogger = (context: string) => new Logger(context);

export default createLogger('app');