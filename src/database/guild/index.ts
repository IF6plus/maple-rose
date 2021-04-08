import { Cache } from '@jpbberry/cache'
import { Snowflake } from 'discord-api-types'
import { Schema, model } from 'mongoose'

interface GuildDoc {
  id: Snowflake
  options: {
    prefix: string
    embeds: boolean
    no_permissions: boolean
    lang: string
  }
}

const GuildSchema = new Schema({
  id: { type: String, required: true, unique: true },
  options: {
    prefix: { type: String, default: '-' },
    embeds: { type: Boolean, default: true },
    no_permissions: { type: Boolean, default: true },
    lang: { type: String, default: 'en-US' }
  }
})

const guildModel = model('guilds', GuildSchema)

/**
 * Guild DB
 * @example
 * const guildDB = new GuildDB()
 * guildDB.getPrefix('264445053596991498')
 *   .then(console.log) // "-"
 *   .catch(() => { })
 */
export class GuildDB {
  cache: Cache<Snowflake, GuildDoc>

  constructor () {
    this.cache = new Cache(15 * 60 * 1000)
  }

  /**
   * Get a guild's document from the DB
   * @param id Guild ID
   */
  public async getGuild (id: Snowflake): Promise<GuildDoc> {
    const fromCache = this.cache.get(id)
    if (fromCache) return fromCache

    const fromDB: GuildDoc = await guildModel.findOne({ id }).lean()
    if (fromDB) {
      this.cache.set(id, fromDB)
      return fromDB
    }

    return {
      id,
      options: {
        embeds: true,
        lang: 'en-US',
        no_permissions: true,
        prefix: '-'
      }
    }
  }

  /**
   * Update a guild in the DB
   * @param doc Already-existing guild document
   */
  public async updateGuild (doc: GuildDoc): Promise<void> {
    const id = doc.id
    this.cache.set(id, doc)

    await guildModel.findOneAndUpdate({ id: doc.id }, doc, { upsert: true })
  }

  /**
   * Get a guild's prefix
   * @param id Guild ID
   */
  public async getPrefix (id: Snowflake): Promise<string> {
    const guildData = await this.getGuild(id)
    return guildData.options.prefix
  }

  /**
   * Set a guild's prefix
   * @param id Guild ID
   * @param prefix New prefix
   */
  public async setPrefix (id: Snowflake, prefix: string): Promise<void> {
    const guildData = await this.getGuild(id)
    guildData.options.prefix = prefix
    await this.updateGuild(guildData)
  }

  /**
   * Get whether or not to use embeds
   * @param id Guild ID
   */
  public async getEmbeds (id: Snowflake): Promise<boolean> {
    const guildData = await this.getGuild(id)
    return guildData.options.embeds
  }
}
