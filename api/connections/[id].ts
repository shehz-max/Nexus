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
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) {
    return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
  }

  const { id } = req.query;

  try {
    switch (req.method) {
      case 'DELETE': {
        const connection = await prisma.connection.findFirst({ where: { id: id as string, userId } });

        if (!connection) {
          return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Connection not found' } });
        }

        await prisma.connection.delete({ where: { id: id as string } });

        return res.status(200).json({ success: true, message: 'Connection deleted' });
      }

      default:
        return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }
  } catch (error) {
    console.error('Connection error:', error);
    return res.status(500).json({ success: false, error: { statusCode: 500, message: 'Internal server error' } });
  }
}