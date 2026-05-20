import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';
export declare class AppError extends Error {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
    constructor(code: string, message: string, statusCode?: number, details?: any);
}
export declare const errorHandler: (err: Error, req: Request, res: Response<ApiResponse>, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.d.ts.map