import type { HttpClient } from '../../../shared/http/HttpClient'
import type { CatalogGateway } from '../application/CatalogGateway'
import type { CatalogOption } from '../domain/CatalogOption'

interface CatalogOptionDto { id: number; nome: string; descricao?: string; ativo: boolean }

export class HttpCatalogGateway implements CatalogGateway {
  constructor(private readonly http: HttpClient) {}

  async listCategories(signal?: AbortSignal): Promise<CatalogOption[]> {
    return (await this.http.request<CatalogOptionDto[]>('/api/categorias', { signal })).map(mapOption)
  }

  async listLocations(signal?: AbortSignal): Promise<CatalogOption[]> {
    return (await this.http.request<CatalogOptionDto[]>('/api/locais', { signal })).map(mapOption)
  }
}

function mapOption(dto: CatalogOptionDto): CatalogOption {
  return { id: dto.id, name: dto.nome, description: dto.descricao, active: dto.ativo }
}
