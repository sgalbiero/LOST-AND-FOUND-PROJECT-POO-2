import type { Page } from '../../../shared/domain/Page'
import type { CreateItem, ItemDetails, ItemFilters, ItemSummary, UpdateItem } from '../domain/Item'

export interface ItemRepository {
  search(filters: ItemFilters, signal?: AbortSignal): Promise<Page<ItemSummary>>
  listMine(page?: number, size?: number, signal?: AbortSignal): Promise<Page<ItemSummary>>
  findById(id: number, signal?: AbortSignal): Promise<ItemDetails>
  create(item: CreateItem): Promise<ItemDetails>
  update(id: number, item: UpdateItem): Promise<ItemDetails>
  cancel(id: number): Promise<ItemDetails>
}
