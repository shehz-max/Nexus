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

  try {
    switch (req.method) {
      case 'GET': {
        const connections = await prisma.connection.findMany({
          where: { userId },
          include: { integration: true },
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({
          success: true,
          data: {
            connections: connections.map(c => ({
              id: c.id,
              integrationId: c.integrationId,
              integration: c.integration,
              provider: c.provider,
              providerId: c.providerId,
              displayName: c.displayName,
              status: c.status,
              lastUsedAt: c.lastUsedAt,
              createdAt: c.createdAt,
            }))
          },
        });
      }

      case 'POST': {
        const { integrationId, provider = 'oauth' } = req.body;

        const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
        if (!integration) {
          return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Integration not found' } });
        }

        const connection = await prisma.connection.create({
          data: {
            userId,
            integrationId,
            provider,
            accessToken: 'mock_token_' + Date.now(),
            status: 'active',
          },
          include: { integration: true },
        });

        return res.status(201).json({
          success: true,
          data: {
            id: connection.id,
            integrationId: connection.integrationId,
            integration: connection.integration,
            provider: connection.provider,
            displayName: connection.displayName,
            status: connection.status,
          },
        });
      }

      default:
        return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }
  } catch (error) {
    console.error('Connections error:', error);
    return res.status(500).json({ success: false, error: { statusCode: 500, message: 'Internal server error' } });
  }
}