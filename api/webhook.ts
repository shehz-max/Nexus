import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres.gwzwfyyylgeposbqsthd:Tz4Pp3x4dvornrMf@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { workflowId } = req.query;

  if (!workflowId) {
    return res.status(400).json({ error: 'workflowId query parameter required' });
  }

  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId as string },
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    if (!workflow.isActive || workflow.status !== 'active') {
      return res.status(400).json({ error: 'Workflow is not active' });
    }

    const triggerConfig = typeof workflow.triggerConfig === 'string'
      ? JSON.parse(workflow.triggerConfig)
      : workflow.triggerConfig;

    const actions = typeof workflow.actions === 'string'
      ? JSON.parse(workflow.actions)
      : workflow.actions;

    const startTime = Date.now();
    const steps: any[] = [];
    let errorMessage: string | null = null;
    let status = 'success';

    try {
      const triggerData = req.body || {};

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
          triggerData: JSON.stringify(req.body || {}),
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
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', message: error.message });
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
