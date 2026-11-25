import { describe, expect, it } from 'vitest'
import type { Conversation, Message } from '../domain/Conversation'
import { canRequestMediation, messageAuthorLabel, shouldAutoSelectConversation, shouldPollConversation } from './messageFlow'

const conversation: Conversation = {
  id: 1,
  itemId: 2,
  itemTitle: 'Mochila',
  owner: { id: 1, name: 'Ana' },
  interested: { id: 2, name: 'Bia' },
  createdAt: '2026-11-24T10:00:00',
  unreadCount: 0,
  ownerRequestedClosure: false,
  interestedRequestedClosure: false,
  closedBySupport: false,
}

describe('fluxo da tela de mensagens', () => {
  it('mantém a lista visível na primeira abertura em dispositivos móveis', () => {
    expect(shouldAutoSelectConversation({ mobile: true, selectionHandled: false, requestedId: 0, conversationCount: 2 })).toBe(false)
  })

  it('seleciona a primeira conversa uma única vez no desktop', () => {
    expect(shouldAutoSelectConversation({ mobile: false, selectionHandled: false, requestedId: 0, conversationCount: 2 })).toBe(true)
    expect(shouldAutoSelectConversation({ mobile: false, selectionHandled: true, requestedId: 0, conversationCount: 2 })).toBe(false)
  })

  it('bloqueia mediação e polling depois do encerramento', () => {
    const closed = { ...conversation, closedAt: '2026-11-24T11:00:00' }
    expect(canRequestMediation(closed, false)).toBe(false)
    expect(shouldPollConversation(closed)).toBe(false)
  })

  it('identifica o remetente de todas as mensagens para qualquer usuário', () => {
    expect(messageAuthorLabel(message({ id: 1, name: 'Ana' }))).toBe('Ana')
    expect(messageAuthorLabel(message({ id: 2, name: 'Bia' }))).toBe('Bia')
    expect(messageAuthorLabel(message({ id: 3, name: 'Carlos' }, true))).toBe('Equipe · Carlos')
  })
})

function message(sender: Message['sender'], fromSupport = false): Message {
  return {
    id: sender.id,
    conversationId: 1,
    sender,
    content: 'Mensagem',
    sentAt: '2026-11-24T10:00:00',
    read: false,
    fromSupport,
  }
}
