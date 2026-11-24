import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/presentation/AuthContext'
import type { Conversation, Message } from '../domain/Conversation'
import { useMessageServices } from './MessageServicesContext'
import { useModeration } from '../../moderation/presentation/ModerationContext'

export function MessagesPage() {
  const { user } = useAuth()
  const { service, refreshUnread } = useMessageServices()
  const moderation = useModeration()
  const [params, setParams] = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [messagePage, setMessagePage] = useState(0)
  const [hasOlder, setHasOlder] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const selectedId = Number(params.get('conversa'))
  const itemId = Number(params.get('item'))
  const selected = conversations.find(conversation => conversation.id === selectedId) ?? null

  const loadConversations = useCallback(async (signal?: AbortSignal) => {
    const result = await service.listConversations(signal)
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
        } else if ((!Number.isInteger(selectedId) || selectedId <= 0) && result.length > 0) {
          setParams({ conversa: String(result[0].id) }, { replace: true })
        }
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as conversas.')
      } finally { if (!controller.signal.aborted) setLoading(false) }
    }
    void load()
    return () => controller.abort()
  }, [itemId, loadConversations, service, setParams])

  const loadMessages = useCallback(async (conversationId: number, signal?: AbortSignal, polling = false) => {
    const result = await service.listMessages(conversationId, 0, 50, signal)
    setMessages(current => polling ? mergeMessages(current, result.content) : result.content)
    if (!polling) setMessagePage(0)
    setHasOlder(!result.last)
    await service.markRead(conversationId)
    await refreshUnread()
    setConversations(current => current.map(conversation => conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation))
  }, [refreshUnread, service])

  useEffect(() => {
    if (!Number.isInteger(selectedId) || selectedId <= 0) { setMessages([]); return }
    const controller = new AbortController()
    loadMessages(selectedId, controller.signal).catch(cause => {
      if (cause instanceof DOMException && cause.name === 'AbortError') return
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as mensagens.')
    })
    const timer = window.setInterval(() => {
      void loadMessages(selectedId, undefined, true).then(() => loadConversations()).catch(() => undefined)
    }, 7000)
    return () => { controller.abort(); window.clearInterval(timer) }
  }, [selectedId, loadConversations, loadMessages])

  async function send(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    setSending(true)
    setError('')
    try {
      const message = await service.send(selected.id, content)
      setMessages(current => [...current, message])
      setContent('')
      await loadConversations()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível enviar a mensagem.')
    } finally { setSending(false) }
  }

  async function reportMessage(messageId: number) {
    const reason = prompt('Por que esta mensagem deve ser analisada pela equipe?')
    if (!reason) return
    try { await moderation.reportMessage(messageId, reason); alert('Denúncia enviada para a equipe.') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível enviar a denúncia.') }
  }

  async function loadOlder() {
    if (!selected || !hasOlder) return
    setLoadingOlder(true); setError('')
    try {
      const next = messagePage + 1
      const result = await service.listMessages(selected.id, next, 50)
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
      {!loading && conversations.length === 0 && <div className="conversation-empty"><h2>Nenhuma conversa ainda</h2><p>Uma conversa pode começar pelos detalhes de um item ou após uma reivindicação aceita.</p><Link className="button button-secondary" to="/">Explorar itens</Link></div>}
      <div className="conversation-list">{conversations.map(conversation => {
        const other = conversation.owner.id === user?.id ? conversation.interested : conversation.owner
        return <button type="button" className={selectedId === conversation.id ? 'active' : ''} onClick={() => setParams({ conversa: String(conversation.id) })} key={conversation.id}>
          <span className="conversation-avatar">{initials(other.name)}</span><span className="conversation-copy"><strong>{other.name}</strong><small>{conversation.itemTitle}</small></span>{conversation.unreadCount > 0 && <span className="unread-dot">{conversation.unreadCount}</span>}
        </button>
      })}</div>
    </aside>

    <section className="chat-panel" aria-label="Conversa selecionada">
      {!selected && <div className="chat-placeholder"><div aria-hidden="true">···</div><h2>Selecione uma conversa</h2><p>Suas mensagens ficam reunidas aqui.</p></div>}
      {selected && <>
        <header className="chat-header"><button className="chat-back" type="button" onClick={() => setParams({})} aria-label="Voltar para conversas">←</button><div><strong>{selected.owner.id === user?.id ? selected.interested.name : selected.owner.name}</strong><span>Sobre <Link to={`/itens/${selected.itemId}`}>{selected.itemTitle}</Link></span></div><Link className="button button-ghost" to={`/itens/${selected.itemId}`}>Ver item</Link></header>
        {error && <div className="chat-error" role="alert">{error}</div>}
        <div className="message-history" aria-live="polite">
          {hasOlder && <button className="button button-ghost load-older" disabled={loadingOlder} onClick={loadOlder}>{loadingOlder ? 'Carregando...' : 'Carregar mensagens anteriores'}</button>}
          {messages.length === 0 && <div className="message-empty"><span aria-hidden="true">👋</span><h2>Comece a conversa</h2><p>Combine os próximos passos com segurança e evite compartilhar dados pessoais.</p></div>}
          {messages.map((message, index) => {
            const own = message.sender.id === user?.id
            const showDay = index === 0 || day(message.sentAt) !== day(messages[index - 1].sentAt)
            return <div className="message-group" key={message.id}>{showDay && <div className="message-day">{formatDay(message.sentAt)}</div>}<div className={`message-bubble ${own ? 'own' : ''}`}><p>{message.content}</p><time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>{!own && <button className="message-report" type="button" onClick={() => reportMessage(message.id)}>Denunciar</button>}</div></div>
          })}
        </div>
        <form className="message-composer" onSubmit={send}><label className="sr-only" htmlFor="message-content">Mensagem</label><textarea id="message-content" rows={1} maxLength={2000} value={content} onChange={event => setContent(event.target.value)} placeholder="Escreva uma mensagem..." /><button className="button button-primary" disabled={sending || !content.trim()}>{sending ? 'Enviando' : 'Enviar'}</button></form>
      </>}
    </section>
  </div>
}

function initials(name: string) { return name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase() }
function day(value: string) { return value.slice(0, 10) }
function formatDay(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value)) }
function formatTime(value: string) { return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
function mergeMessages(first: Message[], second: Message[]) { const values = new Map<number, Message>(); [...first, ...second].forEach(message => values.set(message.id, message)); return [...values.values()].sort((a, b) => a.sentAt.localeCompare(b.sentAt)) }
