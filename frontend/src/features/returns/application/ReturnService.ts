import type { ReturnGateway } from './ReturnGateway'

export class ReturnService {
  constructor(private readonly gateway: ReturnGateway) {}

  register(itemId: number, note?: string) {
    validateId(itemId)
    const clean = note?.trim() || undefined
    if (clean && clean.length > 1000) throw new Error('A observação deve ter no máximo 1000 caracteres.')
    return this.gateway.register(itemId, clean)
  }

  findByItem(itemId: number, signal?: AbortSignal) {
    validateId(itemId)
    return this.gateway.findByItem(itemId, signal)
  }
}

function validateId(id: number) {
  if (!Number.isInteger(id) || id <= 0) throw new Error('Item inválido para devolução.')
}
