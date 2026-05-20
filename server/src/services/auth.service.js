"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const database_js_1 = require("../config/database.js");
const env_js_1 = require("../config/env.js");
const index_js_1 = require("../types/index.js");
const error_js_1 = require("../middleware/error.js");
const SALT_ROUNDS = 12;
class AuthService {
    async register(email, password, name) {
        // Check if user exists
        const existingUser = await database_js_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw new error_js_1.AppError('AUTH_EMAIL_EXISTS', 'An account with this email already exists', 409);
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
        // Create user
        const user = await database_js_1.prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                name,
                plan: 'free',
                maxWorkflows: index_js_1.PLAN_LIMITS.free.maxWorkflows,
                maxRuns: index_js_1.PLAN_LIMITS.free.maxRuns,
                preferences: {
                    create: {},
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                plan: true,
                maxWorkflows: true,
                maxRuns: true,
                createdAt: true,
            },
        });
        // Generate tokens
        const tokens = this.generateTokens(user);
        // Create session
        await database_js_1.prisma.session.create({
            data: {
                userId: user.id,
                refreshToken: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
        return { ...tokens, user };
    }
    async login(email, password) {
        // Find user
        const user = await database_js_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new error_js_1.AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }
        // Check password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new error_js_1.AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }
        // Generate tokens
        const tokens = this.generateTokens({
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            plan: user.plan,
            maxWorkflows: user.maxWorkflows,
            maxRuns: user.maxRuns,
            createdAt: user.createdAt,
        });
        // Create session
        await database_js_1.prisma.session.create({
            data: {
                userId: user.id,
                refreshToken: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        // Log audit
        await this.logAudit(user.id, 'login', 'auth', user.id);
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || undefined,
                avatarUrl: user.avatarUrl || undefined,
                plan: user.plan,
                maxWorkflows: user.maxWorkflows,
                maxRuns: user.maxRuns,
                createdAt: user.createdAt,
            },
        };
    }
    async refresh(refreshToken) {
        // Find session
        const session = await database_js_1.prisma.session.findUnique({
            where: { refreshToken },
            include: { user: true },
        });
        if (!session) {
            throw new error_js_1.AppError('AUTH_SESSION_EXPIRED', 'Session has expired', 401);
        }
        if (session.expiresAt < new Date()) {
            await database_js_1.prisma.session.delete({ where: { id: session.id } });
            throw new error_js_1.AppError('AUTH_SESSION_EXPIRED', 'Session has expired', 401);
        }
        // Generate new tokens
        const user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            avatarUrl: session.user.avatarUrl,
            plan: session.user.plan,
            maxWorkflows: session.user.maxWorkflows,
            maxRuns: session.user.maxRuns,
            createdAt: session.user.createdAt,
        };
        const tokens = this.generateTokens(user);
        // Update session
        await database_js_1.prisma.session.update({
            where: { id: session.id },
            data: {
                refreshToken: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return tokens;
    }
    async logout(refreshToken) {
        await database_js_1.prisma.session.deleteMany({
            where: { refreshToken },
        });
    }
    async getUser(userId) {
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                plan: true,
                maxWorkflows: true,
                maxRuns: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new error_js_1.AppError('USER_NOT_FOUND', 'User not found', 404);
        }
        return user;
    }
    async updateUser(userId, data) {
        const user = await database_js_1.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                plan: true,
                maxWorkflows: true,
                maxRuns: true,
                createdAt: true,
            },
        });
        await this.logAudit(userId, 'update', 'user', userId, { fields: Object.keys(data) });
        return user;
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new error_js_1.AppError('USER_NOT_FOUND', 'User not found', 404);
        }
        // Verify current password
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new error_js_1.AppError('AUTH_INVALID_CREDENTIALS', 'Current password is incorrect', 401);
        }
        // Hash new password
        const passwordHash = await bcryptjs_1.default.hash(newPassword, SALT_ROUNDS);
        await database_js_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        // Invalidate all sessions
        await database_js_1.prisma.session.deleteMany({
            where: { userId },
        });
        await this.logAudit(userId, 'change_password', 'user', userId);
    }
    generateTokens(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            plan: user.plan,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_SECRET, {
            expiresIn: env_js_1.env.JWT_ACCESS_EXPIRES,
        });
        const refreshToken = (0, uuid_1.v4)();
        return { accessToken, refreshToken };
    }
    async logAudit(userId, action, resourceType, resourceId, details) {
        await database_js_1.prisma.auditLog.create({
            data: {
                userId,
                action,
                resourceType,
                resourceId,
                details,
            },
        }).catch(() => { }); // Don't fail on audit errors
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map