import { CommandOptions } from 'discord-rose'

export default {
  command: 'embeds',
  permissions: ['manageMessages'],
  exec: async (ctx) => {
    const guildData = await ctx.worker.db.guildDB.getGuild(ctx.id)
    guildData.options.embeds = !guildData.options.embeds
    await ctx.worker.db.guildDB.updateGuild(guildData)
    await ctx.respond(guildData.options.embeds ? 'CMD_EMBEDS_ENABLED' : 'CMD_EMBEDS_DISABLED')
  }
} as CommandOptions
