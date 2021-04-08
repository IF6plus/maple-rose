import { APIUser } from 'discord-api-types'

/**
 * Function to escape code [stolen from here](https://stackoverflow.com/questions/39542872/escaping-discord-subset-of-markdown)
 * @param text String to be escaped
 * @example
 * escapeMarkdown('**kekw**')
 * // "\*\*kekw\*\*"
 */
export function escapeMarkdown (text: string): string {
  const unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1')
  const escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1')
  return escaped
}

/**
 * Get the user's avatar
 * @param user The user to get the avatar from
 * @example
 * getAvatar(ctx.message.author, 'gif', 128)
 * // "https://cdn.discordapp.com/avatars/277183033344524288/a_43cdc799c6f0c6281f771ecfa49fb329.png?size=128"
 */
export function getAvatar (user: APIUser, type: string = 'png', size: number = 128): string {
  if (user.avatar !== null) return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${type}?size=${size}`
  return `https://cdn.discordapp.com/embed/avatars/${BigInt(user.discriminator) % BigInt(5)}.png`
}

/**
 * Format the time broski
 * @param time how long in milliseconds
 * @example
 * formatTime(12308920)
 * // "3 hours, 25 minutes and 8 seconds"
 */
export function formatTime (time: number): string {
  let hours = 0
  let minutes = 0
  let seconds = 0

  // Hours
  while (time > 3600000) {
    hours++
    time = time - 3600000
  }

  // Minutes
  while (time > 60000) {
    minutes++
    time = time - 60000
  }

  // Seconds
  while (time > 1000) {
    seconds++
    time = time - 1000
  }

  const h = `${hours === 0 ? '' : `${hours} hour${hours > 1 ? 's' : ''}, `}`
  const m = `${minutes === 0 ? '' : `${minutes} minute${minutes > 1 ? 's' : ''}${hours === 0 ? ', and' : ' and'} `}`
  const s = `${seconds > 1 ? seconds : 1} second${seconds > 1 ? 's' : ''}`

  return h + m + s
}
