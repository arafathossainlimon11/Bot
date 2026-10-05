import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, siteUrl } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'arafat01721313101';

  if (password !== adminPassword) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const tokens = process.env.BOT_TOKENS ? process.env.BOT_TOKENS.split(',').map(t => t.trim()) : [];
  const webhookEndpoint = `${siteUrl}/api/webhook`;

  const results = await Promise.all(tokens.map(async (token) => {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookEndpoint })
    });
    return response.json();
  }));

  return res.status(200).json({ success: true, results });
      }
