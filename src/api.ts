import type { CueState } from './state.js'

// Thin HTTP client for the CuePlayer control API. Node 18+ global fetch.
export class CueApi {
  private base: string

  constructor(host: string, port: number, private token: string) {
    this.base = `http://${host}:${port}`
  }

  private headers(): Record<string, string> {
    return this.token ? { 'X-Auth-Token': this.token } : {}
  }

  private get(path: string): Promise<Response> {
    return fetch(this.base + path, {
      headers: this.headers(),
      signal: AbortSignal.timeout(2500),
    })
  }

  async fetchState(): Promise<CueState> {
    const r = await this.get('/state')
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return (await r.json()) as CueState
  }

  async cmd(path: string): Promise<void> {
    const r = await this.get(path)
    if (!r.ok) throw new Error('HTTP ' + r.status)
  }
}
