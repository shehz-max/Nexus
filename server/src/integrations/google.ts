import { env } from '../config/env.js';
import { IntegrationAdapter, createOAuthAdapter, transformData } from './base.js';
import { Credentials, TriggerEvent, ActionResult } from '../types/index.js';

const REDIRECT_URI = `${env.APP_URL}/auth/google/callback`;

const googleAdapter = {
  ...createOAuthAdapter({
    clientId: env.GOOGLE_CLIENT_ID || '',
    clientSecret: env.GOOGLE_CLIENT_SECRET || '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
    redirectUri: REDIRECT_URI,
  }),

  id: 'google',
  slug: 'gmail',
  name: 'Gmail',
  authType: 'oauth2' as const,

  getTriggers() {
    return [
      {
        id: 'new-email',
        name: 'New Email',
        description: 'Triggers when a new email is received',
        configSchema: {
          from: { type: 'string', description: 'Filter by sender', required: false },
          subject: { type: 'string', description: 'Filter by subject', required: false },
          label: { type: 'string', description: 'Filter by label', required: false },
        },
      },
    ];
  },

  async pollTrigger(triggerId: string, credentials: Credentials, lastRun?: Date): Promise<TriggerEvent[]> {
    if (triggerId === 'new-email') {
      return this.pollNewEmails(credentials, lastRun);
    }
    return [];
  },

  async pollNewEmails(credentials: Credentials, lastRun?: Date): Promise<TriggerEvent[]> {
    // Get last history ID for incremental sync
    const query = `from:${lastRun ? new Date(lastRun.getTime() - 60000).toISOString() : '1d'}`;
    
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=' + encodeURIComponent(query),
      {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Gmail API error:', await response.text());
      return [];
    }

    const data = await response.json();
    const messages = data.messages || [];

    const events: TriggerEvent[] = [];
    for (const msg of messages.slice(0, 10)) {
      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );

      if (msgResponse.ok) {
        const msgData = await msgResponse.json();
        events.push({
          id: msg.id,
          timestamp: new Date(parseInt(msgData.internalDate)),
          data: {
            id: msg.id,
            from: this.extractHeader(msgData.payload?.headers, 'from'),
            to: this.extractHeader(msgData.payload?.headers, 'to'),
            subject: this.extractHeader(msgData.payload?.headers, 'subject'),
            body: msgData.snippet,
            threadId: msgData.threadId,
          },
        });
      }
    }

    return events;
  },

  extractHeader(headers: any[], name: string): string {
    const header = headers?.find((h) => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  },

  getActions() {
    return [
      {
        id: 'send-email',
        name: 'Send Email',
        description: 'Send an email',
        configSchema: {
          to: { type: 'string', description: 'Recipient email', required: true },
          subject: { type: 'string', description: 'Email subject', required: true },
          body: { type: 'string', description: 'Email body', required: true },
          cc: { type: 'string', description: 'CC recipients', required: false },
          bcc: { type: 'string', description: 'BCC recipients', required: false },
        },
      },
      {
        id: 'reply-to-email',
        name: 'Reply to Email',
        description: 'Reply to a thread',
        configSchema: {
          threadId: { type: 'string', description: 'Thread ID to reply to', required: true },
          body: { type: 'string', description: 'Reply body', required: true },
        },
      },
    ];
  },

  async executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult> {
    if (actionId === 'send-email') {
      return this.sendEmail(credentials, params);
    }
    if (actionId === 'reply-to-email') {
      return this.replyToEmail(credentials, params);
    }
    return { success: false, error: 'Unknown action' };
  },

  async sendEmail(credentials: Credentials, params: any): Promise<ActionResult> {
    const { to, subject, body, cc, bcc } = params;

    // Create email MIME
    const mime = [
      `To: ${to}`,
      `Subject: ${transformData(subject, params)}`,
      cc ? `Cc: ${cc}` : '',
      bcc ? `Bcc: ${bcc}` : '',
      '',
      transformData(body, params),
    ].filter(Boolean).join('\r\n');

    const encoded = Buffer.from(mime).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to send email: ${error}` };
    }

    const data = await response.json();
    return { success: true, output: { messageId: data.id } };
  },

  async replyToEmail(credentials: Credentials, params: any): Promise<ActionResult> {
    const { threadId, body } = params;

    const mime = [
      `To: `,
      `Subject: Re: ${threadId}`,
      'In-Reply-To: ' + threadId,
      'References: ' + threadId,
      '',
      transformData(body, params),
    ].join('\r\n');

    const encoded = Buffer.from(mime).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded, threadId }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to reply: ${error}` };
    }

    const data = await response.json();
    return { success: true, output: { messageId: data.id } };
  },

  async testConnection(credentials: Credentials): Promise<boolean> {
    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

export default googleAdapter;