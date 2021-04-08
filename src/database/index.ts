import { GuildDB } from './guild'
import { UserDB } from './user'

import mongoose from 'mongoose'

/**
 * Database options
 *
 * Can be either connection string
 * or authentication details
 */
export type DBOptions = string | {
  ip: string
  port: number
  options?: string
  username?: string
  password?: string
}

/**
 * Database handler
 *
 * Handles databse connection, pretty cool right?
 * @example
 * const db = new DB('mongodb://localhost:27017/bottum')
 *
 * // some more code somewhere else
 * db.guildDB.getPrefix('264445053596991498') // '-'
 * db.userDB.getOwner('277183033344524288') // true
 */
export class DB {
  guildDB = new GuildDB()
  userDB = new UserDB()

  constructor (private readonly options: DBOptions) {
    const connectionString = typeof options === 'string'
      ? options
      : 'mongodb://' +
        `${options.username && options.password ? `${options.username}:${options.password}@` : ''}` +
        `${options.ip ? options.ip : 'localhost'}` +
        ':' +
        `${options.port ? options.port : '27017'}` +
        `${options.options ? options.options : ''}`

    mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
      .then(() => { console.log('Connected to MongoDB') })
      .catch(() => { console.warn('Connection to MonogoDB failed') })
  }
}
