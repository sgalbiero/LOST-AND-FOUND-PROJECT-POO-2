import type { Page } from '../../../shared/domain/Page'
import type { Conversation, Message } from '../domain/Conversation'

export interface MessageGateway {
  start(itemId: number): Promise<Conversation>
  listConversations(signal?: AbortSignal): Promise<Conversation[]>
  requestClosure(conversationId: number): Promise<Conversation>
  listMessages(conversationId: number, page?: number, size?: number, signal?: AbortSignal): Promise<Page<Message>>
  send(conversationId: number, content: string): Promise<Message>
  markRead(conversationId: number): Promise<number>
  unreadTotal(signal?: AbortSignal): Promise<number>
}
