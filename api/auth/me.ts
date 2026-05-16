import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getUserIdFromToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.split(':')[0];
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) {
    return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        avatarUrl: true,
        createdAt: true,
        preferences: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { statusCode: 404, message: 'User not found' } });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Invalid token' } });
  }
}