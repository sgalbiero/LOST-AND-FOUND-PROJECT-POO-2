import type { ReactNode } from 'react'
import { AuthProvider } from '../features/auth/presentation/AuthContext'
import { ClaimServicesProvider } from '../features/claims/presentation/ClaimServicesContext'
import { ItemServicesProvider } from '../features/items/presentation/ItemServicesContext'
import { MessageServicesProvider } from '../features/messages/presentation/MessageServicesContext'
import { ReturnServicesProvider } from '../features/returns/presentation/ReturnServicesContext'
import { ModerationProvider } from '../features/moderation/presentation/ModerationContext'
import { services } from './dependencies'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider service={services.auth}>
      <MessageServicesProvider service={services.messages}>
        <ModerationProvider service={services.moderation}>
        <ReturnServicesProvider service={services.returns}>
          <ClaimServicesProvider service={services.claims}>
            <ItemServicesProvider services={{ items: services.items, catalog: services.catalog }}>
              {children}
            </ItemServicesProvider>
          </ClaimServicesProvider>
        </ReturnServicesProvider>
        </ModerationProvider>
      </MessageServicesProvider>
    </AuthProvider>
  )
}
