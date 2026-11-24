import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { Claim, ClaimStatus } from '../domain/Claim'
import type { ItemDetails } from '../../items/domain/Item'
import { useItemServices } from '../../items/presentation/ItemServicesContext'
import { StateView } from '../../../shared/ui/StateView'
import { useClaimService } from './ClaimServicesContext'
import { useMessageServices } from '../../messages/presentation/MessageServicesContext'

type Tab = 'enviadas' | 'recebidas'

const statusLabels: Record<ClaimStatus, string> = {
  PENDENTE: 'Aguardando resposta',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
  CANCELADA: 'Cancelada',
}

export function ClaimsPage() {
  const claims = useClaimService()
  const { service: messages } = useMessageServices()
  const { items: itemService } = useItemServices()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(params.get('aba') === 'recebidas' ? 'recebidas' : 'enviadas')
  const [sent, setSent] = useState<Claim[]>([])
  const [received, setReceived] = useState<Claim[]>([])
  const [claimItem, setClaimItem] = useState<ItemDetails | null>(null)
  const [justification, setJustification] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [actionId, setActionId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [reload, setReload] = useState(0)
  const itemId = Number(params.get('item'))

  useEffect(() => {
    if (!Number.isInteger(itemId) || itemId <= 0) { setClaimItem(null); return }
    const controller = new AbortController()
    itemService.get(itemId, controller.signal)
      .then(setClaimItem)
      .catch(cause => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Não foi possível abrir o item.')
      })
    return () => controller.abort()
  }, [itemId, itemService])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    Promise.all([
      claims.listMine(controller.signal),
      claims.listReceived(controller.signal),
    ]).then(([mine, receivedPage]) => {
      if (controller.signal.aborted) return
      setSent(mine.content)
      setReceived(receivedPage.content)
    }).catch(cause => {
      if (cause instanceof DOMException && cause.name === 'AbortError') return
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as reivindicações.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [claims, itemService, reload])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!claimItem) return
    setSubmitting(true)
    setError('')
    try {
      await claims.create(claimItem.id, justification)
      setJustification('')
      setClaimItem(null)
      setTab('enviadas')
      setParams({})
      setFeedback('Reivindicação enviada. O responsável pelo item já pode analisá-la.')
      setReload(value => value + 1)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível enviar a reivindicação.')
    } finally { setSubmitting(false) }
  }

  async function perform(id: number, action: 'accept' | 'refuse' | 'cancel') {
    setActionId(id)
    setError('')
    setFeedback('')
    try {
      if (action === 'accept') {
        const accepted = await claims.accept(id)
        const conversation = await messages.start(accepted.itemId)
        navigate(`/mensagens?conversa=${conversation.id}`)
        return
      }
      if (action === 'refuse') await claims.refuse(id)
      if (action === 'cancel') await claims.cancel(id)
      setFeedback(action === 'refuse' ? 'Reivindicação recusada.' : 'Reivindicação cancelada.')
      setReload(value => value + 1)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível concluir esta ação.')
    } finally { setActionId(null) }
  }

  const visible = tab === 'enviadas' ? sent : received

  return (
    <div className="page-container claims-page">
      <header className="claims-header"><div><span className="eyebrow">Conexões seguras</span><h1>Reivindicações</h1><p>Acompanhe itens que você reconheceu e responda às pessoas interessadas nas suas publicações.</p></div></header>

      {claimItem && <section className="claim-composer" aria-labelledby="claim-form-title">
        <div className="claim-item-summary"><span className={`type-badge ${claimItem.type.toLowerCase()}`}>{claimItem.type === 'ENCONTRADO' ? 'Item encontrado' : 'Item perdido'}</span><h2>{claimItem.title}</h2><p>{claimItem.category} · {claimItem.location}</p><Link to={`/itens/${claimItem.id}`}>Ver detalhes do item</Link></div>
        <form onSubmit={submit}>
          <div><span className="eyebrow">Conte apenas o necessário</span><h2 id="claim-form-title">{claimItem.type === 'ENCONTRADO' ? 'Por que este item pode ser seu?' : 'Como você reconheceu este item?'}</h2><p>Descreva uma característica que não esteja óbvia na publicação. Não informe documentos, senhas ou endereço.</p></div>
          <label><span>Detalhes para identificação</span><textarea value={justification} onChange={event => setJustification(event.target.value)} rows={5} maxLength={1000} placeholder="Ex.: há um chaveiro específico no bolso interno..." required /><small>{justification.length}/1000 caracteres</small></label>
          <div className="form-actions"><button className="button button-ghost" type="button" onClick={() => { setClaimItem(null); setParams({}) }}>Agora não</button><button className="button button-primary" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar reivindicação'}</button></div>
        </form>
      </section>}

      {feedback && <div className="success-banner" role="status">{feedback}</div>}
      {error && <div className="form-error" role="alert">{error}</div>}

      <section className="claims-panel" aria-labelledby="claims-list-title">
        <div className="claims-tabs" role="tablist" aria-label="Tipos de reivindicação">
          <button role="tab" aria-selected={tab === 'enviadas'} className={tab === 'enviadas' ? 'active' : ''} onClick={() => setTab('enviadas')}>Enviadas <span>{sent.length}</span></button>
          <button role="tab" aria-selected={tab === 'recebidas'} className={tab === 'recebidas' ? 'active' : ''} onClick={() => setTab('recebidas')}>Recebidas <span>{received.length}</span></button>
        </div>
        <div className="claims-list-heading"><div><h2 id="claims-list-title">{tab === 'enviadas' ? 'Reivindicações enviadas' : 'Solicitações recebidas'}</h2><p>{tab === 'enviadas' ? 'Veja o andamento das suas solicitações.' : 'Analise as informações antes de aceitar uma solicitação.'}</p></div>{tab === 'enviadas' && <Link className="button button-secondary" to="/">Explorar itens</Link>}</div>

        {loading && <div className="claims-list">{Array.from({ length: 3 }).map((_, index) => <div className="claim-card skeleton" key={index} />)}</div>}
        {!loading && visible.length === 0 && <StateView message={tab === 'enviadas' ? 'Você ainda não enviou nenhuma reivindicação.' : 'Nenhuma pessoa reivindicou seus itens até agora.'} action={tab === 'enviadas' ? 'Explorar itens' : 'Ver meus itens'} onAction={() => location.assign(tab === 'enviadas' ? '/' : '/meus-itens')} />}
        {!loading && visible.length > 0 && <div className="claims-list">{visible.map(claim => <ClaimCard claim={claim} received={tab === 'recebidas'} busy={actionId === claim.id} onAction={perform} key={claim.id} />)}</div>}
      </section>
    </div>
  )
}

