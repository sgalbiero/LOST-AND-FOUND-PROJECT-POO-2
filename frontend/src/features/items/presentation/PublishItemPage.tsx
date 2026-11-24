import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Field } from '../../../shared/ui/Field'
import { StateView } from '../../../shared/ui/StateView'
import type { CatalogOption } from '../../catalog/domain/CatalogOption'
import type { ItemDetails, ItemType } from '../domain/Item'
import { useItemServices } from './ItemServicesContext'

export function PublishItemPage() {
  const { items, catalog } = useItemServices()
  const navigate = useNavigate()
  const { id } = useParams()
  const itemId = Number(id)
  const editing = Number.isInteger(itemId) && itemId > 0
  const [categories, setCategories] = useState<CatalogOption[]>([])
  const [locations, setLocations] = useState<CatalogOption[]>([])
  const [item, setItem] = useState<ItemDetails | null>(null)
  const [loading, setLoading] = useState(editing)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      catalog.listActive(controller.signal),
      editing ? items.get(itemId, controller.signal) : Promise.resolve(null),
    ]).then(([options, loaded]) => {
      setCategories(options.categories)
      setLocations(options.locations)
      setItem(loaded)
    }).catch(cause => {
      if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar o formulário.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [catalog, editing, itemId, items])

  if (loading) return <div className="page-container detail-skeleton skeleton" />
  if (error && editing && !item) return <div className="page-container"><StateView message={error} action="Voltar" onAction={() => navigate(`/itens/${itemId}`)} /></div>
  return <ItemForm item={item} categories={categories} locations={locations} initialError={error} />
}

function ItemForm({ item, categories, locations, initialError }: { item: ItemDetails | null; categories: CatalogOption[]; locations: CatalogOption[]; initialError: string }) {
  const { items } = useItemServices()
  const navigate = useNavigate()
  const [type, setType] = useState<ItemType>(item?.type ?? 'PERDIDO')
  const [error, setError] = useState(initialError)
  const [submitting, setSubmitting] = useState(false)
  const editing = Boolean(item)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const values = {
      title: String(data.get('titulo')),
      description: String(data.get('descricao')),
      occurrenceDate: String(data.get('dataOcorrencia')),
      custodyLocation: String(data.get('localGuarda') || ''),
      categoryId: Number(data.get('categoriaId')),
      locationId: Number(data.get('localId')),
      photos: String(data.get('fotos')).split('\n'),
    }
    setSubmitting(true); setError('')
    try {
      const saved = item ? await items.update(item.id, values) : await items.publish({ ...values, type })
      navigate(`/itens/${saved.id}`, { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Não foi possível ${editing ? 'salvar' : 'publicar'}.`)
    } finally { setSubmitting(false) }
  }

  return (
    <div className="page-container form-page">
      <div className="form-intro"><span className="eyebrow">{editing ? 'Editar publicação' : 'Nova publicação'}</span><h1>{editing ? 'Atualize os detalhes' : 'O que aconteceu?'}</h1><p>{editing ? 'Mantenha as informações precisas para ajudar a comunidade.' : 'Quanto mais claros forem os detalhes, maior a chance de uma boa correspondência.'}</p></div>
      <form className="form item-form" onSubmit={submit}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <fieldset className="type-choice" disabled={editing}><legend>Você perdeu ou encontrou?</legend><label className={type === 'PERDIDO' ? 'selected' : ''}><input type="radio" name="tipo" checked={type === 'PERDIDO'} onChange={() => setType('PERDIDO')} /><strong>Perdi um item</strong><span>Quero que a comunidade me ajude a encontrar.</span></label><label className={type === 'ENCONTRADO' ? 'selected' : ''}><input type="radio" name="tipo" checked={type === 'ENCONTRADO'} onChange={() => setType('ENCONTRADO')} /><strong>Encontrei um item</strong><span>Quero devolver ao verdadeiro dono.</span></label></fieldset>
        {editing && <small>O tipo da publicação não pode ser alterado depois de publicado.</small>}
        <Field label="Título" name="titulo" maxLength={255} placeholder="Ex.: Mochila azul-marinho" defaultValue={item?.title} required />
        <label><span>Descrição</span><textarea name="descricao" maxLength={300} rows={5} defaultValue={item?.description} placeholder="Descreva marcas, cores e características que ajudam a reconhecer o item." required /></label>
        <div className="form-row"><Field label="Data da ocorrência" name="dataOcorrencia" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={item?.occurrenceDate} required /><label><span>Categoria</span><select name="categoriaId" defaultValue={item?.categoryId ?? ''} required><option value="">Selecione</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div>
        <div className="form-row"><label><span>Local</span><select name="localId" defaultValue={item?.locationId ?? ''} required><option value="">Selecione</option>{locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label><Field label="Local de guarda (opcional)" name="localGuarda" maxLength={255} defaultValue={item?.custodyLocation} /></div>
        <label><span>URLs das fotos</span><textarea name="fotos" rows={3} defaultValue={item?.photos.join('\n')} placeholder="Uma URL HTTPS por linha (1 a 3 fotos)" required /><small>O upload direto será habilitado quando definirmos o armazenamento na AWS.</small></label>
        <div className="form-actions"><Link className="button button-ghost" to={item ? `/itens/${item.id}` : '/'}>Cancelar</Link><button className="button button-primary" disabled={submitting}>{submitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Publicar item'}</button></div>
      </form>
    </div>
  )
}
