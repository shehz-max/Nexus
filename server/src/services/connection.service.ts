import { prisma } from '../config/database.js';
import { Connection, Credentials } from '../types/index.js';
import { AppError } from '../middleware/error.js';
import { integrationAdapters } from '../integrations/index.js';

export class ConnectionService {
  async list(userId: string): Promise<Connection[]> {
    const connections = await prisma.connection.findMany({
      where: { userId },
      include: {
        integration: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return connections.map(this.formatConnection);
  }

  async get(userId: string, connectionId: string): Promise<Connection> {
    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, userId },
      include: { integration: true },
    });

    if (!connection) {
      throw new AppError('CONNECTION_NOT_FOUND', 'Connection not found', 404);
    }

    return this.formatConnection(connection);
  }

  async create(
    userId: string,
    integrationSlug: string,
    code: string,
    state?: string
  ): Promise<Connection & { oauthUrl?: string }> {
    // Get integration
    const integration = await prisma.integration.findUnique({
      where: { slug: integrationSlug },
    });

    if (!integration) {
      throw new AppError('INTEGRATION_NOT_FOUND', 'Integration not found', 404);
    }

    // Get adapter
    const adapter = integrationAdapters[integrationSlug];
    if (!adapter) {
      throw new AppError('INTEGRATION_NOT_SUPPORTED', 'This integration is not yet supported', 400);
    }

    // Exchange code for tokens
    const credentials = await adapter.handleCallback(code, state);

    // Create connection
    const connection = await prisma.connection.create({
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

  async delete(userId: string, connectionId: string): Promise<void> {
    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, userId },
    });

    if (!connection) {
      throw new AppError('CONNECTION_NOT_FOUND', 'Connection not found', 404);
    }

    await prisma.connection.delete({
      where: { id: connectionId },
    });

    await this.logAudit(userId, 'delete', 'connection', connectionId, { integrationId: connection.integrationId });
  }

  async test(userId: string, connectionId: string): Promise<{ success: boolean; message: string }> {
    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, userId },
      include: { integration: true },
    });

    if (!connection) {
      throw new AppError('CONNECTION_NOT_FOUND', 'Connection not found', 404);
    }

    const adapter = integrationAdapters[connection.integration.slug];
    if (!adapter) {
      return { success: false, message: 'Integration adapter not found' };
    }

    try {
      const credentials: Credentials = {
        accessToken: connection.accessToken,
        refreshToken: connection.refreshToken || undefined,
        expiresAt: connection.tokenExpiresAt || undefined,
        providerId: connection.providerId || undefined,
        providerEmail: connection.providerEmail || undefined,
      };

      const isValid = await adapter.testConnection(credentials);

      if (isValid) {
        await prisma.connection.update({
          where: { id: connectionId },
          data: { lastSyncAt: new Date(), status: 'active', lastError: null },
        });
        return { success: true, message: 'Connection is working' };
      } else {
        return { success: false, message: 'Connection test failed' };
      }
    } catch (error: any) {
      await prisma.connection.update({
        where: { id: connectionId },
        data: { status: 'error', lastError: error.message },
      });
      return { success: false, message: error.message };
    }
  }

  async refreshTokens(userId: string, connectionId: string): Promise<Connection> {
    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, userId },
      include: { integration: true },
    });

    if (!connection) {
      throw new AppError('CONNECTION_NOT_FOUND', 'Connection not found', 404);
    }

    const adapter = integrationAdapters[connection.integration.slug];
    if (!adapter) {
      throw new AppError('INTEGRATION_NOT_SUPPORTED', 'Integration adapter not found', 400);
    }

    const credentials: Credentials = {
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken || undefined,
      expiresAt: connection.tokenExpiresAt || undefined,
    };

    const newCredentials = await adapter.refreshCredentials(credentials);

    const updated = await prisma.connection.update({
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

  async getOAuthUrl(integrationSlug: string, state?: string): Promise<string> {
    const integration = await prisma.integration.findUnique({
      where: { slug: integrationSlug },
    });

    if (!integration) {
      throw new AppError('INTEGRATION_NOT_FOUND', 'Integration not found', 404);
    }

    const adapter = integrationAdapters[integrationSlug];
    if (!adapter) {
      throw new AppError('INTEGRATION_NOT_SUPPORTED', 'This integration is not yet supported', 400);
    }

    return adapter.getOAuthUrl(state);
  }

  private formatConnection(connection: any): Connection {
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
        authType: connection.integration.authType as 'oauth2' | 'apikey' | 'webhook',
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

  private async logAudit(userId: string, action: string, resourceType: string, resourceId: string, details?: any): Promise<void> {
    await prisma.auditLog.create({
      data: { userId, action, resourceType, resourceId, details },
    }).catch(() => {});
  }
}

export const connectionService = new ConnectionService();