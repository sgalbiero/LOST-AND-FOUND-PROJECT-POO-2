import { afterEach, describe, expect, it, vi } from 'vitest'
import { SessionCredentialStore } from './SessionCredentialStore'

describe('SessionCredentialStore', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('mantém a credencial quando a aplicação é recriada após F5', () => {
    const storage = new FakeStorage()
    vi.stubGlobal('sessionStorage', storage)
    const beforeReload = new SessionCredentialStore()
    beforeReload.setAuthorization('Basic token')

    const afterReload = new SessionCredentialStore()

    expect(afterReload.getAuthorization()).toBe('Basic token')
  })

  it('remove a credencial e avisa a aplicação quando a sessão expira', () => {
    const storage = new FakeStorage()
    vi.stubGlobal('sessionStorage', storage)
    const credentials = new SessionCredentialStore()
    const expired = vi.fn()
    credentials.subscribe(expired)
    credentials.setAuthorization('Basic token')

    credentials.expire()

    expect(credentials.getAuthorization()).toBeNull()
    expect(storage.getItem('reencontra.authorization')).toBeNull()
    expect(expired).toHaveBeenCalledOnce()
  })
})

class FakeStorage implements Storage {
  private readonly values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}
