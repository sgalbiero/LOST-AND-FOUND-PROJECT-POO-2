import type { ItemDetails, ItemSummary } from '../domain/Item'

export interface ItemSummaryDto {
  id: number
  titulo: string
  tipo: 'PERDIDO' | 'ENCONTRADO'
  status: 'ABERTO' | 'EM_NEGOCIACAO' | 'DEVOLVIDO' | 'CANCELADO' | 'EXPIRADO'
  dataOcorrencia: string
  dataPublicacao: string
  categoria: string
  local: string
  fotoPrincipal?: string
}

export interface ItemDetailsDto extends ItemSummaryDto {
  descricao: string
  expiraEm?: string
  localGuarda?: string
  usuario: { id: number; nome: string }
  categoriaId: number
  localId: number
  fotos: string[]
}

export function mapItemSummary(dto: ItemSummaryDto): ItemSummary {
  return {
    id: dto.id,
    title: dto.titulo,
    type: dto.tipo,
    status: dto.status,
    occurrenceDate: dto.dataOcorrencia,
    publishedAt: dto.dataPublicacao,
    category: dto.categoria,
    location: dto.local,
    mainPhoto: dto.fotoPrincipal,
  }
}

export function mapItemDetails(dto: ItemDetailsDto): ItemDetails {
  return {
    ...mapItemSummary(dto),
    description: dto.descricao,
    expiresAt: dto.expiraEm,
    custodyLocation: dto.localGuarda,
    owner: { id: dto.usuario.id, name: dto.usuario.nome },
    categoryId: dto.categoriaId,
    locationId: dto.localId,
    photos: dto.fotos,
  }
}
