const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

const MAX_FILE_SIZE = 150 * 1024 * 1024

export function validateDocumentForm(form: {
  file: File | null
  title: string
  description?: string
  category?: string
  tags?: string
  author?: string
}) {
  const errors: Record<string, string> = {}

  if (!form.file) {
    errors.file = 'Le fichier est requis.'
  } else if (!ALLOWED_TYPES.includes(form.file.type)) {
    errors.file = 'Format non supporté. Seuls les fichiers PDF et Word sont autorisés.'
  } else if (form.file.size > MAX_FILE_SIZE) {
    errors.file = 'Le fichier ne doit pas dépasser 150 Mo.'
  }

  if (!form.title || form.title.trim() === '') {
    errors.title = 'Le titre est requis.'
  } else if (form.title.length > 255) {
    errors.title = 'Le titre ne doit pas dépasser 255 caractères.'
  }

  if (form.description && form.description.length > 65535) {
    errors.description = 'La description ne doit pas dépasser 65535 caractères.'
  }

  if (form.category && form.category.length > 100) {
    errors.category = 'La catégorie ne doit pas dépasser 100 caractères.'
  }

  if (form.tags && form.tags.length > 65535) {
    errors.tags = 'Les tags ne doivent pas dépasser 65535 caractères.'
  }

  if (form.author && form.author.length > 255) {
    errors.author = 'L\'auteur ne doit pas dépasser 255 caractères.'
  }

  return errors
}
