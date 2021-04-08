import { CommandOptions, Worker as Wkr } from 'discord-rose'
import fs from 'fs'

import flagsMiddleware from '@discord-rose/flags-middleware'

import { LanguageHandler } from './LanguageHandler'
import { DB, DBOptions } from '../../database'
import { CommandContext } from './CommandContext'
import { colors } from './colors'

import { getAvatar } from '../../utils'

interface WorkerOptions {
  mongo: DBOptions
}

/**
 * Worker class
 * @example
 * const worker = new Worker()
 */
export class Worker extends Wkr {
  langs: LanguageHandler
  db: DB

  colors = colors

  /**
   * Create the bot
   * @param options The options lol
   */
  constructor (options: WorkerOptions) {
    super()

    this.db = new DB(options.mongo)
    this.langs = new LanguageHandler(this)

    this.commands.CommandContext = CommandContext
    this.commands.middleware(flagsMiddleware())
    this.commands.options({
      bots: false,
      caseInsensitiveCommand: true,
      caseInsensitivePrefix: true,
      mentionPrefix: true
    })

    this.commands.prefix(async (msg) => {
      const id = msg.guild_id ?? msg.author.id
      return await this.db.guildDB.getPrefix(id)
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.commands.error(async (ctx, err) => {
      const embed = ctx.embed

      if (err.nonFatal) {
        embed
          .title(err.message)
      } else {
        embed
          .author('Error: ' + err.message, getAvatar(ctx.message.author))
      }

      embed
        .color(ctx.worker.colors.RED)
        .send(true)
        .then(() => { })
        .catch(() => { })
    })
  }

  /**
   * Load many commands
   * @param dir Directory to search
   * @example
   * worker.loadCommands(path.resolve(__dirname, 'commands/'))
   */
  public loadCommands (dir: string): void {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      const filePath = dir + '/' + file.name
      if (file.isDirectory()) {
        this.loadCommands(filePath)
        continue
      }
      if (!file.name.endsWith('.js')) continue

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const required = require(filePath)
      const command: CommandOptions = required.default ? required.default : required
      this.commands.add(command)

      delete require.cache[require.resolve(filePath)]
    }
  }

  /**
   * Load many middlewares
   * @param dir Directory to search
   * @example
   * worker.loadMiddlewares(path.resolve(__dirname, 'middleware/'))
   */
  public loadMiddlewares (dir: string): void {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      const filePath = dir + '/' + file.name
      if (file.isDirectory()) {
        this.loadMiddlewares(filePath)
        continue
      }
      if (!file.name.endsWith('.js')) continue

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const required = require(filePath)
      const middleware = required.default ? required.default : required
      this.commands.middleware(middleware())

      delete require.cache[require.resolve(filePath)]
    }
  }

  /**
   * A nicely formatted memory stats
   * @example
   * worker.mem
   * // {
   * //  rss: '120.1MB',
   * //  heapTotal: '62.1MB',
   * //  heapUsed: '27.7MB',
   * //  external: '18.9MB',
   * //  arrayBuffers: '17.5MB'
   * //}
   */
  get mem (): NodeJS.MemoryUsage {
    return Object.entries(process.memoryUsage()).reduce<any>(function reduce (T, [K, V]) { T[K] = (V / (1024 ** 2)).toFixed(1) + 'MB'; return T }, {})
  }
}
