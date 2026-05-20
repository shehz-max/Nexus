import { Credentials, ActionResult } from '../types/index.js';
declare const notionAdapter: {
    id: string;
    slug: string;
    name: string;
    authType: "oauth2";
    getTriggers(): {
        id: string;
        name: string;
        description: string;
        configSchema: {
            database_id: {
                type: string;
                description: string;
                required: boolean;
            };
        };
    }[];
    pollTrigger(triggerId: string, credentials: Credentials, lastRun?: Date): Promise<any[]>;
    pollNewPages(credentials: Credentials, lastRun?: Date): Promise<any[]>;
    extractTitle(page: any): string;
    getActions(): ({
        id: string;
        name: string;
        description: string;
        configSchema: {
            database_id: {
                type: string;
                description: string;
                required: boolean;
            };
            title: {
                type: string;
                description: string;
                required: boolean;
            };
            properties: {
                type: string;
                description: string;
                required: boolean;
            };
            page_id?: undefined;
        };
    } | {
        id: string;
        name: string;
        description: string;
        configSchema: {
            page_id: {
                type: string;
                description: string;
                required: boolean;
            };
            properties: {
                type: string;
                description: string;
                required: boolean;
            };
            database_id?: undefined;
            title?: undefined;
        };
    })[];
    executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult>;
    createPage(credentials: Credentials, params: any): Promise<ActionResult>;
    updatePage(credentials: Credentials, params: any): Promise<ActionResult>;
    testConnection(credentials: Credentials): Promise<boolean>;
    getOAuthUrl: (state?: string) => string;
    handleCallback: (code: string, state?: string) => Promise<Credentials>;
    refreshCredentials: (credentials: Credentials) => Promise<Credentials>;
};
export default notionAdapter;
//# sourceMappingURL=notion.d.ts.map