import { NextResponse } from 'vercel';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      integrations: [
        {
          id: '1',
          slug: 'gmail',
          name: 'Gmail',
          icon: '📧',
          category: 'Communication',
          description: 'Send and receive emails, manage labels',
          authType: 'oauth2',
          triggers: [
            { id: 'new-email', name: 'New Email', description: 'Triggers when a new email arrives' },
            { id: 'new-starred', name: 'New Starred Email', description: 'Triggers when a starred email arrives' }
          ],
          actions: [
            { id: 'send-email', name: 'Send Email', description: 'Send an email to a recipient' },
            { id: 'add-label', name: 'Add Label', description: 'Add a label to an email' }
          ]
        },
        {
          id: '2',
          slug: 'google-sheets',
          name: 'Google Sheets',
          icon: '📊',
          category: 'Productivity',
          description: 'Read, write, and manage Google Sheets data',
          authType: 'oauth2',
          triggers: [
            { id: 'new-row', name: 'New Row', description: 'Triggers when a new row is added' },
            { id: 'new-column', name: 'New Column', description: 'Triggers when a new column is added' }
          ],
          actions: [
            { id: 'add-row', name: 'Add Row', description: 'Add a row to a spreadsheet' },
            { id: 'update-cell', name: 'Update Cell', description: 'Update a specific cell' }
          ]
        },
        {
          id: '3',
          slug: 'slack',
          name: 'Slack',
          icon: '💬',
          category: 'Communication',
          description: 'Send messages and manage channels',
          authType: 'oauth2',
          triggers: [
            { id: 'new-message', name: 'New Message', description: 'Triggers on new channel messages' }
          ],
          actions: [
            { id: 'send-message', name: 'Send Message', description: 'Send a message to a channel' },
            { id: 'create-channel', name: 'Create Channel', description: 'Create a new Slack channel' }
          ]
        },
        {
          id: '4',
          slug: 'notion',
          name: 'Notion',
          icon: '📝',
          category: 'Productivity',
          description: 'Create and manage Notion pages and databases',
          authType: 'oauth2',
          triggers: [
            { id: 'new-page', name: 'New Page', description: 'Triggers when a new page is created' },
            { id: 'database-updated', name: 'Database Updated', description: 'Triggers on database changes' }
          ],
          actions: [
            { id: 'create-page', name: 'Create Page', description: 'Create a new page' },
            { id: 'update-page', name: 'Update Page', description: 'Update an existing page' }
          ]
        },
        {
          id: '5',
          slug: 'hubspot',
          name: 'HubSpot',
          icon: '🔷',
          category: 'CRM',
          description: 'Manage CRM contacts, deals, and workflows',
          authType: 'oauth2',
          triggers: [
            { id: 'new-contact', name: 'New Contact', description: 'Triggers when a new contact is created' },
            { id: 'deal-stage-changed', name: 'Deal Stage Changed', description: 'Triggers when deal stage changes' }
          ],
          actions: [
            { id: 'create-contact', name: 'Create Contact', description: 'Create a new contact' },
            { id: 'create-deal', name: 'Create Deal', description: 'Create a new deal' }
          ]
        }
      ]
    }
  });
}