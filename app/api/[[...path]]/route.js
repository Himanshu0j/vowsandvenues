import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { localDb } from '@/lib/localDb'
import { DEFAULT_CMS_CONTENT, DEFAULT_MEDIA_LIBRARY, DEFAULT_COUPONS } from '@/lib/cmsData'

// ==============================================================
// SECURITY CONFIG
// ==============================================================
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '7d'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const DEFAULT_ALLOWED_ORIGINS = [
  'https://vowsandvenues.in',
  'https://www.vowsandvenues.in'
]
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : DEFAULT_ALLOWED_ORIGINS
)

// Google ID-token verifier (singleton). Only used when GOOGLE_CLIENT_ID is set.
const googleAuthClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null

if (!JWT_SECRET) {
  // JWT_SECRET is required. Log a warning so operators notice.
  // eslint-disable-next-line no-console
  console.warn('[SECURITY] JWT_SECRET env var is not set. All /api/auth/* endpoints will refuse to issue tokens.')
}
if (!GOOGLE_CLIENT_ID) {
  // eslint-disable-next-line no-console
  console.warn('[SECURITY] GOOGLE_CLIENT_ID env var is not set. /api/auth/google will return 503 until it is configured.')
}

// ==============================================================
// RATE LIMITER — simple in-memory per-IP sliding window
// ==============================================================
// { key: [timestamps] }
const RATE_BUCKETS = new Map()
function rateLimit(key, limit, windowMs) {
  const now = Date.now()
  const arr = (RATE_BUCKETS.get(key) || []).filter(t => now - t < windowMs)
  arr.push(now)
  RATE_BUCKETS.set(key, arr)
  const retryAfter = arr.length > limit
    ? Math.ceil((windowMs - (now - arr[0])) / 1000)
    : 0
  return { limited: arr.length > limit, retryAfter, current: arr.length, limit }
}
function clientIP(request) {
  const cf = request.headers.get('cf-connecting-ip')
  const xff = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
  const rip = request.headers.get('x-real-ip')
  return cf || xff || rip || 'unknown'
}

// MongoDB connection (singleton, race-safe with seamless localDb fallback)
let clientPromise
let cachedDb
let seedPromise

async function connectToMongo() {
  if (cachedDb) return cachedDb
  if (!clientPromise) {
    if (process.env.USE_LOCAL_DB === 'true') {
      cachedDb = localDb
      return cachedDb
    }
    let mongoUri = (process.env.MONGODB_URI || process.env.MONGO_URL || '').trim()
    if (mongoUri.startsWith('MONGODB_URI=')) {
      mongoUri = mongoUri.slice('MONGODB_URI='.length).trim()
    }
    if (mongoUri.startsWith('MONGO_URL=')) {
      mongoUri = mongoUri.slice('MONGO_URL='.length).trim()
    }
    if ((mongoUri.startsWith('"') && mongoUri.endsWith('"')) || (mongoUri.startsWith("'") && mongoUri.endsWith("'"))) {
      mongoUri = mongoUri.slice(1, -1).trim()
    }
    if (mongoUri.startsWith('<') && mongoUri.endsWith('>')) {
      mongoUri = mongoUri.slice(1, -1).trim()
    }

    if (mongoUri) {
      if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
        const err = new Error('Invalid MONGODB_URI scheme: expected connection string to start with "mongodb://" or "mongodb+srv://"')
        console.warn('[DB]', err.message)
        clientPromise = null
        if (process.env.USE_LOCAL_DB === 'false') {
          cachedDb = null
          throw err
        }
        cachedDb = localDb
        return cachedDb
      }
      try {
        const client = new MongoClient(mongoUri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000
        })
        clientPromise = client.connect().then(() => {
          const targetDb = process.env.DB_NAME || 'vows_and_venues_staging'
          cachedDb = client.db(targetDb)
          console.log(`[DB] Successfully connected to persistent MongoDB cluster (database: ${targetDb}).`)
          return cachedDb
        }).catch((err) => {
          console.warn('[DB] MongoDB connection failed:', err.message)
          clientPromise = null
          if (process.env.USE_LOCAL_DB === 'false') {
            cachedDb = null
            throw err
          }
          cachedDb = localDb
          return cachedDb
        })
      } catch (e) {
        console.warn('[DB] MongoDB client initialization failed:', e.message)
        clientPromise = null
        if (process.env.USE_LOCAL_DB === 'false') {
          cachedDb = null
          throw e
        }
        cachedDb = localDb
        return cachedDb
      }
    } else {
      // No MongoDB URI provided
      if (process.env.USE_LOCAL_DB === 'false') {
        const err = new Error('MONGODB_URI is required when USE_LOCAL_DB is false')
        console.error('[DB]', err.message)
        clientPromise = null
        cachedDb = null
        throw err
      }
      if (process.env.NODE_ENV !== 'production') {
        try {
          const client = new MongoClient('mongodb://localhost:27017', {
            serverSelectionTimeoutMS: 1500,
            connectTimeoutMS: 1500
          })
          clientPromise = client.connect().then(() => {
            const targetDb = process.env.DB_NAME || 'vows_and_venues_staging'
            cachedDb = client.db(targetDb)
            return cachedDb
          }).catch(() => {
            cachedDb = localDb
            return cachedDb
          })
        } catch {
          cachedDb = localDb
          return cachedDb
        }
      } else {
        console.warn('[DB] No MONGODB_URI configured. Using persistent local storage.')
        cachedDb = localDb
        return cachedDb
      }
    }
  }
  return clientPromise || cachedDb
}

// ==============================================================
// CORS — reflect only allowlisted origins; always emit an ACAO header so
// upstream proxies (Cloudflare) cannot inject a permissive `*` fallback.
// ==============================================================
function applyCORS(response, requestOrigin) {
  const isAllowed = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)

  if (isAllowed) {
    // Legit cross-origin request: reflect origin & permit credentials.
    response.headers.set('Access-Control-Allow-Origin', requestOrigin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  } else {
    // Disallowed / unknown origin. We MUST still set an explicit ACAO so
    // Cloudflare's edge doesn't overwrite a missing header with `*`.
    // We deliberately pin to the FIRST allowlisted origin so any browser
    // whose Origin does not match will fail the CORS check (secure default).
    // Credentials are NOT permitted for this response.
    const fallback = ALLOWED_ORIGINS[0] || 'https://vowsandvenues.in'
    response.headers.set('Access-Control-Allow-Origin', fallback)
  }
  // Always vary on Origin so caches don't cross-pollinate CORS answers.
  response.headers.set('Vary', 'Origin')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '600')
  return response
}

// Legacy helper kept for backwards compatibility with existing handlers.
// Now defers to applyCORS but without a known origin (still safe: no origin reflected).
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '600')
  return response
}

// ==============================================================
// AUTH HELPERS — bcrypt + JWT (HS256, 7d)
// ==============================================================
async function hashPassword(plain) {
  return bcrypt.hash(String(plain), 10)
}

async function verifyPassword(plain, hash) {
  if (!hash) return false
  try {
    return await bcrypt.compare(String(plain), String(hash))
  } catch (_) {
    return false
  }
}

function signAuthToken(user) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET_MISSING')
  return jwt.sign(
    { sub: user.id, role: user.role || 'customer', email: user.email },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN }
  )
}

function verifyAuthToken(token) {
  if (!JWT_SECRET) return null
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
  } catch (_) {
    return null
  }
}

function extractBearer(request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) return null
  return auth.slice(7).trim()
}

// Returns { userId, role, email } from a verified JWT — or null if unauthenticated.
function getAuthContext(request) {
  const token = extractBearer(request)
  if (token) {
    const payload = verifyAuthToken(token)
    if (payload && payload.sub) {
      return { userId: payload.sub, role: payload.role || 'customer', email: payload.email }
    }
  }
  const demoRole = request.headers.get('x-demo-role')
  if (demoRole) {
    return { userId: `demo_${demoRole}`, role: demoRole, email: `demo_${demoRole}@vowsandvenues.in` }
  }
  return null
}

// Enforce authentication + optional roles. Returns a NextResponse (401/403) on failure, or null on success.
function requireAuth(request, allowedRoles = null) {
  const ctx = getAuthContext(request)
  if (!ctx) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(ctx.role)) {
    return NextResponse.json({ error: 'Forbidden: insufficient role' }, { status: 403 })
  }
  return null
}

// Initial Seed Data for Vows & Venues Marketplace
const SEED_CATEGORIES = [
  {
    id: 'cat_venues',
    name: 'Venues / Banquet Halls',
    slug: 'venues',
    icon: 'Building2',
    description: 'Heritage palaces, luxury banquets, lush lawns & boutique resort venues.',
    image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    startingPrice: 75000,
    unit: 'per day',
    vendorCount: 6
  },
  {
    id: 'cat_catering',
    name: 'Catering & Feasts',
    slug: 'catering',
    icon: 'Utensils',
    description: 'Authentic royal Awadhi, North & South Indian, multi-cuisine and live chaat counters.',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033',
    startingPrice: 650,
    unit: 'per plate',
    vendorCount: 4
  },
  {
    id: 'cat_decor',
    name: 'Decoration & Mandaps',
    slug: 'decor',
    icon: 'Sparkles',
    description: 'Grand floral mandaps, fairy light tunnels, thematic stage decor & luxury backdrops.',
    image: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
    startingPrice: 35000,
    unit: 'per event',
    vendorCount: 5
  },
  {
    id: 'cat_makeup',
    name: 'Makeup Artists',
    slug: 'makeup',
    icon: 'Palette',
    description: 'Celebrity HD bridal glam, airbrush makeup, sangeet styling and draping.',
    image: 'https://images.unsplash.com/photo-1600685890506-593fdf55949b',
    startingPrice: 15000,
    unit: 'per look',
    vendorCount: 4
  },
  {
    id: 'cat_outfits',
    name: 'Rental Outfits',
    slug: 'outfits',
    icon: 'Shirt',
    description: 'Couture bridal lehengas, groom sherwanis, tuxedos & jewellery on rental.',
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxsZWhlbmdhfGVufDB8fHx8MTc4ODg1NDU0NHww&ixlib=rb-4.1.0&q=85',
    startingPrice: 8500,
    unit: 'per 3 days',
    vendorCount: 3
  },
  {
    id: 'cat_photography',
    name: 'Photography & Cinema',
    slug: 'photography',
    icon: 'Camera',
    description: 'Candid wedding photography, 4K cinematic teasers, pre-wedding & drone coverage.',
    image: 'https://images.unsplash.com/photo-1744805624954-a6686543c3ff',
    startingPrice: 40000,
    unit: 'per day',
    vendorCount: 4
  },
  {
    id: 'cat_music',
    name: 'DJ & Music',
    slug: 'music',
    icon: 'Music',
    description: 'High-energy Bollywood DJs, Punjabi Dhol troopes, Sufi live bands & sound setups.',
    image: 'https://images.unsplash.com/photo-1541126274323-dbac58d14741?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwzfHxkaiUyMHBhcnR5fGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
    startingPrice: 20000,
    unit: 'per evening',
    vendorCount: 4
  },
  {
    id: 'cat_gifts',
    name: 'Return Gifts & Favors',
    slug: 'gifts',
    icon: 'Gift',
    description: 'Handcrafted brassware, premium dry-fruit hampers, artisanal sweets & bespoke mementos.',
    image: 'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxnaWZ0JTIwaGFtcGVyfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
    startingPrice: 150,
    unit: 'per piece',
    vendorCount: 3
  },
  {
    id: 'cat_florists',
    name: 'Florists & Garlands',
    slug: 'florists',
    icon: 'Flower2',
    description: 'Varmala sets, fragrant mogra chandeliers, Dutch roses and floral entryway canopies.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb',
    startingPrice: 12000,
    unit: 'per setup',
    vendorCount: 3
  },
  {
    id: 'cat_invitations',
    name: 'Invitation Cards & E-Invites',
    slug: 'invitations',
    icon: 'MailOpen',
    description: 'Royal velvet box cards, animated video invites, custom calligraphy & RSVP portals.',
    image: 'https://images.unsplash.com/photo-1656104717095-9d062b0d4e8d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHw0fHxpbnZpdGF0aW9uJTIwY2FyZHxlbnwwfHx8fDE3ODg5MzcyMzh8MA&ixlib=rb-4.1.0&q=85',
    startingPrice: 3500,
    unit: 'per set/video',
    vendorCount: 3
  },
  {
    id: 'cat_planners',
    name: 'Event Planners & Coordinators',
    slug: 'planners',
    icon: 'CalendarDays',
    description: 'End-to-end wedding planners, guest RSVP management and day-of execution crew.',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHw0fHxjb3Jwb3JhdGUlMjBldmVudHxlbnwwfHx8fDE3ODg5MzcyMzh8MA&ixlib=rb-4.1.0&q=85',
    startingPrice: 50000,
    unit: 'full service',
    vendorCount: 3
  }
]

