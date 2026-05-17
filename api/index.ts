import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getUserIdFromToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.split(':')[0];
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { resource, id, page, limit, workflowId, status } = req.query;
  const userId = getUserIdFromToken(req.headers.authorization);

  try {
    switch (resource) {
      case 'integrations': {
        const integrations = [
          { id: 'google_sheets', slug: 'google-sheets', name: 'Google Sheets', description: 'Create, edit, and collaborate on spreadsheets online', icon: '📊', category: 'Spreadsheets', authType: 'oauth2', triggers: [{ id: 'new_row', name: 'New Row Added' }], actions: [{ id: 'create_row', name: 'Create Row' }, { id: 'update_row', name: 'Update Row' }] },
          { id: 'gmail', slug: 'gmail', name: 'Gmail', description: 'Send and receive emails through your Google account', icon: '📧', category: 'Communication', authType: 'oauth2', triggers: [{ id: 'new_email', name: 'New Email' }], actions: [{ id: 'send_email', name: 'Send Email' }] },
          { id: 'slack', slug: 'slack', name: 'Slack', description: 'Team communication and collaboration platform', icon: '💬', category: 'Communication', authType: 'oauth2', triggers: [{ id: 'new_message', name: 'New Message' }], actions: [{ id: 'send_message', name: 'Send Message' }] },
          { id: 'notion', slug: 'notion', name: 'Notion', description: 'All-in-one workspace for notes, tasks, and collaboration', icon: '📝', category: 'Productivity', authType: 'oauth2', triggers: [{ id: 'new_page', name: 'New Page' }], actions: [{ id: 'create_page', name: 'Create Page' }] },
          { id: 'hubspot', slug: 'hubspot', name: 'HubSpot', description: 'CRM, marketing, and sales automation platform', icon: '🔷', category: 'CRM', authType: 'oauth2', triggers: [{ id: 'new_contact', name: 'New Contact' }], actions: [{ id: 'create_contact', name: 'Create Contact' }] },
        ];
        return res.status(200).json({ success: true, data: { integrations } });
      }

      case 'workflows': {
        if (req.method === 'POST') {
          if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

          const { name, description, status: wfStatus, trigger, actions } = req.body || {};
          if (!name) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'Name required' } });

          const workflow = await prisma.workflow.create({
            data: {
              userId,
              name,
              description,
              status: wfStatus || 'draft',
              triggerConfig: trigger ? JSON.stringify(trigger) : '{}',
              actions: actions ? JSON.stringify(actions) : '[]',
              isActive: false,
            },
          });

          return res.status(201).json({ success: true, data: { workflow } });
        }

        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const workflows = await prisma.workflow.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
        });

        return res.status(200).json({ success: true, data: { workflows } });
      }

      case 'workflows_get': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const workflow = await prisma.workflow.findFirst({
          where: { id: id as string, userId },
          include: { workflowRuns: { take: 10, orderBy: { createdAt: 'desc' } } },
        });

        if (!workflow) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        const normalized = {
          ...workflow,
          triggerConfig: typeof workflow.triggerConfig === 'string' ? JSON.parse(workflow.triggerConfig) : workflow.triggerConfig,
          actions: typeof workflow.actions === 'string' ? JSON.parse(workflow.actions) : workflow.actions,
          workflowRuns: workflow.workflowRuns,
        };

        return res.status(200).json({ success: true, data: { workflow: normalized } });
      }

      case 'workflows_update': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const { status: wfStatus, isActive, name, description } = req.body || {};

        const existing = await prisma.workflow.findFirst({ where: { id: id as string, userId } });
        if (!existing) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        const updateData: any = {};
        if (wfStatus !== undefined) updateData.status = wfStatus;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;

        const workflow = await prisma.workflow.update({ where: { id: id as string }, data: updateData });
        return res.status(200).json({ success: true, data: { workflow } });
      }

      case 'workflows_delete': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const existing = await prisma.workflow.findFirst({ where: { id: id as string, userId } });
        if (!existing) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        await prisma.workflowRun.deleteMany({ where: { workflowId: id as string } });
        await prisma.workflow.delete({ where: { id: id as string } });

        return res.status(200).json({ success: true, message: 'Workflow deleted' });
      }

      case 'connections': {
        if (req.method === 'POST') {
          if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

          const { integrationId } = req.body || {};
          if (!integrationId) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'Integration ID required' } });

          const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
          if (!integration) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Integration not found' } });

          const connection = await prisma.connection.create({
            data: { userId, integrationId, accessToken: 'oauth_token_' + Date.now(), provider: 'oauth', displayName: integration.name, status: 'active' },
            include: { integration: true },
          });

          return res.status(201).json({ success: true, data: { connection: { id: connection.id, integrationId: connection.integrationId, integration: connection.integration, provider: connection.provider, displayName: connection.displayName, status: connection.status } } });
        }

        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const connections = await prisma.connection.findMany({
          where: { userId },
          include: { integration: true },
          orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({ success: true, data: { connections } });
      }

      case 'connections_delete': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const { id: connId } = req.body || {};
        if (!connId) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const existing = await prisma.connection.findFirst({ where: { id: connId, userId } });
        if (!existing) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Connection not found' } });

        await prisma.connection.delete({ where: { id: connId } });
        return res.status(200).json({ success: true, message: 'Connection deleted' });
      }

      case 'runs': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const where: any = { workflow: { userId } };
        if (workflowId) where.workflowId = workflowId as string;
        if (status) where.status = status as string;

        const limitNum = parseInt(limit as string) || 20;
        const pageNum = parseInt(page as string) || 1;
        const skip = (pageNum - 1) * limitNum;

        const [runs, total] = await Promise.all([
          prisma.workflowRun.findMany({
            where,
            include: { workflow: { select: { id: true, name: true } } },
            orderBy: { startedAt: 'desc' },
            skip,
            take: limitNum,
          }),
          prisma.workflowRun.count({ where }),
        ]);

        return res.status(200).json({
          success: true,
          data: {
            runs,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
          },
        });
      }

      default:
        return res.status(400).json({ success: false, error: { message: 'Invalid resource' } });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ success: false, error: { statusCode: 500, message: 'Internal server error' } });
  }
}