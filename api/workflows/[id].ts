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
      case 'GET': {
        const workflow = await prisma.workflow.findFirst({
          where: { id: id as string, userId },
          include: { runs: { take: 10, orderBy: { startedAt: 'desc' } } },
        });

        if (!workflow) {
          return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });
        }

        return res.status(200).json({ success: true, data: workflow });
      }

      case 'PATCH': {
        const { name, description, status, isActive, triggerConfig, actions } = req.body;

        const workflow = await prisma.workflow.update({
          where: { id: id as string },
          data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(status !== undefined && { status }),
            ...(isActive !== undefined && { isActive }),
            ...(triggerConfig !== undefined && { triggerConfig }),
            ...(actions !== undefined && { actions }),
          },
        });

        return res.status(200).json({ success: true, data: workflow });
      }

      case 'DELETE': {
        await prisma.workflowRun.deleteMany({ where: { workflowId: id as string } });
        await prisma.workflow.delete({ where: { id: id as string } });

        return res.status(200).json({ success: true, message: 'Workflow deleted' });
      }

      default:
        return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }
  } catch (error) {
    console.error('Workflow error:', error);
    return res.status(500).json({ success: false, error: { statusCode: 500, message: 'Internal server error' } });
  }
}