import { createContext, useContext, type ReactNode } from 'react'
import type { ModerationService } from '../application/ModerationService'

const Context = createContext<ModerationService | null>(null)
export function ModerationProvider({ service, children }: { service: ModerationService; children: ReactNode }) { return <Context.Provider value={service}>{children}</Context.Provider> }
export function useModeration() { const value = useContext(Context); if (!value) throw new Error('useModeration precisa estar dentro de ModerationProvider'); return value }
