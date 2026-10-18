'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  MapPin,
  Users,
  Star,
  ShieldCheck,
  Calendar,
  Filter,
  SlidersHorizontal,
  ArrowRight,
  ChevronDown,
  Building2,
  Sparkles,
  ArrowLeft,
  X,
  CheckCircle2,
  PhoneCall
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import FooterSection from '@/components/FooterSection'
import ErrorBoundary from '@/components/ErrorBoundary'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

const CITIES = [
  'All Cities',
  'Lucknow',
  'Varanasi',
  'Delhi NCR',
  'Jaipur',
  'Udaipur',
  'Kanpur',
  'Noida',
  'Gorakhpur',
  'Deoria',
  'Ghaziabad',
  'Mumbai',
  'Goa'
]

const GUEST_RANGES = [
  { label: 'Any Guests', min: 0, max: 10000 },
  { label: 'Up to 200 Guests', min: 0, max: 200 },
  { label: '200 to 500 Guests', min: 200, max: 500 },
  { label: '500 to 1,000 Guests', min: 500, max: 1000 },
  { label: '1,000+ Guests (Grand Palaces)', min: 1000, max: 10000 }
]

function VenuesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialLocation = searchParams.get('location') || searchParams.get('city') || 'All Cities'
  const initialGuests = searchParams.get('guests') || ''
  const initialSearch = searchParams.get('search') || ''
  const initialSort = searchParams.get('sortBy') || 'rating'

  const [location, setLocation] = useState(initialLocation)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [selectedGuestRange, setSelectedGuestRange] = useState(0)
  const [sortBy, setSortBy] = useState(initialSort)
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)

  // Fetch venues from backend
  const fetchVenues = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.set('category', 'venues')
      if (location && location !== 'All Cities') {
        params.set('location', location)
      }
      if (searchTerm) {
        params.set('search', searchTerm)
      }
      if (sortBy) {
        params.set('sortBy', sortBy)
      }

      const res = await fetch(`/api/venues?${params.toString()}`)
      if (!res.ok) {
        // Fallback to /api/vendors if /api/venues has issue
        const fallback = await fetch(`/api/vendors?category=venues&${params.toString()}`)
        if (fallback.ok) {
          const data = await fallback.json()
          setVenues(Array.isArray(data) ? data : [])
          return
        }
        throw new Error('Failed to fetch venues')
      }
      const data = await res.json()
      setVenues(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching venues:', err)
      setError('Could not load venues at this moment. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues()
  }, [location, sortBy])

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault()
    fetchVenues()
    const p = new URLSearchParams()
    if (location && location !== 'All Cities') p.set('location', location)
    if (searchTerm) p.set('search', searchTerm)
    if (sortBy) p.set('sortBy', sortBy)
    router.replace(`/venues?${p.toString()}`)
  }

  // Client-side guest filtering if range selected
  const filteredVenues = venues.filter(v => {
    if (selectedGuestRange === 0) return true
    const range = GUEST_RANGES[selectedGuestRange]
    const cap = v.capacity || 400
    return cap >= range.min && cap <= range.max
  })

  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-900">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#3b0f1c] via-[#4a1525] to-[#2a0b14] text-white pt-28 pb-14 px-4 sm:px-6 lg:px-8 border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Royal Palace & Banquet Catalog
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-amber-50 font-bold">
                Marriage Halls & Wedding Venues
              </h1>
              <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-2xl font-light">
                Discover verified heritage palaces, luxury banquet lawns, and waterfront resorts across India with verified slot availability.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-amber-200/80 hover:text-amber-200 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>

          {/* Search Bar Container */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 bg-white/10 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row gap-2.5"
          >
            {/* Location selector */}
            <div className="flex-1 flex items-center bg-white rounded-xl px-3.5 py-2.5 border border-stone-200 shadow-sm">
              <MapPin className="w-5 h-5 text-amber-600 mr-2.5 shrink-0" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-stone-800 text-sm font-medium focus:outline-none cursor-pointer"
              >
                {CITIES.map(c => (
                  <option key={c} value={c} className="text-stone-800">{c}</option>
                ))}
              </select>
            </div>

            {/* Keyword search input */}
            <div className="flex-1 flex items-center bg-white rounded-xl px-3.5 py-2.5 border border-stone-200 shadow-sm">
              <Search className="w-5 h-5 text-amber-600 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Search by venue name, palace, or locality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none"
              />
            </div>

            {/* Guest Count Range selector */}
            <div className="flex-1 flex items-center bg-white rounded-xl px-3.5 py-2.5 border border-stone-200 shadow-sm">
              <Users className="w-5 h-5 text-amber-600 mr-2.5 shrink-0" />
              <select
                value={selectedGuestRange}
                onChange={(e) => setSelectedGuestRange(Number(e.target.value))}
                className="w-full bg-transparent text-stone-800 text-sm font-medium focus:outline-none cursor-pointer"
              >
                {GUEST_RANGES.map((r, idx) => (
                  <option key={idx} value={idx} className="text-stone-800">{r.label}</option>
                ))}
              </select>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Find Venues
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Filter bar and result counts */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-lg font-serif font-bold text-stone-900">
              {filteredVenues.length} Wedding Venues Available
            </span>
            {location !== 'All Cities' && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-100 text-amber-900 font-semibold px-2.5 py-1 rounded-full border border-amber-300">
                <MapPin className="w-3 h-3" /> {location}
                <button type="button" onClick={() => setLocation('All Cities')} className="hover:opacity-75">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-stone-500 font-medium hidden sm:inline">Sort by:</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs"
              >
                <option value="rating">Highest Rated ★</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Inquired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm animate-pulse">
                <div className="h-56 bg-stone-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-stone-200 rounded-sm w-3/4" />
                  <div className="h-4 bg-stone-200 rounded-sm w-1/2" />
                  <div className="h-4 bg-stone-200 rounded-sm w-full" />
                  <div className="h-8 bg-stone-200 rounded-sm w-full pt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">Notice</h3>
            <p className="text-stone-600 text-sm max-w-md mx-auto mb-6">{error}</p>
            <button
              onClick={fetchVenues}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredVenues.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No Venues Found</h3>
            <p className="text-stone-600 text-sm max-w-md mx-auto mb-6">
              We couldn't find any wedding venues matching your selected filters in {location}. Try resetting filters or searching another city.
            </p>
            <button
              onClick={() => {
                setLocation('All Cities')
                setSearchTerm('')
                setSelectedGuestRange(0)
              }}
              className="bg-stone-900 hover:bg-stone-800 text-amber-400 font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Venue Grid */}
        {!loading && !error && filteredVenues.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredVenues.map((v) => {
              const mainImg = Array.isArray(v.images) && v.images.length > 0 ? v.images[0] : (v.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3')
              const price = Number(v.startingPrice || v.price || 150000)
              const capacity = v.capacity || 400
              const rating = v.rating || 4.9

              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
                >
                  {/* Image container */}
                  <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-stone-100">
                    <img
                      src={getOptimizedImageUrl(mainImg, { width: 800, quality: 80 })}
                      alt={v.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Verified badge */}
                    {v.verified !== false && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[#4a1525] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Verified Palace
                      </span>
                    )}

                    {/* Rating badge */}
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-white/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {rating.toFixed(1)}
                    </span>

                    {/* Capacity pill */}
                    <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1.5 drop-shadow-md">
                      <Users className="w-3.5 h-3.5 text-amber-300" /> Up to {capacity} Guests
                    </div>
                  </div>

                  {/* Body content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-stone-500 font-medium mb-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{v.city || 'India'} • {v.address ? v.address.split(',')[0] : 'Prime Locality'}</span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#4a1525] transition-colors line-clamp-1 mb-2">
                        {v.name}
                      </h3>

                      <p className="text-stone-600 text-xs line-clamp-2 mb-4 font-light leading-relaxed">
                        {v.description || 'Luxury heritage venue with sprawling manicured lawns, grand banquet ballrooms, customizable royal mandap decorations, and authentic catering.'}
                      </p>

                      {/* Amenities pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(v.amenities || ['Lawn', 'AC Banquet', 'Rooms', 'DJ & Sound']).slice(0, 3).map((a, i) => (
                          <span key={i} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium border border-stone-200/60">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price and CTA Footer */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
                      <div>
                        <div className="text-[11px] text-stone-500 uppercase font-semibold tracking-wider">Starting from</div>
                        <div className="text-base font-serif font-bold text-[#4a1525]">
                          ₹{price.toLocaleString('en-IN')} <span className="text-xs text-stone-500 font-normal">/ day</span>
                        </div>
                      </div>

                      <Link
                        href={`/venues/${v.id}`}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#4a1525] to-[#360e1b] hover:from-[#5d1a2f] hover:to-[#4a1525] text-amber-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all duration-200 group-hover:shadow-lg cursor-pointer shrink-0"
                      >
                        Explore & Book <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  )
}

export default function VenuesCatalogPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
        </div>
      }>
        <VenuesContent />
      </Suspense>
    </ErrorBoundary>
  )
}
