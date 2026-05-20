"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const workflow_service_js_1 = require("../services/workflow.service.js");
const auth_js_1 = require("../middleware/auth.js");
const error_js_1 = require("../middleware/error.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Validation schemas
const createWorkflowSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    trigger: zod_1.z.object({
        connectionId: zod_1.z.string().uuid(),
        triggerId: zod_1.z.string().min(1),
        config: zod_1.z.record(zod_1.z.any()).optional(),
        pollingInterval: zod_1.z.number().optional(),
    }),
    filters: zod_1.z.object({
        conditions: zod_1.z.array(zod_1.z.object({
            field: zod_1.z.string(),
            operator: zod_1.z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'greater_than', 'less_than', 'is_empty', 'is_not_empty', 'regex']),
            value: zod_1.z.any(),
        })),
        logic: zod_1.z.enum(['AND', 'OR']).optional(),
    }).optional(),
    actions: zod_1.z.array(zod_1.z.object({
        connectionId: zod_1.z.string().uuid(),
        actionId: zod_1.z.string().min(1),
        config: zod_1.z.record(zod_1.z.any()),
        continueOnError: zod_1.z.boolean().optional(),
    })).min(1),
    schedule: zod_1.z.object({
        type: zod_1.z.enum(['realtime', 'interval', 'cron', 'manual']),
        interval: zod_1.z.number().optional(),
        cron: zod_1.z.string().optional(),
    }).optional(),
});
const updateWorkflowSchema = createWorkflowSchema.partial();
// GET /workflows - List user's workflows
router.get('/', (0, error_js_1.asyncHandler)(async (req, res) => {
    const workflows = await workflow_service_js_1.workflowService.list(req.user.id);
    res.json({
        success: true,
        data: { workflows },
    });
}));
// GET /workflows/:id - Get workflow details
router.get('/:id', (0, error_js_1.asyncHandler)(async (req, res) => {
    const workflow = await workflow_service_js_1.workflowService.get(req.user.id, req.params.id);
    res.json({
        success: true,
        data: { workflow },
    });
}));
// POST /workflows - Create new workflow
router.post('/', (0, error_js_1.asyncHandler)(async (req, res) => {
    const data = createWorkflowSchema.parse(req.body);
    const workflow = await workflow_service_js_1.workflowService.create(req.user.id, data);
    res.status(201).json({
        success: true,
        data: { workflow },
    });
}));
// PATCH /workflows/:id - Update workflow
router.patch('/:id', (0, error_js_1.asyncHandler)(async (req, res) => {
    const data = updateWorkflowSchema.parse(req.body);
    const workflow = await workflow_service_js_1.workflowService.update(req.user.id, req.params.id, data);
    res.json({
        success: true,
        data: { workflow },
    });
}));
// DELETE /workflows/:id - Delete workflow
router.delete('/:id', (0, error_js_1.asyncHandler)(async (req, res) => {
    await workflow_service_js_1.workflowService.delete(req.user.id, req.params.id);
    res.json({
        success: true,
        data: { message: 'Workflow deleted successfully' },
    });
}));
// POST /workflows/:id/enable - Activate workflow
router.post('/:id/enable', (0, error_js_1.asyncHandler)(async (req, res) => {
    const workflow = await workflow_service_js_1.workflowService.enable(req.user.id, req.params.id);
    res.json({
        success: true,
        data: { workflow },
    });
}));
// POST /workflows/:id/disable - Pause workflow
router.post('/:id/disable', (0, error_js_1.asyncHandler)(async (req, res) => {
    const workflow = await workflow_service_js_1.workflowService.disable(req.user.id, req.params.id);
    res.json({
        success: true,
        data: { workflow },
    });
}));
// POST /workflows/:id/duplicate - Clone workflow
router.post('/:id/duplicate', (0, error_js_1.asyncHandler)(async (req, res) => {
    const workflow = await workflow_service_js_1.workflowService.duplicate(req.user.id, req.params.id);
    res.status(201).json({
        success: true,
        data: { workflow },
    });
}));
// GET /workflows/:id/runs - Get workflow run history
router.get('/:id/runs', (0, error_js_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await workflow_service_js_1.workflowService.getRuns(req.user.id, req.params.id, page, limit);
    res.json({
        success: true,
        data: result,
    });
}));
exports.default = router;
//# sourceMappingURL=workflows.js.map