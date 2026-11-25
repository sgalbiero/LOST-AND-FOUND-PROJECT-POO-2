import type { CredentialProvider } from '../http/HttpClient'

const STORAGE_KEY = 'reencontra.authorization'

export class SessionCredentialStore implements CredentialProvider {
  private authorization = readSession()
  private readonly listeners = new Set<() => void>()

  getAuthorization() { return this.authorization }

  setAuthorization(value: string | null) {
    this.authorization = value
    if (value) sessionStorage.setItem(STORAGE_KEY, value)
    else sessionStorage.removeItem(STORAGE_KEY)
  }

  expire() {
    if (!this.authorization) return
    this.setAuthorization(null)
    this.listeners.forEach(listener => listener())
  }

  subscribe(listener: () => void) { this.listeners.add(listener); return () => this.listeners.delete(listener) }
}

function readSession() {
  try { return sessionStorage.getItem(STORAGE_KEY) }
  catch { return null }
}
