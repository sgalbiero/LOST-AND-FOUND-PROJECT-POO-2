import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/presentation/AuthContext'
import { StateView } from '../../../shared/ui/StateView'
import { formatDate } from '../../../shared/ui/format'
import type { ItemDetails } from '../domain/Item'
import { itemStatusLabels } from './itemLabels'
import { useItemServices } from './ItemServicesContext'
import { useModeration } from '../../moderation/presentation/ModerationContext'
import { ConfirmDialog, TextDialog } from '../../../shared/ui/Dialog'
import { loginPath } from '../../auth/presentation/authNavigation'

export function ItemDetailsPage() {
  const { items } = useItemServices()
  const moderation = useModeration()
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [item, setItem] = useState<ItemDetails | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    items.get(Number(id), controller.signal).then(setItem).catch(cause => {
      if (cause instanceof DOMException && cause.name === 'AbortError') return
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar o item.')
    })
    return () => controller.abort()
  }, [id, items])

  if (error) return <div className="page-container"><StateView message={error} action="Voltar para explorar" onAction={() => navigate('/')} /></div>
  if (!item) return <div className="page-container detail-skeleton skeleton" />
  const ownItem = user?.id === item.owner.id
  const currentItemId = item.id

  async function cancelItem() {
    setBusy(true); setError('')
    try { setItem(await items.cancel(currentItemId)); setCancelOpen(false); setFeedback('Publicação cancelada.') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível cancelar a publicação.') }
    finally { setBusy(false) }
  }

  async function reportItem(reason: string) {
    setBusy(true); setError('')
    try { await moderation.reportItem(currentItemId, reason); setReportOpen(false); setFeedback('Denúncia enviada para a equipe.') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível enviar a denúncia.') }
    finally { setBusy(false) }
  }

  return (
    <div className="page-container detail-page">
      <Link className="back-link" to="/">Voltar para explorar</Link>
      {feedback && <div className="success-banner" role="status">{feedback}</div>}
      <div className="detail-grid">
        <div className="gallery">
          {item.photos.length ? item.photos.map((photo, index) => <img src={photo} alt={`${item.title}, foto ${index + 1}`} key={photo} />) : <div className="photo-placeholder large">Sem foto</div>}
        </div>
        <article className="detail-content">
          <div className="detail-badges"><span className={`type-badge ${item.type.toLowerCase()}`}>{item.type === 'PERDIDO' ? 'Item perdido' : 'Item encontrado'}</span><span className={`status status-${item.status.toLowerCase()}`}>{itemStatusLabels[item.status]}</span></div>
          <h1>{item.title}</h1>
          <p className="detail-description">{item.description}</p>
          <dl className="facts"><div><dt>Data</dt><dd>{formatDate(item.occurrenceDate)}</dd></div><div><dt>Local</dt><dd>{item.location}</dd></div><div><dt>Categoria</dt><dd>{item.category}</dd></div><div><dt>Publicado por</dt><dd>{item.owner.name}</dd></div></dl>
          {ownItem ? (
            <div className="action-stack">
              {item.status === 'ABERTO' && <button className="button button-primary" onClick={() => navigate(`/itens/${item.id}/editar`)}>Editar publicação</button>}
              {item.status === 'EM_NEGOCIACAO' && <button className="button button-primary" onClick={() => navigate(`/itens/${item.id}/devolucao`)}>Registrar devolução</button>}
              {item.status === 'DEVOLVIDO' && <button className="button button-primary" onClick={() => navigate(`/itens/${item.id}/devolucao`)}>Ver comprovante</button>}
              {item.status === 'ABERTO' && <button className="button button-secondary" onClick={() => navigate('/reivindicacoes?aba=recebidas')}>Ver reivindicações</button>}
              {item.status === 'ABERTO' && <button className="button button-ghost" disabled={busy} onClick={() => setCancelOpen(true)}>Cancelar publicação</button>}
              {item.status === 'EM_NEGOCIACAO' && <button className="button button-secondary" onClick={() => navigate(`/mensagens?item=${item.id}`)}>Abrir conversa</button>}
            </div>
          ) : item.status === 'ABERTO' ? (
            <div className="action-stack"><button className="button button-primary" onClick={() => navigate(user ? `/reivindicacoes?item=${item.id}` : loginPath(`/reivindicacoes?item=${item.id}`))}>Reivindicar item</button>{user && <button className="button button-ghost" disabled={busy} onClick={() => setReportOpen(true)}>Denunciar publicação</button>}</div>
          ) : <div className="closed-item-note">{item.status === 'DEVOLVIDO' ? 'Este item já foi devolvido.' : 'Este item já está em negociação.'}</div>}
          <p className="safety-note"><strong>Cuide dos seus dados.</strong> Combine detalhes pelo portal e não publique telefone ou endereço.</p>
        </article>
      </div>
      {reportOpen && <TextDialog title="Denunciar publicação" description="Explique objetivamente por que este conteúdo precisa ser analisado pela equipe." label="Motivo da denúncia" submitLabel="Enviar denúncia" busy={busy} onClose={() => setReportOpen(false)} onSubmit={reportItem} />}
      {cancelOpen && <ConfirmDialog title="Cancelar publicação?" description="A publicação deixará de aparecer nas buscas e esta ação não poderá ser desfeita." confirmLabel="Cancelar publicação" danger busy={busy} onClose={() => setCancelOpen(false)} onConfirm={cancelItem} />}
    </div>
  )
}
