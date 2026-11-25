import { describe, expect, it } from 'vitest'
import type { ModerationGateway } from './ModerationGateway'
import { ModerationService } from './ModerationService'

describe('ModerationService', () => {
  it('normaliza o motivo antes de denunciar', async () => {
    const gateway = new FakeGateway()
    await new ModerationService(gateway).reportItem(7, '  Conteúdo inadequado  ')
    expect(gateway.reported).toEqual({ itemId: 7, reason: 'Conteúdo inadequado' })
  })

  it('não envia mediação sem motivo', () => {
    expect(() => new ModerationService(new FakeGateway()).requestMediation(1, '  ')).toThrow('Informe o motivo da mediação.')
  })
})

class FakeGateway implements ModerationGateway {
  reported: { itemId: number; reason: string } | null = null
  reportItem(itemId: number, reason: string): Promise<never> { this.reported = { itemId, reason }; return Promise.resolve(undefined as never) }
  reportMessage(): Promise<never> { throw new Error('not needed') }
  listReports(): Promise<never[]> { throw new Error('not needed') }
  resolveReport(): Promise<never> { throw new Error('not needed') }
  requestMediation(): Promise<never> { throw new Error('not needed') }
  listMyMediations(): Promise<never[]> { throw new Error('not needed') }
  listOpenMediations(): Promise<never[]> { throw new Error('not needed') }
  assignMediation(): Promise<never> { throw new Error('not needed') }
  resolveMediation(): Promise<never> { throw new Error('not needed') }
  listActiveConversations(): Promise<never[]> { throw new Error('not needed') }
  closeConversation(): Promise<void> { throw new Error('not needed') }
  listCategories(): Promise<never[]> { throw new Error('not needed') }
  createCategory(): Promise<never> { throw new Error('not needed') }
  updateCategory(): Promise<never> { throw new Error('not needed') }
  toggleCategory(): Promise<never> { throw new Error('not needed') }
  listLocations(): Promise<never[]> { throw new Error('not needed') }
  createLocation(): Promise<never> { throw new Error('not needed') }
  updateLocation(): Promise<never> { throw new Error('not needed') }
  toggleLocation(): Promise<never> { throw new Error('not needed') }
  listUsers(): Promise<never[]> { throw new Error('not needed') }
  updateUserRole(): Promise<never> { throw new Error('not needed') }
  setUserActive(): Promise<never> { throw new Error('not needed') }
}
