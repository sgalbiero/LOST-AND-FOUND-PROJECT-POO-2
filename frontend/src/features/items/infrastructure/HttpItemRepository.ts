import type { Page } from '../../../shared/domain/Page'
import type { HttpClient } from '../../../shared/http/HttpClient'
import type { ItemRepository } from '../application/ItemRepository'
import type { CreateItem, ItemDetails, ItemFilters, ItemSummary, UpdateItem } from '../domain/Item'
import { mapItemDetails, mapItemSummary, type ItemDetailsDto, type ItemSummaryDto } from './ItemApiMapper'

interface PageDto<T> extends Page<T> {}

export class HttpItemRepository implements ItemRepository {
  constructor(private readonly http: HttpClient) {}

  async search(filters: ItemFilters, signal?: AbortSignal): Promise<Page<ItemSummary>> {
    const query = new URLSearchParams()
    if (filters.term) query.set('termo', filters.term)
    if (filters.type) query.set('tipo', filters.type)
    if (filters.status) query.set('status', filters.status)
    if (filters.categoryId) query.set('categoriaId', String(filters.categoryId))
    if (filters.locationId) query.set('localId', String(filters.locationId))
    query.set('page', String(filters.page ?? 0))
    query.set('size', String(filters.size ?? 12))
    query.set('sort', 'dataPublicacao,desc')
    const page = await this.http.request<PageDto<ItemSummaryDto>>(`/api/itens?${query}`, { signal })
    return { ...page, content: page.content.map(mapItemSummary) }
  }

  async findById(id: number, signal?: AbortSignal): Promise<ItemDetails> {
    return mapItemDetails(await this.http.request<ItemDetailsDto>(`/api/itens/${id}`, { signal }))
  }

  async listMine(page = 0, size = 50, signal?: AbortSignal): Promise<Page<ItemSummary>> {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: 'dataPublicacao,desc',
    })
    const result = await this.http.request<PageDto<ItemSummaryDto>>(`/api/itens/meus?${query}`, { signal })
    return { ...result, content: result.content.map(mapItemSummary) }
  }

  async create(item: CreateItem): Promise<ItemDetails> {
    const dto = await this.http.request<ItemDetailsDto>('/api/itens', {
      method: 'POST',
      body: {
        titulo: item.title,
        descricao: item.description,
        tipo: item.type,
        dataOcorrencia: item.occurrenceDate,
        localGuarda: item.custodyLocation || null,
        categoriaId: item.categoryId,
        localId: item.locationId,
        fotos: item.photos,
      },
    })
    return mapItemDetails(dto)
  }

  async update(id: number, item: UpdateItem): Promise<ItemDetails> {
    const dto = await this.http.request<ItemDetailsDto>(`/api/itens/${id}`, {
      method: 'PUT',
      body: {
        titulo: item.title,
        descricao: item.description,
        dataOcorrencia: item.occurrenceDate,
        localGuarda: item.custodyLocation || null,
        categoriaId: item.categoryId,
        localId: item.locationId,
        fotos: item.photos,
      },
    })
    return mapItemDetails(dto)
  }

  async cancel(id: number): Promise<ItemDetails> {
    return mapItemDetails(await this.http.request<ItemDetailsDto>(`/api/itens/${id}/cancelamento`, { method: 'POST' }))
  }
}
