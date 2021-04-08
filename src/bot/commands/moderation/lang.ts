import { CommandOptions } from 'discord-rose'

export default {
  command: 'lang',
  permissions: ['manageMessages'],
  exec: async (ctx) => {
    if (!ctx.args[0]) {
      await ctx.respond('CURRENT_LANGUAGE')
      return
    }

    const lang = ctx.args[0]
    if (!ctx.worker.langs.langs.has(lang)) {
      await ctx.respond('LANGUAGE_NOT_EXIST', { error: true }, lang)
      return
    }

    const guildData = await ctx.worker.db.guildDB.getGuild(ctx.id)
    guildData.options.lang = lang
    await ctx.worker.db.guildDB.updateGuild(guildData)

    await ctx.respond('UPDATED_LANGUAGE', {}, lang)
  }
} as CommandOptions
