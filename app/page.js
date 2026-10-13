'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Heart,
  Star,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Utensils,
  Camera,
  Music,
  Palette,
  Shirt,
  Gift,
  Flower2,
  MailOpen,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  Filter,
  SlidersHorizontal,
  X,
  Plus,
  Trash2,
  RefreshCw,
  ShoppingBag,
  Bell,
  ArrowRight,
  Share2,
  Download,
  CreditCard,
  QrCode,
  Smartphone,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  Layers,
  Award,
  DollarSign,
  TrendingUp,
  UserCheck,
  Eye,
  Check,
  MessageSquare,
  FileText,
  Sliders,
  Scale,
  Percent,
  Compass,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import CuratedOffers from '../components/CuratedOffers'
import EditorialCategories from '../components/EditorialCategories'
import VendorCard from '../components/VendorCard'
import VendorProfileModal from '../components/VendorProfileModal'
import EventBuilderWorkspace from '../components/EventBuilderWorkspace'
import AdminOperationsSuite from '../components/AdminOperationsSuite'
import FooterSection from '../components/FooterSection'
import ErrorBoundary from '../components/ErrorBoundary'
import TopSlidingImageGallery from '../components/TopSlidingImageGallery'
import SlidingReviewsSection from '../components/SlidingReviewsSection'
import NegotiationChatDrawer from '../components/NegotiationChatDrawer'
import FeaturedVenuesEditorial from '../components/FeaturedVenuesEditorial'
import RoyalVenueRevealSection from '../components/RoyalVenueRevealSection'
import WeddingInspirationGallery from '../components/WeddingInspirationGallery'
import CuratedPackagesSection from '../components/CuratedPackagesSection'
import TrustAndConfidenceSection from '../components/TrustAndConfidenceSection'
import CoupleWeddingToolkit from '../components/planning/CoupleWeddingToolkit'
import RajshreeAIConcierge from '../components/ai/RajshreeAIConcierge'
import VendorPartnerSuite from '../components/vendor/VendorPartnerSuite'
import { DEFAULT_PAYMENT_CONFIG } from '../components/admin/AdminPaymentGatewayManager'
import ScrollReveal, { TextLineReveal, ScrollStaggerContainer, ScrollStaggerItem } from '../components/ScrollReveal'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

// Indian Top Event Cities
const CITIES = [
  'All Cities',
  'Lucknow',
  'Delhi NCR',
  'Jaipur',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Udaipur',
  'Goa',
  'Chandigarh'
]

// Event Types for Quick Search & Templates
const EVENT_TYPES = [
  { id: 'wedding', name: 'Wedding', icon: '💍', subtitle: 'Royal Palaces, Grand Banquets & Full Ceremonies' },
  { id: 'engagement', name: 'Engagement & Roka', icon: '✨', subtitle: 'Intimate Soirees & Ring Ceremonies' },
  { id: 'sangeet', name: 'Sangeet & Mehendi', icon: '💃', subtitle: 'High-Energy DJs, Dhol & Dance Floored' },
  { id: 'birthday', name: 'Birthday Party', icon: '🎂', subtitle: 'Theme Decors, Photo Booths & Sound' },
  { id: 'anniversary', name: 'Anniversary Gala', icon: '🥂', subtitle: 'Candlelit Dinners, Live Bands & Feasts' },
  { id: 'baby_shower', name: 'Baby Shower & Godh Bharai', icon: '🍼', subtitle: 'Pastel Florals, Traditional Sweets & Favors' },
  { id: 'corporate', name: 'Corporate Gala & Awards', icon: '👔', subtitle: 'Conferences, Audio-Visuals & Fine Dining' },
  { id: 'cocktail', name: 'Cocktail & After-Party', icon: '🍸', subtitle: 'Sundowner Lawns, Mixologists & Live Sufi' }
]

// Category icons mapping
const CATEGORY_ICON_MAP = {
  venues: Building2,
  catering: Utensils,
  decor: Sparkles,
  makeup: Palette,
  outfits: Shirt,
  photography: Camera,
  music: Music,
  gifts: Gift,
  florists: Flower2,
  invitations: MailOpen,
  planners: CalendarDays
}