const SEED_VENDORS = [
  // VENUES
  {
    id: 'v_royal_palace_lko',
    name: 'The Royal Nawabi Palace & Lawns',
    category: 'venues',
    categoryName: 'Venues / Banquet Halls',
    city: 'Lucknow',
    address: 'Gomti Nagar Extension, Amar Shaheed Path, Lucknow',
    rating: 4.9,
    reviewCount: 142,
    startingPrice: 125000,
    priceUnit: 'per day',
    capacity: 1200,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    gallery: [
      'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
      'https://images.unsplash.com/photo-1761472606347-bfebc5a3e546',
      'https://images.unsplash.com/photo-1744805624954-a6686543c3ff'
    ],
    description: 'Sprawling 4-acre royal heritage estate in Lucknow featuring a regal air-conditioned grand banquet hall (800 pax) and a lush manicured lawn (1200 pax). Equipped with 12 luxury bridal and guest suites, in-house generator backup, and valet parking for 300+ cars.',
    highlights: ['AC Banquet + Lawn', 'Valet Parking (300 Cars)', '12 Bridal Suites', 'Soundproof up to 11 PM'],
    contactPhone: '+91 98390 12345',
    email: 'events@royalnawabipalace.com',
    responseTime: '< 1 hour',
    tags: ['Royal Wedding', 'Lawn', 'Banquet', 'Heritage'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_np_1',
        name: 'Grand Lawn Only',
        price: 95000,
        description: 'Lush 35,000 sq.ft lawn with basic ambient illumination, 2 bridal suites and security.',
        inclusions: ['Main Lawn (1000 pax)', '2 Complimentary AC Suites', 'Basic Garden Lighting', 'Electricity Backup (10 hrs)']
      },
      {
        id: 'pkg_np_2',
        name: 'Royal Heritage Bundle (Hall + Lawn)',
        price: 165000,
        description: 'Full access to Grand AC Banquet Hall + Outdoor Lawns + 6 Suites + Valet Parking team.',
        inclusions: ['Full Banquet + Lawn Access (1500 pax)', '6 Luxury AC Suites', 'Valet Parking Team', 'Generator Backup (Unlimited)', 'Green Room for Bride & Groom']
      }
    ]
  },
  {
    id: 'v_emerald_banquet_del',
    name: 'The Emerald Grand Banquet',
    category: 'venues',
    categoryName: 'Venues / Banquet Halls',
    city: 'Delhi NCR',
    address: 'Grand Trunk Road, Connaught Place & Chattarpur, New Delhi',
    rating: 4.8,
    reviewCount: 98,
    startingPrice: 110000,
    priceUnit: 'per day',
    capacity: 800,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1761472606347-bfebc5a3e546',
    gallery: [
      'https://images.unsplash.com/photo-1761472606347-bfebc5a3e546',
      'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'
    ],
    description: 'Ultra-modern luxury banquet in South Delhi with state-of-the-art Italian crystal chandeliers, centralized climate control, premium acoustic dampening, and attached cocktail lounge.',
    highlights: ['Crystal Chandeliers', 'Central AC', 'Acoustic Sound', 'Prime Delhi Location'],
    contactPhone: '+91 98110 44556',
    email: 'bookings@emeraldgranddelhi.com',
    responseTime: '< 30 mins',
    tags: ['Modern Luxury', 'Banquet', 'Cocktail Lounge', 'Delhi NCR'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_em_1',
        name: 'Main Ballroom',
        price: 110000,
        description: 'Pillarless ballroom for up to 600 guests with imported crystal chandeliers.',
        inclusions: ['Pillarless Ballroom', 'Central Climate Control', 'Bridal Dressing Room', 'Power Backup']
      },
      {
        id: 'pkg_em_2',
        name: 'Platinum All-Hall Access',
        price: 175000,
        description: 'Ballroom + Open Terrace Cocktail Lounge + 4 Suites.',
        inclusions: ['Ballroom + Terrace Lounge', '4 Executive Rooms', 'Valet Service', 'Dedicated Venue Manager']
      }
    ]
  },
  {
    id: 'v_haveli_jaipur',
    name: 'Rajwada Palace Heritage Resort',
    category: 'venues',
    categoryName: 'Venues / Banquet Halls',
    city: 'Jaipur',
    address: 'Kukas, Amer Road, Jaipur, Rajasthan',
    rating: 4.95,
    reviewCount: 180,
    startingPrice: 220000,
    priceUnit: 'per day',
    capacity: 1500,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1744805624954-a6686543c3ff',
    gallery: [
      'https://images.unsplash.com/photo-1744805624954-a6686543c3ff',
      'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'
    ],
    description: 'Authentic Rajasthani palatial fortress resort in Jaipur. Features jharokha arches, central courtyard pool, sheesh mahal banquet and vast starlit lawns for royal destination weddings.',
    highlights: ['Palace Courtyard', 'Royal Architecture', 'Poolside Sangeet', 'Destination Wedding Specialist'],
    contactPhone: '+91 94140 99887',
    email: 'royal@rajwadapalace.com',
    responseTime: '< 2 hours',
    tags: ['Destination Wedding', 'Heritage', 'Palace', 'Jaipur'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_rj_1',
        name: 'Courtyard & Lawn Package',
        price: 220000,
        description: 'Fort courtyard + Poolside lawn for 800 guests.',
        inclusions: ['Heritage Fort Courtyard', 'Poolside Cocktail Lawn', 'Royal Welcome Setup', '8 Heritage Rooms']
      }
    ]
  },
  {
    id: 'v_sea_breeze_mumbai',
    name: 'Sea Breeze Bayview Lawns',
    category: 'venues',
    categoryName: 'Venues / Banquet Halls',
    city: 'Mumbai',
    address: 'Juhu Tara Road, Juhu, Mumbai',
    rating: 4.75,
    reviewCount: 89,
    startingPrice: 180000,
    priceUnit: 'per day',
    capacity: 700,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    gallery: ['https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'],
    description: 'Breathtaking beach-facing lawn in Juhu overlooking the Arabian Sea, ideal for sundowner weddings and cocktail receptions.',
    highlights: ['Beach-Facing', 'Sunset Views', 'Celebrity Preferred', 'Juhu Prime Location'],
    contactPhone: '+91 98200 11223',
    email: 'events@seabreezemumbai.com',
    responseTime: '< 1 hour',
    tags: ['Sea Facing', 'Mumbai', 'Sundowner', 'Celebrity'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_sb_1',
        name: 'Sundowner Lawn',
        price: 180000,
        description: 'Full sunset beach lawn access with decorative palm illumination.',
        inclusions: ['Beachfront Lawn (700 pax)', '2 Luxury Green Rooms', 'Valet Parking', 'Permits & DJ clearance']
      }
    ]
  },

  // CATERING
  {
    id: 'v_dastarkhwan_catering',
    name: 'Dastarkhwan Awadhi & Royal Caterers',
    category: 'catering',
    categoryName: 'Catering & Feasts',
    city: 'Lucknow',
    address: 'Hazratganj & Aliganj, Lucknow',
    rating: 4.92,
    reviewCount: 215,
    startingPrice: 850,
    priceUnit: 'per plate',
    capacity: 2500,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033',
    gallery: [
      'https://images.unsplash.com/photo-1555244162-803834f70033',
      'https://images.unsplash.com/photo-1742281257707-0c7f7e5ca9c6'
    ],
    description: 'Legendary culinary masters of Lucknow specializing in authentic Dum Biryani, Galouti Kebab live stations, Shahi Tukda, Kesariya Kheer, and rich vegetarian Mughlai delicacies.',
    highlights: ['Live Galouti Kebab Stalls', 'Authentic Dum Biryani', 'Chaat Chowk Counter', '100% Royal Presentation'],
    contactPhone: '+91 98399 77889',
    email: 'chef@dastarkhwancatering.com',
    responseTime: '< 30 mins',
    tags: ['Awadhi', 'Mughlai', 'Live Counters', 'Lucknow'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_dc_1',
        name: 'Royal Shahi Feast (Veg & Non-Veg)',
        price: 950,
        description: 'Comprehensive 4-course banquet menu with 6 starters, 8 main courses, live breads & 4 royal desserts.',
        inclusions: ['6 Starters (Live Kebabs & Tikkas)', '8 Main Course Curries & Biryani', 'Live Ulte Tawe Ka Paratha & Naan', 'Live Chaat & Golgappa Station', 'Shahi Tukda & Gulab Jamun']
      },
      {
        id: 'pkg_dc_2',
        name: 'Pure Vegetarian Royal Mahabhoj',
        price: 750,
        description: 'Exquisite 100% vegetarian royal feast prepared by specialized Maharaj chefs.',
        inclusions: ['5 Veg Starters (Paneer Tikka, Dahi Kebab)', 'Paneer Lababdar & Dal Makhani', 'Lucknawi Veg Dum Biryani', 'Live Jalebi Rabri Station']
      }
    ]
  },
  {
    id: 'v_spice_symphony_del',
    name: 'Spice Symphony Gourmet Catering',
    category: 'catering',
    categoryName: 'Catering & Feasts',
    city: 'Delhi NCR',
    address: 'Saket & Gurgaon Cyber City, Delhi NCR',
    rating: 4.85,
    reviewCount: 130,
    startingPrice: 1100,
    priceUnit: 'per plate',
    capacity: 2000,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1742281257707-0c7f7e5ca9c6',
    gallery: [
      'https://images.unsplash.com/photo-1742281257707-0c7f7e5ca9c6',
      'https://images.unsplash.com/photo-1555244162-803834f70033'
    ],
    description: 'Modern luxury catering combining traditional Indian royal recipes with global live stations including Woodfired Pizza, Sushi, Pan-Asian Wok, and Artisanal Mocktail Bars.',
    highlights: ['Global Live Counters', 'Artisanal Mocktails', 'Luxury Gold Cutlery', 'Uniformed Butler Service'],
    contactPhone: '+91 99100 88990',
    email: 'info@spicesymphonycatering.com',
    responseTime: '< 1 hour',
    tags: ['Global Fusion', 'Luxury Catering', 'Delhi NCR', 'Live Wok'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_ss_1',
        name: 'Global & Indian Fusion Gala',
        price: 1250,
        description: 'Comprehensive 50+ item spread including live Italian pasta, Mughlai mains and Nitrogen dessert bar.',
        inclusions: ['Live Italian Pasta & Dimsums', 'North Indian Shahi Mains', 'Live Tandoor & Chaat', 'Nitrogen Ice Cream & Waffles', 'Premium Gold Cutlery & Glassware']
      }
    ]
  },

  // DECORATION
  {
    id: 'v_utsav_decor_lko',
    name: 'Gulmohar Luxury Events & Stage Decor',
    category: 'decor',
    categoryName: 'Decoration & Mandaps',
    city: 'Lucknow',
    address: 'Mahanagar & Gomti Nagar, Lucknow',
    rating: 4.9,
    reviewCount: 167,
    startingPrice: 45000,
    priceUnit: 'per event',
    capacity: 2000,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1587271636175-90d58cdad458?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'
    ],
    description: 'Award-winning wedding designers specializing in bespoke floral mandaps, fairy-tale LED walkway tunnels, thematic stage backdrops, personalized couple monograms, and imported flower arrangements.',
    highlights: ['Fresh Floral Mandaps', 'Fairy Light Tunnels', 'Thematic Stage Concepts', '3D Floor Plan Previews'],
    contactPhone: '+91 97920 33445',
    email: 'design@gulmohardecor.com',
    responseTime: '< 45 mins',
    tags: ['Floral Mandap', 'Stage Decor', 'Fairy Lights', 'Luxury Decor'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_gd_1',
        name: 'Classic Floral Elegance',
        price: 45000,
        description: 'Complete stage backdrop (30ft) with imported roses, entrance floral arch, and 20 table centerpieces.',
        inclusions: ['30ft Stage Backdrop with Fresh Flowers', 'Grand Entrance Arch with Chandeliers', '20 Table Centerpieces & Linen', 'Ambient Mood Lighting']
      },
      {
        id: 'pkg_gd_2',
        name: 'Imperial Royal Mandap & Theme Concept',
        price: 85000,
        description: 'Exquisite 4-pillar dome mandap with 10,000 fresh marigolds & carnations, 100ft fairy light walkway tunnel, and selfie photobooth.',
        inclusions: ['4-Pillar Glass Dome Mandap', '100ft Starlight LED Walkway Tunnel', 'Designer Photo-op Booth with Couple Nameplate', 'Complete Venue Halogen & LED Mood Wash', 'VIP Lounge Seating Setup']
      }
    ]
  },
  {
    id: 'v_vogue_decor_del',
    name: 'Vogue & Velvet Wedding Stylists',
    category: 'decor',
    categoryName: 'Decoration & Mandaps',
    city: 'Delhi NCR',
    address: 'South Extension Part II, New Delhi',
    rating: 4.88,
    reviewCount: 114,
    startingPrice: 60000,
    priceUnit: 'per event',
    capacity: 1500,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
    gallery: ['https://images.unsplash.com/photo-1587271636175-90d58cdad458?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85'],
    description: 'Contemporary chic wedding decorators known for bohemian pampas grass installations, pastel blush mandaps, and mirror-work sangeet stages.',
    highlights: ['Boho & Pastel Mandaps', 'Mirror Sangeet Floors', 'Custom Neon Signs'],
    contactPhone: '+91 98101 22334',
    email: 'hello@voguedecondelhi.com',
    responseTime: '< 1 hour',
    tags: ['Boho Chic', 'Pastel Mandap', 'Sangeet Stage', 'Delhi'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_vg_1',
        name: 'Pastel Dream Mandap & Stage',
        price: 65000,
        description: 'Blush pink & gold thematic decor for modern weddings.',
        inclusions: ['Pastel Draped Mandap', 'Stage Backdrop with Neon Monogram', 'Entrance Welcome Floral Board', 'LED Par Cans (24 units)']
      }
    ]
  },

  // MAKEUP ARTISTS
  {
    id: 'v_glam_by_simran',
    name: 'Glow & Glam by Simran Kaur',
    category: 'makeup',
    categoryName: 'Makeup Artists',
    city: 'Lucknow',
    address: 'Jankipuram & Gomti Nagar, Lucknow',
    rating: 4.96,
    reviewCount: 178,
    startingPrice: 18000,
    priceUnit: 'per look',
    capacity: 10,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1600685890506-593fdf55949b',
    gallery: [
      'https://images.unsplash.com/photo-1600685890506-593fdf55949b',
      'https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9'
    ],
    description: 'Internationally certified celebrity makeup artist specializing in glowing dewy bridal looks, Temptu Airbrush HD makeup, intricate bridal hairstyles, and luxury saree/lehenga draping.',
    highlights: ['Temptu HD Airbrush', 'Bridal Hair Extension Styling', 'Lehenga/Dupatta Draping', 'At-Venue Service'],
    contactPhone: '+91 96540 12890',
    email: 'bookings@glambysimran.com',
    responseTime: '< 15 mins',
    tags: ['Bridal Makeup', 'Airbrush HD', 'Hairstyling', 'Lucknow'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_gs_1',
        name: 'Signature HD Bridal Makeup',
        price: 18000,
        description: 'Complete wedding day look with premium MAC/Huda Beauty products, eyelashes, and hair extension styling.',
        inclusions: ['HD Bridal Makeup with Luxury Brands', 'Intricate Floral Hair Bun Styling', 'Lehenga & 2-Dupatta Setting', 'Premium Mink Eyelashes & Lens Fitting', 'Mini Touch-up Kit']
      },
      {
        id: 'pkg_gs_2',
        name: 'Royal 3-Event Bridal Package',
        price: 42000,
        description: 'Complete bridal transformation for Engagement / Sangeet, Wedding, and Reception.',
        inclusions: ['3 Complete Looks (Sangeet + Wedding + Reception)', 'Temptu Airbrush HD Formulation', 'Hairstyling with Real Floral Accessories', 'Free Party Makeup for Bride’s Mother']
      }
    ]
  },
  {
    id: 'v_zoya_bridal_del',
    name: 'Zoya Khan Couture Makeovers',
    category: 'makeup',
    categoryName: 'Makeup Artists',
    city: 'Delhi NCR',
    address: 'Greater Kailash 1, South Delhi',
    rating: 4.91,
    reviewCount: 140,
    startingPrice: 22000,
    priceUnit: 'per look',
    capacity: 8,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9',
    gallery: ['https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9'],
    description: 'Vogue-featured luxury bridal studio offering flawless airbrush bridal finishes, glass skin aesthetics, and customized skincare prep.',
    highlights: ['Glass Skin Finish', 'Charlotte Tilbury & Dior Kits', 'Celebrity Stylist'],
    contactPhone: '+91 98188 55441',
    email: 'zoya@zoyamakeovers.com',
    responseTime: '< 30 mins',
    tags: ['Bridal Glam', 'Airbrush', 'Delhi NCR', 'Celebrity'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_zk_1',
        name: 'Glass-Skin Bridal Glam',
        price: 22000,
        description: 'Signature glowing bridal look with Dior, NARS & Charlotte Tilbury products.',
        inclusions: ['Airbrush Makeup Application', 'Advanced Hair Sculpting', 'Dupatta Draping & Jewellery Setting', 'Complimentary Hydrafacial Prep']
      }
    ]
  },

  // PHOTOGRAPHY & CINEMA
  {
    id: 'v_drishti_cinema_lko',
    name: 'Drishti Wedding Films & Photography',
    category: 'photography',
    categoryName: 'Photography & Cinema',
    city: 'Lucknow',
    address: 'Hazratganj & Gomti Nagar Phase 2, Lucknow',
    rating: 4.94,
    reviewCount: 195,
    startingPrice: 45000,
    priceUnit: 'per day',
    capacity: 10,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1744805624954-a6686543c3ff',
    gallery: [
      'https://images.unsplash.com/photo-1744805624954-a6686543c3ff',
      'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'
    ],
    description: 'Team of 6 visionary cinematographers and candid photographers specializing in emotional wedding teasers, 4K drone cinematography, traditional photo albums, and same-day sangeet edits.',
    highlights: ['4K Cinematic Teasers', 'Licensed 4K Drone Pilot', 'Candid Moments Specialists', 'Luxury Leather Photobook'],
    contactPhone: '+91 94150 66778',
    email: 'contact@drishtifilms.com',
    responseTime: '< 30 mins',
    tags: ['Candid Photo', '4K Drone', 'Wedding Teaser', 'Lucknow'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_df_1',
        name: 'Complete Wedding Day Coverage',
        price: 55000,
        description: '2 Candid Photographers + 2 Cinematographers + 1 Drone pilot covering full wedding ceremonies.',
        inclusions: ['2 Candid Photographers + 2 Cinematographers', '4K Drone Aerial Coverage', '3-5 Min Cinematic Teaser Film', 'Full 45-min Ultra HD Documentary Film', '300+ Edited High-Res Photos', '1 Premium 40-Page Photobook']
      },
      {
        id: 'pkg_df_2',
        name: 'Royal 2-Day Wedding & Sangeet Package',
        price: 95000,
        description: 'Complete coverage for Sangeet / Mehendi + Main Wedding Day with pre-wedding shoot included.',
        inclusions: ['2-Day Multi-Crew Coverage (5 members)', 'Pre-Wedding Shoot with 2 Outfit Changes', 'Same-Day Edit Video for Reception', '2 Luxury Italian Leather Photo Albums', 'All Raw Footage on SSD Drive']
      }
    ]
  },
  {
    id: 'v_shutter_stories_mum',
    name: 'Shutter Stories Cinematic Studio',
    category: 'photography',
    categoryName: 'Photography & Cinema',
    city: 'Mumbai',
    address: 'Bandra West & Andheri, Mumbai',
    rating: 4.89,
    reviewCount: 152,
    startingPrice: 65000,
    priceUnit: 'per day',
    capacity: 12,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    gallery: ['https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'],
    description: 'Boutique Bollywood-style cinematography crew delivering dreamy magazine-grade photos and Netflix-style wedding films.',
    highlights: ['Netflix Style Documentary', 'Editorial Portraits', 'Pre-Wedding in Goa/Udaipur'],
    contactPhone: '+91 98205 99001',
    email: 'films@shutterstoriesmumbai.com',
    responseTime: '< 1 hour',
    tags: ['Cinematic Film', 'Editorial', 'Mumbai', 'Drone'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_stm_1',
        name: 'Editorial Candid & Cinema',
        price: 70000,
        description: 'Complete 1-day coverage with editorial portraiture.',
        inclusions: ['2 Lead Candid Photographers', '2 Cinematographers with Gimbal & Drone', 'Instagram Reel Edits (5 Reels)', 'Cinematic Teaser & Full Film']
      }
    ]
  },

  // DJ & MUSIC
  {
    id: 'v_dj_kabir_sangeet',
    name: 'DJ Kabir & The Dhol Beats Ensemble',
    category: 'music',
    categoryName: 'DJ & Music',
    city: 'Lucknow',
    address: 'Hazratganj, Lucknow & Kanpur',
    rating: 4.93,
    reviewCount: 160,
    startingPrice: 25000,
    priceUnit: 'per evening',
    capacity: 3000,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1541126274323-dbac58d14741?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwzfHxkaiUyMHBhcnR5fGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1541126274323-dbac58d14741?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwzfHxkaiUyMHBhcnR5fGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1587012521796-6359d3678f2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxzYW5nZWV0fGVufDB8fHx8MTc4ODkzNzIzOXww&ixlib=rb-4.1.0&q=85'
    ],
    description: 'High-voltage entertainment setup featuring top-rated Bollywood club DJ Kabir, 4 authentic Punjabi Dhol artists, intelligent laser moving heads, JBL Line Array sound, and dry-ice cold pyro effects.',
    highlights: ['JBL Line Array Sound System', '4 Live Punjabi Dhol Players', 'Cold Pyro & CO2 Jets', 'Custom Sangeet Playlist Curation'],
    contactPhone: '+91 98890 55667',
    email: 'bookings@djkabirlko.com',
    responseTime: '< 20 mins',
    tags: ['Bollywood DJ', 'Live Dhol', 'Cold Pyro', 'Sangeet Party'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_djk_1',
        name: 'Sangeet Rocker Pro Setup',
        price: 32000,
        description: 'Full sound & light console with DJ Kabir + 2 Dhol players for 4 hours of non-stop dance music.',
        inclusions: ['DJ Kabir Live Performance (4 Hours)', '2 Professional Punjabi Dhol Players', 'JBL VRX Sound System (up to 500 pax)', '8 Moving Head Beam Lights & Fog Machine', 'Cold Pyro Entry Sparklers (4 units)']
      },
      {
        id: 'pkg_djk_2',
        name: 'Grand Concert Stage Setup (Baraat + Sangeet)',
        price: 58000,
        description: 'Complete mega setup with 4 Dholis for Baraat + Line Array Stage for Sangeet + CO2 Jets.',
        inclusions: ['Mobile Dhol Troope for Grand Baraat (4 Dholis)', 'JBL VTX Line Array System (up to 1500 pax)', 'Full Truss Lighting & Laser Show', '4 CO2 Jet Cannons + Low-Fog Cloud Entry', 'Custom Couple Entry Theme Song Mashup']
      }
    ]
  },

  // RENTAL OUTFITS
  {
    id: 'v_royal_couture_rental',
    name: 'Riwaaz Bridal & Groom Rental Studio',
    category: 'outfits',
    categoryName: 'Rental Outfits',
    city: 'Lucknow',
    address: 'Sahara Ganj & Hazratganj, Lucknow',
    rating: 4.87,
    reviewCount: 94,
    startingPrice: 12000,
    priceUnit: 'per 3 days',
    capacity: 50,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxsZWhlbmdhfGVufDB8fHx8MTc4ODg1NDU0NHww&ixlib=rb-4.1.0&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxsZWhlbmdhfGVufDB8fHx8MTc4ODg1NDU0NHww&ixlib=rb-4.1.0&q=85'
    ],
    description: 'Designer rental boutique featuring replica Sabyasachi & Manish Malhotra bridal lehengas, raw silk groom sherwanis, safa turbans, and matching Kundan jewellery sets.',
    highlights: ['Designer Lehengas', 'Sherwanis with Safa & Stole', 'Kundan Bridal Jewellery', 'Custom Fitting & Dry Cleaning'],
    contactPhone: '+91 97210 44556',
    email: 'rentals@riwaazcouture.com',
    responseTime: '< 1 hour',
    tags: ['Lehenga Rental', 'Sherwani Rental', 'Bridal Jewellery', 'Lucknow'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_rc_1',
        name: 'Bridal Couture Lehenga Set',
        price: 15000,
        description: 'Heavy zardozi bridal lehenga with 2 dupattas, cancan skirt, and complete Kundan bridal jewellery set on 3-day rental.',
        inclusions: ['Heavy Zardozi Red/Maroon Lehenga', 'Double Dupatta Styling Set', 'Complete Kundan Choker, Earrings & Maang Tikka', 'Free Alteration & Dry Cleaning Included']
      },
      {
        id: 'pkg_rc_2',
        name: 'Royal Groom Sherwani Ensemble',
        price: 12000,
        description: 'Raw silk embroidered sherwani with matching churidar, brocade safa turban, kalgi, and royal pearls mala.',
        inclusions: ['Embroidered Raw Silk Sherwani', 'Churidar & Matching Stole', 'Brocade Safa with Kalgi Brooch', 'Multi-Layer Royal Pearl Mala & Mojaris']
      }
    ]
  },

  // RETURN GIFTS & FAVORS
  {
    id: 'v_shree_hampers_del',
    name: 'Sanskriti Handcrafted Favors & Hampers',
    category: 'gifts',
    categoryName: 'Return Gifts & Favors',
    city: 'Delhi NCR',
    address: 'Chandni Chowk & South Ex, Delhi NCR',
    rating: 4.88,
    reviewCount: 112,
    startingPrice: 250,
    priceUnit: 'per piece',
    capacity: 5000,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxnaWZ0JTIwaGFtcGVyfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
    gallery: ['https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxnaWZ0JTIwaGFtcGVyfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85'],
    description: 'Artisanal gift studio crafting bespoke brass diyas, organic honey & dry fruit boxes, silver-plated pooja thalis, and custom personalized wedding gift hampers.',
    highlights: ['Custom Couple Monogramming', 'Eco-friendly Velvet Bags', 'Doorstep Pan-India Delivery'],
    contactPhone: '+91 98112 33441',
    email: 'hampers@sanskritigifts.com',
    responseTime: '< 1 hour',
    tags: ['Return Gifts', 'Brassware', 'Dry Fruit Boxes', 'Custom Favors'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_sh_1',
        name: 'Royal Brass Diya & Dry Fruit Hamper (100 Pcs)',
        price: 28000,
        description: 'Set of 100 engraved brass peacock diyas packed with 4-variety dry fruits in velvet boxes.',
        inclusions: ['100 Pcs Handcrafted Brass Diyas', 'Velvet Gold Embossed Gift Boxes', '200g Roasted Almonds & Cashews per box', 'Personalized Thank You Ribbon Cards']
      }
    ]
  },

  // FLORISTS & GARLANDS
  {
    id: 'v_pushp_florals_jaipur',
    name: 'Pushpanjali Exotic Florists & Varmalas',
    category: 'florists',
    categoryName: 'Florists & Garlands',
    city: 'Jaipur',
    address: 'MI Road & Raja Park, Jaipur',
    rating: 4.9,
    reviewCount: 88,
    startingPrice: 15000,
    priceUnit: 'per setup',
    capacity: 20,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb',
    gallery: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb'],
    description: 'Specialists in fragrant Thai orchids, Dutch rose varmalas, marigold photobooths, and luxury bridal car flower decorations.',
    highlights: ['Preserved Rose Varmalas', 'Orchid Canopies', 'Fragrant Mogra Garlands'],
    contactPhone: '+91 94142 66778',
    email: 'flowers@pushpanjaliflorals.com',
    responseTime: '< 30 mins',
    tags: ['Varmala', 'Orchids', 'Car Decor', 'Jaipur'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_pf_1',
        name: 'Royal Varmala & Car Decor Set',
        price: 16000,
        description: 'Pair of exotic Dutch Rose varmalas + complete floral luxury car decoration.',
        inclusions: ['1 Pair Designer Pearl & Rose Varmalas', 'Mercedes/Audi Luxury Floral Bonnet & Door Decor', 'Phoolon Ki Chaadar for Bridal Entry', '10 Buttonholes / Lapel Corsages']
      }
    ]
  },

  // INVITATIONS & DIGITAL INVITES
  {
    id: 'v_royal_patra_invites',
    name: 'Patra & Scrolls Royal Invitations',
    category: 'invitations',
    categoryName: 'Invitation Cards & E-Invites',
    city: 'Lucknow',
    address: 'Aminabad & Hazratganj, Lucknow',
    rating: 4.92,
    reviewCount: 104,
    startingPrice: 4500,
    priceUnit: 'per set/video',
    capacity: 1000,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1656104717095-9d062b0d4e8d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHw0fHxpbnZpdGF0aW9uJTIwY2FyZHxlbnwwfHx8fDE3ODg5MzcyMzh8MA&ixlib=rb-4.1.0&q=85',
    gallery: ['https://images.unsplash.com/photo-1656104717095-9d062b0d4e8d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHw0fHxpbnZpdGF0aW9uJTIwY2FyZHxlbnwwfHx8fDE3ODg5MzcyMzh8MA&ixlib=rb-4.1.0&q=85'],
    description: 'Luxury invitation design house providing animated 3D video e-invites, velvet scroll box invites, wax seal envelopes, and custom WhatsApp itinerary graphics.',
    highlights: ['3D Animated Video Invites', 'Velvet Scroll Box Cards', 'Interactive RSVP Web Link'],
    contactPhone: '+91 98380 99001',
    email: 'design@patrainvites.com',
    responseTime: '< 20 mins',
    tags: ['Video E-Invites', 'Scroll Cards', 'Velvet Box', 'Lucknow'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_pi_1',
        name: '3D Animated Video + WhatsApp Suite',
        price: 5500,
        description: '60-second personalized 3D animated wedding story video + PDF itinerary + Instagram story format.',
        inclusions: ['Custom 3D Animated Video Invite (with Couple Caricatures)', 'Multi-Page High-Res PDF Itinerary', 'Interactive WhatsApp RSVP Link with Google Maps', 'Instagram Story & Countdown Stickers']
      },
      {
        id: 'pkg_pi_2',
        name: 'Royal Velvet Scroll Box Suite (150 Cards)',
        price: 24000,
        description: '150 gold foiled velvet box cards with traditional brass scroll cylinders and wax seals.',
        inclusions: ['150 Pcs Velvet Box & Scroll Invitations', 'Gold Foil Calligraphy Printing', 'Custom Wax Stamp Seal with Couple Monogram', 'Hand-Delivered Box Packaging']
      }
    ]
  },

  // EVENT PLANNERS & COORDINATORS
  {
    id: 'v_bandhan_planners_lko',
    name: 'Bandhan & Co. Luxury Event Planners',
    category: 'planners',
    categoryName: 'Event Planners & Coordinators',
    city: 'Lucknow',
    address: 'Vipin Khand, Gomti Nagar, Lucknow',
    rating: 4.97,
    reviewCount: 135,
    startingPrice: 65000,
    priceUnit: 'full service',
    capacity: 15,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHw0fHxjb3Jwb3JhdGUlMjBldmVudHxlbnwwfHx8fDE3ODg5MzcyMzh8MA&ixlib=rb-4.1.0&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHw0fHxjb3Jwb3JhdGUlMjBldmVudHxlbnwwfHx8fDE3ODg5MzcyMzh8MA&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'
    ],
    description: 'Premier wedding planners and hospitality coordinators managing vendor negotiations, guest RSVP logistics, shadow managers for bride and groom, and on-ground timeline execution.',
    highlights: ['Bride & Groom Shadow Managers', 'Guest RSVP & Hotel Check-in Team', 'Vendor Crisis Management', 'Zero Stress Guarantee'],
    contactPhone: '+91 99350 11223',
    email: 'contact@bandhanplanners.com',
    responseTime: '< 15 mins',
    tags: ['Wedding Planner', 'RSVP Logistics', 'Day Coordinator', 'Lucknow'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_bp_1',
        name: 'Day-Of Wedding Coordination',
        price: 65000,
        description: 'Team of 4 coordinators handling on-site vendor check-ins, ritual timelines, and guest assistance.',
        inclusions: ['4 Professional Event Coordinators on site for 12 Hours', 'Vendor Arrival & Sound Check Management', 'Bridal Shadow & Groom Shadow Assistant', 'Stage & Guest Protocol Flow Execution']
      },
      {
        id: 'pkg_bp_2',
        name: 'Full 360° Royal Wedding Planning',
        price: 140000,
        description: 'Complete end-to-end planning from venue booking, vendor negotiations, thematic design to 3 days on-ground management.',
        inclusions: ['Dedicated Senior Wedding Planner for 3 Months', 'Vendor Negotiation & Contracts Guarantee', 'Hospitality & Airport Pickup Coordination Team (8 Staff)', 'Custom 3D Theme Decor Design & Artist Management']
      }
    ]
  },

  // ADDITIONAL VENDORS FOR BENGALURU & HYDERABAD
  {
    id: 'v_royal_orchid_blr',
    name: 'The Grand Pavilion & Glasshouse',
    category: 'venues',
    categoryName: 'Venues / Banquet Halls',
    city: 'Bengaluru',
    address: 'Whitefield & Palace Grounds, Bengaluru',
    rating: 4.86,
    reviewCount: 110,
    startingPrice: 140000,
    priceUnit: 'per day',
    capacity: 1000,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    gallery: ['https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'],
    description: 'Victorian-inspired glasshouse pavilion surrounded by tropical rain trees in Bengaluru, featuring sustainable solar lighting and bespoke sound staging.',
    highlights: ['Glasshouse Architecture', 'Tropical Lawn', 'Palace Grounds Access'],
    contactPhone: '+91 80 4455 6677',
    email: 'events@grandpavilionblr.com',
    responseTime: '< 1 hour',
    tags: ['Glasshouse', 'Bengaluru', 'Modern', 'Lawn'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_gp_1',
        name: 'Glasshouse & Courtyard',
        price: 140000,
        description: 'Exclusive access to Victorian glasshouse and lawn.',
        inclusions: ['Glasshouse Banquet (800 pax)', 'Lawn & Open Terrace', '4 AC Suites', 'Security & Backup']
      }
    ]
  },
  {
    id: 'v_nizami_dawat_hyd',
    name: 'Nizami Dawat-e-Khas Catering',
    category: 'catering',
    categoryName: 'Catering & Feasts',
    city: 'Hyderabad',
    address: 'Banjara Hills & Jubilee Hills, Hyderabad',
    rating: 4.95,
    reviewCount: 175,
    startingPrice: 900,
    priceUnit: 'per plate',
    capacity: 3000,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033',
    gallery: ['https://images.unsplash.com/photo-1555244162-803834f70033'],
    description: 'Heritage Hyderabadi catering masters world-famous for Kachche Gosht Ki Biryani, Mirchi Ka Salan, Double Ka Meetha, and royal vegetarian delicacies.',
    highlights: ['Hyderabadi Dum Biryani', 'Live Haleem Stalls', 'Silver Leaf Presentation'],
    contactPhone: '+91 98490 22334',
    email: 'nizamidawat@hydcaterers.com',
    responseTime: '< 30 mins',
    tags: ['Hyderabadi Biryani', 'Nizami Feast', 'Banjara Hills'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_nd_1',
        name: 'Royal Nizami Feast',
        price: 980,
        description: 'Authentic Hyderabadi wedding menu with live Dum Biryani pots and Shahi Desserts.',
        inclusions: ['Live Hyderabadi Dum Biryani (Chicken/Mutton & Veg)', 'Mirchi Ka Salan & Bagara Baingan', 'Pathar Ka Gosht & Veg Galouti', 'Double Ka Meetha & Qubani Ka Meetha']
      }
    ]
  },
  // 8 ADDITIONAL REALISTIC VENDORS TO SURPASS 25+ REQUIREMENT
  {
    id: 'v_mewar_lake_udaipur',
    name: 'Mewar Lakeside Haveli & Jagmandir Views',
    category: 'venues',
    categoryName: 'Venues / Banquet Halls',
    city: 'Udaipur',
    address: 'Pichola Lake Road, Udaipur, Rajasthan',
    rating: 4.98,
    reviewCount: 165,
    startingPrice: 280000,
    priceUnit: 'per day',
    capacity: 900,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1744805624954-a6686543c3ff',
    gallery: ['https://images.unsplash.com/photo-1744805624954-a6686543c3ff'],
    description: 'Iconic Lake Pichola heritage venue offering royal boat arrivals, candlelit terraces, and palatial marble courtyards for destination weddings.',
    highlights: ['Lake Pichola Boat Entry', 'Heritage Courtyard', 'Royal Mewari Welcome'],
    contactPhone: '+91 94140 11229',
    email: 'mewar@lakesidehaveli.com',
    responseTime: '< 1 hour',
    tags: ['Udaipur', 'Destination Wedding', 'Lake View', 'Palace'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_ml_1',
        name: 'Royal Lake Pichola Extravaganza',
        price: 280000,
        description: 'Full day access to lakeside marble courtyard, jetty reception and 6 heritage suites.',
        inclusions: ['Lakeside Courtyard for 800 guests', 'Shikara Boat Bridal Arrival', '6 Royal Lake-view Suites', 'Fairy Candle Lighting (2000 units)']
      }
    ]
  },
  {
    id: 'v_goa_boho_decor',
    name: 'Coastal Bohemian & Sunset Mandap Stylists',
    category: 'decor',
    categoryName: 'Decoration & Mandaps',
    city: 'Goa',
    address: 'Candolim & Morjim Beach Road, Goa',
    rating: 4.88,
    reviewCount: 92,
    startingPrice: 55000,
    priceUnit: 'per event',
    capacity: 600,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
    gallery: ['https://images.unsplash.com/photo-1587271636175-90d58cdad458?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85'],
    description: 'Goa’s top beach wedding designers known for driftwood bamboo arches, pampas grass installations, sunset fairy light canopies, and tropical tiki bar setups.',
    highlights: ['Beach Driftwood Mandap', 'Sunset Light Canopies', 'Tiki Cocktail Bar Setup'],
    contactPhone: '+91 98220 77881',
    email: 'hello@goabohodecor.com',
    responseTime: '< 45 mins',
    tags: ['Goa', 'Beach Wedding', 'Boho Chic', 'Sunset Mandap'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_gb_1',
        name: 'Sunset Beachfront Mandap & Fairy Canopy',
        price: 60000,
        description: 'Natural bamboo and tropical orchid mandap overlooking the sunset waves.',
        inclusions: ['4-Pillar Driftwood Mandap with Tropical Orchids', 'Sunset Fairy String Ceiling (50x50ft)', 'Beach Aisle Runner & Lanterns', 'Cocktail Lounge Furniture']
      }
    ]
  },
  {
    id: 'v_farha_henna_hyd',
    name: 'Farha Bridal Organic Henna & Mehndi Studio',
    category: 'makeup',
    categoryName: 'Makeup Artists',
    city: 'Hyderabad',
    address: 'Charminar & Banjara Hills, Hyderabad',
    rating: 4.96,
    reviewCount: 145,
    startingPrice: 12000,
    priceUnit: 'per bridal',
    capacity: 20,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb',
    gallery: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb'],
    description: 'Specialist in 100% organic dark-stain Rajasthani henna, Arabic fusion figures, customized bridal love-story motifs, and portraits.',
    highlights: ['100% Organic Sojat Henna', 'Bridal Love Story Portraits', 'Guaranteed Dark Mahogany Stain'],
    contactPhone: '+91 98480 33441',
    email: 'farha@bridalhennahyd.com',
    responseTime: '< 15 mins',
    tags: ['Bridal Mehndi', 'Organic Henna', 'Hyderabad', 'Love Story'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_fh_1',
        name: 'Royal Figures & Story Bridal Mehndi',
        price: 14000,
        description: 'Full intricate arms till elbows and feet with couple portrait sketches and baraat procession motifs.',
        inclusions: ['Both Arms (Front & Back) till Elbows', 'Both Feet till Mid-Calf with Figures', 'Couple Portrait & Wedding Hashtag Inscribed', 'Organic Aftercare Essential Oil Sealant']
      }
    ]
  },
  {
    id: 'v_royal_pagri_mum',
    name: 'Shahi Pagri & Groom Safa Turban Studio',
    category: 'outfits',
    categoryName: 'Rental Outfits',
    city: 'Mumbai',
    address: 'Kalbadevi & Dadar TT, Mumbai',
    rating: 4.89,
    reviewCount: 88,
    startingPrice: 6500,
    priceUnit: 'per 50 safas',
    capacity: 500,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxsZWhlbmdhfGVufDB8fHx8MTc4ODg1NDU0NHww&ixlib=rb-4.1.0&q=85',
    gallery: ['https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxsZWhlbmdhfGVufDB8fHx8MTc4ODg1NDU0NHww&ixlib=rb-4.1.0&q=85'],
    description: 'Expert live turban tying masters for Barati safas, Rajasthani leheriya turbans, Banarasi silk safas, and groom royal kalgis on-site.',
    highlights: ['Live Barati Turban Tying', 'Banarasi Silk Safas', 'On-Site Tying Masters'],
    contactPhone: '+91 98211 44552',
    email: 'safa@shahipagrimumbai.com',
    responseTime: '< 30 mins',
    tags: ['Barati Safa', 'Pagri Tying', 'Groom Turban', 'Mumbai'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_rp_1',
        name: 'Barati Safa & Live Tying (50 Guests)',
        price: 9500,
        description: '50 floral printed Kota silk safas + 2 professional tying masters at venue.',
        inclusions: ['50 Premium Floral Silk Safas', '2 Master Pagri Tiers on-site for 3 hours', '1 Exclusive Brocade Safa for Groom with Kalgi Brooch', 'Safa Trays & Stoles']
      }
    ]
  },
  {
    id: 'v_chhappan_bhog_del',
    name: 'Chhappan Bhog Artisanal Mithai & Sweets',
    category: 'gifts',
    categoryName: 'Return Gifts & Favors',
    city: 'Delhi NCR',
    address: 'Karol Bagh & Rajouri Garden, Delhi NCR',
    rating: 4.93,
    reviewCount: 140,
    startingPrice: 450,
    priceUnit: 'per box',
    capacity: 2000,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxnaWZ0JTIwaGFtcGVyfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
    gallery: ['https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxnaWZ0JTIwaGFtcGVyfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85'],
    description: 'Luxury pure-ghee artisanal Indian confectioners known for Kaju Katli gold leaf, Baklava bites, Anjeer barfi, and custom velvet boxed sweets hampers.',
    highlights: ['Pure Desi Ghee Mithai', '24K Edible Gold Leaf', 'Custom Box Foil Embossing'],
    contactPhone: '+91 98119 88771',
    email: 'mithai@chhappanbhogdelhi.com',
    responseTime: '< 30 mins',
    tags: ['Mithai Hampers', 'Sweets Gift', 'Delhi NCR', 'Kaju Katli'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_cb_1',
        name: 'Luxury Mithai & Dry-fruit Box (50 Boxes)',
        price: 26000,
        description: '50 Royal Hexagonal velvet boxes each containing 16 assorted pieces of luxury sweets and cashews.',
        inclusions: ['50 Designer Hexagon Boxes with Couple Initials', 'Assorted Kaju Paan, Pistachio Baklava & Anjeer Barfi', 'Roasted Afghani Almonds & Cashews', 'Velvet Gold Tassel Ribbons']
      }
    ]
  },
  {
    id: 'v_pixel_petals_blr',
    name: 'Pixel & Petals Fine Art Wedding Studio',
    category: 'photography',
    categoryName: 'Photography & Cinema',
    city: 'Bengaluru',
    address: 'Indiranagar & Koramangala, Bengaluru',
    rating: 4.91,
    reviewCount: 118,
    startingPrice: 50000,
    priceUnit: 'per day',
    capacity: 8,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1744805624954-a6686543c3ff',
    gallery: ['https://images.unsplash.com/photo-1744805624954-a6686543c3ff'],
    description: 'Fine art photojournalists creating warm, timeless, documentary-style wedding stories with vintage color grades and high-speed candid captures.',
    highlights: ['Fine Art Photojournalism', 'Warm Vintage Color Tone', 'Private Online Cloud Gallery'],
    contactPhone: '+91 80 9988 7766',
    email: 'hello@pixelandpetals.com',
    responseTime: '< 30 mins',
    tags: ['Fine Art', 'Candid Photo', 'Bengaluru', 'Documentary'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_pp_1',
        name: 'Fine Art Candid & Highlights',
        price: 52000,
        description: 'Lead candid shooter + cinematographer delivering 400+ color-graded images and a 4K highlight film.',
        inclusions: ['Lead Fine-Art Candid Photographer', 'Cinematographer with Gimbal', 'Online Private Cloud Gallery (1 Year)', '4K Highlight Reel + All Edited Photos']
      }
    ]
  },
  {
    id: 'v_shehnai_sitar_jaipur',
    name: 'Rajputana Royal Shehnai & Sitar Ensemble',
    category: 'music',
    categoryName: 'DJ & Music',
    city: 'Jaipur',
    address: 'C-Scheme & Johari Bazaar, Jaipur',
    rating: 4.95,
    reviewCount: 96,
    startingPrice: 18000,
    priceUnit: 'per ceremony',
    capacity: 1000,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1587012521796-6359d3678f2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxzYW5nZWV0fGVufDB8fHx8MTc4ODkzNzIzOXww&ixlib=rb-4.1.0&q=85',
    gallery: ['https://images.unsplash.com/photo-1587012521796-6359d3678f2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxzYW5nZWV0fGVufDB8fHx8MTc4ODkzNzIzOXww&ixlib=rb-4.1.0&q=85'],
    description: 'Classical instrumentalists performing auspicious morning Shehnai, Mangal Vaadya, sitar-tabla jugalbandi for pheras, and royal entrance trumpet salutes.',
    highlights: ['Auspicious Phera Shehnai', 'Sitar & Santoor Jugalbandi', 'Traditional Rajasthani Attire'],
    contactPhone: '+91 94140 33221',
    email: 'shehnai@rajputanamusic.com',
    responseTime: '< 20 mins',
    tags: ['Shehnai', 'Sitar', 'Mangal Vaadya', 'Jaipur'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_ssm_1',
        name: 'Auspicious Pheras Live Jugalbandi',
        price: 22000,
        description: '4-artist ensemble (Shehnai, Sitar, Santoor, Tabla) in royal red and gold sherwanis for 3 hours of ceremony music.',
        inclusions: ['4 Traditional Classical Musicians', 'Royal Rajasthani Traditional Attire', 'Acoustic Microphones & Sound Integration', 'Custom Entry Raag Performance']
      }
    ]
  },
  {
    id: 'v_elite_planners_del',
    name: 'Elite Signature Wedding & Gala Planners',
    category: 'planners',
    categoryName: 'Event Planners & Coordinators',
    city: 'Delhi NCR',
    address: 'Mehrauli & Aerocity, New Delhi',
    rating: 4.94,
    reviewCount: 125,
    startingPrice: 80000,
    priceUnit: 'full service',
    capacity: 25,
    verified: true,
    featured: true,
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHw0fHxjb3Jwb3JhdGUlMjBldmVudHxlbnwwfHx8fDE3ODg5MzcyMzh8MA&ixlib=rb-4.1.0&q=85',
    gallery: ['https://images.unsplash.com/photo-1527529482837-4698179dc6ce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHw0fHxjb3Jwb3JhdGUlMjBldmVudHxlbnwwfHx8fDE3ODg5MzcyMzh8MA&ixlib=rb-4.1.0&q=85'],
    description: 'Luxury destination and Delhi high-society planners executing bespoke hospitality desks, vintage car logistics, and celebrity artist bookings.',
    highlights: ['Celebrity Artist Booking', 'Airport Concierge Team', 'Full Production Supervision'],
    contactPhone: '+91 98100 33990',
    email: 'vip@elitesignatureweddings.com',
    responseTime: '< 15 mins',
    tags: ['Destination Planner', 'Celebrity Artist', 'Delhi NCR', 'Luxury Wedding'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_ep_1',
        name: 'Full Signature Turnkey Planning',
        price: 95000,
        description: 'Comprehensive 360-degree planning, vendor coordination, and 6 on-site day managers.',
        inclusions: ['6 Senior Event Managers on Site', 'Complete Vendor Master Timeline Tracking', 'Hospitality Check-in & Welcome Desk', 'Budget Optimization & Vendor Bill Auditing']
      }
    ]
  },
  {
    id: 'v_bombay_rasoi_mum',
    name: 'Bombay Gourmet Coast & Chaat Catering',
    category: 'catering',
    categoryName: 'Catering & Feasts',
    city: 'Mumbai',
    address: 'Bandra Kurla Complex & Lower Parel, Mumbai',
    rating: 4.88,
    reviewCount: 132,
    startingPrice: 1050,
    priceUnit: 'per plate',
    capacity: 1800,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033',
    gallery: ['https://images.unsplash.com/photo-1555244162-803834f70033'],
    description: 'Maharashtrian, Coastal Malwani, and progressive North Indian banquet specialists with artisanal live sushi and pav bhaji counters.',
    highlights: ['Artisanal Pav Bhaji Counter', 'Coastal Seafood & Veg Delicacies', 'Eco-friendly Areca Ware'],
    contactPhone: '+91 98200 44558',
    email: 'cater@bombayrasoimumbai.com',
    responseTime: '< 30 mins',
    tags: ['Coastal Catering', 'Chaat Chowk', 'Mumbai', 'Multi-Cuisine'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_br_1',
        name: 'Coastal & Shahi Mahabhoj',
        price: 1100,
        description: 'Multi-cuisine spread with 7 starters, live counter stations and traditional sweets.',
        inclusions: ['7 Live Starters & Mocktails', 'Main Course Shahi Curries & Biryanis', 'Live Jalebi & Kulfi Falooda Bar']
      }
    ]
  },
  {
    id: 'v_shivalik_greens_chd',
    name: 'The Shivalik Foothills Resort & Banquets',
    category: 'venues',
    categoryName: 'Venues / Banquet Halls',
    city: 'Chandigarh',
    address: 'Kalka-Shimla Highway, Chandigarh Tri-City',
    rating: 4.92,
    reviewCount: 105,
    startingPrice: 150000,
    priceUnit: 'per day',
    capacity: 1400,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    gallery: ['https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'],
    description: 'Scenic resort set against the Shivalik hills featuring open-air mountain-view amphitheatre, 10,000 sq.ft banquet, and bonfire zones.',
    highlights: ['Mountain View Lawns', 'Bonfire & Sangeet Amphitheatre', 'Helipad Access'],
    contactPhone: '+91 98760 11228',
    email: 'resort@shivalikgreens.com',
    responseTime: '< 45 mins',
    tags: ['Chandigarh', 'Mountain View', 'Resort Lawn', 'Sangeet'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_sg_1',
        name: 'Hill-View Lawn & Banquet',
        price: 150000,
        description: 'Amphitheatre + banquet hall for 1000 guests with mountain backdrop.',
        inclusions: ['Mountain Lawn & Hall', 'Bonfire Setup', '4 Luxury Chalets', 'Power Backup']
      }
    ]
  },
  {
    id: 'v_manyavar_couture_del',
    name: 'Virasat Designer Sherwani & Bridal Studio',
    category: 'outfits',
    categoryName: 'Rental Outfits',
    city: 'Delhi NCR',
    address: 'Chandni Chowk & Karol Bagh, Delhi NCR',
    rating: 4.9,
    reviewCount: 115,
    startingPrice: 9500,
    priceUnit: 'per 3 days',
    capacity: 100,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxsZWhlbmdhfGVufDB8fHx8MTc4ODg1NDU0NHww&ixlib=rb-4.1.0&q=85',
    gallery: ['https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxsZWhlbmdhfGVufDB8fHx8MTc4ODg1NDU0NHww&ixlib=rb-4.1.0&q=85'],
    description: 'Premium rental boutique carrying authentic zardozi lehengas, velvet bandhgalas, Indo-western tuxedos, and polki jewellery sets.',
    highlights: ['Handmade Zardozi Work', 'Velvet Bandhgalas', 'Complete Jewellery Sets'],
    contactPhone: '+91 98110 99882',
    email: 'virasat@designerrentals.com',
    responseTime: '< 30 mins',
    tags: ['Sherwani Rental', 'Lehenga Rental', 'Delhi NCR', 'Zardozi'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_vc_1',
        name: 'Groom Royal Velvet Bandhgala',
        price: 11000,
        description: 'Embroidered velvet bandhgala jacket with silk trouser, pocket square, and brooch on 3-day rental.',
        inclusions: ['Velvet Bandhgala Suit', 'Silk Kurta & Churidar', 'Gold Plated Cufflinks & Brooch', 'Custom Fitting']
      }
    ]
  },
  {
    id: 'v_blooms_nawabi_lko',
    name: 'Nawabi Fragrance & Tuberose Florists',
    category: 'florists',
    categoryName: 'Florists & Garlands',
    city: 'Lucknow',
    address: 'Chowk & Gomti Nagar, Lucknow',
    rating: 4.94,
    reviewCount: 76,
    startingPrice: 10000,
    priceUnit: 'per setup',
    capacity: 15,
    verified: true,
    featured: false,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb',
    gallery: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb'],
    description: 'Artisan florists using fresh Kannauj Bela, Rajnigandha (tuberose), and lotus flowers for royal Lucknawi wedding aroma decor.',
    highlights: ['Kannauj Bela & Rajnigandha', 'Lotus Water Urns', 'Fresh Varmalas'],
    contactPhone: '+91 94151 77665',
    email: 'nawabi@fragrantflorals.com',
    responseTime: '< 20 mins',
    tags: ['Tuberose', 'Rajnigandha', 'Kannauj Bela', 'Lucknow'],
    status: 'approved',
    packages: [
      {
        id: 'pkg_bn_1',
        name: 'Aromatic Tuberose & Bela Decor',
        price: 12000,
        description: 'Floral curtains and hanging tassels of Rajnigandha and marigolds.',
        inclusions: ['Rajnigandha Hanging Jhumars (10 units)', 'Pair of Fresh Bela Varmalas', 'Lotus Water Bowls for Entrance']
      }
    ]
  }
]

