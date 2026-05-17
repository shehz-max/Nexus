import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: { message: 'Missing authorization code' }
    });
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${req.headers.origin || 'https://' + req.headers.host}/api/auth/google/callback`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userResponse.json();

    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          passwordHash: await bcrypt.hash(Math.random().toString(36), 12),
          avatarUrl: googleUser.picture,
          plan: 'starter',
          preferences: {
            create: {
              theme: 'dark',
              timezone: 'UTC',
            },
          },
        },
      });
    }

    const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');

    const frontendUrl = `${req.headers.origin || 'https://' + req.headers.host}/auth/success?token=${token}`;

    return res.redirect(frontendUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.redirect('/login?error=oauth_failed');
  }
}