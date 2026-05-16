// Simple seed script using ES modules
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding...');

  // Create integrations
  const integrations = [
    { slug: 'gmail', name: 'Gmail', icon: '📧', category: 'Communication' },
    { slug: 'google-sheets', name: 'Google Sheets', icon: '📊', category: 'Productivity' },
    { slug: 'slack', name: 'Slack', icon: '💬', category: 'Communication' },
    { slug: 'notion', name: 'Notion', icon: '📝', category: 'Productivity' },
    { slug: 'hubspot', name: 'HubSpot', icon: '🔷', category: 'CRM' },
  ];

  for (const int of integrations) {
    try {
      await prisma.integration.create({
        data: {
          slug: int.slug,
          name: int.name,
          icon: int.icon,
          category: int.category,
          authType: 'oauth2',
          triggers: '[]',
          actions: '[]',
        },
      });
      console.log(`✅ ${int.name}`);
    } catch (e) {
      console.log(`⚠️ ${int.name} already exists`);
    }
  }

  // Create demo user
  const password = await bcrypt.hash('demo1234', 10);
  try {
    await prisma.user.create({
      data: {
        email: 'demo@nexus.io',
        passwordHash: password,
        name: 'Demo User',
        plan: 'pro',
        maxWorkflows: -1,
        maxRuns: -1,
      },
    });
    console.log('✅ Demo user created');
  } catch (e) {
    console.log('⚠️ Demo user already exists');
  }

  console.log('✨ Done!');
  process.exit(0);
}

seed().catch(console.error).finally(() => prisma.$disconnect());