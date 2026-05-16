# Nexus - Backend Implementation Plan

## Project Overview

**Nexus** is a workflow automation platform (Zapier alternative) with:
- Frontend: React + TypeScript + Vite + Tailwind + Framer Motion
- Database: PostgreSQL with Prisma ORM
- Target: MVP with Google Sheets, Gmail, Slack, Notion, HubSpot integrations

---

## Current State Analysis

### Frontend Structure
```
/ (Landing) → /login → /register → /app/*
├── /app (Layout) → Dashboard (index)
├── /app/integrations
├── /app/workflows → /app/workflows/new
├── /app/activity
└── /app/settings (Profile, Security, Notifications, Billing)
```

### API Client (api/index.ts) - Already Defined
- `POST /auth/login`, `/auth/register`, `GET /auth/me`
- `GET /integrations`, `GET /integrations/categories`
- `GET/POST/DELETE /connections`, `/connections/:id/refresh`
- `GET/POST/PATCH/DELETE /workflows`, `/workflows/:id/enable|disable|test|duplicate`
- `GET /runs`, `/runs/:id/retry`, `GET /runs/stats`

### Database Schema (prisma/schema.prisma) - Already Defined
- User, UserPreference, Integration, Connection
- Workflow, WorkflowRun, ApiKey, AuditLog

---

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js (fast, minimal, good for APIs)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT with refresh tokens (access: 15min, refresh: 7days)
- **Validation**: Zod for schema validation
- **Queue**: Bull with Redis (for workflow execution)
- **Scheduler**: node-cron (for scheduled workflows)

### Project Structure
```
server/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   ├── database.ts         # Prisma client
│   │   ├── redis.ts            # Redis client
│   │   └── env.ts              # Environment validation
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   ├── error.ts            # Global error handler
│   │   └── rateLimit.ts        # Rate limiting
│   ├── routes/
│   │   ├── auth.ts             # /auth/*
│   │   ├── integrations.ts      # /integrations/*
│   │   ├── connections.ts       # /connections/*
│   │   ├── workflows.ts        # /workflows/*
│   │   └── runs.ts             # /runs/*
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── integration.service.ts
│   │   ├── workflow.service.ts
│   │   ├── executor.service.ts  # Workflow execution engine
│   │   └── trigger.service.ts   # Webhook/trigger handlers
│   ├── jobs/
│   │   ├── workflowQueue.ts     # Bull queue setup
│   │   └── scheduler.ts         # Cron jobs
│   ├── integrations/            # Integration adapters
│   │   ├── gmail.ts
│   │   ├── googleSheets.ts
│   │   ├── slack.ts
│   │   ├── notion.ts
│   │   └── hubspot.ts
│   └── utils/
│       ├── logger.ts
│       └── helpers.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

---

## Core Functionality Specifications

### 1. Authentication System

#### Features
- Email/password registration with email verification (MVP: skip)
- JWT-based authentication with access/refresh tokens
- Password hashing with bcrypt (12 rounds)
- Session management (single session per plan)

#### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create account |
| POST | /auth/login | Login, returns tokens |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Invalidate refresh token |
| GET | /auth/me | Get current user |

#### Response Shape
```typescript
// Success
{ success: true, data: { user, token, refreshToken } }

// Error
{ success: false, error: { code, message } }
```

### 2. Integration Management

#### Integration Adapter Pattern
Each integration follows a unified interface:
```typescript
interface IntegrationAdapter {
  // Metadata
  id: string;
  name: string;
  icon: string;
  authType: 'oauth2' | 'api-key' | 'webhook';

  // Auth methods
  getOAuthUrl(state: string): string;
  handleCallback(code: string): Credentials;
  refreshCredentials(credentials: Credentials): Credentials;

  // Trigger methods (for polling)
  getTriggers(): Trigger[];
  pollTrigger(triggerId: string, credentials: Credentials, lastRun?: Date): TriggerEvent[];

  // Action methods
  getActions(): Action[];
  executeAction(actionId: string, credentials: Credentials, params: any): ActionResult;

