import { Credentials, TriggerEvent, ActionResult } from '../types/index.js';
declare const googleAdapter: {
    id: string;
    slug: string;
    name: string;
    authType: "oauth2";
    getTriggers(): {
        id: string;
        name: string;
        description: string;
        configSchema: {
            from: {
                type: string;
                description: string;
                required: boolean;
            };
            subject: {
                type: string;
                description: string;
                required: boolean;
            };
            label: {
                type: string;
                description: string;
                required: boolean;
            };
        };
    }[];
    pollTrigger(triggerId: string, credentials: Credentials, lastRun?: Date): Promise<TriggerEvent[]>;
    pollNewEmails(credentials: Credentials, lastRun?: Date): Promise<TriggerEvent[]>;
    extractHeader(headers: any[], name: string): string;
    getActions(): ({
        id: string;
        name: string;
        description: string;
        configSchema: {
            to: {
                type: string;
                description: string;
                required: boolean;
            };
            subject: {
                type: string;
                description: string;
                required: boolean;
            };
            body: {
                type: string;
                description: string;
                required: boolean;
            };
            cc: {
                type: string;
                description: string;
                required: boolean;
            };
            bcc: {
                type: string;
                description: string;
                required: boolean;
            };
            threadId?: undefined;
        };
    } | {
        id: string;
        name: string;
        description: string;
        configSchema: {
            threadId: {
                type: string;
                description: string;
                required: boolean;
            };
            body: {
                type: string;
                description: string;
                required: boolean;
            };
            to?: undefined;
            subject?: undefined;
            cc?: undefined;
            bcc?: undefined;
        };
    })[];
    executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult>;
    sendEmail(credentials: Credentials, params: any): Promise<ActionResult>;
    replyToEmail(credentials: Credentials, params: any): Promise<ActionResult>;
    testConnection(credentials: Credentials): Promise<boolean>;
    getOAuthUrl: (state?: string) => string;
    handleCallback: (code: string, state?: string) => Promise<Credentials>;
    refreshCredentials: (credentials: Credentials) => Promise<Credentials>;
};
export default googleAdapter;
//# sourceMappingURL=google.d.ts.map