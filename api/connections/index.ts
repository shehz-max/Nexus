import { NextRequest, NextResponse } from 'vercel';

const connections = [
  { id: 'conn-1', integrationId: '2', integrationSlug: 'google-sheets', name: 'Google Sheets', status: 'active', connectedAt: '2026-01-15T08:00:00Z' },
  { id: 'conn-2', integrationId: '3', integrationSlug: 'slack', name: 'Slack', status: 'active', connectedAt: '2026-01-20T10:30:00Z' }
];

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  if (!token) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: { connections } });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  if (!token) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
  }

  try {
    const body = await request.json();

    const newConnection = {
      id: `conn-${Date.now()}`,
      integrationId: body.integrationId,
      integrationSlug: body.integrationSlug,
      name: body.name,
      status: 'active',
      connectedAt: new Date().toISOString()
    };

    connections.push(newConnection);

    return NextResponse.json({ success: true, data: { connection: newConnection } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error' } }, { status: 500 });
  }
}