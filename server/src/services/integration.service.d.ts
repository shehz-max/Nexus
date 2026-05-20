import { Integration } from '../types/index.js';
export declare class IntegrationService {
    list(): Promise<Integration[]>;
    getBySlug(slug: string): Promise<Integration>;
    getCategories(): Promise<string[]>;
    private formatIntegration;
}
export declare const integrationService: IntegrationService;
//# sourceMappingURL=integration.service.d.ts.map