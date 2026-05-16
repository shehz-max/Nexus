import { NextRequest, NextResponse } from 'vercel';

const DEMO_USERS = [
  { id: 'demo-id', email: 'demo@nexus.io', name: 'Demo User', plan: 'pro', password: 'demo1234', avatarUrl: null }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    const user = DEMO_USERS.find(u => u.email === email);

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INVALID', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }

    const token = `token-${Date.now()}-${user.id}`;
    const refreshToken = `refresh-${Date.now()}-${user.id}`;

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, plan: user.plan, avatarUrl: user.avatarUrl }
      }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Server error' } },
      { status: 500 }
    );
  }
}