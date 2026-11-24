import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthService } from '../application/AuthService'
import type { ProfileUpdate, Registration, User } from '../domain/User'

interface AuthContextValue {
  user: User | null
  signIn(email: string, password: string): Promise<void>
  register(registration: Registration): Promise<void>
  updateProfile(profile: ProfileUpdate): Promise<void>
  deactivate(): Promise<void>
  signOut(): void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ service, children }: { service: AuthService; children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => service.onSessionExpired(() => setUser(null)), [service])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    async signIn(email, password) { setUser(await service.signIn(email, password)) },
    async register(registration) { setUser(await service.register(registration)) },
    async updateProfile(profile) { setUser(await service.updateProfile(profile)) },
    async deactivate() { if (user) { await service.deactivate(user.id); setUser(null) } },
    signOut() { service.signOut(); setUser(null) },
  }), [service, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return value
}
