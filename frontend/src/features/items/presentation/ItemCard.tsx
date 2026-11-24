import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../../shared/ui/format'
import type { ItemSummary } from '../domain/Item'
import { itemStatusLabels } from './itemLabels'

export function ItemCard({ item }: { item: ItemSummary }) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => setImageFailed(false), [item.mainPhoto])

  const showImage = item.mainPhoto && !imageFailed

  return (
    <Link to={`/itens/${item.id}`} className="item-card">
      <div className="item-photo">
        {showImage
          ? <img src={item.mainPhoto} alt={`Foto de ${item.title}`} loading="lazy" onError={() => setImageFailed(true)} />
          : <div className="photo-placeholder"><span aria-hidden="true">◇</span><small>Sem foto disponível</small></div>}
        <span className={`type-badge ${item.type.toLowerCase()}`}>{item.type === 'PERDIDO' ? 'Perdido' : 'Encontrado'}</span>
      </div>
      <div className="item-card-body">
        <span className="item-category">{item.category}</span>
        <h3>{item.title}</h3>
        <div className="item-card-facts"><span><span aria-hidden="true">⌖</span>{item.location}</span><span>{formatDate(item.occurrenceDate)}</span></div>
        <div className="item-card-footer"><span className={`status status-${item.status.toLowerCase()}`}>{itemStatusLabels[item.status]}</span><span className="view-item">Ver item <span aria-hidden="true">→</span></span></div>
      </div>
    </Link>
  )
}
