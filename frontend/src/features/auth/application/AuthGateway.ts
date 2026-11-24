import type { ProfileUpdate, Registration, User } from '../domain/User'

export interface AuthenticatedSession {
  user: User
  authorization: string
}

export interface AuthGateway {
  authenticate(email: string, password: string): Promise<AuthenticatedSession>
  register(registration: Registration): Promise<void>
  updateProfile(profile: ProfileUpdate): Promise<User>
  deactivate(userId: number): Promise<void>
}

export interface CredentialStore {
  setAuthorization(value: string | null): void
  subscribe(listener: () => void): () => void
}
