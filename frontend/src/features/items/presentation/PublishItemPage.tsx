import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Field } from '../../../shared/ui/Field'
import { StateView } from '../../../shared/ui/StateView'
import type { CatalogOption } from '../../catalog/domain/CatalogOption'
import type { ItemDetails, ItemType } from '../domain/Item'
import { useItemServices } from './ItemServicesContext'
import { PublicationTypeChoice } from './PublicationTypeChoice'
import { localDateInputValue } from '../../../shared/ui/format'

export function PublishItemPage() {
  const { items, catalog } = useItemServices()
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
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
  const requestedType = searchParams.get('tipo')
  const initialType: ItemType = requestedType === 'ENCONTRADO' ? 'ENCONTRADO' : 'PERDIDO'
  return <ItemForm item={item} categories={categories} locations={locations} initialError={error} initialType={initialType} />
}

function ItemForm({ item, categories, locations, initialError, initialType }: { item: ItemDetails | null; categories: CatalogOption[]; locations: CatalogOption[]; initialError: string; initialType: ItemType }) {
  const { items } = useItemServices()
  const navigate = useNavigate()
  const [type, setType] = useState<ItemType>(item?.type ?? initialType)
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
      <aside className="form-intro">
        <span className="eyebrow">{editing ? 'Editar publicação' : 'Nova publicação'}</span>
        <h1>{editing ? 'Atualize os detalhes' : 'Crie seu aviso'}</h1>
        <p>{editing ? 'Mantenha as informações precisas para ajudar a comunidade.' : 'Leva cerca de 2 minutos. Informe apenas o necessário para reconhecer o item.'}</p>
        <ol className="form-progress" aria-label="Etapas da publicação">
          <li><span>1</span><div><strong>Tipo do aviso</strong><small>Perdido ou encontrado</small></div></li>
          <li><span>2</span><div><strong>Detalhes do item</strong><small>Descrição e identificação</small></div></li>
          <li><span>3</span><div><strong>Quando e onde</strong><small>Contexto da ocorrência</small></div></li>
          <li><span>4</span><div><strong>Fotos e publicação</strong><small>Revise antes de enviar</small></div></li>
        </ol>
        <div className="privacy-callout"><strong>Seus dados ficam protegidos</strong><span>As conversas acontecem dentro da plataforma.</span></div>
      </aside>
      <form className="form item-form" onSubmit={submit}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <section className="form-section" aria-labelledby="form-step-type"><div className="form-section-heading"><span>1</span><div><h2 id="form-step-type">Tipo do aviso</h2><p>Escolha a opção que melhor descreve sua situação.</p></div></div><PublicationTypeChoice value={type} disabled={editing} onChange={setType} />{editing && <small>O tipo da publicação não pode ser alterado depois de publicado.</small>}</section>
        <section className="form-section" aria-labelledby="form-step-details"><div className="form-section-heading"><span>2</span><div><h2 id="form-step-details">Detalhes do item</h2><p>Use informações que outra pessoa conseguiria reconhecer.</p></div></div><Field label="Título" name="titulo" maxLength={255} placeholder="Ex.: Mochila azul-marinho" defaultValue={item?.title} required /><label><span>Descrição</span><textarea name="descricao" maxLength={300} rows={5} defaultValue={item?.description} placeholder="Cor, marca, tamanho e sinais particulares — sem revelar todos os detalhes de segurança." required /><small>Guarde um detalhe exclusivo para confirmar o verdadeiro dono.</small></label></section>
        <section className="form-section" aria-labelledby="form-step-context"><div className="form-section-heading"><span>3</span><div><h2 id="form-step-context">Quando e onde</h2><p>Essas informações ajudam a filtrar possíveis correspondências.</p></div></div><div className="form-row"><Field label="Data da ocorrência" name="dataOcorrencia" type="date" max={localDateInputValue()} defaultValue={item?.occurrenceDate} required /><label><span>Categoria</span><select name="categoriaId" defaultValue={item?.categoryId ?? ''} required><option value="">Selecione uma categoria</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div><div className="form-row"><label><span>Local da ocorrência</span><select name="localId" defaultValue={item?.locationId ?? ''} required><option value="">Selecione um local</option>{locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label><Field label="Onde o item está guardado? (opcional)" name="localGuarda" maxLength={255} defaultValue={item?.custodyLocation} placeholder="Ex.: Portaria do bloco B" /></div></section>
        <section className="form-section" aria-labelledby="form-step-photos"><div className="form-section-heading"><span>4</span><div><h2 id="form-step-photos">Fotos e publicação</h2><p>Uma boa foto acelera o reconhecimento.</p></div></div><label><span>Links das fotos</span><textarea name="fotos" rows={3} defaultValue={item?.photos.join('\n')} placeholder="Cole uma URL HTTPS por linha (de 1 a 3 fotos)" required /><small>Por enquanto usamos links de imagem; o envio direto será habilitado quando o armazenamento estiver disponível.</small></label></section>
        <div className="form-actions"><Link className="button button-ghost" to={item ? `/itens/${item.id}` : '/'}>Cancelar</Link><button className="button button-primary" disabled={submitting}>{submitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Publicar item'}</button></div>
      </form>
    </div>
  )
}
