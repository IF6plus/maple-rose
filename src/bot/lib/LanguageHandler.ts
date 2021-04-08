import fs from 'fs'
import path from 'path'

import { Snowflake } from 'discord-api-types'
import { Worker } from './Worker'

interface Language {
  [key: string]: string
}

/**
 * Language Handler, handles the different languages
 * @example
 * const handler = new LanguageHandler(worker)
 * handler.getString('264445053596991498', 'HELP') // "yardim"
 */
export class LanguageHandler {
  langs: Map<string, Language> = new Map()

  constructor (private readonly worker: Worker) {
    this.init()
  }

  /**
   * Get a formatted language string
   * @param id Guild ID
   * @param name Name of the string
   * @param args arguments to replace in the string
   * @example
   * handler.getString('264445053596991498', 'HELP') // "yardim"
   * handler.getString('264445053596991498', 'WEEB') // "<@116930717241311236> weeb"
   */
  public async getString (id: Snowflake, name: string, ...args: string[]): Promise<string> {
    const lang = await this.getLang(id)
    const string = this.langs.get(lang)?.[name] ?? `\`${name}\` is not localized for \`${lang}\``
    return this.formatString(string, ...args)
  }

  /**
   * Reload the language handler
   */
  public reload (): void {
    this.unloadLangs()
    this.loadLangs()
  }

  private init (): void {
    this.loadLangs()
  }

  private loadLangs (): void {
    const files = fs.readdirSync(path.resolve(__dirname, '../', 'lang'), { withFileTypes: true })
      .filter(file => file.name.endsWith('.js'))
    for (const file of files) {
      const filePath = path.resolve(__dirname, '../', 'lang', file.name)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const language = require(filePath)
      this.langs.set(file.name.split('.').slice(0, -1).join('.'), language)
    }
  }

  private unloadLangs (): void {
    const files = fs.readdirSync(path.resolve(__dirname, '../', 'lang'), { withFileTypes: true })
    for (const file of files) {
      const filePath = path.resolve(__dirname, '../', 'lang', file.name)
      delete require.cache[require.resolve(filePath)]
      this.langs.delete(file.name)
    }
  }

  private formatString (string: string, ...args: string[]): string {
    return string.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] !== 'undefined' ? args[number] : match
    })
  }

  private async getLang (id: Snowflake): Promise<string> {
    const guildData = await this.worker.db.guildDB.getGuild(id)
    return guildData.options.lang ?? 'en-US'
  }
}
