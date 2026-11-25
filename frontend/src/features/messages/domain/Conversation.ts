export interface ConversationUser { id: number; name: string }

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
