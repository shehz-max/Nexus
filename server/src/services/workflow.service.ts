import { prisma } from '../config/database.js';
import { Workflow, WorkflowTriggerConfig, WorkflowFilter, WorkflowActionConfig, WorkflowScheduleConfig } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import { PLAN_LIMITS } from '../types/index.js';

export class WorkflowService {
  async list(userId: string): Promise<Workflow[]> {
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return workflows.map(this.formatWorkflow);
  }

  async get(userId: string, workflowId: string): Promise<Workflow> {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
    });

    if (!workflow) {
      throw new AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
    }

    return this.formatWorkflow(workflow);
  }

  async create(
    userId: string,
    data: {
      name: string;
      description?: string;
      trigger: WorkflowTriggerConfig;
      filters?: WorkflowFilter;
      actions: WorkflowActionConfig[];
      schedule?: WorkflowScheduleConfig;
    }
  ): Promise<Workflow> {
    // Check workflow limits
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);

    const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
    const workflowCount = await prisma.workflow.count({ where: { userId } });

    if (limits.maxWorkflows !== -1 && workflowCount >= limits.maxWorkflows) {
      throw new AppError(
        'WORKFLOW_LIMIT_REACHED',
        `You have reached the limit of ${limits.maxWorkflows} workflows on your ${user.plan} plan`,
        403
      );
    }

    // Create workflow with trigger
    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        status: 'draft',
        triggerConfig: data.trigger as any,
        filters: data.filters as any,
        actions: data.actions as any,
        scheduleConfig: data.schedule as any,
        workflowTriggers: {
          create: {
            integrationId: data.trigger.integrationId,
            triggerId: data.trigger.triggerId,
            config: data.trigger.config as any,
            pollingInterval: data.trigger.pollingInterval || limits.pollingInterval,
          },
        },
        workflowActions: {
          create: data.actions.map((action, index) => ({
            connectionId: action.connectionId,
            integrationId: action.integrationId,
            actionId: action.actionId,
            config: action.config as any,
            order: index,
            continueOnError: action.continueOnError || false,
          })),
        },
      },
    });

    await this.logAudit(userId, 'create', 'workflow', workflow.id);

    return this.formatWorkflow(workflow);
  }

  async update(
    userId: string,
    workflowId: string,
    data: Partial<{
      name: string;
      description: string;
      trigger: WorkflowTriggerConfig;
      filters: WorkflowFilter;
      actions: WorkflowActionConfig[];
      schedule: WorkflowScheduleConfig;
    }>
  ): Promise<Workflow> {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
    });

    if (!workflow) {
      throw new AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.trigger !== undefined) updateData.triggerConfig = data.trigger;
    if (data.filters !== undefined) updateData.filters = data.filters;
    if (data.actions !== undefined) updateData.actions = data.actions;
    if (data.schedule !== undefined) updateData.scheduleConfig = data.schedule;

    const updated = await prisma.workflow.update({
      where: { id: workflowId },
      data: updateData,
    });

    await this.logAudit(userId, 'update', 'workflow', workflowId);

    return this.formatWorkflow(updated);
  }

  async delete(userId: string, workflowId: string): Promise<void> {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
    });

    if (!workflow) {
      throw new AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
    }

    await prisma.workflow.delete({ where: { id: workflowId } });

    await this.logAudit(userId, 'delete', 'workflow', workflowId);
  }

  async enable(userId: string, workflowId: string): Promise<Workflow> {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
    });

    if (!workflow) {
      throw new AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
    }

    const updated = await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: 'active' },
    });

    await this.logAudit(userId, 'enable', 'workflow', workflowId);

    return this.formatWorkflow(updated);
  }

  async disable(userId: string, workflowId: string): Promise<Workflow> {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
    });

    if (!workflow) {
      throw new AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
    }

    const updated = await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: 'paused' },
    });

    await this.logAudit(userId, 'disable', 'workflow', workflowId);

    return this.formatWorkflow(updated);
  }

  async duplicate(userId: string, workflowId: string): Promise<Workflow> {
    const workflow = await this.get(userId, workflowId);

    return this.create(userId, {
      name: `${workflow.name} (Copy)`,
      description: workflow.description,
      trigger: workflow.trigger,
      filters: workflow.filters,
      actions: workflow.actions,
      schedule: workflow.schedule,
    });
  }

  async getRuns(userId: string, workflowId: string, page: number = 1, limit: number = 20) {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
    });

    if (!workflow) {
      throw new AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
    }

    const [runs, total] = await Promise.all([
      prisma.workflowRun.findMany({
        where: { workflowId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.workflowRun.count({ where: { workflowId } }),
    ]);

    return {
      items: runs.map((run) => this.formatRun(run)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private formatWorkflow(workflow: any): Workflow {
    return {
      id: workflow.id,
      userId: workflow.userId,
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      trigger: workflow.triggerConfig || {},
      filters: workflow.filters,
      actions: workflow.actions || [],
      schedule: workflow.scheduleConfig,
      runCount: workflow.runCount,
      successCount: workflow.successCount,
      failureCount: workflow.failureCount,
      lastRunAt: workflow.lastRunAt,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };
  }

  private formatRun(run: any) {
    return {
      id: run.id,
      workflowId: run.workflowId,
      status: run.status,
      triggerData: run.triggerData,
      steps: run.steps,
      errorMessage: run.errorMessage,
      errorStack: run.errorStack,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      durationMs: run.durationMs,
    };
  }

  private async logAudit(userId: string, action: string, resourceType: string, resourceId: string, details?: any): Promise<void> {
    await prisma.auditLog.create({
      data: { userId, action, resourceType, resourceId, details },
    }).catch(() => {});
  }
}

export const workflowService = new WorkflowService();