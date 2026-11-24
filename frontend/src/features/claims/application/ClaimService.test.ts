import { describe, expect, it } from 'vitest'
import type { Page } from '../../../shared/domain/Page'
import type { Claim } from '../domain/Claim'
import type { ClaimGateway } from './ClaimGateway'
import { ClaimService } from './ClaimService'

describe('ClaimService', () => {
  it('limpa a justificativa antes de enviar', async () => {
    const gateway = new FakeClaimGateway()
    const service = new ClaimService(gateway)

    await service.create(1, '  Reconheço o chaveiro interno.  ')

    expect(gateway.created).toEqual({ itemId: 1, justification: 'Reconheço o chaveiro interno.' })
  })

  it('rejeita uma reivindicação sem justificativa', () => {
    const service = new ClaimService(new FakeClaimGateway())
    expect(() => service.create(1, '   ')).toThrow('Conte como você reconhece este item.')
  })
})

class FakeClaimGateway implements ClaimGateway {
  created: { itemId: number; justification: string } | null = null
  create(itemId: number, justification: string): Promise<Claim> {
    this.created = { itemId, justification }
    return Promise.resolve(claim)
  }
  listMine(): Promise<Page<Claim>> { throw new Error('not needed') }
  listReceived(): Promise<Page<Claim>> { throw new Error('not needed') }
  listForItem(): Promise<Claim[]> { throw new Error('not needed') }
  accept(): Promise<Claim> { throw new Error('not needed') }
  refuse(): Promise<Claim> { throw new Error('not needed') }
  cancel(): Promise<Claim> { throw new Error('not needed') }
}

const claim: Claim = {
  id: 1, itemId: 1, itemTitle: 'Mochila', claimant: { id: 1, name: 'Teste' },
  justification: 'Reconheço o chaveiro interno.', status: 'PENDENTE', createdAt: '2026-11-23T12:00:00',
}
