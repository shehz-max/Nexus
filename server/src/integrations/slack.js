"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_js_1 = require("../config/env.js");
const base_js_1 = require("./base.js");
const REDIRECT_URI = `${env_js_1.env.APP_URL}/auth/slack/callback`;
const slackAdapter = {
    ...(0, base_js_1.createOAuthAdapter)({
        clientId: env_js_1.env.SLACK_CLIENT_ID || '',
        clientSecret: env_js_1.env.SLACK_CLIENT_SECRET || '',
        authUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        scopes: [
            'chat:write',
            'channels:read',
            'groups:read',
            'im:read',
            'mpim:read',
        ],
        redirectUri: REDIRECT_URI,
    }),
    id: 'slack',
    slug: 'slack',
    name: 'Slack',
    authType: 'oauth2',
    getTriggers() {
        return [
            {
                id: 'new-message',
                name: 'New Message',
                description: 'Triggers when a new message is posted',
                configSchema: {
                    channel: { type: 'string', description: 'Channel ID or name', required: true },
                },
            },
        ];
    },
    async pollTrigger(triggerId, _credentials, _lastRun) {
        // Slack typically uses webhooks, but we can poll channels
        return [];
    },
    getActions() {
        return [
            {
                id: 'send-message',
                name: 'Send Message',
                description: 'Send a message to a channel or user',
                configSchema: {
                    channel: { type: 'string', description: 'Channel ID or name', required: true },
                    text: { type: 'string', description: 'Message text', required: true },
                    username: { type: 'string', description: 'Bot username', required: false },
                    icon_emoji: { type: 'string', description: 'Bot icon emoji', required: false },
                },
            },
            {
                id: 'create-channel',
                name: 'Create Channel',
                description: 'Create a new Slack channel',
                configSchema: {
                    name: { type: 'string', description: 'Channel name', required: true },
                    is_private: { type: 'boolean', description: 'Make private', required: false },
                },
            },
        ];
    },
    async executeAction(actionId, credentials, params) {
        if (actionId === 'send-message') {
            return this.sendMessage(credentials, params);
        }
        if (actionId === 'create-channel') {
            return this.createChannel(credentials, params);
        }
        return { success: false, error: 'Unknown action' };
    },
    async sendMessage(credentials, params) {
        const { channel, text, username, icon_emoji } = params;
        const response = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel: (0, base_js_1.transformData)(channel, params),
                text: (0, base_js_1.transformData)(text, params),
                username,
                icon_emoji,
            }),
        });
        const data = await response.json();
        if (!data.ok) {
            return { success: false, error: data.error || 'Failed to send message' };
        }
        return { success: true, output: { ts: data.ts, channel: data.channel } };
    },
    async createChannel(credentials, params) {
        const { name, is_private } = params;
        const response = await fetch('https://slack.com/api/conversations.create', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: (0, base_js_1.transformData)(name, params),
                is_private: is_private || false,
            }),
        });
        const data = await response.json();
        if (!data.ok) {
            return { success: false, error: data.error || 'Failed to create channel' };
        }
        return { success: true, output: { channelId: data.channel.id, name: data.channel.name } };
    },
    async testConnection(credentials) {
        try {
            const response = await fetch('https://slack.com/api/auth.test', {
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                },
            });
            const data = await response.json();
            return data.ok;
        }
        catch {
            return false;
        }
    },
};
exports.default = slackAdapter;
//# sourceMappingURL=slack.js.map