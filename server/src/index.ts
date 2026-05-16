import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

// Routes
import authRoutes from './routes/auth.js';
import integrationsRoutes from './routes/integrations.js';
import connectionsRoutes from './routes/connections.js';
import workflowsRoutes from './routes/workflows.js';
import runsRoutes from './routes/runs.js';
import usersRoutes from './routes/users.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// CORS
app.use(cors({
  origin: env.APP_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/integrations', integrationsRoutes);
app.use('/api/v1/connections', connectionsRoutes);
app.use('/api/v1/workflows', workflowsRoutes);
app.use('/api/v1/runs', runsRoutes);
app.use('/api/v1/users', usersRoutes);

// Webhook endpoint for integrations
app.post('/api/v1/webhooks/:integrationSlug', async (req, res) => {
  // Handle incoming webhooks from integrations
  console.log('Webhook received:', req.params.integrationSlug, req.body);
  
  // TODO: Verify webhook signature
  // TODO: Add to workflow execution queue
  
  res.json({ success: true });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT) || 3000;

async function start() {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Nexus API Server running on port ${PORT}             ║
║                                                       ║
║   Environment: ${env.NODE_ENV.padEnd(20)}                 ║
║   Database:    PostgreSQL                             ║
║   API:         http://localhost:${PORT}/api/v1           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await disconnectDatabase();
  process.exit(0);
});

start();

export default app;