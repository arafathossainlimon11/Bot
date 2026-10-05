import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('OK');

  try {
    const update = req.body;
    const channelPost = update?.channel_post;

    if (channelPost) {
      const channelId = channelPost.chat.id;
      const messageId = channelPost.message_id;

      const tokens = process.env.BOT_TOKENS ? process.env.BOT_TOKENS.split(',').map(t => t.trim()) : [];
      const emojis = ['👍', '❤️', '🔥', '🎉', '🤩', '👏', '😍', '⚡', '🥰', '🚀'];

      const reactionPromises = tokens.map((token, index) => {
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
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
            }
