// Simple server using native Node.js modules - Vercel-compatible paths
const http = require('http');
const url = require('url');

const PORT = 3000;

const sendJSON = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
};

// In-memory data
const users = [
  { id: 'demo-id', email: 'demo@nexus.io', name: 'Demo User', plan: 'pro', password: 'demo1234' }
];

const integrations = [
  { 
    id: '1', 
    slug: 'gmail', 
    name: 'Gmail', 
    icon: '📧', 
    category: 'Communication', 
    description: 'Send and receive emails', 
    authType: 'oauth2',
    triggers: [
      { id: 'new-email', name: 'New Email Received', description: 'Triggers when a new email arrives' },
      { id: 'new-starred', name: 'New Starred Email', description: 'Triggers when a starred email arrives' }
    ],
    actions: [
      { id: 'send-email', name: 'Send Email', description: 'Send an email to a recipient' }
    ]
  },
  { 
    id: '2', 
    slug: 'google-sheets', 
    name: 'Google Sheets', 
    icon: '📊', 
    category: 'Productivity', 
    description: 'Read, write, and manage spreadsheets', 
    authType: 'oauth2',
    triggers: [
      { id: 'new-row', name: 'New Row Added', description: 'Triggers when a new row is added' },
      { id: 'new-column', name: 'New Column', description: 'Triggers when a new column is added' }
    ],
    actions: [
      { id: 'add-row', name: 'Add Row', description: 'Add a row to a spreadsheet' },
      { id: 'update-cell', name: 'Update Cell', description: 'Update a specific cell' }
    ]
  },
  { 
    id: '3', 
    slug: 'slack', 
    name: 'Slack', 
    icon: '💬', 
    category: 'Communication', 
    description: 'Team communication', 
    authType: 'oauth2',
    triggers: [
      { id: 'new-message', name: 'New Message', description: 'Triggers on new channel messages' }
    ],
    actions: [
      { id: 'send-message', name: 'Send Message', description: 'Send a message to a channel' },
      { id: 'create-channel', name: 'Create Channel', description: 'Create a new Slack channel' }
    ]
  },
  { 
    id: '4', 
    slug: 'notion', 
    name: 'Notion', 
    icon: '📝', 
    category: 'Productivity', 
    description: 'Database and notes', 
    authType: 'oauth2',
    triggers: [
      { id: 'new-page', name: 'New Page', description: 'Triggers when a new page is created' }
    ],
    actions: [
      { id: 'create-page', name: 'Create Page', description: 'Create a new page' },
      { id: 'update-page', name: 'Update Page', description: 'Update an existing page' }
    ]
  },
  { 
    id: '5', 
    slug: 'hubspot', 
    name: 'HubSpot', 
    icon: '🔷', 
    category: 'CRM', 
    description: 'CRM and marketing', 
    authType: 'oauth2',
    triggers: [
      { id: 'new-contact', name: 'New Contact', description: 'Triggers when a new contact is created' },
      { id: 'deal-stage-changed', name: 'Deal Stage Changed', description: 'Triggers when deal stage changes' }
    ],
    actions: [
      { id: 'create-contact', name: 'Create Contact', description: 'Create a new contact' },
      { id: 'create-deal', name: 'Create Deal', description: 'Create a new deal' }
    ]
  }
];

