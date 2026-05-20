"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const connection_service_js_1 = require("../services/connection.service.js");
const auth_js_1 = require("../middleware/auth.js");
const error_js_1 = require("../middleware/error.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Validation schemas
const createConnectionSchema = zod_1.z.object({
    integration: zod_1.z.string().min(1),
    code: zod_1.z.string().min(1).optional(),
    state: zod_1.z.string().optional(),
});
// GET /connections - List user's connections
router.get('/', (0, error_js_1.asyncHandler)(async (req, res) => {
    const connections = await connection_service_js_1.connectionService.list(req.user.id);
    res.json({
        success: true,
        data: { connections },
    });
}));
// GET /connections/:id - Get connection details
router.get('/:id', (0, error_js_1.asyncHandler)(async (req, res) => {
    const connection = await connection_service_js_1.connectionService.get(req.user.id, req.params.id);
    res.json({
        success: true,
        data: { connection },
    });
}));
// POST /connections - Create new connection (OAuth callback)
router.post('/', (0, error_js_1.asyncHandler)(async (req, res) => {
    const { integration, code, state } = createConnectionSchema.parse(req.body);
    const connection = await connection_service_js_1.connectionService.create(req.user.id, integration, code || '', state);
    res.status(201).json({
        success: true,
        data: { connection },
    });
}));
// DELETE /connections/:id - Remove connection
router.delete('/:id', (0, error_js_1.asyncHandler)(async (req, res) => {
    await connection_service_js_1.connectionService.delete(req.user.id, req.params.id);
    res.json({
        success: true,
        data: { message: 'Connection removed successfully' },
    });
}));
// POST /connections/:id/test - Test connection
router.post('/:id/test', (0, error_js_1.asyncHandler)(async (req, res) => {
    const result = await connection_service_js_1.connectionService.test(req.user.id, req.params.id);
    res.json({
        success: true,
        data: result,
    });
}));
// POST /connections/:id/refresh - Refresh OAuth tokens
router.post('/:id/refresh', (0, error_js_1.asyncHandler)(async (req, res) => {
    const connection = await connection_service_js_1.connectionService.refreshTokens(req.user.id, req.params.id);
    res.json({
        success: true,
        data: { connection },
    });
}));
// GET /connections/:id/oauth-url - Get OAuth URL for connection
router.get('/:id/oauth-url', (0, error_js_1.asyncHandler)(async (req, res) => {
    const url = await connection_service_js_1.connectionService.getOAuthUrl(req.params.id, req.user.id);
    res.json({
        success: true,
        data: { url },
    });
}));
exports.default = router;
//# sourceMappingURL=connections.js.map