const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const config = require('./config');
const kickOnMessage = require('./modules/moderation/kickOnMessage');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.once(Events.ClientReady, (c) => {
  console.log(`[bot] Logged in as ${c.user.tag}. Watching channel ${config.targetChannelId}.`);
});

client.on(Events.MessageCreate, async (message) => {
  try {
    await kickOnMessage.handleMessage(message);
  } catch (err) {
    console.error(`[bot] Unhandled error in message handler: ${err.stack || err.message}`);
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('[bot] Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[bot] Uncaught exception:', err);
});

client.login(config.token).catch((err) => {
  console.error(`[bot] Login failed: ${err.message}`);
  process.exit(1);
});
