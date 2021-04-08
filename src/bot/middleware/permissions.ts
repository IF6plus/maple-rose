import { CommandContext } from '../lib/CommandContext'

export default () => {
  return async (ctx: CommandContext) => {
    const perms = ctx.command.botPermissions
    if ((perms == null) || perms.length === 0) return true

    const hasPerms = perms.every((perm: any) => ctx.hasPerms(perm))
    if (hasPerms) return true

    await ctx.respond('MISSING_BOT_PERMISSIONS', {}, perms.join(', '))
    return false
  }
}
