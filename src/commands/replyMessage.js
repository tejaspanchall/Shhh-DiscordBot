const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
} = require('discord.js');
const config = require('../config');

const customIdPrefix = 'reply';

const data = new ContextMenuCommandBuilder()
  .setName('Reply')
  .setType(ApplicationCommandType.Message)
  .setDefaultMemberPermissions(0)
  .setDMPermission(false);

async function execute(interaction) {
  if (interaction.user.id !== config.ownerId) {
    return interaction.reply({
      content: 'You are not authorized to use this command.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const modal = new ModalBuilder()
    .setCustomId(`${customIdPrefix}:${interaction.channelId}:${interaction.targetId}`)
    .setTitle('Reply')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('text')
          .setLabel('Your reply')
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

  const [, channelId, messageId] = interaction.customId.split(':');
  const text = interaction.fields.getTextInputValue('text');

  try {
    const channel = await interaction.client.channels.fetch(channelId);
    const target = await channel.messages.fetch(messageId);
    await target.reply(text);
    return interaction.reply({
      content: 'Reply sent.',
      flags: MessageFlags.Ephemeral,
    });
  } catch (err) {
    return interaction.reply({
      content: `Failed to send reply: ${err.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = { data, execute, handleModal, customIdPrefix };
