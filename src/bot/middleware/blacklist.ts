import { CommandContext } from '../lib/CommandContext'

export default () => {
  return async (ctx: CommandContext): Promise<boolean> => {
    const isBlacklisted = await ctx.worker.db.userDB.getBlacklisted(ctx.message.author.id)
    return !isBlacklisted
  }
}
