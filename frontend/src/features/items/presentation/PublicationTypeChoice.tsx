import type { ItemType } from '../domain/Item'

const choices: Array<{ value: ItemType; title: string; description: string }> = [
  { value: 'PERDIDO', title: 'Perdi um item', description: 'Quero que a comunidade me ajude a encontrar.' },
  { value: 'ENCONTRADO', title: 'Encontrei um item', description: 'Quero devolver ao verdadeiro dono.' },
]

export function PublicationTypeChoice({ value, disabled, onChange }: { value: ItemType; disabled: boolean; onChange: (value: ItemType) => void }) {
  return (
    <fieldset className="type-choice" disabled={disabled}>
      <legend>O que aconteceu?</legend>
      {choices.map(choice => (
        <label className={value === choice.value ? 'selected' : ''} key={choice.value}>
          <input type="radio" name="tipo" checked={value === choice.value} onChange={() => onChange(choice.value)} />
          <strong>{choice.title}</strong>
          <span>{choice.description}</span>
        </label>
      ))}
    </fieldset>
  )
}
