import { CommandContext } from '../lib/CommandContext'

export default () => {
  return async (ctx: CommandContext) => {
    const isOwner = !!await ctx.worker.db.userDB.getOwner(ctx.message.author.id)
    if (isOwner && ctx.flags.idc) return true

    const perms = ctx.command.permissions
    if ((perms == null) || perms.length === 0) return true

    const hasPerms = perms.every((perm: any) => ctx.hasPerms(perm))
    if (hasPerms) return true

    const guildData = await ctx.worker.db.guildDB.getGuild(ctx.id)
    if (guildData.options.no_permissions) {
      await ctx.respond('MISSING_PERMISSIONS', {}, perms.join(', '))
    }
    return false
  }
}