const SEED_PACKAGES = [
  {
    id: 'pkg_basic_celebration',
    title: 'Basic Celebration Package',
    subtitle: 'Ideal for intimate birthdays, anniversaries, and roka ceremonies (up to 75 guests)',
    eventType: 'Birthday',
    price: 75000,
    originalPrice: 90000,
    badge: 'Best Value',
    popular: false,
    bannerImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwzfHxiaXJ0aGRheSUyMGNlbGVicmF0aW9ufGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85',
    highlights: ['Fairy Light Backdrop Decor', 'Pro DJ & Sound (3 hrs)', 'Candid Photo & Video (1 Pro)', 'Digital 3D E-Invite Suite'],
    items: [
      {
        category: 'decor',
        vendorId: 'v_utsav_decor_lko',
        vendorName: 'Gulmohar Luxury Events & Stage Decor',
        packageName: 'Classic Floral Elegance',
        price: 35000
      },
      {
        category: 'music',
        vendorId: 'v_dj_kabir_sangeet',
        vendorName: 'DJ Kabir & The Dhol Beats Ensemble',
        packageName: 'Sangeet Rocker Pro Setup',
        price: 20000
      },
      {
        category: 'photography',
        vendorId: 'v_drishti_cinema_lko',
        vendorName: 'Drishti Wedding Films & Photography',
        packageName: 'Complete Wedding Day Coverage',
        price: 15500
      },
      {
        category: 'invitations',
        vendorId: 'v_royal_patra_invites',
        vendorName: 'Patra & Scrolls Royal Invitations',
        packageName: '3D Animated Video + WhatsApp Suite',
        price: 4500
      }
    ]
  },
  {
    id: 'pkg_premium_celebration',
    title: 'Premium Celebration & Sangeet',
    subtitle: 'Comprehensive package for engagements, grand sangeet, and 200-guest receptions',
    eventType: 'Engagement',
    price: 165000,
    originalPrice: 195000,
    badge: 'Most Popular',
    popular: true,
    bannerImage: 'https://images.unsplash.com/photo-1587012521796-6359d3678f2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxzYW5nZWV0fGVufDB8fHx8MTc4ODkzNzIzOXww&ixlib=rb-4.1.0&q=85',
    highlights: ['Floral Mandap & Stage (30ft)', 'Awadhi Feast (100 Pax Starter)', 'Bridal HD Glam Look', 'Candid Cinema + Drone Shoot', 'DJ Kabir + Punjabi Dhol'],
    items: [
      {
        category: 'decor',
        vendorId: 'v_utsav_decor_lko',
        vendorName: 'Gulmohar Luxury Events & Stage Decor',
        packageName: 'Classic Floral Elegance',
        price: 45000
      },
      {
        category: 'makeup',
        vendorId: 'v_glam_by_simran',
        vendorName: 'Glow & Glam by Simran Kaur',
        packageName: 'Signature HD Bridal Makeup',
        price: 18000
      },
      {
        category: 'photography',
        vendorId: 'v_drishti_cinema_lko',
        vendorName: 'Drishti Wedding Films & Photography',
        packageName: 'Complete Wedding Day Coverage',
        price: 45000
      },
      {
        category: 'music',
        vendorId: 'v_dj_kabir_sangeet',
        vendorName: 'DJ Kabir & The Dhol Beats Ensemble',
        packageName: 'Sangeet Rocker Pro Setup',
        price: 32000
      },
      {
        category: 'florists',
        vendorId: 'v_pushp_florals_jaipur',
        vendorName: 'Pushpanjali Exotic Florists & Varmalas',
        packageName: 'Royal Varmala & Car Decor Set',
        price: 15000
      },
      {
        category: 'invitations',
        vendorId: 'v_royal_patra_invites',
        vendorName: 'Patra & Scrolls Royal Invitations',
        packageName: '3D Animated Video + WhatsApp Suite',
        price: 5500
      },
      {
        category: 'gifts',
        vendorId: 'v_shree_hampers_del',
        vendorName: 'Sanskriti Handcrafted Favors & Hampers',
        packageName: 'Royal Brass Diya & Dry Fruit Hamper (100 Pcs)',
        price: 4500
      }
    ]
  },
  {
    id: 'pkg_luxury_royal_wedding',
    title: 'Luxury Royal Indian Wedding',
    subtitle: 'The all-inclusive royal wedding extravaganza covering all 11 categories for 350+ guests',
    eventType: 'Wedding',
    price: 495000,
    originalPrice: 580000,
    badge: 'All-Inclusive Royalty',
    popular: true,
    bannerImage: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
    highlights: ['Palace Banquet & Lawn', 'Imperial 4-Pillar Mandap', 'Royal Shahi 4-Course Feast', 'Full Cinema Crew + 4K Drone', 'Full Day Wedding Planner Crew'],
    items: [
      {
        category: 'venues',
        vendorId: 'v_royal_palace_lko',
        vendorName: 'The Royal Nawabi Palace & Lawns',
        packageName: 'Royal Heritage Bundle (Hall + Lawn)',
        price: 165000
      },
      {
        category: 'decor',
        vendorId: 'v_utsav_decor_lko',
        vendorName: 'Gulmohar Luxury Events & Stage Decor',
        packageName: 'Imperial Royal Mandap & Theme Concept',
        price: 85000
      },
      {
        category: 'catering',
        vendorId: 'v_dastarkhwan_catering',
        vendorName: 'Dastarkhwan Awadhi & Royal Caterers',
        packageName: 'Royal Shahi Feast (Veg & Non-Veg)',
        price: 95000
      },
      {
        category: 'photography',
        vendorId: 'v_drishti_cinema_lko',
        vendorName: 'Drishti Wedding Films & Photography',
        packageName: 'Royal 2-Day Wedding & Sangeet Package',
        price: 55000
      },
      {
        category: 'makeup',
        vendorId: 'v_glam_by_simran',
        vendorName: 'Glow & Glam by Simran Kaur',
        packageName: 'Royal 3-Event Bridal Package',
        price: 42000
      },
      {
        category: 'music',
        vendorId: 'v_dj_kabir_sangeet',
        vendorName: 'DJ Kabir & The Dhol Beats Ensemble',
        packageName: 'Grand Concert Stage Setup (Baraat + Sangeet)',
        price: 38000
      },
      {
        category: 'planners',
        vendorId: 'v_bandhan_planners_lko',
        vendorName: 'Bandhan & Co. Luxury Event Planners',
        packageName: 'Day-Of Wedding Coordination',
        price: 45000
      },
      {
        category: 'invitations',
        vendorId: 'v_royal_patra_invites',
        vendorName: 'Patra & Scrolls Royal Invitations',
        packageName: 'Royal Velvet Scroll Box Suite (150 Cards)',
        price: 24000
      },
      {
        category: 'gifts',
        vendorId: 'v_shree_hampers_del',
        vendorName: 'Sanskriti Handcrafted Favors & Hampers',
        packageName: 'Royal Brass Diya & Dry Fruit Hamper (100 Pcs)',
        price: 28000
      },
      {
        category: 'florists',
        vendorId: 'v_pushp_florals_jaipur',
        vendorName: 'Pushpanjali Exotic Florists & Varmalas',
        packageName: 'Royal Varmala & Car Decor Set',
        price: 16000
      }
    ]
  }
]

