import { Request } from 'express';

// Express extended with user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    plan: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  plan: string;
  maxWorkflows: number;
  maxRuns: number;
  createdAt: Date;
}

// Integration Types
export interface IntegrationTrigger {
  id: string;
  name: string;
  description: string;
  configSchema: Record<string, any>;
  sampleOutput?: any;
}

export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  configSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
}

export interface Integration {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  authType: 'oauth2' | 'apikey' | 'webhook';
  triggers: IntegrationTrigger[];
  actions: IntegrationAction[];
  isActive: boolean;
}

// Connection Types
export interface Connection {
  id: string;
  userId: string;
  integrationId: string;
  integration?: Integration;
  providerId?: string;
  providerEmail?: string;
  displayName?: string;
  status: 'active' | 'error' | 'revoked';
  lastSyncAt?: Date;
  createdAt: Date;
}

// Workflow Types
export interface WorkflowTriggerConfig {
  connectionId: string;
  triggerId: string;
  config: Record<string, any>;
  pollingInterval?: number;
}

export interface WorkflowFilterCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | 'regex';
  value: any;
}

export interface WorkflowFilter {
  conditions: WorkflowFilterCondition[];
  logic: 'AND' | 'OR';
}

export interface WorkflowActionConfig {
  connectionId: string;
  actionId: string;
  config: Record<string, any>;
  continueOnError?: boolean;
}

export interface WorkflowScheduleConfig {
  type: 'realtime' | 'interval' | 'cron' | 'manual';
  interval?: number; // seconds
  cron?: string;
}

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'error';
  trigger: WorkflowTriggerConfig;
  filters?: WorkflowFilter;
  actions: WorkflowActionConfig[];
  schedule?: WorkflowScheduleConfig;
  runCount: number;
  successCount: number;
  failureCount: number;
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Workflow Run Types
export interface WorkflowRunStep {
  index: number;
  type: 'trigger' | 'action';
  integrationId: string;
  actionId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  input?: any;
  output?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  triggerData?: any;
  steps: WorkflowRunStep[];
  errorMessage?: string;
  errorStack?: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
}

// Auth Types
export interface TokenPayload {
  userId: string;
  email: string;
  plan: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Integration Adapter Types
export interface Credentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  providerId?: string;
  providerEmail?: string;
}

export interface TriggerEvent {
  id: string;
  timestamp: Date;
  data: any;
}

export interface ActionResult {
  success: boolean;
  output?: any;
  error?: string;
}

// Queue Types
export interface WorkflowJob {
  workflowId: string;
  triggerData?: any;
  runId: string;
  priority?: number;
}

export interface ScheduledJob {
  workflowId: string;
  scheduledAt: Date;
}

// Plan Limits
export interface PlanLimits {
  maxWorkflows: number;
  maxRuns: number;
  maxConnections: number;
  pollingInterval: number; // seconds
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxWorkflows: 1,
    maxRuns: 100,
    maxConnections: 2,
    pollingInterval: 900, // 15 minutes
  },
  starter: {
    maxWorkflows: 5,
    maxRuns: 1000,
    maxConnections: 10,
    pollingInterval: 300, // 5 minutes
  },
  pro: {
    maxWorkflows: -1, // unlimited
    maxRuns: -1,
    maxConnections: -1,
    pollingInterval: 60, // 1 minute
  },
};