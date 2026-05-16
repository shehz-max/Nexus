import { NextRequest, NextResponse } from 'vercel';

const runs = [
  { id: 'run-1', workflowId: '1', workflowName: 'Google Sheets to Slack', status: 'success', duration: 1250, createdAt: '2026-05-15T10:30:00Z' },
  { id: 'run-2', workflowId: '2', workflowName: 'New Gmail to Notion', status: 'success', duration: 890, createdAt: '2026-05-15T09:15:00Z' },
  { id: 'run-3', workflowId: '3', workflowName: 'HubSpot Auto Reply', status: 'failed', duration: 0, error: 'API rate limit exceeded', createdAt: '2026-05-10T16:00:00Z' },
  { id: 'run-4', workflowId: '1', workflowName: 'Google Sheets to Slack', status: 'success', duration: 1100, createdAt: '2026-05-15T08:00:00Z' },
  { id: 'run-5', workflowId: '2', workflowName: 'New Gmail to Notion', status: 'running', duration: null, createdAt: '2026-05-15T11:00:00Z' }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth_token');
  if (!token) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
  }

  const { id } = await params;
  const workflowRuns = runs.filter(r => r.workflowId === id);

  return NextResponse.json({ success: true, data: { runs: workflowRuns } });
}