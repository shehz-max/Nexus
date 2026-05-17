import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${req.headers.origin || 'https://' + req.headers.host}/api/auth/github/callback`;

  if (!clientId) {
    return res.status(500).json({
      success: false,
      error: { message: 'GitHub OAuth not configured' }
    });
  }

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

  return res.redirect(authUrl);
}