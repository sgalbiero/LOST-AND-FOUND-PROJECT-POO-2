import { describe, expect, it } from 'vitest'
import type { Page } from '../../../shared/domain/Page'
import type { Conversation, Message } from '../domain/Conversation'
import type { MessageGateway } from './MessageGateway'
import { MessageService } from './MessageService'

describe('MessageService', () => {
  it('remove espaços externos antes de enviar', async () => {
    const gateway = new FakeMessageGateway()
    await new MessageService(gateway).send(1, '  Podemos combinar amanhã?  ')
    expect(gateway.sent).toEqual({ conversationId: 1, content: 'Podemos combinar amanhã?' })
  })

  it('não envia mensagem vazia', () => {
    expect(() => new MessageService(new FakeMessageGateway()).send(1, '   ')).toThrow('Escreva uma mensagem antes de enviar.')
  })
})

class FakeMessageGateway implements MessageGateway {
  sent: { conversationId: number; content: string } | null = null
  start(): Promise<Conversation> { throw new Error('not needed') }
  listConversations(): Promise<Conversation[]> { throw new Error('not needed') }
  listMessages(): Promise<Page<Message>> { throw new Error('not needed') }
  send(conversationId: number, content: string): Promise<Message> {
    this.sent = { conversationId, content }
    return Promise.resolve({ id: 1, conversationId, sender: { id: 1, name: 'Teste' }, content, sentAt: '2026-11-23T12:00:00', read: false })
  }
  markRead(): Promise<number> { throw new Error('not needed') }
  unreadTotal(): Promise<number> { throw new Error('not needed') }
}
