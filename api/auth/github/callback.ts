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
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'Nexus-App' },
    });

    const githubUser = await userResponse.json();

    let user = await prisma.user.findUnique({ where: { email: githubUser.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: githubUser.email,
          name: githubUser.name || githubUser.login,
          passwordHash: await bcrypt.hash(Math.random().toString(36), 12),
          avatarUrl: githubUser.avatar_url,
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
    console.error('GitHub OAuth error:', error);
    return res.redirect('/login?error=oauth_failed');
  }
}