import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { JwtPayload } from '../types/index.js';

interface CreateConnectionBody {
  integrationId: string;
  provider: 'oauth' | 'api_key';
  credentials?: Record<string, unknown>;
  code?: string; // For OAuth
}

// Simple encryption key - in production use proper key management
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(parts.join(':'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function connectionRoutes(fastify: FastifyInstance) {
  // Get all user's connections
  fastify.get(
    '/',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as JwtPayload;

      const connections = await prisma.connection.findMany({
        where: { userId: user.userId },
        include: {
          integration: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Decrypt credentials for display (but mask sensitive data)
      const sanitizedConnections = connections.map((conn) => ({
        id: conn.id,
        integrationId: conn.integrationId,
        integration: conn.integration,
        provider: conn.provider,
        providerId: conn.providerId,
        displayName: conn.displayName,
        status: conn.status,
        lastUsedAt: conn.lastUsedAt,
        createdAt: conn.createdAt,
      }));

      return reply.send({
        success: true,
        data: sanitizedConnections,
      });
    }
  );

  // Create new connection (OAuth flow)
  fastify.post<{ Body: CreateConnectionBody }>(
    '/',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['integrationId', 'provider'],
          properties: {
            integrationId: { type: 'string' },
            provider: { type: 'string', enum: ['oauth', 'api_key'] },
            credentials: { type: 'object' },
            code: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateConnectionBody }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { integrationId, provider, credentials, code } = request.body;

      // Validate integration exists
      const integration = await prisma.integration.findUnique({
        where: { id: integrationId },
      });

      if (!integration) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Integration not found',
          },
        });
      }

      let connectionData: Record<string, unknown> = {};
      let refreshToken = '';
      let tokenExpiresAt: Date | null = null;
      let providerId = '';
      let displayName = '';

      if (provider === 'oauth' && code) {
        // In production, exchange code for tokens via OAuth endpoint
        // This is a simplified version
        connectionData = {
          accessToken: encrypt('mock_access_token_' + Date.now()),
          refreshToken: encrypt('mock_refresh_token_' + Date.now()),
        };
        refreshToken = 'mock_refresh_token_' + Date.now();
        tokenExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
        providerId = user.userId.slice(0, 8);
        displayName = user.email.split('@')[0];
      } else if (provider === 'api_key' && credentials) {
        connectionData = {
          apiKey: encrypt(JSON.stringify(credentials)),
        };
        providerId = 'api_key_' + Date.now();
        displayName = 'API Key Connection';
      }

      // Create connection
      const connection = await prisma.connection.create({
        data: {
          userId: user.userId,
          integrationId,
          provider,
          accessToken: encrypt('mock_access_token'),
          refreshToken: refreshToken ? encrypt(refreshToken) : null,
          tokenExpiresAt,
          providerId,
          displayName,
          status: 'active',
        },
        include: {
          integration: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'connection.create',
          resourceType: 'connection',
          resourceId: connection.id,
          details: { integrationId },
        },
      });

      return reply.status(201).send({
        success: true,
        data: {
          id: connection.id,
          integrationId: connection.integrationId,
          integration: connection.integration,
          provider: connection.provider,
          displayName: connection.displayName,
          status: connection.status,
        },
      });
    }
  );

  // Get single connection
  fastify.get(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;

      const connection = await prisma.connection.findFirst({
        where: { id, userId: user.userId },
        include: {
          integration: true,
        },
      });

      if (!connection) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Connection not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: {
          id: connection.id,
          integrationId: connection.integrationId,
          integration: connection.integration,
          provider: connection.provider,
          displayName: connection.displayName,
          status: connection.status,
          lastUsedAt: connection.lastUsedAt,
          createdAt: connection.createdAt,
        },
      });
    }
  );

  // Delete connection
  fastify.delete(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;

      const connection = await prisma.connection.findFirst({
        where: { id, userId: user.userId },
      });

      if (!connection) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Connection not found',
          },
        });
      }

      // Delete related data
      await prisma.workflowRun.deleteMany({
        where: {
          workflow: {
            userId: user.userId,
            triggerConfig: {
              path: ['connectionId'],
              equals: id,
            },
          },
        },
      });

      // Delete connection
      await prisma.connection.delete({
        where: { id },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'connection.delete',
          resourceType: 'connection',
          resourceId: id,
          details: { integrationId: connection.integrationId },
        },
      });

      return reply.send({
        success: true,
        message: 'Connection deleted successfully',
      });
    }
  );

  // Refresh connection token
  fastify.post(
    '/:id/refresh',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = request.user as JwtPayload;
      const { id } = request.params;

      const connection = await prisma.connection.findFirst({
        where: { id, userId: user.userId },
      });

      if (!connection) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Connection not found',
          },
        });
      }

      // In production, use refresh token to get new access token
      // Update connection with new expiry
      await prisma.connection.update({
        where: { id },
        data: {
          tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
          status: 'active',
        },
      });

      return reply.send({
        success: true,
        message: 'Connection refreshed successfully',
      });
    }
  );

  // Get OAuth URL for an integration
  fastify.get(
    '/:id/oauth-url',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;

      // OAuth URLs for each integration
      const oauthUrls: Record<string, string> = {
        google_sheets: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID'}&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URL || 'http://localhost:3000/api/connections/callback')}&response_type=code&scope=https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly&access_type=offline`,
        slack: `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID || 'YOUR_CLIENT_ID'}&scope=chat:write,channels:read,users:read&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URL || 'http://localhost:3000/api/connections/callback')}`,
        notion: `https://api.notion.com/v1/oauth/authorize?client_id=${process.env.NOTION_CLIENT_ID || 'YOUR_CLIENT_ID'}&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URL || 'http://localhost:3000/api/connections/callback')}&response_type=code`,
        hubspot: `https://app.hubspot.com/oauth/authorize?client_id=${process.env.HUBSPOT_CLIENT_ID || 'YOUR_CLIENT_ID'}&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URL || 'http://localhost:3000/api/connections/callback')}&scope=crm.objects.contacts.read crm.objects.deals.read`,
        gmail: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID'}&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URL || 'http://localhost:3000/api/connections/callback')}&response_type=code&scope=https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly&access_type=offline`,
      };

      const url = oauthUrls[id];

      if (!url) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'OAuth not available for this integration',
          },
        });
      }

      return reply.send({
        success: true,
        data: { url },
      });
    }
  );
}