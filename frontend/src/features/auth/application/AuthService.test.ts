import { describe, expect, it } from 'vitest'
import type { AuthGateway, AuthenticatedSession, CredentialStore } from './AuthGateway'
import { AuthService } from './AuthService'
import type { ProfileUpdate, Registration, User } from '../domain/User'

const session: AuthenticatedSession = {
  authorization: 'Basic token',
  user: { id: 1, name: 'Ana', email: 'ana@example.com', role: 'ALUNO', active: true, registeredAt: '2026-01-01T10:00:00' },
}

describe('AuthService', () => {
  it('mantém a credencial fora da camada de apresentação', async () => {
    const credentials = new FakeCredentialStore()
    const service = new AuthService(new FakeAuthGateway(), credentials)

    const user = await service.signIn(' ana@example.com ', 'segredo123')

    expect(user).toEqual(session.user)
    expect(credentials.value).toBe('Basic token')
  })

  it('remove a credencial ao sair', () => {
    const credentials = new FakeCredentialStore()
    credentials.setAuthorization('Basic token')
    const service = new AuthService(new FakeAuthGateway(), credentials)

    service.signOut()

    expect(credentials.value).toBeNull()
  })
})

class FakeCredentialStore implements CredentialStore {
  value: string | null = null
  setAuthorization(value: string | null) { this.value = value }
  subscribe(_listener: () => void) { return () => undefined }
}

class FakeAuthGateway implements AuthGateway {
  authenticate(): Promise<AuthenticatedSession> { return Promise.resolve(session) }
  register(_registration: Registration): Promise<void> { return Promise.resolve() }
  updateProfile(_profile: ProfileUpdate): Promise<User> { return Promise.resolve(session.user) }
  deactivate(_userId: number): Promise<void> { return Promise.resolve() }
}
