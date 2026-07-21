const { SlashCommandBuilder, ChannelType, MessageFlags } = require('discord.js');
const config = require('../config');

const data = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('Send a message or announcement to a channel')
  .setDefaultMemberPermissions(0)
  .setDMPermission(false)
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('The text to send')
      .setRequired(true)
      .setMaxLength(2000))
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('Target channel (defaults to the current one)')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setRequired(false));

async function execute(interaction) {
  if (interaction.user.id !== config.ownerId) {
    return interaction.reply({
      content: 'You are not authorized to use this command.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const message = interaction.options.getString('message', true);
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;

  if (!channel?.isTextBased()) {
    return interaction.reply({
      content: 'That channel cannot receive messages.',
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    await channel.send(message);
    return interaction.reply({
      content: `Announcement sent to ${channel}.`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (err) {
    return interaction.reply({
      content: `Failed to send: ${err.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = { data, execute };