// Default Category list fallback
const DEFAULT_CATEGORIES = [
  { id: 'cat_venues', name: 'Venues / Banquet Halls', slug: 'venues', description: 'Heritage palaces, luxury banquets, lush lawns & boutique resort venues.', image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2', startingPrice: 75000, unit: 'per day' },
  { id: 'cat_catering', name: 'Catering & Feasts', slug: 'catering', description: 'Authentic royal Awadhi, North & South Indian, multi-cuisine and live chaat counters.', image: 'https://images.unsplash.com/photo-1555244162-803834f70033', startingPrice: 650, unit: 'per plate' },
  { id: 'cat_decor', name: 'Decoration & Mandaps', slug: 'decor', description: 'Grand floral mandaps, fairy light tunnels, thematic stage decor & luxury backdrops.', image: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85', startingPrice: 35000, unit: 'per event' },
  { id: 'cat_makeup', name: 'Makeup Artists', slug: 'makeup', description: 'Celebrity HD bridal glam, airbrush makeup, sangeet styling and draping.', image: 'https://images.unsplash.com/photo-1600685890506-593fdf55949b', startingPrice: 15000, unit: 'per look' },
  { id: 'cat_outfits', name: 'Rental Outfits', slug: 'outfits', description: 'Couture bridal lehengas, groom sherwanis, tuxedos & jewellery on rental.', image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxsZWhlbmdhfGVufDB8fHx8MTc4ODg1NDU0NHww&ixlib=rb-4.1.0&q=85', startingPrice: 8500, unit: 'per 3 days' },
  { id: 'cat_photography', name: 'Photography & Cinema', slug: 'photography', description: 'Candid wedding photography, 4K cinematic teasers, pre-wedding & drone coverage.', image: 'https://images.unsplash.com/photo-1744805624954-a6686543c3ff', startingPrice: 40000, unit: 'per day' },
  { id: 'cat_music', name: 'DJ & Music', slug: 'music', description: 'High-energy Bollywood DJs, Punjabi Dhol troopes, Sufi live bands & sound setups.', image: 'https://images.unsplash.com/photo-1541126274323-dbac58d14741?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwzfHxkaiUyMHBhcnR5fGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85', startingPrice: 20000, unit: 'per evening' },
  { id: 'cat_gifts', name: 'Return Gifts & Favors', slug: 'gifts', description: 'Handcrafted brassware, premium dry-fruit hampers, artisanal sweets & bespoke mementos.', image: 'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxnaWZ0JTIwaGFtcGVyfGVufDB8fHx8MTc4ODkzNzIzOHww&ixlib=rb-4.1.0&q=85', startingPrice: 150, unit: 'per piece' },
  { id: 'cat_florists', name: 'Florists & Garlands', slug: 'florists', description: 'Varmala sets, fragrant mogra chandeliers, Dutch roses and floral entryway canopies.', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb', startingPrice: 12000, unit: 'per setup' },
  { id: 'cat_invitations', name: 'Invitation Cards & E-Invites', slug: 'invitations', description: 'Royal velvet box cards, animated video invites, custom calligraphy & RSVP portals.', image: 'https://images.unsplash.com/photo-1656104717095-9d062b0d4e8d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHw0fHxpbnZpdGF0aW9uJTIwY2FyZHxlbnwwfHx8fDE3ODg5MzcyMzh8MA&ixlib=rb-4.1.0&q=85', startingPrice: 3500, unit: 'per set/video' },
  { id: 'cat_planners', name: 'Event Planners & Coordinators', slug: 'planners', description: 'End-to-end wedding planners, guest RSVP management and day-of execution crew.', image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHw0fHxjb3Jwb3JhdGUlMjBldmVudHxlbnwwfHx8fDE3ODg5MzcyMzh8MA&ixlib=rb-4.1.0&q=85', startingPrice: 50000, unit: 'full service' }
]

export default function VowsAndVenuesApp() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('home') // 'home' | 'explore' | 'categories' | 'packages' | 'builder' | 'bookings' | 'wishlist' | 'vendor_portal' | 'admin_portal'
  const [userRole, setUserRole] = useState('customer') // 'customer' 
  const [selectedCity, setSelectedCity] = useState('All Cities')
  
  // Data State
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [vendors, setVendors] = useState([])
  const [packages, setPackages] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [userBookings, setUserBookings] = useState([])
  const [wishlistIds, setWishlistIds] = useState([])
  const [wishlistVendors, setWishlistVendors] = useState([])
  const [notifications, setNotifications] = useState([])
  const [adminStats, setAdminStats] = useState({
    totalVendors: 33,
    totalVerifiedVendors: 33,
    totalBookings: 14,
    grossPlatformVolume: 359200,
    platformCommissionRevenue: 34000,
    totalInquiries: 28,
    totalEvents: 19
  })
  const [vendorStats, setVendorStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filters State for Marketplace Explore
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterCity, setFilterCity] = useState('all')
  const [filterSearch, setFilterSearch] = useState('')
  const [filterMinRating, setFilterMinRating] = useState('')
  const [filterVerified, setFilterVerified] = useState(false)
  const [filterMaxPrice, setFilterMaxPrice] = useState(300000)
  const [filterSortBy, setFilterSortBy] = useState('recommended')
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  // Modals & Drawers
  const [selectedVendorModal, setSelectedVendorModal] = useState(null)
  const [vendorModalTab, setVendorModalTab] = useState('overview') // 'overview' | 'packages' | 'gallery' | 'reviews'
  const [inquiryModalVendor, setInquiryModalVendor] = useState(null)
  const [inquiryFormData, setInquiryFormData] = useState({ name: '', phone: '', email: '', date: '', guests: '', message: '' })
  
  // Package Customizer Modal
  const [customizingPackage, setCustomizingPackage] = useState(null)
  const [packageCustomItems, setPackageCustomItems] = useState([])
  const [swappingCategory, setSwappingCategory] = useState(null)

  // Booking Flow & Checkout Modal (7 Steps)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    eventDate: '',
    eventName: '',
    guestCount: 200,
    venueAddress: '',
    specialInstructions: '',
    promoCode: '',
    discount: 0,
    paymentMethod: 'upi',
    isAdvanceOnly: true
  })
  const [confirmedBookingResult, setConfirmedBookingResult] = useState(null)
  
  // Payment Gateway & Admin Custom UPI Config State
  const [paymentConfig, setPaymentConfig] = useState(DEFAULT_PAYMENT_CONFIG)
  const [customerUtr, setCustomerUtr] = useState('')
  const [customerReceiptNotes, setCustomerReceiptNotes] = useState('')
  const [copiedUpi, setCopiedUpi] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vv_payment_gateway_config')
      if (stored) {
        setPaymentConfig(JSON.parse(stored))
      }
    } catch (_) {}
  }, [isBookingModalOpen])

  // Review Modal State
  const [reviewModalVendor, setReviewModalVendor] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewEventType, setReviewEventType] = useState('Wedding')

  // Vendor Comparison Modal State
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  const [compareVendorIds, setCompareVendorIds] = useState([])

  // Notifications Drawer
  const [showNotifications, setShowNotifications] = useState(false)

  // Hero Search Inputs
  const [heroSearch, setHeroSearch] = useState({
    eventType: '',
    city: '',
    date: '',
    guests: '',
    budget: ''
  })

  // Quick Quotation Modal for Event Builder
  const [showQuotationModal, setShowQuotationModal] = useState(false)

  // Live Price Negotiation & Concierge Chat State (Client Requested)
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false)
  const [negotiatingVendor, setNegotiatingVendor] = useState(null)

  const handleOpenNegotiation = (vendor = null) => {
    setNegotiatingVendor(vendor)
    setIsNegotiationOpen(true)
  }

  // ============ AUTH STATE ============
  const [currentUser, setCurrentUser] = useState(null) // { id, name, email, role, avatarInitial }
  const [authToken, setAuthToken] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'customer' })
  const [authBusy, setAuthBusy] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Install a global fetch interceptor that attaches Authorization and role headers to /api/* calls.
  const authTokenRef = useRef(null)
  const userRoleRef = useRef('customer')
  useEffect(() => { authTokenRef.current = authToken }, [authToken])
  useEffect(() => { userRoleRef.current = userRole }, [userRole])

  // ============ CMS & PLATFORM MEDIA STATE ============
  const [cmsContent, setCmsContent] = useState(null)
  const [mediaLibrary, setMediaLibrary] = useState([])
  const [coupons, setCoupons] = useState([])
  const [settlements, setSettlements] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.__vv_fetch_patched) return
    const originalFetch = window.fetch.bind(window)
    window.fetch = (input, init = {}) => {
      try {
        const urlStr = typeof input === 'string' ? input : (input?.url || '')
        const isApi = urlStr.startsWith('/api') || urlStr.includes('/api/')
        if (isApi) {
          init = { ...init }
          const headers = new Headers(init.headers || {})
          if (authTokenRef.current && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${authTokenRef.current}`)
          }
          if (userRoleRef.current) {
            headers.set('x-demo-role', userRoleRef.current)
          }
          init.headers = headers
        }
      } catch (_) {}
      return originalFetch(input, init)
    }
    window.__vv_fetch_patched = true
  }, [])

  // ============ ADMIN ACTIONS STATE ============
  const [adminActionBusy, setAdminActionBusy] = useState(null)

  const handleUpdateCMS = async (newCms) => {
    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCms)
      })
      const data = await res.json()
      if (res.ok && data.cms) {
        setCmsContent(data.cms)
        toast.success('Website CMS content updated live!')
      } else {
        toast.error(data.error || 'Failed to update CMS')
      }
    } catch (err) {
      toast.error('CMS update failed')
    }
  }

  const handleUploadMedia = async (mediaObj) => {
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaObj)
      })
      const data = await res.json()
      if (res.ok && data.media) {
        setMediaLibrary(prev => [data.media, ...prev])
        toast.success('Media uploaded to asset library!')
      } else {
        toast.error(data.error || 'Failed to save media')
      }
    } catch (err) {
      toast.error('Failed to save media')
    }
  }

  const handleDeleteMedia = async (mediaId) => {
    try {
      const res = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' })
      if (res.ok) {
        setMediaLibrary(prev => prev.filter(m => m.id !== mediaId))
        toast.success('Media deleted')
      }
    } catch (err) {
      toast.error('Failed to delete media')
    }
  }

  const handleCreateCoupon = async (couponObj) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponObj)
      })
      const data = await res.json()
      if (res.ok && data.coupon) {
        setCoupons(prev => [...prev, data.coupon])
        toast.success('Promotional coupon created!')
      } else {
        toast.error(data.error || 'Failed to create coupon')
      }
    } catch (err) {
      toast.error('Failed to create coupon')
    }
  }

  const handleUpdateSettlement = async (settlementId, status) => {
    try {
      const res = await fetch(`/api/settlements/${settlementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (res.ok && data.settlement) {
        setSettlements(prev => prev.map(s => s.id === settlementId ? data.settlement : s))
        toast.success(`Settlement marked as ${status}`)
      }
    } catch (err) {
      toast.error('Failed to update settlement')
    }
  }

  // ============ VENDOR PACKAGE MODAL STATE ============
  const [showPkgModal, setShowPkgModal] = useState(false)
  const [pkgForm, setPkgForm] = useState({ name: '', price: '', includes: '', description: '' })
  const [pkgBusy, setPkgBusy] = useState(false)

  // ============ VENDOR ONBOARDING STATE ============
  const [myVendor, setMyVendor] = useState(null) // vendor tied to logged-in user
  const [onboardingStep, setOnboardingStep] = useState(1) // 1..4
  const [onboardingBusy, setOnboardingBusy] = useState(false)
  const [onboardingForm, setOnboardingForm] = useState({
    name: '',
    category: 'venues',
    categoryName: 'Venues / Banquet Halls',
    city: 'Lucknow',
    address: '',
    description: '',
    contactPhone: '',
    email: '',
    startingPrice: '',
    priceUnit: 'per day',
    capacity: '200',
    highlights: '',
    image: '',
    gallery: ['', '', ''],
    packageName: '',
    packagePrice: '',
    packageIncludes: ''
  })

  // Sample stock images per category to help vendors publish faster
  const SAMPLE_IMAGES_BY_CATEGORY = {
    venues: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200',
      'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1200'
    ],
    catering: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200'
    ],
    decor: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200'
    ],
    makeup: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200',
      'https://images.unsplash.com/photo-1503104834685-7205e8607eb9?w=1200',
      'https://images.unsplash.com/photo-1610397962076-02407a169485?w=1200'
    ],
    photography: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200'
    ],
    music: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200'
    ],
    outfits: [
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1200',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1200',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200'
    ],
    gifts: [
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200',
      'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200'
    ],
    florists: [
      'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200'
    ],
    invitations: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200',
      'https://images.unsplash.com/photo-1607292676221-cee85f81f2c3?w=1200'
    ],
    planners: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200'
    ]
  }

  const fillOnboardingSample = (cat) => {
    const imgs = SAMPLE_IMAGES_BY_CATEGORY[cat] || SAMPLE_IMAGES_BY_CATEGORY.venues
    setOnboardingForm(prev => ({
      ...prev,
      image: imgs[0],
      gallery: [imgs[0], imgs[1] || '', imgs[2] || '']
    }))
    toast.success('Sample images applied — you can replace them anytime')
  }

  // Restore session from localStorage & check direct tab URL parameter
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('vv_user') : null
      const rawTok = typeof window !== 'undefined' ? localStorage.getItem('vv_token') : null
      if (raw) {
        const u = JSON.parse(raw)
        if (u?.id) {
          setCurrentUser(u)
          if (u.role) setUserRole(u.role)
        }
      }
      if (rawTok) setAuthToken(rawTok)
    } catch (_) {}

    // Support direct URL parameters e.g. /?tab=admin_portal or /?tab=admin or /#admin
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      const hashParam = window.location.hash.replace('#', '')
      const target = tabParam || hashParam

      if (target === 'admin' || target === 'admin_portal') {
        setActiveTab('admin_portal')
        setUserRole('admin')
      } else if (target === 'vendor' || target === 'vendor_portal') {
        setActiveTab('vendor_portal')
        setUserRole('vendor')
      } else if (['explore', 'categories', 'packages', 'builder', 'bookings', 'wishlist', 'home'].includes(target)) {
        setActiveTab(target)
      }
    }
  }, [])

  const persistUser = (u, token) => {
    try {
      localStorage.setItem('vv_user', JSON.stringify(u))
      if (token) localStorage.setItem('vv_token', token)
    } catch (_) {}
  }

  const handleAuthSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    setAuthBusy(true)
    try {
      const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const body = authMode === 'signup'
        ? { name: authForm.name, email: authForm.email, password: authForm.password, role: authForm.role }
        : { email: authForm.email, password: authForm.password }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Authentication failed')
      setCurrentUser(data.user)
      setAuthToken(data.token)
      persistUser(data.user, data.token)
      setAuthModalOpen(false)
      setAuthForm({ name: '', email: '', password: '', role: 'customer' })
      toast.success(authMode === 'signup' ? `Welcome, ${data.user.name}!` : `Welcome back, ${data.user.name}!`)
      if (data.user.role === 'vendor') { setUserRole('vendor'); setActiveTab('vendor_portal') }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setAuthBusy(false)
    }
  }

  // Exchange a real Google ID token (credential) from Google Identity Services for our JWT.
  const exchangeGoogleCredential = async (credential) => {
    setAuthBusy(true)
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, role: authForm.role })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Google sign-in failed')
      setCurrentUser(data.user)
      setAuthToken(data.token)
      persistUser(data.user, data.token)
      setAuthModalOpen(false)
      toast.success(`Signed in as ${data.user.name}`)
      if (data.user.role === 'vendor') { setUserRole('vendor'); setActiveTab('vendor_portal') }
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed')
    } finally {
      setAuthBusy(false)
    }
  }

  const handleGoogleAuth = async () => {
    // Prefer real Google Identity Services if configured, else surface a clear error.
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      toast.error('Google sign-in is not configured yet. Please use email/password.')
      return
    }
    // Ensure the GIS script is loaded
    try {
      await new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject(new Error('no window'))
        if (window.google?.accounts?.id) return resolve()
        const existing = document.getElementById('vv-gis-script')
        if (existing) { existing.addEventListener('load', () => resolve()); return }
        const s = document.createElement('script')
        s.id = 'vv-gis-script'
        s.src = 'https://accounts.google.com/gsi/client'
        s.async = true; s.defer = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Failed to load Google sign-in'))
        document.head.appendChild(s)
      })

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => {
          if (resp?.credential) exchangeGoogleCredential(resp.credential)
          else toast.error('Google did not return a credential')
        },
        auto_select: false,
        ux_mode: 'popup'
      })
      // Programmatic prompt / One Tap fallback
      window.google.accounts.id.prompt()
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setAuthToken(null)
    try {
      localStorage.removeItem('vv_user')
      localStorage.removeItem('vv_token')
    } catch (_) {}
    setShowProfileMenu(false)
    toast.success('Signed out successfully')
  }

  const handleAdminVerifyToggle = async (vendorId, currentVerified) => {
    setAdminActionBusy(vendorId)
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentVerified })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      // Refresh vendors
      const venRes = await fetch('/api/vendors').then(r => r.json())
      setVendors(venRes)
      // Refresh admin stats
      const admRes = await fetch('/api/admin/stats').then(r => r.json())
      setAdminStats(admRes)
      toast.success(!currentVerified ? 'Vendor approved & verified ✓' : 'Verification revoked')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setAdminActionBusy(null)
    }
  }

  const handleAdminReject = async (vendorId, name) => {
    setAdminActionBusy(vendorId)
    try {
      await fetch(`/api/admin/vendors/${vendorId}/reject`, { method: 'PATCH' })
      const venRes = await fetch('/api/vendors').then(r => r.json())
      setVendors(venRes)
      const admRes = await fetch('/api/admin/stats').then(r => r.json())
      setAdminStats(admRes)
      toast.info(`${name} rejected`)
    } catch (err) {
      toast.error('Failed to reject')
    } finally {
      setAdminActionBusy(null)
    }
  }

  const handleVendorAddPackage = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    const vendorId = myVendor?.id || vendorStats?.vendor?.id || 'v_royal_palace_lko'
    if (!pkgForm.name || !pkgForm.price) {
      toast.error('Please fill package name and price')
      return
    }
    setPkgBusy(true)
    try {
      const res = await fetch(`/api/vendors/${vendorId}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pkgForm.name,
          price: Number(pkgForm.price),
          includes: pkgForm.includes.split(',').map(s => s.trim()).filter(Boolean),
          description: pkgForm.description
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      // Refresh vendor stats and my vendor
      const vs = await fetch(`/api/vendor/stats?vendorId=${vendorId}`).then(r => r.json())
      setVendorStats(vs)
      if (currentUser?.id) {
        const mv = await fetch('/api/vendors/mine').then(r => r.json())
        if (mv?.vendor) setMyVendor(mv.vendor)
      }
      const venRes = await fetch('/api/vendors').then(r => r.json())
      setVendors(venRes)
      setShowPkgModal(false)
      setPkgForm({ name: '', price: '', includes: '', description: '' })
      toast.success(`Package "${data.package.name}" added successfully`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setPkgBusy(false)
    }
  }

  const handleVendorDeletePackage = async (packageId) => {
    const vendorId = myVendor?.id || vendorStats?.vendor?.id || 'v_royal_palace_lko'
    try {
      await fetch(`/api/vendors/${vendorId}/packages/${packageId}`, { method: 'DELETE' })
      if (myVendor?.userId) {
        const mv = await fetch('/api/vendors/mine').then(r => r.json())
        if (mv?.vendor) setMyVendor(mv.vendor)
      }
      const vs = await fetch(`/api/vendor/stats?vendorId=${vendorId}`).then(r => r.json())
      setVendorStats(vs)
      toast.success('Package removed')
    } catch (err) {
      toast.error('Failed to remove package')
    }
  }

  // Fetch the vendor profile linked to the current signed-in user
  const fetchMyVendor = async (userId) => {
    if (!userId) { setMyVendor(null); return }
    try {
      const res = await fetch('/api/vendors/mine')
      const data = await res.json()
      setMyVendor(data.vendor || null)
      if (data.vendor?.id) {
        // Sync vendor stats to this vendor
        const vs = await fetch(`/api/vendor/stats?vendorId=${data.vendor.id}`).then(r => r.json())
        setVendorStats(vs)
      }
    } catch (err) {
      console.error('Fetch my vendor error', err)
    }
  }

  // When logged in as vendor, load their vendor profile
  useEffect(() => {
    if (currentUser?.role === 'vendor') {
      fetchMyVendor(currentUser.id)
    } else {
      setMyVendor(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  // Re-fetch protected data (bookings, wishlist, notifications, events, admin/vendor stats)
  // whenever the auth token changes — on login, logout, or session restore.
  useEffect(() => {
    const refresh = async () => {
      if (!authToken) {
        // Anonymous — reset user-scoped state, keep public marketplace data.
        setUserBookings([])
        setWishlistIds([])
        setWishlistVendors([])
        setNotifications([])
        return
      }
      const safeJson = (r) => r.ok ? r.json() : null
      try {
        const [evtRes, bkgRes, wshRes, notifRes, admRes, venStatRes] = await Promise.all([
          fetch('/api/events').then(safeJson).catch(() => null),
          fetch('/api/bookings').then(safeJson).catch(() => null),
          fetch('/api/wishlist').then(safeJson).catch(() => null),
          fetch('/api/notifications').then(safeJson).catch(() => null),
          fetch('/api/admin/stats').then(safeJson).catch(() => null),
          fetch('/api/vendor/stats').then(safeJson).catch(() => null)
        ])
        setUserBookings(Array.isArray(bkgRes) ? bkgRes : [])
        setWishlistIds(Array.isArray(wshRes?.wishlistIds) ? wshRes.wishlistIds : [])
        setWishlistVendors(Array.isArray(wshRes?.vendors) ? wshRes.vendors : [])
        setNotifications(Array.isArray(notifRes) ? notifRes : [])
        if (admRes && typeof admRes === 'object') setAdminStats(admRes)
        if (venStatRes && typeof venStatRes === 'object') setVendorStats(venStatRes)
        if (Array.isArray(evtRes) && evtRes.length > 0) setActiveEvent(evtRes[0])
      } catch (_) { /* silent */ }
    }
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken])

  const handleSubmitOnboarding = async () => {
    if (!currentUser?.id) {
      toast.error('Please login as a vendor first')
      setAuthMode('signup')
      setAuthForm({ ...authForm, role: 'vendor' })
      setAuthModalOpen(true)
      return
    }
    const f = onboardingForm
    if (!f.name || !f.category || !f.city || !f.startingPrice) {
      toast.error('Please complete Business Info and Pricing')
      return
    }
    setOnboardingBusy(true)
    try {
      const cat = categories.find(c => c.slug === f.category)
      const packages = []
      if (f.packageName && f.packagePrice) {
        packages.push({
          id: `pkg_${Date.now().toString(36)}`,
          name: f.packageName,
          price: Number(f.packagePrice),
          includes: f.packageIncludes.split(',').map(s => s.trim()).filter(Boolean),
          description: ''
        })
      }
      const cleanGallery = (f.gallery || []).filter(Boolean)
      const payload = {
        userId: currentUser.id,
        name: f.name,
        category: f.category,
        categoryName: cat?.name || f.categoryName,
        city: f.city,
        address: f.address || `${f.city}, India`,
        description: f.description,
        contactPhone: f.contactPhone,
        email: f.email || currentUser.email,
        startingPrice: Number(f.startingPrice),
        priceUnit: f.priceUnit,
        capacity: Number(f.capacity) || 200,
        image: f.image || cleanGallery[0] || 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2',
        gallery: cleanGallery.length ? cleanGallery : [f.image].filter(Boolean),
        highlights: f.highlights.split(',').map(s => s.trim()).filter(Boolean),
        tags: [f.city, f.category],
        packages: packages.length ? packages : undefined,
        verified: false,
        status: 'pending'
      }
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to publish profile')
      setMyVendor(data)
      // Refresh master vendor list
      const venRes = await fetch('/api/vendors').then(r => r.json())
      setVendors(venRes)
      // Refresh vendor stats
      const vs = await fetch(`/api/vendor/stats?vendorId=${data.id}`).then(r => r.json())
      setVendorStats(vs)
      toast.success(`Welcome aboard, ${data.name}! Your profile is live and pending Vows & Venues verification.`)
      setOnboardingStep(1)
    } catch (err) {
      toast.error(err.message || 'Failed to publish')
    } finally {
      setOnboardingBusy(false)
    }
  }

  const handleBookingStatusChange = async (bookingId, status) => {    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      const bkgRes = await fetch('/api/bookings').then(r => r.json())
      setUserBookings(bkgRes)
      toast.success(status === 'confirmed' ? 'Booking accepted & confirmed' : `Booking ${status}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Fetch initial data
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      // Public endpoints (no auth needed) — always fetched
      const [catRes, venRes, pkgRes, cmsRes, mediaRes, couponRes] = await Promise.all([
        fetch('/api/categories').then(r => r.json()).catch(() => []),
        fetch('/api/vendors').then(r => r.json()).catch(() => []),
        fetch('/api/packages').then(r => r.json()).catch(() => []),
        fetch('/api/cms').then(r => r.json()).catch(() => null),
        fetch('/api/media').then(r => r.json()).catch(() => []),
        fetch('/api/coupons').then(r => r.json()).catch(() => [])
      ])
      setCategories(Array.isArray(catRes) && catRes.length > 0 ? catRes : DEFAULT_CATEGORIES)
      setVendors(Array.isArray(venRes) ? venRes : [])
      setPackages(Array.isArray(pkgRes) ? pkgRes : [])
      if (cmsRes) setCmsContent(cmsRes)
      if (Array.isArray(mediaRes)) setMediaLibrary(mediaRes)
      if (Array.isArray(couponRes)) setCoupons(couponRes)

      // Protected endpoints — fire when authenticated or when navigating to portals
      const hasSession = typeof window !== 'undefined' && !!localStorage.getItem('vv_token')
      const isDirectPortal = typeof window !== 'undefined' && (
        window.location.search.includes('admin') || 
        window.location.search.includes('vendor') ||
        window.location.hash.includes('admin') ||
        window.location.hash.includes('vendor')
      )

      let evtRes = null, bkgRes = null, wshRes = null, notifRes = null, admRes = null, venStatRes = null, stlRes = null

      if (hasSession || isDirectPortal) {
        const safeJson = (r) => r.ok ? r.json() : null
        ;[evtRes, bkgRes, wshRes, notifRes, admRes, venStatRes, stlRes] = await Promise.all([
          fetch('/api/events').then(safeJson).catch(() => null),
          fetch('/api/bookings').then(safeJson).catch(() => null),
          fetch('/api/wishlist').then(safeJson).catch(() => null),
          fetch('/api/notifications').then(safeJson).catch(() => null),
          fetch('/api/admin/stats').then(safeJson).catch(() => null),
          fetch('/api/vendor/stats').then(safeJson).catch(() => null),
          fetch('/api/settlements').then(safeJson).catch(() => [])
        ])
      }

      setUserBookings(Array.isArray(bkgRes) ? bkgRes : [])
      setWishlistIds(Array.isArray(wshRes?.wishlistIds) ? wshRes.wishlistIds : [])
      setWishlistVendors(Array.isArray(wshRes?.vendors) ? wshRes.vendors : [])
      setNotifications(Array.isArray(notifRes) ? notifRes : [])
      if (Array.isArray(stlRes)) setSettlements(stlRes)
      if (admRes && typeof admRes === 'object') {
        setAdminStats(admRes)
      } else if (isDirectPortal) {
        setAdminStats({
          totalVendors: 33,
          verifiedVendors: 33,
          pendingVendors: 0,
          totalBookings: 14,
          grossMerchandiseValue: 2850000,
          platformRevenue: 285000,
          settledPayouts: 2100000,
          disputesCount: 0
        })
      }
      if (venStatRes && typeof venStatRes === 'object') setVendorStats(venStatRes)
      if (Array.isArray(evtRes) && evtRes.length > 0) {
        setActiveEvent(evtRes[0])
      } else {
        // Show a demo default event so the "My Event" tab has content to render
        // even for anonymous visitors. We ONLY persist it to the API when the
        // user is authenticated — POST /api/events requires a valid JWT.
        const defaultEvt = {
          id: 'evt_sample_wedding',
          userId: currentUser?.id || 'demo_guest',
          name: "Rohit & Ananya's Grand Wedding",
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
          ]
        }
        // Persist only for authenticated users; silently skip for anonymous visitors.
        if (currentUser?.id) {
          try {
            await fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(defaultEvt)
            })
          } catch (_) { /* non-fatal */ }
        }
        setActiveEvent(defaultEvt)
      }
    } catch (err) {
      console.error('Error loading initial data:', err)
      toast.error('Could not load marketplace data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  // Refetch Vendors on Filter Change
  const fetchFilteredVendors = async () => {
    try {
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.append('category', filterCategory)
      if (filterCity !== 'all' && filterCity !== 'All Cities') params.append('city', filterCity)
      if (filterSearch) params.append('search', filterSearch)
      if (filterMinRating) params.append('minRating', filterMinRating)
      if (filterVerified) params.append('verified', 'true')
      if (filterMaxPrice) params.append('maxPrice', filterMaxPrice)
      if (filterSortBy) params.append('sortBy', filterSortBy)

      const res = await fetch(`/api/vendors?${params.toString()}`)
      const data = await res.json()
      setVendors(data || [])
    } catch (err) {
      console.error('Error fetching filtered vendors:', err)
    }
  }

  useEffect(() => {
    fetchFilteredVendors()
  }, [filterCategory, filterCity, filterMinRating, filterVerified, filterMaxPrice, filterSortBy])

  // Sync global city selector with filterCity
  useEffect(() => {
    if (selectedCity === 'All Cities') {
      setFilterCity('all')
    } else {
      setFilterCity(selectedCity)
    }
  }, [selectedCity])

  // Toggle Wishlist
  const handleToggleWishlist = async (vendorId, e) => {
    if (e) e.stopPropagation()
    if (!currentUser) {
      toast.info('Please sign in to save vendors to your wishlist')
      setAuthMode('login')
      setAuthModalOpen(true)
      return
    }
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId })
      })
      if (!res.ok) {
        throw new Error('Request failed')
      }
      const data = await res.json()
      if (data?.success) {
        setWishlistIds(Array.isArray(data.wishlist) ? data.wishlist : [])
        if (data.isSaved) {
          toast.success('Saved to your Wishlist ❤️')
        } else {
          toast.info('Removed from Wishlist')
        }
        // Refresh wishlist list (safe if 401)
        const wshRes = await fetch('/api/wishlist')
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
        setWishlistVendors(Array.isArray(wshRes?.vendors) ? wshRes.vendors : [])
      }
    } catch (err) {
      toast.error('Could not update wishlist')
    }
  }

  // Add Vendor Service to Active Event
  const handleAddVendorToEvent = async (vendor, selectedPackage = null, e = null) => {
    if (e) e.stopPropagation()
    if (!activeEvent) {
      toast.error('Please create or load an event first in "My Event"')
      return
    }

    const pkg = selectedPackage || vendor.packages?.[0] || {
      id: `pkg_${vendor.id}_std`,
      name: 'Standard Package',
      price: vendor.startingPrice
    }

    // Check if category is already booked
    const existingIndex = activeEvent.selectedServices?.findIndex(s => s.category === vendor.category)
    let updatedServices = [...(activeEvent.selectedServices || [])]

    const newServiceItem = {
      category: vendor.category,
      categoryName: vendor.categoryName,
      vendorId: vendor.id,
      vendorName: vendor.name,
      packageId: pkg.id,
      packageName: pkg.name,
      price: pkg.price,
      date: activeEvent.date,
      timeSlot: 'Full Day / Evening Slot',
      image: vendor.image
    }

    if (existingIndex >= 0) {
      updatedServices[existingIndex] = newServiceItem
      toast.success(`Replaced ${vendor.categoryName} with ${vendor.name} in your Event!`)
    } else {
      updatedServices.push(newServiceItem)
      toast.success(`Added ${vendor.name} (${vendor.categoryName}) to "${activeEvent.name}"!`)
    }

    try {
      const res = await fetch(`/api/events/${activeEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedServices: updatedServices })
      })
      const updated = await res.json()
      setActiveEvent(updated)
    } catch (err) {
      console.error('Error updating event:', err)
      toast.error('Failed to update event')
    }
  }

  // Update Active Event details
  const handleUpdateEvent = async (updatedEvent) => {
    if (!updatedEvent) return
    setActiveEvent(updatedEvent)
    if (updatedEvent.id && !String(updatedEvent.id).startsWith('evt_draft_')) {
      try {
        const res = await fetch(`/api/events/${updatedEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEvent)
        })
        if (res.ok) {
          const saved = await res.json()
          setActiveEvent(saved)
        }
      } catch (err) {
        console.error('Failed to sync event updates:', err)
      }
    }
  }

  // Remove Service from Active Event
  const handleRemoveServiceFromEvent = async (category) => {
    if (!activeEvent) return
    const updatedServices = activeEvent.selectedServices.filter(s => s.category !== category)
    try {
      const res = await fetch(`/api/events/${activeEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedServices: updatedServices })
      })
      const updated = await res.json()
      setActiveEvent(updated)
      toast.info('Service removed from event')
    } catch (err) {
      toast.error('Failed to remove service')
    }
  }

  // Live Event Budget Metrics
  const budgetMetrics = useMemo(() => {
    if (!activeEvent) return { total: 0, totalSelected: 0, maxBudget: 350000, remaining: 350000, percentage: 0, isOver: false, count: 0 }
    const totalSelected = (activeEvent.selectedServices || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0)
    const maxBudget = Number(activeEvent.budget) || 350000
    const remaining = maxBudget - totalSelected
    const percentage = Math.min(100, Math.round((totalSelected / maxBudget) * 100))
    const isOver = totalSelected > maxBudget
    const count = activeEvent.selectedServices?.length || 0

    return { total: totalSelected, totalSelected, maxBudget, remaining, percentage, isOver, count }
  }, [activeEvent])

  // Featured Creators for Editorial Showcase
  const featuredCreators = useMemo(() => {
    return vendors.slice(0, 8)
  }, [vendors])

  // Apply Hero Search to Start Planning
  const handleHeroStartPlanning = async () => {
    try {
      const newEventObj = {
        name: `${heroSearch.eventType} Celebration in ${heroSearch.city}`,
        eventType: heroSearch.eventType,
        date: heroSearch.date,
        city: heroSearch.city,
        guestCount: Number(heroSearch.guests) || 200,
        budget: Number(heroSearch.budget) || 500000,
        selectedServices: []
      }

      // For anonymous visitors, jump straight into the builder with a local
      // draft event; POST /api/events requires auth (JWT). We keep the
      // homepage flow smooth and only persist for signed-in users.
      if (!currentUser?.id) {
        const draft = { ...newEventObj, id: `evt_draft_${Date.now()}`, status: 'draft' }
        setActiveEvent(draft)
        setSelectedCity(heroSearch.city)
        setActiveTab('builder')
        toast.info('Sign in to save your event plan and get vendor recommendations.')
        return
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEventObj)
      })
      if (!res.ok) throw new Error('Could not create event')
      const created = await res.json()
      setActiveEvent(created)
      setSelectedCity(heroSearch.city)
      setActiveTab('builder')
      toast.success(`Event created! Let's choose your dream vendors for ${heroSearch.city}.`)
    } catch (err) {
      toast.error('Could not initialize event')
    }
  }

  // Open Customizer for Pre-Built Package
  const handleOpenPackageCustomizer = (pkg) => {
    setCustomizingPackage(pkg)
    setPackageCustomItems([...pkg.items])
    setSwappingCategory(null)
  }

  // Swap vendor inside pre-built package
  const handleSwapPackageVendor = (category, newVendor) => {
    const pkg = newVendor.packages?.[0] || { name: 'Standard Package', price: newVendor.startingPrice }
    const updated = packageCustomItems.map(item => {
      if (item.category === category) {
        return {
          category,
          vendorId: newVendor.id,
          vendorName: newVendor.name,
          packageName: pkg.name,
          price: pkg.price
        }
      }
      return item
    })
    setPackageCustomItems(updated)
    setSwappingCategory(null)
    toast.success(`Swapped ${category} vendor to ${newVendor.name}`)
  }

  // Apply Customized Package into Active Event
  const handleApplyCustomizedPackageToEvent = async () => {
    if (!activeEvent) {
      toast.error('Please create or select an event in "My Event" first')
      return
    }

    const newServices = packageCustomItems.map(item => {
      const originalVendor = vendors.find(v => v.id === item.vendorId)
      return {
        category: item.category,
        categoryName: originalVendor?.categoryName || item.category,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        packageId: `pkg_${item.vendorId}`,
        packageName: item.packageName,
        price: item.price,
        date: activeEvent.date,
        timeSlot: 'Full Day Setup',
        image: originalVendor?.image || 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'
      }
    })

    try {
      const res = await fetch(`/api/events/${activeEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedServices: newServices })
      })
      const updated = await res.json()
      setActiveEvent(updated)
      setCustomizingPackage(null)
      setActiveTab('builder')
      toast.success(`Applied ${newServices.length} bundle vendors into "${activeEvent.name}"!`)
    } catch (err) {
      toast.error('Could not apply bundle to event')
    }
  }

  // Handle Promo Code application
  const handleApplyPromoCode = () => {
    if (bookingDetails.promoCode.trim().toUpperCase() === 'ROYAL2026' || bookingDetails.promoCode.trim().toUpperCase() === 'UTSAV10') {
      setBookingDetails(prev => ({ ...prev, discount: 15000 }))
      toast.success('🎉 Promo Code Applied! Flat ₹15,000 Discount added!')
    } else {
      toast.error('Invalid or expired coupon code. Try "ROYAL2026"')
    }
  }

  // Open Booking Modal for Active Event
  const handleInitiateBookingFromEvent = () => {
    setBookingStep(1)
    setIsBookingModalOpen(true)
  }

  // Complete Booking Flow Submission
  const handleCompleteBooking = async () => {
    if (!activeEvent || !activeEvent.selectedServices?.length) {
      toast.error('No services selected to book!')
      return
    }
    if (!currentUser?.id) {
      toast.info('Please sign in to complete your booking')
      setAuthMode('login')
      setAuthModalOpen(true)
      return
    }

    const subtotal = activeEvent.selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0)
    const tax = Math.round(subtotal * 0.18)
    const platformFee = 2500
    const discount = bookingDetails.discount || 0
    const totalAmount = Math.max(0, subtotal + tax + platformFee - discount)
    const payableAmount = bookingDetails.isAdvanceOnly ? Math.round(totalAmount * 0.25) : totalAmount

    // Validate UTR if paying via Admin UPI / QR or Bank Transfer
    const isUpiPayment = bookingDetails.paymentMethod === 'upi' || paymentConfig.activeMode === 'CUSTOM_UPI_QR'
    if (isUpiPayment && paymentConfig.upi?.requireUtr) {
      if (!customerUtr.trim() || customerUtr.trim().length < 6) {
        toast.error('Please enter your 12-digit UPI UTR / Transaction Reference Number from your payment receipt.')
        return
      }
    }

    const payload = {
      userName: bookingDetails.name,
      userEmail: bookingDetails.email,
      userPhone: bookingDetails.phone,
      eventId: activeEvent.id,
      eventName: bookingDetails.eventName || activeEvent.name,
      eventDate: bookingDetails.eventDate || activeEvent.date,
      city: bookingDetails.city || activeEvent.city,
      guestCount: bookingDetails.guestCount || activeEvent.guestCount,
      items: activeEvent.selectedServices,
      subtotal,
      tax,
      platformFee,
      discount,
      totalAmount,
      advancePaid: payableAmount,
      isAdvanceOnly: bookingDetails.isAdvanceOnly,
      paymentMethod: isUpiPayment
        ? `Direct Admin UPI QR (${paymentConfig.upi?.upiId || 'vowsandvenues@icici'})`
        : (paymentConfig.activeMode === 'BANK_NEFT_RTGS' ? 'Bank Escrow NEFT/RTGS Wire' : `${paymentConfig.gateway?.provider?.toUpperCase() || 'Razorpay'} Gateway`),
      paymentDetails: {
        mode: paymentConfig.activeMode,
        utr: customerUtr.trim() || null,
        payeeUpi: paymentConfig.upi?.upiId,
        gatewayProvider: paymentConfig.gateway?.provider
      },
      specialInstructions: bookingDetails.specialInstructions
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      setConfirmedBookingResult(result)
      setBookingStep(7) // Go to confirmation step
      
      // Log transaction in Admin's Payment Verification Queue
      const newTx = {
        id: `tx_pay_${Date.now()}`,
        bookingId: result.bookingNumber || `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: bookingDetails.name || 'Wedding Couple',
        clientPhone: bookingDetails.phone || '+919876543210',
        amount: payableAmount,
        method: isUpiPayment ? 'CUSTOM_UPI_QR' : (paymentConfig.activeMode === 'BANK_NEFT_RTGS' ? 'BANK_NEFT_RTGS' : 'PAYMENT_GATEWAY'),
        payeeUpi: paymentConfig.upi?.upiId || 'vowsandvenues@icici',
        utr: customerUtr.trim() || (isUpiPayment ? '429188291042' : `RZP-${Math.floor(1000000000 + Math.random() * 9000000000)}`),
        date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: isUpiPayment ? 'PENDING_VERIFICATION' : 'VERIFIED',
        notes: customerReceiptNotes || `Advance payment for ${bookingDetails.eventName || 'Wedding celebration'}`
      }
      try {
        const storedTxs = JSON.parse(localStorage.getItem('vv_payment_transactions') || '[]')
        localStorage.setItem('vv_payment_transactions', JSON.stringify([newTx, ...storedTxs]))
      } catch (_) {}

      // Refresh bookings list
      const updatedBkg = await fetch('/api/bookings').then(r => r.json())
      setUserBookings(updatedBkg)
      
      // Refresh notifications
      const updatedNotifs = await fetch('/api/notifications').then(r => r.json())
      setNotifications(updatedNotifs)
      
      toast.success('🎉 Event Successfully Booked! Booking Confirmation Sent.')
    } catch (err) {
      console.error('Booking failed:', err)
      toast.error('Booking failed. Please check network.')
    }
  }

  // Submit Inquiry to Vendor
  const handleSubmitInquiry = async (e) => {
    e.preventDefault()
    if (!inquiryModalVendor) return
    if (!currentUser?.id) {
      toast.info('Please sign in to send an inquiry to this vendor')
      setAuthMode('login')
      setAuthModalOpen(true)
      return
    }

    try {
      const payload = {
        vendorId: inquiryModalVendor.id,
        vendorName: inquiryModalVendor.name,
        userName: inquiryFormData.name || currentUser?.name || 'Interested Customer',
        userPhone: inquiryFormData.phone || '+91 98765 43210',
        userEmail: inquiryFormData.email || currentUser?.email || 'customer@example.com',
        eventType: 'Wedding & Reception',
        eventDate: inquiryFormData.date || activeEvent?.date || '2026-12-15',
        guestCount: inquiryFormData.guests || '250',
        message: inquiryFormData.message || `Hi ${inquiryModalVendor.name}, I want to inquire for our event in ${inquiryModalVendor.city}.`
      }

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to send inquiry')

      toast.success(`Inquiry sent to ${inquiryModalVendor.name}! Vendor will respond within ${inquiryModalVendor.responseTime || '1 hour'}.`)
      setInquiryModalVendor(null)
      setInquiryFormData({ name: '', phone: '', email: '', date: '', guests: '', message: '' })
    } catch (err) {
      toast.error('Failed to send inquiry')
    }
  }

  // Submit Vendor Review
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewModalVendor || !reviewComment.trim()) return
    if (!currentUser?.id) {
      toast.info('Please sign in to post a review')
      setAuthMode('login')
      setAuthModalOpen(true)
      return
    }

    try {
      const payload = {
        vendorId: reviewModalVendor.id,
        vendorName: reviewModalVendor.name,
        userName: currentUser?.name || 'Verified Client',
        userCity: 'India',
        rating: reviewRating,
        eventType: reviewEventType,
        comment: reviewComment,
        verifiedBooking: true
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success(`Thank you! Review published for ${reviewModalVendor.name}.`)
        setReviewModalVendor(null)
        setReviewComment('')
        // Refresh vendors
        fetchFilteredVendors()
      }
    } catch (err) {
      toast.error('Failed to post review')
    }
  }

  // Toggle Compare Vendor
  const handleToggleCompare = (vendorId, e) => {
    if (e) e.stopPropagation()
    if (compareVendorIds.includes(vendorId)) {
      setCompareVendorIds(compareVendorIds.filter(id => id !== vendorId))
    } else {
      if (compareVendorIds.length >= 3) {
        toast.info('You can compare up to 3 vendors at once')
        return
      }
      setCompareVendorIds([...compareVendorIds, vendorId])
      toast.info('Vendor added to comparison table')
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col antialiased">
      {/* EDITORIAL TOP NAVIGATION & ANNOUNCEMENT BAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        selectedCity={selectedCity}
        setSelectedCity={(c) => {
          setSelectedCity(c)
          setFilterCity(c === 'All Cities' ? 'all' : c)
        }}
        cities={CITIES}
        wishlistCount={wishlistIds.length}
        notifications={notifications}
        budgetCount={budgetMetrics.count}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthMode(mode)
          setAuthModalOpen(true)
        }}
        onLogout={handleLogout}
        announcement={cmsContent?.announcement}
      />

      {/* VIEW RENDERER BASED ON activeTab */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* ======================================================== */}
        {/* 1. HOME VIEW */}
        {/* ======================================================== */}
        {activeTab === 'home' && (
          <div>
            {/* HERO SECTION */}
            <HeroSection
              cmsContent={cmsContent}
              heroSearch={heroSearch}
              setHeroSearch={setHeroSearch}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              eventTypes={EVENT_TYPES}
              cities={CITIES}
              onExploreVendors={() => {
                if (heroSearch.city && heroSearch.city !== 'All Cities') {
                  setFilterCity(heroSearch.city)
                }
                if (heroSearch.eventType) {
                  setFilterSearch(heroSearch.eventType)
                }
                setActiveTab('explore')
              }}
              onStartPlanning={() => {
                if (heroSearch.eventType || heroSearch.city) {
                  handleUpdateEvent({
                    ...activeEvent,
                    eventType: heroSearch.eventType || activeEvent.eventType,
                    city: heroSearch.city || activeEvent.city,
                    guestCount: Number(heroSearch.guests) || activeEvent.guestCount,
                    budget: Number(heroSearch.budget) || activeEvent.budget,
                    date: heroSearch.date || activeEvent.date
                  })
                }
                setActiveTab('builder')
              }}
            />

            {/* SCENE II · ROYAL VENUE REVEAL (Interactive 3D Perspective Palace Showcase) */}
            <RoyalVenueRevealSection
              onCheckAvailability={() => {
                setFilterCategory('venues')
                setActiveTab('explore')
              }}
              onExploreVenues={() => {
                setFilterCategory('venues')
                setActiveTab('explore')
              }}
              onSelectVenue={(v) => {
                const found = vendors.find(item => item.id === v?.id || item.name?.toLowerCase().includes('rambagh'))
                if (found) {
                  setSelectedVendorModal(found)
                } else {
                  setFilterCategory('venues')
                  setActiveTab('explore')
                }
              }}
            />

            {/* TOP 3D SLIDING IMAGE GALLERY (Signature Luxury Showcases) */}
            <ScrollReveal animation="zoom-in" duration={0.85}>
              <TopSlidingImageGallery
                slides={cmsContent?.gallerySlides}
                onExploreCategory={(cat) => {
                  setFilterCategory(cat)
                  setActiveTab('explore')
                }}
                onSelectCity={(c) => {
                  setSelectedCity(c)
                  setFilterCity(c)
                  setActiveTab('explore')
                }}
              />
            </ScrollReveal>

            {/* 11 EDITORIAL CRAFT CATEGORIES (4:5 Portrait Photography Cards) */}
            <EditorialCategories
              categories={categories}
              cmsContent={cmsContent}
              onSelectCategory={(slug) => {
                setFilterCategory(slug)
                setActiveTab('explore')
              }}
            />

            {/* EDITORIAL FEATURED PALACES & SANCTUARIES (1 Grand Hero Palace + 3 Complementary) */}
            <FeaturedVenuesEditorial
              vendors={vendors}
              wishlistIds={wishlistIds}
              onToggleFavorite={handleToggleWishlist}
              onSelectVendor={(v) => setSelectedVendorModal(v)}
              onAddToEvent={(v) => handleAddVendorToEvent(v)}
              onNegotiate={(v) => handleOpenNegotiation(v)}
              onViewAll={() => {
                setFilterCategory('venues')
                setActiveTab('explore')
              }}
            />

            {/* CURATED CELEBRATION OFFERS & PRIVILEGES */}
            <ScrollReveal animation="fade-up" duration={0.75}>
              <CuratedOffers
                offers={cmsContent?.offers || []}
                onSelectOffer={(code) => {
                  setBookingDetails(prev => ({ ...prev, promoCode: code }))
                  toast.success(`Applied ${code} to your event booking!`)
                }}
              />
            </ScrollReveal>

            {/* CURATED ALL-INCLUSIVE CELEBRATION PACKAGES */}
            <CuratedPackagesSection
              packages={packages}
              onSelectPackage={(pkg) => handleOpenPackageCustomizer(pkg)}
              onCustomizePackage={(pkg) => handleOpenPackageCustomizer(pkg)}
              onBookPackage={(pkg) => handleOpenPackageCustomizer(pkg)}
            />

            {/* THE WEDDING GAZETTE · INSPIRATION MASONRY GALLERY */}
            <WeddingInspirationGallery
              onExploreCategory={(cat) => {
                const slugMap = {
                  'Palaces & Forts': 'venues',
                  'Mandaps & Florals': 'decor',
                  'Catering & Feasts': 'catering',
                  'Couture & Details': 'outfits'
                }
                const slug = slugMap[cat] || 'all'
                setFilterCategory(slug)
                setActiveTab('explore')
              }}
            />

            {/* FEATURED SIGNATURE CREATORS & VENUES (Full Directory Preview) */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                <div>
                  <ScrollReveal animation="fade-down" delay={0.05}>
                    <div className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#4a1525] mb-2">
                      Curated Excellence
                    </div>
                  </ScrollReveal>

                  <TextLineReveal
                    lines={[
                      'Featured Event Creators',
                      '& Venues.'
                    ]}
                    className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1917]"
                    lineClassName="first:text-stone-900 last:italic last:font-normal last:text-[#4a1525]"
                    stagger={0.12}
                  />

                  <ScrollReveal animation="fade-up" delay={0.2}>
                    <p className="text-xs text-[#78716c] mt-2">
                      Top-rated verified partners across {selectedCity === 'All Cities' ? 'Pan-India' : selectedCity} with verified reviews.
                    </p>
                  </ScrollReveal>
                </div>

                <ScrollReveal animation="fade-left" delay={0.25}>
                  <button
                    onClick={() => {
                      setFilterCategory('all')
                      setActiveTab('explore')
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4a1525] hover:text-[#2d0c16] underline underline-offset-4 cursor-pointer mt-3 sm:mt-0"
                  >
                    View Full Directory ({vendors.length}) &rarr;
                  </button>
                </ScrollReveal>
              </div>

              <ScrollStaggerContainer staggerDelay={0.07} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredCreators.map((vendor) => (
                  <ScrollStaggerItem key={vendor.id} yOffset={25}>
                    <VendorCard
                      vendor={vendor}
                      isFavorite={wishlistIds.includes(vendor.id)}
                      onToggleFavorite={handleToggleWishlist}
                      onSelectVendor={(v) => setSelectedVendorModal(v)}
                      onAddToEvent={(v) => handleAddVendorToEvent(v)}
                      onNegotiate={(v) => handleOpenNegotiation(v)}
                    />
                  </ScrollStaggerItem>
                ))}
              </ScrollStaggerContainer>
            </section>

            {/* TRUST, SAFETY & PLATFORM CONFIDENCE */}
            <TrustAndConfidenceSection />

            {/* REAL CELEBRATIONS & EDITORIAL MEMOIRS — SLIDING INDIAN REVIEWS */}
            <SlidingReviewsSection />

            {/* FREQUENTLY ASKED QUESTIONS */}
            {cmsContent?.faqs?.length > 0 && (
              <ScrollReveal animation="fade-up" duration={0.8}>
                <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#e8e2d5]">
                  <div className="text-center mb-10">
                    <ScrollReveal animation="fade-down" delay={0.05}>
                      <div className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#4a1525] mb-2">
                        Questions &amp; Guidance
                      </div>
                    </ScrollReveal>

                    <TextLineReveal
                      lines={[
                        'Frequently Asked',
                        'Questions.'
                      ]}
                      className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1917]"
                      lineClassName="first:text-stone-900 last:italic last:font-normal last:text-[#4a1525]"
                      stagger={0.12}
                    />
                  </div>

                  <div className="space-y-4">
                    {cmsContent.faqs.map((faq, i) => (
                      <details
                        key={i}
                        className="group bg-gradient-to-br from-[#fffdfa] via-[#fcf8f0] to-[#f8f1e3] rounded-2xl border-2 border-amber-200/80 hover:border-amber-400 p-5 shadow-xs transition-all [&_summary::-webkit-details-marker]:hidden"
                      >
                        <summary className="flex items-center justify-between font-serif font-bold text-base text-[#1c1917] cursor-pointer">
                          <span>{faq.q}</span>
                          <ChevronDown className="w-4 h-4 text-[#78716c] group-open:rotate-180 transition-transform" />
                        </summary>
                        <p className="mt-3 text-xs text-stone-700 leading-relaxed font-medium">
                          {faq.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* VIP CONCIERGE BANNER WITH 4K ROYAL PALACE BACKDROP */}
            <ScrollReveal animation="zoom-in" duration={0.85}>
              <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="card-3d-wrap relative rounded-3xl p-8 sm:p-12 text-white overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_20px_50px_rgba(74,21,37,0.25)] border-2 border-amber-400/60">
                  {/* 4K Palace Background Photo */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80')` }}
                  />
                  {/* Royal Wine & Emerald Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#20050d]/95 via-[#3b0d1b]/85 to-[#0b1611]/80" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

                  <div className="space-y-3 max-w-xl relative z-10">
                    <span className="bg-gradient-to-r from-amber-300 to-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm inline-flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-stone-900" />
                      <span>VIP Wedding Concierge</span>
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#faf8f5]">
                      Need Bespoke Assistance for a Destination Celebration?
                    </h3>
                    <p className="text-xs sm:text-sm text-[#f5ebd7]/85 leading-relaxed font-light">
                      Our luxury event specialists offer complimentary one-on-one consultation, custom palace sourcing, and consolidated vendor contracts.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setActiveTab('builder')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="btn-3d-gold px-7 py-3.5 bg-gradient-to-r from-[#e6ca65] via-[#ffd700] to-[#c5a059] hover:brightness-110 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer text-center"
                    >
                      Start Event Architect
                    </button>
                    <a
                      href="tel:+919876543210"
                      className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-amber-300/30 text-center hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Call Concierge Desk
                    </a>
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </div>
        )}

        {/* 2. EXPLORE MARKETPLACE / VENDOR DISCOVERY VIEW */}
        {/* ======================================================== */}
        {activeTab === 'explore' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="text-xs uppercase font-bold tracking-widest text-emerald-800 mb-1">
                  Verified Indian Event Marketplace
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950">
                  Find the Perfect Vendors for Your Event
                </h1>
                <p className="text-stone-600 text-sm mt-1">
                  Showing {vendors.length} curated masters across {selectedCity === 'All Cities' ? 'Pan-India' : selectedCity}
                </p>
              </div>

              {/* Global Search Input Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 'Awadhi', 'Mandap', 'Lehenga'..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchFilteredVendors(); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-gradient-to-r from-[#fffdfa] to-[#fbf6ec] border-2 border-amber-300/90 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                />
              </div>
            </div>

            {/* Category Quick Chips Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filterCategory === 'all' ? 'bg-[#4a1525] text-amber-200 shadow-sm' : 'bg-gradient-to-r from-amber-50 to-amber-100/80 border border-amber-300 text-stone-800 hover:bg-amber-200'}`}
              >
                All Categories ({vendors.length})
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(c.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filterCategory === c.slug ? 'bg-[#4a1525] text-amber-200 shadow-sm' : 'bg-gradient-to-r from-amber-50 to-amber-100/80 border border-amber-300 text-stone-800 hover:bg-amber-200'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Layout: Filters Sidebar + Vendor Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* SIDEBAR FILTERS (Desktop) */}
              <div className="hidden lg:block space-y-6 bg-gradient-to-br from-[#fffdfa] via-[#fcf8f0] to-[#f8f1e3] p-6 rounded-3xl border-2 border-amber-300/80 shadow-md h-fit sticky top-28">
                <div className="flex items-center justify-between pb-4 border-b border-amber-200/80">
                  <h3 className="font-serif font-bold text-base text-[#4a1525] flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-700" /> Filter Vendors
                  </h3>
                  <button
                    onClick={() => {
                      setFilterCategory('all')
                      setFilterCity('all')
                      setFilterSearch('')
                      setFilterMinRating('')
                      setFilterVerified(false)
                      setFilterMaxPrice(300000)
                      setFilterSortBy('recommended')
                    }}
                    className="text-xs text-amber-800 hover:text-[#4a1525] font-semibold underline"
                  >
                    Reset All
                  </button>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-2">Location / City</label>
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full bg-amber-50/80 border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Indian Cities</option>
                    {CITIES.filter(c => c !== 'All Cities').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-2">
                    <span>Max Starting Budget</span>
                    <span className="text-emerald-900">₹{filterMaxPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="300000"
                    step="5000"
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(Number(e.target.value))}
                    className="w-full accent-emerald-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                    <span>₹500</span>
                    <span>₹3,00,000+</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-2">Customer Rating</label>
                  <div className="space-y-1.5">
                    {[
                      { val: '', label: 'All Ratings' },
                      { val: '4.9', label: '★ 4.9 & above (Exceptional)' },
                      { val: '4.8', label: '★ 4.8 & above (Top Rated)' },
                      { val: '4.5', label: '★ 4.5 & above' }
                    ].map(r => (
                      <label key={r.val} className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="radio"
                          name="ratingFilter"
                          checked={filterMinRating === r.val}
                          onChange={() => setFilterMinRating(r.val)}
                          className="accent-emerald-900"
                        />
                        <span>{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verified Only Toggle */}
                <div className="pt-2 border-t border-stone-100">
                  <label className="flex items-center justify-between text-xs font-bold text-stone-800 cursor-pointer">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      Verified Vendors Only
                    </span>
                    <input
                      type="checkbox"
                      checked={filterVerified}
                      onChange={(e) => setFilterVerified(e.target.checked)}
                      className="accent-emerald-900 w-4 h-4 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* Sort By */}
                <div className="pt-2 border-t border-stone-100">
                  <label className="block text-xs font-bold text-stone-800 mb-2">Sort Results</label>
                  <select
                    value={filterSortBy}
                    onChange={(e) => setFilterSortBy(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none cursor-pointer"
                  >
                    <option value="recommended">Recommended &amp; Featured</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular (Reviews)</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* VENDOR CARDS GRID */}
              <div className="lg:col-span-3 space-y-6">
                {vendors.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
                    <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="font-serif text-xl font-bold text-stone-800">No vendors found</h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Try relaxing your filter criteria or reset search filters to explore other verified Indian wedding vendors.
                    </p>
                    <button
                      onClick={() => {
                        setFilterCategory('all')
                        setFilterCity('all')
                        setFilterSearch('')
                        setFilterMinRating('')
                        setFilterMaxPrice(300000)
                      }}
                      className="mt-4 px-4 py-2 bg-emerald-900 text-amber-200 rounded-xl text-xs font-semibold"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((vendor) => {
                      const isWishlisted = wishlistIds.includes(vendor.id)
                      const isAddedToEvent = activeEvent?.selectedServices?.some(s => s.vendorId === vendor.id)
                      const isCompared = compareVendorIds.includes(vendor.id)

                      return (
                        <div
                          key={vendor.id}
                          onClick={() => setSelectedVendorModal(vendor)}
                          className="card-3d-wrap group bg-white rounded-3xl border border-[#e8e2d5] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_45px_rgba(74,21,37,0.15)] hover:border-amber-400/80 transition-all duration-500 hover:-translate-y-2 flex flex-col cursor-pointer relative"
                        >
                          {/* Top gold accent line */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                          {/* Image Container */}
                          <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                            <img
                              src={getOptimizedImageUrl(vendor.image, { width: 600, quality: 75 })}
                              alt={vendor.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                            {/* Verified & Featured Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                              {vendor.verified && (
                                <span className="bg-emerald-900/90 backdrop-blur-md text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-emerald-400/30">
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                                </span>
                              )}
                              {vendor.featured && (
                                <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-amber-300/40">
                                  Featured
                                </span>
                              )}
                            </div>

                            {/* Wishlist Heart Button */}
                            <button
                              onClick={(e) => handleToggleWishlist(vendor.id, e)}
                              title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                              className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-md text-stone-700 hover:text-rose-600 shadow-md hover:scale-110 active:scale-90 transition-all z-10"
                            >
                              <Heart className={`w-4 h-4 transition-transform ${isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                            </button>

                            {/* Category Tag & City */}
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
                              <span className="bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-200 border border-amber-300/30">
                                {vendor.categoryName}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] font-semibold drop-shadow bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                <MapPin className="w-3 h-3 text-amber-300" /> {vendor.city}
                              </span>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              {/* Rating & Reviews */}
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <div className="flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                  <span>{vendor.rating}</span>
                                </div>
                                <span className="text-stone-500 text-[11px] font-medium">
                                  {vendor.reviewCount} verified reviews
                                </span>
                              </div>

                              {/* Vendor Title */}
                              <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug group-hover:text-[#4a1525] transition-colors line-clamp-1 mb-1">
                                {vendor.name}
                              </h3>

                              {/* Short Description */}
                              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                                {vendor.description}
                              </p>

                              {/* Highlights / Tags */}
                              <div className="flex flex-wrap gap-1 mb-4">
                                {vendor.highlights?.slice(0, 2).map((h, i) => (
                                  <span key={i} className="text-[10px] bg-[#faf8f5] hover:bg-amber-50 text-stone-600 px-2 py-0.5 rounded-md border border-[#e8e2d5] transition-colors">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Price & Action Buttons */}
                            <div className="pt-3 border-t border-[#f2ede4]">
                              <div className="flex items-baseline justify-between mb-3">
                                <div>
                                  <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Starting from</div>
                                  <div className="font-serif text-lg font-bold text-emerald-950">
                                    ₹{vendor.startingPrice?.toLocaleString('en-IN')}
                                    <span className="text-[11px] font-sans font-normal text-stone-500 ml-1">
                                      /{vendor.priceUnit}
                                    </span>
                                  </div>
                                </div>
                                {vendor.capacity && (
                                  <div className="text-[10px] font-medium text-stone-600 flex items-center gap-1 bg-[#faf8f5] px-2 py-0.5 rounded-full border border-stone-200">
                                    <Users className="w-3 h-3 text-[#4a1525]" /> {vendor.capacity} guests
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-3 gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenNegotiation(vendor)
                                  }}
                                  className="py-2 px-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/25 hover:from-amber-500/30 hover:to-amber-600/40 text-amber-950 font-bold text-[11px] transition-all text-center border border-amber-400/60 hover:shadow-xs flex items-center justify-center gap-1"
                                  title="Think price is high? Negotiate live with Admin"
                                >
                                  <MessageSquare className="w-3 h-3 text-amber-700" />
                                  <span>Negotiate</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedVendorModal(vendor)
                                  }}
                                  className="py-2 px-2 rounded-xl bg-[#f2ede4] hover:bg-[#eae3d7] text-stone-900 font-bold text-xs transition-all text-center border border-[#dfd7c8] hover:shadow-xs"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={(e) => handleAddVendorToEvent(vendor, null, e)}
                                  className={`btn-3d-wine py-2 px-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-md hover:scale-105 active:scale-95 ${isAddedToEvent ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-gradient-to-r from-[#4a1525] to-[#6b1e34] hover:from-[#3a101d] hover:to-[#561729] text-[#f5ebd7]'}`}
                                >
                                  {isAddedToEvent ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" /> Added
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5" /> Add
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. CATEGORIES DIRECTORY VIEW */}
        {/* ======================================================== */}
        {activeTab === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-800">
                11 Master Categories
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950 mt-1">
                Explore Event Services by Category
              </h1>
              <p className="text-stone-600 text-sm mt-2">
                Every service you need for traditional, destination, or modern Indian celebrations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const IconComp = CATEGORY_ICON_MAP[cat.slug] || Sparkles
                const countForCat = vendors.filter(v => v.category === cat.slug).length

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setFilterCategory(cat.slug)
                      setActiveTab('explore')
                    }}
                    className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={getOptimizedImageUrl(cat.image, { width: 600, quality: 75 })}
                        alt={cat.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute top-4 left-4 bg-white text-emerald-950 p-2.5 rounded-2xl shadow-md">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="absolute top-4 right-4 bg-amber-400 text-emerald-950 text-xs font-bold px-2.5 py-1 rounded-full shadow">
                        {countForCat} Verified Vendors
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="text-xs text-amber-300 font-semibold">
                          From ₹{cat.startingPrice?.toLocaleString('en-IN')} {cat.unit}
                        </div>
                        <h3 className="font-serif text-2xl font-bold">{cat.name}</h3>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-stone-600 leading-relaxed mb-4">
                        {cat.description}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setFilterCategory(cat.slug)
                          setActiveTab('explore')
                        }}
                        className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-emerald-900 hover:text-amber-200 text-emerald-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Browse {cat.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. READY PACKAGES DIRECTORY VIEW */}
        {/* ======================================================== */}
        {activeTab === 'packages' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-800">
                Modular All-in-One Bundles
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950 mt-1">
                Curated Celebration Packages
              </h1>
              <p className="text-stone-600 text-sm mt-2">
                Handpicked bundles with vetted banquets, royal catering, and bridal stylists. Fully customizable with 1-click vendor swapping!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`card-3d-wrap group bg-white rounded-3xl border overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_45px_rgba(74,21,37,0.16)] transition-all duration-500 hover:-translate-y-2 flex flex-col relative ${pkg.popular ? 'border-amber-400/80 ring-2 ring-amber-400/30' : 'border-[#e8e2d5]'}`}
                >
                  {/* Top gold accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4a1525] via-amber-400 to-[#4a1525] opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={getOptimizedImageUrl(pkg.bannerImage, { width: 800, quality: 75 })}
                      alt={pkg.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-amber-300/40 z-10">
                      {pkg.badge}
                    </div>
                    <div className="absolute bottom-4 left-5 right-5 text-white z-10">
                      <div className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-0.5">{pkg.eventType} Tier</div>
                      <h3 className="font-serif text-2xl font-bold text-[#faf8f5]">{pkg.title}</h3>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-stone-600 mb-4 leading-relaxed">{pkg.subtitle}</p>

                      <div className="text-xs font-bold text-stone-900 mb-2">Included Service Tiers:</div>
                      <div className="space-y-2 mb-6">
                        {pkg.items?.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between text-xs bg-[#faf8f5] hover:bg-amber-50/50 p-2.5 rounded-xl border border-stone-200/70 transition-colors">
                            <div>
                              <div className="font-bold text-[#1c1917] capitalize">{item.category}</div>
                              <div className="text-[11px] text-stone-500 font-medium">{item.vendorName}</div>
                            </div>
                            <div className="font-serif font-bold text-emerald-950">
                              ₹{item.price?.toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#f2ede4]">
                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <span className="text-xs text-stone-400 line-through mr-2">
                            ₹{pkg.originalPrice?.toLocaleString('en-IN')}
                          </span>
                          <span className="font-serif text-2xl font-bold text-emerald-950">
                            ₹{pkg.price?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                          Save ₹{(pkg.originalPrice - pkg.price)?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenPackageCustomizer(pkg)}
                          className="py-3 px-3 rounded-xl bg-[#f2ede4] hover:bg-[#eae3d7] text-stone-900 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-[#dfd7c8] hover:shadow-xs"
                        >
                          <Sliders className="w-3.5 h-3.5" /> Customize
                        </button>
                        <button
                          onClick={() => {
                            handleOpenPackageCustomizer(pkg)
                            handleApplyCustomizedPackageToEvent()
                          }}
                          className="btn-3d-wine py-3 px-3 rounded-xl bg-gradient-to-r from-[#4a1525] to-[#6d1f35] hover:from-[#3a101d] hover:to-[#59182a] text-[#f5ebd7] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-300" /> Apply Bundle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. "BUILD YOUR EVENT" INTERACTIVE DASHBOARD (CORE FEATURE) */}
        {/* ======================================================== */}
        {activeTab === 'builder' && (
          <EventBuilderWorkspace
            activeEvent={activeEvent}
            categories={categories}
            budgetMetrics={budgetMetrics}
            onUpdateEvent={handleUpdateEvent}
            onRemoveService={handleRemoveServiceFromEvent}
            onOpenSwapModal={(catSlug) => setSwappingCategory(catSlug)}
            onOpenQuotationModal={() => setShowQuotationModal(true)}
            onProceedToBooking={handleInitiateBookingFromEvent}
          />
        )}

        {/* ======================================================== */}
        {/* 5B. COUPLE WEDDING TOOLKIT (BUDGET PLANNER & RSVP MANAGER) */}
        {/* ======================================================== */}
        {activeTab === 'planning_toolkit' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ErrorBoundary fallbackTitle="Couple Wedding Toolkit">
              <CoupleWeddingToolkit />
            </ErrorBoundary>
          </div>
        )}

        {/* 6. WISHLIST & SAVED VENDORS VIEW */}
        {/* ======================================================== */}
        {activeTab === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="text-xs uppercase font-bold tracking-widest text-emerald-800 mb-1">
                  Saved Collections
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950">
                  Your Saved Vendors ({wishlistVendors.length})
                </h1>
                <p className="text-stone-600 text-sm mt-1">
                  Compare shortlisted vendors side-by-side or add them straight to your active celebration plan.
                </p>
              </div>

              {wishlistVendors.length >= 2 && (
                <button
                  onClick={() => {
                    setCompareVendorIds(wishlistVendors.slice(0, 3).map(v => v.id))
                    setIsCompareModalOpen(true)
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-900 text-amber-200 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 hover:bg-emerald-950"
                >
                  <Scale className="w-4 h-4 text-amber-300" /> Compare Shortlisted Vendors
                </button>
              )}
            </div>

            {wishlistVendors.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-stone-800">Your wishlist is empty</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Click the heart icon on any venue, caterer, or photographer card to save and compare them here.
                </p>
                <button
                  onClick={() => { setFilterCategory('all'); setActiveTab('explore'); }}
                  className="mt-4 px-5 py-2.5 bg-emerald-900 text-amber-200 rounded-xl text-xs font-semibold"
                >
                  Explore Vendors
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    onClick={() => setSelectedVendorModal(vendor)}
                    className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col group"
                  >
                    <div className="relative h-48 w-full bg-stone-100">
                      <img
                        src={getOptimizedImageUrl(vendor.image, { width: 600, quality: 75 })}
                        alt={vendor.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-600 shadow">
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      </div>
                      <div className="absolute bottom-3 left-3 text-white">
                        <span className="bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {vendor.categoryName} • {vendor.city}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-amber-600 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500" /> {vendor.rating}
                          </span>
                          <span className="text-stone-400">{vendor.reviewCount} reviews</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-emerald-950 mb-2">{vendor.name}</h3>
                        <p className="text-xs text-stone-500 line-clamp-2">{vendor.description}</p>
                      </div>

                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-4">
                        <div className="font-serif font-bold text-emerald-950 text-base">
                          ₹{vendor.startingPrice?.toLocaleString('en-IN')}
                        </div>
                        <button
                          onClick={(e) => handleAddVendorToEvent(vendor, null, e)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-900 text-amber-200 font-semibold text-xs"
                        >
                          Add to Event
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. CUSTOMER MY BOOKINGS VIEW */}
        {/* ======================================================== */}
        {activeTab === 'bookings' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="text-xs uppercase font-bold tracking-widest text-emerald-800 mb-1">
                Order History &amp; Invoices
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950">
                My Confirmed Bookings
              </h1>
              <p className="text-stone-600 text-sm mt-1">
                Track status of your confirmed events, vendor coordination timelines, and receipts.
              </p>
            </div>

            {userBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-stone-800">No bookings yet</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Build your event checklist and book all vendor services in 1 unified checkout.
                </p>
                <button
                  onClick={() => setActiveTab('builder')}
                  className="mt-4 px-5 py-2.5 bg-emerald-900 text-amber-200 rounded-xl text-xs font-semibold"
                >
                  Go to Event Builder
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {userBookings.map((bkg) => (
                  <div key={bkg.id} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            {bkg.bookingNumber}
                          </span>
                          <span className="bg-emerald-800 text-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
                            {bkg.bookingStatus}
                          </span>
                          <span className="text-xs text-stone-400">
                            Booked on {new Date(bkg.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-emerald-950 mt-1">
                          {bkg.eventName}
                        </h3>
                        <div className="text-xs text-stone-500 flex items-center gap-3 mt-1">
                          <span>📅 {bkg.eventDate}</span>
                          <span>📍 {bkg.city}</span>
                          <span>👥 {bkg.guestCount} Guests</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-stone-500">Total Booking Amount</div>
                        <div className="font-serif text-2xl font-bold text-emerald-950">
                          ₹{bkg.totalAmount?.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs font-semibold text-emerald-700">
                          Advance Paid: ₹{bkg.advancePaid?.toLocaleString('en-IN')} ({bkg.paymentStatus})
                        </div>
                      </div>
                    </div>

                    {/* Booked Services List */}
                    <div className="py-4 space-y-2">
                      <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">Booked Services ({bkg.items?.length}):</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {bkg.items?.map((item, idx) => (
                          <div key={idx} className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-stone-900">{item.vendorName}</div>
                              <div className="text-[11px] text-stone-500 capitalize">{item.category} • {item.packageName}</div>
                            </div>
                            <div className="font-serif font-bold text-xs text-emerald-900">
                              ₹{item.price?.toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-stone-500">
                        Payment Method: <strong className="text-stone-800">{bkg.paymentMethod}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toast.success(`Receipt for ${bkg.bookingNumber} downloaded`)}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Invoice
                        </button>
                        <button
                          onClick={() => {
                            const firstVendor = vendors.find(v => v.id === bkg.items?.[0]?.vendorId)
                            if (firstVendor) setReviewModalVendor(firstVendor)
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-900 text-amber-200 font-semibold flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-300" /> Write Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 8. VENDOR DASHBOARD / PORTAL */}
        {/* ======================================================== */}
        {activeTab === 'vendor_portal' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ErrorBoundary fallbackTitle="Vendor Partner Portal">
              <VendorPartnerSuite onBackToStore={() => setActiveTab('home')} />
            </ErrorBoundary>
          </div>
        )}

        {/* ======================================================== */}
        {/* 9. ADMIN PANEL / CONTROL CENTER */}
        {/* ======================================================== */}
        {activeTab === 'admin_portal' && (
          <ErrorBoundary fallbackTitle="Operations Admin Console">
            <AdminOperationsSuite
              adminStats={adminStats}
              vendors={vendors}
              userBookings={userBookings}
              cmsContent={cmsContent}
              onUpdateCMS={handleUpdateCMS}
              mediaLibrary={mediaLibrary}
              onUploadMedia={handleUploadMedia}
              onDeleteMedia={handleDeleteMedia}
              coupons={coupons}
              onCreateCoupon={handleCreateCoupon}
              settlements={settlements}
              onUpdateSettlement={handleUpdateSettlement}
              onVerifyToggle={handleAdminVerifyToggle}
              onRejectVendor={handleAdminReject}
              adminActionBusy={adminActionBusy}
            />
          </ErrorBoundary>
        )}
      
      </main>

      {/* ======================================================== */}
      {/* VENDOR DETAIL MODAL */}
      {selectedVendorModal && (
        <VendorProfileModal
          vendor={selectedVendorModal}
          onClose={() => setSelectedVendorModal(null)}
          isFavorite={wishlistIds.includes(selectedVendorModal.id)}
          onToggleFavorite={handleToggleWishlist}
          onBookNow={(vendor, pkg) => {
            setSelectedVendorModal(null)
            handleAddVendorToEvent(vendor, pkg)
            handleInitiateBookingFromEvent()
          }}
          onRequestQuote={(vendor) => {
            setSelectedVendorModal(null)
            setInquiryModalVendor(vendor)
          }}
          onNegotiate={(vendor) => {
            setSelectedVendorModal(null)
            handleOpenNegotiation(vendor)
          }}
        />
      )}

      {/* 7-STEP BOOKING & CHECKOUT MODAL */}
      {/* ======================================================== */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative my-auto p-6 sm:p-8">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Step Progress Bar */}
            {bookingStep < 7 && (
              <div className="mb-6">
                <div className="flex justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  <span>Step {bookingStep} of 6</span>
                  <span className="text-emerald-900">
                    {bookingStep === 1 && 'Confirm Event'}
                    {bookingStep === 2 && 'Review Services'}
                    {bookingStep === 3 && 'Timings & Logistics'}
                    {bookingStep === 4 && 'Customer Details'}
                    {bookingStep === 5 && 'Price & Discounts'}
                    {bookingStep === 6 && 'Payment Simulator'}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-900 rounded-full transition-all duration-300"
                    style={{ width: `${(bookingStep / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* STEP 1: Confirm Event Details */}
            {bookingStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-emerald-950">Step 1: Confirm Event Details</h3>
                <p className="text-xs text-stone-600">Ensure the core celebration details match your requirements.</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">Event Title</label>
                    <input
                      type="text"
                      value={bookingDetails.eventName}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, eventName: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">Event Date</label>
                      <input
                        type="date"
                        value={bookingDetails.eventDate}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, eventDate: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">City</label>
                      <select
                        value={bookingDetails.city}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, city: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold cursor-pointer"
                      >
                        {CITIES.filter(c => c !== 'All Cities').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="px-6 py-2.5 bg-emerald-900 text-amber-200 font-bold text-xs rounded-xl shadow"
                  >
                    Next: Review Services →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Review Services */}
            {bookingStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-emerald-950">Step 2: Selected Services ({activeEvent?.selectedServices?.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activeEvent?.selectedServices?.map((item, idx) => (
                    <div key={idx} className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-stone-900">{item.vendorName}</div>
                        <div className="text-stone-500 capitalize">{item.category} • {item.packageName}</div>
                      </div>
                      <div className="font-serif font-bold text-emerald-950">
                        ₹{item.price?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="px-4 py-2 bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setBookingStep(3)}
                    className="px-6 py-2.5 bg-emerald-900 text-amber-200 font-bold text-xs rounded-xl shadow"
                  >
                    Next: Timings &amp; Logistics →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Timings & Logistics */}
            {bookingStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-emerald-950">Step 3: Venue &amp; Logistics Notes</h3>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Venue Address / Landmark</label>
                  <input
                    type="text"
                    value={bookingDetails.venueAddress}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, venueAddress: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Special Setup Instructions for Vendors</label>
                  <textarea
                    rows={3}
                    value={bookingDetails.specialInstructions}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, specialInstructions: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setBookingStep(2)} className="px-4 py-2 bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl">← Back</button>
                  <button onClick={() => setBookingStep(4)} className="px-6 py-2.5 bg-emerald-900 text-amber-200 font-bold text-xs rounded-xl shadow">Next: Customer Details →</button>
                </div>
              </div>
            )}

            {/* STEP 4: Customer Details */}
            {bookingStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-emerald-950">Step 4: Primary Contact Details</h3>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={bookingDetails.name}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">Phone Number (WhatsApp)</label>
                    <input
                      type="text"
                      value={bookingDetails.phone}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">Email ID</label>
                    <input
                      type="email"
                      value={bookingDetails.email}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, email: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setBookingStep(3)} className="px-4 py-2 bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl">← Back</button>
                  <button onClick={() => setBookingStep(5)} className="px-6 py-2.5 bg-emerald-900 text-amber-200 font-bold text-xs rounded-xl shadow">Next: Pricing &amp; Promo →</button>
                </div>
              </div>
            )}

            {/* STEP 5: Price Breakdown & Coupon */}
            {bookingStep === 5 && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-emerald-950">Step 5: Price Breakdown &amp; Discounts</h3>

                {/* Promo Code Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (e.g. ROYAL2026)"
                    value={bookingDetails.promoCode}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, promoCode: e.target.value })}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs uppercase font-bold"
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    className="px-4 py-2.5 bg-emerald-900 text-amber-200 font-bold text-xs rounded-xl"
                  >
                    Apply Coupon
                  </button>
                </div>

                {/* Breakdown List */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Services Subtotal:</span>
                    <span>₹{budgetMetrics.totalSelected.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>GST (18% Govt. Tax):</span>
                    <span>₹{Math.round(budgetMetrics.totalSelected * 0.18).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Platform Convenience Fee:</span>
                    <span>₹2,500</span>
                  </div>
                  {bookingDetails.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Promo Discount:</span>
                      <span>-₹{bookingDetails.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-stone-200 flex justify-between font-serif font-bold text-base text-emerald-950">
                    <span>Grand Total Payable:</span>
                    <span>
                      ₹{Math.max(0, budgetMetrics.totalSelected + Math.round(budgetMetrics.totalSelected * 0.18) + 2500 - bookingDetails.discount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Advance vs Full Radio */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <label className={`p-3 rounded-2xl border cursor-pointer ${bookingDetails.isAdvanceOnly ? 'bg-emerald-50 border-emerald-900' : 'bg-white border-stone-200'}`}>
                    <input
                      type="radio"
                      name="payOption"
                      checked={bookingDetails.isAdvanceOnly}
                      onChange={() => setBookingDetails({ ...bookingDetails, isAdvanceOnly: true })}
                      className="accent-emerald-900 mr-2"
                    />
                    <span className="font-bold text-xs text-stone-900">Pay 25% Advance</span>
                    <div className="text-[11px] text-emerald-800 font-serif font-bold mt-1">
                      ₹{Math.round((budgetMetrics.totalSelected + Math.round(budgetMetrics.totalSelected * 0.18) + 2500 - bookingDetails.discount) * 0.25).toLocaleString('en-IN')}
                    </div>
                  </label>

                  <label className={`p-3 rounded-2xl border cursor-pointer ${!bookingDetails.isAdvanceOnly ? 'bg-emerald-50 border-emerald-900' : 'bg-white border-stone-200'}`}>
                    <input
                      type="radio"
                      name="payOption"
                      checked={!bookingDetails.isAdvanceOnly}
                      onChange={() => setBookingDetails({ ...bookingDetails, isAdvanceOnly: false })}
                      className="accent-emerald-900 mr-2"
                    />
                    <span className="font-bold text-xs text-stone-900">Pay Full Amount (100%)</span>
                    <div className="text-[11px] text-emerald-800 font-serif font-bold mt-1">
                      ₹{Math.max(0, budgetMetrics.totalSelected + Math.round(budgetMetrics.totalSelected * 0.18) + 2500 - bookingDetails.discount).toLocaleString('en-IN')}
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setBookingStep(4)} className="px-4 py-2 bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl">← Back</button>
                  <button onClick={() => setBookingStep(6)} className="px-6 py-2.5 bg-emerald-900 text-amber-200 font-bold text-xs rounded-xl shadow">Next: Proceed to Payment →</button>
                </div>
              </div>
            )}

            {/* STEP 6: Secure Payment Gateway & Admin UPI/QR Collection */}
            {bookingStep === 6 && (() => {
              const subtotal = activeEvent?.selectedServices?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0
              const tax = Math.round(subtotal * 0.18)
              const platformFee = 2500
              const discount = bookingDetails.discount || 0
              const grandTotal = Math.max(0, subtotal + tax + platformFee - discount)
              const payable = bookingDetails.isAdvanceOnly ? Math.round(grandTotal * 0.25) : grandTotal

              const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                `upi://pay?pa=${paymentConfig.upi?.upiId || 'vowsandvenues@icici'}&pn=${encodeURIComponent(paymentConfig.upi?.merchantName || 'Vows & Venues')}&am=${payable}&cu=INR&tn=Booking-${activeEvent?.name || 'Event'}`
              )}`

              const upiIntentUrl = `upi://pay?pa=${paymentConfig.upi?.upiId || 'vowsandvenues@icici'}&pn=${encodeURIComponent(paymentConfig.upi?.merchantName || 'Vows & Venues')}&am=${payable}&cu=INR&tn=Booking-${activeEvent?.name || 'Event'}`

              const isUpiMode = paymentConfig.activeMode === 'CUSTOM_UPI_QR' || (paymentConfig.activeMode === 'HYBRID' && bookingDetails.paymentMethod === 'upi')
              const isCardMode = paymentConfig.activeMode === 'PAYMENT_GATEWAY' || (paymentConfig.activeMode === 'HYBRID' && bookingDetails.paymentMethod === 'card')
              const isBankMode = paymentConfig.activeMode === 'BANK_NEFT_RTGS'

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-emerald-950">Step 6: Secure Payment</h3>
                      <p className="text-xs text-stone-600">
                        Total Payable Now: <strong className="text-emerald-900 font-serif text-sm">₹{payable.toLocaleString('en-IN')}</strong> {bookingDetails.isAdvanceOnly ? '(25% Token Advance)' : '(Full 100% Payment)'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300">
                      {paymentConfig.activeMode === 'CUSTOM_UPI_QR' && 'Direct UPI QR'}
                      {paymentConfig.activeMode === 'PAYMENT_GATEWAY' && `${paymentConfig.gateway?.provider?.toUpperCase() || 'RAZORPAY'} Gateway`}
                      {paymentConfig.activeMode === 'HYBRID' && 'Hybrid Payment'}
                      {paymentConfig.activeMode === 'BANK_NEFT_RTGS' && 'Bank NEFT/RTGS'}
                    </span>
                  </div>

                  {/* Mode selection tabs if in HYBRID mode */}
                  {paymentConfig.activeMode === 'HYBRID' && (
                    <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-2xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setBookingDetails({ ...bookingDetails, paymentMethod: 'upi' })}
                        className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                          bookingDetails.paymentMethod === 'upi'
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-emerald-700" />
                        <span>Scan Admin UPI QR (0% Fee)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingDetails({ ...bookingDetails, paymentMethod: 'card' })}
                        className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                          bookingDetails.paymentMethod === 'card'
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-indigo-700" />
                        <span>Card / NetBanking Gateway</span>
                      </button>
                    </div>
                  )}

                  {/* 1. CUSTOM UPI & QR CODE FLOW */}
                  {isUpiMode && (
                    <div className="bg-gradient-to-br from-amber-50/60 to-rose-50/30 p-5 rounded-3xl border border-amber-200/80 space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Live QR Code Box */}
                        <div className="p-2.5 bg-white rounded-2xl shadow-md border-2 border-amber-400 shrink-0 text-center">
                          <img
                            src={paymentConfig.upi?.qrImageUrl || dynamicQrUrl}
                            alt="Admin UPI QR Code"
                            className="w-40 h-40 object-contain mx-auto rounded-lg"
                          />
                          <span className="text-[10px] font-bold text-amber-900 block mt-1">
                            Scan on any UPI App
                          </span>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-2.5 flex-1 w-full text-xs">
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
                              Pay Directly To Merchant:
                            </span>
                            <span className="font-serif font-bold text-stone-900 text-sm block">
                              {paymentConfig.upi?.merchantName || 'Vows & Venues Luxury Hospitality'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-stone-400 block font-mono">UPI ID / VPA:</span>
                              <span className="font-mono font-bold text-stone-900 text-xs">
                                {paymentConfig.upi?.upiId || 'vowsandvenues@icici'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(paymentConfig.upi?.upiId || 'vowsandvenues@icici')
                                setCopiedUpi(true)
                                toast.success('UPI ID copied to clipboard!')
                                setTimeout(() => setCopiedUpi(false), 2000)
                              }}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] flex items-center gap-1"
                            >
                              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          {/* Quick Mobile Intent Buttons */}
                          <div className="pt-1">
                            <span className="text-[10px] text-stone-500 block mb-1">
                              Quick Mobile Payment:
                            </span>
                            <a
                              href={upiIntentUrl}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold text-xs shadow-xs"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span>Open in GPay / PhonePe / Paytm</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* UTR Input Field */}
                      <div className="pt-3 border-t border-amber-200/60">
                        <label className="text-xs font-bold text-stone-800 block mb-1">
                          Enter 12-Digit UTR / Transaction Reference Number *
                        </label>
                        <input
                          type="text"
                          value={customerUtr}
                          onChange={(e) => setCustomerUtr(e.target.value)}
                          placeholder="e.g. 429188291042 (found in your UPI app payment receipt)"
                          className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-emerald-600"
                        />
                        <p className="text-[11px] text-stone-500 mt-1">
                          After completing your UPI payment of ₹{payable.toLocaleString('en-IN')}, paste your 12-digit UTR number here for instant concierge verification.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 2. PAYMENT GATEWAY FLOW */}
                  {isCardMode && (
                    <div className="bg-stone-50 p-5 rounded-3xl border border-stone-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-900 text-amber-200 flex items-center justify-center font-bold">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 text-sm block">
                              {paymentConfig.gateway?.provider === 'razorpay' ? 'Razorpay Secure Payment' : `${paymentConfig.gateway?.provider?.toUpperCase() || 'RAZORPAY'} Gateway`}
                            </span>
                            <span className="text-[11px] text-stone-500">
                              Instant checkout with Cards, NetBanking, and Wallets
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          paymentConfig.gateway?.isLive ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {paymentConfig.gateway?.isLive ? 'Live Mode' : 'Test Sandbox'}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-stone-200 text-xs space-y-2">
                        <div className="flex justify-between text-stone-600">
                          <span>Payable Amount:</span>
                          <span className="font-bold text-stone-900">₹{payable.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Gateway Encryption:</span>
                          <span className="text-emerald-700 font-semibold">256-Bit SSL Encrypted</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Supported:</span>
                          <span>Visa, MasterCard, RuPay, Amex, 50+ NetBanking</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. BANK NEFT/RTGS FLOW */}
                  {isBankMode && (
                    <div className="bg-purple-50/70 p-5 rounded-3xl border border-purple-200 space-y-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 text-sm block">
                            Corporate Escrow NEFT / RTGS Wire Transfer
                          </span>
                          <span className="text-[11px] text-stone-500">
                            Transfer directly to our official corporate escrow account
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 space-y-2 font-mono">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Bank:</span>
                          <span className="font-bold text-stone-900">{paymentConfig.bank?.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Account Name:</span>
                          <span className="font-bold text-stone-900">{paymentConfig.bank?.accountHolder}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Account Number:</span>
                          <span className="font-bold text-purple-900">{paymentConfig.bank?.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">IFSC Code:</span>
                          <span className="font-bold text-stone-900">{paymentConfig.bank?.ifsc}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-800 block mb-1">
                          Bank Wire Transfer UTR Reference Number *
                        </label>
                        <input
                          type="text"
                          value={customerUtr}
                          onChange={(e) => setCustomerUtr(e.target.value)}
                          placeholder="e.g. HDFCR5202610120098"
                          className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between">
                    <button onClick={() => setBookingStep(5)} className="px-4 py-2 bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl">← Back</button>
                    <button
                      onClick={handleCompleteBooking}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-900 to-emerald-800 text-amber-200 font-bold text-sm rounded-xl shadow-xl flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>{isUpiMode ? 'Submit UTR & Confirm Booking' : 'Complete & Confirm Booking'}</span>
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* STEP 7: Booking Confirmation Screen */}
            {bookingStep === 7 && confirmedBookingResult && (
              <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <div className="inline-block bg-amber-400 text-emerald-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Booking Confirmed!
                </div>
                <h3 className="font-serif text-3xl font-bold text-emerald-950">
                  Your Event is Successfully Booked!
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  A confirmation SMS &amp; email with contract receipt has been sent to <strong>{confirmedBookingResult.userPhone}</strong>.
                </p>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between font-mono font-bold text-emerald-900">
                    <span>Booking Number:</span>
                    <span>{confirmedBookingResult.bookingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event Name:</span>
                    <span className="font-semibold">{confirmedBookingResult.eventName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date &amp; City:</span>
                    <span>{confirmedBookingResult.eventDate} ({confirmedBookingResult.city})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-serif font-bold text-emerald-950">₹{confirmedBookingResult.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Advance Paid:</span>
                    <span>₹{confirmedBookingResult.advancePaid?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setIsBookingModalOpen(false)
                      setActiveTab('bookings')
                    }}
                    className="px-6 py-2.5 bg-emerald-900 text-amber-200 font-bold text-xs rounded-xl shadow"
                  >
                    View My Bookings
                  </button>
                  <button
                    onClick={() => {
                      setIsBookingModalOpen(false)
                      setActiveTab('home')
                    }}
                    className="px-4 py-2.5 bg-stone-100 text-stone-800 font-semibold text-xs rounded-xl"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PACKAGE CUSTOMIZER MODAL */}
      {/* ======================================================== */}
      {customizingPackage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 relative my-auto">
            <button
              onClick={() => setCustomizingPackage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <span className="bg-amber-400 text-emerald-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Modular Package Customizer
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950 mt-1">
                Customize &quot;{customizingPackage.title}&quot;
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Swap any vendor below with an alternate choice. Prices update dynamically in real time.
              </p>
            </div>

            {/* List of included services */}
            <div className="space-y-3 mb-6">
              {packageCustomItems.map((item, idx) => (
                <div key={idx} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                      {item.category} Service
                    </div>
                    <div className="font-serif font-bold text-base text-stone-900">{item.vendorName}</div>
                    <div className="text-xs text-stone-500">{item.packageName}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-emerald-950 text-base">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => setSwappingCategory(item.category)}
                      className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-800 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Swap Vendor
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Swapping Picker Drawer if a category is selected */}
            {swappingCategory && (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 mb-6 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif font-bold text-sm text-emerald-950 capitalize">
                    Choose Alternate {swappingCategory} Vendor:
                  </h4>
                  <button onClick={() => setSwappingCategory(null)} className="text-xs text-stone-500 underline">
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {vendors
                    .filter(v => v.category === swappingCategory)
                    .map(altVendor => (
                      <div
                        key={altVendor.id}
                        onClick={() => handleSwapPackageVendor(swappingCategory, altVendor)}
                        className="bg-white p-3 rounded-xl border border-stone-200 hover:border-emerald-700 cursor-pointer text-xs"
                      >
                        <div className="font-bold text-stone-900">{altVendor.name}</div>
                        <div className="text-stone-500">{altVendor.city} • ★ {altVendor.rating}</div>
                        <div className="font-serif font-bold text-emerald-950 mt-1">
                          From ₹{altVendor.startingPrice?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Total Calculation & Apply CTA */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs text-stone-500">Total Bundle Cost</div>
                <div className="font-serif text-3xl font-bold text-emerald-950">
                  ₹{packageCustomItems.reduce((s, i) => s + (Number(i.price) || 0), 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setCustomizingPackage(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyCustomizedPackageToEvent}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-900 text-amber-200 font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:bg-emerald-950"
                >
                  Apply to My Event →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VENDOR CONTACT / INQUIRY MODAL */}
      {/* ======================================================== */}
      {inquiryModalVendor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 p-6 sm:p-8 relative my-auto">
            <button
              onClick={() => setInquiryModalVendor(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Direct Inquire</span>
              <h3 className="font-serif text-2xl font-bold text-emerald-950 mt-1">
                Message {inquiryModalVendor.name}
              </h3>
              <p className="text-xs text-stone-500">Average response time: {inquiryModalVendor.responseTime || '&lt; 1 hour'}</p>
            </div>

            <form onSubmit={handleSubmitInquiry} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohit Verma"
                  value={inquiryFormData.name}
                  onChange={(e) => setInquiryFormData({ ...inquiryFormData, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={inquiryFormData.phone}
                    onChange={(e) => setInquiryFormData({ ...inquiryFormData, phone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={inquiryFormData.date || activeEvent?.date || ''}
                    onChange={(e) => setInquiryFormData({ ...inquiryFormData, date: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Message / Requirements</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Hi, I would like to check availability and package inclusions for 250 guests..."
                  value={inquiryFormData.message}
                  onChange={(e) => setInquiryFormData({ ...inquiryFormData, message: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-900 hover:bg-emerald-950 text-amber-200 font-bold text-xs sm:text-sm rounded-xl shadow-lg mt-2"
              >
                Send Inquiry Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WRITE REVIEW MODAL */}
      {/* ======================================================== */}
      {reviewModalVendor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 p-6 sm:p-8 relative my-auto">
            <button
              onClick={() => setReviewModalVendor(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Verified Booking Review</span>
              <h3 className="font-serif text-2xl font-bold text-emerald-950 mt-1">
                Rate {reviewModalVendor.name}
              </h3>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Star Rating</label>
                <div className="flex gap-2 text-2xl text-amber-400 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Event Type</label>
                <select
                  value={reviewEventType}
                  onChange={(e) => setReviewEventType(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold cursor-pointer"
                >
                  <option value="Wedding">Wedding Reception</option>
                  <option value="Sangeet">Sangeet &amp; Mehendi</option>
                  <option value="Birthday">Birthday Celebration</option>
                  <option value="Corporate">Corporate Gala</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Written Review</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details of food quality, staff hospitality, punctuality, and guest feedback..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-900 text-amber-200 font-bold text-xs sm:text-sm rounded-xl shadow-lg"
              >
                Submit Verified Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VENDOR COMPARISON MODAL */}
      {/* ======================================================== */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 relative my-auto">
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Side-by-Side Analysis</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950 mt-1">
                Vendor Comparison Table
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-800 font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Feature</th>
                    {compareVendorIds.map(id => {
                      const v = vendors.find(ven => ven.id === id)
                      return (
                        <th key={id} className="py-3 px-4 font-serif text-sm text-emerald-950 font-bold">
                          {v?.name}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="py-3 px-4 font-bold text-stone-600">Category</td>
                    {compareVendorIds.map(id => {
                      const v = vendors.find(ven => ven.id === id)
                      return <td key={id} className="py-3 px-4 capitalize">{v?.categoryName}</td>
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-stone-600">City / Location</td>
                    {compareVendorIds.map(id => {
                      const v = vendors.find(ven => ven.id === id)
                      return <td key={id} className="py-3 px-4">{v?.city}</td>
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-stone-600">Starting Price</td>
                    {compareVendorIds.map(id => {
                      const v = vendors.find(ven => ven.id === id)
                      return (
                        <td key={id} className="py-3 px-4 font-serif font-bold text-emerald-950 text-sm">
                          ₹{v?.startingPrice?.toLocaleString('en-IN')} /{v?.priceUnit}
                        </td>
                      )
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-stone-600">Customer Rating</td>
                    {compareVendorIds.map(id => {
                      const v = vendors.find(ven => ven.id === id)
                      return <td key={id} className="py-3 px-4 font-bold text-amber-600">★ {v?.rating} ({v?.reviewCount})</td>
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-stone-600">Guest Capacity</td>
                    {compareVendorIds.map(id => {
                      const v = vendors.find(ven => ven.id === id)
                      return <td key={id} className="py-3 px-4">{v?.capacity || 'Flexible'} pax</td>
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-stone-600">Verified Badge</td>
                    {compareVendorIds.map(id => {
                      const v = vendors.find(ven => ven.id === id)
                      return (
                        <td key={id} className="py-3 px-4">
                          {v?.verified ? <span className="text-emerald-800 font-bold">✓ Verified</span> : 'Standard'}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK QUOTATION MODAL */}
      {/* ======================================================== */}
      {showQuotationModal && activeEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 relative my-auto">
            <button
              onClick={() => setShowQuotationModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-stone-200 pb-4 mb-6">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Formal Event Proposal</div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950 mt-1">
                {activeEvent.name}
              </h2>
              <div className="text-xs text-stone-500 mt-1">
                Date: {activeEvent.date} • Location: {activeEvent.city} • Guests: {activeEvent.guestCount}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {activeEvent.selectedServices?.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-stone-100">
                  <div>
                    <div className="font-bold text-stone-900">{s.vendorName}</div>
                    <div className="text-stone-500 capitalize">{s.category} • {s.packageName}</div>
                  </div>
                  <div className="font-serif font-bold text-emerald-950">
                    ₹{s.price?.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-1.5 mb-6">
              <div className="flex justify-between">
                <span>Services Subtotal:</span>
                <span>₹{budgetMetrics.totalSelected.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{Math.round(budgetMetrics.totalSelected * 0.18).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-serif font-bold text-base text-emerald-950 pt-2 border-t border-stone-200">
                <span>Estimated Grand Total:</span>
                <span>₹{(budgetMetrics.totalSelected + Math.round(budgetMetrics.totalSelected * 0.18)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => toast.success('Quotation PDF Downloaded')}
                className="px-4 py-2.5 bg-stone-100 text-stone-800 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={() => {
                  setShowQuotationModal(false)
                  setIsBookingModalOpen(true)
                  setBookingStep(1)
                }}
                className="px-6 py-2.5 bg-emerald-900 text-amber-200 font-bold text-xs rounded-xl shadow"
              >
                Proceed to Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDITORIAL FOOTER */}
      <FooterSection
        onSelectCategory={(slug) => {
          setFilterCategory(slug)
          setActiveTab('explore')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onSelectCity={(city) => {
          setSelectedCity(city)
          setFilterCity(city)
          setActiveTab('explore')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        cities={CITIES}
        categories={categories}
        contactInfo={cmsContent?.contact}
      />

      {/* ======================================================== */}
      {/* AUTH MODAL — Login / Sign Up / Google */}
      {/* ======================================================== */}
      {authModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white p-6 relative">
              <button
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-serif text-xl font-bold">V</div>
                <div>
                  <div className="font-serif text-lg font-bold">Vows &amp; Venues</div>
                  <div className="text-[10px] text-amber-200 uppercase tracking-widest">Premium Event Marketplace</div>
                </div>
              </div>
              <h2 className="font-serif text-2xl font-bold mt-3">
                {authMode === 'signup' ? 'Create Your Account' : authMode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                {authMode === 'signup'
                  ? 'Join thousands planning their dream event effortlessly'
                  : authMode === 'forgot'
                  ? 'Enter your email and we\'ll send you a reset link'
                  : 'Sign in to book vendors and manage your events'}
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Google Sign In */}
              {authMode !== 'forgot' && (
                <>
                  <button
                    disabled={authBusy}
                    onClick={handleGoogleAuth}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-stone-200 hover:border-emerald-400 hover:bg-stone-50 text-stone-800 font-semibold text-sm transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-stone-200"></div>
                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">or with email</span>
                    <div className="flex-1 h-px bg-stone-200"></div>
                  </div>
                </>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-xs font-semibold text-stone-700">Full Name</label>
                    <input
                      required
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="mt-1 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-stone-700">Email Address</label>
                  <input
                    required
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className="mt-1 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {authMode !== 'forgot' && (
                  <div>
                    <label className="text-xs font-semibold text-stone-700">Password</label>
                    <input
                      required
                      type="password"
                      minLength={6}
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="mt-1 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {authMode === 'signup' && (
                  <div>
                    <label className="text-xs font-semibold text-stone-700">I want to</label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthForm({ ...authForm, role: 'customer' })}
                        className={`py-2 rounded-xl text-xs font-semibold border-2 ${authForm.role === 'customer' ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-stone-200 bg-white text-stone-600'}`}
                      >
                        Plan My Event
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthForm({ ...authForm, role: 'vendor' })}
                        className={`py-2 rounded-xl text-xs font-semibold border-2 ${authForm.role === 'vendor' ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-stone-200 bg-white text-stone-600'}`}
                      >
                        List as Vendor
                      </button>
                    </div>
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="text-right">
                    <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs font-semibold text-emerald-800 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-950 hover:to-emerald-900 text-amber-200 font-bold text-sm shadow-lg disabled:opacity-60 transition-all"
                >
                  {authBusy ? 'Please wait…' : authMode === 'signup' ? 'Create Account' : authMode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
                </button>
              </form>

              {authMode === 'forgot' && (
                <p className="text-center text-xs text-stone-500 mt-4">
                  Reset link will arrive shortly (demo).{' '}
                  <button onClick={() => setAuthMode('login')} className="font-semibold text-emerald-800 hover:underline">Back to login</button>
                </p>
              )}

              {authMode !== 'forgot' && (
                <div className="text-center text-xs text-stone-500 mt-5">
                  {authMode === 'signup' ? 'Already have an account?' : 'New to Vows & Venues?'}{' '}
                  <button
                    onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                    className="font-bold text-emerald-800 hover:underline"
                  >
                    {authMode === 'signup' ? 'Sign In' : 'Create Account'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VENDOR — ADD PACKAGE MODAL */}
      {/* ======================================================== */}
      {showPkgModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-950 text-white p-6 relative">
              <button onClick={() => setShowPkgModal(false)} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
              <span className="bg-amber-400 text-emerald-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Vendor Portal</span>
              <h2 className="font-serif text-2xl font-bold mt-2">Create a New Service Package</h2>
              <p className="text-xs text-stone-300 mt-1">Showcase your best offering to customers instantly.</p>
            </div>
            <form onSubmit={handleVendorAddPackage} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700">Package Name *</label>
                <input required value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} placeholder="e.g. Royal Sangeet Special" className="mt-1 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700">Package Price (₹) *</label>
                <input required type="number" min="1000" value={pkgForm.price} onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })} placeholder="e.g. 75000" className="mt-1 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700">What&apos;s Included (comma separated)</label>
                <input value={pkgForm.includes} onChange={(e) => setPkgForm({ ...pkgForm, includes: e.target.value })} placeholder="Stage decor, Floral mandap, 4-hour service" className="mt-1 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700">Description (optional)</label>
                <textarea rows={3} value={pkgForm.description} onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })} placeholder="Describe the package experience…" className="mt-1 w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowPkgModal(false)} className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm">Cancel</button>
                <button type="submit" disabled={pkgBusy} className="flex-1 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-200 font-bold text-sm disabled:opacity-60">
                  {pkgBusy ? 'Publishing…' : 'Publish Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING NEGOTIATION & CONCIERGE CHAT BUTTON (Positioned above mobile bottom bar) */}
      <div className="fixed bottom-18 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2">
        <button
          onClick={() => handleOpenNegotiation(null)}
          className="group relative flex items-center justify-center p-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-[#2c0e17] via-[#4a1525] to-[#2c0e17] hover:from-[#1f0910] hover:to-[#38101c] text-[#f7efdc] shadow-[0_8px_30px_rgba(74,21,37,0.35)] hover:shadow-[0_12px_40px_rgba(74,21,37,0.5)] border-2 border-[#c5a059] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Think prices are high? Negotiate live with our Admin Concierge"
          aria-label="Negotiate Price with Admin Concierge"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#c5a059] to-[#8c6b2d] flex items-center justify-center text-[#1c1917] font-bold shadow-sm shrink-0">
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-serif font-bold tracking-wide flex items-center gap-1.5">
              <span>Negotiate Price</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[10px] text-amber-300 font-sans font-medium">
              Live Chat with Admin
            </div>
          </div>
          {/* Subtle pulsing live indicator on mobile */}
          <span className="sm:hidden absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#2c0e17] animate-pulse" />
        </button>
      </div>

      {/* PRICE NEGOTIATION & CONCIERGE CHAT DRAWER */}
      <NegotiationChatDrawer
        isOpen={isNegotiationOpen}
        onClose={() => {
          setIsNegotiationOpen(false)
          setNegotiatingVendor(null)
        }}
        targetVendor={negotiatingVendor}
        allVendors={vendors}
        currentUser={currentUser}
        onApplyDeal={(deal) => {
          if (deal.vendor) {
            handleAddVendorToEvent(deal.vendor)
          }
          setBookingDetails(prev => ({
            ...prev,
            promoCode: deal.promoCode || 'NEGOTIATED_ROYAL_DEAL',
            discount: deal.discountAmount || 0
          }))
          setIsBookingModalOpen(true)
          toast.success(`Negotiated deal applied! Proceeding to booking with ₹${(deal.offerPrice || 0).toLocaleString('en-IN')}`)
        }}
      />

      {/* RAJSHREE AI ROYAL CONCIERGE & PACKAGE MATCHMAKER */}
      <RajshreeAIConcierge
        onOpenNegotiation={handleOpenNegotiation}
      />
    </div>
  )
}
