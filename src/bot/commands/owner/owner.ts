import { Snowflake } from 'discord-api-types'
import { CommandOptions } from 'discord-rose'

export default {
  command: 'owner',
  aliases: ['owo'],
  owner: true,
  exec: async (ctx) => {
    const userID = (ctx.args[0] || '').replace(/[<@!>]/g, '') as Snowflake

    if (!userID) {
      await ctx.respond('USER_NOT_FOUND', { error: true })
      return
    }

    if (userID === ctx.message.author.id) {
      await ctx.respond('CANT_DO_THIS', { error: true })
      return
    }

    const isOwner = await ctx.worker.db.userDB.getOwner(userID)
    await ctx.worker.db.userDB.setOwner(userID, !isOwner)

    await ctx.respond(!isOwner ? 'OWNER_ADDED' : 'OWNER_REMOVED', {}, userID)
  }
} as CommandOptions
