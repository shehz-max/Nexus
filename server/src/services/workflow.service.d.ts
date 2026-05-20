import { Workflow, WorkflowTriggerConfig, WorkflowFilter, WorkflowActionConfig, WorkflowScheduleConfig } from '../types/index.js';
export declare class WorkflowService {
    list(userId: string): Promise<Workflow[]>;
    get(userId: string, workflowId: string): Promise<Workflow>;
    create(userId: string, data: {
        name: string;
        description?: string;
        trigger: WorkflowTriggerConfig;
        filters?: WorkflowFilter;
        actions: WorkflowActionConfig[];
        schedule?: WorkflowScheduleConfig;
    }): Promise<Workflow>;
    update(userId: string, workflowId: string, data: Partial<{
        name: string;
        description: string;
        trigger: WorkflowTriggerConfig;
        filters: WorkflowFilter;
        actions: WorkflowActionConfig[];
        schedule: WorkflowScheduleConfig;
    }>): Promise<Workflow>;
    delete(userId: string, workflowId: string): Promise<void>;
    enable(userId: string, workflowId: string): Promise<Workflow>;
    disable(userId: string, workflowId: string): Promise<Workflow>;
    duplicate(userId: string, workflowId: string): Promise<Workflow>;
    getRuns(userId: string, workflowId: string, page?: number, limit?: number): Promise<{
        items: {
            id: any;
            workflowId: any;
            status: any;
            triggerData: any;
            steps: any;
            errorMessage: any;
            errorStack: any;
            startedAt: any;
            completedAt: any;
            durationMs: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    private formatWorkflow;
    private formatRun;
    private logAudit;
}
export declare const workflowService: WorkflowService;
//# sourceMappingURL=workflow.service.d.ts.map