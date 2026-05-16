// Root level server using packages from root node_modules
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.APP_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Demo auth endpoint
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'demo@nexus.io' && password === 'demo1234') {
    res.json({
      success: true,
      data: {
        token: 'demo-token-' + Date.now(),
        refreshToken: 'refresh-' + Date.now(),
        user: {
          id: 'demo-id',
          email: 'demo@nexus.io',
          name: 'Demo User',
          plan: 'pro',
          maxWorkflows: -1,
          maxRuns: -1
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: { code: 'AUTH_INVALID', message: 'Invalid credentials' }
    });
  }
});

// Demo integrations
app.get('/api/v1/integrations', (req, res) => {
  res.json({
    success: true,
    data: {
      integrations: [
        { id: '1', slug: 'gmail', name: 'Gmail', icon: '📧', category: 'Communication' },
        { id: '2', slug: 'google-sheets', name: 'Google Sheets', icon: '📊', category: 'Productivity' },
        { id: '3', slug: 'slack', name: 'Slack', icon: '💬', category: 'Communication' },
        { id: '4', slug: 'notion', name: 'Notion', icon: '📝', category: 'Productivity' },
        { id: '5', slug: 'hubspot', name: 'HubSpot', icon: '🔷', category: 'CRM' },
      ]
    }
  });
});

// Demo workflows
app.get('/api/v1/workflows', (req, res) => {
  res.json({
    success: true,
    data: {
      workflows: [
        { id: '1', name: 'Google Sheets to Slack', status: 'active', runCount: 234 },
        { id: '2', name: 'New Gmail to Notion', status: 'active', runCount: 89 },
        { id: '3', name: 'HubSpot Auto Reply', status: 'paused', runCount: 45 },
      ]
    }
  });
});

// Demo runs stats
app.get('/api/v1/runs/stats', (req, res) => {
  res.json({
    success: true,
    data: { total: 1247, success: 1224, failed: 23, successRate: 98.2 }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Nexus API running on http://localhost:${PORT}`);
  console.log(`   Try: curl http://localhost:${PORT}/api/v1/health`);
});

export default app;