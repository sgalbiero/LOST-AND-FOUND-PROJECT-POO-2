export type UserRole = 'ADMIN' | 'ALUNO'

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: UserRole
  active: boolean
  registeredAt: string
}

export interface Registration {
  name: string
  email: string
  password: string
  phone?: string
}

export interface ProfileUpdate {
  name: string
  phone?: string
}
