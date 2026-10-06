import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { HostInfo } from '../types'

// Hostname (lower-cased) to color. Edit this table to taste.
// A color is a terminal color name or a hex string such as "#ff8800".
const HOST_COLORS: Record<string, string> = {
  pliny: '#2fbf71',
  msi: '#d94fd1',
}

// Hosts not in the table get a stable color picked from this list.
const FALLBACK_COLORS = ['cyan', 'yellow', 'blue', 'red', 'green', 'magenta'] as const

const RULE = '━'.repeat(400)

const host = atom({ plugin: 'host-colors', key: 'host' } as const, null)

function pickColor(name: string): string {
  const known = HOST_COLORS[name.toLowerCase()]
  if (known) return known
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length] ?? 'cyan'
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    let name = 'unknown-host'
    try {
      const { exitCode, stdout } = await $.process.run(['hostname'], { timeoutMs: 5000 })
      const short = stdout.trim().split('.')[0]
      if (exitCode === 0 && short) name = short
    } catch {
      // keep the fallback name
    }
    const info: HostInfo = { name, color: pickColor(name) }
    await update($, host, () => info)
    return next(e)
  })

  // The bar above the prompt: a full-width colored rule carrying the host name.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const info = await read($, host)
    if (e.props.hasSurvey || info === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        <Text color={info.color} bold wrap="truncate">
          ━━ {info.name} {RULE}
        </Text>
      </Box>
    )
  })

  // The footer row: the engine's own mode labels, led by a colored host tag.
  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const info = await read($, host)
    const drawn = await next(e)
    if (info === null) return drawn

    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="row" gap={1}>
        <Text color={info.color} bold>
          ⬢ {info.name}
        </Text>
        {drawn}
      </Box>
    )
  })
}
