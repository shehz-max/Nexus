import { NextRequest, NextResponse } from 'vercel';

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
      user: { id: 'demo-id', email: 'demo@nexus.io', name: 'Demo User', plan: 'pro', avatarUrl: null }
    }
  });
}