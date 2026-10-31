'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Building2,
  CalendarDays,
  DollarSign,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Phone,
  Send,
  Lock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  Save,
  AlertCircle,
  ExternalLink,
  UserCheck,
  Percent,
  Camera,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  Star,
  MapPin,
  LogOut,
  Mail,
  Info,
  FileText,
  Eye,
  CreditCard
} from 'lucide-react'
import { toast } from 'sonner'

// Robust client-side image compression for fast mobile uploads without memory crash
function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (file?.type === 'application/pdf' || (file?.name && file.name.toLowerCase().endsWith('.pdf'))) {
        return resolve(e.target.result)
      }
      const img = new Image()
      img.onload = () => {
        let w = img.width
        let h = img.height
        if (w > maxWidth || h > maxHeight) {
          if (w > h) {
            h = Math.round((h * maxWidth) / w)
            w = maxWidth
          } else {
            w = Math.round((w * maxHeight) / h)
            h = maxHeight
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('Image decode failed'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}

const CATEGORY_OPTIONS = [
  { value: 'venues', label: 'Venues / Heritage Palaces & Banquets' },
  { value: 'catering', label: 'Catering & Royal Feasts' },
  { value: 'decor', label: 'Decoration & Mandaps' },
  { value: 'photography', label: 'Photography & Cinema' },
  { value: 'makeup', label: 'Bridal Makeup & Styling' },
  { value: 'music', label: 'DJ, Live Music & Entertainment' },
  { value: 'outfits', label: 'Bridal & Groom Outfits' },
  { value: 'planners', label: 'Wedding & Event Planners' }
]

const POPULAR_CITIES = [
  'Lucknow', 'Delhi NCR', 'Jaipur', 'Udaipur', 'Bengaluru',
  'Hyderabad', 'Mumbai', 'Goa', 'Chandigarh'
]

export default function VendorPartnerSuite() {
  // Authentication & session state
  const [authToken, setAuthToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Login / Register modal in portal
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'register'

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regBusinessName, setRegBusinessName] = useState('')
  const [regCategory, setRegCategory] = useState('venues')
  const [regCity, setRegCity] = useState('Lucknow')

  // Vendor data
  const [vendorsList, setVendorsList] = useState([])
  const [activeVendor, setActiveVendor] = useState(null)
  const [loadingVendor, setLoadingVendor] = useState(false)

  // Navigation tabs: 'overview' | 'photos' | 'storefront' | 'calendar' | 'kyc_finance' | 'negotiations'
  const [activeTab, setActiveTab] = useState('storefront')

  // Form edit state
  const [storefrontForm, setStorefrontForm] = useState({
    name: '',
    category: 'venues',
    city: 'Lucknow',
    address: '',
    contactPhone: '',
    email: '',
    startingPrice: 50000,
    priceUnit: 'per day',
    vegPlate: 2000,
    nonVegPlate: 2800,
    capacity: 500,
    responseTime: '< 30 mins',
    description: '',
    highlights: []
  })
  const [newHighlight, setNewHighlight] = useState('')
  const [savingStorefront, setSavingStorefront] = useState(false)

  // Bank & Government ID Proof KYC state
  const [bankForm, setBankForm] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    pan: '',
    panName: '',
    aadhaar: '',
    aadhaarName: '',
    gstin: '',
    gstBusinessName: '',
    gstType: 'regular'
  })
  const [savingBank, setSavingBank] = useState(false)

  // Photo management state
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingVerification, setUploadingVerification] = useState(false)
  const [uploadingPanDoc, setUploadingPanDoc] = useState(false)
  const [uploadingAadhaarFront, setUploadingAadhaarFront] = useState(false)
  const [uploadingAadhaarBack, setUploadingAadhaarBack] = useState(false)
  const [uploadingGstDoc, setUploadingGstDoc] = useState(false)
  const [previewDocModal, setPreviewDocModal] = useState(null)
  const [customCoverUrl, setCustomCoverUrl] = useState('')
  const [customHeroUrl, setCustomHeroUrl] = useState('')
  const [customGalleryUrl, setCustomGalleryUrl] = useState('')

  // File input refs
  const coverCameraRef = useRef(null)
  const coverFileRef = useRef(null)
  const heroCameraRef = useRef(null)
  const heroFileRef = useRef(null)
  const galleryCameraRef = useRef(null)
  const galleryFileRef = useRef(null)
  const verificationCameraRef = useRef(null)
  const verificationFileRef = useRef(null)
  const panCameraRef = useRef(null)
  const panFileRef = useRef(null)
  const aadhaarFrontCameraRef = useRef(null)
  const aadhaarFrontFileRef = useRef(null)
  const aadhaarBackCameraRef = useRef(null)
  const aadhaarBackFileRef = useRef(null)
  const gstCameraRef = useRef(null)
  const gstFileRef = useRef(null)

  // Calendar / Blackout state
  const [blockedDates, setBlockedDates] = useState([])
  const [blockDateInput, setBlockDateInput] = useState('')
  const [blockReasonInput, setBlockReasonInput] = useState('')

  // Negotiations / Leads state
  const [leads, setLeads] = useState([])
  const [activeCounterLead, setActiveCounterLead] = useState(null)
  const [counterPriceInput, setCounterPriceInput] = useState('')
  const [counterNotesInput, setCounterNotesInput] = useState('')

  // Check stored auth token on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token') || localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('vv_user') || localStorage.getItem('vv_current_user')
      if (storedToken) {
        setAuthToken(storedToken)
        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser))
          } catch (_) {}
        }
        loadVendorData(storedToken)
      } else {
        setAuthLoading(false)
      }
    } catch (_) {
      setAuthLoading(false)
    }
  }, [])

  // Populate form fields whenever activeVendor changes
  useEffect(() => {
    if (activeVendor) {
      setStorefrontForm({
        name: activeVendor.name || '',
        category: activeVendor.category || 'venues',
        city: activeVendor.city || 'Lucknow',
        address: activeVendor.address || '',
        contactPhone: activeVendor.contactPhone || activeVendor.phone || '',
        email: activeVendor.email || '',
        startingPrice: activeVendor.startingPrice || 50000,
        priceUnit: activeVendor.priceUnit || 'per day',
        vegPlate: activeVendor.vegPlate || 0,
        nonVegPlate: activeVendor.nonVegPlate || 0,
        capacity: activeVendor.capacity || 500,
        responseTime: activeVendor.responseTime || '< 30 mins',
        description: activeVendor.description || '',
        highlights: Array.isArray(activeVendor.highlights) ? [...activeVendor.highlights] : []
      })

      setBankForm({
        accountHolder: activeVendor.accountHolder || '',
        bankName: activeVendor.bankName || '',
        accountNumber: activeVendor.accountNumber || '',
        ifsc: activeVendor.ifsc || '',
        pan: activeVendor.pan || activeVendor.panNumber || '',
        panName: activeVendor.panName || '',
        aadhaar: activeVendor.aadhaar || activeVendor.aadhaarNumber || '',
        aadhaarName: activeVendor.aadhaarName || '',
        gstin: activeVendor.gstin || '',
        gstBusinessName: activeVendor.gstBusinessName || '',
        gstType: activeVendor.gstType || 'regular'
      })

      // Load blackout dates
      if (Array.isArray(activeVendor.blackoutDates)) {
        setBlockedDates(activeVendor.blackoutDates)
      } else {
        setBlockedDates([
          { date: '2026-11-18', reason: 'Dev Uthani Ekadashi — Booked for Sharma Royal Wedding' },
          { date: '2026-12-14', reason: 'Under Negotiation (Singhania Family)' }
        ])
      }
    }
  }, [activeVendor])

  // Load vendor profile and catalog
  const loadVendorData = async (token) => {
    const tok = token || authToken
    setLoadingVendor(true)
    try {
      // 1. Fetch all real vendors for switcher / reference
      const allVendorsRes = await fetch('/api/vendors').then(r => r.json()).catch(() => [])
      const safeAll = Array.isArray(allVendorsRes) ? allVendorsRes : []
      setVendorsList(safeAll)

      // 2. Fetch logged-in user's assigned vendor
      if (tok) {
        const mineRes = await fetch('/api/vendors/mine', {
          headers: { Authorization: `Bearer ${tok}` }
        }).then(r => r.json()).catch(() => null)

        if (mineRes && mineRes.vendor) {
          setActiveVendor(mineRes.vendor)
        } else if (safeAll.length > 0) {
          setActiveVendor(safeAll[0])
        }
      } else if (safeAll.length > 0) {
        setActiveVendor(safeAll[0])
      }

      // 3. Fetch negotiations / leads
      if (tok) {
        const negRes = await fetch('/api/negotiations', {
          headers: { Authorization: `Bearer ${tok}` }
        }).then(r => r.json()).catch(() => [])
        if (Array.isArray(negRes)) {
          setLeads(negRes)
        }
      }
    } catch (err) {
      toast.error('Failed to load vendor data: ' + err.message)
    } finally {
      setLoadingVendor(false)
      setAuthLoading(false)
    }
  }

  // Handle vendor portal login
  const handlePortalLogin = async (e) => {
    e.preventDefault()
    setLoginBusy(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      localStorage.setItem('vv_token', data.token)
      localStorage.setItem('vv_auth_token', data.token)
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('vv_user', JSON.stringify(data.user))

      setAuthToken(data.token)
      setCurrentUser(data.user)
      toast.success(`Welcome back, ${data.user.name || 'Partner'}!`)
      loadVendorData(data.token)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoginBusy(false)
    }
  }

  // Handle new vendor partner registration
  const handlePortalRegister = async (e) => {
    e.preventDefault()
    setLoginBusy(true)
    try {
      const payload = {
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        role: 'vendor',
        businessName: regBusinessName.trim() || regName.trim(),
        category: regCategory,
        city: regCity
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      localStorage.setItem('vv_token', data.token)
      localStorage.setItem('vv_auth_token', data.token)
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('vv_user', JSON.stringify(data.user))

      setAuthToken(data.token)
      setCurrentUser(data.user)
      toast.success('Vendor profile created! Welcome to Vows & Venues.')
      loadVendorData(data.token)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoginBusy(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('vv_token')
    localStorage.removeItem('vv_auth_token')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('vv_user')
    setAuthToken(null)
    setCurrentUser(null)
    toast.info('Signed out of Vendor Portal')
  }

  // SAVE STOREFRONT DETAILS (NAME, PRICE, CAPACITY, DESCRIPTION, HIGHLIGHTS, ETC.)
  const handleSaveStorefront = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!activeVendor?.id) {
      toast.error('No active vendor profile selected')
      return
    }

    setSavingStorefront(true)
    try {
      const token = authToken || localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token')
      const payload = {
        name: storefrontForm.name.trim(),
        category: storefrontForm.category,
        city: storefrontForm.city,
        address: storefrontForm.address.trim(),
        contactPhone: storefrontForm.contactPhone.trim(),
        email: storefrontForm.email.trim(),
        startingPrice: Number(storefrontForm.startingPrice) || 0,
        priceUnit: storefrontForm.priceUnit,
        vegPlate: Number(storefrontForm.vegPlate) || 0,
        nonVegPlate: Number(storefrontForm.nonVegPlate) || 0,
        capacity: Number(storefrontForm.capacity) || 0,
        responseTime: storefrontForm.responseTime,
        description: storefrontForm.description.trim(),
        highlights: storefrontForm.highlights
      }

      const res = await fetch(`/api/vendors/${activeVendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update storefront details')

      setActiveVendor(prev => ({ ...prev, ...data }))
      setVendorsList(prev => prev.map(v => v.id === activeVendor.id ? { ...v, ...data } : v))
      toast.success('Storefront details & pricing updated successfully in database!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingStorefront(false)
    }
  }

  // SAVE BANK & KYC DETAILS
  const handleSaveBank = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!activeVendor?.id) return

    setSavingBank(true)
    try {
      const token = authToken || localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token')
      const payload = {
        ...bankForm,
        kycStatus: activeVendor.verified ? 'verified' : 'pending_review',
        verificationRequestedAt: new Date().toISOString()
      }
      const res = await fetch(`/api/vendors/${activeVendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update bank & ID details')

      setActiveVendor(prev => ({ ...prev, ...data }))
      setVendorsList(prev => prev.map(v => v.id === activeVendor.id ? { ...v, ...data } : v))
      toast.success('KYC ID details & bank coordinates saved for admin verification!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingBank(false)
    }
  }

  // UPDATE SINGLE PHOTO OR KYC DOCUMENT
  const handleUpdateSinglePhoto = async (photoType, fileOrUrl) => {
    if (!activeVendor?.id) {
      toast.error('No vendor selected')
      return
    }

    const isCover = photoType === 'cover'
    const isHero = photoType === 'hero'
    const isVerification = photoType === 'verification'
    const isPan = photoType === 'pan'
    const isAadhaarFront = photoType === 'aadhaar_front'
    const isAadhaarBack = photoType === 'aadhaar_back'
    const isGst = photoType === 'gst'

    if (isCover) setUploadingCover(true)
    if (isHero) setUploadingHero(true)
    if (isVerification) setUploadingVerification(true)
    if (isPan) setUploadingPanDoc(true)
    if (isAadhaarFront) setUploadingAadhaarFront(true)
    if (isAadhaarBack) setUploadingAadhaarBack(true)
    if (isGst) setUploadingGstDoc(true)

    try {
      let finalImageUrl = fileOrUrl
      if (typeof fileOrUrl !== 'string') {
        finalImageUrl = await compressImage(fileOrUrl, 1400, 1400, 0.85)
      }

      if (!finalImageUrl) throw new Error('No valid image provided')

      const token = authToken || localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token')
      const payload = {}
      if (isCover) payload.image = finalImageUrl
      if (isHero) payload.heroImage = finalImageUrl
      if (isVerification) payload.verificationSelfie = finalImageUrl
      if (isPan) payload.panDoc = finalImageUrl
      if (isAadhaarFront) payload.aadhaarDocFront = finalImageUrl
      if (isAadhaarBack) payload.aadhaarDocBack = finalImageUrl
      if (isGst) payload.gstDoc = finalImageUrl

      if (isPan || isAadhaarFront || isAadhaarBack || isGst || isVerification) {
        payload.kycStatus = 'pending_review'
        payload.status = 'pending'
      }

      const res = await fetch(`/api/vendors/${activeVendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update photo/document')

      setActiveVendor(prev => ({ ...prev, ...data }))
      setVendorsList(prev => prev.map(v => v.id === activeVendor.id ? { ...v, ...data } : v))
      
      const successLabels = {
        pan: 'PAN Card document photo uploaded successfully!',
        aadhaar_front: 'Aadhaar Card Front photo uploaded successfully!',
        aadhaar_back: 'Aadhaar Card Back photo uploaded successfully!',
        gst: 'GST Certificate document uploaded successfully!',
        verification: 'On-site verification photo updated and submitted for review!',
        cover: 'Cover photo updated successfully!',
        hero: 'Hero banner updated successfully!'
      }
      toast.success(successLabels[photoType] || 'Document updated successfully!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      if (isCover) setUploadingCover(false)
      if (isHero) setUploadingHero(false)
      if (isVerification) setUploadingVerification(false)
      if (isPan) setUploadingPanDoc(false)
      if (isAadhaarFront) setUploadingAadhaarFront(false)
      if (isAadhaarBack) setUploadingAadhaarBack(false)
      if (isGst) setUploadingGstDoc(false)
    }
  }

  // ADD PHOTO TO PORTFOLIO GALLERY
  const handleAddGalleryPhoto = async (fileOrUrl) => {
    if (!activeVendor?.id) return
    setUploadingGallery(true)
    try {
      let finalImageUrl = fileOrUrl
      if (typeof fileOrUrl !== 'string') {
        finalImageUrl = await compressImage(fileOrUrl, 1200, 1200, 0.8)
      }

      if (!finalImageUrl) throw new Error('No image provided')

      const currentGallery = Array.isArray(activeVendor.gallery) ? [...activeVendor.gallery] : []
      const updatedGallery = [finalImageUrl, ...currentGallery]

      const token = authToken || localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token')
      const res = await fetch(`/api/vendors/${activeVendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ gallery: updatedGallery })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add photo to gallery')

      setActiveVendor(prev => ({ ...prev, gallery: data.gallery || updatedGallery }))
      setVendorsList(prev => prev.map(v => v.id === activeVendor.id ? { ...v, gallery: data.gallery || updatedGallery } : v))
      toast.success('Photo added to gallery portfolio!')
      setCustomGalleryUrl('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploadingGallery(false)
    }
  }

  // DELETE PHOTO FROM GALLERY
  const handleDeleteGalleryPhoto = async (photoIndex) => {
    if (!activeVendor?.id) return
    const currentGallery = Array.isArray(activeVendor.gallery) ? [...activeVendor.gallery] : []
    const updatedGallery = currentGallery.filter((_, idx) => idx !== photoIndex)

    try {
      const token = authToken || localStorage.getItem('vv_token') || localStorage.getItem('vv_auth_token')
      const res = await fetch(`/api/vendors/${activeVendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ gallery: updatedGallery })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete photo')

      setActiveVendor(prev => ({ ...prev, gallery: updatedGallery }))
      setVendorsList(prev => prev.map(v => v.id === activeVendor.id ? { ...v, gallery: updatedGallery } : v))
      toast.success('Photo removed from gallery')
    } catch (err) {
      toast.error(err.message)
    }
  }

  // SET GALLERY PHOTO AS PRIMARY COVER
  const handleSetAsCover = async (photoUrl) => {
    await handleUpdateSinglePhoto('cover', photoUrl)
  }

  // ADD HIGHLIGHT TAG
  const handleAddHighlight = (e) => {
    e.preventDefault()
    if (!newHighlight.trim()) return
    if (storefrontForm.highlights.includes(newHighlight.trim())) {
      toast.error('Highlight already added')
      return
    }
    setStorefrontForm(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight.trim()]
    }))
    setNewHighlight('')
  }

  // REMOVE HIGHLIGHT TAG
  const handleRemoveHighlight = (tag) => {
    setStorefrontForm(prev => ({
      ...prev,
      highlights: prev.highlights.filter(h => h !== tag)
    }))
  }

  // TOGGLE BLACKOUT DATE
  const handleToggleBlockDate = async (e) => {
    e.preventDefault()
    if (!blockDateInput) return
    const exists = blockedDates.some(b => b.date === blockDateInput)
    let nextBlocked = []
    if (exists) {
      nextBlocked = blockedDates.filter(b => b.date !== blockDateInput)
      toast.info(`Date ${blockDateInput} unblocked!`)
    } else {
      nextBlocked = [{ date: blockDateInput, reason: blockReasonInput || 'Private Event / Blocked' }, ...blockedDates]
      toast.success(`Date ${blockDateInput} blocked on calendar!`)
    }
    setBlockedDates(nextBlocked)
    setBlockDateInput('')
    setBlockReasonInput('')

    // Save to vendor record
    if (activeVendor?.id) {
      const token = authToken || localStorage.getItem('vv_token')
      await fetch(`/api/vendors/${activeVendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ blackoutDates: nextBlocked })
      }).catch(() => {})
    }
  }

  // LEAD ACTIONS
  const handleAcceptOffer = (leadId) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'ACCEPTED' } : l))
    toast.success('Offer Accepted! Customer notified to deposit 20% token advance.')
  }

  const handleDeclineOffer = (leadId) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'DECLINED' } : l))
    toast.error('Offer declined.')
  }

  const handleSendCounter = (e) => {
    e.preventDefault()
    if (!counterPriceInput) {
      toast.error('Please enter a valid counter price')
      return
    }
    const priceNum = Number(counterPriceInput)
    setLeads(prev => prev.map(l => l.id === activeCounterLead.id ? {
      ...l,
      status: 'COUNTER_SENT',
      counterPrice: priceNum,
      notes: counterNotesInput || l.notes
    } : l))
    toast.success(`Counter-offer of ₹${priceNum.toLocaleString('en-IN')} sent to customer!`)
    setActiveCounterLead(null)
    setCounterPriceInput('')
    setCounterNotesInput('')
  }

  const openWhatsAppLead = (lead) => {
    const cleanPhone = (lead.userPhone || lead.phone || '+919876543210').replace(/\D/g, '')
    const msg = encodeURIComponent(`Namaste ${lead.userName || lead.clientName || 'Partner'}! This is regarding your wedding inquiry on Vows & Venues. We are pleased to assist you with dates and special packages.`)
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
  }

  // 1. UNLOGGED VIEW: DIRECT INLINE VENDOR LOGIN / REGISTER GATEWAY
  if (!authToken && !authLoading) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xl text-stone-900 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-serif text-2xl font-bold shadow-md">
            V
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Vendor Partner Console</h2>
          <p className="text-xs text-stone-500">
            Sign in or register your business to manage storefront photos, royal banquet pricing, and client bookings.
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Register */}
        <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Vendor Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'register' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Register Partner
          </button>
        </div>

        {/* SIGN IN FORM */}
        {authMode === 'login' ? (
          <form onSubmit={handlePortalLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-stone-700">Vendor Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="vendor@example.com or admin@vowsandvenues.in"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginBusy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loginBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{loginBusy ? 'Authenticating...' : 'Enter Partner Dashboard'}</span>
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handlePortalRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-stone-700">Business / Storefront Name *</label>
              <input
                type="text"
                required
                value={regBusinessName}
                onChange={e => setRegBusinessName(e.target.value)}
                placeholder="e.g. Royal Nawabi Heritage Hall"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-stone-700">Category *</label>
                <select
                  value={regCategory}
                  onChange={e => setRegCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label.split('/')[0]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700">City *</label>
                <select
                  value={regCity}
                  onChange={e => setRegCity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  {POPULAR_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-stone-700">Contact Person *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Manager Name"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700">Login Email *</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="partner@yourvenue.com"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700">Password *</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="Create secure password"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loginBusy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loginBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loginBusy ? 'Creating Storefront...' : 'Register Vendor Storefront'}</span>
            </button>
          </form>
        )}
      </div>
    )
  }

  // 2. LOADING STATE
  if (loadingVendor && !activeVendor) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-stone-500">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
        <span className="text-xs font-semibold">Loading Vendor Storefront Data...</span>
      </div>
    )
  }

  // 3. FALLBACK IF NO VENDOR FOUND
  if (!activeVendor) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-4 max-w-lg mx-auto">
        <Building2 className="w-12 h-12 text-amber-600 mx-auto" />
        <h3 className="font-serif text-xl font-bold">No Vendor Storefront Associated</h3>
        <p className="text-xs text-stone-500">
          Your account is currently active, but does not have a linked vendor profile. Click below to initialize your storefront profile.
        </p>
        <button
          onClick={() => {
            if (vendorsList.length > 0) setActiveVendor(vendorsList[0])
            else toast.info('Please create a vendor profile from registration')
          }}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs"
        >
          Load Storefront Console
        </button>
      </div>
    )
  }

  const isVerified = activeVendor.verified || activeVendor.status === 'verified'
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin'

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Top Banner with Storefront Identity, Verification Badge, and Switcher */}
      <div className="bg-gradient-to-r from-stone-900 via-[#1e1c18] to-stone-900 text-white rounded-3xl p-4 sm:p-7 border border-amber-500/20 shadow-2xl max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 max-w-full">
          <div className="flex items-center gap-3 sm:gap-4 max-w-full min-w-0">
            {/* Vendor Avatar or Logo */}
            <div className="relative shrink-0">
              <img
                src={activeVendor.image || 'https://images.unsplash.com/photo-1545232979-fbf675432098?auto=format&fit=crop&w=400&q=80'}
                alt={activeVendor.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-400/40 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-stone-900">
                {isVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400" />
                )}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isVerified
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isVerified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  <span>{isVerified ? 'Verified Official Partner' : 'Verification Pending Review'}</span>
                </span>

                <span className="text-[10px] text-stone-400 font-mono">ID: {activeVendor.id}</span>
              </div>

              <h1 className="font-serif text-lg sm:text-2xl font-bold text-white truncate">{activeVendor.name}</h1>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 mt-0.5">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-400" /> {activeVendor.city}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {activeVendor.rating || 4.9} ({activeVendor.reviewCount || 0})</span>
                <span className="text-amber-300 font-mono font-bold">₹{((activeVendor.startingPrice || 50000) / 1000).toFixed(0)}k {activeVendor.priceUnit || 'per event'}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Storefront Switcher (for Admins / Multi-property owners) */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {isSuperAdmin && vendorsList.length > 1 && (
              <div className="bg-stone-800/90 border border-stone-700 rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-xs">
                <span className="text-stone-400 text-[10px] font-bold uppercase">Storefront:</span>
                <select
                  value={activeVendor.id}
                  onChange={(e) => {
                    const found = vendorsList.find(v => v.id === e.target.value)
                    if (found) setActiveVendor(found)
                  }}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
                >
                  {vendorsList.map(v => (
                    <option key={v.id} value={v.id} className="bg-stone-900 text-white">{v.name} ({v.city})</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile-Friendly Scrollable Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-white/10 text-xs no-scrollbar touch-pan-x">
          {[
            { id: 'photos', label: `📸 Photos & Gallery (${(activeVendor.gallery || []).length + 2})`, icon: ImageIcon },
            { id: 'storefront', label: '✏️ Details & Pricing', icon: Building2 },
            { id: 'kyc_finance', label: '🛡️ KYC & ID Proofs', icon: ShieldCheck },
            { id: 'calendar', label: `📅 Calendar (${blockedDates.length})`, icon: CalendarDays },
            { id: 'negotiations', label: `💬 Inquiries (${leads.length})`, icon: MessageSquare },
            { id: 'overview', label: '📊 Performance', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-md scale-[1.02]'
                    : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: 📸 PHOTOS & PORTFOLIO GALLERY MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {/* Section Description */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm mb-0.5">Mobile Photo Updates Direct to Live Website</span>
              <p className="text-amber-900/90 leading-relaxed">
                Photos uploaded here appear instantly on your marketplace listing, cards, and customer proposal pages. High-resolution photos from your mobile camera are automatically optimized for instant loading.
              </p>
            </div>
          </div>

          {/* 1. PRIMARY COVER PHOTO & 2. HERO PANORAMIC BANNER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* A. PRIMARY COVER PHOTO */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">Primary Storefront Photo</h3>
                  <span className="text-[11px] text-stone-500">Main photo shown on search &amp; category cards</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded">Card View</span>
              </div>

              {/* Cover Preview */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner group">
                <img
                  src={activeVendor.image || 'https://images.unsplash.com/photo-1545232979-fbf675432098?auto=format&fit=crop&w=800&q=80'}
                  alt="Storefront Cover"
                  className="w-full h-full object-cover"
                />
                {uploadingCover && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                    <span className="text-xs font-bold">Compressing &amp; Saving...</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-2.5">
                {/* Hidden File Inputs */}
                <input
                  ref={coverCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handleUpdateSinglePhoto('cover', f)
                  }}
                />
                <input
                  ref={coverFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handleUpdateSinglePhoto('cover', f)
                  }}
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={uploadingCover}
                    onClick={() => coverCameraRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    disabled={uploadingCover}
                    onClick={() => coverFileRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-300 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 text-stone-600" />
                    <span>Choose from Device</span>
                  </button>
                </div>

                {/* Or paste URL */}
                <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="Or paste direct image URL..."
                    value={customCoverUrl}
                    onChange={e => setCustomCoverUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border rounded-xl"
                  />
                  <button
                    type="button"
                    disabled={!customCoverUrl || uploadingCover}
                    onClick={() => {
                      if (customCoverUrl) {
                        handleUpdateSinglePhoto('cover', customCoverUrl)
                        setCustomCoverUrl('')
                      }
                    }}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shrink-0 disabled:opacity-40"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>

            {/* B. HERO PANORAMIC BANNER */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">Hero Panoramic Banner</h3>
                  <span className="text-[11px] text-stone-500">Wide showcase header at top of your storefront page</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded">Panoramic</span>
              </div>

              {/* Hero Preview */}
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner group">
                <img
                  src={activeVendor.heroImage || activeVendor.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'}
                  alt="Hero Banner"
                  className="w-full h-full object-cover"
                />
                {uploadingHero && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                    <span className="text-xs font-bold">Compressing &amp; Saving...</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-2.5">
                <input
                  ref={heroCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handleUpdateSinglePhoto('hero', f)
                  }}
                />
                <input
                  ref={heroFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handleUpdateSinglePhoto('hero', f)
                  }}
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={uploadingHero}
                    onClick={() => heroCameraRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    disabled={uploadingHero}
                    onClick={() => heroFileRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-300 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 text-stone-600" />
                    <span>Choose from Device</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="Or paste panoramic banner URL..."
                    value={customHeroUrl}
                    onChange={e => setCustomHeroUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border rounded-xl"
                  />
                  <button
                    type="button"
                    disabled={!customHeroUrl || uploadingHero}
                    onClick={() => {
                      if (customHeroUrl) {
                        handleUpdateSinglePhoto('hero', customHeroUrl)
                        setCustomHeroUrl('')
                      }
                    }}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shrink-0 disabled:opacity-40"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MULTI-PHOTO PORTFOLIO GALLERY */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Portfolio Gallery ({Array.isArray(activeVendor.gallery) ? activeVendor.gallery.length : 0} Photos)
                </h3>
                <p className="text-xs text-stone-500">
                  Showcase stage decor, royal mandap setups, dining halls, bridal suites, and evening lighting.
                </p>
              </div>

              {/* Add Photo Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  ref={galleryCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handleAddGalleryPhoto(f)
                  }}
                />
                <input
                  ref={galleryFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async e => {
                    const files = Array.from(e.target.files || [])
                    if (files.length === 0) return
                    for (const file of files) {
                      await handleAddGalleryPhoto(file)
                    }
                  }}
                />

                <button
                  type="button"
                  disabled={uploadingGallery}
                  onClick={() => galleryCameraRef.current?.click()}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>Click Photo</span>
                </button>

                <button
                  type="button"
                  disabled={uploadingGallery}
                  onClick={() => galleryFileRef.current?.click()}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Upload from Device</span>
                </button>
              </div>
            </div>

            {/* Quick URL Adder */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-2 text-xs">
              <span className="font-bold text-stone-700 shrink-0">Add via Web Link:</span>
              <input
                type="url"
                placeholder="Paste high-res image URL (e.g. https://images.unsplash.com/...)"
                value={customGalleryUrl}
                onChange={e => setCustomGalleryUrl(e.target.value)}
                className="flex-1 w-full px-3 py-1.5 border rounded-lg bg-white"
              />
              <button
                type="button"
                disabled={!customGalleryUrl || uploadingGallery}
                onClick={() => {
                  if (customGalleryUrl) handleAddGalleryPhoto(customGalleryUrl)
                }}
                className="w-full sm:w-auto px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg disabled:opacity-50 shrink-0"
              >
                Add to Gallery
              </button>
            </div>

            {/* Gallery Grid */}
            {uploadingGallery && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-2 text-amber-900 text-xs font-bold">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
                <span>Optimizing and uploading photo...</span>
              </div>
            )}

            {Array.isArray(activeVendor.gallery) && activeVendor.gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {activeVendor.gallery.map((imgUrl, index) => {
                  const isCurrentCover = activeVendor.image === imgUrl
                  return (
                    <div
                      key={index}
                      className="group relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-[4/3] shadow-xs flex flex-col justify-between"
                    >
                      <img
                        src={imgUrl}
                        alt={`Gallery Photo ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Top Action Buttons Overlay */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryPhoto(index)}
                          className="w-7 h-7 rounded-lg bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom Info / Cover Button */}
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-[10px]">
                        <span className="font-mono font-bold">#{index + 1}</span>
                        {isCurrentCover ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold uppercase text-[9px]">
                            Primary Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetAsCover(imgUrl)}
                            className="px-2 py-0.5 rounded bg-white/20 hover:bg-white text-white hover:text-black font-bold transition-all text-[9px]"
                          >
                            Set as Cover
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl space-y-2">
                <ImageIcon className="w-10 h-10 text-stone-400 mx-auto" />
                <span className="font-bold text-sm text-stone-700 block">No Gallery Photos Yet</span>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Click the buttons above to click live photos with your mobile camera or upload from your device.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ✏️ STOREFRONT DETAILS & PRICING */}
      {/* ======================================================== */}
      {activeTab === 'storefront' && (
        <form onSubmit={handleSaveStorefront} className="space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Storefront Identity &amp; Location</h3>
                <p className="text-stone-500">How your property or service appears to couples across India</p>
              </div>

              {/* Top Save Button */}
              <button
                type="submit"
                disabled={savingStorefront}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {savingStorefront ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <Save className="w-4 h-4 text-amber-400" />}
                <span>{savingStorefront ? 'Saving to Database...' : 'Save All Changes'}</span>
              </button>
            </div>

            {/* Business Name, Category, City */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Storefront / Business Name *</label>
                <input
                  type="text"
                  required
                  value={storefrontForm.name}
                  onChange={e => setStorefrontForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Service Category *</label>
                <select
                  value={storefrontForm.category}
                  onChange={e => setStorefrontForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white font-semibold"
                >
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Primary City Location *</label>
                <select
                  value={storefrontForm.city}
                  onChange={e => setStorefrontForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white font-semibold"
                >
                  {POPULAR_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address & Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Detailed Venue Address / Landmark</label>
                <input
                  type="text"
                  value={storefrontForm.address}
                  onChange={e => setStorefrontForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. Near Hazratganj Crossing, Lucknow"
                  className="w-full px-3 py-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">WhatsApp / Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={storefrontForm.contactPhone}
                  onChange={e => setStorefrontForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Official Inquiry Email</label>
                <input
                  type="email"
                  value={storefrontForm.email}
                  onChange={e => setStorefrontForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white font-mono"
                />
              </div>
            </div>

            {/* Pricing & Capacity */}
            <div className="pt-3 border-t border-stone-100">
              <h4 className="font-serif font-bold text-base text-stone-900 mb-3">Pricing &amp; Guest Capacity (Marketplace Figures)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Starting Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={storefrontForm.startingPrice}
                    onChange={e => setStorefrontForm(prev => ({ ...prev, startingPrice: e.target.value }))}
                    className="w-full px-3 py-2.5 border rounded-xl bg-white font-mono font-bold text-sm text-amber-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price Unit</label>
                  <select
                    value={storefrontForm.priceUnit}
                    onChange={e => setStorefrontForm(prev => ({ ...prev, priceUnit: e.target.value }))}
                    className="w-full px-3 py-2.5 border rounded-xl bg-white font-semibold"
                  >
                    <option value="per day">per day (Heritage Venues)</option>
                    <option value="per event">per event (Decor &amp; Cinema)</option>
                    <option value="per plate">per plate (Banquet &amp; Catering)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Veg Per-Plate Rate (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={storefrontForm.vegPlate}
                    onChange={e => setStorefrontForm(prev => ({ ...prev, vegPlate: e.target.value }))}
                    className="w-full px-3 py-2.5 border rounded-xl bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Non-Veg Per-Plate Rate (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={storefrontForm.nonVegPlate}
                    onChange={e => setStorefrontForm(prev => ({ ...prev, nonVegPlate: e.target.value }))}
                    className="w-full px-3 py-2.5 border rounded-xl bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Response Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Maximum Guest Capacity (Pax)</label>
                <input
                  type="number"
                  min={0}
                  value={storefrontForm.capacity}
                  onChange={e => setStorefrontForm(prev => ({ ...prev, capacity: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Response Time SLA</label>
                <select
                  value={storefrontForm.responseTime}
                  onChange={e => setStorefrontForm(prev => ({ ...prev, responseTime: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white font-semibold"
                >
                  <option value="< 30 mins">&lt; 30 mins (Elite Partner)</option>
                  <option value="< 1 hour">&lt; 1 hour (Fast Response)</option>
                  <option value="< 2 hours">&lt; 2 hours (Standard)</option>
                  <option value="Within 24 hours">Within 24 hours</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">Detailed Venue / Vendor Description</label>
              <textarea
                rows={4}
                value={storefrontForm.description}
                onChange={e => setStorefrontForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your heritage architecture, lawns, valet parking, royal mandap experience, bridal suites, catering options..."
                className="w-full px-3 py-2.5 border rounded-xl bg-white leading-relaxed"
              />
            </div>

            {/* Highlights Tag Manager */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">Highlights &amp; Amenities</label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {storefrontForm.highlights.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold border border-stone-200"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(tag)}
                      className="text-stone-400 hover:text-rose-600 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 500-Vehicle Valet Parking, Private Lakefront Lawn, In-House Royal Catering"
                  value={newHighlight}
                  onChange={e => setNewHighlight(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddHighlight(e)
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded-xl bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 font-bold rounded-xl text-stone-800 shrink-0"
                >
                  + Add Tag
                </button>
              </div>
            </div>

            {/* Bottom Save Button */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-stone-500 text-[11px]">
                Last updated in database: {activeVendor.updatedAt ? new Date(activeVendor.updatedAt).toLocaleTimeString() : 'Recently'}
              </span>

              <button
                type="submit"
                disabled={savingStorefront}
                className="px-7 py-3 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {savingStorefront ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <Save className="w-4 h-4 text-amber-400" />}
                <span>{savingStorefront ? 'Saving Changes...' : 'Save Storefront Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 3: 🛡️ GOVERNMENT ID PROOFS & BANK KYC */}
      {/* ======================================================== */}
      {activeTab === 'kyc_finance' && (
        <form onSubmit={handleSaveBank} className="space-y-6">
          {/* Hidden File & Camera Inputs for all documents */}
          <input
            ref={panCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            id="kyc-pan-camera"
            data-testid="kyc-pan-camera"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleUpdateSinglePhoto('pan', f)
            }}
          />
          <input
            ref={panFileRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            id="kyc-pan-file"
            data-testid="kyc-pan-file"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleUpdateSinglePhoto('pan', f)
            }}
          />

          <input
            ref={aadhaarFrontCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            id="kyc-aadhaar-front-camera"
            data-testid="kyc-aadhaar-front-camera"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleUpdateSinglePhoto('aadhaar_front', f)
            }}
          />
          <input
            ref={aadhaarFrontFileRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            id="kyc-aadhaar-front-file"
            data-testid="kyc-aadhaar-front-file"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleUpdateSinglePhoto('aadhaar_front', f)
            }}
          />

          <input
            ref={aadhaarBackCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            id="kyc-aadhaar-back-camera"
            data-testid="kyc-aadhaar-back-camera"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleUpdateSinglePhoto('aadhaar_back', f)
            }}
          />
          <input
            ref={aadhaarBackFileRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            id="kyc-aadhaar-back-file"
            data-testid="kyc-aadhaar-back-file"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleUpdateSinglePhoto('aadhaar_back', f)
            }}
          />

          <input
            ref={gstCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            id="kyc-gst-camera"
            data-testid="kyc-gst-camera"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleUpdateSinglePhoto('gst', f)
            }}
          />
          <input
            ref={gstFileRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            id="kyc-gst-file"
            data-testid="kyc-gst-file"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleUpdateSinglePhoto('gst', f)
            }}
          />

          <input
            ref={verificationCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            id="kyc-verification-camera"
            data-testid="kyc-verification-camera"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleUpdateSinglePhoto('verification', f)
            }}
          />
          <input
            ref={verificationFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="kyc-verification-file"
            data-testid="kyc-verification-file"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleUpdateSinglePhoto('verification', f)
            }}
          />

          {/* 1. COMPLIANCE & STATUS HEADER */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Vendor KYC &amp; Government ID Proofs (पहचान व कर प्रमाण पत्र)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Upload your PAN Card, Aadhaar Card, GST/e-GST Certificate, and Escrow Bank details for admin verification and storefront activation.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Verified Official Partner • Escrow Active</span>
                  </span>
                ) : activeVendor.kycStatus === 'rejected' ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    <XCircle className="w-4 h-4 text-rose-700" />
                    <span>KYC Needs Revision • Re-upload Proofs</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Submitted • Pending Admin Verification</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/80 text-xs text-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Compliance Protocol:</strong> Photos are encrypted and stored safely. Our compliance team verifies your business credentials within 2–4 hours to enable direct customer inquiries and token payment releases.
                </span>
              </div>
              <div className="text-[11px] font-mono font-bold text-amber-900 bg-white/80 px-3 py-1 rounded-lg border border-amber-200 shrink-0">
                Docs Uploaded: {[activeVendor.panDoc, activeVendor.aadhaarDocFront, activeVendor.aadhaarDocBack, activeVendor.gstDoc, activeVendor.verificationSelfie].filter(Boolean).length} / 5
              </div>
            </div>
          </div>

          {/* CARD 1: PAN CARD (Permanent Account Number) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-amber-700" />
                <div>
                  <h4 className="font-serif font-bold text-base text-stone-900">
                    1. PAN Card Details (स्थायी खाता संख्या)
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Mandatory for tax compliance, invoicing, and escrow settlement payouts.
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                activeVendor.panDoc ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'
              }`}>
                {activeVendor.panDoc ? '✓ Document Uploaded' : 'Photo Required'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">PAN Number *</label>
                <input
                  type="text"
                  maxLength={10}
                  value={bankForm.pan}
                  onChange={e => setBankForm(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-mono font-bold uppercase tracking-wider text-sm"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">10-character alphanumeric PAN</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Name as per PAN Card *</label>
                <input
                  type="text"
                  value={bankForm.panName}
                  onChange={e => setBankForm(prev => ({ ...prev, panName: e.target.value }))}
                  placeholder="e.g. Asad Mirza / Asad Mirza Hospitality"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-semibold text-sm"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">Must match exactly with your PAN card</span>
              </div>
            </div>

            {/* PAN Card Photo Upload Box */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-center gap-4">
              <div className="relative shrink-0">
                {activeVendor.panDoc ? (
                  <img
                    src={activeVendor.panDoc}
                    alt="PAN Card Document"
                    className="w-32 h-24 object-cover rounded-xl border-2 border-amber-400 shadow-sm bg-white"
                  />
                ) : (
                  <div className="w-32 h-24 rounded-xl border-2 border-dashed border-stone-300 bg-stone-100 flex flex-col items-center justify-center text-stone-400">
                    <FileText className="w-6 h-6 mb-1 text-stone-400" />
                    <span className="text-[10px] font-bold">No PAN Photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h5 className="font-bold text-xs text-stone-900">PAN Card Document Photo</h5>
                  {activeVendor.panDoc && (
                    <button
                      type="button"
                      onClick={() => setPreviewDocModal({ title: 'PAN Card Document Proof', url: activeVendor.panDoc })}
                      className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Full Resolution</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Capture a clear photo of the original PAN card. Ensure name, photo, and 10-digit number are clearly visible without flash glare.
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    disabled={uploadingPanDoc}
                    onClick={() => panCameraRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{uploadingPanDoc ? 'Compressing...' : 'Capture PAN Photo'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={uploadingPanDoc}
                    onClick={() => panFileRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    <span>Upload PAN File</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: AADHAAR CARD (12 Digits UIDAI) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <div>
                  <h4 className="font-serif font-bold text-base text-stone-900">
                    2. Aadhaar Card Verification (आधार कार्ड)
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Primary identity and address verification as required for vendor escrow registration.
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                (activeVendor.aadhaarDocFront && activeVendor.aadhaarDocBack)
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : activeVendor.aadhaarDocFront
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-stone-100 text-stone-500'
              }`}>
                {(activeVendor.aadhaarDocFront && activeVendor.aadhaarDocBack)
                  ? '✓ Both Sides Uploaded'
                  : activeVendor.aadhaarDocFront
                    ? 'Front Side Uploaded (Back Pending)'
                    : 'Photos Required'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Aadhaar Number (12 Digits) *</label>
                <input
                  type="text"
                  maxLength={14}
                  value={bankForm.aadhaar}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 12)
                    setBankForm(prev => ({ ...prev, aadhaar: val }))
                  }}
                  placeholder="e.g. 5678 1234 9876"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-mono font-bold text-sm tracking-wider"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">12-digit UIDAI number</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Name as per Aadhaar Card *</label>
                <input
                  type="text"
                  value={bankForm.aadhaarName}
                  onChange={e => setBankForm(prev => ({ ...prev, aadhaarName: e.target.value }))}
                  placeholder="e.g. Asad Mirza"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-semibold text-sm"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">Exact name printed on your Aadhaar</span>
              </div>
            </div>

            {/* Aadhaar Two-Sided Document Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Front Side */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">Side 1: Aadhaar Front Photo (फोटो साइड)</span>
                  {activeVendor.aadhaarDocFront && (
                    <button
                      type="button"
                      onClick={() => setPreviewDocModal({ title: 'Aadhaar Card Front Photo', url: activeVendor.aadhaarDocFront })}
                      className="text-[11px] text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {activeVendor.aadhaarDocFront ? (
                    <img
                      src={activeVendor.aadhaarDocFront}
                      alt="Aadhaar Front"
                      className="w-24 h-16 object-cover rounded-lg border border-amber-300 shadow-xs bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-16 rounded-lg border-2 border-dashed border-stone-300 bg-stone-100 flex flex-col items-center justify-center text-stone-400 shrink-0">
                      <FileText className="w-4 h-4 mb-0.5 text-stone-400" />
                      <span className="text-[9px]">Front Side</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 flex-1">
                    <button
                      type="button"
                      disabled={uploadingAadhaarFront}
                      onClick={() => aadhaarFrontCameraRef.current?.click()}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-3 h-3" />
                      <span>{uploadingAadhaarFront ? 'Uploading...' : 'Capture Front'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={uploadingAadhaarFront}
                      onClick={() => aadhaarFrontFileRef.current?.click()}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3 h-3 text-stone-500" />
                      <span>Upload File</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Back Side */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">Side 2: Aadhaar Back Photo (पता साइड)</span>
                  {activeVendor.aadhaarDocBack && (
                    <button
                      type="button"
                      onClick={() => setPreviewDocModal({ title: 'Aadhaar Card Back Photo (Address)', url: activeVendor.aadhaarDocBack })}
                      className="text-[11px] text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {activeVendor.aadhaarDocBack ? (
                    <img
                      src={activeVendor.aadhaarDocBack}
                      alt="Aadhaar Back"
                      className="w-24 h-16 object-cover rounded-lg border border-amber-300 shadow-xs bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-16 rounded-lg border-2 border-dashed border-stone-300 bg-stone-100 flex flex-col items-center justify-center text-stone-400 shrink-0">
                      <FileText className="w-4 h-4 mb-0.5 text-stone-400" />
                      <span className="text-[9px]">Back Side</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 flex-1">
                    <button
                      type="button"
                      disabled={uploadingAadhaarBack}
                      onClick={() => aadhaarBackCameraRef.current?.click()}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-3 h-3" />
                      <span>{uploadingAadhaarBack ? 'Uploading...' : 'Capture Back'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={uploadingAadhaarBack}
                      onClick={() => aadhaarBackFileRef.current?.click()}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3 h-3 text-stone-500" />
                      <span>Upload File</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: GST / e-GST REGISTRATION */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-700" />
                <div>
                  <h4 className="font-serif font-bold text-base text-stone-900">
                    3. GST / e-GST Registration Details (वस्तु एवं सेवा कर)
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Fill in your official GSTIN or indicate composition / exemption status.
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                activeVendor.gstDoc ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'
              }`}>
                {activeVendor.gstDoc ? '✓ Certificate Uploaded' : 'Optional / If Applicable'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">GSTIN (15 Digits)</label>
                <input
                  type="text"
                  maxLength={15}
                  value={bankForm.gstin}
                  onChange={e => setBankForm(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                  placeholder="e.g. 09AABCN8291F1Z4"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-mono font-bold uppercase text-sm"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">State code + PAN + 1Z4 format</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Registered Business / Trade Name</label>
                <input
                  type="text"
                  value={bankForm.gstBusinessName}
                  onChange={e => setBankForm(prev => ({ ...prev, gstBusinessName: e.target.value }))}
                  placeholder="e.g. Asad Mirza Banquets &amp; Resorts LLP"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-semibold text-sm"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">Trade name on GST certificate</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Registration Scheme</label>
                <select
                  value={bankForm.gstType}
                  onChange={e => setBankForm(prev => ({ ...prev, gstType: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-semibold text-sm"
                >
                  <option value="regular">Regular Taxpayer (18% / 5% GST)</option>
                  <option value="composition">Composition Scheme (1% / 5%)</option>
                  <option value="exempt">Turnover &lt; ₹20L / Exempted / Unregistered</option>
                </select>
                <span className="text-[10px] text-stone-400 mt-1 block">Applicable tax classification</span>
              </div>
            </div>

            {/* GST Certificate Photo Upload Box */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-center gap-4">
              <div className="relative shrink-0">
                {activeVendor.gstDoc ? (
                  <img
                    src={activeVendor.gstDoc}
                    alt="GST Certificate"
                    className="w-32 h-24 object-cover rounded-xl border-2 border-amber-400 shadow-sm bg-white"
                  />
                ) : (
                  <div className="w-32 h-24 rounded-xl border-2 border-dashed border-stone-300 bg-stone-100 flex flex-col items-center justify-center text-stone-400">
                    <Building2 className="w-6 h-6 mb-1 text-stone-400" />
                    <span className="text-[10px] font-bold">No GST Doc</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h5 className="font-bold text-xs text-stone-900">GST Registration Certificate Photo</h5>
                  {activeVendor.gstDoc && (
                    <button
                      type="button"
                      onClick={() => setPreviewDocModal({ title: 'GST Registration Certificate', url: activeVendor.gstDoc })}
                      className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Full Resolution</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Upload a clear snapshot or photo of your Form GST REG-06 registration certificate or e-GST dashboard profile.
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    disabled={uploadingGstDoc}
                    onClick={() => gstCameraRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{uploadingGstDoc ? 'Compressing...' : 'Capture Certificate'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={uploadingGstDoc}
                    onClick={() => gstFileRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    <span>Upload Certificate Doc</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: ESCROW BANK ACCOUNT COORDINATES */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-5 h-5 text-amber-700" />
                <div>
                  <h4 className="font-serif font-bold text-base text-stone-900">
                    4. Escrow Payout Bank Account Coordinates (बैंक खाता विवरण)
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Official business bank account where customer token advances and milestone payments are transferred.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Beneficiary Account Name *</label>
                <input
                  type="text"
                  value={bankForm.accountHolder}
                  onChange={e => setBankForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                  placeholder="e.g. Asad Mirza Hospitality Pvt Ltd"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-semibold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Bank Name &amp; Branch *</label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={e => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g. HDFC Bank, Hazratganj Branch"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-semibold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Account Number *</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={e => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="e.g. 50200088991122"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">IFSC Code *</label>
                <input
                  type="text"
                  value={bankForm.ifsc}
                  onChange={e => setBankForm(prev => ({ ...prev, ifsc: e.target.value.toUpperCase() }))}
                  placeholder="e.g. HDFC0001245"
                  className="w-full px-3 py-2 border rounded-xl bg-white font-mono font-bold uppercase text-sm"
                />
              </div>
            </div>
          </div>

          {/* CARD 5: PHYSICAL ON-SITE PROPERTY PHOTO */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-amber-700" />
                <div>
                  <h4 className="font-serif font-bold text-base text-stone-900">
                    5. On-Site Physical Premises Proof (वेन्यू के सामने फोटो)
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Photo of owner/manager standing in front of the venue entrance or property facade.
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                activeVendor.verificationSelfie ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'
              }`}>
                {activeVendor.verificationSelfie ? '✓ Photo Attached' : 'Photo Required'}
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/30 rounded-2xl border border-amber-200 flex flex-col md:flex-row items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={activeVendor.verificationSelfie || activeVendor.image || 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'}
                  alt="On-Site Venue Proof"
                  className="w-32 h-32 md:w-36 md:h-36 object-cover rounded-xl border-2 border-amber-400 shadow-sm bg-white"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[9px] px-2 py-0.5 rounded font-mono">
                  {activeVendor.verificationSelfie ? 'On-Site Proof' : 'Cover Photo'}
                </span>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h5 className="font-serif font-bold text-sm text-stone-900">
                    {activeVendor.verificationSelfie ? 'Live On-Site Photograph Attached' : 'Capture On-Site Photo with Venue'}
                  </h5>
                  {activeVendor.verificationSelfie && (
                    <button
                      type="button"
                      onClick={() => setPreviewDocModal({ title: 'On-Site Physical Venue Proof', url: activeVendor.verificationSelfie })}
                      className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Full Resolution</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Our compliance team reviews this photograph to confirm physical ownership and legitimacy. You can retake or update your photo anytime.
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={uploadingVerification}
                    onClick={() => verificationCameraRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{uploadingVerification ? 'Compressing & Saving...' : 'Click Live Photo with Property'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={uploadingVerification}
                    onClick={() => verificationFileRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 text-stone-500" />
                    <span>Upload from Device</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON BAR */}
          <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h4 className="font-serif font-bold text-base text-white">
                  Ready to Submit ID Proofs for Admin Verification?
                </h4>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Saving updates your details in the database and dispatches a notification to the Vows &amp; Venues admin team for instant audit.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingBank}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold rounded-xl flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 shrink-0 text-sm"
            >
              {savingBank ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{savingBank ? 'Submitting ID Proofs...' : 'Save & Submit ID Proofs for Admin Audit'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 4: 📅 AVAILABILITY CALENDAR & BLACKOUT DATES */}
      {/* ======================================================== */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Venue Availability &amp; Blackout Dates</h3>
              <p className="text-xs text-stone-500">Block offline bookings or maintenance days to avoid double-bookings.</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {blockedDates.length} Dates Blocked
            </span>
          </div>

          <form onSubmit={handleToggleBlockDate} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-end gap-3 text-xs">
            <div className="w-full md:w-48">
              <label className="block font-bold text-stone-700 mb-1">Select Date</label>
              <input
                type="date"
                required
                value={blockDateInput}
                onChange={(e) => setBlockDateInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block font-bold text-stone-700 mb-1">Reason / Notes</label>
              <input
                type="text"
                placeholder="e.g. Booked for Sharma Wedding or Lawn Renovation"
                value={blockReasonInput}
                onChange={(e) => setBlockReasonInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shrink-0 cursor-pointer"
            >
              Toggle Blackout Date
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {blockedDates.map(b => (
              <div key={b.date} className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-rose-950 font-mono">{b.date}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">BLOCKED</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">{b.reason}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = blockedDates.filter(x => x.date !== b.date)
                    setBlockedDates(next)
                    toast.success(`Date ${b.date} unblocked!`)
                  }}
                  className="text-[11px] text-rose-700 hover:underline font-bold text-left cursor-pointer"
                >
                  Unblock Date ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: 💬 INQUIRIES & PRICE OFFERS */}
      {/* ======================================================== */}
      {activeTab === 'negotiations' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Live Customer Negotiations &amp; Offers</h3>
              <p className="text-xs text-stone-500">Manage price bids submitted by couples through the marketplace concierge.</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              {leads.length} Total Negotiations
            </span>
          </div>

          <div className="space-y-4">
            {leads.length > 0 ? (
              leads.map(lead => (
                <div
                  key={lead.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-stone-900">{lead.userName || lead.clientName}</h4>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        lead.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lead.status === 'COUNTER_SENT'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {lead.status === 'ACCEPTED' ? 'Offer Accepted' : lead.status === 'COUNTER_SENT' ? 'Counter Sent' : 'Pending Vendor Action'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-stone-600">
                      <span>📅 Event Date: <strong>{lead.eventDate}</strong></span>
                      <span>👥 Estimated Guests: <strong>{lead.guestCount} pax</strong></span>
                    </div>

                    <div className="inline-flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-stone-200 mt-1">
                      <span className="text-stone-400 line-through">Original: ₹{(lead.originalPrice || 0).toLocaleString('en-IN')}</span>
                      <span className="font-bold text-emerald-700">Client Offered: ₹{(lead.offeredPrice || 0).toLocaleString('en-IN')}</span>
                      {lead.counterPrice && (
                        <span className="font-bold text-purple-700">Your Counter: ₹{(lead.counterPrice).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                    <button
                      type="button"
                      onClick={() => openWhatsAppLead(lead)}
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    {lead.status === 'OFFER_MADE' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAcceptOffer(lead.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                        >
                          Accept Offer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCounterLead(lead)
                            setCounterPriceInput(String(Math.round(((lead.originalPrice || 0) + (lead.offeredPrice || 0)) / 2)))
                          }}
                          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold shadow-xs cursor-pointer"
                        >
                          Counter
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineOffer(lead.id)}
                          className="px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-stone-500 border border-dashed border-stone-200 rounded-2xl">
                <MessageSquare className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <span className="font-bold block">No Pending Price Negotiations</span>
                <span className="text-[11px]">Direct inquiries from couples will appear here in real-time.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: 📊 STOREFRONT PERFORMANCE */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-bold">Total Profile Views</span>
              <span className="font-serif text-2xl font-bold text-stone-900 mt-1 block">1,480 Couples</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">↑ 24% this wedding season</span>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-bold">Inquiries Received</span>
              <span className="font-serif text-2xl font-bold text-emerald-700 mt-1 block">38 Inquiries</span>
              <span className="text-[10px] text-stone-500 block mt-1">Average SLA: {activeVendor.responseTime || '< 30 mins'}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-bold">Starting Package</span>
              <span className="font-serif text-2xl font-bold text-stone-900 mt-1 block">
                ₹{((activeVendor.startingPrice || 50000) / 100000).toFixed(1)} Lakhs
              </span>
              <span className="text-[10px] text-stone-500 block mt-1">{activeVendor.priceUnit || 'per event'}</span>
            </div>
            <div className="bg-emerald-50/70 rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-sm">
              <span className="text-[11px] text-emerald-800 uppercase tracking-wider block font-bold">Partner Rating</span>
              <span className="font-serif text-2xl font-bold text-emerald-950 mt-1 block">
                ★ {activeVendor.rating || 4.9} / 5.0
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                {activeVendor.reviewCount || 0} Verified Reviews
              </span>
            </div>
          </div>
        </div>
      )}

      {/* COUNTER-OFFER MODAL */}
      {activeCounterLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
              Send Counter-Offer to {activeCounterLead.userName || activeCounterLead.clientName}
            </h3>
            <p className="text-stone-500 mb-3">
              Client offered ₹{(activeCounterLead.offeredPrice || 0).toLocaleString('en-IN')} (Original: ₹{(activeCounterLead.originalPrice || 0).toLocaleString('en-IN')})
            </p>

            <form onSubmit={handleSendCounter} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Your Proposed Counter Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={counterPriceInput}
                  onChange={(e) => setCounterPriceInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Note / Inclusions for Client</label>
                <textarea
                  rows={3}
                  placeholder="e.g. We can do ₹1,85,000 including complimentary bridal dressing suite and generator backup."
                  value={counterNotesInput}
                  onChange={(e) => setCounterNotesInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setActiveCounterLead(null)} className="px-3 py-1.5 font-bold text-stone-600 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl shadow cursor-pointer">Dispatch Counter-Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DOCUMENT PREVIEW LIGHTBOX MODAL */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200">
            <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif font-bold text-base text-stone-900">{previewDocModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-stone-950 flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-auto">
              <img
                src={previewDocModal.url}
                alt={previewDocModal.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-mono">Government ID Proof Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewDocModal.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3.5 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Size</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
                  className="px-4 py-1.5 rounded-xl bg-stone-900 text-white font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
