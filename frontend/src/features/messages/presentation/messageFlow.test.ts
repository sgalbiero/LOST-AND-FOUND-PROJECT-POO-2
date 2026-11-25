import { describe, expect, it } from 'vitest'
import type { Conversation } from '../domain/Conversation'
import { canRequestMediation, shouldAutoSelectConversation, shouldPollConversation } from './messageFlow'

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
})