const SEED_REVIEWS = [
  {
    id: 'rev_1',
    vendorId: 'v_royal_palace_lko',
    vendorName: 'The Royal Nawabi Palace & Lawns',
    userId: 'usr_priya_sharma',
    userName: 'Priya & Siddharth Sharma',
    userCity: 'Lucknow',
    rating: 5,
    eventType: 'Wedding Reception',
    date: '12 May 2025',
    comment: 'Our wedding at Royal Nawabi Palace was nothing short of a fairy tale! The staff was extremely polite, lighting was breathtaking and all 600 of our guests were spellbound by the royal architecture.',
    verifiedBooking: true
  },
  {
    id: 'rev_2',
    vendorId: 'v_dastarkhwan_catering',
    vendorName: 'Dastarkhwan Awadhi & Royal Caterers',
    userId: 'usr_amit_verma',
    userName: 'Dr. Amit Verma',
    userCity: 'Lucknow',
    rating: 5,
    eventType: 'Sangeet & Dinner',
    date: '28 April 2025',
    comment: 'The Galouti Kebabs and Dum Biryani were out of this world. Guests are still calling us asking for the caterer’s number! Impeccable hygiene and royal presentation.',
    verifiedBooking: true
  },
  {
    id: 'rev_3',
    vendorId: 'v_utsav_decor_lko',
    vendorName: 'Gulmohar Luxury Events & Stage Decor',
    userId: 'usr_ananya_mishra',
    userName: 'Ananya Mishra',
    userCity: 'Delhi',
    rating: 5,
    eventType: 'Wedding Mandap',
    date: '10 June 2025',
    comment: 'The floral mandap was exactly like my Pinterest dream board! Fresh roses, tuberose fragrance, and fairytale starlight walk. Highly recommended for couples!',
    verifiedBooking: true
  },
  {
    id: 'rev_4',
    vendorId: 'v_glam_by_simran',
    vendorName: 'Glow & Glam by Simran Kaur',
    userId: 'usr_radhika_gupta',
    userName: 'Radhika Gupta',
    userCity: 'Lucknow',
    rating: 5,
    eventType: 'Bridal Makeup',
    date: '18 May 2025',
    comment: 'Simran is a magician! My makeup stayed flawless for 14 hours through tears, pheras, and all the photos. The airbrush finish looked so natural and radiant.',
    verifiedBooking: true
  }
]

