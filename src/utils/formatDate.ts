export function formatDate(date: string | Date) {
  const parsed = new Date(date)
  return parsed.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
