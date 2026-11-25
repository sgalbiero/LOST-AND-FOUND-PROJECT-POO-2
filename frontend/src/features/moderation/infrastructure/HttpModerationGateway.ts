import type { Page } from '../../../shared/domain/Page'
import type { HttpClient } from '../../../shared/http/HttpClient'
import type { ModerationGateway } from '../application/ModerationGateway'
import type { ManagedOption, Mediation, Report, SupportConversation, SupportUser } from '../domain/Moderation'

export class HttpModerationGateway implements ModerationGateway {
  constructor(private readonly http: HttpClient) {}
  reportItem(itemId: number, reason: string) { return this.report(`/api/denuncias/item/${itemId}`, reason) }
  reportMessage(messageId: number, reason: string) { return this.report(`/api/denuncias/mensagem/${messageId}`, reason) }
  async listReports(resolved: boolean, signal?: AbortSignal) { const page = await this.http.request<Page<ReportDto>>(`/api/denuncias?resolvidas=${resolved}&size=100&sort=dataCriacao,desc`, { signal }); return page.content.map(mapReport) }
  async resolveReport(id: number) { return mapReport(await this.http.request<ReportDto>(`/api/denuncias/${id}/resolucao`, { method: 'POST' })) }
  async requestMediation(conversationId: number, reason: string) { return mapMediation(await this.http.request<MediationDto>(`/api/mediacoes/conversa/${conversationId}`, { method: 'POST', body: { motivo: reason } })) }
  async listMyMediations(signal?: AbortSignal) { return (await this.http.request<MediationDto[]>('/api/mediacoes/minhas', { signal })).map(mapMediation) }
  async listOpenMediations(signal?: AbortSignal) { const page = await this.http.request<Page<MediationDto>>('/api/mediacoes/abertas?size=100&sort=dataSolicitacao,asc', { signal }); return page.content.map(mapMediation) }
  async assignMediation(id: number) { return mapMediation(await this.http.request<MediationDto>(`/api/mediacoes/${id}/atribuicao`, { method: 'POST' })) }
  async resolveMediation(id: number, resolution: string) { return mapMediation(await this.http.request<MediationDto>(`/api/mediacoes/${id}/resolucao`, { method: 'POST', body: { parecer: resolution } })) }
  async listActiveConversations(signal?: AbortSignal) { return (await this.http.request<ConversationDto[]>('/api/conversas/equipe/ativas', { signal })).map(mapConversation) }
  async closeConversation(id: number) { await this.http.request(`/api/conversas/${id}/encerramento`, { method: 'POST' }) }
  async listCategories(signal?: AbortSignal) { return (await this.http.request<CategoryDto[]>('/api/categorias/admin', { signal })).map(value => ({ id: value.id, name: value.nome, active: value.ativo })) }
  async createCategory(name: string) { const value = await this.http.request<CategoryDto>('/api/categorias', { method: 'POST', body: { nome: name } }); return { id: value.id, name: value.nome, active: value.ativo } }
  async updateCategory(id: number, name: string) { const value = await this.http.request<CategoryDto>(`/api/categorias/${id}`, { method: 'PUT', body: { nome: name } }); return { id: value.id, name: value.nome, active: value.ativo } }
  async toggleCategory(id: number, active: boolean) { const value = await this.http.request<CategoryDto>(`/api/categorias/${id}/ativo?ativo=${active}`, { method: 'PATCH' }); return { id: value.id, name: value.nome, active: value.ativo } }
  async listLocations(signal?: AbortSignal) { return (await this.http.request<LocationDto[]>('/api/locais/admin', { signal })).map(mapLocation) }
  async createLocation(name: string, description: string) { return mapLocation(await this.http.request<LocationDto>('/api/locais', { method: 'POST', body: { nome: name, descricao: description || null } })) }
  async updateLocation(id: number, name: string, description: string) { return mapLocation(await this.http.request<LocationDto>(`/api/locais/${id}`, { method: 'PUT', body: { nome: name, descricao: description || null } })) }
  async toggleLocation(id: number, active: boolean) { return mapLocation(await this.http.request<LocationDto>(`/api/locais/${id}/ativo?ativo=${active}`, { method: 'PATCH' })) }
  async listUsers(signal?: AbortSignal) { return (await this.http.request<UserDto[]>('/api/usuarios', { signal })).map(mapUser) }
  async updateUserRole(id: number, role: SupportUser['role']) { return mapUser(await this.http.request<UserDto>(`/api/usuarios/${id}/role`, { method: 'PATCH', body: { role } })) }
  async setUserActive(id: number, active: boolean) { return mapUser(await this.http.request<UserDto>(`/api/usuarios/${id}/ativo?ativo=${active}`, { method: 'PATCH' })) }
  private async report(path: string, reason: string) { return mapReport(await this.http.request<ReportDto>(path, { method: 'POST', body: { motivo: reason } })) }
}

