import type { ManagedOption, Mediation, Report, SupportConversation } from '../domain/Moderation'

export interface ModerationGateway {
  reportItem(itemId: number, reason: string): Promise<Report>
  reportMessage(messageId: number, reason: string): Promise<Report>
  listReports(resolved: boolean, signal?: AbortSignal): Promise<Report[]>
  resolveReport(id: number): Promise<Report>
  requestMediation(itemId: number, reason: string, conversationId?: number): Promise<Mediation>
  listMyMediations(signal?: AbortSignal): Promise<Mediation[]>
  listOpenMediations(signal?: AbortSignal): Promise<Mediation[]>
  assignMediation(id: number): Promise<Mediation>
  resolveMediation(id: number, resolution: string): Promise<Mediation>
  listActiveConversations(signal?: AbortSignal): Promise<SupportConversation[]>
  closeConversation(id: number): Promise<void>
  listCategories(signal?: AbortSignal): Promise<ManagedOption[]>
  createCategory(name: string): Promise<ManagedOption>
  toggleCategory(id: number, active: boolean): Promise<ManagedOption>
  listLocations(signal?: AbortSignal): Promise<ManagedOption[]>
  createLocation(name: string, description: string): Promise<ManagedOption>
  toggleLocation(id: number, active: boolean): Promise<ManagedOption>
}