let workflows = [
  { 
    id: '1', 
    name: 'Google Sheets to Slack', 
    description: 'Send Slack message when new row is added',
    status: 'active', 
    trigger: { integrationId: '2', triggerId: 'new-row' },
    actions: [{ integrationId: '3', actionId: 'send-message' }],
    runCount: 234, 
    successCount: 230, 
    failureCount: 4, 
    lastRunAt: '2026-05-15T10:30:00Z', 
    createdAt: '2026-01-15T08:00:00Z' 
  },
  { 
    id: '2', 
    name: 'New Gmail to Notion', 
    description: 'Create Notion page for starred emails',
    status: 'active', 
    trigger: { integrationId: '1', triggerId: 'new-starred' },
    actions: [{ integrationId: '4', actionId: 'create-page' }],
    runCount: 89, 
    successCount: 87, 
    failureCount: 2, 
    lastRunAt: '2026-05-15T09:15:00Z', 
    createdAt: '2026-02-20T14:30:00Z' 
  },
  { 
    id: '3', 
    name: 'HubSpot Auto Reply', 
    description: 'Auto reply to new HubSpot contacts',
    status: 'paused', 
    trigger: { integrationId: '5', triggerId: 'new-contact' },
    actions: [{ integrationId: '1', actionId: 'send-email' }],
    runCount: 45, 
    successCount: 42, 
    failureCount: 3, 
    lastRunAt: '2026-05-10T16:00:00Z', 
    createdAt: '2026-03-05T11:00:00Z' 
  }
];

const runs = [
  { id: 'run-1', workflowId: '1', workflowName: 'Google Sheets to Slack', status: 'success', duration: 1250, createdAt: '2026-05-15T10:30:00Z' },
  { id: 'run-2', workflowId: '2', workflowName: 'New Gmail to Notion', status: 'success', duration: 890, createdAt: '2026-05-15T09:15:00Z' },
  { id: 'run-3', workflowId: '3', workflowName: 'HubSpot Auto Reply', status: 'failed', duration: 0, createdAt: '2026-05-10T16:00:00Z' },
  { id: 'run-4', workflowId: '1', workflowName: 'Google Sheets to Slack', status: 'success', duration: 1100, createdAt: '2026-05-15T08:00:00Z' },
  { id: 'run-5', workflowId: '2', workflowName: 'New Gmail to Notion', status: 'running', duration: null, createdAt: '2026-05-15T11:00:00Z' }
];

let connections = [
  { id: 'conn-1', integrationId: '2', integrationSlug: 'google-sheets', name: 'Google Sheets', status: 'active', connectedAt: '2026-01-15T08:00:00Z' },
  { id: 'conn-2', integrationId: '3', integrationSlug: 'slack', name: 'Slack', status: 'active', connectedAt: '2026-01-20T10:30:00Z' }
];

