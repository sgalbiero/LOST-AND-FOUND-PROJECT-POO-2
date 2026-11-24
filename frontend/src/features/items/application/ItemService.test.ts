import { describe, expect, it } from 'vitest'
import type { Page } from '../../../shared/domain/Page'
import type { CreateItem, ItemDetails, ItemFilters, ItemSummary, UpdateItem } from '../domain/Item'
import type { ItemRepository } from './ItemRepository'
import { ItemService } from './ItemService'

describe('ItemService', () => {
  it('limita o tamanho da página antes de acessar o adapter', async () => {
    const repository = new FakeItemRepository()
    const service = new ItemService(repository)

    await service.search({ size: 500 })

    expect(repository.lastFilters?.size).toBe(50)
  })

  it('rejeita publicação sem foto antes de acessar a rede', () => {
    const repository = new FakeItemRepository()
    const service = new ItemService(repository)

    expect(() => service.publish({ ...newItem, photos: [] })).toThrow('Informe de uma a três fotos.')
    expect(repository.created).toBeNull()
  })

  it('limita a listagem dos próprios itens a cinquenta registros', async () => {
    const repository = new FakeItemRepository()
    const service = new ItemService(repository)

    await service.listMine(-2, 200)

    expect(repository.mineRequest).toEqual({ page: 0, size: 50 })
  })
})

const newItem: CreateItem = {
  title: 'Mochila', description: 'Azul', type: 'PERDIDO', occurrenceDate: '2026-11-20',
  categoryId: 1, locationId: 2, photos: ['https://example.com/photo.jpg'],
}

class FakeItemRepository implements ItemRepository {
  lastFilters: ItemFilters | null = null
  created: CreateItem | null = null
  mineRequest: { page: number; size: number } | null = null
  search(filters: ItemFilters): Promise<Page<ItemSummary>> {
    this.lastFilters = filters
    return Promise.resolve({ content: [], number: 0, totalPages: 0, totalElements: 0, last: true })
  }
  listMine(page = 0, size = 50): Promise<Page<ItemSummary>> {
    this.mineRequest = { page, size }
    return Promise.resolve({ content: [], number: page, totalPages: 0, totalElements: 0, last: true })
  }
  findById(_id: number): Promise<ItemDetails> { throw new Error('not needed') }
  create(item: CreateItem): Promise<ItemDetails> { this.created = item; throw new Error('not needed') }
  update(_id: number, _item: UpdateItem): Promise<ItemDetails> { throw new Error('not needed') }
  cancel(_id: number): Promise<ItemDetails> { throw new Error('not needed') }
}
