"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_service_js_1 = require("../services/auth.service.js");
const auth_js_1 = require("../middleware/auth.js");
const error_js_1 = require("../middleware/error.js");
const router = (0, express_1.Router)();
// Validation schemas
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().min(1).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
// POST /auth/register
router.post('/register', (0, error_js_1.asyncHandler)(async (req, res) => {
    const { email, password, name } = registerSchema.parse(req.body);
    const result = await auth_service_js_1.authService.register(email, password, name);
    res.status(201).json({
        success: true,
        data: result,
    });
}));
// POST /auth/login
router.post('/login', (0, error_js_1.asyncHandler)(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const result = await auth_service_js_1.authService.login(email, password);
    res.json({
        success: true,
        data: result,
    });
}));
// POST /auth/refresh
router.post('/refresh', (0, error_js_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const tokens = await auth_service_js_1.authService.refresh(refreshToken);
    res.json({
        success: true,
        data: tokens,
    });
}));
// POST /auth/logout
router.post('/logout', (0, error_js_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    await auth_service_js_1.authService.logout(refreshToken);
    res.json({
        success: true,
        data: { message: 'Logged out successfully' },
    });
}));
// GET /auth/me
router.get('/me', auth_js_1.authenticate, (0, error_js_1.asyncHandler)(async (req, res) => {
    const user = await auth_service_js_1.authService.getUser(req.user.id);
    res.json({
        success: true,
        data: { user },
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map