import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fastifyJwt from '@fastify/jwt';
import { errorHandler } from './plugins/error-handler.js';
import { authRoutes } from './routes/auth.js';
import { integrationRoutes } from './routes/integrations.js';
import { connectionRoutes } from './routes/connections.js';
import { workflowRoutes } from './routes/workflows.js';
import { runsRoutes } from './routes/runs.js';
import prisma from './lib/prisma.js';

const fastify = Fastify({
  logger: true,
});

// Add plugins
await fastify.register(cors, {
  origin: true, // In production, specify allowed origins
  credentials: true,
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

await fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
});

// Auth decorator
fastify.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({
      success: false,
      error: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    });
  }
});

// Error handler
fastify.setErrorHandler(errorHandler);

// Seed integrations catalog on startup
async function seedIntegrations() {
  const integrations = [
    {
      id: 'google_sheets',
      slug: 'google-sheets',
      name: 'Google Sheets',
      description: 'Create, edit, and collaborate on spreadsheets online',
      icon: 'sheets',
      category: 'Spreadsheets',
      authType: 'oauth2',
      scopes: [],
      triggers: JSON.stringify(['new_row', 'new_sheet', 'updated_row']),
      actions: JSON.stringify(['create_row', 'update_row', 'delete_row', 'create_sheet']),
    },
    {
      id: 'gmail',
      slug: 'gmail',
      name: 'Gmail',
      description: 'Send and receive emails through your Google account',
      icon: 'gmail',
      category: 'Communication',
      authType: 'oauth2',
      scopes: [],
      triggers: JSON.stringify(['new_email', 'new_email_matching']),
      actions: JSON.stringify(['send_email', 'reply_email', 'mark_as_read']),
    },
    {
      id: 'slack',
      slug: 'slack',
      name: 'Slack',
      description: 'Team communication and collaboration platform',
      icon: 'slack',
      category: 'Communication',
      authType: 'oauth2',
      scopes: [],
      triggers: JSON.stringify(['new_message', 'new_mention']),
      actions: JSON.stringify(['send_message', 'send_dm', 'create_channel']),
    },
    {
      id: 'notion',
      slug: 'notion',
      name: 'Notion',
      description: 'All-in-one workspace for notes, tasks, and collaboration',
      icon: 'notion',
      category: 'Productivity',
      authType: 'oauth2',
      scopes: [],
      triggers: JSON.stringify(['new_page', 'updated_page', 'new_database_item']),
      actions: JSON.stringify(['create_page', 'update_page', 'create_database_item']),
    },
    {
      id: 'hubspot',
      slug: 'hubspot',
      name: 'HubSpot',
      description: 'CRM, marketing, and sales automation platform',
      icon: 'hubspot',
      category: 'CRM',
      authType: 'oauth2',
      scopes: [],
      triggers: JSON.stringify(['new_contact', 'new_deal', 'deal_stage_changed', 'new_company']),
      actions: JSON.stringify(['create_contact', 'create_deal', 'update_contact', 'create_company']),
    },
  ];

  for (const integration of integrations) {
    await prisma.integration.upsert({
      where: { id: integration.id },
      update: {},
      create: integration,
    });
  }

  console.log('✅ Integrations catalog seeded');
}

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(integrationRoutes, { prefix: '/api/integrations' });
fastify.register(connectionRoutes, { prefix: '/api/connections' });
fastify.register(workflowRoutes, { prefix: '/api/workflows' });
fastify.register(runsRoutes, { prefix: '/api/runs' });

// Health check
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

// Start server
const start = async () => {
  try {
    // Seed database
    await seedIntegrations();

    const port = parseInt(process.env.PORT || '3000');
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    console.log(`
🚀 Integration Hub API is running!
   Local: http://localhost:${port}
   Health: http://localhost:${port}/health
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();