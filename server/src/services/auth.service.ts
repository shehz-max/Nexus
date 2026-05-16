import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { AuthTokens, User, PLAN_LIMITS } from '../types/index.js';
import { AppError } from '../middleware/error.js';

const SALT_ROUNDS = 12;

export class AuthService {
  async register(email: string, password: string, name?: string): Promise<AuthTokens & { user: User }> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('AUTH_EMAIL_EXISTS', 'An account with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        plan: 'free',
        maxWorkflows: PLAN_LIMITS.free.maxWorkflows,
        maxRuns: PLAN_LIMITS.free.maxRuns,
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
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { ...tokens, user };
  }

  async login(email: string, password: string): Promise<AuthTokens & { user: User }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
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
    await prisma.session.create({
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

  async refresh(refreshToken: string): Promise<AuthTokens> {
    // Find session
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new AppError('AUTH_SESSION_EXPIRED', 'Session has expired', 401);
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new AppError('AUTH_SESSION_EXPIRED', 'Session has expired', 401);
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
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  async getUser(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
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
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    return user;
  }

  async updateUser(userId: string, data: { name?: string; avatarUrl?: string }): Promise<User> {
    const user = await prisma.user.update({
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

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('AUTH_INVALID_CREDENTIALS', 'Current password is incorrect', 401);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({
      where: { userId },
    });

    await this.logAudit(userId, 'change_password', 'user', userId);
  }

  private generateTokens(user: User): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
      plan: user.plan,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES,
    });

    const refreshToken = uuidv4();

    return { accessToken, refreshToken };
  }

  private async logAudit(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details?: any
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        details,
      },
    }).catch(() => {}); // Don't fail on audit errors
  }
}

export const authService = new AuthService();