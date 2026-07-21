require('dotenv').config();

const required = ['TOKEN', 'TARGET_CHANNEL_ID', 'INVITE_LINK', 'OWNER_ID'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`[config] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  token: process.env.TOKEN,
  guildId: process.env.GUILD_ID,
  targetChannelId: process.env.TARGET_CHANNEL_ID,
  inviteLink: process.env.INVITE_LINK,
  ownerId: process.env.OWNER_ID,
  kickReason: 'Sent message in restricted channel',
};
