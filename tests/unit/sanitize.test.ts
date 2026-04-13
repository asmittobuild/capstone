import { describe, it, expect } from 'vitest'
import { sanitize } from '../../src/lib/sanitize'

// ── T061: DOMPurify Sanitization Wrapper ──────────────────────────────

describe('sanitize', () => {
  it('strips script tags', () => {
    expect(sanitize('<script>alert("xss")</script>Hello')).toBe('Hello')
  })

  it('preserves allowed tags: b, i, em, strong, p, br', () => {
    const input = '<b>bold</b> <i>italic</i> <em>em</em> <strong>strong</strong> <p>para</p> line<br>break'
    const result = sanitize(input)
    expect(result).toContain('<b>bold</b>')
    expect(result).toContain('<i>italic</i>')
    expect(result).toContain('<em>em</em>')
    expect(result).toContain('<strong>strong</strong>')
    expect(result).toContain('<p>para</p>')
    expect(result).toContain('<br>')
  })

  it('strips disallowed tags like div and span', () => {
    expect(sanitize('<div>content</div>')).toBe('content')
    expect(sanitize('<span>text</span>')).toBe('text')
  })

  it('strips all attributes', () => {
    expect(sanitize('<b class="x" style="color:red">text</b>')).toBe('<b>text</b>')
    expect(sanitize('<a href="https://evil.com">link</a>')).toBe('link')
  })

  it('handles empty string', () => {
    expect(sanitize('')).toBe('')
  })

  it('handles string with no HTML', () => {
    expect(sanitize('plain text')).toBe('plain text')
  })

  it('strips event handlers', () => {
    expect(sanitize('<img onerror="alert(1)" src="x">')).toBe('')
  })
})
