"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_LIMITS = void 0;
exports.PLAN_LIMITS = {
    free: {
        maxWorkflows: 1,
        maxRuns: 100,
        maxConnections: 2,
        pollingInterval: 900, // 15 minutes
    },
    starter: {
        maxWorkflows: 5,
        maxRuns: 1000,
        maxConnections: 10,
        pollingInterval: 300, // 5 minutes
    },
    pro: {
        maxWorkflows: -1, // unlimited
        maxRuns: -1,
        maxConnections: -1,
        pollingInterval: 60, // 1 minute
    },
};
//# sourceMappingURL=index.js.map