import fetch from 'node-fetch';

const defaultBots = [
  { username: "@Tanvir_bot", token: "8407868760:AAG6ZophC7dDESbd5npnnJ8n5s2zVPpMAc8" },
  { username: "@Aayan_bot", token: "8678868430:AAEWPy9Zo4l17RYhH3LSWALKOPEZiLyIGec" },
  { username: "@Rahat_bot", token: "8954980480:AAHjlBwp-b_SdyZ23C-nLfqtZrKhs_68O6c" },
  { username: "@Sumiya_bot", token: "8896588682:AAHgovbBosG3bB1ZPU55-Hs545VfjuIU1Ok" },
  { username: "@Sneha_bot", token: "8975503853:AAEkJlbeAKsdQzv_5JxAy3BEj8lI3bGSkr8" },
  { username: "@Meera_bot", token: "8985833367:AAFaROblnxP-ER7FZxrdqJFRqh9jasSpyhQ" },
  { username: "@Tamnna_bot", token: "8818144137:AAHVJ93ueND1MlkXoISO2cSM7xhOUvgwuE4" },
  { username: "@Priya_bot", token: "8869262106:AAFA_dVBeWv9K6Oc1Hqn8k4p-MocsuF81Bw" },
  { username: "@Rohan_bot", token: "8712311804:AAE7fm-vGvyFUGL_xjG7YdqgeOjWw8J_Cvk" },
  { username: "@Arafat_bot", token: "8950146736:AAEUAKAQHy3faihON8MHq-F3wUcrNO6C7uE" }
];

global.botList = (global.botList && global.botList.length > 0) ? global.botList : defaultBots;

export default async function handler(req, res) {
  if (req.method === 'POST' && req.body?.channel_post) {
    const post = req.body.channel_post;
    const channelId = post.chat.id;
    const messageId = post.message_id;

    const emojis = ['👍', '❤️', '🔥', '🎉', '🤩', '👏', '😍', '⚡', '🥰', '🚀', '💯', '✨'];

    const reactionPromises = global.botList.map((bot, index) => {
      const emoji = emojis[index % emojis.length];
      return fetch(`https://api.telegram.org/bot${bot.token}/setMessageReaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          message_id: messageId,
          reaction: [{ type: 'emoji', emoji: emoji }]
        })
      });
    });

    await Promise.all(reactionPromises);
    return res.status(200).json({ success: true });
  }

  if (req.method === 'POST' && req.body?.action === 'login') {
    const { password } = req.body;
    const adminPass = process.env.ADMIN_PASSWORD || 'arafat01721313101';

    if (password === adminPass) {
      return res.status(200).json({ success: true, bots: global.botList });
    }
    return res.status(401).json({ success: false, message: 'Invalid Password' });
  }

  if (req.method === 'POST' && req.body?.action === 'add_bot') {
    const { password, username, token, siteUrl } = req.body;
    const adminPass = process.env.ADMIN_PASSWORD || 'arafat01721313101';

    if (password !== adminPass) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (!token || !username) {
      return res.status(400).json({ success: false, message: 'Username and Token required' });
    }

    const cleanToken = token.trim();
    const cleanUsername = username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`;

    if (!global.botList.some(b => b.token === cleanToken)) {
      global.botList.push({ username: cleanUsername, token: cleanToken });
    }

    const webhookUrl = `${siteUrl}/api`;
    await fetch(`https://api.telegram.org/bot${cleanToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    });

    return res.status(200).json({
      success: true,
      message: 'Bot added successfully!',
      bots: global.botList
    });
  }

  if (req.method === 'POST' && req.body?.action === 'sync_all') {
    const { password, siteUrl } = req.body;
    const adminPass = process.env.ADMIN_PASSWORD || 'arafat01721313101';

    if (password !== adminPass) return res.status(401).json({ success: false });

    const webhookUrl = `${siteUrl}/api`;

    await Promise.all(global.botList.map(b =>
      fetch(`https://api.telegram.org/bot${b.token}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      })
    ));

    return res.status(200).json({ success: true, message: 'All bots synced successfully!' });
  }

  return res.status(200).send('OK');
          }
