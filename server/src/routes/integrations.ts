import { Router, Request, Response } from 'express';
import { integrationService } from '../services/integration.service.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// GET /integrations - List all integrations
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const integrations = await integrationService.list();
  
  res.json({
    success: true,
    data: { integrations },
  });
}));

// GET /integrations/categories - Get integration categories
router.get('/categories', asyncHandler(async (_req: Request, res: Response) => {
  const categories = await integrationService.getCategories();
  
  res.json({
    success: true,
    data: { categories },
  });
}));

// GET /integrations/:slug - Get integration by slug
router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
  const integration = await integrationService.getBySlug(req.params.slug);
  
  res.json({
    success: true,
    data: { integration },
  });
}));

export default router;