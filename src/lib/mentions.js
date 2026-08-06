function normalizeChannelName(name) {
  return name.toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

async function resolveMentions(text, guild) {
  if (!guild || !text) return text;

  const out = text.replace(/(?<!<)#([a-z0-9_-]+)/gi, (match, name) => {
    const wanted = name.toLowerCase();
    const channel = guild.channels.cache.find((c) => {
      if (!c.name) return false;
      return c.name.toLowerCase() === wanted || normalizeChannelName(c.name) === wanted;
    });
    return channel ? `<#${channel.id}>` : match;
  });

  if (!out.includes('@')) return out;

  if (/@(?!everyone\b)(?!here\b)[a-z0-9_.]/i.test(out)) {
    await guild.members.fetch().catch(() => {});
  }

  const names = [];
  for (const role of guild.roles.cache.values()) {
    if (role.id !== guild.id) {
      names.push({ key: role.name.toLowerCase(), mention: `<@&${role.id}>` });
    }
  }
  for (const member of guild.members.cache.values()) {
    names.push({ key: member.displayName.toLowerCase(), mention: `<@${member.id}>` });
    names.push({ key: member.user.username.toLowerCase(), mention: `<@${member.id}>` });
  }
  names.sort((a, b) => b.key.length - a.key.length);

  let result = '';
  let i = 0;
  while (i < out.length) {
    if (out[i] !== '@') {
      result += out[i];
      i += 1;
      continue;
    }

    const rest = out.slice(i + 1);
    const lower = rest.toLowerCase();
    if (lower.startsWith('everyone') || lower.startsWith('here')) {
      result += '@';
      i += 1;
      continue;
    }

    const hit = names.find((n) => {
      if (!n.key || !lower.startsWith(n.key)) return false;
      const after = rest[n.key.length];
      return after === undefined || !/[a-z0-9]/i.test(after);
    });

    if (hit) {
      result += hit.mention;
      i += 1 + hit.key.length;
    } else {
      result += '@';
      i += 1;
    }
  }

  return result;
}

module.exports = { resolveMentions };
