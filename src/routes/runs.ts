import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';
import { JwtPayload } from '../types/index.js';

interface RunsQuery {
  workflowId?: string;
  status?: string;
  page?: string;
  limit?: string;
}

export async function runsRoutes(fastify: FastifyInstance) {
  // Get all workflow runs
  fastify.get<{ Querystring: RunsQuery }>(
    '/',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Querystring: RunsQuery }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { workflowId, status, page = '1', limit = '20' } = request.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause
      const where: Record<string, unknown> = {
        workflow: { userId: user.userId },
      };

      if (workflowId) {
        where.workflowId = workflowId;
      }

      if (status) {
        where.status = status;
      }

      const [runs, total] = await Promise.all([
        prisma.workflowRun.findMany({
          where,
          include: {
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { startedAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.workflowRun.count({ where }),
      ]);

      return reply.send({
        success: true,
        data: {
          runs,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    }
  );

  // Get single run details
  fastify.get(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;

      const run = await prisma.workflowRun.findFirst({
        where: {
          id,
          workflow: { userId: user.userId },
        },
        include: {
          workflow: true,
        },
      });

      if (!run) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Workflow run not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: run,
      });
    }
  );

  // Retry failed run
  fastify.post(
    '/:id/retry',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;

      const existingRun = await prisma.workflowRun.findFirst({
        where: {
          id,
          workflow: { userId: user.userId },
        },
        include: {
          workflow: true,
        },
      });

      if (!existingRun) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Workflow run not found',
          },
        });
      }

      // Create a new run based on the existing configuration
      const newRun = await prisma.workflowRun.create({
        data: {
          workflowId: existingRun.workflowId,
          status: 'running',
          triggerData: existingRun.triggerData,
          startedAt: new Date(),
        },
      });

      // Update workflow stats
      await prisma.workflow.update({
        where: { id: existingRun.workflowId },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 },
        },
      });

      // Simulate execution (in production, this would actually run)
      setTimeout(async () => {
        const success = Math.random() > 0.3;
        await prisma.workflowRun.update({
          where: { id: newRun.id },
          data: {
            status: success ? 'success' : 'failed',
            completedAt: new Date(),
            durationMs: Math.floor(Math.random() * 2000) + 200,
            executionData: success ? undefined : { retry: true },
            errorMessage: success ? undefined : 'Retry failed',
          },
        });

        await prisma.workflow.update({
          where: { id: existingRun.workflowId },
          data: {
            successCount: success ? { increment: 1 } : undefined,
            failureCount: success ? undefined : { increment: 1 },
          },
        });
      }, 1000);

      return reply.send({
        success: true,
        data: {
          runId: newRun.id,
          status: 'running',
          message: 'Workflow retry started',
        },
      });
    }
  );

  // Get run statistics
  fastify.get(
    '/stats',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as JwtPayload;

      const [totalRuns, successRuns, failedRuns, recentRuns] = await Promise.all([
        prisma.workflowRun.count({
          where: { workflow: { userId: user.userId } },
        }),
        prisma.workflowRun.count({
          where: { workflow: { userId: user.userId }, status: 'success' },
        }),
        prisma.workflowRun.count({
          where: { workflow: { userId: user.userId }, status: 'failed' },
        }),
        prisma.workflowRun.findMany({
          where: { workflow: { userId: user.userId } },
          orderBy: { startedAt: 'desc' },
          take: 5,
          include: {
            workflow: { select: { id: true, name: true } },
          },
        }),
      ]);

      return reply.send({
        success: true,
        data: {
          total: totalRuns,
          success: successRuns,
          failed: failedRuns,
          successRate: totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0,
          recentRuns,
        },
      });
    }
  );
}