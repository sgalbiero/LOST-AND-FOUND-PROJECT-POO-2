import { createContext, useContext, type ReactNode } from 'react'
import type { ClaimService } from '../application/ClaimService'

const ClaimServicesContext = createContext<ClaimService | null>(null)

export function ClaimServicesProvider({ service, children }: { service: ClaimService; children: ReactNode }) {
  return <ClaimServicesContext.Provider value={service}>{children}</ClaimServicesContext.Provider>
}

export function useClaimService() {
  const value = useContext(ClaimServicesContext)
  if (!value) throw new Error('useClaimService precisa estar dentro de ClaimServicesProvider')
  return value
}
