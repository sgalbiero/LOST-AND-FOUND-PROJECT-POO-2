import type { CatalogOption } from '../domain/CatalogOption'

export interface CatalogGateway {
  listCategories(signal?: AbortSignal): Promise<CatalogOption[]>
  listLocations(signal?: AbortSignal): Promise<CatalogOption[]>
}
