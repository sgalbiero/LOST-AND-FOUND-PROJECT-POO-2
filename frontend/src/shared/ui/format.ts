export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })
    .format(new Date(`${value}T12:00:00Z`))
}

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase()
}
