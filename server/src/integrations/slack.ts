import { env } from '../config/env.js';
import { IntegrationAdapter, createOAuthAdapter, transformData } from './base.js';
import { Credentials, ActionResult } from '../types/index.js';

const REDIRECT_URI = `${env.APP_URL}/auth/slack/callback`;

const slackAdapter = {
  ...createOAuthAdapter({
    clientId: env.SLACK_CLIENT_ID || '',
    clientSecret: env.SLACK_CLIENT_SECRET || '',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: [
      'chat:write',
      'channels:read',
      'groups:read',
      'im:read',
      'mpim:read',
    ],
    redirectUri: REDIRECT_URI,
  }),

  id: 'slack',
  slug: 'slack',
  name: 'Slack',
  authType: 'oauth2' as const,

  getTriggers() {
    return [
      {
        id: 'new-message',
        name: 'New Message',
        description: 'Triggers when a new message is posted',
        configSchema: {
          channel: { type: 'string', description: 'Channel ID or name', required: true },
        },
      },
    ];
  },

  async pollTrigger(triggerId: string, _credentials: Credentials, _lastRun?: Date): Promise<any[]> {
    // Slack typically uses webhooks, but we can poll channels
    return [];
  },

  getActions() {
    return [
      {
        id: 'send-message',
        name: 'Send Message',
        description: 'Send a message to a channel or user',
        configSchema: {
          channel: { type: 'string', description: 'Channel ID or name', required: true },
          text: { type: 'string', description: 'Message text', required: true },
          username: { type: 'string', description: 'Bot username', required: false },
          icon_emoji: { type: 'string', description: 'Bot icon emoji', required: false },
        },
      },
      {
        id: 'create-channel',
        name: 'Create Channel',
        description: 'Create a new Slack channel',
        configSchema: {
          name: { type: 'string', description: 'Channel name', required: true },
          is_private: { type: 'boolean', description: 'Make private', required: false },
        },
      },
    ];
  },

  async executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult> {
    if (actionId === 'send-message') {
      return this.sendMessage(credentials, params);
    }
    if (actionId === 'create-channel') {
      return this.createChannel(credentials, params);
    }
    return { success: false, error: 'Unknown action' };
  },

  async sendMessage(credentials: Credentials, params: any): Promise<ActionResult> {
    const { channel, text, username, icon_emoji } = params;

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: transformData(channel, params),
        text: transformData(text, params),
        username,
        icon_emoji,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return { success: false, error: data.error || 'Failed to send message' };
    }

    return { success: true, output: { ts: data.ts, channel: data.channel } };
  },

  async createChannel(credentials: Credentials, params: any): Promise<ActionResult> {
    const { name, is_private } = params;

    const response = await fetch('https://slack.com/api/conversations.create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: transformData(name, params),
        is_private: is_private || false,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return { success: false, error: data.error || 'Failed to create channel' };
    }

    return { success: true, output: { channelId: data.channel.id, name: data.channel.name } };
  },

  async testConnection(credentials: Credentials): Promise<boolean> {
    try {
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });
      const data = await response.json();
      return data.ok;
    } catch {
      return false;
    }
  },
};

export default slackAdapter;