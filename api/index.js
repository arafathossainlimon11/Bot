// মেমোরিতে বট লিস্ট ধরে রাখার জন্য
global.botList = global.botList || [];

export default async function handler(req, res) {
  // ১. চ্যানেলে নতুন পোস্ট আসলে অটো-রিয়াকশন সেন্ড
  if (req.method === 'POST' && req.body?.channel_post) {
    const post = req.body.channel_post;
    const channelId = post.chat.id;
    const messageId = post.message_id;

    // এনভায়রনমেন্ট ভ্যারিয়েবল এবং অ্যাডমিন প্যানেল থেকে পাওয়া সব বটের টোকেন একত্রিত করা
    const envTokens = process.env.BOT_TOKENS ? process.env.BOT_TOKENS.split(',').map(t => t.trim()).filter(Boolean) : [];
    const localTokens = global.botList.map(b => b.token);
    const allTokens = Array.from(new Set([...envTokens, ...localTokens]));

    const emojis = ['👍', '❤️', '🔥', '🎉', '🤩', '👏', '😍', '⚡', '🥰', '🚀', '💯', '✨'];

    const reactionPromises = allTokens.map((token, index) => {
      const emoji = emojis[index % emojis.length];
      return fetch(`https://api.telegram.org/bot${token}/setMessageReaction`, {
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
    return res.status(200).json({ success: true, message: "Reactions sent" });
  }

  // ২. অ্যাডমিন প্যানেল লগইন API
  if (req.method === 'POST' && req.body?.action === 'login') {
    const { password } = req.body;
    const adminPass = process.env.ADMIN_PASSWORD || 'arafat01721313101';

    if (password === adminPass) {
      // ডিফল্ট টোকেন লোড করা
      const envTokens = process.env.BOT_TOKENS ? process.env.BOT_TOKENS.split(',').map(t => t.trim()).filter(Boolean) : [];
      if (global.botList.length === 0 && envTokens.length > 0) {
        global.botList = envTokens.map((token, idx) => ({
          username: `Bot_${idx + 1}`,
          token: token
        }));
      }

      return res.status(200).json({ success: true, bots: global.botList });
    }
    return res.status(401).json({ success: false, message: 'ভুল পাসওয়ার্ড!' });
  }

  // ৩. নতুন বট যুক্ত করা API
  if (req.method === 'POST' && req.body?.action === 'add_bot') {
    const { password, username, token, siteUrl } = req.body;
    const adminPass = process.env.ADMIN_PASSWORD || 'arafat01721313101';

    if (password !== adminPass) {
      return res.status(401).json({ success: false, message: 'অনুমোদিত নয়' });
    }

    if (!token || !username) {
      return res.status(400).json({ success: false, message: 'বট টোকেন ও ইউজারনেম আবশ্যক!' });
    }

    const cleanToken = token.trim();
    const cleanUsername = username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`;

    // নতুন বট যুক্ত করা
    const exists = global.botList.some(b => b.token === cleanToken);
    if (!exists) {
      global.botList.push({ username: cleanUsername, token: cleanToken });
    }

    // নতুন বটের জন্য টেলিগ্রাম Webhook কানেক্ট করা
    const webhookUrl = `${siteUrl}/api`;
    await fetch(`https://api.telegram.org/bot${cleanToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    });

    return res.status(200).json({
      success: true,
      message: `${cleanUsername} সফলভাবে যুক্ত হয়েছে এবং কানেক্ট করা হয়েছে!`,
      bots: global.botList
    });
  }

  // ৪. সব বট একসাথে সিঙ্ক করা API
  if (req.method === 'POST' && req.body?.action === 'sync_all') {
    const { password, siteUrl } = req.body;
    const adminPass = process.env.ADMIN_PASSWORD || 'arafat01721313101';

    if (password !== adminPass) return res.status(401).json({ success: false });

    const envTokens = process.env.BOT_TOKENS ? process.env.BOT_TOKENS.split(',').map(t => t.trim()).filter(Boolean) : [];
    const localTokens = global.botList.map(b => b.token);
    const allTokens = Array.from(new Set([...envTokens, ...localTokens]));

    const webhookUrl = `${siteUrl}/api`;

    await Promise.all(allTokens.map(t => 
      fetch(`https://api.telegram.org/bot${t}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      })
    ));

    return res.status(200).json({ success: true, message: 'সব বট চ্যানেলের সাথে কানেক্ট করা হয়েছে!' });
  }

  return res.status(200).send('Telegram Auto Reaction Engine Ready');
                                      }
