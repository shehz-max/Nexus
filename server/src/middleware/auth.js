"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePlan = exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_TOKEN_MISSING',
                    message: 'Authorization token is required',
                },
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_TOKEN_MISSING',
                    message: 'Authorization token is required',
                },
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            plan: decoded.plan,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_TOKEN_EXPIRED',
                    message: 'Authorization token has expired',
                },
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_TOKEN_INVALID',
                    message: 'Invalid authorization token',
                },
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'AUTH_ERROR',
                message: 'Authentication failed',
            },
        });
    }
};
exports.authenticate = authenticate;
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (token) {
                const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
                req.user = {
                    id: decoded.userId,
                    email: decoded.email,
                    plan: decoded.plan,
                };
            }
        }
        next();
    }
    catch {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requirePlan = (allowedPlans) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Authentication required',
                },
            });
            return;
        }
        if (!allowedPlans.includes(req.user.plan)) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'PLAN_REQUIRED',
                    message: `This feature requires ${allowedPlans.join(' or ')} plan`,
                },
            });
            return;
        }
        next();
    };
};
exports.requirePlan = requirePlan;
//# sourceMappingURL=auth.js.map