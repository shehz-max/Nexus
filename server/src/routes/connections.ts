import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { connectionService } from '../services/connection.service.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createConnectionSchema = z.object({
  integration: z.string().min(1),
  code: z.string().min(1).optional(),
  state: z.string().optional(),
});

// GET /connections - List user's connections
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const connections = await connectionService.list(req.user!.id);
  
  res.json({
    success: true,
    data: { connections },
  });
}));

// GET /connections/:id - Get connection details
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const connection = await connectionService.get(req.user!.id, req.params.id);
  
  res.json({
    success: true,
    data: { connection },
  });
}));

// POST /connections - Create new connection (OAuth callback)
router.post('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { integration, code, state } = createConnectionSchema.parse(req.body);
  
  const connection = await connectionService.create(req.user!.id, integration, code || '', state);
  
  res.status(201).json({
    success: true,
    data: { connection },
  });
}));

// DELETE /connections/:id - Remove connection
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await connectionService.delete(req.user!.id, req.params.id);
  
  res.json({
    success: true,
    data: { message: 'Connection removed successfully' },
  });
}));

// POST /connections/:id/test - Test connection
router.post('/:id/test', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await connectionService.test(req.user!.id, req.params.id);
  
  res.json({
    success: true,
    data: result,
  });
}));

// POST /connections/:id/refresh - Refresh OAuth tokens
router.post('/:id/refresh', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const connection = await connectionService.refreshTokens(req.user!.id, req.params.id);
  
  res.json({
    success: true,
    data: { connection },
  });
}));

// GET /connections/:id/oauth-url - Get OAuth URL for connection
router.get('/:id/oauth-url', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const url = await connectionService.getOAuthUrl(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: { url },
  });
}));

export default router;