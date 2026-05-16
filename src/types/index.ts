export interface JwtPayload {
  userId: string;
  email: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WorkflowTrigger {
  type: 'webhook' | 'schedule' | 'event';
  config: Record<string, unknown>;
}

export interface WorkflowAction {
  connectionId: string;
  action: string;
  params: Record<string, unknown>;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  authType: 'oauth' | 'api_key' | 'webhook';
  triggers: string[];
  actions: string[];
}

export type Plan = 'free' | 'starter' | 'pro' | 'business';

export interface PlanLimits {
  maxWorkflows: number;
  maxRunsPerMonth: number;
  maxConnections: number;
  support: 'none' | 'email' | 'priority' | 'dedicated';
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxWorkflows: 2,
    maxRunsPerMonth: 100,
    maxConnections: 3,
    support: 'none',
  },
  starter: {
    maxWorkflows: 10,
    maxRunsPerMonth: 2000,
    maxConnections: 15,
    support: 'email',
  },
  pro: {
    maxWorkflows: -1,
    maxRunsPerMonth: 10000,
    maxConnections: -1,
    support: 'priority',
  },
  business: {
    maxWorkflows: -1,
    maxRunsPerMonth: -1,
    maxConnections: -1,
    support: 'dedicated',
  },
};