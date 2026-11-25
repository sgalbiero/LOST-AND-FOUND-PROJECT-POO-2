import { describe, expect, it } from 'vitest'
import type { ReturnRecord } from '../domain/ReturnRecord'
import type { ReturnGateway } from './ReturnGateway'
import { ReturnService } from './ReturnService'

describe('ReturnService', () => {
  it('remove espaços da observação antes de registrar', async () => {
    const gateway = new FakeReturnGateway()
    await new ReturnService(gateway).register(1, '  Entregue na portaria.  ')
    expect(gateway.registered).toEqual({ itemId: 1, note: 'Entregue na portaria.' })
  })

  it('rejeita identificador inválido', () => {
    expect(() => new ReturnService(new FakeReturnGateway()).register(0)).toThrow('Item inválido para devolução.')
  })
})

class FakeReturnGateway implements ReturnGateway {
  registered: { itemId: number; note?: string } | null = null
  register(itemId: number, note?: string): Promise<ReturnRecord> {
    this.registered = { itemId, note }
    return Promise.resolve(record)
  }
  findByItem(): Promise<ReturnRecord> { throw new Error('not needed') }
}

const record: ReturnRecord = { id: 1, itemId: 1, claimId: 1, recipient: { id: 2, name: 'Ana' }, confirmedBy: { id: 1, name: 'Julio' }, returnedAt: '2026-11-23T12:00:00' }
