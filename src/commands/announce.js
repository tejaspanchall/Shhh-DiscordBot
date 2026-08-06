const {
  SlashCommandBuilder,
  ChannelType,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
} = require('discord.js');
const config = require('../config');
const { resolveMentions } = require('../lib/mentions');

const customIdPrefix = 'announce';

const data = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('Send a message or announcement to a channel')
  .setDefaultMemberPermissions(0)
  .setDMPermission(false)
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('The text to send (leave empty for a multi-line popup)')
      .setRequired(false)
      .setMaxLength(2000))
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('Target channel (defaults to the current one)')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setRequired(false));

async function send(interaction, channel, text) {
  try {
    await channel.send(await resolveMentions(text, channel.guild));
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

async function execute(interaction) {
  if (interaction.user.id !== config.ownerId) {
    return interaction.reply({
      content: 'You are not authorized to use this command.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const channel = interaction.options.getChannel('channel') ?? interaction.channel;
  if (!channel?.isTextBased()) {
    return interaction.reply({
      content: 'That channel cannot receive messages.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const message = interaction.options.getString('message');
  if (message) {
    return send(interaction, channel, message);
  }

  const modal = new ModalBuilder()
    .setCustomId(`${customIdPrefix}:${channel.id}`)
    .setTitle('Announce')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('text')
          .setLabel('Message')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(2000),
      ),
    );

  return interaction.showModal(modal);
}

async function handleModal(interaction) {
  if (interaction.user.id !== config.ownerId) {
    return interaction.reply({
      content: 'You are not authorized to use this command.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const [, channelId] = interaction.customId.split(':');
  const text = interaction.fields.getTextInputValue('text');

  try {
    const channel = await interaction.client.channels.fetch(channelId);
    return send(interaction, channel, text);
  } catch (err) {
    return interaction.reply({
      content: `Failed to send: ${err.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = { data, execute, handleModal, customIdPrefix };
