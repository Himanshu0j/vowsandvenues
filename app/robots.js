export default function robots() {
  const isStaging =
    process.env.APP_ENV === 'staging' ||
    process.env.NODE_ENV !== 'production' ||
    (typeof process.env.RENDER_EXTERNAL_URL === 'string' && process.env.RENDER_EXTERNAL_URL.includes('staging'))

  if (isStaging) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/vendor'],
    },
    sitemap: 'https://vowsandvenues.in/sitemap.xml',
  }
}
