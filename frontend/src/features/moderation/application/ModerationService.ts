import type { ModerationGateway } from './ModerationGateway'
import type { SupportUser } from '../domain/Moderation'

export class ModerationService {
  constructor(private readonly gateway: ModerationGateway) {}

  reportItem(itemId: number, reason: string) { return this.gateway.reportItem(validId(itemId), required(reason, 'Informe o motivo da denúncia.')) }
  reportMessage(messageId: number, reason: string) { return this.gateway.reportMessage(validId(messageId), required(reason, 'Informe o motivo da denúncia.')) }
  listReports(resolved: boolean, signal?: AbortSignal) { return this.gateway.listReports(resolved, signal) }
  resolveReport(id: number) { return this.gateway.resolveReport(validId(id)) }
  requestMediation(conversationId: number, reason: string) { return this.gateway.requestMediation(validId(conversationId), required(reason, 'Informe o motivo da mediação.')) }
  listMyMediations(signal?: AbortSignal) { return this.gateway.listMyMediations(signal) }
  listOpenMediations(signal?: AbortSignal) { return this.gateway.listOpenMediations(signal) }
  assignMediation(id: number) { return this.gateway.assignMediation(validId(id)) }
  resolveMediation(id: number, resolution: string) { return this.gateway.resolveMediation(validId(id), required(resolution, 'Informe o parecer.')) }
  listActiveConversations(signal?: AbortSignal) { return this.gateway.listActiveConversations(signal) }
  closeConversation(id: number) { return this.gateway.closeConversation(validId(id)) }
  listCategories(signal?: AbortSignal) { return this.gateway.listCategories(signal) }
  createCategory(name: string) { return this.gateway.createCategory(required(name, 'Informe o nome.')) }
  updateCategory(id: number, name: string) { return this.gateway.updateCategory(validId(id), required(name, 'Informe o nome.')) }
  toggleCategory(id: number, active: boolean) { return this.gateway.toggleCategory(validId(id), active) }
  listLocations(signal?: AbortSignal) { return this.gateway.listLocations(signal) }
  createLocation(name: string, description: string) { return this.gateway.createLocation(required(name, 'Informe o nome.'), description.trim()) }
  updateLocation(id: number, name: string, description: string) { return this.gateway.updateLocation(validId(id), required(name, 'Informe o nome.'), description.trim()) }
  toggleLocation(id: number, active: boolean) { return this.gateway.toggleLocation(validId(id), active) }
  listUsers(signal?: AbortSignal) { return this.gateway.listUsers(signal) }
  updateUserRole(id: number, role: SupportUser['role']) { return this.gateway.updateUserRole(validId(id), role) }
  setUserActive(id: number, active: boolean) { return this.gateway.setUserActive(validId(id), active) }
}

function required(value: string, message: string) { const clean = value.trim(); if (!clean) throw new Error(message); return clean }
function validId(value: number) { if (!Number.isInteger(value) || value <= 0) throw new Error('Identificador inválido.'); return value }
