import { CommandOptions } from 'discord-rose'

import util from 'util'

/**
 * Clean a string
 * @param text String
 */
function clean (text: string): string {
  if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
}

export default {
  command: 'eval',
  aliases: ['ev'],
  owner: true,
  exec: async (ctx) => {
    const worker = ctx.worker

    try {
      const code = ctx.message.content.slice(Number(ctx.prefix.length) + Number(ctx.ran.length) + 1).split(' ').filter(e => !e.startsWith('-')).join(' ')

      let evaled: string | string[] | Promise<any>

      if (ctx.flags.m) evaled = await worker.comms.masterEval(code)
      else if (ctx.flags.b) evaled = await worker.comms.broadcastEval(code)
      // eslint-disable-next-line no-eval
      else evaled = eval(code)

      if (evaled && evaled instanceof Promise) evaled = await evaled

      if (typeof evaled !== 'string') { evaled = util.inspect(evaled) }

      if (ctx.flags.silent) return

      await ctx.embed
        .color(ctx.worker.colors.GREEN)
        .title(await ctx.lang('CMD_EVAL_SUCCESS'))
        .description(`\`\`\`xl\n${evaled}\`\`\``)
        .send()
    } catch (err) {
      await ctx.embed
        .color(ctx.worker.colors.RED)
        .title(await ctx.lang('CMD_EVAL_FAIL'))
        .description(`\`\`\`xl\n${clean(err)}\`\`\``)
        .send()
        .catch(() => {})
    }
  }
} as CommandOptions
