import type { MessageGateway } from './MessageGateway'

export class MessageService {
  constructor(private readonly gateway: MessageGateway) {}

  start(itemId: number) {
    if (!Number.isInteger(itemId) || itemId <= 0) throw new Error('Item inválido para conversa.')
    return this.gateway.start(itemId)
  }
  listConversations(signal?: AbortSignal) { return this.gateway.listConversations(signal) }
  requestClosure(id: number) { return this.gateway.requestClosure(id) }
  listMessages(id: number, page = 0, size = 50, signal?: AbortSignal) { return this.gateway.listMessages(id, Math.max(0, page), Math.min(100, size), signal) }
  markRead(id: number) { return this.gateway.markRead(id) }
  unreadTotal(signal?: AbortSignal) { return this.gateway.unreadTotal(signal) }

  send(conversationId: number, content: string) {
    const clean = content.trim()
    if (!clean) throw new Error('Escreva uma mensagem antes de enviar.')
    if (clean.length > 2000) throw new Error('A mensagem deve ter no máximo 2000 caracteres.')
    return this.gateway.send(conversationId, clean)
  }
}
