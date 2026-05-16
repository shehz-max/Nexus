import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// POST /auth/register
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = registerSchema.parse(req.body);
  
  const result = await authService.register(email, password, name);
  
  res.status(201).json({
    success: true,
    data: result,
  });
}));

// POST /auth/login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  
  const result = await authService.login(email, password);
  
  res.json({
    success: true,
    data: result,
  });
}));

// POST /auth/refresh
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  
  const tokens = await authService.refresh(refreshToken);
  
  res.json({
    success: true,
    data: tokens,
  });
}));

// POST /auth/logout
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  
  await authService.logout(refreshToken);
  
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
}));

// GET /auth/me
router.get('/me', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.getUser(req.user!.id);
  
  res.json({
    success: true,
    data: { user },
  });
}));

export default router;