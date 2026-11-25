import type { AuthGateway, CredentialStore } from './AuthGateway'
import type { ProfileUpdate, Registration, User } from '../domain/User'

export class AuthService {
  constructor(
    private readonly gateway: AuthGateway,
    private readonly credentials: CredentialStore,
  ) {}

  async signIn(email: string, password: string): Promise<User> {
    const session = await this.gateway.authenticate(email.trim(), password)
    this.credentials.setAuthorization(session.authorization)
    return session.user
  }

  async register(registration: Registration): Promise<User> {
    await this.gateway.register(registration)
    return this.signIn(registration.email, registration.password)
  }

  async restore(): Promise<User | null> {
    if (!this.credentials.getAuthorization()) return null
    try { return await this.gateway.restore() }
    catch { this.signOut(); return null }
  }

  signOut() {
    this.credentials.setAuthorization(null)
  }

  updateProfile(profile: ProfileUpdate) {
    return this.gateway.updateProfile(profile)
  }

  async deactivate(userId: number) {
    await this.gateway.deactivate(userId)
    this.signOut()
  }

  onSessionExpired(listener: () => void) {
    return this.credentials.subscribe(listener)
  }
}