  // Test connection
  testConnection(credentials: Credentials): Promise<boolean>;
}
```

#### MVP Integrations
1. **Google Sheets** - OAuth2, batch read/write
2. **Gmail** - OAuth2, watch for new emails
3. **Slack** - OAuth2, send messages, list channels
4. **Notion** - OAuth2, create pages, search
5. **HubSpot** - OAuth2, CRM operations

#### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /integrations | List all available integrations |
| GET | /integrations/:id | Get integration details |
| GET | /connections | List user's connections |
| POST | /connections | Create connection (OAuth callback) |
| DELETE | /connections/:id | Remove connection |
| POST | /connections/:id/refresh | Refresh OAuth tokens |
| GET | /connections/:id/test | Test connection |

### 3. Workflow Engine

#### Workflow Data Model
```typescript
interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  trigger: {
    integrationId: string;
    triggerId: string;
    config: Record<string, any>; // e.g., { folderId: "xxx" }
    pollingInterval?: number; // in seconds
  };
  filters?: {
    conditions: FilterCondition[];
    logic: 'AND' | 'OR';
  };
  actions: WorkflowAction[];
  schedule?: {
    type: 'interval' | 'cron' | 'manual';
    config: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowAction {
  id: string;
  integrationId: string;
  actionId: string;
  config: Record<string, any>; // Maps trigger data to action params
  continueOnError: boolean;
}

interface FilterCondition {
  field: string;      // e.g., "data.subject"
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'regex';
  value: any;
}
```

#### Execution Flow
```
1. Trigger detected (webhook or poll)
   ↓
2. Load workflow and verify active status
   ↓
3. Execute filters (if any)
   ↓
4. For each action in sequence:
   a. Map trigger data to action params (data transformation)
   b. Execute action via integration adapter
   c. If action fails and continueOnError=false → stop
   d. Pass output to next action (chaining)
   ↓
5. Record run results
   ↓
6. Send notifications (if configured)
```

#### Data Transformation
Support Jinja2-like templating for mapping trigger data to action params:
```json
{
  "channel": "#general",
  "message": "New order from {{customer_name}}: ${{order_amount}}"
}
```

#### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /workflows | List user's workflows |
| POST | /workflows | Create workflow |
| GET | /workflows/:id | Get workflow details |
| PATCH | /workflows/:id | Update workflow |
| DELETE | /workflows/:id | Delete workflow |
| POST | /workflows/:id/enable | Activate workflow |
| POST | /workflows/:id/disable | Pause workflow |
| POST | /workflows/:id/test | Test workflow with sample data |
| POST | /workflows/:id/duplicate | Clone workflow |
| GET | /workflows/:id/runs | Get run history |

### 4. Execution & Runs

#### Run Data Model
```typescript
interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  triggerData: any;           // What triggered this run
  steps: WorkflowRunStep[];
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  error?: {
    message: string;
    stepIndex: number;
    stack?: string;
  };
}

interface WorkflowRunStep {
  index: number;
  type: 'trigger' | 'action';
  integrationId: string;
  actionId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  input: any;
  output?: any;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}
```

#### Queue System (Bull + Redis)
```typescript
interface WorkflowJob {
  workflowId: string;
  triggerData: any;
  runId: string;
  priority?: number;  // Based on plan (higher for Pro)
}

// Queue names
- workflow:execute     // Immediate execution
- workflow:schedule     // Scheduled workflows
- workflow:retry        // Retry failed runs
```

#### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /runs | List runs (with pagination, filters) |
| GET | /runs/:id | Get run details with steps |
| POST | /runs/:id/retry | Retry failed run |
| DELETE | /runs/:id | Cancel running run |
| GET | /runs/stats | Get aggregate statistics |

### 5. Webhooks & Triggers

#### Webhook Handler
For integrations that support webhooks (Slack, Gmail push), handle incoming events:
```typescript
// POST /webhooks/:integrationId
interface WebhookPayload {
  signature: string;  // For verification
  event: string;
  data: any;
}
```

#### Polling Triggers
For integrations without webhooks, poll at intervals:
- Free: 15 min intervals
- Starter: 5 min intervals
- Pro: 1 min intervals

### 6. Settings & Profile

#### User Preferences
- Profile: name, avatar, timezone
- Security: change password, 2FA setup
- Notifications: email, in-app, Slack
- Billing: plan management, invoices

#### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/me | Get current user |
| PATCH | /users/me | Update profile |
| GET | /users/me/preferences | Get preferences |
| PATCH | /users/me/preferences | Update preferences |
| POST | /users/me/password | Change password |
| POST | /users/me/2fa/setup | Setup 2FA |
| POST | /users/me/2fa/verify | Verify 2FA |

---

## Frontend Updates Required

### 1. API Client Enhancement
Add new API endpoints to `src/api/index.ts`:

```typescript
// Users
export const usersApi = {
  me: () => api.get('/users/me'),
  update: (data: Partial<User>) => api.patch('/users/me', data),
  changePassword: (currentPassword: string, newPassword: string) => 
    api.post('/users/me/password', { currentPassword, newPassword }),
  getPreferences: () => api.get('/users/me/preferences'),
  updatePreferences: (data: any) => api.patch('/users/me/preferences', data),
};

