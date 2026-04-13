import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'p', 'br']

export function sanitize(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [],
  })
}
