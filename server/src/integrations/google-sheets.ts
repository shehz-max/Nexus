import { env } from '../config/env.js';
import { IntegrationAdapter, createOAuthAdapter, transformData } from './base.js';
import { Credentials, TriggerEvent, ActionResult } from '../types/index.js';

const REDIRECT_URI = `${env.APP_URL}/auth/google-sheets/callback`;

const googleSheetsAdapter = {
  ...createOAuthAdapter({
    clientId: env.GOOGLE_CLIENT_ID || '',
    clientSecret: env.GOOGLE_CLIENT_SECRET || '',
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
  authType: 'oauth2' as const,

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

  async pollTrigger(triggerId: string, credentials: Credentials, lastRun?: Date): Promise<TriggerEvent[]> {
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

  async executeAction(actionId: string, credentials: Credentials, params: any): Promise<ActionResult> {
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

  async addRow(credentials: Credentials, params: any): Promise<ActionResult> {
    const { spreadsheet_id, sheet, values } = params;

    // First get current row count
    const range = sheet ? `${sheet}!A:A` : 'Sheet1!A:A';
    const getResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${encodeURIComponent(range)}`,
      {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      }
    );

    if (!getResponse.ok) {
      return { success: false, error: 'Failed to read spreadsheet' };
    }

    const getData = await getResponse.json();
    const nextRow = (getData.values?.length || 0) + 1;

    // Append the new row
    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${sheet || 'Sheet1'}!A${nextRow}:Z${nextRow}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [values.map((v: any) => transformData(String(v), params))],
        }),
      }
    );

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

  async updateRow(credentials: Credentials, params: any): Promise<ActionResult> {
    const { spreadsheet_id, sheet, row, values } = params;

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${sheet || 'Sheet1'}!A${row}:Z${row}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [values.map((v: any) => transformData(String(v), params))],
        }),
      }
    );

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

  async getRow(credentials: Credentials, params: any): Promise<ActionResult> {
    const { spreadsheet_id, sheet, row } = params;

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${sheet || 'Sheet1'}!A${row}:Z${row}`,
      {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      }
    );

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

  async testConnection(credentials: Credentials): Promise<boolean> {
    try {
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets?mine=true', {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

export default googleSheetsAdapter;