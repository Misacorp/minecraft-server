# Minecraft Server

A dedicated Minecraft server hosted on Fly.io. Can be started using via a Discord bot and Cloudflare workers.

### Features
- Automatically stops when no players are connected.
- Can be started via a Discord bot.
- Both Java and Bedrock edition players can connect.

## Development

The following section describes how to develop parts of this application.

### Install `flyctl`

Install the Fly.io CLI by following [their instructions](https://fly.io/docs/flyctl/install/). On a Mac with Homebrew this is as simple as:

```zsh
brew install flyctl
```

### Install Dependencies

Ensure you have `npm` and Node installed. Then, simply:

```bash
npm install
```

This will install Cloudflare's CLI [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), all the dependencies required to create a Discord bot, and everything else.

---

## Deployment

See `package.json` for deployment scripts.