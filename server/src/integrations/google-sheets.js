"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_js_1 = require("../config/env.js");
const base_js_1 = require("./base.js");
const REDIRECT_URI = `${env_js_1.env.APP_URL}/auth/google-sheets/callback`;
const googleSheetsAdapter = {
    ...(0, base_js_1.createOAuthAdapter)({
        clientId: env_js_1.env.GOOGLE_CLIENT_ID || '',
        clientSecret: env_js_1.env.GOOGLE_CLIENT_SECRET || '',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets.readonly',
            'https://www.googleapis.com/auth/spreadsheets',
        ],
        redirectUri: REDIRECT_URI,
    }),
    id: 'google-sheets',
    slug: 'google-sheets',
    name: 'Google Sheets',
    authType: 'oauth2',
    getTriggers() {
        return [
            {
                id: 'new-row',
                name: 'New Row',
                description: 'Triggers when a new row is added',
                configSchema: {
                    spreadsheet_id: { type: 'string', description: 'Spreadsheet ID', required: true },
                    sheet: { type: 'string', description: 'Sheet name', required: false },
                },
            },
            {
                id: 'new-spreadsheet',
                name: 'New Spreadsheet',
                description: 'Triggers when a new spreadsheet is created',
                configSchema: {},
            },
        ];
    },
    async pollTrigger(triggerId, credentials, lastRun) {
        // Implementation for polling triggers
        return [];
    },
    getActions() {
        return [
            {
                id: 'add-row',
                name: 'Add Row',
                description: 'Add a row to a spreadsheet',
                configSchema: {
                    spreadsheet_id: { type: 'string', description: 'Spreadsheet ID', required: true },
                    sheet: { type: 'string', description: 'Sheet name', required: false },
                    values: { type: 'array', description: 'Row values', required: true },
                },
            },
            {
                id: 'update-row',
                name: 'Update Row',
                description: 'Update a row in a spreadsheet',
                configSchema: {
                    spreadsheet_id: { type: 'string', description: 'Spreadsheet ID', required: true },
                    sheet: { type: 'string', description: 'Sheet name', required: false },
                    row: { type: 'number', description: 'Row number', required: true },
                    values: { type: 'array', description: 'Row values', required: true },
                },
            },
            {
                id: 'get-row',
                name: 'Get Row',
                description: 'Get a row from a spreadsheet',
                configSchema: {
                    spreadsheet_id: { type: 'string', description: 'Spreadsheet ID', required: true },
                    sheet: { type: 'string', description: 'Sheet name', required: false },
                    row: { type: 'number', description: 'Row number', required: true },
                },
            },
        ];
    },
    async executeAction(actionId, credentials, params) {
        if (actionId === 'add-row') {
            return this.addRow(credentials, params);
        }
        if (actionId === 'update-row') {
            return this.updateRow(credentials, params);
        }
        if (actionId === 'get-row') {
            return this.getRow(credentials, params);
        }
        return { success: false, error: 'Unknown action' };
    },
    async addRow(credentials, params) {
        const { spreadsheet_id, sheet, values } = params;
        // First get current row count
        const range = sheet ? `${sheet}!A:A` : 'Sheet1!A:A';
        const getResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${encodeURIComponent(range)}`, {
            headers: { Authorization: `Bearer ${credentials.accessToken}` },
        });
        if (!getResponse.ok) {
            return { success: false, error: 'Failed to read spreadsheet' };
        }
        const getData = await getResponse.json();
        const nextRow = (getData.values?.length || 0) + 1;
        // Append the new row
        const appendResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${sheet || 'Sheet1'}!A${nextRow}:Z${nextRow}?valueInputOption=USER_ENTERED`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: [values.map((v) => (0, base_js_1.transformData)(String(v), params))],
            }),
        });
        const data = await appendResponse.json();
        if (!appendResponse.ok) {
            return { success: false, error: data.error?.message || 'Failed to add row' };
        }
        return {
            success: true,
            output: {
                row: nextRow,
                spreadsheetId: spreadsheet_id,
                updatedRange: data.updatedRange,
            },
        };
    },
    async updateRow(credentials, params) {
        const { spreadsheet_id, sheet, row, values } = params;
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${sheet || 'Sheet1'}!A${row}:Z${row}?valueInputOption=USER_ENTERED`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: [values.map((v) => (0, base_js_1.transformData)(String(v), params))],
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { success: false, error: data.error?.message || 'Failed to update row' };
        }
        return {
            success: true,
            output: {
                row,
                spreadsheetId: spreadsheet_id,
                updatedRange: data.updatedRange,
            },
        };
    },
    async getRow(credentials, params) {
        const { spreadsheet_id, sheet, row } = params;
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${sheet || 'Sheet1'}!A${row}:Z${row}`, {
            headers: { Authorization: `Bearer ${credentials.accessToken}` },
        });
        const data = await response.json();
        if (!response.ok) {
            return { success: false, error: data.error?.message || 'Failed to get row' };
        }
        return {
            success: true,
            output: {
                row,
                values: data.values?.[0] || [],
            },
        };
    },
    async testConnection(credentials) {
        try {
            const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets?mine=true', {
                headers: { Authorization: `Bearer ${credentials.accessToken}` },
            });
            return response.ok;
        }
        catch {
            return false;
        }
    },
};
exports.default = googleSheetsAdapter;
//# sourceMappingURL=google-sheets.js.map