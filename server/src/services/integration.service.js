"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationService = exports.IntegrationService = void 0;
const database_js_1 = require("../config/database.js");
const error_js_1 = require("../middleware/error.js");
class IntegrationService {
    async list() {
        const integrations = await database_js_1.prisma.integration.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
        return integrations.map(this.formatIntegration);
    }
    async getBySlug(slug) {
        const integration = await database_js_1.prisma.integration.findUnique({
            where: { slug },
        });
        if (!integration || !integration.isActive) {
            throw new error_js_1.AppError('INTEGRATION_NOT_FOUND', 'Integration not found', 404);
        }
        return this.formatIntegration(integration);
    }
    async getCategories() {
        const integrations = await database_js_1.prisma.integration.findMany({
            where: { isActive: true },
            select: { category: true },
            distinct: ['category'],
        });
        return integrations
            .map((i) => i.category)
            .filter(Boolean);
    }
    formatIntegration(integration) {
        return {
            id: integration.id,
            slug: integration.slug,
            name: integration.name,
            description: integration.description,
            icon: integration.icon,
            category: integration.category,
            authType: integration.authType,
            triggers: integration.triggers,
            actions: integration.actions,
            isActive: integration.isActive,
        };
    }
}
exports.IntegrationService = IntegrationService;
exports.integrationService = new IntegrationService();
//# sourceMappingURL=integration.service.js.map