function ClaimCard({ claim, received, busy, onAction }: { claim: Claim; received: boolean; busy: boolean; onAction(id: number, action: 'accept' | 'refuse' | 'cancel'): void }) {
  return <article className="claim-card">
    <div className="claim-card-main"><div className="claim-card-top"><span className={`claim-status claim-status-${claim.status.toLowerCase()}`}>{statusLabels[claim.status]}</span><time dateTime={claim.createdAt}>{formatDateTime(claim.createdAt)}</time></div><Link to={`/itens/${claim.itemId}`}><h3>{claim.itemTitle}</h3></Link>{received && <p className="claim-person">Enviada por <strong>{claim.claimant.name}</strong></p>}<blockquote>{claim.justification}</blockquote></div>
    <div className="claim-card-actions">
      <Link className="button button-ghost" to={`/itens/${claim.itemId}`}>Ver item</Link>
      {received && claim.status === 'PENDENTE' && <><button className="button button-secondary" disabled={busy} onClick={() => onAction(claim.id, 'refuse')}>Recusar</button><button className="button button-primary" disabled={busy} onClick={() => onAction(claim.id, 'accept')}>Aceitar</button></>}
      {!received && (claim.status === 'PENDENTE' || claim.status === 'ACEITA') && <button className="button button-secondary" disabled={busy} onClick={() => onAction(claim.id, 'cancel')}>Cancelar</button>}
      {claim.status === 'ACEITA' && <Link className="button button-primary" to={`/mensagens?item=${claim.itemId}`}>Abrir conversa</Link>}
    </div>
  </article>
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
