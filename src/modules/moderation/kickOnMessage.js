const { PermissionsBitField } = require('discord.js');
const config = require('../../config');

function isExempt(member) {
  if (!member) return true;
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}

async function deleteMessage(message) {
  try {
    if (message.deletable) await message.delete();
  } catch {}
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
  } catch {}
}

async function kickMember(member) {
  if (!member.kickable) return false;

  try {
    await member.kick(config.kickReason);
    return true;
  } catch {
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
