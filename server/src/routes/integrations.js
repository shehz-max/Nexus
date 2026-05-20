"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const integration_service_js_1 = require("../services/integration.service.js");
const error_js_1 = require("../middleware/error.js");
const router = (0, express_1.Router)();
// GET /integrations - List all integrations
router.get('/', (0, error_js_1.asyncHandler)(async (_req, res) => {
    const integrations = await integration_service_js_1.integrationService.list();
    res.json({
        success: true,
        data: { integrations },
    });
}));
// GET /integrations/categories - Get integration categories
router.get('/categories', (0, error_js_1.asyncHandler)(async (_req, res) => {
    const categories = await integration_service_js_1.integrationService.getCategories();
    res.json({
        success: true,
        data: { categories },
    });
}));
// GET /integrations/:slug - Get integration by slug
router.get('/:slug', (0, error_js_1.asyncHandler)(async (req, res) => {
    const integration = await integration_service_js_1.integrationService.getBySlug(req.params.slug);
    res.json({
        success: true,
        data: { integration },
    });
}));
exports.default = router;
//# sourceMappingURL=integrations.js.map