import { Credentials, TriggerEvent, ActionResult } from '../types/index.js';

export interface IntegrationAdapter {
  id: string;
  slug: string;
  name: string;
  authType: 'oauth2' | 'apikey' | 'webhook';

  // OAuth methods
  getOAuthUrl(state?: string): string;
  handleCallback(code: string, state?: string): Promise<Credentials>;
  refreshCredentials(credentials: Credentials): Promise<Credentials>;

  // Trigger methods
  getTriggers(): Array<{ id: string; name: string; description: string; configSchema: Record<string, any> }>;
  pollTrigger(triggerId: string, credentials: Credentials, lastRun?: Date): Promise<TriggerEvent[]>;

  // Action methods
  getActions(): Array<{ id: string; name: string; description: string; configSchema: Record<string, any> }>;
  executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult>;

  // Test
  testConnection(credentials: Credentials): Promise<boolean>;
}

export function createOAuthAdapter(config: {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
}): Pick<IntegrationAdapter, 'getOAuthUrl' | 'handleCallback' | 'refreshCredentials'> {
  const { clientId, clientSecret, authUrl, tokenUrl, scopes, redirectUri } = config;

  return {
    getOAuthUrl(state?: string): string {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes.join(' '),
        state: state || '',
      });
      return `${authUrl}?${params.toString()}`;
    },

    async handleCallback(code: string, _state?: string): Promise<Credentials> {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${error}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
        providerEmail: data.email,
      };
    },

    async refreshCredentials(credentials: Credentials): Promise<Credentials> {
      if (!credentials.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: credentials.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      return {
        ...credentials,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || credentials.refreshToken,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : credentials.expiresAt,
      };
    },
  };
}

// Simple API key adapter base
export function createApiKeyAdapter() {
  return {
    async handleCallback(_code: string, _state?: string): Promise<Credentials> {
      throw new Error('API key authentication not implemented');
    },
    async refreshCredentials(credentials: Credentials): Promise<Credentials> {
      return credentials;
    },
  };
}

// Helper to transform data using simple template syntax
export function transformData(template: string, data: any): string {
  // Simple {{field}} replacement
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const keys = path.trim().split('.');
    let value: any = data;
    for (const key of keys) {
      value = value?.[key];
    }
    return value !== undefined ? String(value) : '';
  });
}