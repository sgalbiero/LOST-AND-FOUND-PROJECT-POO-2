export type ClaimStatus = 'PENDENTE' | 'ACEITA' | 'RECUSADA' | 'CANCELADA'

export interface Claim {
  id: number
  itemId: number
  itemTitle: string
  claimant: { id: number; name: string }
  justification: string
  status: ClaimStatus
  createdAt: string
  answeredAt?: string
}
