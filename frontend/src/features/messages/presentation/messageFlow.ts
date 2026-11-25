import type { Conversation } from '../domain/Conversation'

export function shouldAutoSelectConversation(input: {
  mobile: boolean
  selectionHandled: boolean
  requestedId: number
  conversationCount: number
}) {
  return !input.mobile
    && !input.selectionHandled
    && (!Number.isInteger(input.requestedId) || input.requestedId <= 0)
    && input.conversationCount > 0
}

export function canRequestMediation(conversation: Conversation, supportUser: boolean) {
  return !supportUser && !conversation.closedAt && !conversation.mediation
}

export function shouldPollConversation(conversation: Conversation) {
  return !conversation.closedAt
}
