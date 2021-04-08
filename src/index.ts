// Config
import config from './config.json'

// Required shit
import { Master } from 'discord-rose'
import path from 'path'

const master = new Master(path.resolve(__dirname, './bot/worker.js'), {
  token: config.DISCORD_TOKEN,
  shards: 'auto',
  intents: 32767,
  cache: {
    members: true,
    users: true
  }
})

master.start()
  .then(() => {})
  .catch(() => {})
