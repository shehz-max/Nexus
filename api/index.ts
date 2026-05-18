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
          {
            id: 'google_sheets', slug: 'google-sheets', name: 'Google Sheets', description: 'Create, edit, and collaborate on spreadsheets online', icon: '📊', category: 'Spreadsheets', authType: 'oauth2',
            triggers: [
              { id: 'new_row', name: 'New Row Added', description: 'Triggers when a new row is added to a spreadsheet', type: 'polling', sample: { row: 1, data: { A: 'Value', B: 'Data' } } },
              { id: 'new_or_updated_row', name: 'New or Updated Row', description: 'Triggers when a row is added or modified', type: 'polling', sample: { row: 1, data: { A: 'Value' }, event: 'new' } },
            ],
            actions: [
              { id: 'create_row', name: 'Create Row', description: 'Add a new row to a spreadsheet', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'sheet', type: 'string', required: true, label: 'Sheet Name' }, { name: 'values', type: 'object', required: true, label: 'Row Values' }] },
              { id: 'update_row', name: 'Update Row', description: 'Update an existing row', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'row', type: 'number', required: true, label: 'Row Number' }, { name: 'values', type: 'object', required: true, label: 'Row Values' }] },
              { id: 'find_row', name: 'Find Row', description: 'Find a row by cell value', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'column', type: 'string', required: true, label: 'Column' }, { name: 'value', type: 'string', required: true, label: 'Search Value' }] },
            ]
          },
          {
            id: 'gmail', slug: 'gmail', name: 'Gmail', description: 'Send and receive emails through your Google account', icon: '📧', category: 'Communication', authType: 'oauth2',
            triggers: [
              { id: 'new_email', name: 'New Email', description: 'Triggers when a new email arrives', type: 'polling', sample: { from: 'sender@example.com', subject: 'Hello', body: 'Email content' } },
              { id: 'new_attachment', name: 'New Attachment', description: 'Triggers when email has a new attachment', type: 'polling', sample: { from: 'sender@example.com', subject: 'File attached', attachment: 'file.pdf' } },
            ],
            actions: [
              { id: 'send_email', name: 'Send Email', description: 'Send an email to any recipient', inputFields: [{ name: 'to', type: 'string', required: true, label: 'To' }, { name: 'subject', type: 'string', required: true, label: 'Subject' }, { name: 'body', type: 'text', required: true, label: 'Body' }, { name: 'cc', type: 'string', required: false, label: 'CC' }] },
              { id: 'reply_to_email', name: 'Reply to Email', description: 'Reply to an existing email', inputFields: [{ name: 'threadId', type: 'string', required: true, label: 'Thread ID' }, { name: 'body', type: 'text', required: true, label: 'Body' }] },
            ]
          },
          {
            id: 'slack', slug: 'slack', name: 'Slack', description: 'Team communication and collaboration platform', icon: '💬', category: 'Communication', authType: 'oauth2',
            triggers: [
              { id: 'new_message', name: 'New Message', description: 'Triggers when a message is posted to a channel', type: 'webhook', sample: { channel: '#general', user: 'user', text: 'Hello!' } },
            ],
            actions: [
              { id: 'send_message', name: 'Send Message', description: 'Post a message to a Slack channel', inputFields: [{ name: 'channel', type: 'string', required: true, label: 'Channel' }, { name: 'text', type: 'text', required: true, label: 'Message' }, { name: 'username', type: 'string', required: false, label: 'Bot Name' }] },
              { id: 'create_channel', name: 'Create Channel', description: 'Create a new Slack channel', inputFields: [{ name: 'name', type: 'string', required: true, label: 'Channel Name' }] },
            ]
          },
          {
            id: 'notion', slug: 'notion', name: 'Notion', description: 'All-in-one workspace for notes, tasks, and collaboration', icon: '📝', category: 'Productivity', authType: 'oauth2',
            triggers: [
              { id: 'new_page', name: 'New Page', description: 'Triggers when a new page is created', type: 'polling', sample: { title: 'Page Title', url: 'https://notion.so/page' } },
              { id: 'page_updated', name: 'Page Updated', description: 'Triggers when a page is modified', type: 'polling', sample: { title: 'Page Title', changes: ['name'] } },
            ],
            actions: [
              { id: 'create_page', name: 'Create Page', description: 'Create a new page in a database or workspace', inputFields: [{ name: 'database_id', type: 'string', required: true, label: 'Database ID' }, { name: 'title', type: 'string', required: true, label: 'Title' }, { name: 'properties', type: 'object', required: false, label: 'Properties' }] },
              { id: 'update_page', name: 'Update Page', description: 'Update an existing page', inputFields: [{ name: 'page_id', type: 'string', required: true, label: 'Page ID' }, { name: 'properties', type: 'object', required: true, label: 'Properties' }] },
            ]
          },
          {
            id: 'hubspot', slug: 'hubspot', name: 'HubSpot', description: 'CRM, marketing, and sales automation platform', icon: '🔷', category: 'CRM', authType: 'oauth2',
            triggers: [
              { id: 'new_contact', name: 'New Contact', description: 'Triggers when a new contact is created', type: 'polling', sample: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' } },
              { id: 'contact_updated', name: 'Contact Updated', description: 'Triggers when a contact is updated', type: 'polling', sample: { firstName: 'John', lastName: 'Doe', changes: ['phone'] } },
            ],
            actions: [
              { id: 'create_contact', name: 'Create Contact', description: 'Create a new contact in HubSpot', inputFields: [{ name: 'firstname', type: 'string', required: false, label: 'First Name' }, { name: 'lastname', type: 'string', required: true, label: 'Last Name' }, { name: 'email', type: 'string', required: true, label: 'Email' }] },
              { id: 'create_deal', name: 'Create Deal', description: 'Create a new deal', inputFields: [{ name: 'dealname', type: 'string', required: true, label: 'Deal Name' }, { name: 'amount', type: 'number', required: false, label: 'Amount' }, { name: 'pipeline', type: 'string', required: false, label: 'Pipeline' }] },
            ]
          },
          {
            id: 'schedule', slug: 'schedule', name: 'Schedule', description: 'Trigger workflows on a schedule', icon: '⏰', category: 'Utility', authType: 'none',
            triggers: [
              { id: 'every_hour', name: 'Every Hour', description: 'Runs every hour', type: 'schedule', schedule: '0 * * * *', sample: { timestamp: '2024-01-01T00:00:00Z' } },
              { id: 'every_day', name: 'Every Day', description: 'Runs once per day at midnight', type: 'schedule', schedule: '0 0 * * *', sample: { timestamp: '2024-01-01T00:00:00Z' } },
              { id: 'every_week', name: 'Every Week', description: 'Runs once per week on Monday', type: 'schedule', schedule: '0 0 * * 1', sample: { timestamp: '2024-01-01T00:00:00Z' } },
            ],
            actions: []
          },
          {
            id: 'webhook', slug: 'webhook', name: 'Webhook', description: 'Trigger workflows via HTTP request', icon: '🪝', category: 'Utility', authType: 'none',
            triggers: [
              { id: 'incoming_webhook', name: 'Catch Hook', description: 'Receive data from any service via webhook', type: 'webhook', sample: { data: 'Received payload' } },
            ],
            actions: []
          },
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

      case 'runs_get': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const run = await prisma.workflowRun.findFirst({
          where: { id: id as string, workflow: { userId } },
          include: { workflow: { select: { id: true, name: true } } },
        });

        if (!run) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Run not found' } });

        return res.status(200).json({
          success: true,
          data: {
            run: {
              ...run,
              triggerData: typeof run.triggerData === 'string' ? JSON.parse(run.triggerData) : run.triggerData,
              steps: typeof run.steps === 'string' ? JSON.parse(run.steps) : run.steps,
              executionData: typeof run.executionData === 'string' ? JSON.parse(run.executionData) : run.executionData,
            },
          },
        });
      }

      case 'trigger_test': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const { integrationId, triggerId, config } = req.body || {};

        const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
        if (!integration) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Integration not found' } });

        const triggers = typeof integration.triggers === 'string' ? JSON.parse(integration.triggers) : integration.triggers;
        const trigger = triggers.find((t: any) => t.id === triggerId);

        if (!trigger) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Trigger not found' } });

        return res.status(200).json({
          success: true,
          data: {
            trigger,
            sampleData: trigger.sample || { message: 'Sample trigger data - configure your integration to get real data' },
          },
        });
      }

      case 'action_test': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const { integrationId, actionId, config } = req.body || {};

        const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
        if (!integration) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Integration not found' } });

        const actions = typeof integration.actions === 'string' ? JSON.parse(integration.actions) : integration.actions;
        const action = actions.find((a: any) => a.id === actionId);

        if (!action) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Action not found' } });

        return res.status(200).json({
          success: true,
          data: {
            action,
            result: { success: true, message: `Action "${action.name}" would execute with provided config`, simulated: true },
          },
        });
      }

      case 'workflow_activate': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const workflow = await prisma.workflow.findFirst({ where: { id: id as string, userId } });
        if (!workflow) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        const triggerConfig = typeof workflow.triggerConfig === 'string' ? JSON.parse(workflow.triggerConfig) : workflow.triggerConfig;
        if (!triggerConfig?.integrationId || !triggerConfig?.triggerId) {
          return res.status(400).json({ success: false, error: { statusCode: 400, message: 'Workflow must have a trigger configured before activation' } });
        }

        const updated = await prisma.workflow.update({
          where: { id: id as string },
          data: { status: 'active', isActive: true },
        });

        return res.status(200).json({ success: true, data: { workflow: updated } });
      }

      case 'workflow_trigger_manual': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const workflow = await prisma.workflow.findFirst({ where: { id: id as string, userId } });
        if (!workflow) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        const triggerConfig = typeof workflow.triggerConfig === 'string' ? JSON.parse(workflow.triggerConfig) : workflow.triggerConfig;
        const actions = typeof workflow.actions === 'string' ? JSON.parse(workflow.actions) : workflow.actions;

        const startTime = Date.now();
        const steps: any[] = [];
        let errorMessage: string | null = null;
        let status = 'success';

        try {
          const triggerData = req.body?.triggerData || { triggeredAt: new Date().toISOString(), source: 'manual' };

          steps.push({
            name: `Trigger: ${triggerConfig.integrationId}`,
            type: 'trigger',
            status: 'success',
            duration: 0,
            output: triggerData,
          });

          for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            const stepStart = Date.now();

            try {
              const resolvedConfig = resolveMappings(action.config || {}, triggerData);

              steps.push({
                name: `Action: ${action.integrationId}.${action.actionId}`,
                type: 'action',
                status: 'success',
                duration: Date.now() - stepStart,
                input: resolvedConfig,
                output: { simulated: true, message: `Action executed successfully` },
              });
            } catch (actionError: any) {
              steps.push({
                name: `Action: ${action.integrationId}.${action.actionId}`,
                type: 'action',
                status: 'failed',
                duration: Date.now() - stepStart,
                error: actionError.message,
              });

              if (!action.continueOnError) {
                throw actionError;
              }
            }
          }

          await prisma.workflow.update({
            where: { id: workflow.id },
            data: {
              runCount: { increment: 1 },
              successCount: { increment: status === 'success' ? 1 : 0 },
              failureCount: { increment: status === 'failed' ? 1 : 0 },
              lastRunAt: new Date(),
            },
          });

          const run = await prisma.workflowRun.create({
            data: {
              workflowId: workflow.id,
              status,
              triggerData: JSON.stringify(triggerData),
              steps: JSON.stringify(steps),
              errorMessage,
              startedAt: new Date(startTime),
              completedAt: new Date(),
              durationMs: Date.now() - startTime,
            },
          });

          return res.status(200).json({
            success: true,
            data: {
              runId: run.id,
              status,
              steps: steps.length,
              durationMs: Date.now() - startTime,
            },
          });
        } catch (error: any) {
          status = 'failed';
          errorMessage = error.message;

          await prisma.workflow.update({
            where: { id: workflow.id },
            data: {
              runCount: { increment: 1 },
              failureCount: { increment: 1 },
              lastRunAt: new Date(),
            },
          });

          const run = await prisma.workflowRun.create({
            data: {
              workflowId: workflow.id,
              status: 'failed',
              triggerData: JSON.stringify(req.body?.triggerData || {}),
              steps: JSON.stringify(steps),
              errorMessage,
              errorStack: error.stack,
              startedAt: new Date(startTime),
              completedAt: new Date(),
              durationMs: Date.now() - startTime,
            },
          });

          return res.status(500).json({
            success: false,
            error: { message: errorMessage, runId: run.id },
          });
        }
      }

      case 'workflow_duplicate': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const workflow = await prisma.workflow.findFirst({ where: { id: id as string, userId } });
        if (!workflow) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        const duplicated = await prisma.workflow.create({
          data: {
            userId,
            name: `${workflow.name} (Copy)`,
            description: workflow.description,
            status: 'draft',
            triggerConfig: workflow.triggerConfig,
            actions: workflow.actions,
            isActive: false,
          },
        });

        return res.status(201).json({ success: true, data: { workflow: duplicated } });
      }

      default:
        return res.status(400).json({ success: false, error: { message: 'Invalid resource' } });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ success: false, error: { statusCode: 500, message: 'Internal server error' } });
  }
}

function resolveMappings(config: Record<string, any>, triggerData: Record<string, any>): Record<string, any> {
  const resolved: Record<string, any> = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && value.includes('{{trigger.')) {
      resolved[key] = resolveString(value, triggerData);
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

function resolveString(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{trigger\.([^}]+)\}\}/g, (_, path) => {
    const keys = path.split('.');
    let current: any = data;
    for (const key of keys) {
      if (current === null || current === undefined) return '';
      current = current[key];
    }
    return current !== null && current !== undefined ? String(current) : '';
  });
}