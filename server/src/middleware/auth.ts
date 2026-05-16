import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticatedRequest, TokenPayload } from '../types/index.js';

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authorization token is required',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authorization token is required',
        },
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      plan: decoded.plan,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_EXPIRED',
          message: 'Authorization token has expired',
        },
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Invalid authorization token',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
      },
    });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          plan: decoded.plan,
        };
      }
    }

    next();
  } catch {
    next();
  }
};

export const requirePlan = (allowedPlans: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!allowedPlans.includes(req.user.plan)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'PLAN_REQUIRED',
          message: `This feature requires ${allowedPlans.join(' or ')} plan`,
        },
      });
      return;
    }

    next();
  };
};