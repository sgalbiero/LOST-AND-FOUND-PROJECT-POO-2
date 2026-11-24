import type { CreateItem, ItemFilters, UpdateItem } from '../domain/Item'
import type { ItemRepository } from './ItemRepository'

export class ItemService {
  constructor(private readonly repository: ItemRepository) {}

  search(filters: ItemFilters, signal?: AbortSignal) {
    return this.repository.search({ ...filters, size: Math.min(filters.size ?? 12, 50) }, signal)
  }

  listMine(page = 0, size = 50, signal?: AbortSignal) {
    return this.repository.listMine(Math.max(0, page), Math.min(size, 50), signal)
  }

  get(id: number, signal?: AbortSignal) {
    if (!Number.isInteger(id) || id <= 0) throw new Error('Identificador de item inválido.')
    return this.repository.findById(id, signal)
  }

  publish(item: CreateItem) {
    return this.repository.create({ ...item, photos: this.validPhotos(item.photos) })
  }

  update(id: number, item: UpdateItem) {
    this.requireId(id)
    return this.repository.update(id, { ...item, photos: this.validPhotos(item.photos) })
  }

  cancel(id: number) {
    this.requireId(id)
    return this.repository.cancel(id)
  }

  private requireId(id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new Error('Identificador de item inválido.')
  }

  private validPhotos(values: string[]) {
    const photos = values.map(photo => photo.trim()).filter(Boolean)
    if (photos.length < 1 || photos.length > 3) throw new Error('Informe de uma a três fotos.')
    return photos
  }
}
