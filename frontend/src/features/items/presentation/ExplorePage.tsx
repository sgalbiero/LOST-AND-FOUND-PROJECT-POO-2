import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Page } from '../../../shared/domain/Page'
import { StateView } from '../../../shared/ui/StateView'
import type { CatalogOption } from '../../catalog/domain/CatalogOption'
import type { ItemFilters, ItemSummary, ItemType } from '../domain/Item'
import { ItemCard } from './ItemCard'
import { useItemServices } from './ItemServicesContext'

export function ExplorePage() {
  const { items: itemService, catalog } = useItemServices()
  const [params, setParams] = useSearchParams()
  const [page, setPage] = useState<Page<ItemSummary> | null>(null)
  const [items, setItems] = useState<ItemSummary[]>([])
  const [categories, setCategories] = useState<CatalogOption[]>([])
  const [locations, setLocations] = useState<CatalogOption[]>([])
  const [searchTerm, setSearchTerm] = useState(params.get('termo') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pageNumber = Number(params.get('page') || 0)
  const queryKey = params.toString()
  const activeFilterCount = ['termo', 'tipo', 'categoriaId', 'localId']
    .filter(name => params.has(name)).length

  useEffect(() => {
    const controller = new AbortController()
    catalog.listActive(controller.signal)
      .then(result => { setCategories(result.categories); setLocations(result.locations) })
      .catch(cause => { if (cause instanceof DOMException && cause.name === 'AbortError') return })
    return () => controller.abort()
  }, [catalog])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    itemService.search(filtersFrom(params), controller.signal)
      .then(result => {
        setPage(result)
        setItems(current => pageNumber > 0 ? [...current, ...result.content] : result.content)
      })
      .catch(cause => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os itens.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [itemService, queryKey, pageNumber])

  function change(name: string, value: string) {
    const next = new URLSearchParams(params)
    value ? next.set(name, value) : next.delete(name)
    next.delete('page')
    setParams(next)
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    change('termo', searchTerm.trim())
  }

  function clearFilters() {
    setSearchTerm('')
    setParams({})
  }

  function optionName(options: CatalogOption[], value: string | null) {
    return options.find(option => String(option.id) === value)?.name
  }

  const activeFilters = [
    params.get('termo') && { key: 'termo', label: `Busca: ${params.get('termo')}` },
    params.get('tipo') && { key: 'tipo', label: params.get('tipo') === 'PERDIDO' ? 'Itens perdidos' : 'Itens encontrados' },
    params.get('categoriaId') && { key: 'categoriaId', label: optionName(categories, params.get('categoriaId')) || 'Categoria' },
    params.get('localId') && { key: 'localId', label: optionName(locations, params.get('localId')) || 'Local' },
  ].filter((filter): filter is { key: string; label: string } => Boolean(filter))

  return (
    <>
      <section className="catalog-hero">
        <div className="catalog-hero-content">
          <div>
            <span className="eyebrow">Achados e perdidos da comunidade</span>
            <h1>Encontre o que importa.</h1>
            <p>Pesquise publicações recentes ou ajude um item a voltar para casa.</p>
          </div>
          <Link className="button button-primary catalog-hero-action" to="/itens/novo">Publicar um item</Link>
        </div>
      </section>
      <section className="catalog-section" aria-labelledby="explore-title">
        <div className="catalog-controls">
          <form className="catalog-search" role="search" onSubmit={search}>
            <label htmlFor="catalog-search">O que você está procurando?</label>
            <div className="catalog-search-row">
              <input id="catalog-search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Ex.: mochila azul, chave, documento..." />
              <button className="button button-primary" type="submit">Buscar</button>
            </div>
          </form>
          <div className="filter-row" aria-label="Filtros do catálogo">
            <div className="type-filter" aria-label="Tipo de publicação">
              <button type="button" className={!params.get('tipo') ? 'active' : ''} onClick={() => change('tipo', '')}>Todos</button>
              <button type="button" className={params.get('tipo') === 'PERDIDO' ? 'active' : ''} onClick={() => change('tipo', 'PERDIDO')}>Perdidos</button>
              <button type="button" className={params.get('tipo') === 'ENCONTRADO' ? 'active' : ''} onClick={() => change('tipo', 'ENCONTRADO')}>Encontrados</button>
            </div>
            <label><span>Categoria</span><select value={params.get('categoriaId') || ''} onChange={event => change('categoriaId', event.target.value)}><option value="">Todas as categorias</option>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
            <label><span>Local</span><select value={params.get('localId') || ''} onChange={event => change('localId', event.target.value)}><option value="">Todos os locais</option>{locations.map(location => <option value={location.id} key={location.id}>{location.name}</option>)}</select></label>
            {activeFilterCount > 0 && <button className="clear-filters" type="button" onClick={clearFilters}>Limpar filtros ({activeFilterCount})</button>}
          </div>
          {activeFilters.length > 0 && <div className="active-filters" aria-label="Filtros ativos">{activeFilters.map(filter => <button type="button" key={filter.key} onClick={() => { if (filter.key === 'termo') setSearchTerm(''); change(filter.key, '') }}>{filter.label}<span aria-hidden="true">×</span></button>)}</div>}
        </div>
        <div className="catalog-toolbar">
          <div><span className="eyebrow">Publicações recentes</span><h2 id="explore-title">Itens da comunidade</h2></div>
          <div className="catalog-summary" aria-live="polite">{page && <strong>{page.totalElements} {page.totalElements === 1 ? 'resultado' : 'resultados'}</strong>}<span>Mais recentes primeiro</span></div>
        </div>
        {error && <StateView message={error} action="Tentar novamente" onAction={() => setParams(new URLSearchParams(params))} />}
        {!error && loading && items.length === 0 && <div className="item-grid">{Array.from({ length: 8 }).map((_, index) => <div className="skeleton card-skeleton" key={index} />)}</div>}
        {!error && !loading && items.length === 0 && <StateView message="Nenhum item combina com esses filtros." action="Limpar filtros" onAction={clearFilters} />}
        <div className="item-grid">{items.map(item => <ItemCard item={item} key={item.id} />)}</div>
        {page && !page.last && <div className="load-more"><button className="button button-secondary" disabled={loading} onClick={() => { const next = new URLSearchParams(params); next.set('page', String(pageNumber + 1)); setParams(next) }}>{loading ? 'Carregando...' : 'Carregar mais'}</button></div>}
      </section>
    </>
  )
}

function filtersFrom(params: URLSearchParams): ItemFilters {
  const type = params.get('tipo') as ItemType | null
  return {
    term: params.get('termo') || undefined,
    type: type || undefined,
    categoryId: numberOrUndefined(params.get('categoriaId')),
    locationId: numberOrUndefined(params.get('localId')),
    page: numberOrUndefined(params.get('page')) ?? 0,
  }
}

function numberOrUndefined(value: string | null) {
  if (!value) return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}
