export type HostInfo = { name: string; color: string }

declare module 'claude-code' {
  interface PluginState {
    'host-colors': { host: HostInfo | null }
  }
}
