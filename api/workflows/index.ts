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
        const workflows = await prisma.workflow.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          include: { runs: { take: 5, orderBy: { startedAt: 'desc' } } },
        });
        return res.status(200).json({
          success: true,
          data: { workflows },
        });
      }

      case 'POST': {
        const { name, description, triggerConfig, actions, filters, scheduleConfig } = req.body;

        if (!name) {
          return res.status(400).json({ success: false, error: { statusCode: 400, message: 'Name is required' } });
        }

        const workflowCount = await prisma.workflow.count({ where: { userId } });

        if (workflowCount >= 2) {
          return res.status(403).json({
            success: false,
            error: { statusCode: 403, message: 'Workflow limit reached. Upgrade your plan.' }
          });
        }

        const workflow = await prisma.workflow.create({
          data: {
            userId,
            name,
            description,
            status: 'draft',
            isActive: false,
            triggerConfig: triggerConfig || {},
            actions: actions || [],
            filters: filters || undefined,
            scheduleConfig: scheduleConfig || undefined,
          },
        });

        return res.status(201).json({ success: true, data: workflow });
      }

      default:
        return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }
  } catch (error) {
    console.error('Workflows error:', error);
    return res.status(500).json({ success: false, error: { statusCode: 500, message: 'Internal server error' } });
  }
}