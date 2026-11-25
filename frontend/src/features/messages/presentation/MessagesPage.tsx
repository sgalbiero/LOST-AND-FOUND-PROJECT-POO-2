import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/presentation/AuthContext'
import type { Conversation, Message } from '../domain/Conversation'
import { useMessageServices } from './MessageServicesContext'
import { useModeration } from '../../moderation/presentation/ModerationContext'
import { ConfirmDialog, TextDialog } from '../../../shared/ui/Dialog'
import { useMediaQuery } from '../../../shared/ui/useMediaQuery'
import { canRequestMediation, shouldAutoSelectConversation, shouldPollConversation } from './messageFlow'

export function MessagesPage() {
  const { user } = useAuth()
  const { service, refreshUnread } = useMessageServices()
  const moderation = useModeration()
  const [params, setParams] = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [closing, setClosing] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [messagePage, setMessagePage] = useState(0)
  const [hasOlder, setHasOlder] = useState(false)
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [reportingMessageId, setReportingMessageId] = useState<number | null>(null)
  const [closureOpen, setClosureOpen] = useState(false)
  const mobile = useMediaQuery('(max-width: 640px)')
  const initialSelectionHandled = useRef(false)
  const activeConversationId = useRef<number | null>(null)
  const selectedId = Number(params.get('conversa'))
  const itemId = Number(params.get('item'))
  const selected = conversations.find(conversation => conversation.id === selectedId) ?? null
  const selectedConversationId = selected?.id
  const selectedClosedAt = selected?.closedAt
  const content = selected ? drafts[selected.id] ?? '' : ''
  const otherParticipant = selected ? (selected.owner.id === user?.id ? selected.interested : selected.owner) : null
  const conversationTitle = selected && user?.role === 'ADMIN' ? `${selected.owner.name} e ${selected.interested.name}` : otherParticipant?.name
  const ownRequestedClosure = selected && user
    ? (selected.owner.id === user.id ? selected.ownerRequestedClosure : selected.interestedRequestedClosure)
    : false
  const otherRequestedClosure = selected && user
    ? (selected.owner.id === user.id ? selected.interestedRequestedClosure : selected.ownerRequestedClosure)
    : false

  const loadConversations = useCallback(async (signal?: AbortSignal) => {
    const result = await service.listConversations(signal)
    signal?.throwIfAborted()
    setConversations(result)
    return result
  }, [service])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    async function load() {
      try {
        let result = await loadConversations(controller.signal)
        if (Number.isInteger(itemId) && itemId > 0) {
          const conversation = await service.start(itemId)
          result = await loadConversations(controller.signal)
          setParams({ conversa: String(conversation.id) }, { replace: true })
        } else if (shouldAutoSelectConversation({ mobile, selectionHandled: initialSelectionHandled.current, requestedId: selectedId, conversationCount: result.length })) {
          setParams({ conversa: String(result[0].id) }, { replace: true })
        }
        initialSelectionHandled.current = true
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as conversas.')
      } finally { if (!controller.signal.aborted) setLoading(false) }
    }
    void load()
    return () => controller.abort()
  }, [itemId, loadConversations, mobile, service, setParams])

  const loadMessages = useCallback(async (conversationId: number, signal?: AbortSignal, polling = false) => {
    const result = await service.listMessages(conversationId, 0, 50, signal)
    signal?.throwIfAborted()
    setMessages(current => polling ? mergeMessages(current, result.content) : result.content)
    if (!polling) setMessagePage(0)
    setHasOlder(!result.last)
    const hasUnreadIncoming = result.content.some(message => message.sender.id !== user?.id && !message.read)
    if (!polling || hasUnreadIncoming) {
      await service.markRead(conversationId)
      await refreshUnread()
      setConversations(current => current.map(conversation => conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation))
    }
  }, [refreshUnread, service, user?.id])

  useEffect(() => {
    if (!selected) { setMessages([]); setClosureOpen(false); setReportingMessageId(null); return }
    activeConversationId.current = selected.id
    const controller = new AbortController()
    setMessages([])
    setHasOlder(false)
    setMessagePage(0)
    setError('')
    setFeedback('')
    setClosureOpen(false)
    setReportingMessageId(null)
    loadMessages(selected.id, controller.signal).catch(cause => {
      if (cause instanceof DOMException && cause.name === 'AbortError') return
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as mensagens.')
    })
    const timer = shouldPollConversation(selected) ? window.setInterval(() => {
      void loadMessages(selected.id, controller.signal, true).then(() => loadConversations(controller.signal)).catch(cause => {
        if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError('Não foi possível atualizar a conversa automaticamente.')
      })
    }, 7000) : undefined
    return () => { controller.abort(); if (activeConversationId.current === selected.id) activeConversationId.current = null; if (timer !== undefined) window.clearInterval(timer) }
  }, [selectedConversationId, selectedClosedAt, loadConversations, loadMessages])

  async function send(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    setSending(true)
    setError('')
    const conversationId = selected.id
    try {
      const message = await service.send(conversationId, content)
      if (activeConversationId.current !== conversationId) return
      setMessages(current => [...current, message])
      setDrafts(current => ({ ...current, [conversationId]: '' }))
      await loadConversations()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível enviar a mensagem.')
    } finally { setSending(false) }
  }

  async function reportMessage(reason: string) {
    if (!reportingMessageId) return
    try { await moderation.reportMessage(reportingMessageId, reason); setReportingMessageId(null); setFeedback('Denúncia enviada para a equipe.') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível enviar a denúncia.') }
  }

  async function requestClosure() {
    if (!selected || ownRequestedClosure || selected.closedAt) return
    setClosing(true); setError('')
    try {
      const updated = await service.requestClosure(selected.id)
      setConversations(current => current.map(conversation => conversation.id === updated.id ? updated : conversation))
      setClosureOpen(false)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível confirmar o encerramento.') }
    finally { setClosing(false) }
  }

  async function loadOlder() {
    if (!selected || !hasOlder) return
    setLoadingOlder(true); setError('')
    const conversationId = selected.id
    try {
      const next = messagePage + 1
      const result = await service.listMessages(conversationId, next, 50)
      if (activeConversationId.current !== conversationId) return
      setMessages(current => mergeMessages(result.content, current))
      setMessagePage(next)
      setHasOlder(!result.last)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível carregar mensagens anteriores.') }
    finally { setLoadingOlder(false) }
  }

  return <div className={`messages-page ${selected ? 'has-selection' : ''}`}>
    <aside className="conversation-sidebar">
      <div className="conversation-sidebar-header"><div><span className="eyebrow">Central de conversas</span><h1>Mensagens</h1></div><span>{conversations.length}</span></div>
      {loading && <div className="conversation-loading skeleton" />}
      {!loading && conversations.length === 0 && <div className="conversation-empty"><h2>{user?.role === 'ADMIN' ? 'Nenhuma mediação assumida' : 'Nenhuma conversa ainda'}</h2><p>{user?.role === 'ADMIN' ? 'Assuma um pedido no Painel da equipe para entrar na conversa.' : 'Depois de reivindicar um item, inicie a conversa pela tela de Reivindicações.'}</p><Link className="button button-secondary" to={user?.role === 'ADMIN' ? '/admin/mediacoes' : '/reivindicacoes'}>{user?.role === 'ADMIN' ? 'Ver pedidos de ajuda' : 'Ver reivindicações'}</Link></div>}
      <div className="conversation-list">{conversations.map(conversation => {
        const other = conversation.owner.id === user?.id ? conversation.interested : conversation.owner
        const label = user?.role === 'ADMIN' ? `${conversation.owner.name} e ${conversation.interested.name}` : other.name
        return <button type="button" className={selectedId === conversation.id ? 'active' : ''} onClick={() => { initialSelectionHandled.current = true; setParams({ conversa: String(conversation.id) }) }} key={conversation.id}>
          <span className="conversation-avatar">{initials(label)}</span><span className="conversation-copy"><strong>{label}</strong><small>{conversation.itemTitle}</small></span>{conversation.unreadCount > 0 && <span className="unread-dot">{conversation.unreadCount}</span>}
        </button>
      })}</div>
    </aside>

    <section className="chat-panel" aria-label="Conversa selecionada">
      {!selected && <div className="chat-placeholder"><div aria-hidden="true">···</div><h2>Selecione uma conversa</h2><p>Suas mensagens ficam reunidas aqui.</p></div>}
      {selected && <>
        <header className="chat-header"><button className="chat-back" type="button" onClick={() => { initialSelectionHandled.current = true; setParams({}) }} aria-label="Voltar para conversas">←</button><div className="chat-header-copy"><strong>{conversationTitle}</strong><span>Sobre <Link to={`/itens/${selected.itemId}`}>{selected.itemTitle}</Link></span></div><div className={`chat-header-actions ${user?.role === 'ADMIN' ? 'admin-chat-actions' : ''}`}>{canRequestMediation(selected, user?.role === 'ADMIN') && <Link className="button button-ghost mediation-action" to={`/mediacoes?conversa=${selected.id}`}>Pedir ajuda à equipe</Link>}{user?.role === 'ADMIN' && selected.closedAt && selected.mediation ? <Link className="button button-primary conversation-close" to="/admin/mediacoes">Concluir mediação</Link> : <button className="button button-ghost conversation-close" type="button" disabled={closing || Boolean(ownRequestedClosure) || Boolean(selected.closedAt)} onClick={() => setClosureOpen(true)}>{selected.closedAt ? 'Conversa encerrada' : user?.role === 'ADMIN' ? 'Encerrar como equipe' : ownRequestedClosure ? `Aguardando ${otherParticipant?.name}` : otherRequestedClosure ? 'Confirmar encerramento' : closing ? 'Confirmando...' : 'Encerrar conversa'}</button>}<Link className="button button-ghost item-action" to={`/itens/${selected.itemId}`}>Ver item</Link></div></header>
        <div className="chat-status-stack">
          {error && <div className="chat-error" role="alert">{error}</div>}
          {feedback && <div className="success-banner" role="status">{feedback}</div>}
          {selected.mediation?.status === 'EM_ANDAMENTO' && selected.mediation.responsible && <div className="mediation-notice" role="status"><strong>{selected.closedAt ? 'Atendimento aguardando conclusão' : 'Mediação em andamento'}</strong><span>{selected.closedAt ? user?.role === 'ADMIN' ? 'A conversa foi encerrada. Registre a orientação final no Painel da equipe.' : 'A conversa foi encerrada, mas a Equipe de apoio ainda está finalizando o atendimento.' : `${selected.mediation.responsible.name} entrou na conversa como mediador da Equipe de apoio.`}</span></div>}
          {selected.mediation?.status === 'PENDENTE' && <div className="mediation-notice pending" role="status"><strong>Pedido de ajuda enviado</strong><span>Aguardando alguém da Equipe de apoio assumir a mediação.</span></div>}
          {!selected.closedAt && ownRequestedClosure && <div className="closure-notice" role="status"><strong>Seu pedido foi registrado.</strong> A conversa continua aberta até {otherParticipant?.name} também confirmar.</div>}
          {!selected.closedAt && otherRequestedClosure && !ownRequestedClosure && <div className="closure-notice closure-notice-action" role="status"><strong>{otherParticipant?.name} pediu para encerrar.</strong> A conversa só será encerrada se você também confirmar.</div>}
        </div>
        <div className="message-history" aria-live="polite">
          {hasOlder && <button className="button button-ghost load-older" disabled={loadingOlder} onClick={loadOlder}>{loadingOlder ? 'Carregando...' : 'Carregar mensagens anteriores'}</button>}
          {messages.length === 0 && <div className="message-empty"><span aria-hidden="true">👋</span><h2>Comece a conversa</h2><p>Combine os próximos passos com segurança e evite compartilhar dados pessoais.</p></div>}
          {messages.map((message, index) => {
            const own = message.sender.id === user?.id
            const showDay = index === 0 || day(message.sentAt) !== day(messages[index - 1].sentAt)
            return <div className="message-group" key={message.id}>{showDay && <div className="message-day">{formatDay(message.sentAt)}</div>}<div className={`message-bubble ${own ? 'own' : ''} ${message.fromSupport ? 'support' : ''}`}>{message.fromSupport && <small className="support-author">Mediador · {message.sender.name}</small>}<p>{message.content}</p><time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>{!own && !message.fromSupport && <button className="message-report" type="button" onClick={() => setReportingMessageId(message.id)}>Denunciar</button>}</div></div>
          })}
        </div>
        {selected.closedAt
          ? <div className="conversation-closed" role="status"><strong>Conversa encerrada</strong><span>{closureMessage(selected)}</span></div>
          : <form className="message-composer" onSubmit={send}><label className="sr-only" htmlFor="message-content">Mensagem</label><textarea id="message-content" rows={1} maxLength={2000} value={content} onChange={event => setDrafts(current => ({ ...current, [selected.id]: event.target.value }))} placeholder="Escreva uma mensagem..." /><button className="button button-primary" disabled={sending || !content.trim()}>{sending ? 'Enviando' : 'Enviar'}</button></form>}
      </>}
    </section>
    {reportingMessageId && <TextDialog title="Denunciar mensagem" description="Explique por que esta mensagem deve ser analisada pela equipe de apoio." label="Motivo da denúncia" submitLabel="Enviar denúncia" onClose={() => setReportingMessageId(null)} onSubmit={reportMessage} />}
    {closureOpen && selected && <ConfirmDialog title={user?.role === 'ADMIN' ? 'Encerrar sem devolução?' : otherRequestedClosure ? 'Confirmar encerramento?' : 'Solicitar encerramento?'} description={user?.role === 'ADMIN' ? 'A conversa será encerrada e, se este for o participante aceito, o item voltará ao catálogo para novas reivindicações.' : otherRequestedClosure ? `${otherParticipant?.name} já confirmou. Sua confirmação encerrará a conversa agora.` : `A conversa continuará aberta até ${otherParticipant?.name} também confirmar.`} confirmLabel={user?.role === 'ADMIN' || otherRequestedClosure ? 'Encerrar conversa' : 'Enviar solicitação'} danger={user?.role === 'ADMIN'} busy={closing} onClose={() => setClosureOpen(false)} onConfirm={requestClosure} />}
  </div>
}

function initials(name: string) { return name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase() }
function closureMessage(conversation: Conversation) {
  const messages: Record<NonNullable<Conversation['closureReason']>, string> = {
    REIVINDICACAO_RECUSADA: 'A reivindicação foi recusada.',
    REIVINDICACAO_CANCELADA: 'A reivindicação foi cancelada.',
    OUTRO_REIVINDICANTE_ACEITO: 'Outro participante foi selecionado para esta negociação.',
    SEM_DEVOLUCAO: conversation.closedBySupport ? 'A Equipe de apoio encerrou a negociação sem devolução.' : 'A negociação foi encerrada sem devolução.',
    ITEM_DEVOLVIDO: 'O item foi devolvido e este caso foi concluído.',
    ITEM_CANCELADO: 'A publicação do item foi cancelada.',
    ITEM_EXPIRADO: 'A publicação expirou.',
  }
  return conversation.closureReason ? messages[conversation.closureReason] : 'Esta conversa foi encerrada.'
}
function day(value: string) { return value.slice(0, 10) }
function formatDay(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value)) }
function formatTime(value: string) { return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
function mergeMessages(first: Message[], second: Message[]) { const values = new Map<number, Message>(); [...first, ...second].forEach(message => values.set(message.id, message)); return [...values.values()].sort((a, b) => a.sentAt.localeCompare(b.sentAt)) }
