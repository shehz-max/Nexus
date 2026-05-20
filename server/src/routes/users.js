"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_service_js_1 = require("../services/auth.service.js");
const database_js_1 = require("../config/database.js");
const auth_js_1 = require("../middleware/auth.js");
const error_js_1 = require("../middleware/error.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Validation schemas
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    avatarUrl: zod_1.z.string().url().optional(),
});
const updatePreferencesSchema = zod_1.z.object({
    theme: zod_1.z.enum(['light', 'dark', 'system']).optional(),
    timezone: zod_1.z.string().optional(),
    notifications: zod_1.z.object({
        email: zod_1.z.boolean().optional(),
        runs: zod_1.z.boolean().optional(),
        errors: zod_1.z.boolean().optional(),
    }).optional(),
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
// GET /users/me - Get current user
router.get('/me', (0, error_js_1.asyncHandler)(async (req, res) => {
    const user = await auth_service_js_1.authService.getUser(req.user.id);
    res.json({
        success: true,
        data: { user },
    });
}));
// PATCH /users/me - Update profile
router.patch('/me', (0, error_js_1.asyncHandler)(async (req, res) => {
    const data = updateProfileSchema.parse(req.body);
    const user = await auth_service_js_1.authService.updateUser(req.user.id, data);
    res.json({
        success: true,
        data: { user },
    });
}));
// GET /users/me/preferences - Get user preferences
router.get('/me/preferences', (0, error_js_1.asyncHandler)(async (req, res) => {
    const preferences = await database_js_1.prisma.userPreference.findUnique({
        where: { userId: req.user.id },
    });
    res.json({
        success: true,
        data: { preferences },
    });
}));
// PATCH /users/me/preferences - Update preferences
router.patch('/me/preferences', (0, error_js_1.asyncHandler)(async (req, res) => {
    const data = updatePreferencesSchema.parse(req.body);
    const preferences = await database_js_1.prisma.userPreference.upsert({
        where: { userId: req.user.id },
        create: {
            userId: req.user.id,
            ...data,
        },
        update: data,
    });
    res.json({
        success: true,
        data: { preferences },
    });
}));
// POST /users/me/password - Change password
router.post('/me/password', (0, error_js_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    await auth_service_js_1.authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({
        success: true,
        data: { message: 'Password changed successfully' },
    });
}));
exports.default = router;
//# sourceMappingURL=users.js.map