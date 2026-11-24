export type ItemType = 'PERDIDO' | 'ENCONTRADO'
export type ItemStatus = 'ABERTO' | 'EM_NEGOCIACAO' | 'DEVOLVIDO' | 'CANCELADO' | 'EXPIRADO'

export interface PublicUser {
  id: number
  name: string
}

export interface ItemSummary {
  id: number
  title: string
  type: ItemType
  status: ItemStatus
  occurrenceDate: string
  publishedAt: string
  category: string
  location: string
  mainPhoto?: string
}

export interface ItemDetails extends ItemSummary {
  description: string
  expiresAt?: string
  custodyLocation?: string
  owner: PublicUser
  categoryId: number
  locationId: number
  photos: string[]
}

export interface ItemFilters {
  term?: string
  type?: ItemType
  status?: ItemStatus
  categoryId?: number
  locationId?: number
  page?: number
  size?: number
}

export interface CreateItem {
  title: string
  description: string
  type: ItemType
  occurrenceDate: string
  custodyLocation?: string
  categoryId: number
  locationId: number
  photos: string[]
}

export type UpdateItem = Omit<CreateItem, 'type'>
