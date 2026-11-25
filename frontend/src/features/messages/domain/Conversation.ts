export interface ConversationUser { id: number; name: string }

export type ConversationClosureReason =
  | 'REIVINDICACAO_RECUSADA'
  | 'REIVINDICACAO_CANCELADA'
  | 'OUTRO_REIVINDICANTE_ACEITO'
  | 'SEM_DEVOLUCAO'
  | 'ITEM_DEVOLVIDO'
  | 'ITEM_CANCELADO'
  | 'ITEM_EXPIRADO'

export interface Conversation {
  id: number
  itemId: number
  itemTitle: string
  owner: ConversationUser
  interested: ConversationUser
  createdAt: string
  unreadCount: number
  ownerRequestedClosure: boolean
  interestedRequestedClosure: boolean
  closedAt?: string
  closedBySupport: boolean
  closureReason?: ConversationClosureReason
  mediation?: { id: number; status: 'PENDENTE' | 'EM_ANDAMENTO' | 'RESOLVIDO'; responsible?: ConversationUser }
}

export interface Message {
  id: number
  conversationId: number
  sender: ConversationUser
  content: string
  sentAt: string
  read: boolean
  fromSupport: boolean
}
