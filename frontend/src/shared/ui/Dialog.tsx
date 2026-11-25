import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'

interface DialogFrameProps {
  title: string
  description?: string
  children: ReactNode
  onClose(): void
}

export function DialogFrame({ title, description, children, onClose }: DialogFrameProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { onClose(); return }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')]
      if (focusable.length === 0) { event.preventDefault(); panelRef.current.focus(); return }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
      previous?.focus()
    }
  }, [onClose])

  return <div className="dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panelRef} tabIndex={-1}>
      <button className="dialog-close" type="button" aria-label="Fechar" onClick={onClose}>×</button>
      <h2 id={titleId}>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </div>
  </div>
}

interface TextDialogProps {
  title: string
  description?: string
  label: string
  submitLabel: string
  initialValue?: string
  busy?: boolean
  maxLength?: number
  onClose(): void
  onSubmit(value: string): void | Promise<void>
}

export function TextDialog({ title, description, label, submitLabel, initialValue = '', busy = false, maxLength = 1000, onClose, onSubmit }: TextDialogProps) {
  const [value, setValue] = useState(initialValue)
  function submit(event: FormEvent) { event.preventDefault(); const clean = value.trim(); if (clean) void onSubmit(clean) }
  return <DialogFrame title={title} description={description} onClose={onClose}>
    <form className="dialog-form" onSubmit={submit}>
      <label><span>{label}</span><textarea autoFocus rows={5} maxLength={maxLength} value={value} onChange={event => setValue(event.target.value)} required /><small>{value.length}/{maxLength} caracteres</small></label>
      <div className="dialog-actions"><button className="button button-ghost" type="button" disabled={busy} onClick={onClose}>Cancelar</button><button className="button button-primary" disabled={busy || !value.trim()}>{busy ? 'Salvando...' : submitLabel}</button></div>
    </form>
  </DialogFrame>
}

export function ConfirmDialog({ title, description, confirmLabel, busy = false, danger = false, onClose, onConfirm }: { title: string; description: string; confirmLabel: string; busy?: boolean; danger?: boolean; onClose(): void; onConfirm(): void | Promise<void> }) {
  return <DialogFrame title={title} description={description} onClose={onClose}>
    <div className="dialog-actions"><button className="button button-ghost" type="button" disabled={busy} onClick={onClose}>Voltar</button><button className={`button ${danger ? 'button-danger' : 'button-primary'}`} type="button" disabled={busy} onClick={() => void onConfirm()}>{busy ? 'Processando...' : confirmLabel}</button></div>
  </DialogFrame>
}
