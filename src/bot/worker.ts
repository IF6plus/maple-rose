import { Worker } from './lib/Worker'
import { resolve } from 'path'

import config from '../config.json'

const worker = new Worker({
  mongo: config.MONGO
})

worker.loadCommands(resolve(__dirname, 'commands'))
worker.loadMiddlewares(resolve(__dirname, 'middleware'))
