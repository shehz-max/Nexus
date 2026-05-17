import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const { secret } = req.query;

  if (secret !== process.env.SEED_SECRET) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  try {
    const demoPassword = await bcrypt.hash('demo1234', 12);

    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@nexus.io' },
      update: {},
      create: {
        email: 'demo@nexus.io',
        passwordHash: demoPassword,
        name: 'Demo User',
        plan: 'pro',
        maxWorkflows: 100,
        maxRuns: 10000,
        preferences: {
          create: {
            theme: 'dark',
            timezone: 'UTC',
          },
        },
      },
    });

    const starterPassword = await bcrypt.hash('starter123', 12);

    const starterUser = await prisma.user.upsert({
      where: { email: 'starter@nexus.io' },
      update: {},
      create: {
        email: 'starter@nexus.io',
        passwordHash: starterPassword,
        name: 'Starter User',
        plan: 'starter',
        preferences: {
          create: {
            theme: 'dark',
            timezone: 'UTC',
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Demo users created',
      data: {
        users: [
          { email: demoUser.email, password: 'demo1234', plan: demoUser.plan },
          { email: starterUser.email, password: 'starter123', plan: starterUser.plan },
        ],
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
}