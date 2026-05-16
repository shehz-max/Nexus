import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { statusCode: 400, message: 'Email and password are required' }
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: { statusCode: 400, message: 'Password must be at least 8 characters' }
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { statusCode: 400, message: 'User already exists with this email' }
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        preferences: {
          create: {
            theme: 'dark',
            timezone: 'UTC',
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    });

    const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');

    return res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      error: { statusCode: 500, message: 'Internal server error' }
    });
  }
}