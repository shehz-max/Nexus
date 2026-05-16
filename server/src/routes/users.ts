import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
});

const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  timezone: z.string().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    runs: z.boolean().optional(),
    errors: z.boolean().optional(),
  }).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// GET /users/me - Get current user
router.get('/me', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.getUser(req.user!.id);
  
  res.json({
    success: true,
    data: { user },
  });
}));

// PATCH /users/me - Update profile
router.patch('/me', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = updateProfileSchema.parse(req.body);
  
  const user = await authService.updateUser(req.user!.id, data);
  
  res.json({
    success: true,
    data: { user },
  });
}));

// GET /users/me/preferences - Get user preferences
router.get('/me/preferences', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const preferences = await prisma.userPreference.findUnique({
    where: { userId: req.user!.id },
  });
  
  res.json({
    success: true,
    data: { preferences },
  });
}));

// PATCH /users/me/preferences - Update preferences
router.patch('/me/preferences', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = updatePreferencesSchema.parse(req.body);
  
  const preferences = await prisma.userPreference.upsert({
    where: { userId: req.user!.id },
    create: {
      userId: req.user!.id,
      ...data,
    },
    update: data,
  });
  
  res.json({
    success: true,
    data: { preferences },
  });
}));

// POST /users/me/password - Change password
router.post('/me/password', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  
  await authService.changePassword(req.user!.id, currentPassword, newPassword);
  
  res.json({
    success: true,
    data: { message: 'Password changed successfully' },
  });
}));

export default router;