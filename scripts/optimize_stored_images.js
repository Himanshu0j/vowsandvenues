const fs = require('fs')
const path = require('path')

function optimizeUnsplashUrl(url, width = 800, quality = 75) {
  if (!url || typeof url !== 'string' || !url.includes('images.unsplash.com')) {
    return url
  }
  try {
    const parsed = new URL(url.trim())
    parsed.searchParams.set('auto', 'format')
    parsed.searchParams.set('fit', 'crop')
    parsed.searchParams.set('w', String(width))
    parsed.searchParams.set('q', String(quality))
    return parsed.toString()
  } catch {
    const base = url.split('?')[0]
    return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`
  }
}

function processObject(obj, width = 800) {
  if (!obj) return obj
  if (Array.isArray(obj)) {
    return obj.map(item => processObject(item, width))
  }
  if (typeof obj === 'object') {
    const copy = { ...obj }
    for (const key of Object.keys(copy)) {
      if (typeof copy[key] === 'string' && copy[key].includes('images.unsplash.com')) {
        // Special case for hero/banner
        const w = (key === 'heroImage' || key === 'secondaryHeroImage' || key === 'bannerImage') ? 1400 : 800
        copy[key] = optimizeUnsplashUrl(copy[key], w, 75)
      } else if (Array.isArray(copy[key]) || typeof copy[key] === 'object') {
        copy[key] = processObject(copy[key], width)
      }
    }
    return copy
  }
  if (typeof obj === 'string' && obj.includes('images.unsplash.com')) {
    return optimizeUnsplashUrl(obj, width, 75)
  }
  return obj
}

const dbDir = path.join(process.cwd(), '.local_db')
const files = ['vendors.json', 'categories.json', 'media_library.json', 'cms_content.json']

files.forEach(file => {
  const filePath = path.join(dbDir, file)
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      const optimized = processObject(data)
      fs.writeFileSync(filePath, JSON.stringify(optimized, null, 2), 'utf8')
      console.log(`Optimized ${file} successfully.`)
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message)
    }
  }
})

console.log('Database image optimization complete!')
