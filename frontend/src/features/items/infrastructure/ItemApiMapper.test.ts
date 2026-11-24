import { describe, expect, it } from 'vitest'
import { mapItemDetails, type ItemDetailsDto } from './ItemApiMapper'

describe('ItemApiMapper', () => {
  it('isola o contrato em português da API do modelo do frontend', () => {
    const dto: ItemDetailsDto = {
      id: 10, titulo: 'Garrafa', descricao: 'Verde', tipo: 'ENCONTRADO', status: 'ABERTO',
      dataOcorrencia: '2026-11-20', dataPublicacao: '2026-11-21T10:00:00', categoria: 'Garrafas',
      local: 'Biblioteca', usuario: { id: 2, nome: 'Bruno' }, categoriaId: 3, localId: 4,
      fotos: ['https://example.com/photo.jpg'],
    }

    const item = mapItemDetails(dto)

    expect(item.title).toBe('Garrafa')
    expect(item.owner).toEqual({ id: 2, name: 'Bruno' })
    expect(item).not.toHaveProperty('titulo')
  })
})
