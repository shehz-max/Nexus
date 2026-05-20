import { Credentials, TriggerEvent, ActionResult } from '../types/index.js';
declare const hubspotAdapter: {
    id: string;
    slug: string;
    name: string;
    authType: "oauth2";
    getTriggers(): {
        id: string;
        name: string;
        description: string;
        configSchema: {};
    }[];
    pollTrigger(triggerId: string, _credentials: Credentials, _lastRun?: Date): Promise<TriggerEvent[]>;
    getActions(): ({
        id: string;
        name: string;
        description: string;
        configSchema: {
            email: {
                type: string;
                description: string;
                required: boolean;
            };
            firstname: {
                type: string;
                description: string;
                required: boolean;
            };
            lastname: {
                type: string;
                description: string;
                required: boolean;
            };
            phone: {
                type: string;
                description: string;
                required: boolean;
            };
            company: {
                type: string;
                description: string;
                required: boolean;
            };
            properties?: undefined;
            to?: undefined;
            subject?: undefined;
            body?: undefined;
        };
    } | {
        id: string;
        name: string;
        description: string;
        configSchema: {
            email: {
                type: string;
                description: string;
                required: boolean;
            };
            properties: {
                type: string;
                description: string;
                required: boolean;
            };
            firstname?: undefined;
            lastname?: undefined;
            phone?: undefined;
            company?: undefined;
            to?: undefined;
            subject?: undefined;
            body?: undefined;
        };
    } | {
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
            email?: undefined;
            firstname?: undefined;
            lastname?: undefined;
            phone?: undefined;
            company?: undefined;
            properties?: undefined;
        };
    })[];
    executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult>;
    createContact(credentials: Credentials, params: any): Promise<ActionResult>;
    updateContact(credentials: Credentials, params: any): Promise<ActionResult>;
    sendEmail(credentials: Credentials, params: any): Promise<ActionResult>;
    testConnection(credentials: Credentials): Promise<boolean>;
    getOAuthUrl: (state?: string) => string;
    handleCallback: (code: string, state?: string) => Promise<Credentials>;
    refreshCredentials: (credentials: Credentials) => Promise<Credentials>;
};
export default hubspotAdapter;
//# sourceMappingURL=hubspot.d.ts.map