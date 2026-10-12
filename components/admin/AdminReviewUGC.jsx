'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Image as ImageIcon,
  Building2,
  Heart,
  Tag,
  Share2
} from 'lucide-react'
import { toast } from 'sonner'

export const INITIAL_REVIEWS_QUEUE = [
  {
    id: 'rev_q1',
    coupleName: 'Dr. Priya Sharma & Karan Varma',
    venueName: 'The Royal Nawabi Palace & Lawns',
    rating: 5,
    comment: 'The Sheesh Mahal ballroom transformed our winter wedding into a literal fairytale. Nawab Asad and the concierge team handled 400 guests with effortless grace.',
    date: '2026-10-05',
    verifiedBooking: true,
    status: 'PENDING',
    photos: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80']
  },
  {
    id: 'rev_q2',
    coupleName: 'Ananya & Kabir Kapoor',
    venueName: 'Rambagh Citadel & Mughal Gardens',
    rating: 5,
    comment: 'The central courtyard at sunset is completely unmatched. Our guests still talk about the royal folk manganiyar welcoming.',
    date: '2026-09-28',
    verifiedBooking: true,
    status: 'APPROVED',
    featured: true,
    photos: ['https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80']
  }
]

export const INITIAL_REAL_WEDDINGS = [
  {
    id: 'story_1',
    title: 'The Royal Sunset Baraat at Lake Pichola',
    couple: 'Rhea Bahl & Devrat Mehra',
    venue: 'Jagmandir Island Citadel, Udaipur',
    date: 'February 2026',
    photographer: 'Stories by Joseph Radhik',
    decor: 'Gulmohar Luxury Atelier',
    coverImage: 'https://images.unsplash.com/photo-1545232979-fbf675432098?auto=format&fit=crop&w=800&q=80',
    status: 'PUBLISHED'
  },
  {
    id: 'story_2',
    title: 'Sandstone Ramparts & Starlit Pheras in Jaipur',
    couple: 'Simran Chawla & Rohan Oberoi',
    venue: 'Rambagh Citadel, Jaipur',
    date: 'January 2026',
    photographer: 'Drishti Wedding Cinema',
    decor: 'Rajwada Velvet & Brass Atelier',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    status: 'PUBLISHED'
  }
]

export default function AdminReviewUGC() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS_QUEUE)
  const [stories, setStories] = useState(INITIAL_REAL_WEDDINGS)

  const handleApprove = (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r))
    toast.success('Review approved and published to venue page!')
  }

  const handleReject = (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r))
    toast.error('Review rejected from public view')
  }

  const handleToggleFeatured = (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, featured: !r.featured } : r))
    toast.success('Homepage featured testimonial updated!')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white rounded-2xl p-6 border border-champagne/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/20 border border-champagne/40 text-champagne text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Social Proof &amp; Editorial Publishing</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Review Moderation &amp; Real Wedding Stories</h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Curate high-trust visual proof. Moderate couple reviews with verified booking badges and publish editorial Real Wedding photo memoirs.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Review Moderation Queue */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h3 className="font-serif font-bold text-base text-stone-900">UGC Review Moderation Queue</h3>
          <span className="text-xs text-stone-500 font-medium">
            {reviews.filter(r => r.status === 'PENDING').length} Pending Approvals
          </span>
        </div>

        <div className="space-y-3">
          {reviews.map(rev => (
            <div
              key={rev.id}
              className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-stone-900">{rev.coupleName}</span>
                  {rev.verifiedBooking && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Verified Booking
                    </span>
                  )}
                  <span className="text-[11px] text-stone-400">· {rev.date}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-stone-700 font-bold ml-1">{rev.venueName}</span>
                </div>

                <p className="text-xs text-stone-600 italic leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {rev.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleApprove(rev.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(rev.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Approved
                    </span>
                    <button
                      onClick={() => handleToggleFeatured(rev.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        rev.featured
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      {rev.featured ? 'Featured ★' : 'Feature'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Real Weddings Editorial Publisher */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Real Wedding Editorial Stories</h3>
            <p className="text-xs text-stone-500">Curated real couple albums showcased on homepage &amp; wedding inspirations.</p>
          </div>
          <span className="text-xs font-bold text-champagne bg-champagne/15 px-2.5 py-1 rounded-lg">
            {stories.length} Published
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map(story => (
            <div key={story.id} className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50 flex flex-col justify-between">
              <div className="h-44 relative bg-stone-900">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  {story.date}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-serif font-bold text-sm text-stone-900">{story.title}</h4>
                <div className="text-xs text-stone-600 space-y-0.5">
                  <div><strong>Couple:</strong> {story.couple}</div>
                  <div><strong>Venue:</strong> {story.venue}</div>
                  <div><strong>Cinema:</strong> {story.photographer}</div>
                </div>
              </div>

              <div className="p-3 border-t border-stone-200 bg-white flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {story.status}
                </span>
                <button
                  onClick={() => toast.info('Opening story editor...')}
                  className="text-stone-700 hover:text-black font-bold text-[11px]"
                >
                  Edit Story &amp; Photos →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
