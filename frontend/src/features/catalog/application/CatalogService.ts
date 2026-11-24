import type { CatalogGateway } from './CatalogGateway'

export class CatalogService {
  constructor(private readonly gateway: CatalogGateway) {}

  async listActive(signal?: AbortSignal) {
    const [categories, locations] = await Promise.all([
      this.gateway.listCategories(signal),
      this.gateway.listLocations(signal),
    ])
    return { categories, locations }
  }
}
