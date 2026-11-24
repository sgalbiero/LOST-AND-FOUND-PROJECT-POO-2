import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StateView } from '../../../shared/ui/StateView'
import type { ItemStatus, ItemSummary } from '../domain/Item'
import { ItemCard } from './ItemCard'
import { useItemServices } from './ItemServicesContext'

type ViewFilter = 'TODOS' | ItemStatus

const filters: Array<{ value: ViewFilter; label: string }> = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'ABERTO', label: 'Abertos' },
  { value: 'EM_NEGOCIACAO', label: 'Em negociação' },
  { value: 'DEVOLVIDO', label: 'Devolvidos' },
  { value: 'CANCELADO', label: 'Encerrados' },
]

export function MyItemsPage() {
  const { items: itemService } = useItemServices()
  const [items, setItems] = useState<ItemSummary[]>([])
  const [filter, setFilter] = useState<ViewFilter>('TODOS')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    itemService.listMine(0, 50, controller.signal)
      .then(result => setItems(result.content))
      .catch(cause => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Não foi possível carregar suas publicações.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [itemService, reload])

  const visibleItems = useMemo(() => {
    if (filter === 'TODOS') return items
    if (filter === 'CANCELADO') return items.filter(item => item.status === 'CANCELADO' || item.status === 'EXPIRADO')
    return items.filter(item => item.status === filter)
  }, [filter, items])

  const counts = {
    total: items.length,
    open: items.filter(item => item.status === 'ABERTO').length,
    negotiating: items.filter(item => item.status === 'EM_NEGOCIACAO').length,
    returned: items.filter(item => item.status === 'DEVOLVIDO').length,
  }

  return (
    <div className="page-container dashboard-page">
      <header className="dashboard-header">
        <div><span className="eyebrow">Área pessoal</span><h1>Meus itens</h1><p>Acompanhe suas publicações e veja rapidamente o que precisa da sua atenção.</p></div>
        <Link className="button button-primary" to="/itens/novo">Publicar novo item</Link>
      </header>

      <section className="item-overview" aria-label="Resumo das publicações">
        <div><span>Total</span><strong>{counts.total}</strong><small>publicações</small></div>
        <div><span>Abertos</span><strong>{counts.open}</strong><small>visíveis no catálogo</small></div>
        <div><span>Em negociação</span><strong>{counts.negotiating}</strong><small>pedem atenção</small></div>
        <div><span>Devolvidos</span><strong>{counts.returned}</strong><small>histórias concluídas</small></div>
      </section>

      <section className="my-items-section" aria-labelledby="my-items-title">
        <div className="my-items-toolbar">
          <div><h2 id="my-items-title">Suas publicações</h2><span>{visibleItems.length} {visibleItems.length === 1 ? 'item' : 'itens'}</span></div>
          <div className="status-tabs" aria-label="Filtrar publicações">
            {filters.map(option => <button type="button" className={filter === option.value ? 'active' : ''} onClick={() => setFilter(option.value)} key={option.value}>{option.label}</button>)}
          </div>
        </div>

        {error && <StateView message={error} action="Tentar novamente" onAction={() => setReload(value => value + 1)} />}
        {!error && loading && <div className="item-grid">{Array.from({ length: 4 }).map((_, index) => <div className="skeleton card-skeleton" key={index} />)}</div>}
        {!error && !loading && items.length === 0 && <div className="personal-empty"><div aria-hidden="true">＋</div><h2>Você ainda não publicou nenhum item</h2><p>Conte à comunidade sobre algo que perdeu ou encontrou.</p><Link className="button button-primary" to="/itens/novo">Criar primeira publicação</Link></div>}
        {!error && !loading && items.length > 0 && visibleItems.length === 0 && <StateView message="Nenhuma publicação neste status." action="Ver todos" onAction={() => setFilter('TODOS')} />}
        {!error && !loading && visibleItems.length > 0 && <div className="item-grid">{visibleItems.map(item => <ItemCard item={item} key={item.id} />)}</div>}
      </section>
    </div>
  )
}
