require('dotenv').config();

const required = ['TOKEN', 'TARGET_CHANNEL_ID', 'INVITE_LINK'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`[config] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  token: process.env.TOKEN,
  targetChannelId: process.env.TARGET_CHANNEL_ID,
  inviteLink: process.env.INVITE_LINK,
  kickReason: 'Sent message in restricted channel',
};
