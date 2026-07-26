const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const config = require('./config');
const kickOnMessage = require('./modules/moderation/kickOnMessage');
const announce = require('./commands/announce');
const replyMessage = require('./commands/replyMessage');
const editMessage = require('./commands/editMessage');

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

client.once(Events.ClientReady, async (c) => {
  console.log(`[bot] Logged in as ${c.user.tag}. Watching channel ${config.targetChannelId}.`);
  try {
    await c.application.commands.set(
      [announce.data.toJSON(), replyMessage.data.toJSON(), editMessage.data.toJSON()],
      config.guildId || undefined,
    );
    console.log(`[bot] Registered commands ${config.guildId ? `to guild ${config.guildId}` : 'globally'}.`);
  } catch (err) {
    console.error(`[bot] Failed to register /announce: ${err.stack || err.message}`);
  }
});

client.on(Events.MessageCreate, async (message) => {
  try {
    await kickOnMessage.handleMessage(message);
  } catch (err) {
    console.error(`[bot] Unhandled error in message handler: ${err.stack || err.message}`);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === announce.data.name) await announce.execute(interaction);
    } else if (interaction.isMessageContextMenuCommand()) {
      if (interaction.commandName === replyMessage.data.name) await replyMessage.execute(interaction);
      else if (interaction.commandName === editMessage.data.name) await editMessage.execute(interaction);
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith(`${announce.customIdPrefix}:`)) await announce.handleModal(interaction);
      else if (interaction.customId.startsWith(`${replyMessage.customIdPrefix}:`)) await replyMessage.handleModal(interaction);
      else if (interaction.customId.startsWith(`${editMessage.customIdPrefix}:`)) await editMessage.handleModal(interaction);
    }
  } catch (err) {
    console.error(`[bot] Error handling interaction: ${err.stack || err.message}`);
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
