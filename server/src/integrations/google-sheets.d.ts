import { Credentials, TriggerEvent, ActionResult } from '../types/index.js';
declare const googleSheetsAdapter: {
    id: string;
    slug: string;
    name: string;
    authType: "oauth2";
    getTriggers(): ({
        id: string;
        name: string;
        description: string;
        configSchema: {
            spreadsheet_id: {
                type: string;
                description: string;
                required: boolean;
            };
            sheet: {
                type: string;
                description: string;
                required: boolean;
            };
        };
    } | {
        id: string;
        name: string;
        description: string;
        configSchema: {
            spreadsheet_id?: undefined;
            sheet?: undefined;
        };
    })[];
    pollTrigger(triggerId: string, credentials: Credentials, lastRun?: Date): Promise<TriggerEvent[]>;
    getActions(): ({
        id: string;
        name: string;
        description: string;
        configSchema: {
            spreadsheet_id: {
                type: string;
                description: string;
                required: boolean;
            };
            sheet: {
                type: string;
                description: string;
                required: boolean;
            };
            values: {
                type: string;
                description: string;
                required: boolean;
            };
            row?: undefined;
        };
    } | {
        id: string;
        name: string;
        description: string;
        configSchema: {
            spreadsheet_id: {
                type: string;
                description: string;
                required: boolean;
            };
            sheet: {
                type: string;
                description: string;
                required: boolean;
            };
            row: {
                type: string;
                description: string;
                required: boolean;
            };
            values: {
                type: string;
                description: string;
                required: boolean;
            };
        };
    } | {
        id: string;
        name: string;
        description: string;
        configSchema: {
            spreadsheet_id: {
                type: string;
                description: string;
                required: boolean;
            };
            sheet: {
                type: string;
                description: string;
                required: boolean;
            };
            row: {
                type: string;
                description: string;
                required: boolean;
            };
            values?: undefined;
        };
    })[];
    executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult>;
    addRow(credentials: Credentials, params: any): Promise<ActionResult>;
    updateRow(credentials: Credentials, params: any): Promise<ActionResult>;
    getRow(credentials: Credentials, params: any): Promise<ActionResult>;
    testConnection(credentials: Credentials): Promise<boolean>;
    getOAuthUrl: (state?: string) => string;
    handleCallback: (code: string, state?: string) => Promise<Credentials>;
    refreshCredentials: (credentials: Credentials) => Promise<Credentials>;
};
export default googleSheetsAdapter;
//# sourceMappingURL=google-sheets.d.ts.map