// Add to existing APIs
export const runsApi = {
  list: (params?: { workflowId?: string; status?: string; page?: number; limit?: number }) => 
    api.get('/runs', { params }),
  get: (id: string) => api.get(`/runs/${id}`),
  retry: (id: string) => api.post(`/runs/${id}/retry`),
  cancel: (id: string) => api.delete(`/runs/${id}`),
  stats: () => api.get('/runs/stats'),
};
```

### 2. Auth Store Enhancement
Update `src/store/auth.ts` to include:
- Token refresh logic
- Loading states for protected routes
- Role/plan checking

### 3. Workflow Builder - Full Implementation
Current placeholder needs full implementation:
- Load integrations from API
- Load user's connections for each integration
- Configure trigger with proper parameters
- Configure actions with data mapping UI
- Add filter conditions builder
- Save workflow with proper API call

### 4. Dashboard - Real Data
Replace mock data with React Query:
```typescript
// Example using React Query
import { useQuery } from '@tanstack/react-query';
import { workflowsApi, runsApi, connectionsApi } from '../api';

const { data: workflows } = useQuery({
  queryKey: ['workflows'],
  queryFn: () => workflowsApi.list(),
});

const { data: stats } = useQuery({
  queryKey: ['runs', 'stats'],
  queryFn: () => runsApi.stats(),
});
```

### 5. Protected Routes
Add auth protection back to App.tsx:
```typescript
<Route path="/app" element={
  <RequireAuth>
    <Layout />
  </RequireAuth>
}>
```

### 6. OAuth Flow Pages
Add pages for OAuth callbacks:
- `/auth/google` - Google OAuth
- `/auth/slack` - Slack OAuth
- etc.

### 7. Connection Management
Enhance Integrations page:
- Show connection status (connected/disconnected)
- "Connect" button initiates OAuth flow
- Connection management (refresh, test, delete)

---

## Implementation Phases

### Phase 1: Backend Foundation (2-3 days)
1. **Setup Express server with TypeScript**
   - Config, middleware, error handling
   - PostgreSQL connection with Prisma

2. **Authentication System**
   - Register, login, logout endpoints
   - JWT with refresh tokens
   - Password hashing

3. **Database Seeding**
   - Seed integrations (5 MVP apps)
   - Seed demo user for testing

### Phase 2: Core API (2-3 days)
4. **Integrations API**
   - List integrations
   - Get integration details (triggers/actions)

5. **Connections API**
   - Create OAuth connections
   - List user's connections
   - Test/refresh connections

6. **Workflows CRUD**
   - Create, read, update, delete workflows
   - Enable/disable workflows

### Phase 3: Workflow Execution (2-3 days)
7. **Workflow Execution Engine**
   - Bull queue setup
   - Trigger polling service
   - Action execution service
   - Data transformation

8. **Runs API**
   - Record runs
   - List with pagination
   - Retry failed runs

9. **Webhook Handlers**
   - Receive webhook events
   - Verify signatures

### Phase 4: Frontend Integration (2-3 days)
10. **Connect API to Frontend**
    - Update API client
    - Add React Query hooks
    - Connect auth store

11. **Workflow Builder Full Implementation**
    - Load integrations/connections
    - Trigger configuration UI
    - Action configuration UI
    - Data mapping builder

12. **Dashboard with Real Data**
    - Stats from API
    - Recent runs
    - Quick actions

### Phase 5: Polish & Testing (2 days)
13. **Settings Page**
    - Profile update
    - Password change
    - Preferences

14. **Error Handling & Validation**
    - Form validation (Zod)
    - API error handling
    - Loading states

15. **Testing**
    - End-to-end flow
    - OAuth flow testing
    - Workflow execution testing

---

## Database Schema Enhancements

Update `prisma/schema.prisma` for workflow execution:

```prisma
model Integration {
  id                 String   @id @default(uuid())
  slug               String   @unique  // 'gmail', 'slack', etc.
  name               String
  description        String?
  icon               String?  // emoji or URL
  category           String?  // 'communication', 'productivity', etc.
  authType           String   // 'oauth2', 'apikey', 'webhook'
  authUrl            String?  // OAuth authorization URL
  tokenUrl           String?  // OAuth token URL
  scopes             String[] // Required OAuth scopes
  triggers           Json     // [{ id, name, description, configSchema }]
  actions            Json     // [{ id, name, description, configSchema }]
  isActive           Boolean  @default(true)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  connections        Connection[]
  workflowTriggers   WorkflowTrigger[]
  workflowActions    WorkflowAction[]
}

