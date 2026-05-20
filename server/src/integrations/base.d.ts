import { Credentials, TriggerEvent, ActionResult } from '../types/index.js';
export interface IntegrationAdapter {
    id: string;
    slug: string;
    name: string;
    authType: 'oauth2' | 'apikey' | 'webhook';
    getOAuthUrl(state?: string): string;
    handleCallback(code: string, state?: string): Promise<Credentials>;
    refreshCredentials(credentials: Credentials): Promise<Credentials>;
    getTriggers(): Array<{
        id: string;
        name: string;
        description: string;
        configSchema: Record<string, any>;
    }>;
    pollTrigger(triggerId: string, credentials: Credentials, lastRun?: Date): Promise<TriggerEvent[]>;
    getActions(): Array<{
        id: string;
        name: string;
        description: string;
        configSchema: Record<string, any>;
    }>;
    executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult>;
    testConnection(credentials: Credentials): Promise<boolean>;
}
export declare function createOAuthAdapter(config: {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
    redirectUri: string;
}): Pick<IntegrationAdapter, 'getOAuthUrl' | 'handleCallback' | 'refreshCredentials'>;
export declare function createApiKeyAdapter(): {
    handleCallback(_code: string, _state?: string): Promise<Credentials>;
    refreshCredentials(credentials: Credentials): Promise<Credentials>;
};
export declare function transformData(template: string, data: any): string;
//# sourceMappingURL=base.d.ts.map