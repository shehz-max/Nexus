import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create integrations
  const integrations = [
    {
      slug: 'gmail',
      name: 'Gmail',
      description: 'Google\'s email service for personal and business communication',
      icon: '📧',
      category: 'Communication',
      authType: 'oauth2',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
      triggers: JSON.stringify([
        { id: 'new-email', name: 'New Email', description: 'Triggers when a new email is received', configSchema: {} },
      ]),
      actions: JSON.stringify([
        { id: 'send-email', name: 'Send Email', description: 'Send an email', configSchema: {} },
      ]),
    },
    {
      slug: 'google-sheets',
      name: 'Google Sheets',
      description: 'Online spreadsheet application for data management',
      icon: '📊',
      category: 'Productivity',
      authType: 'oauth2',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/spreadsheets'],
      triggers: JSON.stringify([
        { id: 'new-row', name: 'New Row', description: 'Triggers when a new row is added', configSchema: {} },
      ]),
      actions: JSON.stringify([
        { id: 'add-row', name: 'Add Row', description: 'Add a row to a spreadsheet', configSchema: {} },
      ]),
    },
    {
      slug: 'slack',
      name: 'Slack',
      description: 'Business communication platform for teams',
      icon: '💬',
      category: 'Communication',
      authType: 'oauth2',
      authUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      scopes: ['chat:write', 'channels:read'],
      triggers: JSON.stringify([
        { id: 'new-message', name: 'New Message', description: 'Triggers when a new message is posted', configSchema: {} },
      ]),
      actions: JSON.stringify([
        { id: 'send-message', name: 'Send Message', description: 'Send a message to a channel', configSchema: {} },
      ]),
    },
    {
      slug: 'notion',
      name: 'Notion',
      description: 'All-in-one workspace for notes, tasks, and databases',
      icon: '📝',
      category: 'Productivity',
      authType: 'oauth2',
      authUrl: 'https://api.notion.com/v1/oauth/authorize',
      tokenUrl: 'https://api.notion.com/v1/oauth/token',
      scopes: ['read_user', 'insert_database_records'],
      triggers: JSON.stringify([
        { id: 'new-page', name: 'New Page', description: 'Triggers when a new page is created', configSchema: {} },
      ]),
      actions: JSON.stringify([
        { id: 'create-page', name: 'Create Page', description: 'Create a new page', configSchema: {} },
      ]),
    },
    {
      slug: 'hubspot',
      name: 'HubSpot',
      description: 'CRM platform for marketing, sales, and customer service',
      icon: '🔷',
      category: 'CRM',
      authType: 'oauth2',
      authUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write'],
      triggers: JSON.stringify([
        { id: 'new-contact', name: 'New Contact', description: 'Triggers when a new contact is created', configSchema: {} },
      ]),
      actions: JSON.stringify([
        { id: 'create-contact', name: 'Create Contact', description: 'Create a new contact', configSchema: {} },
      ]),
    },
  ];

  for (const integration of integrations) {
    await prisma.integration.upsert({
      where: { slug: integration.slug },
      update: integration,
      create: integration,
    });
    console.log(`  ✅ ${integration.name}`);
  }

  // Create demo user
  const demoPassword = await bcrypt.hash('demo1234', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@nexus.io' },
    update: {},
    create: {
      email: 'demo@nexus.io',
      passwordHash: demoPassword,
      name: 'Demo User',
      plan: 'pro',
      maxWorkflows: -1,
      maxRuns: -1,
      preferences: {
        create: {
          theme: 'dark',
          timezone: 'Asia/Kolkata',
          notifications: JSON.stringify({ email: true, runs: true, errors: true }),
        },
      },
    },
  });
  console.log(`  ✅ Demo user: demo@nexus.io / demo1234`);

  console.log('\n✨ Seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });