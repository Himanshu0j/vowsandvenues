const fs = require('fs')

let content = fs.readFileSync('lib/cmsData.js', 'utf8')
content = content.replace(/https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]+)(\?[^"\s]*)?/g, (match, id) => {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=75`
})

// Special cases for hero
content = content.replace(/(heroImage:\s*"https:\/\/images\.unsplash\.com\/[^"]*w=)800/g, '$11400')
content = content.replace(/(secondaryHeroImage:\s*"https:\/\/images\.unsplash\.com\/[^"]*w=)800/g, '$11400')

fs.writeFileSync('lib/cmsData.js', content, 'utf8')
console.log('lib/cmsData.js successfully optimized!')
