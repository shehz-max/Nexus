"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_js_1 = require("./config/env.js");
const database_js_1 = require("./config/database.js");
const error_js_1 = require("./middleware/error.js");
// Routes
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const integrations_js_1 = __importDefault(require("./routes/integrations.js"));
const connections_js_1 = __importDefault(require("./routes/connections.js"));
const workflows_js_1 = __importDefault(require("./routes/workflows.js"));
const runs_js_1 = __importDefault(require("./routes/runs.js"));
const users_js_1 = __importDefault(require("./routes/users.js"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Disable for development
}));
// CORS
app.use((0, cors_1.default)({
    origin: env_js_1.env.APP_URL,
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Logging
if (env_js_1.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/v1/auth', auth_js_1.default);
app.use('/api/v1/integrations', integrations_js_1.default);
app.use('/api/v1/connections', connections_js_1.default);
app.use('/api/v1/workflows', workflows_js_1.default);
app.use('/api/v1/runs', runs_js_1.default);
app.use('/api/v1/users', users_js_1.default);
// Webhook endpoint for integrations
app.post('/api/v1/webhooks/:integrationSlug', async (req, res) => {
    // Handle incoming webhooks from integrations
    console.log('Webhook received:', req.params.integrationSlug, req.body);
    // TODO: Verify webhook signature
    // TODO: Add to workflow execution queue
    res.json({ success: true });
});
// Error handling
app.use(error_js_1.notFoundHandler);
app.use(error_js_1.errorHandler);
// Start server
const PORT = parseInt(env_js_1.env.PORT) || 3000;
async function start() {
    try {
        await (0, database_js_1.connectDatabase)();
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Nexus API Server running on port ${PORT}             ║
║                                                       ║
║   Environment: ${env_js_1.env.NODE_ENV.padEnd(20)}                 ║
║   Database:    PostgreSQL                             ║
║   API:         http://localhost:${PORT}/api/v1           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await (0, database_js_1.disconnectDatabase)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down...');
    await (0, database_js_1.disconnectDatabase)();
    process.exit(0);
});
start();
exports.default = app;
//# sourceMappingURL=index.js.map