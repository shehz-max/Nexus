import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { statusCode: 400, message: 'Email and password are required' }
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { statusCode: 401, message: 'Invalid email or password' }
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: { statusCode: 401, message: 'Invalid email or password' }
      });
    }

    const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          avatarUrl: user.avatarUrl,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: { statusCode: 500, message: 'Internal server error' }
    });
  }
}