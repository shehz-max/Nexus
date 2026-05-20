declare class Logger {
    private context;
    constructor(context: string);
    private log;
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
export declare const createLogger: (context: string) => Logger;
declare const _default: Logger;
export default _default;
//# sourceMappingURL=logger.d.ts.map