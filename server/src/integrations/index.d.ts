import googleAdapter from './google.js';
import slackAdapter from './slack.js';
import notionAdapter from './notion.js';
import googleSheetsAdapter from './google-sheets.js';
import hubspotAdapter from './hubspot.js';
export declare const integrationAdapters: {
    gmail: {
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
        pollTrigger(triggerId: string, credentials: import("../types/index.js").Credentials, lastRun?: Date): Promise<import("../types/index.js").TriggerEvent[]>;
        pollNewEmails(credentials: import("../types/index.js").Credentials, lastRun?: Date): Promise<import("../types/index.js").TriggerEvent[]>;
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
        executeAction(actionId: string, credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        sendEmail(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        replyToEmail(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        testConnection(credentials: import("../types/index.js").Credentials): Promise<boolean>;
        getOAuthUrl: (state?: string) => string;
        handleCallback: (code: string, state?: string) => Promise<import("../types/index.js").Credentials>;
        refreshCredentials: (credentials: import("../types/index.js").Credentials) => Promise<import("../types/index.js").Credentials>;
    };
    'google-sheets': {
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
        pollTrigger(triggerId: string, credentials: import("../types/index.js").Credentials, lastRun?: Date): Promise<import("../types/index.js").TriggerEvent[]>;
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
        executeAction(actionId: string, credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        addRow(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        updateRow(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        getRow(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        testConnection(credentials: import("../types/index.js").Credentials): Promise<boolean>;
        getOAuthUrl: (state?: string) => string;
        handleCallback: (code: string, state?: string) => Promise<import("../types/index.js").Credentials>;
        refreshCredentials: (credentials: import("../types/index.js").Credentials) => Promise<import("../types/index.js").Credentials>;
    };
    slack: {
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
        pollTrigger(triggerId: string, _credentials: import("../types/index.js").Credentials, _lastRun?: Date): Promise<any[]>;
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
        executeAction(actionId: string, credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        sendMessage(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        createChannel(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        testConnection(credentials: import("../types/index.js").Credentials): Promise<boolean>;
        getOAuthUrl: (state?: string) => string;
        handleCallback: (code: string, state?: string) => Promise<import("../types/index.js").Credentials>;
        refreshCredentials: (credentials: import("../types/index.js").Credentials) => Promise<import("../types/index.js").Credentials>;
    };
    notion: {
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
        pollTrigger(triggerId: string, credentials: import("../types/index.js").Credentials, lastRun?: Date): Promise<any[]>;
        pollNewPages(credentials: import("../types/index.js").Credentials, lastRun?: Date): Promise<any[]>;
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
        executeAction(actionId: string, credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        createPage(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        updatePage(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        testConnection(credentials: import("../types/index.js").Credentials): Promise<boolean>;
        getOAuthUrl: (state?: string) => string;
        handleCallback: (code: string, state?: string) => Promise<import("../types/index.js").Credentials>;
        refreshCredentials: (credentials: import("../types/index.js").Credentials) => Promise<import("../types/index.js").Credentials>;
    };
    hubspot: {
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
        pollTrigger(triggerId: string, _credentials: import("../types/index.js").Credentials, _lastRun?: Date): Promise<import("../types/index.js").TriggerEvent[]>;
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
        executeAction(actionId: string, credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        createContact(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        updateContact(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        sendEmail(credentials: import("../types/index.js").Credentials, params: any): Promise<import("../types/index.js").ActionResult>;
        testConnection(credentials: import("../types/index.js").Credentials): Promise<boolean>;
        getOAuthUrl: (state?: string) => string;
        handleCallback: (code: string, state?: string) => Promise<import("../types/index.js").Credentials>;
        refreshCredentials: (credentials: import("../types/index.js").Credentials) => Promise<import("../types/index.js").Credentials>;
    };
};
export { googleAdapter, slackAdapter, notionAdapter, googleSheetsAdapter, hubspotAdapter, };
//# sourceMappingURL=index.d.ts.map