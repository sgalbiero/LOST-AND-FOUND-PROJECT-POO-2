const steps = [
  { number: '1', title: 'Publique', description: 'Conte o que aconteceu e inclua detalhes que ajudem no reconhecimento.' },
  { number: '2', title: 'Converse com segurança', description: 'Valide as informações sem expor dados pessoais publicamente.' },
  { number: '3', title: 'Combine a devolução', description: 'Registre a entrega para encerrar o caso com tranquilidade.' },
]

export function RecoveryJourney({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`recovery-journey${compact ? ' compact' : ''}`} aria-labelledby="journey-title">
      <div className="journey-heading">
        <span className="eyebrow">Como funciona</span>
        <h2 id="journey-title">Do aviso ao reencontro, em três passos</h2>
      </div>
      <ol>
        {steps.map(step => (
          <li key={step.number}>
            <span aria-hidden="true">{step.number}</span>
            <div><strong>{step.title}</strong><small>{step.description}</small></div>
          </li>
        ))}
      </ol>
    </section>
  )
}
