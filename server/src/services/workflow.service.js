"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowService = exports.WorkflowService = void 0;
const database_js_1 = require("../config/database.js");
const error_js_1 = require("../middleware/error.js");
const index_js_1 = require("../types/index.js");
class WorkflowService {
    async list(userId) {
        const workflows = await database_js_1.prisma.workflow.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
        return workflows.map(this.formatWorkflow);
    }
    async get(userId, workflowId) {
        const workflow = await database_js_1.prisma.workflow.findFirst({
            where: { id: workflowId, userId },
        });
        if (!workflow) {
            throw new error_js_1.AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
        }
        return this.formatWorkflow(workflow);
    }
    async create(userId, data) {
        // Check workflow limits
        const user = await database_js_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new error_js_1.AppError('USER_NOT_FOUND', 'User not found', 404);
        const limits = index_js_1.PLAN_LIMITS[user.plan] || index_js_1.PLAN_LIMITS.free;
        const workflowCount = await database_js_1.prisma.workflow.count({ where: { userId } });
        if (limits.maxWorkflows !== -1 && workflowCount >= limits.maxWorkflows) {
            throw new error_js_1.AppError('WORKFLOW_LIMIT_REACHED', `You have reached the limit of ${limits.maxWorkflows} workflows on your ${user.plan} plan`, 403);
        }
        // Create workflow with trigger
        const workflow = await database_js_1.prisma.workflow.create({
            data: {
                userId,
                name: data.name,
                description: data.description,
                status: 'draft',
                triggerConfig: data.trigger,
                filters: data.filters,
                actions: data.actions,
                scheduleConfig: data.schedule,
                workflowTriggers: {
                    create: {
                        integrationId: data.trigger.integrationId,
                        triggerId: data.trigger.triggerId,
                        config: data.trigger.config,
                        pollingInterval: data.trigger.pollingInterval || limits.pollingInterval,
                    },
                },
                workflowActions: {
                    create: data.actions.map((action, index) => ({
                        connectionId: action.connectionId,
                        integrationId: action.integrationId,
                        actionId: action.actionId,
                        config: action.config,
                        order: index,
                        continueOnError: action.continueOnError || false,
                    })),
                },
            },
        });
        await this.logAudit(userId, 'create', 'workflow', workflow.id);
        return this.formatWorkflow(workflow);
    }
    async update(userId, workflowId, data) {
        const workflow = await database_js_1.prisma.workflow.findFirst({
            where: { id: workflowId, userId },
        });
        if (!workflow) {
            throw new error_js_1.AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
        }
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.trigger !== undefined)
            updateData.triggerConfig = data.trigger;
        if (data.filters !== undefined)
            updateData.filters = data.filters;
        if (data.actions !== undefined)
            updateData.actions = data.actions;
        if (data.schedule !== undefined)
            updateData.scheduleConfig = data.schedule;
        const updated = await database_js_1.prisma.workflow.update({
            where: { id: workflowId },
            data: updateData,
        });
        await this.logAudit(userId, 'update', 'workflow', workflowId);
        return this.formatWorkflow(updated);
    }
    async delete(userId, workflowId) {
        const workflow = await database_js_1.prisma.workflow.findFirst({
            where: { id: workflowId, userId },
        });
        if (!workflow) {
            throw new error_js_1.AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
        }
        await database_js_1.prisma.workflow.delete({ where: { id: workflowId } });
        await this.logAudit(userId, 'delete', 'workflow', workflowId);
    }
    async enable(userId, workflowId) {
        const workflow = await database_js_1.prisma.workflow.findFirst({
            where: { id: workflowId, userId },
        });
        if (!workflow) {
            throw new error_js_1.AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
        }
        const updated = await database_js_1.prisma.workflow.update({
            where: { id: workflowId },
            data: { status: 'active' },
        });
        await this.logAudit(userId, 'enable', 'workflow', workflowId);
        return this.formatWorkflow(updated);
    }
    async disable(userId, workflowId) {
        const workflow = await database_js_1.prisma.workflow.findFirst({
            where: { id: workflowId, userId },
        });
        if (!workflow) {
            throw new error_js_1.AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
        }
        const updated = await database_js_1.prisma.workflow.update({
            where: { id: workflowId },
            data: { status: 'paused' },
        });
        await this.logAudit(userId, 'disable', 'workflow', workflowId);
        return this.formatWorkflow(updated);
    }
    async duplicate(userId, workflowId) {
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
    async getRuns(userId, workflowId, page = 1, limit = 20) {
        const workflow = await database_js_1.prisma.workflow.findFirst({
            where: { id: workflowId, userId },
        });
        if (!workflow) {
            throw new error_js_1.AppError('WORKFLOW_NOT_FOUND', 'Workflow not found', 404);
        }
        const [runs, total] = await Promise.all([
            database_js_1.prisma.workflowRun.findMany({
                where: { workflowId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: (page - 1) * limit,
            }),
            database_js_1.prisma.workflowRun.count({ where: { workflowId } }),
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
    formatWorkflow(workflow) {
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
    formatRun(run) {
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
    async logAudit(userId, action, resourceType, resourceId, details) {
        await database_js_1.prisma.auditLog.create({
            data: { userId, action, resourceType, resourceId, details },
        }).catch(() => { });
    }
}
exports.WorkflowService = WorkflowService;
exports.workflowService = new WorkflowService();
//# sourceMappingURL=workflow.service.js.map