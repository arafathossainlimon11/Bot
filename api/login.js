export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'arafat01721313101';

  if (password === adminPassword) {
    return res.status(200).json({ success: true, message: 'Access Granted' });
  }
  return res.status(401).json({ success: false, message: 'Wrong Password!' });
}
