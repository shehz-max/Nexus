import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma.js';
import { JwtPayload } from '../types/index.js';

// Pre-defined integrations catalog
const INTEGRATIONS_CATALOG = [
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    description: 'Create, edit, and collaborate on spreadsheets online',
    category: 'Spreadsheets',
    logoUrl: '/logos/google-sheets.svg',
    authType: 'oauth',
    supportedTriggers: ['new_row', 'new_sheet', 'updated_row'],
    supportedActions: ['create_row', 'update_row', 'delete_row', 'create_sheet'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send and receive emails through your Google account',
    category: 'Communication',
    logoUrl: '/logos/gmail.svg',
    authType: 'oauth',
    supportedTriggers: ['new_email', 'new_email_matching'],
    supportedActions: ['send_email', 'reply_email', 'mark_as_read'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and collaboration platform',
    category: 'Communication',
    logoUrl: '/logos/slack.svg',
    authType: 'oauth',
    supportedTriggers: ['new_message', 'new_mention'],
    supportedActions: ['send_message', 'send_dm', 'create_channel'],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace for notes, tasks, and collaboration',
    category: 'Productivity',
    logoUrl: '/logos/notion.svg',
    authType: 'oauth',
    supportedTriggers: ['new_page', 'updated_page', 'new_database_item'],
    supportedActions: ['create_page', 'update_page', 'create_database_item'],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM, marketing, and sales automation platform',
    category: 'CRM',
    logoUrl: '/logos/hubspot.svg',
    authType: 'oauth',
    supportedTriggers: ['new_contact', 'new_deal', 'deal_stage_changed', 'new_company'],
    supportedActions: ['create_contact', 'create_deal', 'update_contact', 'create_company'],
  },
];

export async function integrationRoutes(fastify: FastifyInstance) {
  // Get all available integrations
  fastify.get(
    '/',
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({
        success: true,
        data: INTEGRATIONS_CATALOG,
      });
    }
  );

  // Get single integration details
  fastify.get(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;

      const integration = INTEGRATIONS_CATALOG.find((i) => i.id === id);

      if (!integration) {
        return reply.status(404).send({
          success: false,
          error: {
            statusCode: 404,
            message: 'Integration not found',
          },
        });
      }

      return reply.send({
        success: true,
        data: integration,
      });
    }
  );

  // Get categories
  fastify.get(
    '/categories',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const categories = [...new Set(INTEGRATIONS_CATALOG.map((i) => i.category))];

      return reply.send({
        success: true,
        data: categories,
      });
    }
  );
}