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
const { resolveMentions } = require('../lib/mentions');

const customIdPrefix = 'edit';

const data = new ContextMenuCommandBuilder()
  .setName('Edit')
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

  if (interaction.targetMessage.author.id !== interaction.client.user.id) {
    return interaction.reply({
      content: 'I can only edit messages I sent.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const modal = new ModalBuilder()
    .setCustomId(`${customIdPrefix}:${interaction.channelId}:${interaction.targetId}`)
    .setTitle('Edit message')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('text')
          .setLabel('New message')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(2000)
          .setValue(interaction.targetMessage.content || ''),
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
    await target.edit(await resolveMentions(text, channel.guild));
    return interaction.reply({
      content: 'Message edited.',
      flags: MessageFlags.Ephemeral,
    });
  } catch (err) {
    return interaction.reply({
      content: `Failed to edit: ${err.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

module.exports = { data, execute, handleModal, customIdPrefix };
