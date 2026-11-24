import type { ReturnRecord } from '../domain/ReturnRecord'

export interface ReturnGateway {
  register(itemId: number, note?: string): Promise<ReturnRecord>
  findByItem(itemId: number, signal?: AbortSignal): Promise<ReturnRecord>
}
