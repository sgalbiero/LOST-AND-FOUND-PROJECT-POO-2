import type { Page } from '../../../shared/domain/Page'
import type { HttpClient } from '../../../shared/http/HttpClient'
import type { MessageGateway } from '../application/MessageGateway'
import type { Conversation, Message } from '../domain/Conversation'

interface UserDto { id: number; nome: string }
interface ConversationDto { id: number; itemId: number; itemTitulo: string; donoItem: UserDto; interessado: UserDto; dataCriacao: string; naoLidas: number }
interface MessageDto { id: number; conversaId: number; remetente: UserDto; conteudo: string; dataEnvio: string; lida: boolean }

export class HttpMessageGateway implements MessageGateway {
  constructor(private readonly http: HttpClient) {}

  async start(itemId: number) { return mapConversation(await this.http.request<ConversationDto>(`/api/conversas/item/${itemId}`, { method: 'POST' })) }
  async listConversations(signal?: AbortSignal) { return (await this.http.request<ConversationDto[]>('/api/conversas', { signal })).map(mapConversation) }
  async listMessages(conversationId: number, page = 0, size = 50, signal?: AbortSignal) {
    const result = await this.http.request<Page<MessageDto>>(`/api/conversas/${conversationId}/mensagens?page=${page}&size=${size}`, { signal })
    return { ...result, content: result.content.map(mapMessage).reverse() }
  }
  async send(conversationId: number, content: string) { return mapMessage(await this.http.request<MessageDto>(`/api/conversas/${conversationId}/mensagens`, { method: 'POST', body: { conteudo: content } })) }
  markRead(conversationId: number) { return this.http.request<number>(`/api/conversas/${conversationId}/mensagens/leitura`, { method: 'POST' }) }
  unreadTotal(signal?: AbortSignal) { return this.http.request<number>('/api/mensagens/nao-lidas/total', { signal }) }
}

function mapConversation(dto: ConversationDto): Conversation {
  return { id: dto.id, itemId: dto.itemId, itemTitle: dto.itemTitulo, owner: mapUser(dto.donoItem), interested: mapUser(dto.interessado), createdAt: dto.dataCriacao, unreadCount: dto.naoLidas }
}
function mapMessage(dto: MessageDto): Message {
  return { id: dto.id, conversationId: dto.conversaId, sender: mapUser(dto.remetente), content: dto.conteudo, sentAt: dto.dataEnvio, read: dto.lida }
}
function mapUser(dto: UserDto) { return { id: dto.id, name: dto.nome } }
