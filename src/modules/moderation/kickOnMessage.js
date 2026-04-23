const { PermissionsBitField } = require('discord.js');
const config = require('../../config');

function isExempt(member) {
  if (!member) return true;
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}

async function deleteMessage(message) {
  try {
    if (message.deletable) await message.delete();
  } catch (err) {
    console.warn(`[moderation] Failed to delete message ${message.id}: ${err.message}`);
  }
}

const GOODBYE_MESSAGES = [
  `You had one job. Here's another chance: {invite}`,
];

function buildGoodbyeMessage() {
  const template = GOODBYE_MESSAGES[Math.floor(Math.random() * GOODBYE_MESSAGES.length)];
  return template.replace('{invite}', config.inviteLink);
}

async function notifyUser(user) {
  try {
    await user.send(buildGoodbyeMessage());
  } catch (err) {
    console.log(`[moderation] Could not DM ${user.tag}: ${err.message}`);
  }
}

async function kickMember(member) {
  if (!member.kickable) {
    console.warn(`[moderation] Cannot kick ${member.user.tag} — insufficient permissions or role hierarchy.`);
    return false;
  }

  try {
    await member.kick(config.kickReason);
    console.log(`[moderation] Kicked ${member.user.tag} (${member.id}).`);
    return true;
  } catch (err) {
    console.error(`[moderation] Failed to kick ${member.user.tag}: ${err.message}`);
    return false;
  }
}

async function handleMessage(message) {
  if (message.author.bot) return;
  if (message.channelId !== config.targetChannelId) return;

  const member = message.member ?? (await message.guild?.members.fetch(message.author.id).catch(() => null));
  if (isExempt(member)) return;

  await deleteMessage(message);

  if (member) {
    await notifyUser(member.user);
    await kickMember(member);
  }
}

module.exports = { handleMessage };
