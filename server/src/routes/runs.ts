import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /runs - List all runs for user
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const status = req.query.status as string;
  const workflowId = req.query.workflowId as string;

  const where: any = {};
  
  // Only get runs for user's workflows
  where.workflow = { userId: req.user!.id };
  
  if (status) where.status = status;
  if (workflowId) where.workflowId = workflowId;

  const [runs, total] = await Promise.all([
    prisma.workflowRun.findMany({
      where,
      include: {
        workflow: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.workflowRun.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      items: runs.map((run) => ({
        id: run.id,
        workflowId: run.workflowId,
        workflowName: run.workflow.name,
        status: run.status,
        triggerData: run.triggerData,
        steps: run.steps,
        errorMessage: run.errorMessage,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        durationMs: run.durationMs,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}));

// GET /runs/stats - Get run statistics
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const stats = await prisma.workflowRun.findMany({
    where: {
      workflow: { userId },
    },
    select: {
      status: true,
    },
  });

  const total = stats.length;
  const success = stats.filter((s) => s.status === 'success').length;
  const failed = stats.filter((s) => s.status === 'failed').length;
  const running = stats.filter((s) => s.status === 'running').length;

  res.json({
    success: true,
    data: {
      total,
      success,
      failed,
      running,
      successRate: total > 0 ? Math.round((success / total) * 1000) / 10 : 0,
    },
  });
}));

// GET /runs/:id - Get run details
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const run = await prisma.workflowRun.findFirst({
    where: {
      id: req.params.id,
      workflow: { userId: req.user!.id },
    },
    include: {
      workflow: {
        select: { id: true, name: true },
      },
    },
  });

  if (!run) {
    throw new AppError('RUN_NOT_FOUND', 'Run not found', 404);
  }

  res.json({
    success: true,
    data: {
      run: {
        id: run.id,
        workflowId: run.workflowId,
        workflowName: run.workflow.name,
        status: run.status,
        triggerData: run.triggerData,
        steps: run.steps,
        errorMessage: run.errorMessage,
        errorStack: run.errorStack,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        durationMs: run.durationMs,
      },
    },
  });
}));

// POST /runs/:id/retry - Retry failed run
router.post('/:id/retry', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const run = await prisma.workflowRun.findFirst({
    where: {
      id: req.params.id,
      workflow: { userId: req.user!.id },
    },
    include: {
      workflow: true,
    },
  });

  if (!run) {
    throw new AppError('RUN_NOT_FOUND', 'Run not found', 404);
  }

  if (run.status !== 'failed') {
    throw new AppError('RUN_NOT_RETRYABLE', 'Only failed runs can be retried', 400);
  }

  // Create new run as copy of failed run
  const newRun = await prisma.workflowRun.create({
    data: {
      workflowId: run.workflowId,
      status: 'pending',
      triggerData: run.triggerData,
    },
  });

  // TODO: Add to execution queue

  res.status(201).json({
    success: true,
    data: {
      run: {
        id: newRun.id,
        status: newRun.status,
        createdAt: newRun.createdAt,
      },
    },
  });
}));

// DELETE /runs/:id - Cancel running run
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const run = await prisma.workflowRun.findFirst({
    where: {
      id: req.params.id,
      workflow: { userId: req.user!.id },
    },
  });

  if (!run) {
    throw new AppError('RUN_NOT_FOUND', 'Run not found', 404);
  }

  await prisma.workflowRun.update({
    where: { id: req.params.id },
    data: { status: 'cancelled' },
  });

  res.json({
    success: true,
    data: { message: 'Run cancelled' },
  });
}));

export default router;