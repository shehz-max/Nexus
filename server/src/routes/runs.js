"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_js_1 = require("../config/database.js");
const auth_js_1 = require("../middleware/auth.js");
const error_js_1 = require("../middleware/error.js");
const error_js_2 = require("../middleware/error.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// GET /runs - List all runs for user
router.get('/', (0, error_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const status = req.query.status;
    const workflowId = req.query.workflowId;
    const where = {};
    // Only get runs for user's workflows
    where.workflow = { userId: req.user.id };
    if (status)
        where.status = status;
    if (workflowId)
        where.workflowId = workflowId;
    const [runs, total] = await Promise.all([
        database_js_1.prisma.workflowRun.findMany({
            where,
            include: {
                workflow: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: (page - 1) * limit,
        }),
        database_js_1.prisma.workflowRun.count({ where }),
    ]);
    res.json({
        success: true,
        data: {
            items: runs.map((run) => ({
                id: run.id,
                workflowId: run.workflowId,
                workflowName: run.workflow.name,
                status: run.status,
                triggerData: run.triggerData,
                steps: run.steps,
                errorMessage: run.errorMessage,
                startedAt: run.startedAt,
                completedAt: run.completedAt,
                durationMs: run.durationMs,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        },
    });
}));
// GET /runs/stats - Get run statistics
router.get('/stats', (0, error_js_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const stats = await database_js_1.prisma.workflowRun.findMany({
        where: {
            workflow: { userId },
        },
        select: {
            status: true,
        },
    });
    const total = stats.length;
    const success = stats.filter((s) => s.status === 'success').length;
    const failed = stats.filter((s) => s.status === 'failed').length;
    const running = stats.filter((s) => s.status === 'running').length;
    res.json({
        success: true,
        data: {
            total,
            success,
            failed,
            running,
            successRate: total > 0 ? Math.round((success / total) * 1000) / 10 : 0,
        },
    });
}));
// GET /runs/:id - Get run details
router.get('/:id', (0, error_js_1.asyncHandler)(async (req, res) => {
    const run = await database_js_1.prisma.workflowRun.findFirst({
        where: {
            id: req.params.id,
            workflow: { userId: req.user.id },
        },
        include: {
            workflow: {
                select: { id: true, name: true },
            },
        },
    });
    if (!run) {
        throw new error_js_2.AppError('RUN_NOT_FOUND', 'Run not found', 404);
    }
    res.json({
        success: true,
        data: {
            run: {
                id: run.id,
                workflowId: run.workflowId,
                workflowName: run.workflow.name,
                status: run.status,
                triggerData: run.triggerData,
                steps: run.steps,
                errorMessage: run.errorMessage,
                errorStack: run.errorStack,
                startedAt: run.startedAt,
                completedAt: run.completedAt,
                durationMs: run.durationMs,
            },
        },
    });
}));
// POST /runs/:id/retry - Retry failed run
router.post('/:id/retry', (0, error_js_1.asyncHandler)(async (req, res) => {
    const run = await database_js_1.prisma.workflowRun.findFirst({
        where: {
            id: req.params.id,
            workflow: { userId: req.user.id },
        },
        include: {
            workflow: true,
        },
    });
    if (!run) {
        throw new error_js_2.AppError('RUN_NOT_FOUND', 'Run not found', 404);
    }
    if (run.status !== 'failed') {
        throw new error_js_2.AppError('RUN_NOT_RETRYABLE', 'Only failed runs can be retried', 400);
    }
    // Create new run as copy of failed run
    const newRun = await database_js_1.prisma.workflowRun.create({
        data: {
            workflowId: run.workflowId,
            status: 'pending',
            triggerData: run.triggerData,
        },
    });
    // TODO: Add to execution queue
    res.status(201).json({
        success: true,
        data: {
            run: {
                id: newRun.id,
                status: newRun.status,
                createdAt: newRun.createdAt,
            },
        },
    });
}));
// DELETE /runs/:id - Cancel running run
router.delete('/:id', (0, error_js_1.asyncHandler)(async (req, res) => {
    const run = await database_js_1.prisma.workflowRun.findFirst({
        where: {
            id: req.params.id,
            workflow: { userId: req.user.id },
        },
    });
    if (!run) {
        throw new error_js_2.AppError('RUN_NOT_FOUND', 'Run not found', 404);
    }
    await database_js_1.prisma.workflowRun.update({
        where: { id: req.params.id },
        data: { status: 'cancelled' },
    });
    res.json({
        success: true,
        data: { message: 'Run cancelled' },
    });
}));
exports.default = router;
//# sourceMappingURL=runs.js.map