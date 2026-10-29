'use client'

import React, { useState, useMemo } from 'react'
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Check,
  RefreshCw,
  Building2,
  Layers,
  Crown,
  Tag,
  Star,
  Users,
  Eye,
  CheckCircle2,
  UploadCloud,
  FileImage
} from 'lucide-react'
import { toast } from 'sonner'
import { getOptimizedImageUrl } from '@/lib/imageUtils'

export default function AdminSiteImageManager({
  cmsDraft = {},
  setCmsDraft,
  onSaveCMS,
  cmsSaving = false,
  vendors = [],
  mediaLibrary = [],
  onUploadMedia,
  onDeleteMedia
}) {
  // Local vendors list state for instantaneous UI updates
  const [localVendors, setLocalVendors] = useState(vendors)

  React.useEffect(() => {
    if (vendors && vendors.length > 0) {
      setLocalVendors(vendors)
    }
  }, [vendors])

  // Active Section Tab inside Image Manager
  const [activeImageTab, setActiveImageTab] = useState('hero_banners') // 'hero_banners' | 'carousel' | 'categories' | 'packages' | 'inspiration' | 'testimonials' | 'vendors' | 'library'
  
  // Vendor search & editing
  const [vendorSearch, setVendorSearch] = useState('')
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState('all')
  const [editingVendorId, setEditingVendorId] = useState(null)
  const [vendorDraftImage, setVendorDraftImage] = useState('')
  const [vendorDraftHeroImage, setVendorDraftHeroImage] = useState('')
  const [savingVendorId, setSavingVendorId] = useState(null)

  // Media Library Quick-Add
  const [newMediaTitle, setNewMediaTitle] = useState('')
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaCategory, setNewMediaCategory] = useState('venues')
  const [mediaRegistering, setMediaRegistering] = useState(false)

  // Filtered vendors for Vendor Image Quick-Editor
  const filteredVendors = useMemo(() => {
    return (localVendors || []).filter(v => {
      const matchesSearch = !vendorSearch || 
        v.name?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.city?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.id?.toLowerCase().includes(vendorSearch.toLowerCase())
      const matchesCat = vendorCategoryFilter === 'all' || v.category === vendorCategoryFilter || v.categorySlug === vendorCategoryFilter
      return matchesSearch && matchesCat
    })
  }, [vendors, vendorSearch, vendorCategoryFilter])

  // Save individual vendor image changes to database
  const handleSaveVendorImage = async (vendorId) => {
    setSavingVendorId(vendorId)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vv_token') || '' : ''
      const res = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          image: vendorDraftImage,
          heroImage: vendorDraftHeroImage || vendorDraftImage
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update vendor photo')

      setLocalVendors(prev => prev.map(v => v.id === vendorId ? {
        ...v,
        image: vendorDraftImage,
        heroImage: vendorDraftHeroImage || vendorDraftImage
      } : v))

      toast.success(`Updated photo for ${data.name || 'vendor'}!`)
      setEditingVendorId(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingVendorId(null)
    }
  }

  // Handle registering new media asset
  const handleRegisterMedia = async (e) => {
    e.preventDefault()
    if (!newMediaUrl || !newMediaTitle) {
      toast.error('Please enter an image title and image URL')
      return
    }

    setMediaRegistering(true)
    try {
      if (onUploadMedia) {
        await onUploadMedia({
          title: newMediaTitle,
          url: newMediaUrl,
          category: newMediaCategory
        })
      } else {
        const token = typeof window !== 'undefined' ? localStorage.getItem('vv_token') || '' : ''
        const res = await fetch('/api/media', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            title: newMediaTitle,
            url: newMediaUrl,
            category: newMediaCategory
          })
        })
        if (!res.ok) throw new Error('Failed to save to media library')
        toast.success(`Added "${newMediaTitle}" to media library!`)
      }
      setNewMediaTitle('')
      setNewMediaUrl('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setMediaRegistering(false)
    }
  }

  const copyToClipboard = (text, label) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      toast.success(`Copied ${label} URL to clipboard!`)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e2d5] shadow-sm space-y-6">
      
      {/* HEADER WITH GLOBAL SAVE BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-[#4a1525] border border-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Camera className="w-3.5 h-3.5 text-amber-700" />
            <span>Complete Website Imagery Control Hub</span>
          </div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1c1917]">
            Master Website Images &amp; Banners Manager
          </h2>
          <p className="text-xs text-stone-500 max-w-3xl">
            Directly update every single visual asset on the website: 4K hero wallpaper, royal palace reveal, top 3D carousel slides, 11 celebration categories, packages, inspiration gallery, client review avatars, and individual vendor catalog photos.
          </p>
        </div>

        <button
          onClick={onSaveCMS}
          disabled={cmsSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#d4af37] hover:brightness-105 text-[#1c1917] font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{cmsSaving ? 'Publishing Live...' : 'Save & Publish All Images Live'}</span>
        </button>
      </div>

      {/* SECTION SELECTOR TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-stone-100 rounded-2xl">
        {[
          { id: 'hero_banners', label: '🌟 Hero & Banners', count: '4 Banners' },
          { id: 'carousel', label: '🎠 3D Top Carousel', count: `${(cmsDraft.gallerySlides || []).length} Slides` },
          { id: 'categories', label: '👑 11 Categories', count: '11 Cards' },
          { id: 'packages', label: '📦 Curated Packages', count: '3 Packages' },
          { id: 'inspiration', label: '📸 Inspiration Gallery', count: `${(cmsDraft.inspirationGallery || []).length || 6} Photos` },
          { id: 'testimonials', label: '💬 Reviews & Avatars', count: `${(cmsDraft.testimonials || []).length || 5} Couples` },
          { id: 'vendors', label: '🏛️ Vendor Catalog Photos', count: `${vendors.length} Vendors` },
          { id: 'library', label: '🖼️ Media Asset Library', count: `${mediaLibrary.length} Assets` },
        ].map(tab => {
          const isActive = activeImageTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveImageTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white text-[#4a1525] shadow-sm border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                isActive ? 'bg-amber-100 text-amber-900' : 'bg-stone-200 text-stone-600'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ============================================================== */}
      {/* 1. HERO SECTION & ROYAL BANNERS                                */}
      {/* ============================================================== */}
      {activeImageTab === 'hero_banners' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* 1.1 Main Hero 4K Wallpaper */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span>1. Main Homepage 4K Hero Wallpaper</span>
                  <span className="text-[10px] bg-amber-200/90 text-amber-950 font-sans px-2 py-0.5 rounded-full font-bold">Top of Homepage</span>
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  The primary 4K full-bleed background displayed behind the royal headline and search console.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border-2 border-amber-400 bg-stone-900 shadow-sm">
                <img
                  src={getOptimizedImageUrl(cmsDraft.hero?.heroImage || cmsDraft.banners?.heroBackdrop || 'https://images.unsplash.com/photo-1519741497674-611481863552', { width: 600, quality: 75 })}
                  alt="Hero Live Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-2.5">
                  <div className="text-[9px] font-bold text-amber-300 uppercase tracking-widest">Live Hero Preview</div>
                  <div className="text-[11px] font-serif font-bold text-white truncate">Where Timeless Heritage Meets Celebrations</div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Image URL (Direct High-Resolution / 4K Photo Link)
                  </label>
                  <input
                    type="url"
                    value={cmsDraft.hero?.heroImage || cmsDraft.banners?.heroBackdrop || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setCmsDraft({
                        ...cmsDraft,
                        hero: { ...(cmsDraft.hero || {}), heroImage: val },
                        banners: { ...(cmsDraft.banners || {}), heroBackdrop: val }
                      })
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-mono focus:outline-none focus:border-[#4a1525]"
                  />
                </div>

                {/* Presets */}
                <div>
                  <div className="text-[11px] font-bold text-stone-600 mb-1.5 flex items-center gap-1">
                    <span>⚜ Quick Apply Verified 4K Royal Palace Presets:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Udaipur Island Palace', url: 'https://images.unsplash.com/photo-1519741497674-611481863552' },
                      { name: 'Jaipur Rambagh Citadel', url: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2' },
                      { name: 'Grand Marigold Mandap', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a' },
                      { name: 'Awadhi Feast Banquet', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5' },
                      { name: 'Fragrant Mogra Florals', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622' }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setCmsDraft({
                            ...cmsDraft,
                            hero: { ...(cmsDraft.hero || {}), heroImage: preset.url },
                            banners: { ...(cmsDraft.banners || {}), heroBackdrop: preset.url }
                          })
                          toast.info(`Applied "${preset.name}". Click Save & Publish to activate!`)
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 border border-stone-200 text-[10.5px] font-medium text-stone-700 hover:text-[#4a1525] transition-colors cursor-pointer"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1.2 Scene II: Royal Heritage Palace Reveal Backdrop */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>2. Scene II · Royal Heritage Palace Reveal Feature</span>
                <span className="text-[10px] bg-purple-200 text-purple-900 font-sans px-2 py-0.5 rounded-full font-bold">Mid-Page Feature</span>
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                The massive palace showcase image in &ldquo;Step into Majestic Living Royalty&rdquo; editorial section.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-stone-300 bg-stone-900 shadow-sm">
                <img
                  src={getOptimizedImageUrl(cmsDraft.banners?.royalRevealImage || cmsDraft.hero?.secondaryHeroImage || 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2', { width: 500, quality: 75 })}
                  alt="Royal Reveal Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Palace Feature Image URL
                  </label>
                  <input
                    type="url"
                    value={cmsDraft.banners?.royalRevealImage || ''}
                    onChange={(e) => {
                      setCmsDraft({
                        ...cmsDraft,
                        banners: { ...(cmsDraft.banners || {}), royalRevealImage: e.target.value }
                      })
                    }}
                    placeholder="https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-mono focus:outline-none focus:border-[#4a1525]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 1.3 Signature Palaces & Concierge Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="font-serif font-bold text-xs text-stone-900">
                3. Signature Palace Hero Override (Featured Venues)
              </div>
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-stone-900 border border-stone-200">
                <img
                  src={getOptimizedImageUrl(cmsDraft.banners?.signaturePalaceBackdrop || 'https://images.unsplash.com/photo-1519741497674-611481863552', { width: 400, quality: 75 })}
                  alt="Signature Palace"
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="url"
                value={cmsDraft.banners?.signaturePalaceBackdrop || ''}
                onChange={(e) => {
                  setCmsDraft({
                    ...cmsDraft,
                    banners: { ...(cmsDraft.banners || {}), signaturePalaceBackdrop: e.target.value }
                  })
                }}
                placeholder="Leave blank to use top venue photo automatically"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-[11px] font-mono focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="font-serif font-bold text-xs text-stone-900">
                4. Concierge &amp; Atelier Backdrop
              </div>
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-stone-900 border border-stone-200">
                <img
                  src={getOptimizedImageUrl(cmsDraft.banners?.conciergeBackdrop || 'https://images.unsplash.com/photo-1566073771259-6a8506099945', { width: 400, quality: 75 })}
                  alt="Concierge Backdrop"
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="url"
                value={cmsDraft.banners?.conciergeBackdrop || ''}
                onChange={(e) => {
                  setCmsDraft({
                    ...cmsDraft,
                    banners: { ...(cmsDraft.banners || {}), conciergeBackdrop: e.target.value }
                  })
                }}
                placeholder="https://images.unsplash.com/photo-1566073771259-6a8506099945"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-[11px] font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. TOP 3D SLIDING CAROUSEL SLIDES                              */}
      {/* ============================================================== */}
      {activeImageTab === 'carousel' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>3D Top Sliding Carousel ({(cmsDraft.gallerySlides || []).length} Slides)</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-950 font-sans px-2 py-0.5 rounded-full font-bold">Auto-Sliding Showcase</span>
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Every slide has its own 4K image, royal title, city/destination, category, and price tag.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const cur = cmsDraft.gallerySlides || []
                const newSlide = {
                  id: `slide_${Date.now()}`,
                  title: 'New Royal Celebration Setting',
                  city: 'Udaipur / Jaipur / Delhi NCR',
                  category: 'Heritage Venues & Forts',
                  rating: 4.98,
                  reviews: 75,
                  price: '₹2,50,000 / day',
                  tag: 'Signature Showcase',
                  image: 'https://images.unsplash.com/photo-1519741497674-611481863552',
                  description: 'Authentic royal celebration setting with verified staff and 100% direct date lock guarantee.'
                }
                setCmsDraft({ ...cmsDraft, gallerySlides: [...cur, newSlide] })
                toast.success('Added new slide! Scroll down to edit its photo and text.')
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#4a1525] hover:bg-[#340b17] text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Slide</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(cmsDraft.gallerySlides || []).map((slide, sIdx) => (
              <div
                key={slide.id || sIdx}
                className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-xs hover:border-amber-400 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-28 h-24 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 shrink-0 relative">
                    <img
                      src={getOptimizedImageUrl(slide.image, { width: 300, quality: 75 })}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-black/80 text-amber-300">
                      #{sIdx + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Slide #{sIdx + 1}</span>
                      {(cmsDraft.gallerySlides || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (cmsDraft.gallerySlides || []).filter((_, i) => i !== sIdx)
                            setCmsDraft({ ...cmsDraft, gallerySlides: updated })
                            toast.info(`Removed Slide #${sIdx + 1}`)
                          }}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={slide.title || ''}
                      onChange={(e) => {
                        const updated = [...(cmsDraft.gallerySlides || [])]
                        updated[sIdx] = { ...updated[sIdx], title: e.target.value }
                        setCmsDraft({ ...cmsDraft, gallerySlides: updated })
                      }}
                      placeholder="Slide Title"
                      className="w-full px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-none"
                    />

                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={slide.city || ''}
                        onChange={(e) => {
                          const updated = [...(cmsDraft.gallerySlides || [])]
                          updated[sIdx] = { ...updated[sIdx], city: e.target.value }
                          setCmsDraft({ ...cmsDraft, gallerySlides: updated })
                        }}
                        placeholder="City"
                        className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[11px] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={slide.price || ''}
                        onChange={(e) => {
                          const updated = [...(cmsDraft.gallerySlides || [])]
                          updated[sIdx] = { ...updated[sIdx], price: e.target.value }
                          setCmsDraft({ ...cmsDraft, gallerySlides: updated })
                        }}
                        placeholder="Price tag"
                        className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[11px] focus:outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-stone-600 mb-1">
                    Slide Image URL:
                  </label>
                  <input
                    type="url"
                    value={slide.image || ''}
                    onChange={(e) => {
                      const updated = [...(cmsDraft.gallerySlides || [])]
                      updated[sIdx] = { ...updated[sIdx], image: e.target.value }
                      setCmsDraft({ ...cmsDraft, gallerySlides: updated })
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] font-mono focus:outline-none focus:border-[#4a1525]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. 11 CELEBRATION SPECIALIZATION CATEGORIES                    */}
      {/* ============================================================== */}
      {activeImageTab === 'categories' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <span>The Royal Atelier Spectrum · 11 Verified Categories</span>
              <span className="text-[10px] bg-purple-200 text-purple-900 font-sans px-2 py-0.5 rounded-full font-bold">Homepage Grid</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Customize the thumbnail photograph for each celebration category card shown on the homepage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { slug: 'venues', label: '1. Heritage Venues & Forts', defaultImg: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2' },
              { slug: 'catering', label: '2. Catering & Royal Feasts', defaultImg: 'https://images.unsplash.com/photo-1555244162-803834f70033' },
              { slug: 'decor', label: '3. Decoration & Mandaps', defaultImg: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458' },
              { slug: 'makeup', label: '4. Bridal Makeup Artists', defaultImg: 'https://images.unsplash.com/photo-1600685890506-593fdf55949b' },
              { slug: 'outfits', label: '5. Couture Rental Outfits', defaultImg: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2' },
              { slug: 'photography', label: '6. Photography & 4K Cinema', defaultImg: 'https://images.unsplash.com/photo-1744805624954-a6686543c3ff' },
              { slug: 'music', label: '7. DJ & Live Music', defaultImg: 'https://images.unsplash.com/photo-1541126274323-dbac58d14741' },
              { slug: 'gifts', label: '8. Return Gifts & Favors', defaultImg: 'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd' },
              { slug: 'florists', label: '9. Florists & Garlands', defaultImg: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb' },
              { slug: 'invitations', label: '10. Invitation Cards & E-Invites', defaultImg: 'https://images.unsplash.com/photo-1656104717095-9d062b0d4e8d' },
              { slug: 'planners', label: '11. Event Planners & Concierge', defaultImg: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce' }
            ].map((catItem) => {
              const currentImg = cmsDraft.categoryImages?.[catItem.slug] || catItem.defaultImg
              return (
                <div
                  key={catItem.slug}
                  className="p-3.5 rounded-2xl bg-white border border-stone-200 flex flex-col justify-between space-y-3 shadow-2xs hover:border-amber-400 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 relative">
                      <img
                        src={getOptimizedImageUrl(currentImg, { width: 160, quality: 75 })}
                        alt={catItem.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-serif font-bold text-xs text-stone-900 block truncate">
                        {catItem.label}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono block">
                        slug: {catItem.slug}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentImg, catItem.label)}
                        className="text-[10px] text-amber-800 hover:underline flex items-center gap-1 mt-1 font-semibold"
                      >
                        <Copy className="w-2.5 h-2.5" /> Copy Image URL
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Image URL:</label>
                    <input
                      type="url"
                      value={cmsDraft.categoryImages?.[catItem.slug] || ''}
                      onChange={(e) => {
                        setCmsDraft({
                          ...cmsDraft,
                          categoryImages: {
                            ...(cmsDraft.categoryImages || {}),
                            [catItem.slug]: e.target.value
                          }
                        })
                      }}
                      placeholder={catItem.defaultImg}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-[10.5px] font-mono focus:outline-none focus:border-[#4a1525]"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. CURATED CELEBRATION PACKAGES                                */}
      {/* ============================================================== */}
      {activeImageTab === 'packages' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <span>Curated All-Inclusive Celebration Package Banners</span>
              <span className="text-[10px] bg-amber-200 text-amber-950 font-sans px-2 py-0.5 rounded-full font-bold">Package Cards</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Change the high-resolution cover photos shown on each curated celebration package on the homepage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'pkg_basic_celebration',
                title: 'Basic Celebration Package',
                defaultImg: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d'
              },
              {
                id: 'pkg_premium_celebration',
                title: 'Premium Celebration & Sangeet',
                defaultImg: 'https://images.unsplash.com/photo-1587012521796-6359d3678f2a'
              },
              {
                id: 'pkg_luxury_royal',
                title: 'Luxury Royal Indian Wedding',
                defaultImg: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'
              }
            ].map(pkg => {
              const currentImg = cmsDraft.packageImages?.[pkg.id] || pkg.defaultImg
              return (
                <div key={pkg.id} className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-2xs">
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-stone-900 border border-stone-200">
                    <img
                      src={getOptimizedImageUrl(currentImg, { width: 400, quality: 75 })}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-xs text-stone-900 block truncate">{pkg.title}</span>
                    <span className="text-[10px] text-stone-400 font-mono block">ID: {pkg.id}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Package Banner URL:</label>
                    <input
                      type="url"
                      value={cmsDraft.packageImages?.[pkg.id] || ''}
                      onChange={(e) => {
                        setCmsDraft({
                          ...cmsDraft,
                          packageImages: {
                            ...(cmsDraft.packageImages || {}),
                            [pkg.id]: e.target.value
                          }
                        })
                      }}
                      placeholder={pkg.defaultImg}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-[10.5px] font-mono focus:outline-none focus:border-[#4a1525]"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. INSPIRATION GALLERY & MEMOIRS                               */}
      {/* ============================================================== */}
      {activeImageTab === 'inspiration' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>The Wedding Gazette · Inspiration Masonry Gallery</span>
                <span className="text-[10px] bg-amber-200 text-amber-950 font-sans px-2 py-0.5 rounded-full font-bold">Editorial Memoirs</span>
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Update the high-fashion editorial captures and real celebration photography cards.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const cur = cmsDraft.inspirationGallery || [
                  { id: 'insp_1', title: 'The Sunset Lake Pichola Baraat', category: 'Palaces & Forts', city: 'Udaipur', image: 'https://images.unsplash.com/photo-1519741497674-611481863552' },
                  { id: 'insp_2', title: 'Mogra & Diya Cascading Mandap', category: 'Mandaps & Florals', city: 'Jaipur', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a' },
                  { id: 'insp_3', title: 'Shahi Awadhi Dum Pukht Banquet', category: 'Catering & Feasts', city: 'Lucknow', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5' },
                  { id: 'insp_4', title: 'Zardozi Crimson Bridal Couture', category: 'Couture & Details', city: 'Delhi NCR', image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2' },
                  { id: 'insp_5', title: 'Royal Shehnai & Sitar Ensemble', category: 'Palaces & Forts', city: 'Varanasi', image: 'https://images.unsplash.com/photo-1541126274323-dbac58d14741' },
                  { id: 'insp_6', title: 'Artisanal Brass & Dry Fruit Hampers', category: 'Couture & Details', city: 'Pan-India', image: 'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd' }
                ]
                const newItem = {
                  id: `insp_${Date.now()}`,
                  title: 'New Royal Celebration Capture',
                  category: 'Palaces & Forts',
                  city: 'Udaipur, Rajasthan',
                  image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2'
                }
                setCmsDraft({ ...cmsDraft, inspirationGallery: [...cur, newItem] })
                toast.success('Added new inspiration photo!')
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#4a1525] hover:bg-[#340b17] text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Inspiration Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(cmsDraft.inspirationGallery || [
              { id: 'insp_1', title: 'The Sunset Lake Pichola Baraat', category: 'Palaces & Forts', city: 'Udaipur', image: 'https://images.unsplash.com/photo-1519741497674-611481863552' },
              { id: 'insp_2', title: 'Mogra & Diya Cascading Mandap', category: 'Mandaps & Florals', city: 'Jaipur', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a' },
              { id: 'insp_3', title: 'Shahi Awadhi Dum Pukht Banquet', category: 'Catering & Feasts', city: 'Lucknow', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5' },
              { id: 'insp_4', title: 'Zardozi Crimson Bridal Couture', category: 'Couture & Details', city: 'Delhi NCR', image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2' },
              { id: 'insp_5', title: 'Royal Shehnai & Sitar Ensemble', category: 'Palaces & Forts', city: 'Varanasi', image: 'https://images.unsplash.com/photo-1541126274323-dbac58d14741' },
              { id: 'insp_6', title: 'Artisanal Brass & Dry Fruit Hampers', category: 'Couture & Details', city: 'Pan-India', image: 'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd' }
            ]).map((item, idx) => (
              <div key={item.id || idx} className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2.5 shadow-2xs">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-stone-200 relative">
                  <img
                    src={getOptimizedImageUrl(item.image, { width: 350, quality: 75 })}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (cmsDraft.inspirationGallery || []).filter((_, i) => i !== idx)
                      setCmsDraft({ ...cmsDraft, inspirationGallery: updated })
                      toast.info(`Removed inspiration photo #${idx + 1}`)
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => {
                      const updated = [...(cmsDraft.inspirationGallery || [])]
                      updated[idx] = { ...updated[idx], title: e.target.value }
                      setCmsDraft({ ...cmsDraft, inspirationGallery: updated })
                    }}
                    placeholder="Title"
                    className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-xs font-semibold"
                  />
                  <select
                    value={item.category || 'Palaces & Forts'}
                    onChange={(e) => {
                      const updated = [...(cmsDraft.inspirationGallery || [])]
                      updated[idx] = { ...updated[idx], category: e.target.value }
                      setCmsDraft({ ...cmsDraft, inspirationGallery: updated })
                    }}
                    className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-xs"
                  >
                    <option value="Palaces & Forts">Palaces &amp; Forts</option>
                    <option value="Mandaps & Florals">Mandaps &amp; Florals</option>
                    <option value="Catering & Feasts">Catering &amp; Feasts</option>
                    <option value="Couture & Details">Couture &amp; Details</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Photo URL:</label>
                  <input
                    type="url"
                    value={item.image || ''}
                    onChange={(e) => {
                      const updated = [...(cmsDraft.inspirationGallery || [])]
                      updated[idx] = { ...updated[idx], image: e.target.value }
                      setCmsDraft({ ...cmsDraft, inspirationGallery: updated })
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[10.5px] font-mono focus:outline-none focus:border-[#4a1525]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. CLIENT REVIEWS & AVATARS                                    */}
      {/* ============================================================== */}
      {activeImageTab === 'testimonials' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <span>Real Celebrations · Client Memoirs &amp; Review Avatars</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-950 font-sans px-2 py-0.5 rounded-full font-bold">Testimonial Slider</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Change the couple avatar photos and celebration pictures featured in the sliding reviews section.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(cmsDraft.testimonials || [
              { id: 'test_1', clientNames: 'Aanya & Kabir Kapoor', city: 'Udaipur, Rajasthan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
              { id: 'test_2', clientNames: 'Meera & Devendra Trivedi', city: 'Lucknow, Uttar Pradesh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
              { id: 'test_3', clientNames: 'Priya & Rohan Singhania', city: 'Delhi NCR', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9' },
              { id: 'test_4', clientNames: 'Tanvi & Siddharth Mehta', city: 'Jaipur, Rajasthan', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' },
              { id: 'test_5', clientNames: 'Dr. Rhea & Arjun Verma', city: 'Bengaluru, Karnataka', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d' }
            ]).map((t, tIdx) => (
              <div key={t.id || tIdx} className="p-4 rounded-2xl bg-white border border-stone-200 flex items-start gap-3 shadow-2xs">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-stone-900 border-2 border-amber-300 shrink-0">
                  <img
                    src={getOptimizedImageUrl(t.avatar || t.image, { width: 100, quality: 75 })}
                    alt={t.clientNames}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <span className="font-serif font-bold text-xs text-stone-900 block truncate">{t.clientNames}</span>
                    <span className="text-[10px] text-stone-500 block truncate">{t.city}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Avatar Image URL:</label>
                    <input
                      type="url"
                      value={t.avatar || ''}
                      onChange={(e) => {
                        const updated = [...(cmsDraft.testimonials || [])]
                        updated[tIdx] = { ...updated[tIdx], avatar: e.target.value, image: e.target.value }
                        setCmsDraft({ ...cmsDraft, testimonials: updated })
                      }}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[10.5px] font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. VENDOR & VENUE CATALOG PHOTO QUICK-EDITOR                   */}
      {/* ============================================================== */}
      {activeImageTab === 'vendors' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span>Vendor &amp; Venue Catalog Photo Quick-Editor</span>
                  <span className="text-[10px] bg-amber-200 text-amber-950 font-sans px-2 py-0.5 rounded-full font-bold">Live Database Sync</span>
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Search any vendor or palace in the marketplace to immediately update their Card Thumbnail (`image`) or Hero Wallpaper (`heroImage`).
                </p>
              </div>
              <span className="text-xs font-bold text-stone-600 bg-white px-3 py-1 rounded-xl border border-stone-200">
                {filteredVendors.length} of {vendors.length} Vendors
              </span>
            </div>

            {/* Search and Category Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search vendor by name, city, or ID..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
                />
              </div>

              <select
                value={vendorCategoryFilter}
                onChange={(e) => setVendorCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="venues">Venues / Banquet Halls</option>
                <option value="catering">Catering &amp; Royal Feasts</option>
                <option value="decor">Decor &amp; Mandaps</option>
                <option value="makeup">Bridal Makeup Artists</option>
                <option value="outfits">Couture Rental Outfits</option>
                <option value="photography">Photography &amp; 4K Cinema</option>
                <option value="music">DJ &amp; Live Music</option>
                <option value="gifts">Return Gifts &amp; Favors</option>
                <option value="florists">Florists &amp; Garlands</option>
                <option value="invitations">Invitation Cards</option>
                <option value="planners">Event Planners</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map(vendor => {
              const isEditing = editingVendorId === vendor.id
              const isSaving = savingVendorId === vendor.id
              const currentCardImg = isEditing ? vendorDraftImage : (vendor.image || vendor.heroImage)
              const currentHeroImg = isEditing ? vendorDraftHeroImage : (vendor.heroImage || vendor.image)

              return (
                <div
                  key={vendor.id}
                  className={`p-4 rounded-2xl bg-white border transition-all space-y-3 ${
                    isEditing ? 'border-[#4a1525] ring-2 ring-amber-400/40 shadow-md' : 'border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 shrink-0">
                      <img
                        src={getOptimizedImageUrl(currentCardImg, { width: 120, quality: 75 })}
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-serif font-bold text-xs text-stone-900 block truncate" title={vendor.name}>
                        {vendor.name}
                      </span>
                      <span className="text-[10px] text-stone-500 block truncate">
                        {vendor.city} • <span className="capitalize">{vendor.category}</span>
                      </span>
                      <span className="text-[10px] font-mono text-stone-400 block truncate">
                        ID: {vendor.id}
                      </span>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-2 border-t border-stone-100 animate-in fade-in">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Card Thumbnail Image URL:</label>
                        <input
                          type="url"
                          value={vendorDraftImage}
                          onChange={(e) => setVendorDraftImage(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[10.5px] font-mono focus:outline-none focus:border-[#4a1525]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Hero Wallpaper Image URL:</label>
                        <input
                          type="url"
                          value={vendorDraftHeroImage}
                          onChange={(e) => setVendorDraftHeroImage(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[10.5px] font-mono focus:outline-none focus:border-[#4a1525]"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSaveVendorImage(vendor.id)}
                          disabled={isSaving}
                          className="flex-1 py-1.5 rounded-lg bg-[#4a1525] hover:bg-[#340b17] text-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Saving...' : 'Save to DB'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingVendorId(null)}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(vendor.image || vendor.heroImage, vendor.name)}
                        className="text-[10.5px] text-stone-500 hover:text-stone-800 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy URL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVendorId(vendor.id)
                          setVendorDraftImage(vendor.image || '')
                          setVendorDraftHeroImage(vendor.heroImage || vendor.image || '')
                        }}
                        className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-[11px] border border-amber-300 transition-all cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MEDIA ASSET LIBRARY                                         */}
      {/* ============================================================== */}
      {activeImageTab === 'library' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>Central Media Asset Library</span>
                <span className="text-[10px] bg-amber-200 text-amber-950 font-sans px-2 py-0.5 rounded-full font-bold">{mediaLibrary.length} Registered Photos</span>
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Register high-resolution photographs, mandap visuals, and royal palace captures to easily copy or reuse across any section.
              </p>
            </div>
          </div>

          {/* Quick-Register Form */}
          <form onSubmit={handleRegisterMedia} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Photo Title (e.g. Royal Island Mandap)"
              value={newMediaTitle}
              onChange={e => setNewMediaTitle(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
            />
            <input
              type="url"
              placeholder="Image URL (Unsplash, Cloudinary, CDN)"
              value={newMediaUrl}
              onChange={e => setNewMediaUrl(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none font-mono"
            />
            <select
              value={newMediaCategory}
              onChange={e => setNewMediaCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none"
            >
              <option value="venues">Venues</option>
              <option value="catering">Catering</option>
              <option value="decor">Decor</option>
              <option value="makeup">Makeup</option>
              <option value="photography">Photography</option>
              <option value="music">Music</option>
            </select>
            <button
              type="submit"
              disabled={mediaRegistering}
              className="px-4 py-2 rounded-xl bg-[#4a1525] hover:bg-[#340b17] text-amber-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{mediaRegistering ? 'Registering...' : '+ Register Image'}</span>
            </button>
          </form>

          {/* Asset Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaLibrary.map(item => (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 shadow-2xs hover:border-amber-400 transition-all">
                <img
                  src={getOptimizedImageUrl(item.url, { width: 350, quality: 75 })}
                  alt={item.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3">
                  <div className="font-bold text-xs text-stone-900 truncate">{item.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-stone-400 capitalize">{item.category}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.url, item.title)}
                      className="text-[10px] text-amber-800 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Copy className="w-2.5 h-2.5" /> Copy URL
                    </button>
                  </div>
                </div>

                {onDeleteMedia && (
                  <button
                    onClick={() => onDeleteMedia(item.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                    title="Delete Media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM PUBLISH BAR */}
      <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-stone-500">
          💡 Any image URL pasted from Unsplash, Pexels, AWS S3, Cloudinary or your CDN will immediately be optimized and cached.
        </div>
        <button
          onClick={onSaveCMS}
          disabled={cmsSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#d4af37] hover:brightness-105 text-[#1c1917] font-bold text-xs flex items-center gap-2 shadow-md transition-all self-end cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{cmsSaving ? 'Publishing Live...' : 'Save & Publish All Images Live'}</span>
        </button>
      </div>

    </div>
  )
}
