import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

app.get('/api/v1/integrations', (_req, res) => {
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

app.get('/api/v1/workflows', (_req, res) => {
  res.json({
    success: true,
    data: {
      workflows: [
        { id: '1', name: 'Google Sheets to Slack', status: 'active', runCount: 234, successCount: 230, failureCount: 4 },
        { id: '2', name: 'New Gmail to Notion', status: 'active', runCount: 89, successCount: 87, failureCount: 2 },
        { id: '3', name: 'HubSpot Auto Reply', status: 'paused', runCount: 45, successCount: 42, failureCount: 3 },
      ]
    }
  });
});

app.get('/api/v1/runs/stats', (_req, res) => {
  res.json({
    success: true,
    data: { total: 1247, success: 1224, failed: 23, successRate: 98.2 }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Nexus API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

export default app;