const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body.trim()) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
};

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  try {
    // Auth - login (POST /api/auth/login)
    if (path === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const user = users.find(u => u.email === body.email && u.password === body.password);
      
      if (user) {
        sendJSON(res, 200, {
          success: true,
          data: {
            user: { id: user.id, email: user.email, name: user.name, plan: user.plan }
          }
        });
      } else {
        sendJSON(res, 401, { success: false, error: { code: 'AUTH_INVALID', message: 'Invalid credentials' } });
      }
      return;
    }

    // Auth - me (GET /api/auth/me)
    if (path === '/api/auth/me' && method === 'GET') {
      sendJSON(res, 200, {
        success: true,
        data: {
          user: { id: 'demo-id', email: 'demo@nexus.io', name: 'Demo User', plan: 'pro' }
        }
      });
      return;
    }

    // Auth - logout (POST /api/auth/logout)
    if (path === '/api/auth/logout' && method === 'POST') {
      sendJSON(res, 200, { success: true, data: { message: 'Logged out' } });
      return;
    }

    // Users - me (GET /api/users/me)
    if (path === '/api/users/me' && method === 'GET') {
      sendJSON(res, 200, {
        success: true,
        data: { user: { id: 'demo-id', email: 'demo@nexus.io', name: 'Demo User', plan: 'pro' } }
      });
      return;
    }

    // Integrations (GET /api/integrations)
    if (path === '/api/integrations' && method === 'GET') {
      sendJSON(res, 200, { success: true, data: { integrations } });
      return;
    }

    // Connections (GET /api/connections)
    if (path === '/api/connections' && method === 'GET') {
      sendJSON(res, 200, { success: true, data: { connections } });
      return;
    }

    // Workflows (GET /api/workflows)
    if (path === '/api/workflows' && method === 'GET') {
      sendJSON(res, 200, {
        success: true,
        data: { workflows, pagination: { page: 1, limit: 20, total: workflows.length, totalPages: 1 } }
      });
      return;
    }

    // Workflows (POST /api/workflows) - Create
    if (path === '/api/workflows' && method === 'POST') {
      const body = await parseBody(req);
      const newWorkflow = {
        id: String(Date.now()),
        name: body.name || 'Untitled Workflow',
        description: body.description || '',
        status: body.status || 'draft',
        trigger: body.trigger || null,
        actions: body.actions || [],
        runCount: 0,
        successCount: 0,
        failureCount: 0,
        lastRunAt: null,
        createdAt: new Date().toISOString()
      };
      workflows.push(newWorkflow);
      sendJSON(res, 201, { success: true, data: { workflow: newWorkflow } });
      return;
    }

    // Workflow by ID (GET /api/workflows/[id])
    const workflowMatch = path.match(/^\/api\/workflows\/(\d+|[a-zA-Z-]+)$/);
    if (workflowMatch && method === 'GET') {
      const id = workflowMatch[1];
      const workflow = workflows.find(w => w.id === id);
      if (!workflow) {
        sendJSON(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
        return;
      }
      sendJSON(res, 200, { success: true, data: { workflow } });
      return;
    }

    // Workflow (PATCH /api/workflows/[id])
    if (workflowMatch && method === 'PATCH') {
      const id = workflowMatch[1];
      const index = workflows.findIndex(w => w.id === id);
      if (index === -1) {
        sendJSON(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
        return;
      }
      const body = await parseBody(req);
      workflows[index] = { ...workflows[index], ...body };
      sendJSON(res, 200, { success: true, data: { workflow: workflows[index] } });
      return;
    }

    // Workflow (DELETE /api/workflows/[id])
    if (workflowMatch && method === 'DELETE') {
      const id = workflowMatch[1];
      const index = workflows.findIndex(w => w.id === id);
      if (index === -1) {
        sendJSON(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
        return;
      }
      workflows.splice(index, 1);
      sendJSON(res, 200, { success: true, data: { message: 'Workflow deleted' } });
      return;
    }

    // Workflow enable (POST /api/workflows/[id]/enable)
    if (path.match(/^\/api\/workflows\/(\d+|[a-zA-Z-]+)\/enable$/) && method === 'POST') {
      const id = path.split('/')[3];
      const workflow = workflows.find(w => w.id === id);
      if (!workflow) {
        sendJSON(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
        return;
      }
      workflow.status = 'active';
      sendJSON(res, 200, { success: true, data: { workflow } });
      return;
    }

    // Workflow disable (POST /api/workflows/[id]/disable)
    if (path.match(/^\/api\/workflows\/(\d+|[a-zA-Z-]+)\/disable$/) && method === 'POST') {
      const id = path.split('/')[3];
      const workflow = workflows.find(w => w.id === id);
      if (!workflow) {
        sendJSON(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
        return;
      }
      workflow.status = 'paused';
      sendJSON(res, 200, { success: true, data: { workflow } });
      return;
    }

    // Runs (GET /api/runs)
    if (path === '/api/runs' && method === 'GET') {
      sendJSON(res, 200, {
        success: true,
        data: { runs, pagination: { page: 1, limit: 20, total: runs.length, totalPages: 1 } }
      });
      return;
    }

    // Runs stats (GET /api/runs/stats)
    if (path === '/api/runs/stats' && method === 'GET') {
      const total = runs.length;
      const success = runs.filter(r => r.status === 'success').length;
      const failed = runs.filter(r => r.status === 'failed').length;
      sendJSON(res, 200, {
        success: true,
        data: { total, success, failed, successRate: Math.round((success / total) * 100 * 10) / 10 }
      });
      return;
    }

    // 404
    sendJSON(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });

  } catch (error) {
    sendJSON(res, 400, { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid request' } });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});