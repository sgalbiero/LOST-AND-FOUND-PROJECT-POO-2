import type { HttpClient } from '../../../shared/http/HttpClient'
import type { ReturnGateway } from '../application/ReturnGateway'
import type { ReturnRecord } from '../domain/ReturnRecord'

interface ReturnDto { id: number; itemId: number; reivindicacaoId: number; confirmadoPor: { id: number; nome: string }; dataDevolucao: string; observacao?: string }

export class HttpReturnGateway implements ReturnGateway {
  constructor(private readonly http: HttpClient) {}
  async register(itemId: number, note?: string) {
    return mapReturn(await this.http.request<ReturnDto>(`/api/itens/${itemId}/devolucao`, { method: 'POST', body: { observacao: note ?? null } }))
  }
  async findByItem(itemId: number, signal?: AbortSignal) {
    return mapReturn(await this.http.request<ReturnDto>(`/api/itens/${itemId}/devolucao`, { signal }))
  }
}

function mapReturn(dto: ReturnDto): ReturnRecord {
  return { id: dto.id, itemId: dto.itemId, claimId: dto.reivindicacaoId, confirmedBy: { id: dto.confirmadoPor.id, name: dto.confirmadoPor.nome }, returnedAt: dto.dataDevolucao, note: dto.observacao }
}
