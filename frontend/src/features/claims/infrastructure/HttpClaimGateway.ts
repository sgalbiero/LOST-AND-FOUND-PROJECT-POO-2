import type { Page } from '../../../shared/domain/Page'
import type { HttpClient } from '../../../shared/http/HttpClient'
import type { ClaimGateway } from '../application/ClaimGateway'
import type { Claim, ClaimStatus } from '../domain/Claim'

interface ClaimDto {
  id: number
  itemId: number
  itemTitulo: string
  itemStatus: Claim['itemStatus']
  reivindicante: { id: number; nome: string }
  justificativa: string
  status: ClaimStatus
  dataCriacao: string
  dataResposta?: string
}

export class HttpClaimGateway implements ClaimGateway {
  constructor(private readonly http: HttpClient) {}

  async create(itemId: number, justification: string) {
    return mapClaim(await this.http.request<ClaimDto>(`/api/itens/${itemId}/reivindicacoes`, {
      method: 'POST', body: { justificativa: justification },
    }))
  }

  async listMine(page: number, size: number, signal?: AbortSignal): Promise<Page<Claim>> {
    const result = await this.http.request<Page<ClaimDto>>(`/api/reivindicacoes/minhas?page=${page}&size=${size}`, { signal })
    return { ...result, content: result.content.map(mapClaim) }
  }

  async listReceived(page: number, size: number, signal?: AbortSignal): Promise<Page<Claim>> {
    const result = await this.http.request<Page<ClaimDto>>(`/api/reivindicacoes/recebidas?page=${page}&size=${size}`, { signal })
    return { ...result, content: result.content.map(mapClaim) }
  }

  async listForItem(itemId: number, signal?: AbortSignal) {
    const result = await this.http.request<ClaimDto[]>(`/api/itens/${itemId}/reivindicacoes`, { signal })
    return result.map(mapClaim)
  }

  accept(id: number) { return this.action(id, 'aceite') }
  refuse(id: number) { return this.action(id, 'recusa') }
  cancel(id: number) { return this.action(id, 'cancelamento') }

  private async action(id: number, action: string) {
    return mapClaim(await this.http.request<ClaimDto>(`/api/reivindicacoes/${id}/${action}`, { method: 'POST' }))
  }
}

function mapClaim(dto: ClaimDto): Claim {
  return {
    id: dto.id,
    itemId: dto.itemId,
    itemTitle: dto.itemTitulo,
    itemStatus: dto.itemStatus,
    claimant: { id: dto.reivindicante.id, name: dto.reivindicante.nome },
    justification: dto.justificativa,
    status: dto.status,
    createdAt: dto.dataCriacao,
    answeredAt: dto.dataResposta,
  }
}
