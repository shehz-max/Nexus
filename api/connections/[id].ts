import { NextRequest, NextResponse } from 'vercel';

let connections = [
  { id: 'conn-1', integrationId: '2', integrationSlug: 'google-sheets', name: 'Google Sheets', status: 'active', connectedAt: '2026-01-15T08:00:00Z' },
  { id: 'conn-2', integrationId: '3', integrationSlug: 'slack', name: 'Slack', status: 'active', connectedAt: '2026-01-20T10:30:00Z' }
];

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth_token');
  if (!token) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
  }

  const { id } = await params;
  const index = connections.findIndex(c => c.id === id);

  if (index === -1) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Connection not found' } }, { status: 404 });
  }

  connections.splice(index, 1);

  return NextResponse.json({ success: true, data: { message: 'Connection deleted' } });
}