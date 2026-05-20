"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOAuthAdapter = createOAuthAdapter;
exports.createApiKeyAdapter = createApiKeyAdapter;
exports.transformData = transformData;
function createOAuthAdapter(config) {
    const { clientId, clientSecret, authUrl, tokenUrl, scopes, redirectUri } = config;
    return {
        getOAuthUrl(state) {
            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                response_type: 'code',
                scope: scopes.join(' '),
                state: state || '',
            });
            return `${authUrl}?${params.toString()}`;
        },
        async handleCallback(code, _state) {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: redirectUri,
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Token exchange failed: ${error}`);
            }
            const data = await response.json();
            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
                providerEmail: data.email,
            };
        },
        async refreshCredentials(credentials) {
            if (!credentials.refreshToken) {
                throw new Error('No refresh token available');
            }
            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    refresh_token: credentials.refreshToken,
                    grant_type: 'refresh_token',
                }),
            });
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            const data = await response.json();
            return {
                ...credentials,
                accessToken: data.access_token,
                refreshToken: data.refresh_token || credentials.refreshToken,
                expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : credentials.expiresAt,
            };
        },
    };
}
// Simple API key adapter base
function createApiKeyAdapter() {
    return {
        async handleCallback(_code, _state) {
            throw new Error('API key authentication not implemented');
        },
        async refreshCredentials(credentials) {
            return credentials;
        },
    };
}
// Helper to transform data using simple template syntax
function transformData(template, data) {
    // Simple {{field}} replacement
    return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const keys = path.trim().split('.');
        let value = data;
        for (const key of keys) {
            value = value?.[key];
        }
        return value !== undefined ? String(value) : '';
    });
}
//# sourceMappingURL=base.js.map