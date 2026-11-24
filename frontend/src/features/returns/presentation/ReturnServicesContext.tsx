import { createContext, useContext, type ReactNode } from 'react'
import type { ReturnService } from '../application/ReturnService'

const ReturnServicesContext = createContext<ReturnService | null>(null)
export function ReturnServicesProvider({ service, children }: { service: ReturnService; children: ReactNode }) {
  return <ReturnServicesContext.Provider value={service}>{children}</ReturnServicesContext.Provider>
}
export function useReturnService() {
  const value = useContext(ReturnServicesContext)
  if (!value) throw new Error('useReturnService precisa estar dentro de ReturnServicesProvider')
  return value
}