interface ReportDto { id: number; denunciante: { id: number; nome: string }; itemId?: number; itemTitulo?: string; mensagemId?: number; mensagemConteudo?: string; conversaId?: number; motivo: string; resolvida: boolean; dataCriacao: string }
interface MediationDto { id: number; itemId: number; itemTitulo: string; conversaId?: number; donoConversa?: { id: number; nome: string }; interessadoConversa?: { id: number; nome: string }; solicitante: { id: number; nome: string }; adminResponsavel?: { id: number; nome: string }; motivo: string; status: Mediation['status']; dataSolicitacao: string; dataResolucao?: string; parecer?: string }
interface CategoryDto { id: number; nome: string; ativo: boolean }
interface LocationDto extends CategoryDto { descricao?: string }
interface UserDto { id: number; nome: string; email: string; telefone?: string; role: SupportUser['role']; ativo: boolean; dataCadastro: string }
interface ConversationDto { id: number; itemId: number; itemTitulo: string; donoItem: { id: number; nome: string }; interessado: { id: number; nome: string }; encerramentoDonoSolicitado: boolean; encerramentoInteressadoSolicitado: boolean }
const person = (value: { id: number; nome: string }) => ({ id: value.id, name: value.nome })
const mapReport = (value: ReportDto): Report => ({ id: value.id, reporter: person(value.denunciante), itemId: value.itemId, itemTitle: value.itemTitulo, messageId: value.mensagemId, messageContent: value.mensagemConteudo, conversationId: value.conversaId, reason: value.motivo, resolved: value.resolvida, createdAt: value.dataCriacao })
const mapMediation = (value: MediationDto): Mediation => ({ id: value.id, itemId: value.itemId, itemTitle: value.itemTitulo, conversation: value.conversaId && value.donoConversa && value.interessadoConversa ? { id: value.conversaId, owner: person(value.donoConversa), interested: person(value.interessadoConversa) } : undefined, requester: person(value.solicitante), assignedAdmin: value.adminResponsavel ? person(value.adminResponsavel) : undefined, reason: value.motivo, status: value.status, requestedAt: value.dataSolicitacao, resolvedAt: value.dataResolucao, resolution: value.parecer })
const mapLocation = (value: LocationDto): ManagedOption => ({ id: value.id, name: value.nome, description: value.descricao, active: value.ativo })
const mapConversation = (value: ConversationDto): SupportConversation => ({ id: value.id, itemId: value.itemId, itemTitle: value.itemTitulo, owner: person(value.donoItem), interested: person(value.interessado), ownerRequestedClosure: value.encerramentoDonoSolicitado, interestedRequestedClosure: value.encerramentoInteressadoSolicitado })
const mapUser = (value: UserDto): SupportUser => ({ id: value.id, name: value.nome, email: value.email, phone: value.telefone, role: value.role, active: value.ativo, registeredAt: value.dataCadastro })
