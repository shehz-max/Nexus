import { env } from '../config/env.js';
import { IntegrationAdapter, createOAuthAdapter, transformData } from './base.js';
import { Credentials, ActionResult } from '../types/index.js';

const REDIRECT_URI = `${env.APP_URL}/auth/notion/callback`;

const notionAdapter = {
  ...createOAuthAdapter({
    clientId: env.NOTION_CLIENT_ID || '',
    clientSecret: env.NOTION_CLIENT_SECRET || '',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scopes: ['read_user', 'insert_database_records', 'update_database_records'],
    redirectUri: REDIRECT_URI,
  }),

  id: 'notion',
  slug: 'notion',
  name: 'Notion',
  authType: 'oauth2' as const,

  getTriggers() {
    return [
      {
        id: 'new-page',
        name: 'New Page',
        description: 'Triggers when a new page is created',
        configSchema: {
          database_id: { type: 'string', description: 'Database ID', required: true },
        },
      },
    ];
  },

  async pollTrigger(triggerId: string, credentials: Credentials, lastRun?: Date): Promise<any[]> {
    if (triggerId === 'new-page') {
      return this.pollNewPages(credentials, lastRun);
    }
    return [];
  },

  async pollNewPages(credentials: Credentials, lastRun?: Date): Promise<any[]> {
    const databaseId = credentials.providerId; // Store database ID in providerId for simplicity
    
    const response = await fetch('https://api.notion.com/v1/databases/query', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        database_id: databaseId,
        filter: {
          timestamp: 'created_time',
          created_time: {
            after: lastRun?.toISOString(),
          },
        },
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
        page_size: 10,
      }),
    });

    if (!response.ok) {
      console.error('Notion API error:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.results.map((page: any) => ({
      id: page.id,
      timestamp: new Date(page.created_time),
      data: {
        id: page.id,
        title: this.extractTitle(page),
        url: page.url,
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
      },
    }));
  },

  extractTitle(page: any): string {
    const props = page.properties;
    for (const key of Object.keys(props)) {
      if (props[key].type === 'title' && props[key].title?.length) {
        return props[key].title.map((t: any) => t.plain_text).join('');
      }
    }
    return 'Untitled';
  },

  getActions() {
    return [
      {
        id: 'create-page',
        name: 'Create Page',
        description: 'Create a new page in a database',
        configSchema: {
          database_id: { type: 'string', description: 'Database ID', required: true },
          title: { type: 'string', description: 'Page title', required: true },
          properties: { type: 'object', description: 'Additional properties', required: false },
        },
      },
      {
        id: 'update-page',
        name: 'Update Page',
        description: 'Update an existing page',
        configSchema: {
          page_id: { type: 'string', description: 'Page ID to update', required: true },
          properties: { type: 'object', description: 'Properties to update', required: true },
        },
      },
    ];
  },

  async executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult> {
    if (actionId === 'create-page') {
      return this.createPage(credentials, params);
    }
    if (actionId === 'update-page') {
      return this.updatePage(credentials, params);
    }
    return { success: false, error: 'Unknown action' };
  },

  async createPage(credentials: Credentials, params: any): Promise<ActionResult> {
    const { database_id, title, properties = {} } = params;

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: transformData(database_id, params) },
        properties: {
          title: {
            title: [{ text: { content: transformData(title, params) } }],
          },
          ...properties,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to create page' };
    }

    return { success: true, output: { pageId: data.id, url: data.url } };
  },

  async updatePage(credentials: Credentials, params: any): Promise<ActionResult> {
    const { page_id, properties } = params;

    const response = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to update page' };
    }

    return { success: true, output: { pageId: data.id } };
  },

  async testConnection(credentials: Credentials): Promise<boolean> {
    try {
      const response = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          'Notion-Version': '2022-06-28',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

export default notionAdapter;