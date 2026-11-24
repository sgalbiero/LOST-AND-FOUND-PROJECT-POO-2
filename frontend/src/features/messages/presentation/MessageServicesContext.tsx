import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../../auth/presentation/AuthContext'
import type { MessageService } from '../application/MessageService'

interface MessageContextValue { service: MessageService; unreadCount: number; refreshUnread(): Promise<void> }
const MessageServicesContext = createContext<MessageContextValue | null>(null)

export function MessageServicesProvider({ service, children }: { service: MessageService; children: ReactNode }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const refreshUnread = useCallback(async () => {
    if (!user) { setUnreadCount(0); return }
    try { setUnreadCount(await service.unreadTotal()) } catch { /* A página exibirá erros de rede quando necessário. */ }
  }, [service, user])

  useEffect(() => {
    void refreshUnread()
    if (!user) return
    const timer = window.setInterval(() => void refreshUnread(), 15000)
    return () => window.clearInterval(timer)
  }, [refreshUnread, user])

  const value = useMemo(() => ({ service, unreadCount, refreshUnread }), [service, unreadCount, refreshUnread])
  return <MessageServicesContext.Provider value={value}>{children}</MessageServicesContext.Provider>
}

export function useMessageServices() {
  const value = useContext(MessageServicesContext)
  if (!value) throw new Error('useMessageServices precisa estar dentro de MessageServicesProvider')
  return value
}
