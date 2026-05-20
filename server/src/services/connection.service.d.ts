import { Connection } from '../types/index.js';
export declare class ConnectionService {
    list(userId: string): Promise<Connection[]>;
    get(userId: string, connectionId: string): Promise<Connection>;
    create(userId: string, integrationSlug: string, code: string, state?: string): Promise<Connection & {
        oauthUrl?: string;
    }>;
    delete(userId: string, connectionId: string): Promise<void>;
    test(userId: string, connectionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    refreshTokens(userId: string, connectionId: string): Promise<Connection>;
    getOAuthUrl(integrationSlug: string, state?: string): Promise<string>;
    private formatConnection;
    private logAudit;
}
export declare const connectionService: ConnectionService;
//# sourceMappingURL=connection.service.d.ts.map