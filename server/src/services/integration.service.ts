import { prisma } from '../config/database.js';
import { Integration, IntegrationTrigger, IntegrationAction } from '../types/index.js';
import { AppError } from '../middleware/error.js';

export class IntegrationService {
  async list(): Promise<Integration[]> {
    const integrations = await prisma.integration.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return integrations.map(this.formatIntegration);
  }

  async getBySlug(slug: string): Promise<Integration> {
    const integration = await prisma.integration.findUnique({
      where: { slug },
    });

    if (!integration || !integration.isActive) {
      throw new AppError('INTEGRATION_NOT_FOUND', 'Integration not found', 404);
    }

    return this.formatIntegration(integration);
  }

  async getCategories(): Promise<string[]> {
    const integrations = await prisma.integration.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return integrations
      .map((i) => i.category)
      .filter(Boolean) as string[];
  }

  private formatIntegration(integration: any): Integration {
    return {
      id: integration.id,
      slug: integration.slug,
      name: integration.name,
      description: integration.description,
      icon: integration.icon,
      category: integration.category,
      authType: integration.authType as 'oauth2' | 'apikey' | 'webhook',
      triggers: integration.triggers as IntegrationTrigger[],
      actions: integration.actions as IntegrationAction[],
      isActive: integration.isActive,
    };
  }
}

export const integrationService = new IntegrationService();