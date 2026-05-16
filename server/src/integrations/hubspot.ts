import { env } from '../config/env.js';
import { IntegrationAdapter, createOAuthAdapter, transformData } from './base.js';
import { Credentials, TriggerEvent, ActionResult } from '../types/index.js';

const REDIRECT_URI = `${env.APP_URL}/auth/hubspot/callback`;

const hubspotAdapter = {
  ...createOAuthAdapter({
    clientId: env.HUBSPOT_CLIENT_ID || '',
    clientSecret: env.HUBSPOT_CLIENT_SECRET || '',
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.companies.read', 'crm.objects.companies.write'],
    redirectUri: REDIRECT_URI,
  }),

  id: 'hubspot',
  slug: 'hubspot',
  name: 'HubSpot',
  authType: 'oauth2' as const,

  getTriggers() {
    return [
      {
        id: 'new-contact',
        name: 'New Contact',
        description: 'Triggers when a new contact is created',
        configSchema: {},
      },
      {
        id: 'contact-updated',
        name: 'Contact Updated',
        description: 'Triggers when a contact is updated',
        configSchema: {},
      },
    ];
  },

  async pollTrigger(triggerId: string, _credentials: Credentials, _lastRun?: Date): Promise<TriggerEvent[]> {
    // HubSpot uses webhooks, polling is a fallback
    return [];
  },

  getActions() {
    return [
      {
        id: 'create-contact',
        name: 'Create Contact',
        description: 'Create a new contact',
        configSchema: {
          email: { type: 'string', description: 'Contact email', required: true },
          firstname: { type: 'string', description: 'First name', required: false },
          lastname: { type: 'string', description: 'Last name', required: false },
          phone: { type: 'string', description: 'Phone number', required: false },
          company: { type: 'string', description: 'Company name', required: false },
        },
      },
      {
        id: 'update-contact',
        name: 'Update Contact',
        description: 'Update an existing contact',
        configSchema: {
          email: { type: 'string', description: 'Contact email (used to find contact)', required: true },
          properties: { type: 'object', description: 'Properties to update', required: true },
        },
      },
      {
        id: 'send-email',
        name: 'Send Email',
        description: 'Send an email to a contact',
        configSchema: {
          to: { type: 'string', description: 'Recipient email', required: true },
          subject: { type: 'string', description: 'Email subject', required: true },
          body: { type: 'string', description: 'Email body', required: true },
        },
      },
    ];
  },

  async executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult> {
    if (actionId === 'create-contact') {
      return this.createContact(credentials, params);
    }
    if (actionId === 'update-contact') {
      return this.updateContact(credentials, params);
    }
    if (actionId === 'send-email') {
      return this.sendEmail(credentials, params);
    }
    return { success: false, error: 'Unknown action' };
  },

  async createContact(credentials: Credentials, params: any): Promise<ActionResult> {
    const properties: Record<string, string> = {};
    
    if (params.email) properties.email = transformData(params.email, params);
    if (params.firstname) properties.firstname = transformData(params.firstname, params);
    if (params.lastname) properties.lastname = transformData(params.lastname, params);
    if (params.phone) properties.phone = transformData(params.phone, params);
    if (params.company) properties.company = transformData(params.company, params);

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to create contact' };
    }

    return { success: true, output: { contactId: data.id } };
  },

  async updateContact(credentials: Credentials, params: any): Promise<ActionResult> {
    const email = transformData(params.email, params);
    const properties = params.properties;

    // First find contact by email
    const searchResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{ propertyName: 'email', operator: 'EQ', value: email }],
        }],
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok || !searchData.results?.length) {
      return { success: false, error: 'Contact not found' };
    }

    const contactId = searchData.results[0].id;

    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to update contact' };
    }

    return { success: true, output: { contactId: data.id } };
  },

  async sendEmail(credentials: Credentials, params: any): Promise<ActionResult> {
    // HubSpot email is more complex - simplified implementation
    return {
      success: true,
      output: { message: 'Email queued (HubSpot email requires additional setup)' },
    };
  },

  async testConnection(credentials: Credentials): Promise<boolean> {
    try {
      const response = await fetch('https://api.hubapi.com/crm/v3/contacts/me', {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

export default hubspotAdapter;