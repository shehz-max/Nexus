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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const workflowId = req.query.workflowId as string;
    const status = req.query.status as string;

    const where: any = { workflow: { userId } };
    if (workflowId) where.workflowId = workflowId;
    if (status) where.status = status;

    const [runs, total] = await Promise.all([
      prisma.workflowRun.findMany({
        where,
        include: { workflow: { select: { id: true, name: true } } },
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.workflowRun.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        runs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Runs error:', error);
    return res.status(500).json({ success: false, error: { statusCode: 500, message: 'Internal server error' } });
  }
}