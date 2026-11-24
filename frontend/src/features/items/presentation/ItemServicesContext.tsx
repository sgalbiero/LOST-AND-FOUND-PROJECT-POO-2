import { createContext, useContext, type ReactNode } from 'react'
import type { CatalogService } from '../../catalog/application/CatalogService'
import type { ItemService } from '../application/ItemService'

interface ItemServices {
  items: ItemService
  catalog: CatalogService
}

const ItemServicesContext = createContext<ItemServices | null>(null)

export function ItemServicesProvider({ services, children }: { services: ItemServices; children: ReactNode }) {
  return <ItemServicesContext.Provider value={services}>{children}</ItemServicesContext.Provider>
}

export function useItemServices() {
  const value = useContext(ItemServicesContext)
  if (!value) throw new Error('useItemServices precisa estar dentro de ItemServicesProvider')
  return value
}
