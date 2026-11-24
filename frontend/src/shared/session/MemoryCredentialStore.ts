import type { CredentialProvider } from '../http/HttpClient'

export class MemoryCredentialStore implements CredentialProvider {
  private authorization: string | null = null
  private readonly listeners = new Set<() => void>()

  getAuthorization() {
    return this.authorization
  }

  setAuthorization(value: string | null) {
    this.authorization = value
  }

  expire() {
    if (!this.authorization) return
    this.authorization = null
    this.listeners.forEach(listener => listener())
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
