export type MediationStatus = 'PENDENTE' | 'EM_ANDAMENTO' | 'RESOLVIDO'

export interface Mediation {
  id: number
  itemId: number
  itemTitle: string
  requester: { id: number; name: string }
  assignedAdmin?: { id: number; name: string }
  reason: string
  status: MediationStatus
  requestedAt: string
  resolvedAt?: string
  resolution?: string
}

export interface Report {
  id: number
  reporter: { id: number; name: string }
  itemId?: number
  messageId?: number
  reason: string
  resolved: boolean
  createdAt: string
}

export interface ManagedOption {
  id: number
  name: string
  description?: string
  active: boolean
}
