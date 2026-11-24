import type { HttpClient } from '../../../shared/http/HttpClient'
import type { AuthGateway, AuthenticatedSession } from '../application/AuthGateway'
import type { ProfileUpdate, Registration, User } from '../domain/User'

interface UserDto {
  id: number
  nome: string
  email: string
  telefone?: string
  role: 'ADMIN' | 'ALUNO'
  ativo: boolean
  dataCadastro: string
}

export class HttpAuthGateway implements AuthGateway {
  constructor(private readonly http: HttpClient) {}

  async authenticate(email: string, password: string): Promise<AuthenticatedSession> {
    const authorization = `Basic ${encodeBasicCredentials(email, password)}`
    const dto = await this.http.request<UserDto>('/api/usuarios/me', {
      headers: { Authorization: authorization },
    })
    return { user: mapUser(dto), authorization }
  }

  async register(registration: Registration): Promise<void> {
    await this.http.request<UserDto>('/api/usuarios', {
      method: 'POST',
      body: {
        nome: registration.name,
        email: registration.email,
        senha: registration.password,
        telefone: registration.phone,
      },
    })
  }

  async updateProfile(profile: ProfileUpdate): Promise<User> {
    const dto = await this.http.request<UserDto>('/api/usuarios/me', {
      method: 'PUT',
      body: { nome: profile.name, telefone: profile.phone || null },
    })
    return mapUser(dto)
  }

  async deactivate(userId: number): Promise<void> {
    await this.http.request<void>(`/api/usuarios/${userId}`, { method: 'DELETE' })
  }
}

function mapUser(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.nome,
    email: dto.email,
    phone: dto.telefone,
    role: dto.role,
    active: dto.ativo,
    registeredAt: dto.dataCadastro,
  }
}

function encodeBasicCredentials(email: string, password: string) {
  const bytes = new TextEncoder().encode(`${email}:${password}`)
  let binary = ''
  bytes.forEach(byte => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}
