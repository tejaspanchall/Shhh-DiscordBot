# Shhh - Discord Bot 🤫

Kicks any non-admin user who posts in a restricted channel. Deletes their message and DMs them a rejoin invite first.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

The bot auto-registers the `/announce` command on startup — no separate deploy step. Set `GUILD_ID` for instant registration in that one server; leave it blank to register globally (may take up to an hour to appear).

Tip: enable **Developer Mode** in Discord (User Settings → Advanced) to copy channel IDs.

## Discord Portal

At <https://discord.com/developers/applications>:

1. Create an app, open the **Bot** tab, copy the token into `.env`.
2. Enable **Server Members** and **Message Content** intents.
3. Invite the bot via **OAuth2 → URL Generator** with scopes `bot` and `applications.commands`, and permissions: View Channels, Send Messages, Manage Messages, Kick Members.
4. Make sure the bot's role sits **above** the users it needs to kick.

## Bot Name, Icon & Description

All set in the Developer Portal, **General Information** tab — not in code:

- **Name** and **App Icon** — shown everywhere.
- **Description** — shown on the bot's profile.
- **Per-server nickname** — right-click the bot in your server → **Edit Server Profile**.

## Announcements

Use `/announce` to have the bot post a message to a channel:

- `message` — the text to send (optional; leave it empty to get a multi-line popup where Enter makes new lines).
- `channel` — where to send it (optional; defaults to the current channel).

To reply to a specific message, right-click it → **Apps → Reply**. To edit a message the bot sent, right-click it → **Apps → Edit**. Both open a multi-line popup. (Bots can only edit their own messages.)

Locked to you alone: set `OWNER_ID` to your own Discord user ID. Only that user can run the command — anyone else is rejected, and the command is hidden from non-admins. Set `GUILD_ID` to register it to a single server (instant); leave it blank to register globally (works everywhere, may take up to an hour to appear).

## How It Works

1. Ignores bots and Administrators.
2. Only acts on messages in `TARGET_CHANNEL_ID`.
3. Deletes the message → DMs the user → kicks them.
4. Logs each step to the console.

## Common Issues

- **Kick fails with hierarchy warning** — move the bot's role above the user's.
- **Bot ignores messages** — check `TARGET_CHANNEL_ID`.
- **Disallowed intents error** — enable the two intents in the portal.

---

> ⚠️ **For fun purposes only.** This bot is a personal / joke project — not intended for serious moderation.
