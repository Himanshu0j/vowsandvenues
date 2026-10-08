/**
 * Image optimization utilities for Vows & Venues.
 * Transforms raw camera/Unsplash image URLs into lightweight, auto-formatted WebP
 * representations with targeted width and quality to ensure lightning-fast page loads.
 */

export function getOptimizedImageUrl(url, options = {}) {
  const { width = 800, quality = 75, height = null, fit = 'crop' } = options

  if (!url || typeof url !== 'string' || !url.trim()) {
    return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=75'
  }

  const cleanUrl = url.trim()

  // Unsplash image optimization
  if (cleanUrl.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(cleanUrl)
      parsedUrl.searchParams.set('auto', 'format')
      parsedUrl.searchParams.set('fit', fit)
      parsedUrl.searchParams.set('w', String(width))
      parsedUrl.searchParams.set('q', String(quality))
      if (height) {
        parsedUrl.searchParams.set('h', String(height))
      }
      return parsedUrl.toString()
    } catch {
      const base = cleanUrl.split('?')[0]
      return `${base}?auto=format&fit=${fit}&w=${width}&q=${quality}${height ? `&h=${height}` : ''}`
    }
  }

  return cleanUrl
}

export default getOptimizedImageUrl
