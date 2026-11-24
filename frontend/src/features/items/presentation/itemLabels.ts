import type { ItemStatus } from '../domain/Item'

export const itemStatusLabels: Record<ItemStatus, string> = {
  ABERTO: 'Aberto',
  EM_NEGOCIACAO: 'Em negociação',
  DEVOLVIDO: 'Devolvido',
  CANCELADO: 'Cancelado',
  EXPIRADO: 'Expirado',
}
