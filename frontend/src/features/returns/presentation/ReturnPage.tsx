import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/presentation/AuthContext'
import type { Claim } from '../../claims/domain/Claim'
import { useClaimService } from '../../claims/presentation/ClaimServicesContext'
import type { ItemDetails } from '../../items/domain/Item'
import { useItemServices } from '../../items/presentation/ItemServicesContext'
import { useMessageServices } from '../../messages/presentation/MessageServicesContext'
import type { ReturnRecord } from '../domain/ReturnRecord'
import { useReturnService } from './ReturnServicesContext'

export function ReturnPage() {
  const { id } = useParams()
  const itemId = Number(id)
  const { user } = useAuth()
  const { items } = useItemServices()
  const claims = useClaimService()
  const { service: messages } = useMessageServices()
  const returns = useReturnService()
  const navigate = useNavigate()
  const [item, setItem] = useState<ItemDetails | null>(null)
  const [acceptedClaim, setAcceptedClaim] = useState<Claim | null>(null)
  const [record, setRecord] = useState<ReturnRecord | null>(null)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    async function load() {
      try {
        const loadedItem = await items.get(itemId, controller.signal)
        setItem(loadedItem)
        const conversations = user ? await messages.listConversations(controller.signal) : []
        setConversationId(conversations.find(conversation => conversation.itemId === itemId)?.id ?? null)
        if (loadedItem.status === 'DEVOLVIDO') {
          setRecord(await returns.findByItem(itemId, controller.signal))
        } else if (loadedItem.status === 'EM_NEGOCIACAO' && user?.id === loadedItem.owner.id) {
          const itemClaims = await claims.listForItem(itemId, controller.signal)
          setAcceptedClaim(itemClaims.find(claim => claim.status === 'ACEITA') ?? null)
        } else {
          setError('Este item ainda não está pronto para registrar uma devolução.')
        }
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Não foi possível carregar a devolução.')
      } finally { if (!controller.signal.aborted) setLoading(false) }
    }
    void load()
    return () => controller.abort()
  }, [claims, itemId, items, messages, returns, user])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!confirmed) { setError('Confirme que a entrega foi realizada antes de continuar.'); return }
    setSubmitting(true)
    setError('')
    try {
      const created = await returns.register(itemId, note)
      setRecord(created)
      setItem(current => current ? { ...current, status: 'DEVOLVIDO' } : current)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível registrar a devolução.')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="page-container return-loading skeleton" />
  if (!item) return <div className="page-container"><div className="form-error">{error || 'Item não encontrado.'}</div></div>

  return <div className="page-container return-page">
    <button className="back-link return-back" type="button" onClick={() => navigate(`/itens/${item.id}`)}>← Voltar para o item</button>
    <div className="return-layout">
      <aside className="return-item-card">
        {(item.mainPhoto ?? item.photos[0]) ? <img src={item.mainPhoto ?? item.photos[0]} alt={`Foto de ${item.title}`} /> : <div className="photo-placeholder"><span aria-hidden="true">◇</span><small>Sem foto</small></div>}
        <div><span className={`status status-${item.status.toLowerCase()}`}>{item.status === 'DEVOLVIDO' ? 'Devolvido' : 'Em negociação'}</span><h2>{item.title}</h2><p>{item.category} · {item.location}</p></div>
      </aside>

      <main className="return-content">
        {record ? <Receipt record={record} item={item} recipientName={acceptedClaim?.claimant.name ?? user?.name} conversationId={conversationId} /> : <>
          <span className="eyebrow">Etapa final</span><h1>Confirmar devolução</h1><p className="return-lead">Registre somente depois que o item tiver sido entregue. Esta ação encerra a publicação e não poderá ser desfeita.</p>
          {error && <div className="form-error" role="alert">{error}</div>}
          <section className="return-recipient"><span>Entrega combinada com</span><strong>{acceptedClaim?.claimant.name ?? 'Reivindicante aceito'}</strong><small>Reivindicação #{acceptedClaim?.id ?? 'aceita'}</small></section>
          <form className="return-form" onSubmit={submit}>
            <label><span>Observação (opcional)</span><textarea rows={4} maxLength={1000} value={note} onChange={event => setNote(event.target.value)} placeholder="Ex.: Entregue pessoalmente na portaria." /><small>{note.length}/1000 caracteres</small></label>
            <label className="confirmation-check"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /><span><strong>Confirmo que o item foi entregue</strong><small>O status mudará para devolvido e as reivindicações pendentes serão encerradas.</small></span></label>
            <div className="return-actions">{conversationId && <Link className="button button-secondary" to={`/mensagens?conversa=${conversationId}`}>Voltar à conversa</Link>}<button className="button button-primary" disabled={submitting}>{submitting ? 'Registrando...' : 'Registrar devolução'}</button></div>
          </form>
        </>}
      </main>
    </div>
  </div>
}

function Receipt({ record, item, recipientName, conversationId }: { record: ReturnRecord; item: ItemDetails; recipientName?: string; conversationId: number | null }) {
  return <div className="return-receipt">
    <div className="receipt-icon" aria-hidden="true">✓</div><span className="eyebrow">Devolução concluída</span><h1>Item devolvido com sucesso</h1><p>Este registro permanece disponível para as pessoas envolvidas.</p>
    <dl><div><dt>Item</dt><dd>{item.title}</dd></div><div><dt>Recebedor</dt><dd>{recipientName ?? `Reivindicação #${record.claimId}`}</dd></div><div><dt>Confirmado por</dt><dd>{record.confirmedBy.name}</dd></div><div><dt>Data da devolução</dt><dd>{formatDateTime(record.returnedAt)}</dd></div>{record.note && <div className="receipt-note"><dt>Observação</dt><dd>{record.note}</dd></div>}</dl>
    <div className="return-actions"><Link className="button button-secondary" to={`/itens/${item.id}`}>Ver item</Link>{conversationId && <Link className="button button-primary" to={`/mensagens?conversa=${conversationId}`}>Abrir histórico da conversa</Link>}</div>
  </div>
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
}
