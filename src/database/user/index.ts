import { Cache } from '@jpbberry/cache'
import { Snowflake } from 'discord-api-types'
import { Schema, model } from 'mongoose'

interface UserDoc {
  id: Snowflake
  blacklisted: boolean
  owner: boolean
}

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  blacklisted: { type: Boolean, default: false },
  owner: { type: Boolean, default: false }
})

const userModel = model('users', UserSchema)

/**
 * Guild DB
 * @example
 * const userDB = new UserDB()
 * userDB.getOwner('277183033344524288')
 *   .then(console.log) // "true"
 *   .catch(() => { })
 */
export class UserDB {
  cache: Cache<Snowflake, UserDoc>

  constructor () {
    this.cache = new Cache(15 * 60 * 1000)
  }

  /**
   * Get a user's document from the DB
   * @param id User ID
   */
  public async getUser (id: Snowflake): Promise<UserDoc> {
    const fromCache = this.cache.get(id)
    if (fromCache) return fromCache

    const fromDB: UserDoc = await userModel.findOne({ id }).lean()
    if (fromDB) {
      this.cache.set(id, fromDB)
      return fromDB
    }

    return {
      id,
      blacklisted: false,
      owner: false
    }
  }

  /**
   * Update a user in the DB
   * @param doc Already-existing user document
   */
  public async updateUser (doc: UserDoc): Promise<void> {
    const id = doc.id
    this.cache.set(id, doc)

    await userModel.findOneAndUpdate({ id: doc.id }, doc, { upsert: true })
  }

  /**
   * Get whether a user is owner or not
   * @param id user ID
   */
  public async getOwner (id: Snowflake): Promise<boolean> {
    const userData = await this.getUser(id)
    return userData.owner
  }

  /**
   * Set someone as owner of the bot
   * @param id user ID
   * @param value Whether they are owner or not
   */
  public async setOwner (id: Snowflake, value: boolean): Promise<void> {
    const userData = await this.getUser(id)
    userData.owner = value
    await this.updateUser(userData)
  }

  /**
   * Get whether a user is blacklisted or not
   * @param id User iD
   */
  public async getBlacklisted (id: Snowflake): Promise<boolean> {
    const userData = await this.getUser(id)
    return userData.blacklisted
  }

  /**
   * Blacklist someone from the bot
   * @param id User ID
   * @param value Blacklist or not
   */
  public async setBlacklisted (id: Snowflake, value: boolean): Promise<void> {
    const userData = await this.getUser(id)
    userData.blacklisted = value
    await this.updateUser(userData)
  }
}
