import type { ClaimGateway } from './ClaimGateway'
import type { Page } from '../../../shared/domain/Page'
import type { Claim } from '../domain/Claim'

export class ClaimService {
  constructor(private readonly gateway: ClaimGateway) {}

  create(itemId: number, justification: string) {
    const clean = justification.trim()
    if (!Number.isInteger(itemId) || itemId <= 0) throw new Error('Item inválido para reivindicação.')
    if (!clean) throw new Error('Conte como você reconhece este item.')
    if (clean.length > 1000) throw new Error('A justificativa deve ter no máximo 1000 caracteres.')
    return this.gateway.create(itemId, clean)
  }

  listMine(signal?: AbortSignal) { return this.loadAll((page) => this.gateway.listMine(page, 50, signal)) }
  listReceived(signal?: AbortSignal) { return this.loadAll((page) => this.gateway.listReceived(page, 50, signal)) }
  listForItem(itemId: number, signal?: AbortSignal) { return this.gateway.listForItem(itemId, signal) }
  accept(id: number) { return this.gateway.accept(id) }
  refuse(id: number) { return this.gateway.refuse(id) }
  cancel(id: number) { return this.gateway.cancel(id) }

  private async loadAll(load: (page: number) => Promise<Page<Claim>>) {
    const first = await load(0)
    const content = [...first.content]
    for (let page = 1; page < first.totalPages; page += 1) content.push(...(await load(page)).content)
    return { ...first, content, number: 0, last: true }
  }
}
