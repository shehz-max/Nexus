import { AuthTokens, User } from '../types/index.js';
export declare class AuthService {
    register(email: string, password: string, name?: string): Promise<AuthTokens & {
        user: User;
    }>;
    login(email: string, password: string): Promise<AuthTokens & {
        user: User;
    }>;
    refresh(refreshToken: string): Promise<AuthTokens>;
    logout(refreshToken: string): Promise<void>;
    getUser(userId: string): Promise<User>;
    updateUser(userId: string, data: {
        name?: string;
        avatarUrl?: string;
    }): Promise<User>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    private generateTokens;
    private logAudit;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map