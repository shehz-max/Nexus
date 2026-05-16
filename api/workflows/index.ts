import { NextRequest, NextResponse } from 'vercel';

let workflows = [
  {
    id: '1',
    name: 'Google Sheets to Slack',
    description: 'Send Slack message when new row is added',
    status: 'active',
    trigger: { integrationId: '2', triggerId: 'new-row' },
    actions: [{ integrationId: '3', actionId: 'send-message', config: { channel: '#general' } }],
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

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token');

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      workflows,
      pagination: { page: 1, limit: 20, total: workflows.length, totalPages: 1 }
    }
  });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token');

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const newWorkflow = {
      id: `${Date.now()}`,
      name: body.name || 'New Workflow',
      description: body.description || '',
      status: 'draft',
      trigger: body.trigger || { integrationId: '', triggerId: '' },
      actions: body.actions || [],
      runCount: 0,
      successCount: 0,
      failureCount: 0,
      lastRunAt: null,
      createdAt: new Date().toISOString()
    };

    workflows.push(newWorkflow);

    return NextResponse.json({
      success: true,
      data: { workflow: newWorkflow }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Server error' } },
      { status: 500 }
    );
  }
}