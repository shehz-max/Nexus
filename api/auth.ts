import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

function getUserIdFromToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.split(':')[0];
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;
  const userId = getUserIdFromToken(req.headers.authorization);

  res.setHeader('Content-Type', 'application/json');

  try {
    switch (action) {
      case 'login': {
        if (req.method !== 'POST') return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
        
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'Email and password required' } });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Invalid credentials' } });

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Invalid credentials' } });

        const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');
        return res.status(200).json({
          success: true,
          data: { user: { id: user.id, email: user.email, name: user.name, plan: user.plan, avatarUrl: user.avatarUrl }, token },
        });
      }

      case 'register': {
        if (req.method !== 'POST') return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });

        const { email, password, name } = req.body || {};
        if (!email || !password) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'Email and password required' } });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ success: false, error: { statusCode: 409, message: 'Email already registered' } });

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
          data: { email, passwordHash, name: name || email.split('@')[0], plan: 'starter', maxWorkflows: 10, maxRuns: 1000, preferences: { create: { theme: 'dark', timezone: 'UTC' } } },
        });

        const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');
        return res.status(201).json({
          success: true,
          data: { user: { id: user.id, email: user.email, name: user.name, plan: user.plan, avatarUrl: user.avatarUrl }, token },
        });
      }

      case 'me': {
        if (req.method !== 'POST') return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true, plan: true, avatarUrl: true, maxWorkflows: true, maxRuns: true },
        });

        if (!user) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'User not found' } });
        return res.status(200).json({ success: true, data: { user } });
      }

      case 'logout': {
        return res.status(200).json({ success: true, data: { message: 'Logged out' } });
      }

      case 'google': {
        return res.redirect(302, '/api/auth?action=callback&provider=google');
      }

      case 'github': {
        return res.redirect(302, '/api/auth?action=callback&provider=github');
      }

      case 'seed': {
        const demoPassword = await bcrypt.hash('demo1234', 12);
        const demoUser = await prisma.user.upsert({
          where: { email: 'demo@nexus.io' },
          update: {},
          create: { email: 'demo@nexus.io', passwordHash: demoPassword, name: 'Demo User', plan: 'pro', maxWorkflows: 100, maxRuns: 10000, preferences: { create: { theme: 'dark', timezone: 'UTC' } } },
        });

        const starterPassword = await bcrypt.hash('starter123', 12);
        const starterUser = await prisma.user.upsert({
          where: { email: 'starter@nexus.io' },
          update: {},
          create: { email: 'starter@nexus.io', passwordHash: starterPassword, name: 'Starter User', plan: 'starter', preferences: { create: { theme: 'dark', timezone: 'UTC' } } },
        });

        return res.status(200).json({ success: true, data: { users: [{ email: demoUser.email, password: 'demo1234', plan: demoUser.plan }, { email: starterUser.email, password: 'starter123', plan: starterUser.plan }] } });
      }

      default:
        return res.status(400).json({ success: false, error: { message: 'Invalid action' } });
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    return res.status(500).json({ success: false, error: { statusCode: 500, message: error?.message || 'Internal server error' } });
  }
}