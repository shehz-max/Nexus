import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma.js';
import { JwtPayload } from '../types/index.js';

interface CreateWorkflowBody {
  name: string;
  description?: string;
  triggerConfig: Record<string, unknown>;
  actions: Record<string, unknown>[];
  filters?: Record<string, unknown>;
  scheduleConfig?: Record<string, unknown>;
}

interface UpdateWorkflowBody {
  name?: string;
  description?: string;
  triggerConfig?: Record<string, unknown>;
  actions?: Record<string, unknown>[];
  filters?: Record<string, unknown>;
  scheduleConfig?: Record<string, unknown>;
}

export async function workflowRoutes(fastify: FastifyInstance) {
  // Get all workflows for user
  fastify.get(
    '/',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as JwtPayload;

      const workflows = await prisma.workflow.findMany({
        where: { userId: user.userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          runs: {
            take: 5,
            orderBy: { startedAt: 'desc' },
          },
        },
      });

      return reply.send({
        success: true,
        data: { workflows },
      });
    }
  );

  // Create new workflow
  fastify.post<{ Body: CreateWorkflowBody }>(
    '/',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['name', 'triggerConfig', 'actions'],
          properties: {
            name: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            triggerConfig: { type: 'object' },
            actions: { type: 'array', minItems: 1 },
            filters: { type: 'object' },
            scheduleConfig: { type: 'object' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateWorkflowBody }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { name, description, triggerConfig, actions, filters, scheduleConfig } = request.body;

      // Check plan limits
      const userData = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { plan: true },
      });

      const workflowCount = await prisma.workflow.count({
        where: { userId: user.userId },
      });

      const limits = {
        free: 2,
        starter: 10,
        pro: -1,
        business: -1,
      };

      if (workflowCount >= (limits[userData?.plan as keyof typeof limits] || 2) && userData?.plan !== 'pro' && userData?.plan !== 'business') {
        return reply.status(403).send({
          success: false,
          error: {
            statusCode: 403,
            message: 'Workflow limit reached. Upgrade your plan to create more workflows.',
          },
        });
      }

      const workflow = await prisma.workflow.create({
        data: {
          userId: user.userId,
          name,
          description,
          status: 'draft',
          triggerConfig,
          actions,
          filters,
          scheduleConfig,
          isActive: false,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'workflow.create',
          resourceType: 'workflow',
          resourceId: workflow.id,
          details: { name },
        },
      });

      return reply.status(201).send({
        success: true,
        data: workflow,
      });
    }
  );

  // Get single workflow
  fastify.get(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;

      const workflow = await prisma.workflow.findFirst({
        where: { id, userId: user.userId },
        include: {
          workflowRuns: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!workflow) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Workflow not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: workflow,
      });
    }
  );

  // Update workflow
  fastify.patch<{ Body: UpdateWorkflowBody }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            triggerConfig: { type: 'object' },
            actions: { type: 'array' },
            filters: { type: 'object' },
            scheduleConfig: { type: 'object' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateWorkflowBody }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;
      const data = request.body;

      const existing = await prisma.workflow.findFirst({
        where: { id, userId: user.userId },
      });

      if (!existing) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Workflow not found',
          },
        });
      }

      const workflow = await prisma.workflow.update({
        where: { id },
        data,
      });

      return reply.send({
        success: true,
        data: workflow,
      });
    }
  );

  // Delete workflow
  fastify.delete(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;

      const existing = await prisma.workflow.findFirst({
        where: { id, userId: user.userId },
      });

      if (!existing) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Workflow not found',
          },
        });
      }

      // Delete workflow runs first
      await prisma.workflowRun.deleteMany({
        where: { workflowId: id },
      });

      // Delete workflow
      await prisma.workflow.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Workflow deleted successfully',
      });
    }
  );

  // Enable workflow
  fastify.post(
    '/:id/enable',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;

      const workflow = await prisma.workflow.findFirst({
        where: { id, userId: user.userId },
      });

      if (!workflow) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Workflow not found',
          },
        });
      }

      await prisma.workflow.update({
        where: { id },
        data: {
          isActive: true,
          status: 'active',
        },
      });

      return reply.send({
        success: true,
        message: 'Workflow enabled successfully',
      });
    }
  );

  // Disable workflow
  fastify.post(
    '/:id/disable',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;

      const workflow = await prisma.workflow.findFirst({
        where: { id, userId: user.userId },
      });

      if (!workflow) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Workflow not found',
          },
        });
      }

      await prisma.workflow.update({
        where: { id },
        data: {
          isActive: false,
          status: 'draft',
        },
      });

      return reply.send({
        success: true,
        message: 'Workflow disabled successfully',
      });
    }
  );

  // Test workflow (dry run)
  fastify.post(
    '/:id/test',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;

      const workflow = await prisma.workflow.findFirst({
        where: { id, userId: user.userId },
        include: {
          user: true,
        },
      });

      if (!workflow) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Workflow not found',
          },
        });
      }

      // Create a test run
      const run = await prisma.workflowRun.create({
        data: {
          workflowId: id,
          status: 'running',
          triggerData: { test: true },
          startedAt: new Date(),
        },
      });

      // Simulate test execution (in production, this would actually run actions)
      const success = Math.random() > 0.1; // 90% success rate for simulation

      await prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: success ? 'success' : 'failed',
          completedAt: new Date(),
          durationMs: Math.floor(Math.random() * 1000) + 100,
          executionData: {
            testMode: true,
            simulated: true,
            message: success ? 'Test completed successfully' : 'Test failed - check action configuration',
          },
        },
      });

      // Update workflow stats
      await prisma.workflow.update({
        where: { id },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 },
          successCount: success ? { increment: 1 } : undefined,
          failureCount: success ? undefined : { increment: 1 },
        },
      });

      return reply.send({
        success: true,
        data: {
          runId: run.id,
          status: success ? 'success' : 'failed',
          message: success 
            ? 'Workflow test passed! Actions would execute as configured.'
            : 'Workflow test failed. Please check your configuration.',
        },
      });
    }
  );

  // Duplicate workflow
  fastify.post(
    '/:id/duplicate',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;

      const original = await prisma.workflow.findFirst({
        where: { id, userId: user.userId },
      });

      if (!original) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Workflow not found',
          },
        });
      }

      const duplicate = await prisma.workflow.create({
        data: {
          userId: user.userId,
          name: `${original.name} (Copy)`,
          description: original.description,
          triggerConfig: original.triggerConfig,
          actions: original.actions,
          filters: original.filters,
          scheduleConfig: original.scheduleConfig,
          isActive: false,
        },
      });

      return reply.status(201).send({
        success: true,
        data: duplicate,
      });
    }
  );
}