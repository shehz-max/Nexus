"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionService = exports.ConnectionService = void 0;
const database_js_1 = require("../config/database.js");
const error_js_1 = require("../middleware/error.js");
const index_js_1 = require("../integrations/index.js");
class ConnectionService {
    async list(userId) {
        const connections = await database_js_1.prisma.connection.findMany({
            where: { userId },
            include: {
                integration: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return connections.map(this.formatConnection);
    }
    async get(userId, connectionId) {
        const connection = await database_js_1.prisma.connection.findFirst({
            where: { id: connectionId, userId },
            include: { integration: true },
        });
        if (!connection) {
            throw new error_js_1.AppError('CONNECTION_NOT_FOUND', 'Connection not found', 404);
        }
        return this.formatConnection(connection);
    }
    async create(userId, integrationSlug, code, state) {
        // Get integration
        const integration = await database_js_1.prisma.integration.findUnique({
            where: { slug: integrationSlug },
        });
        if (!integration) {
            throw new error_js_1.AppError('INTEGRATION_NOT_FOUND', 'Integration not found', 404);
        }
        // Get adapter
        const adapter = index_js_1.integrationAdapters[integrationSlug];
        if (!adapter) {
            throw new error_js_1.AppError('INTEGRATION_NOT_SUPPORTED', 'This integration is not yet supported', 400);
        }
        // Exchange code for tokens
        const credentials = await adapter.handleCallback(code, state);
        // Create connection
        const connection = await database_js_1.prisma.connection.create({
            data: {
                userId,
                integrationId: integration.id,
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken,
                tokenExpiresAt: credentials.expiresAt,
                providerId: credentials.providerId,
                providerEmail: credentials.providerEmail,
                displayName: credentials.providerEmail,
                status: 'active',
                lastSyncAt: new Date(),
            },
            include: { integration: true },
        });
        // Audit log
        await this.logAudit(userId, 'create', 'connection', connection.id, { integration: integrationSlug });
        return this.formatConnection(connection);
    }
    async delete(userId, connectionId) {
        const connection = await database_js_1.prisma.connection.findFirst({
            where: { id: connectionId, userId },
        });
        if (!connection) {
            throw new error_js_1.AppError('CONNECTION_NOT_FOUND', 'Connection not found', 404);
        }
        await database_js_1.prisma.connection.delete({
            where: { id: connectionId },
        });
        await this.logAudit(userId, 'delete', 'connection', connectionId, { integrationId: connection.integrationId });
    }
    async test(userId, connectionId) {
        const connection = await database_js_1.prisma.connection.findFirst({
            where: { id: connectionId, userId },
            include: { integration: true },
        });
        if (!connection) {
            throw new error_js_1.AppError('CONNECTION_NOT_FOUND', 'Connection not found', 404);
        }
        const adapter = index_js_1.integrationAdapters[connection.integration.slug];
        if (!adapter) {
            return { success: false, message: 'Integration adapter not found' };
        }
        try {
            const credentials = {
                accessToken: connection.accessToken,
                refreshToken: connection.refreshToken || undefined,
                expiresAt: connection.tokenExpiresAt || undefined,
                providerId: connection.providerId || undefined,
                providerEmail: connection.providerEmail || undefined,
            };
            const isValid = await adapter.testConnection(credentials);
            if (isValid) {
                await database_js_1.prisma.connection.update({
                    where: { id: connectionId },
                    data: { lastSyncAt: new Date(), status: 'active', lastError: null },
                });
                return { success: true, message: 'Connection is working' };
            }
            else {
                return { success: false, message: 'Connection test failed' };
            }
        }
        catch (error) {
            await database_js_1.prisma.connection.update({
                where: { id: connectionId },
                data: { status: 'error', lastError: error.message },
            });
            return { success: false, message: error.message };
        }
    }
    async refreshTokens(userId, connectionId) {
        const connection = await database_js_1.prisma.connection.findFirst({
            where: { id: connectionId, userId },
            include: { integration: true },
        });
        if (!connection) {
            throw new error_js_1.AppError('CONNECTION_NOT_FOUND', 'Connection not found', 404);
        }
        const adapter = index_js_1.integrationAdapters[connection.integration.slug];
        if (!adapter) {
            throw new error_js_1.AppError('INTEGRATION_NOT_SUPPORTED', 'Integration adapter not found', 400);
        }
        const credentials = {
            accessToken: connection.accessToken,
            refreshToken: connection.refreshToken || undefined,
            expiresAt: connection.tokenExpiresAt || undefined,
        };
        const newCredentials = await adapter.refreshCredentials(credentials);
        const updated = await database_js_1.prisma.connection.update({
            where: { id: connectionId },
            data: {
                accessToken: newCredentials.accessToken,
                refreshToken: newCredentials.refreshToken,
                tokenExpiresAt: newCredentials.expiresAt,
                lastSyncAt: new Date(),
            },
            include: { integration: true },
        });
        return this.formatConnection(updated);
    }
    async getOAuthUrl(integrationSlug, state) {
        const integration = await database_js_1.prisma.integration.findUnique({
            where: { slug: integrationSlug },
        });
        if (!integration) {
            throw new error_js_1.AppError('INTEGRATION_NOT_FOUND', 'Integration not found', 404);
        }
        const adapter = index_js_1.integrationAdapters[integrationSlug];
        if (!adapter) {
            throw new error_js_1.AppError('INTEGRATION_NOT_SUPPORTED', 'This integration is not yet supported', 400);
        }
        return adapter.getOAuthUrl(state);
    }
    formatConnection(connection) {
        return {
            id: connection.id,
            userId: connection.userId,
            integrationId: connection.integrationId,
            integration: connection.integration ? {
                id: connection.integration.id,
                slug: connection.integration.slug,
                name: connection.integration.name,
                description: connection.integration.description,
                icon: connection.integration.icon,
                category: connection.integration.category,
                authType: connection.integration.authType,
                triggers: connection.integration.triggers,
                actions: connection.integration.actions,
                isActive: connection.integration.isActive,
            } : undefined,
            providerId: connection.providerId,
            providerEmail: connection.providerEmail,
            displayName: connection.displayName,
            status: connection.status,
            lastSyncAt: connection.lastSyncAt,
            createdAt: connection.createdAt,
        };
    }
    async logAudit(userId, action, resourceType, resourceId, details) {
        await database_js_1.prisma.auditLog.create({
            data: { userId, action, resourceType, resourceId, details },
        }).catch(() => { });
    }
}
exports.ConnectionService = ConnectionService;
exports.connectionService = new ConnectionService();
//# sourceMappingURL=connection.service.js.map