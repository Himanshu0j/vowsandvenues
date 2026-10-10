/**
 * Image optimization utilities for Vows & Venues.
 * Transforms raw camera/Unsplash/Pexels image URLs into lightweight, auto-formatted WebP/AVIF
 * representations with targeted width and quality to ensure lightning-fast page loads
 * and crisp 4K presentation on high-DPI displays.
 */

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'

export function getOptimizedImageUrl(url, options = {}) {
  const { width = 1200, quality = 80, height = null, fit = 'crop' } = options

  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_IMAGE
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

  // Pexels image optimization
  if (cleanUrl.includes('images.pexels.com')) {
    try {
      const parsedUrl = new URL(cleanUrl)
      parsedUrl.searchParams.set('auto', 'compress')
      parsedUrl.searchParams.set('cs', 'tinysrgb')
      parsedUrl.searchParams.set('w', String(width))
      if (height) {
        parsedUrl.searchParams.set('h', String(height))
      }
      return parsedUrl.toString()
    } catch {
      const base = cleanUrl.split('?')[0]
      return `${base}?auto=compress&cs=tinysrgb&w=${width}${height ? `&h=${height}` : ''}`
    }
  }

  return cleanUrl
}

/**
 * Generate a responsive srcset attribute string for Unsplash or Pexels images.
 * e.g., getSrcSet(url, [640, 1024, 1600, 2400])
 */
export function getResponsiveSrcSet(url, widths = [640, 1024, 1600, 2400]) {
  if (!url || typeof url !== 'string' || !url.trim()) return ''
  return widths
    .map(w => `${getOptimizedImageUrl(url, { width: w, quality: 80 })} ${w}w`)
    .join(', ')
}

export default getOptimizedImageUrl
