export function StateView({ message, action, onAction }: { message: string; action: string; onAction(): void }) {
  return (
    <div className="empty-state">
      <div aria-hidden="true">R</div>
      <h2>{message}</h2>
      <button className="button button-secondary" type="button" onClick={onAction}>{action}</button>
    </div>
  )
}