model Connection {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  integrationId   String
  integration     Integration @relation(fields: [integrationId], references: [id])
  
  // OAuth tokens
  accessToken     String   @db.Text
  refreshToken    String?  @db.Text
  tokenExpiresAt  DateTime?
  
  // Meta
  providerId      String?  // ID in the external service (e.g., Google account ID)
  providerEmail   String?  // Email of connected account
  displayName     String?  // Display name in external service
  
  status          String   @default("active") // 'active', 'error', 'revoked'
  lastSyncAt      DateTime?
  lastError       String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([integrationId])
  @@index([status])
}

model Workflow {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name            String
  description     String?
  
  status          String    @default("draft") // 'draft', 'active', 'paused', 'error'
  
  // Trigger
  triggerConnectionId String
  triggerId          String
  triggerConfig      Json    // Configuration for the trigger
  
  // Filters
  filters          Json?    // { conditions: [], logic: 'AND' | 'OR' }
  
  // Actions (ordered array)
  actions          Json     // [{ connectionId, actionId, config, continueOnError }]
  
  // Schedule
  scheduleType     String?  // 'realtime', 'interval', 'cron', 'manual'
  scheduleConfig    Json?    // { interval: 300 } or { cron: "0 * * * *" }
  
  // Stats
  runCount         Int       @default(0)
  successCount     Int       @default(0)
  failureCount     Int       @default(0)
  lastRunAt        DateTime?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  runs            WorkflowRun[]

  @@index([userId])
  @@index([status])
}

model WorkflowRun {
  id            String    @id @default(uuid())
  workflowId    String
  workflow      Workflow  @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  
  status        String    @default("pending") // 'pending', 'running', 'success', 'failed', 'cancelled'
  
  triggerData   Json?     // Data that triggered this run
  steps         Json      // [{ type, integrationId, actionId, status, input, output, error, duration }]
  
  errorMessage  String?
  errorStack    String?
  
  startedAt     DateTime  @default(now())
  completedAt   DateTime?
  durationMs    Int?
  
  createdAt     DateTime  @default(now())

  @@index([workflowId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
}
```

---

## API Response Format

All responses follow this structure:

```typescript
// Success
{
  success: true,
  data: T  // The actual data
}

// Paginated
{
  success: true,
  data: {
    items: T[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}

// Error
{
  success: false,
  error: {
    code: string,    // 'AUTH_INVALID_CREDENTIALS', 'VALIDATION_ERROR', etc.
    message: string, // Human-readable message
    details?: any    // Additional error info
  }
}
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nexus

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# OAuth (per integration)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=

# App
APP_URL=http://localhost:5173
API_URL=http://localhost:3000
NODE_ENV=development
```

---

## Testing Checklist

### Auth
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Token refresh
- [ ] Logout

### Integrations
- [ ] List all integrations
- [ ] OAuth flow for each integration
- [ ] List user's connections
- [ ] Test connection
- [ ] Remove connection

### Workflows
- [ ] Create workflow (draft)
- [ ] Add trigger configuration
- [ ] Add multiple actions
- [ ] Add filters
- [ ] Save workflow
- [ ] Enable workflow
- [ ] Disable workflow
- [ ] Delete workflow
- [ ] Duplicate workflow
- [ ] Test workflow

### Execution
- [ ] Webhook trigger fires workflow
- [ ] Polling trigger executes on schedule
- [ ] Actions execute in sequence
- [ ] Data transformation works
- [ ] Filter conditions work
- [ ] Continue on error works
- [ ] Run recorded with steps

### Runs
- [ ] List runs with pagination
- [ ] Filter by status
- [ ] View run details
- [ ] Retry failed run
- [ ] Cancel running run
- [ ] Run statistics accurate

---

## Next Steps

1. **Initialize Backend Project**
   ```bash
   mkdir -p server/src
   cd server
   npm init -y
   npm install express typescript ts-node prisma @prisma/client
   npm install -D @types/express @types/node nodemon
   ```

2. **Setup Prisma with Enhanced Schema**

3. **Implement Auth System**

4. **Build Integration Adapters**

5. **Create Workflow Execution Engine**

6. **Connect to Frontend**