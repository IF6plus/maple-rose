import { CommandContext } from '../lib/CommandContext'

export default () => {
  return async (ctx: CommandContext): Promise<boolean> => {
    if (!ctx.command.owner) return true
    const isOwner = await ctx.worker.db.userDB.getOwner(ctx.message.author.id)
    if (isOwner) return true
    await ctx.respond('NOT_OWNER', { error: true }, ctx.command.command as string)
    return false
  }
}
