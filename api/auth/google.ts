import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${req.headers.origin || 'https://' + req.headers.host}/api/auth/google/callback`;

  if (!clientId) {
    return res.status(500).json({
      success: false,
      error: { message: 'Google OAuth not configured' }
    });
  }

  const scopes = encodeURIComponent('email profile');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline`;

  return res.redirect(authUrl);
}