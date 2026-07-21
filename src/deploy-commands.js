require('dotenv').config();
const { REST, Routes } = require('discord.js');
const announce = require('./commands/announce');

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!TOKEN || !CLIENT_ID) {
  console.error('[deploy] Missing required environment variables: TOKEN, CLIENT_ID');
  process.exit(1);
}

const commands = [announce.data.toJSON()];
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    const route = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
      : Routes.applicationCommands(CLIENT_ID);
    const registered = await rest.put(route, { body: commands });
    console.log(`[deploy] Registered ${registered.length} command(s) ${GUILD_ID ? `to guild ${GUILD_ID}` : 'globally'}.`);
  } catch (err) {
    console.error(`[deploy] Failed: ${err.message}`);
    process.exit(1);
  }
})();
