import type { Page } from '../../../shared/domain/Page'
import type { Claim } from '../domain/Claim'

export interface ClaimGateway {
  create(itemId: number, justification: string): Promise<Claim>
  listMine(page: number, size: number, signal?: AbortSignal): Promise<Page<Claim>>
  listReceived(page: number, size: number, signal?: AbortSignal): Promise<Page<Claim>>
  listForItem(itemId: number, signal?: AbortSignal): Promise<Claim[]>
  accept(id: number): Promise<Claim>
  refuse(id: number): Promise<Claim>
  cancel(id: number): Promise<Claim>
}
