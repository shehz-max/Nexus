import { NextRequest, NextResponse } from 'vercel';

let workflows = [
  { id: '1', name: 'Google Sheets to Slack', status: 'active' },
  { id: '2', name: 'New Gmail to Notion', status: 'active' },
  { id: '3', name: 'HubSpot Auto Reply', status: 'paused' }
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth_token');
  if (!token) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
  }

  const { id } = await params;
  const workflow = workflows.find(w => w.id === id);
  if (!workflow) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Workflow not found' } }, { status: 404 });
  }

  workflow.status = 'paused';
  return NextResponse.json({ success: true, data: { workflow } });
}