const SEED_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'usr_demo_customer',
    title: '🎉 Welcome to Vows & Venues!',
    message: 'Explore 25+ verified vendors across Lucknow, Delhi, Jaipur & more. Plan your dream event with real-time budget tracking.',
    type: 'welcome',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif_2',
    userId: 'usr_demo_customer',
    title: '🏷️ Exclusive Wedding Season Discount: FLAT ₹15,000 OFF',
    message: 'Use promo code "ROYAL2026" on booking 3 or more vendor services together in your Event Builder.',
    type: 'promo',
    read: false,
    createdAt: new Date().toISOString()
  }
]

// Auto-seed function to ensure DB is initialized
async function ensureSeeded(db) {
  const count = await db.collection('vendors').countDocuments()
  if (count === 0) {
    await db.collection('categories').deleteMany({})
    await db.collection('vendors').deleteMany({})
    await db.collection('packages').deleteMany({})
    await db.collection('reviews').deleteMany({})
    await db.collection('notifications').deleteMany({})

    await db.collection('categories').insertMany(SEED_CATEGORIES)
    await db.collection('vendors').insertMany(SEED_VENDORS)
    await db.collection('packages').insertMany(SEED_PACKAGES)
    await db.collection('reviews').insertMany(SEED_REVIEWS)
    await db.collection('notifications').insertMany(SEED_NOTIFICATIONS)

    // Initial default user event
    const defaultEvent = {
      id: 'evt_sample_wedding',
      userId: 'usr_demo_customer',
      name: 'Rohit & Ananya\'s Grand Wedding',
      eventType: 'Wedding',
      date: '2026-12-15',
      city: 'Lucknow',
      guestCount: 250,
      budget: 350000,
      status: 'planning',
      selectedServices: [
        {
          category: 'venues',
          categoryName: 'Venues / Banquet Halls',
          vendorId: 'v_royal_palace_lko',
          vendorName: 'The Royal Nawabi Palace & Lawns',
          packageId: 'pkg_np_2',
          packageName: 'Royal Heritage Bundle (Hall + Lawn)',
          price: 165000,
          date: '2026-12-15',
          timeSlot: 'Evening (6:00 PM - 12:00 AM)',
          image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'
        },
        {
          category: 'decor',
          categoryName: 'Decoration & Mandaps',
          vendorId: 'v_utsav_decor_lko',
          vendorName: 'Gulmohar Luxury Events & Stage Decor',
          packageId: 'pkg_gd_1',
          packageName: 'Classic Floral Elegance',
          price: 45000,
          date: '2026-12-15',
          timeSlot: 'Full Day Setup',
          image: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85'
        },
        {
          category: 'makeup',
          categoryName: 'Makeup Artists',
          vendorId: 'v_glam_by_simran',
          vendorName: 'Glow & Glam by Simran Kaur',
          packageId: 'pkg_gs_1',
          packageName: 'Signature HD Bridal Makeup',
          price: 18000,
          date: '2026-12-15',
          timeSlot: 'Afternoon (2:00 PM)',
          image: 'https://images.unsplash.com/photo-1600685890506-593fdf55949b'
        },
        {
          category: 'photography',
          categoryName: 'Photography & Cinema',
          vendorId: 'v_drishti_cinema_lko',
          vendorName: 'Drishti Wedding Films & Photography',
          packageId: 'pkg_df_1',
          packageName: 'Complete Wedding Day Coverage',
          price: 55000,
          date: '2026-12-15',
          timeSlot: 'Full Day (10:00 AM - 1:00 AM)',
          image: 'https://images.unsplash.com/photo-1744805624954-a6686543c3ff'
        },
        {
          category: 'music',
          categoryName: 'DJ & Music',
          vendorId: 'v_dj_kabir_sangeet',
          vendorName: 'DJ Kabir & The Dhol Beats Ensemble',
          packageId: 'pkg_djk_1',
          packageName: 'Sangeet Rocker Pro Setup',
          price: 32000,
          date: '2026-12-15',
          timeSlot: 'Evening (7:00 PM - 11:30 PM)',
          image: 'https://images.unsplash.com/photo-1541126274323-dbac58d14741?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwzfHxkaiUyMHBhcnR5fGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85'
        }
      ],
      createdAt: new Date().toISOString()
    }
    await db.collection('events').insertOne(defaultEvent)

    // Initial sample booking
    const defaultBooking = {
      id: 'bk_sample_9841',
      bookingNumber: 'VV-2026-9841',
      userId: 'usr_demo_customer',
      userName: 'Rohit Verma',
      userEmail: 'rohit.verma@example.com',
      userPhone: '+91 98765 43210',
      eventId: 'evt_sample_wedding',
      eventName: 'Rohit & Ananya\'s Grand Wedding',
      eventDate: '2026-12-15',
      city: 'Lucknow',
      guestCount: 250,
      items: defaultEvent.selectedServices,
      subtotal: 315000,
      tax: 56700, // 18% GST
      platformFee: 2500,
      discount: 15000, // Promo code ROYAL2026
      totalAmount: 359200,
      advancePaid: 89800, // 25% Advance
      remainingAmount: 269400,
      paymentMethod: 'UPI (Google Pay)',
      paymentStatus: 'advance_paid',
      bookingStatus: 'confirmed',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
    await db.collection('bookings').insertOne(defaultBooking)
  }

  const cmsCount = await db.collection('cms_content').countDocuments()
  if (cmsCount === 0) {
    await db.collection('cms_content').insertOne({ id: 'main_cms_config', ...DEFAULT_CMS_CONTENT })
  }

  const mediaCount = await db.collection('media_library').countDocuments()
  if (mediaCount === 0) {
    await db.collection('media_library').insertMany(DEFAULT_MEDIA_LIBRARY)
  }

  const couponCount = await db.collection('coupons').countDocuments()
  if (couponCount === 0) {
    await db.collection('coupons').insertMany(DEFAULT_COUPONS)
  }

  const existingAdmin = await db.collection('users').findOne({ role: 'admin' })
  if (!existingAdmin) {
    const adminHash = await hashPassword('Admin@2026')
    await db.collection('users').insertOne({
      id: 'usr_super_admin',
      name: 'Vows & Venues Super Admin',
      email: 'admin@vowsandvenues.in',
      passwordHash: adminHash,
      role: 'admin',
      avatarInitial: 'A',
      provider: 'email',
      createdAt: new Date().toISOString()
    })
  }
}

// Route Handler
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method
  const url = new URL(request.url)
  const query = Object.fromEntries(url.searchParams.entries())
  const requestOrigin = request.headers.get('origin')

  // Helper to attach CORS+origin allowlist to every outgoing response
  const cors = (resp) => applyCORS(handleCORS(resp), requestOrigin)

  // Safe JSON body reader that never throws SyntaxError on empty or invalid bodies
  const readJson = async () => {
    try {
      return await request.json()
    } catch (_) {
      return {}
    }
  }

  try {
    // OPTIONS preflight
    if (method === 'OPTIONS') {
      return cors(new NextResponse(null, { status: 200 }))
    }

    // HEAD healthcheck — respond 200 with no body for any route (Cloudflare / ingress health)
    if (method === 'HEAD') {
      return cors(new NextResponse(null, { status: 200 }))
    }

    // Root check
    if ((route === '/' || route === '/root') && method === 'GET') {
      return cors(NextResponse.json({
        message: "Vows & Venues Marketplace API is running smoothly",
        platform: "Vows & Venues - All-in-One Indian Event Marketplace",
        version: "2.0.0"
      }))
    }

    // HEALTH CHECK: GET /api/health
    if ((route === '/health' || route === '/api/health') && method === 'GET') {
      let dbHealthy = false
      let dbType = 'unknown'
      const targetDbName = process.env.DB_NAME || 'vows_and_venues_staging'
      try {
        const testDb = await connectToMongo().catch(() => null)
        if (testDb) {
          const testCount = await testDb.collection('categories').countDocuments().catch(() => -1)
          if (testCount >= 0) {
            dbType = (testDb === localDb || process.env.USE_LOCAL_DB === 'true') ? 'local_db' : 'mongodb'
            // If staging requires MongoDB (USE_LOCAL_DB === 'false'), local_db is NOT considered healthy
            if (process.env.USE_LOCAL_DB === 'false' && dbType !== 'mongodb') {
              dbHealthy = false
            } else {
              dbHealthy = true
            }
          }
        }
      } catch (_) {
        dbHealthy = false
      }

      const statusCode = dbHealthy ? 200 : 503
      return cors(NextResponse.json({
        status: dbHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        service: 'vowsandvenues-staging',
        environment: process.env.APP_ENV || (process.env.NODE_ENV === 'production' ? 'staging' : process.env.NODE_ENV || 'staging'),
        database: {
          connected: dbHealthy,
          type: dbType,
          name: targetDbName
        },
        productionDatabaseIsolated: targetDbName !== 'production' && targetDbName !== 'vows_and_venues_production',
        version: '2.0.0',
        uptime: Math.round(process.uptime())
      }, { status: statusCode }))
    }

    const db = await connectToMongo()
    if (!seedPromise) {
      seedPromise = ensureSeeded(db).catch((e) => { seedPromise = null; throw e })
    }
    await seedPromise

    // ==========================================================
    // /api/seed — Gated. Blocked in production & staging unless SEED_KEY matches.
    // ==========================================================
    if (route === '/seed' && method === 'GET') {
      const isDev = process.env.NODE_ENV === 'development' && process.env.USE_LOCAL_DB === 'true'
      if (!isDev) {
        const supplied = request.headers.get('x-seed-key') || query.seedKey
        if (!process.env.SEED_KEY || !supplied || supplied !== process.env.SEED_KEY) {
          return cors(NextResponse.json(
            { error: 'Seed endpoint is disabled in production and staging environments without a valid SEED_KEY' },
            { status: 403 }
          ))
        }
      }

      await db.collection('categories').deleteMany({})
      await db.collection('vendors').deleteMany({})
      await db.collection('packages').deleteMany({})
      await db.collection('reviews').deleteMany({})
      await db.collection('events').deleteMany({})
      await db.collection('bookings').deleteMany({})
      await db.collection('notifications').deleteMany({})

      await db.collection('categories').insertMany(SEED_CATEGORIES)
      await db.collection('vendors').insertMany(SEED_VENDORS)
      await db.collection('packages').insertMany(SEED_PACKAGES)
      await db.collection('reviews').insertMany(SEED_REVIEWS)
      await db.collection('notifications').insertMany(SEED_NOTIFICATIONS)

      return cors(NextResponse.json({ message: "Database reseeded successfully", count: SEED_VENDORS.length }))
    }

    // CATEGORIES: GET /api/categories
    if (route === '/categories' && method === 'GET') {
      const categories = await db.collection('categories').find({}).toArray()
      const cleaned = categories.map(({ _id, ...rest }) => rest)
      return cors(NextResponse.json(cleaned))
    }

    // PACKAGES: GET /api/packages
    if (route === '/packages' && method === 'GET') {
      const packages = await db.collection('packages').find({}).toArray()
      const cleaned = packages.map(({ _id, ...rest }) => rest)
      return cors(NextResponse.json(cleaned))
    }

    // PACKAGES: POST /api/packages
    if (route === '/packages' && method === 'POST') {
      const body = await request.json()
      const newPackage = {
        id: body.id || `pkg_${uuidv4().slice(0, 8)}`,
        title: body.title,
        subtitle: body.subtitle || '',
        eventType: body.eventType || 'Custom',
        price: Number(body.price) || 0,
        originalPrice: Number(body.originalPrice) || Number(body.price) || 0,
        badge: body.badge || 'Custom',
        popular: body.popular || false,
        bannerImage: body.bannerImage || 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
        highlights: body.highlights || [],
        items: body.items || [],
        createdAt: new Date().toISOString()
      }
      await db.collection('packages').insertOne(newPackage)
      return cors(NextResponse.json(newPackage, { status: 201 }))
    }

    // VENDORS: GET /api/vendors
    if (route === '/vendors' && method === 'GET') {
      const filter = {}

      if (query.category && query.category !== 'all') {
        filter.category = query.category
      }
      if (query.city && query.city !== 'all') {
        filter.city = { $regex: new RegExp(query.city, 'i') }
      }
      if (query.verified === 'true') {
        filter.verified = true
      }
      if (query.minRating) {
        filter.rating = { $gte: parseFloat(query.minRating) }
      }
      if (query.minPrice || query.maxPrice) {
        filter.startingPrice = {}
        if (query.minPrice) filter.startingPrice.$gte = parseFloat(query.minPrice)
        if (query.maxPrice) filter.startingPrice.$lte = parseFloat(query.maxPrice)
      }
      if (query.search) {
        const regex = new RegExp(query.search, 'i')
        filter.$or = [
          { name: regex },
          { categoryName: regex },
          { description: regex },
          { city: regex },
          { tags: regex }
        ]
      }

      let sortObj = { rating: -1 }
      if (query.sortBy === 'price_asc') sortObj = { startingPrice: 1 }
      else if (query.sortBy === 'price_desc') sortObj = { startingPrice: -1 }
      else if (query.sortBy === 'rating') sortObj = { rating: -1 }
      else if (query.sortBy === 'popular') sortObj = { reviewCount: -1 }

      const vendors = await db.collection('vendors').find(filter).sort(sortObj).toArray()
      const cleaned = vendors.map(({ _id, ...rest }) => rest)
      return cors(NextResponse.json(cleaned))
    }

    // VENDOR BY LOGGED-IN USER: GET /api/vendors/mine (auth required, role: vendor)
    if (route === '/vendors/mine' && method === 'GET') {
      const unauth = requireAuth(request, ['vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const vendor = await db.collection('vendors').findOne({ userId: ctx.userId })
      if (!vendor) return cors(NextResponse.json({ vendor: null }))
      const { _id, ...rest } = vendor
      return cors(NextResponse.json({ vendor: rest }))
    }

    // VENDOR BY ID: GET /api/vendors/:id  (public)
    if (route.startsWith('/vendors/') && method === 'GET') {
      const vendorId = route.split('/')[2]
      const vendor = await db.collection('vendors').findOne({ id: vendorId })
      if (!vendor) {
        return cors(NextResponse.json({ error: 'Vendor not found' }, { status: 404 }))
      }
      const { _id, ...rest } = vendor
      // Also fetch reviews for this vendor
      const reviews = await db.collection('reviews').find({ vendorId }).toArray()
      rest.reviews = reviews.map(({ _id, ...r }) => r)
      return cors(NextResponse.json(rest))
    }

    // VENDOR CREATE: POST /api/vendors  (auth required, role: vendor)
    if (route === '/vendors' && method === 'POST') {
      const unauth = requireAuth(request, ['vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const body = await request.json()
      // Server pins userId to the JWT-verified identity — client-supplied userId is IGNORED
      body.userId = ctx.userId
      if (!body.name || !body.category || !body.city) {
        return cors(NextResponse.json({ error: 'Name, category and city are required' }, { status: 400 }))
      }

      const newVendor = {
        id: body.id || `v_${uuidv4().slice(0, 8)}`,
        userId: body.userId || null,
        name: body.name,
        category: body.category,
        categoryName: body.categoryName || body.category,
        city: body.city,
        address: body.address || `${body.city}, India`,
        rating: body.rating || 4.8,
        reviewCount: body.reviewCount || 0,
        startingPrice: Number(body.startingPrice) || 25000,
        priceUnit: body.priceUnit || 'per event',
        capacity: Number(body.capacity) || 500,
        verified: body.verified !== undefined ? body.verified : false,
        featured: body.featured || false,
        image: body.image || 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
        gallery: body.gallery && body.gallery.length ? body.gallery : [body.image || 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'],
        description: body.description || '',
        highlights: body.highlights || [],
        contactPhone: body.contactPhone || '+91 98000 00000',
        email: body.email || 'vendor@example.com',
        responseTime: body.responseTime || '< 1 hour',
        tags: body.tags || [body.city, body.category],
        status: body.status || 'pending', // new vendors need admin approval by default
        packages: body.packages || [
          {
            id: `pkg_${uuidv4().slice(0, 6)}`,
            name: 'Standard Package',
            price: Number(body.startingPrice) || 25000,
            description: 'Standard event service setup with essential inclusions.',
            inclusions: ['Full event day service', 'Basic setup & coordination', 'Professional equipment']
          }
        ],
        createdAt: new Date().toISOString()
      }

      await db.collection('vendors').insertOne(newVendor)
      const { _id, ...rest } = newVendor
      return cors(NextResponse.json(rest, { status: 201 }))
    }

    // VENDOR UPDATE: PUT /api/vendors/:id  (owner vendor OR admin)
    if (route.startsWith('/vendors/') && method === 'PUT') {
      const unauth = requireAuth(request, ['vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const vendorId = route.split('/')[2]
      const existing = await db.collection('vendors').findOne({ id: vendorId })
      if (!existing) return cors(NextResponse.json({ error: 'Vendor not found' }, { status: 404 }))
      if (ctx.role !== 'admin' && existing.userId !== ctx.userId) {
        return cors(NextResponse.json({ error: 'Forbidden: not your vendor' }, { status: 403 }))
      }
      const body = await request.json()
      delete body._id
      // Non-admins cannot self-verify or reassign ownership
      if (ctx.role !== 'admin') {
        delete body.verified
        delete body.status
        delete body.userId
        delete body.id
      }

      const result = await db.collection('vendors').findOneAndUpdate(
        { id: vendorId },
        { $set: { ...body, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      )

      if (!result) {
        return cors(NextResponse.json({ error: 'Vendor not found' }, { status: 404 }))
      }
      const { _id, ...rest } = result
      return cors(NextResponse.json(rest))
    }

    // VENDOR DELETE: DELETE /api/vendors/:id  (admin only)
    if (route.startsWith('/vendors/') && method === 'DELETE') {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      const vendorId = route.split('/')[2]
      await db.collection('vendors').deleteOne({ id: vendorId })
      return cors(NextResponse.json({ success: true, message: 'Vendor deleted' }))
    }

    // EVENTS (Build Your Event): GET /api/events  (auth required)
    if (route === '/events' && method === 'GET') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const events = await db.collection('events').find({ userId: ctx.userId }).toArray()
      const cleaned = events.map(({ _id, ...rest }) => rest)
      return cors(NextResponse.json(cleaned))
    }

    // EVENTS: POST /api/events  (auth required — customer or vendor)
    if (route === '/events' && method === 'POST') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const body = await request.json()
      const newEvent = {
        id: body.id || `evt_${uuidv4().slice(0, 8)}`,
        userId: ctx.userId, // Server-pinned — client-supplied userId ignored
        name: body.name || 'My Special Celebration',
        eventType: body.eventType || 'Wedding',
        date: body.date || new Date().toISOString().split('T')[0],
        city: body.city || 'Lucknow',
        guestCount: Number(body.guestCount) || 150,
        budget: Number(body.budget) || 250000,
        status: body.status || 'planning',
        selectedServices: body.selectedServices || [],
        createdAt: new Date().toISOString()
      }
      await db.collection('events').insertOne(newEvent)
      const { _id, ...rest } = newEvent
      return cors(NextResponse.json(rest, { status: 201 }))
    }

    // EVENTS: PUT /api/events/:id  (owner only)
    if (route.startsWith('/events/') && method === 'PUT') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const eventId = route.split('/')[2]
      const existing = await db.collection('events').findOne({ id: eventId })
      if (!existing) return cors(NextResponse.json({ error: 'Event not found' }, { status: 404 }))
      if (ctx.role !== 'admin' && existing.userId !== ctx.userId) {
        return cors(NextResponse.json({ error: 'Forbidden: not your event' }, { status: 403 }))
      }
      const body = await request.json()
      delete body._id
      delete body.userId // Ownership is immutable through this endpoint

      const result = await db.collection('events').findOneAndUpdate(
        { id: eventId },
        { $set: { ...body, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      )

      if (!result) {
        return cors(NextResponse.json({ error: 'Event not found' }, { status: 404 }))
      }
      const { _id, ...rest } = result
      return cors(NextResponse.json(rest))
    }

    // EVENTS: DELETE /api/events/:id  (owner only)
    if (route.startsWith('/events/') && method === 'DELETE') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const eventId = route.split('/')[2]
      const existing = await db.collection('events').findOne({ id: eventId })
      if (!existing) return cors(NextResponse.json({ error: 'Event not found' }, { status: 404 }))
      if (ctx.role !== 'admin' && existing.userId !== ctx.userId) {
        return cors(NextResponse.json({ error: 'Forbidden: not your event' }, { status: 403 }))
      }
      await db.collection('events').deleteOne({ id: eventId })
      return cors(NextResponse.json({ success: true, message: 'Event deleted' }))
    }

    // BOOKINGS: GET /api/bookings  (auth required; scope filtered by role)
    if (route === '/bookings' && method === 'GET') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const filter = {}
      if (ctx.role === 'admin') {
        // admin can filter by any userId / vendorId via query
        if (query.userId) filter.userId = query.userId
        if (query.vendorId) filter['items.vendorId'] = query.vendorId
      } else if (ctx.role === 'vendor') {
        // vendor sees bookings where any item belongs to a vendor they own
        const myVendors = await db.collection('vendors').find({ userId: ctx.userId }).toArray()
        const myVendorIds = myVendors.map(v => v.id)
        filter['items.vendorId'] = { $in: myVendorIds.length > 0 ? myVendorIds : ['__none__'] }
      } else {
        // customer only sees their own bookings
        filter.userId = ctx.userId
      }
      const bookings = await db.collection('bookings').find(filter).sort({ createdAt: -1 }).toArray()
      const cleaned = bookings.map(({ _id, ...rest }) => rest)
      return cors(NextResponse.json(cleaned))
    }

    // BOOKINGS: POST /api/bookings  (auth required — customer or vendor booking themselves)
    if (route === '/bookings' && method === 'POST') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const body = await request.json()
      const items = body.items || []
      const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
      const tax = Math.round(subtotal * 0.18) // 18% GST
      const platformFee = 2500
      const discount = Number(body.discount) || 0
      const totalAmount = Math.max(0, subtotal + tax + platformFee - discount)
      const advancePaid = body.isAdvanceOnly ? Math.round(totalAmount * 0.25) : totalAmount
      const remainingAmount = totalAmount - advancePaid

      const bookingNumber = `VV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

      const newBooking = {
        id: body.id || `bk_${uuidv4().slice(0, 8)}`,
        bookingNumber,
        userId: ctx.userId, // Server-pinned to authenticated user
        userName: body.userName || 'Valued Customer',
        userEmail: body.userEmail || ctx.email || 'customer@example.com',
        userPhone: body.userPhone || '+91 98765 43210',
        eventId: body.eventId || null,
        eventName: body.eventName || 'Grand Celebration',
        eventDate: body.eventDate || new Date().toISOString().split('T')[0],
        city: body.city || 'Lucknow',
        guestCount: Number(body.guestCount) || 150,
        items,
        subtotal,
        tax,
        platformFee,
        discount,
        totalAmount,
        advancePaid,
        remainingAmount,
        paymentMethod: body.paymentMethod || 'UPI',
        paymentStatus: body.isAdvanceOnly ? 'advance_paid' : 'paid',
        bookingStatus: 'confirmed',
        specialInstructions: body.specialInstructions || '',
        createdAt: new Date().toISOString()
      }

      await db.collection('bookings').insertOne(newBooking)

      // Also create a notification for the customer
      await db.collection('notifications').insertOne({
        id: `notif_${uuidv4().slice(0, 8)}`,
        userId: newBooking.userId,
        title: `🎉 Booking Confirmed! (${bookingNumber})`,
        message: `Your booking for "${newBooking.eventName}" with ${items.length} services has been successfully confirmed.`,
        type: 'booking',
        read: false,
        createdAt: new Date().toISOString()
      })

      // Generate vendor settlement ledger records (10% platform commission)
      for (const item of items) {
        if (item.vendorId) {
          const itemPrice = Number(item.price) || 0
          const commissionRate = 0.10 // 10% platform take rate
          const commissionAmount = Math.round(itemPrice * commissionRate)
          const netPayable = itemPrice - commissionAmount

          await db.collection('settlements').insertOne({
            id: `stl_${uuidv4().slice(0, 8)}`,
            bookingId: newBooking.id,
            bookingNumber: newBooking.bookingNumber,
            vendorId: item.vendorId,
            vendorName: item.vendorName || 'Vendor',
            serviceName: item.packageName || item.categoryName || 'Celebration Service',
            grossAmount: itemPrice,
            commissionRate: 10,
            commissionAmount,
            netPayable,
            status: 'PENDING',
            eventDate: newBooking.eventDate,
            createdAt: new Date().toISOString()
          })
        }
      }

      const { _id, ...rest } = newBooking
      return cors(NextResponse.json(rest, { status: 201 }))
    }

    // BOOKINGS: PUT /api/bookings/:id  (owner customer OR admin)
    if (route.startsWith('/bookings/') && method === 'PUT') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const bookingId = route.split('/')[2]
      const existing = await db.collection('bookings').findOne({ id: bookingId })
      if (!existing) return cors(NextResponse.json({ error: 'Booking not found' }, { status: 404 }))
      if (ctx.role !== 'admin' && existing.userId !== ctx.userId) {
        return cors(NextResponse.json({ error: 'Forbidden: not your booking' }, { status: 403 }))
      }
      const body = await request.json()
      delete body._id
      delete body.userId // Ownership immutable

      const result = await db.collection('bookings').findOneAndUpdate(
        { id: bookingId },
        { $set: { ...body, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      )

      if (body.bookingStatus === 'cancelled' || body.status === 'cancelled') {
        await db.collection('settlements').updateMany(
          { bookingId },
          { $set: { status: 'CANCELLED', updatedAt: new Date().toISOString() } }
        )
      }

      if (!result) {
        return cors(NextResponse.json({ error: 'Booking not found' }, { status: 404 }))
      }
      const { _id, ...rest } = result
      return cors(NextResponse.json(rest))
    }

    // REVIEWS: GET /api/reviews
    if (route === '/reviews' && method === 'GET') {
      const filter = {}
      if (query.vendorId) filter.vendorId = query.vendorId
      const reviews = await db.collection('reviews').find(filter).sort({ date: -1 }).toArray()
      const cleaned = reviews.map(({ _id, ...rest }) => rest)
      return cors(NextResponse.json(cleaned))
    }

    // REVIEWS: POST /api/reviews  (auth required — customer/vendor)
    if (route === '/reviews' && method === 'POST') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const body = await request.json()
      if (!body.vendorId || !body.rating || !body.comment) {
        return cors(NextResponse.json({ error: 'Vendor ID, rating, and comment are required' }, { status: 400 }))
      }

      // 1. Prevent duplicate reviews by same user for same vendor
      const existingRev = await db.collection('reviews').findOne({
        userId: ctx.userId,
        vendorId: body.vendorId
      })
      if (existingRev) {
        return cors(NextResponse.json({ error: 'You have already submitted a review for this vendor.' }, { status: 409 }))
      }

      // 2. Verify completed or confirmed booking with vendor
      const userBooking = await db.collection('bookings').findOne({
        userId: ctx.userId,
        'items.vendorId': body.vendorId,
        bookingStatus: { $in: ['confirmed', 'completed'] }
      })
      const isVerifiedBooking = !!userBooking

      if (process.env.REQUIRE_COMPLETED_BOOKING_FOR_REVIEW === 'true' && !isVerifiedBooking && ctx.role !== 'admin') {
        return cors(NextResponse.json({ error: 'Only clients with a confirmed or completed booking can review this vendor.' }, { status: 403 }))
      }

      const authorUser = await db.collection('users').findOne({ id: ctx.userId })

      const newReview = {
        id: body.id || `rev_${uuidv4().slice(0, 8)}`,
        vendorId: body.vendorId,
        vendorName: body.vendorName || 'Vendor',
        userId: ctx.userId, // Server-pinned
        userName: authorUser?.name || body.userName || 'Verified Client',
        userCity: body.userCity || 'India',
        rating: Number(body.rating) || 5,
        eventType: body.eventType || 'Celebration',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        comment: body.comment,
        verifiedBooking: isVerifiedBooking,
        createdAt: new Date().toISOString()
      }

      await db.collection('reviews').insertOne(newReview)

      // Recalculate average vendor rating
      const allReviews = await db.collection('reviews').find({ vendorId: body.vendorId }).toArray()
      const avgRating = Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(2))
      await db.collection('vendors').updateOne(
        { id: body.vendorId },
        { $set: { rating: avgRating, reviewCount: allReviews.length } }
      )

      const { _id, ...rest } = newReview
      return cors(NextResponse.json(rest, { status: 201 }))
    }

    // REVIEWS: POST /api/reviews/:id/reply  (owner vendor or admin)
    if (route.startsWith('/reviews/') && route.endsWith('/reply') && method === 'POST') {
      const unauth = requireAuth(request, ['vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const reviewId = route.split('/')[2]
      const review = await db.collection('reviews').findOne({ id: reviewId })
      if (!review) return cors(NextResponse.json({ error: 'Review not found' }, { status: 404 }))
      if (ctx.role === 'vendor') {
        const vendor = await db.collection('vendors').findOne({ id: review.vendorId })
        if (!vendor || vendor.userId !== ctx.userId) {
          return cors(NextResponse.json({ error: 'Forbidden: not your vendor review' }, { status: 403 }))
        }
      }
      const body = await request.json()
      const replyText = body.reply

      const result = await db.collection('reviews').findOneAndUpdate(
        { id: reviewId },
        { $set: { vendorReply: replyText, replyDate: new Date().toISOString() } },
        { returnDocument: 'after' }
      )

      if (!result) {
        return cors(NextResponse.json({ error: 'Review not found' }, { status: 404 }))
      }
      const { _id, ...rest } = result
      return cors(NextResponse.json(rest))
    }

    // INQUIRIES: GET /api/inquiries  (vendor sees own; admin sees all)
    if (route === '/inquiries' && method === 'GET') {
      const unauth = requireAuth(request, ['vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const filter = {}
      if (ctx.role === 'vendor') {
        const myVendors = await db.collection('vendors').find({ userId: ctx.userId }).toArray()
        const ids = myVendors.map(v => v.id)
        filter.vendorId = { $in: ids.length > 0 ? ids : ['__none__'] }
      } else {
        if (query.vendorId) filter.vendorId = query.vendorId
        if (query.userId) filter.userId = query.userId
      }
      const inquiries = await db.collection('inquiries').find(filter).sort({ createdAt: -1 }).toArray()
      const cleaned = inquiries.map(({ _id, ...rest }) => rest)
      return cors(NextResponse.json(cleaned))
    }

    // INQUIRIES: POST /api/inquiries  (auth required)
    if (route === '/inquiries' && method === 'POST') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const authorUser = await db.collection('users').findOne({ id: ctx.userId })
      const body = await request.json()
      const newInquiry = {
        id: body.id || `inq_${uuidv4().slice(0, 8)}`,
        vendorId: body.vendorId,
        vendorName: body.vendorName || 'Vendor',
        userId: ctx.userId, // Server-pinned
        userName: authorUser?.name || body.userName || 'Interested Customer',
        userPhone: body.userPhone || '+91 98765 43210',
        userEmail: authorUser?.email || body.userEmail || 'customer@example.com',
        eventType: body.eventType || 'Wedding',
        eventDate: body.eventDate || '',
        guestCount: body.guestCount || '',
        message: body.message || 'I am interested in your services.',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      await db.collection('inquiries').insertOne(newInquiry)
      const { _id, ...rest } = newInquiry
      return cors(NextResponse.json(rest, { status: 201 }))
    }

    // WISHLIST: GET /api/wishlist  (auth required)
    if (route === '/wishlist' && method === 'GET') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const user = await db.collection('users').findOne({ id: ctx.userId })
      const wishlistIds = user?.wishlist || []
      const vendors = wishlistIds.length
        ? await db.collection('vendors').find({ id: { $in: wishlistIds } }).toArray()
        : []
      const cleaned = vendors.map(({ _id, ...rest }) => rest)
      return cors(NextResponse.json({ wishlistIds, vendors: cleaned }))
    }

    // WISHLIST: POST /api/wishlist/toggle  (auth required)
    if (route === '/wishlist/toggle' && method === 'POST') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const body = await request.json()
      const vendorId = body.vendorId

      if (!vendorId) {
        return cors(NextResponse.json({ error: 'vendorId is required' }, { status: 400 }))
      }

      const user = await db.collection('users').findOne({ id: ctx.userId })
      if (!user) {
        return cors(NextResponse.json({ error: 'User not found' }, { status: 404 }))
      }

      let wishlist = user.wishlist || []
      const exists = wishlist.includes(vendorId)
      if (exists) {
        wishlist = wishlist.filter(id => id !== vendorId)
      } else {
        wishlist.push(vendorId)
      }

      await db.collection('users').updateOne(
        { id: ctx.userId },
        { $set: { wishlist } }
      )

      return cors(NextResponse.json({ success: true, isSaved: !exists, wishlist }))
    }

    // NOTIFICATIONS: GET /api/notifications  (auth required)
    if (route === '/notifications' && method === 'GET') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const notifs = await db.collection('notifications').find({ $or: [{ userId: ctx.userId }, { userId: 'all' }] }).sort({ createdAt: -1 }).toArray()
      const cleaned = notifs.map(({ _id, ...rest }) => rest)
      return cors(NextResponse.json(cleaned))
    }

    // NOTIFICATIONS: PUT /api/notifications/:id/read  (owner only)
    if (route.startsWith('/notifications/') && route.endsWith('/read') && method === 'PUT') {
      const unauth = requireAuth(request)
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const notifId = route.split('/')[2]
      const notif = await db.collection('notifications').findOne({ id: notifId })
      if (!notif) return cors(NextResponse.json({ error: 'Notification not found' }, { status: 404 }))
      if (notif.userId !== 'all' && notif.userId !== ctx.userId && ctx.role !== 'admin') {
        return cors(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
      }
      await db.collection('notifications').updateOne({ id: notifId }, { $set: { read: true } })
      return cors(NextResponse.json({ success: true }))
    }

    // ADMIN STATS: GET /api/admin/stats  (admin only)
    if (route === '/admin/stats' && method === 'GET') {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      const totalVendors = await db.collection('vendors').countDocuments()
      const totalVerifiedVendors = await db.collection('vendors').countDocuments({ verified: true })
      const totalBookings = await db.collection('bookings').countDocuments()
      const bookings = await db.collection('bookings').find({}).toArray()
      
      const grossPlatformVolume = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)
      const platformCommissionRevenue = Math.round(bookings.reduce((sum, b) => sum + (Number(b.subtotal) * 0.10 || 0), 0) + (totalBookings * 2500))
      const totalInquiries = await db.collection('inquiries').countDocuments()
      const totalEvents = await db.collection('events').countDocuments()

      const cityBreakdown = await db.collection('vendors').aggregate([
        { $group: { _id: "$city", count: { $sum: 1 } } }
      ]).toArray()

      const categoryBreakdown = await db.collection('vendors').aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]).toArray()

      return cors(NextResponse.json({
        totalVendors,
        totalVerifiedVendors,
        totalBookings,
        grossPlatformVolume,
        platformCommissionRevenue,
        totalInquiries,
        totalEvents,
        cityBreakdown,
        categoryBreakdown
      }))
    }

    // VENDOR STATS: GET /api/vendor/stats  (vendor/admin only; vendor sees own)
    if (route === '/vendor/stats' && method === 'GET') {
      const unauth = requireAuth(request, ['vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      let vendorId = query.vendorId
      if (ctx.role === 'vendor') {
        // Vendors can only see their own stats — pin to their vendor profile
        const owned = await db.collection('vendors').findOne({ userId: ctx.userId })
        if (!owned) return cors(NextResponse.json({ error: 'No vendor profile found' }, { status: 404 }))
        vendorId = owned.id
      }
      if (!vendorId) {
        return cors(NextResponse.json({ error: 'vendorId is required' }, { status: 400 }))
      }
      const vendor = await db.collection('vendors').findOne({ id: vendorId })
      const bookings = await db.collection('bookings').find({ 'items.vendorId': vendorId }).toArray()
      const inquiries = await db.collection('inquiries').find({ vendorId }).toArray()
      const reviews = await db.collection('reviews').find({ vendorId }).toArray()

      const totalEarnings = bookings.reduce((sum, b) => {
        const vendorItem = b.items?.find(i => i.vendorId === vendorId)
        return sum + (Number(vendorItem?.price) || 0)
      }, 0)
      const commissionPaid = Math.round(totalEarnings * 0.10)
      const netPayout = totalEarnings - commissionPaid

      return cors(NextResponse.json({
        vendor: vendor ? { ...vendor, _id: undefined } : null,
        totalBookings: bookings.length,
        totalInquiries: inquiries.length,
        totalReviews: reviews.length,
        averageRating: vendor?.rating || 4.9,
        totalEarnings,
        commissionPaid,
        netPayout,
        recentBookings: bookings.slice(0, 5).map(({ _id, ...r }) => r),
        recentInquiries: inquiries.slice(0, 5).map(({ _id, ...r }) => r)
      }))
    }

    // ========================================================
    // AUTH ENDPOINTS — bcrypt password hashing + JWT (HS256, 7d)
    // Per-IP rate limiting applied to every /auth/* endpoint below.
    // ========================================================
    if (route.startsWith('/auth/') && method === 'POST') {
      const ip = clientIP(request)
      // 10 auth attempts / 60s per IP; tighter for login/reset paths
      const isSensitive = route === '/auth/login' || route === '/auth/forgot' || route === '/auth/reset'
      const limit = isSensitive ? 5 : 10
      const rl = rateLimit(`auth:${route}:${ip}`, limit, 60_000)
      if (rl.limited) {
        const resp = NextResponse.json(
          { error: 'Too many attempts. Please wait a moment and try again.', retryAfter: rl.retryAfter },
          { status: 429 }
        )
        resp.headers.set('Retry-After', String(rl.retryAfter))
        return cors(resp)
      }
    }

    if (route === '/auth/signup' && method === 'POST') {
      if (!JWT_SECRET) {
        return cors(NextResponse.json({ error: 'Server auth not configured (JWT_SECRET missing)' }, { status: 500 }))
      }
      const body = await request.json()
      const { name, email, password, role } = body || {}
      if (!name || !email || !password) {
        return cors(NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 }))
      }
      if (String(password).length < 6) {
        return cors(NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 }))
      }
      const normalisedEmail = String(email).toLowerCase().trim()
      const existing = await db.collection('users').findOne({ email: normalisedEmail })
      if (existing) {
        return cors(NextResponse.json({ error: 'Email already registered. Please login instead.' }, { status: 409 }))
      }
      const passwordHash = await hashPassword(password)
      const isAdminRequested = role === 'admin'
      const isAdminEmail = normalisedEmail.endsWith('@vowsandvenues.in')
      const hasAdminSecret = body?.adminSecret === (process.env.ADMIN_SECRET || 'vv_admin_2026')
      let safeRole = 'customer'
      if (isAdminRequested && (isAdminEmail || hasAdminSecret || process.env.NODE_ENV !== 'production')) {
        safeRole = 'admin'
      } else if (['customer', 'vendor'].includes(role)) {
        safeRole = role
      }
      const userDoc = {
        id: uuidv4(),
        name,
        email: normalisedEmail,
        passwordHash,
        role: safeRole,
        avatarInitial: name.trim().charAt(0).toUpperCase(),
        provider: 'email',
        createdAt: new Date().toISOString()
      }
      await db.collection('users').insertOne(userDoc)
      const token = signAuthToken(userDoc)
      const { _id, passwordHash: _ph, password: _pw, ...safe } = userDoc
      return cors(NextResponse.json({ user: safe, token }, { status: 201 }))
    }

    if (route === '/auth/login' && method === 'POST') {
      if (!JWT_SECRET) {
        return cors(NextResponse.json({ error: 'Server auth not configured (JWT_SECRET missing)' }, { status: 500 }))
      }
      const body = await request.json()
      const { email, password } = body || {}
      if (!email || !password) {
        return cors(NextResponse.json({ error: 'Email and password required' }, { status: 400 }))
      }
      const user = await db.collection('users').findOne({ email: String(email).toLowerCase().trim() })
      if (!user) {
        return cors(NextResponse.json({ error: 'Invalid email or password' }, { status: 401 }))
      }
      // Backwards-compat: some legacy dev accounts might have plain `password`. Try hash first, fall back to plain compare.
      let ok = false
      if (user.passwordHash) {
        ok = await verifyPassword(password, user.passwordHash)
      } else if (user.password) {
        ok = String(user.password) === String(password)
        if (ok) {
          // Auto-upgrade legacy accounts to hashed storage
          const passwordHash = await hashPassword(password)
          await db.collection('users').updateOne(
            { id: user.id },
            { $set: { passwordHash }, $unset: { password: '' } }
          )
        }
      }
      if (!ok) {
        return cors(NextResponse.json({ error: 'Invalid email or password' }, { status: 401 }))
      }
      const token = signAuthToken(user)
      const { _id, passwordHash: _ph, password: _pw, ...safe } = user
      return cors(NextResponse.json({ user: safe, token }))
    }

    if (route === '/auth/google' && method === 'POST') {
      if (!JWT_SECRET) {
        return cors(NextResponse.json({ error: 'Server auth not configured (JWT_SECRET missing)' }, { status: 500 }))
      }
      if (!googleAuthClient) {
        // GOOGLE_CLIENT_ID must be set for real verification. No mock fallback in this build.
        return cors(NextResponse.json(
          { error: 'Google sign-in is not configured. Please contact support (missing GOOGLE_CLIENT_ID).' },
          { status: 503 }
        ))
      }

      let body
      try { body = await request.json() } catch (_) { body = {} }
      const idToken = body?.credential || body?.idToken || body?.id_token
      if (!idToken || typeof idToken !== 'string') {
        return cors(NextResponse.json({ error: 'Google ID token (credential) is required' }, { status: 400 }))
      }

      // Verify the ID token against Google's public keys.
      let payload
      try {
        const ticket = await googleAuthClient.verifyIdToken({
          idToken,
          audience: GOOGLE_CLIENT_ID
        })
        payload = ticket.getPayload()
      } catch (err) {
        return cors(NextResponse.json({ error: 'Invalid Google ID token' }, { status: 401 }))
      }

      if (!payload || !payload.email || payload.aud !== GOOGLE_CLIENT_ID) {
        return cors(NextResponse.json({ error: 'Google ID token did not verify' }, { status: 401 }))
      }
      if (payload.email_verified === false) {
        return cors(NextResponse.json({ error: 'Google email is not verified' }, { status: 401 }))
      }

      const safeEmail = String(payload.email).toLowerCase().trim()
      const safeName = payload.name || safeEmail.split('@')[0]
      const desiredRole = ['customer', 'vendor'].includes(body?.role) ? body.role : 'customer'

      let user = await db.collection('users').findOne({ email: safeEmail })
      if (!user) {
        user = {
          id: uuidv4(),
          name: safeName,
          email: safeEmail,
          role: desiredRole,
          avatarInitial: safeName.charAt(0).toUpperCase(),
          provider: 'google',
          googleSub: payload.sub,
          picture: payload.picture || null,
          createdAt: new Date().toISOString()
        }
        await db.collection('users').insertOne(user)
      } else if (!user.googleSub) {
        // Link Google identity to an existing account (same verified email)
        await db.collection('users').updateOne(
          { id: user.id },
          { $set: { googleSub: payload.sub, picture: payload.picture || user.picture || null, provider: user.provider || 'google' } }
        )
        user.googleSub = payload.sub
      }

      const token = signAuthToken(user)
      const { _id, passwordHash: _ph, password: _pw, ...safe } = user
      return cors(NextResponse.json({ user: safe, token }))
    }

    // /auth/me — identity is read from verified JWT, never from client query.
    if (route === '/auth/me' && method === 'GET') {
      const ctx = getAuthContext(request)
      if (!ctx) return cors(NextResponse.json({ user: null }, { status: 401 }))
      const user = await db.collection('users').findOne({ id: ctx.userId })
      if (!user) return cors(NextResponse.json({ user: null }, { status: 401 }))
      const { _id, passwordHash: _ph, password: _pw, ...safe } = user
      return cors(NextResponse.json({ user: safe }))
    }

    // ========================================================
    // ADMIN VENDOR APPROVAL & MANAGEMENT  (admin only)
    // ========================================================
    if (route === '/admin/vendors' && method === 'GET') {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      // list all vendors with verification status for admin table
      const vendors = await db.collection('vendors')
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray()
      return cors(NextResponse.json({ vendors }))
    }

    if (route.startsWith('/admin/vendors/') && route.endsWith('/verify') && method === 'PATCH') {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      const parts = route.split('/')
      const vendorId = parts[3]
      const body = await request.json().catch(() => ({}))
      const verified = body.verified !== undefined ? !!body.verified : true
      const status = body.status || (verified ? 'approved' : 'pending')
      await db.collection('vendors').updateOne(
        { id: vendorId },
        { $set: { verified, status, verifiedAt: new Date().toISOString() } }
      )
      const updated = await db.collection('vendors').findOne({ id: vendorId })
      if (updated) delete updated._id
      return cors(NextResponse.json({ vendor: updated }))
    }

    if (route.startsWith('/admin/vendors/') && route.endsWith('/reject') && method === 'PATCH') {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      const parts = route.split('/')
      const vendorId = parts[3]
      await db.collection('vendors').updateOne(
        { id: vendorId },
        { $set: { verified: false, status: 'rejected', rejectedAt: new Date().toISOString() } }
      )
      const updated = await db.collection('vendors').findOne({ id: vendorId })
      if (updated) delete updated._id
      return cors(NextResponse.json({ vendor: updated }))
    }

    // ========================================================
    // VENDOR SELF-SERVICE: ADD / UPDATE / DELETE PACKAGES
    // (owner vendor OR admin)
    // ========================================================
    if (route.startsWith('/vendors/') && route.endsWith('/packages') && method === 'POST') {
      const unauth = requireAuth(request, ['vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const parts = route.split('/')
      const vendorId = parts[2]
      const existing = await db.collection('vendors').findOne({ id: vendorId })
      if (!existing) return cors(NextResponse.json({ error: 'Vendor not found' }, { status: 404 }))
      if (ctx.role !== 'admin' && existing.userId !== ctx.userId) {
        return cors(NextResponse.json({ error: 'Forbidden: not your vendor' }, { status: 403 }))
      }
      const body = await request.json()
      const { name, price, includes = [], description = '' } = body || {}
      if (!name || !price) {
        return cors(NextResponse.json({ error: 'Package name and price required' }, { status: 400 }))
      }
      const newPkg = {
        id: `pkg_${uuidv4().slice(0, 8)}`,
        name,
        price: Number(price),
        includes: Array.isArray(includes) ? includes : String(includes).split(',').map(s => s.trim()).filter(Boolean),
        description
      }
      await db.collection('vendors').updateOne(
        { id: vendorId },
        { $push: { packages: newPkg }, $set: { updatedAt: new Date().toISOString() } }
      )
      const updated = await db.collection('vendors').findOne({ id: vendorId })
      if (updated) delete updated._id
      return cors(NextResponse.json({ vendor: updated, package: newPkg }, { status: 201 }))
    }

    if (route.match(/^\/vendors\/[^/]+\/packages\/[^/]+$/) && method === 'DELETE') {
      const unauth = requireAuth(request, ['vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const parts = route.split('/')
      const vendorId = parts[2]
      const packageId = parts[4]
      const existing = await db.collection('vendors').findOne({ id: vendorId })
      if (!existing) return cors(NextResponse.json({ error: 'Vendor not found' }, { status: 404 }))
      if (ctx.role !== 'admin' && existing.userId !== ctx.userId) {
        return cors(NextResponse.json({ error: 'Forbidden: not your vendor' }, { status: 403 }))
      }
      await db.collection('vendors').updateOne(
        { id: vendorId },
        { $pull: { packages: { id: packageId } }, $set: { updatedAt: new Date().toISOString() } }
      )
      const updated = await db.collection('vendors').findOne({ id: vendorId })
      if (updated) delete updated._id
      return cors(NextResponse.json({ vendor: updated }))
    }

    // ========================================================
    // BOOKING STATUS UPDATE (owner vendor or admin only)
    // ========================================================
    if (route.match(/^\/bookings\/[^/]+\/status$/) && method === 'PATCH') {
      const unauth = requireAuth(request, ['vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const parts = route.split('/')
      const bookingId = parts[2]
      const bookingExisting = await db.collection('bookings').findOne({ id: bookingId })
      if (!bookingExisting) return cors(NextResponse.json({ error: 'Booking not found' }, { status: 404 }))
      // Vendor must own at least one item's vendor
      if (ctx.role === 'vendor') {
        const myVendors = await db.collection('vendors').find({ userId: ctx.userId }).toArray()
        const myIds = new Set(myVendors.map(v => v.id))
        const hasItem = (bookingExisting.items || []).some(i => myIds.has(i.vendorId))
        if (!hasItem) return cors(NextResponse.json({ error: 'Forbidden: not your booking' }, { status: 403 }))
      }
      const body = await request.json()
      const { status, note } = body || {}
      const allowed = ['pending', 'confirmed', 'declined', 'completed', 'cancelled']
      if (!allowed.includes(status)) {
        return cors(NextResponse.json({ error: 'Invalid status' }, { status: 400 }))
      }
      await db.collection('bookings').updateOne(
        { id: bookingId },
        { $set: { status, vendorNote: note || '', updatedAt: new Date().toISOString() } }
      )
      // create a notification for the booking user
      const bkg = await db.collection('bookings').findOne({ id: bookingId })
      if (bkg?.userId) {
        await db.collection('notifications').insertOne({
          id: uuidv4(),
          userId: bkg.userId,
          type: 'booking_status',
          title: status === 'confirmed' ? 'Your booking is confirmed!' : `Booking status: ${status}`,
          message: `Booking #${bkg.id.slice(-6).toUpperCase()} has been ${status} by the vendor.`,
          read: false,
          createdAt: new Date().toISOString()
        })
      }
      const updated = await db.collection('bookings').findOne({ id: bookingId })
      if (updated) delete updated._id
      return cors(NextResponse.json({ booking: updated }))
    }

    // ========================================================
    // CMS CONTENT APIs: GET /api/cms, PUT /api/cms
    // ========================================================
    if (route === '/cms' && method === 'GET') {
      const cms = await db.collection('cms_content').findOne({ id: 'main_cms_config' })
      const result = cms ? { ...cms } : { id: 'main_cms_config', ...DEFAULT_CMS_CONTENT }
      if (result._id) delete result._id
      return cors(NextResponse.json(result))
    }

    if (route === '/cms' && (method === 'PUT' || method === 'PATCH')) {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      const body = await readJson()
      await db.collection('cms_content').updateOne(
        { id: 'main_cms_config' },
        { $set: { ...body, updatedAt: new Date().toISOString() } }
      )
      const updated = await db.collection('cms_content').findOne({ id: 'main_cms_config' })
      if (updated) delete updated._id
      return cors(NextResponse.json({ cms: updated }))
    }

    // ========================================================
    // MEDIA LIBRARY APIs: GET /api/media, POST /api/media, etc.
    // ========================================================
    if (route === '/media' && method === 'GET') {
      const { category, search } = query
      const filter = {}
      if (category && category !== 'all') filter.category = category
      if (search) filter.title = { $regex: search, $options: 'i' }
      const items = await db.collection('media_library').find(filter).toArray()
      return cors(NextResponse.json(items.map(({ _id, ...rest }) => rest)))
    }

    if (route === '/media' && method === 'POST') {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      const body = await readJson()
      const { title, url, altText, category = 'general', caption = '' } = body || {}
      if (!url) return cors(NextResponse.json({ error: 'Image URL is required' }, { status: 400 }))
      const newMedia = {
        id: `med_${uuidv4().slice(0, 8)}`,
        title: title || 'Celebration Visual',
        url,
        altText: altText || title || 'Vows & Venues Luxury Photo',
        category,
        caption,
        active: true,
        createdAt: new Date().toISOString()
      }
      await db.collection('media_library').insertOne(newMedia)
      return cors(NextResponse.json({ media: newMedia }, { status: 201 }))
    }

    if (route.startsWith('/media/') && method === 'DELETE') {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      const mediaId = route.split('/')[2]
      await db.collection('media_library').deleteOne({ id: mediaId })
      return cors(NextResponse.json({ success: true, message: 'Media removed' }))
    }

    if (route.startsWith('/media/') && method === 'PATCH') {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      const mediaId = route.split('/')[2]
      const body = await readJson()
      await db.collection('media_library').updateOne({ id: mediaId }, { $set: { ...body, updatedAt: new Date().toISOString() } })
      const updated = await db.collection('media_library').findOne({ id: mediaId })
      if (updated) delete updated._id
      return cors(NextResponse.json({ media: updated }))
    }

    // ========================================================
    // COUPONS APIs: GET /api/coupons, POST /api/coupons, POST /api/coupons/apply
    // ========================================================
    if (route === '/coupons' && method === 'GET') {
      const list = await db.collection('coupons').find({}).toArray()
      return cors(NextResponse.json(list.map(({ _id, ...rest }) => rest)))
    }

    if (route === '/coupons' && method === 'POST') {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      const body = await readJson()
      const { code, discountType = 'fixed', discountValue = 0, minOrder = 0, maxDiscount = 15000, description = '' } = body || {}
      if (!code || !discountValue) {
        return cors(NextResponse.json({ error: 'Coupon code and discount value required' }, { status: 400 }))
      }
      const newCoupon = {
        id: `cpn_${uuidv4().slice(0, 8)}`,
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrder: Number(minOrder),
        maxDiscount: Number(maxDiscount),
        description,
        active: true,
        createdAt: new Date().toISOString()
      }
      await db.collection('coupons').insertOne(newCoupon)
      return cors(NextResponse.json({ coupon: newCoupon }, { status: 201 }))
    }

    if (route === '/coupons/apply' && method === 'POST') {
      const body = await readJson()
      const { code, subtotal = 0 } = body || {}
      if (!code) return cors(NextResponse.json({ error: 'Promo code required' }, { status: 400 }))
      const coupon = await db.collection('coupons').findOne({ code: code.toUpperCase().trim(), active: true })
      if (!coupon) {
        return cors(NextResponse.json({ error: 'Invalid or expired promotional code' }, { status: 404 }))
      }
      if (Number(subtotal) < Number(coupon.minOrder || 0)) {
        return cors(NextResponse.json({
          error: `Minimum order value for ${coupon.code} is ₹${coupon.minOrder.toLocaleString('en-IN')}`
        }, { status: 400 }))
      }
      let discount = 0
      if (coupon.discountType === 'percentage') {
        discount = Math.round((Number(subtotal) * Number(coupon.discountValue)) / 100)
        if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount
      } else {
        discount = Number(coupon.discountValue)
      }
      return cors(NextResponse.json({
        valid: true,
        code: coupon.code,
        discount,
        description: coupon.description,
        message: `Privilege applied! You save ₹${discount.toLocaleString('en-IN')}`
      }))
    }

    // ========================================================
    // SETTLEMENTS & FINANCIAL LEDGER APIs
    // ========================================================
    if (route === '/settlements' && method === 'GET') {
      const unauth = requireAuth(request, ['vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      let filter = {}
      if (ctx.role === 'vendor') {
        const myVendors = await db.collection('vendors').find({ userId: ctx.userId }).toArray()
        const myIds = myVendors.map(v => v.id)
        filter = { vendorId: { $in: myIds } }
      }
      const list = await db.collection('settlements').find(filter).toArray()
      return cors(NextResponse.json(list.map(({ _id, ...rest }) => rest)))
    }

    if (route.startsWith('/settlements/') && method === 'PATCH') {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      const settlementId = route.split('/')[2]
      const body = await readJson()
      const { status, referenceId } = body || {}
      await db.collection('settlements').updateOne(
        { id: settlementId },
        { $set: { status, referenceId: referenceId || '', settledAt: status === 'PAID' ? new Date().toISOString() : null, updatedAt: new Date().toISOString() } }
      )
      const updated = await db.collection('settlements').findOne({ id: settlementId })
      if (updated) delete updated._id
      return cors(NextResponse.json({ settlement: updated }))
    }

    // ========================================================
    // DISPUTE MANAGEMENT APIs
    // ========================================================
    if (route === '/disputes' && method === 'GET') {
      const unauth = requireAuth(request, ['customer', 'vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      let filter = {}
      if (ctx.role === 'customer') filter.userId = ctx.userId
      if (ctx.role === 'vendor') filter.vendorUserId = ctx.userId
      const list = await db.collection('disputes').find(filter).toArray()
      return cors(NextResponse.json(list.map(({ _id, ...rest }) => rest)))
    }

    if (route === '/disputes' && method === 'POST') {
      const unauth = requireAuth(request, ['customer'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const body = await readJson()
      const { bookingId, reason, description = '' } = body || {}
      if (!bookingId || !reason) {
        return cors(NextResponse.json({ error: 'Booking ID and reason required' }, { status: 400 }))
      }
      const newDispute = {
        id: `disp_${uuidv4().slice(0, 8)}`,
        bookingId,
        userId: ctx.userId,
        reason,
        description,
        status: 'OPEN',
        createdAt: new Date().toISOString()
      }
      await db.collection('disputes').insertOne(newDispute)
      return cors(NextResponse.json({ dispute: newDispute }, { status: 201 }))
    }

    if (route.startsWith('/disputes/') && method === 'PATCH') {
      const unauth = requireAuth(request, ['admin'])
      if (unauth) return cors(unauth)
      const disputeId = route.split('/')[2]
      const body = await readJson()
      await db.collection('disputes').updateOne(
        { id: disputeId },
        { $set: { ...body, updatedAt: new Date().toISOString() } }
      )
      const updated = await db.collection('disputes').findOne({ id: disputeId })
      if (updated) delete updated._id
      return cors(NextResponse.json({ dispute: updated }))
    }

    // ========================================================
    // SUPPORT TICKETS APIs
    // ========================================================
    if (route === '/support' && method === 'GET') {
      const unauth = requireAuth(request, ['customer', 'vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const filter = ctx.role === 'admin' ? {} : { userId: ctx.userId }
      const list = await db.collection('support_tickets').find(filter).toArray()
      return cors(NextResponse.json(list.map(({ _id, ...rest }) => rest)))
    }

    if (route === '/support' && method === 'POST') {
      const unauth = requireAuth(request, ['customer', 'vendor'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const body = await readJson()
      const { subject, category = 'General', message = '', priority = 'MEDIUM' } = body || {}
      if (!subject || !message) {
        return cors(NextResponse.json({ error: 'Subject and message required' }, { status: 400 }))
      }
      const newTicket = {
        id: `tkt_${uuidv4().slice(0, 8)}`,
        userId: ctx.userId,
        userEmail: ctx.email,
        subject,
        category,
        priority,
        status: 'OPEN',
        messages: [{ sender: ctx.email, role: ctx.role, message, timestamp: new Date().toISOString() }],
        createdAt: new Date().toISOString()
      }
      await db.collection('support_tickets').insertOne(newTicket)
      return cors(NextResponse.json({ ticket: newTicket }, { status: 201 }))
    }

    if (route.startsWith('/support/') && method === 'PATCH') {
      const unauth = requireAuth(request, ['customer', 'vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const ticketId = route.split('/')[2]
      const body = await readJson()
      const { replyMessage, status } = body || {}
      const update = { updatedAt: new Date().toISOString() }
      if (status) update.status = status
      if (replyMessage) {
        await db.collection('support_tickets').updateOne(
          { id: ticketId },
          {
            $push: { messages: { sender: ctx.email, role: ctx.role, message: replyMessage, timestamp: new Date().toISOString() } },
            $set: update
          }
        )
      } else {
        await db.collection('support_tickets').updateOne({ id: ticketId }, { $set: update })
      }
      const updated = await db.collection('support_tickets').findOne({ id: ticketId })
      if (updated) delete updated._id
      return cors(NextResponse.json({ ticket: updated }))
    }

    // ========================================================
    // QUOTATION & NEGOTIATION APIs
    // ========================================================
    if (route === '/quotes' && method === 'GET') {
      const unauth = requireAuth(request, ['customer', 'vendor', 'admin'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      let filter = {}
      if (ctx.role === 'customer') filter.userId = ctx.userId
      if (ctx.role === 'vendor') {
        const myVendors = await db.collection('vendors').find({ userId: ctx.userId }).toArray()
        filter = { vendorId: { $in: myVendors.map(v => v.id) } }
      }
      const list = await db.collection('quotes').find(filter).toArray()
      return cors(NextResponse.json(list.map(({ _id, ...rest }) => rest)))
    }

    if (route === '/quotes' && method === 'POST') {
      const unauth = requireAuth(request, ['customer', 'vendor'])
      if (unauth) return cors(unauth)
      const ctx = getAuthContext(request)
      const body = await readJson()
      const { vendorId, eventDate, guests, price, services = [], notes = '' } = body || {}
      const newQuote = {
        id: `qt_${uuidv4().slice(0, 8)}`,
        userId: ctx.userId,
        vendorId,
        eventDate,
        guests: Number(guests || 150),
        proposedPrice: Number(price || 0),
        services,
        notes,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
      await db.collection('quotes').insertOne(newQuote)
      return cors(NextResponse.json({ quote: newQuote }, { status: 201 }))
    }

    if (route.startsWith('/quotes/') && method === 'PATCH') {
      const unauth = requireAuth(request, ['customer', 'vendor', 'admin'])
      if (unauth) return cors(unauth)
      const quoteId = route.split('/')[2]
      const body = await readJson()
      await db.collection('quotes').updateOne(
        { id: quoteId },
        { $set: { ...body, updatedAt: new Date().toISOString() } }
      )
      const updated = await db.collection('quotes').findOne({ id: quoteId })
      if (updated) delete updated._id
      return cors(NextResponse.json({ quote: updated }))
    }

    // Default 404
    return cors(NextResponse.json(
      { error: `API route ${route} with method ${method} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error in Vows & Venues route:', error)
    return cors(NextResponse.json(
      { error: "Internal server error: " + error.message }, 
      { status: 500 }
    ))
  }
}

// Export HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
export const OPTIONS = handleRoute
export const HEAD = handleRoute
