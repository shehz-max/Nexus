import { Credentials, ActionResult } from '../types/index.js';
declare const slackAdapter: {
    id: string;
    slug: string;
    name: string;
    authType: "oauth2";
    getTriggers(): {
        id: string;
        name: string;
        description: string;
        configSchema: {
            channel: {
                type: string;
                description: string;
                required: boolean;
            };
        };
    }[];
    pollTrigger(triggerId: string, _credentials: Credentials, _lastRun?: Date): Promise<any[]>;
    getActions(): ({
        id: string;
        name: string;
        description: string;
        configSchema: {
            channel: {
                type: string;
                description: string;
                required: boolean;
            };
            text: {
                type: string;
                description: string;
                required: boolean;
            };
            username: {
                type: string;
                description: string;
                required: boolean;
            };
            icon_emoji: {
                type: string;
                description: string;
                required: boolean;
            };
            name?: undefined;
            is_private?: undefined;
        };
    } | {
        id: string;
        name: string;
        description: string;
        configSchema: {
            name: {
                type: string;
                description: string;
                required: boolean;
            };
            is_private: {
                type: string;
                description: string;
                required: boolean;
            };
            channel?: undefined;
            text?: undefined;
            username?: undefined;
            icon_emoji?: undefined;
        };
    })[];
    executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult>;
    sendMessage(credentials: Credentials, params: any): Promise<ActionResult>;
    createChannel(credentials: Credentials, params: any): Promise<ActionResult>;
    testConnection(credentials: Credentials): Promise<boolean>;
    getOAuthUrl: (state?: string) => string;
    handleCallback: (code: string, state?: string) => Promise<Credentials>;
    refreshCredentials: (credentials: Credentials) => Promise<Credentials>;
};
export default slackAdapter;
//# sourceMappingURL=slack.d.ts.map