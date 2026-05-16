import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    const integrations = await prisma.integration.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const formattedIntegrations = integrations.map(i => ({
      id: i.id,
      slug: i.slug,
      name: i.name,
      description: i.description,
      icon: i.icon,
      category: i.category,
      authType: i.authType,
      triggers: typeof i.triggers === 'string' ? JSON.parse(i.triggers) : i.triggers,
      actions: typeof i.actions === 'string' ? JSON.parse(i.actions) : i.actions,
    }));

    return res.status(200).json({
      success: true,
      data: { integrations: formattedIntegrations },
    });
  } catch (error) {
    console.error('Integrations error:', error);
    return res.status(500).json({
      success: false,
      error: { statusCode: 500, message: 'Internal server error' }
    });
  }
}