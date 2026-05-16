import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { workflowService } from '../services/workflow.service.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  trigger: z.object({
    connectionId: z.string().uuid(),
    triggerId: z.string().min(1),
    config: z.record(z.any()).optional(),
    pollingInterval: z.number().optional(),
  }),
  filters: z.object({
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'greater_than', 'less_than', 'is_empty', 'is_not_empty', 'regex']),
      value: z.any(),
    })),
    logic: z.enum(['AND', 'OR']).optional(),
  }).optional(),
  actions: z.array(z.object({
    connectionId: z.string().uuid(),
    actionId: z.string().min(1),
    config: z.record(z.any()),
    continueOnError: z.boolean().optional(),
  })).min(1),
  schedule: z.object({
    type: z.enum(['realtime', 'interval', 'cron', 'manual']),
    interval: z.number().optional(),
    cron: z.string().optional(),
  }).optional(),
});

const updateWorkflowSchema = createWorkflowSchema.partial();

// GET /workflows - List user's workflows
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workflows = await workflowService.list(req.user!.id);
  
  res.json({
    success: true,
    data: { workflows },
  });
}));

// GET /workflows/:id - Get workflow details
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workflow = await workflowService.get(req.user!.id, req.params.id);
  
  res.json({
    success: true,
    data: { workflow },
  });
}));

// POST /workflows - Create new workflow
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = createWorkflowSchema.parse(req.body);
  
  const workflow = await workflowService.create(req.user!.id, data);
  
  res.status(201).json({
    success: true,
    data: { workflow },
  });
}));

// PATCH /workflows/:id - Update workflow
router.patch('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = updateWorkflowSchema.parse(req.body);
  
  const workflow = await workflowService.update(req.user!.id, req.params.id, data);
  
  res.json({
    success: true,
    data: { workflow },
  });
}));

// DELETE /workflows/:id - Delete workflow
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await workflowService.delete(req.user!.id, req.params.id);
  
  res.json({
    success: true,
    data: { message: 'Workflow deleted successfully' },
  });
}));

// POST /workflows/:id/enable - Activate workflow
router.post('/:id/enable', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workflow = await workflowService.enable(req.user!.id, req.params.id);
  
  res.json({
    success: true,
    data: { workflow },
  });
}));

// POST /workflows/:id/disable - Pause workflow
router.post('/:id/disable', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workflow = await workflowService.disable(req.user!.id, req.params.id);
  
  res.json({
    success: true,
    data: { workflow },
  });
}));

// POST /workflows/:id/duplicate - Clone workflow
router.post('/:id/duplicate', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workflow = await workflowService.duplicate(req.user!.id, req.params.id);
  
  res.status(201).json({
    success: true,
    data: { workflow },
  });
}));

// GET /workflows/:id/runs - Get workflow run history
router.get('/:id/runs', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  
  const result = await workflowService.getRuns(req.user!.id, req.params.id, page, limit);
  
  res.json({
    success: true,
    data: result,
  });
}));

export default router;