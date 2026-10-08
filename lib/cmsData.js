export const DEFAULT_CMS_CONTENT = {
  hero: {
    headline: "Plan Your Perfect Celebration, All in One Place",
    subheadline: "From royal heritage palaces in Udaipur to authentic Awadhi banquets in Lucknow, discover and book India's most distinguished verified event creators.",
    badge: "India's Premier Luxury Wedding & Event Concierge",
    heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=75",
    secondaryHeroImage: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?auto=format&fit=crop&w=1400&q=75",
    heroVideo: "",
    stats: [
      { label: "Verified Venues & Artists", value: "850+" },
      { label: "Celebrations Curated", value: "14,200+" },
      { label: "Client Satisfaction", value: "4.95 / 5" },
      { label: "Direct Pricing Guarantee", value: "100%" }
    ]
  },
  announcement: {
    enabled: true,
    text: "✨ Autumn & Winter 2026 Royal Wedding Bookings Now Open across 9 Heritage Destinations",
    link: "/explore"
  },
  offers: [
    {
      id: "off_1",
      title: "Royal Palace Grand Wedding Pass",
      discount: "Flat ₹15,000 Off",
      code: "ROYAL2026",
      minSpend: 100000,
      desc: "Apply on booking Venue, Catering, and Decor together in Event Builder.",
      badge: "Signature Privilege",
      active: true
    },
    {
      id: "off_2",
      title: "Cinematic Pre-Wedding Package",
      discount: "Complimentary Drone Reel",
      code: "CINEMA2026",
      minSpend: 40000,
      desc: "Includes 4K teaser editing with verified cinematographers.",
      badge: "Complimentary Add-on",
      active: true
    },
    {
      id: "off_3",
      title: "Bridal Glam & Sangeet Trousseau",
      discount: "10% Instant Savings",
      code: "SHUBH10",
      minSpend: 25000,
      desc: "Valid on couture bridal rental and celebrity HD makeup artists.",
      badge: "Limited Period",
      active: true
    }
  ],
  testimonials: [
    {
      id: "test_1",
      clientNames: "Aanya & Kabir Kapoor",
      event: "3-Day Royal Wedding, Udaipur",
      text: "Vows & Venues turned our dream destination wedding into an effortless reality. From Jagmandir lakeside to the royal Rajasthani banquet, every vendor delivered absolute perfection with unmatched hospitality.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=75"
    },
    {
      id: "test_2",
      clientNames: "Priya & Rohan Singhania",
      event: "Grand Sangeet & Reception, Delhi NCR",
      text: "The live budget progress meter and modular package customizer saved us weeks of stressful negotiations. Transparent pricing and verified vendor seals gave our families complete confidence.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=75"
    },
    {
      id: "test_3",
      clientNames: "Meera & Devendra Trivedi",
      event: "Traditional Awadhi Wedding, Lucknow",
      text: "The authentic Awadhi feast counters and fragrant mogra mandap were praised by every single elder in our family. The 25% advance split booking made financial planning crystal clear.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=75"
    }
  ],
  faqs: [
    {
      q: "How does Vows & Venues verify and authenticate vendors?",
      a: "Every vendor undergoes a comprehensive 4-stage audit: physical venue inspection, business documentation checks (PAN, GST, FSSAI for caterers), portfolio authenticity verification, and previous client reference reviews before receiving the Verified Gold Seal."
    },
    {
      q: "Can I customize a package or swap individual vendors?",
      a: "Yes! Every ready-made package is modular. In our Package Customizer and Event Builder, you can swap caterers, adjust guest counts, or upgrade decorators with instant, transparent price recalculation."
    },
    {
      q: "How does the split advance payment work?",
      a: "To reserve your date across all chosen vendors, you pay a 25% advance online via UPI, Cards, or NetBanking. The remaining 75% balance is settled on scheduled milestones leading up to your celebration."
    },
    {
      q: "What happens if a vendor needs to be rescheduled?",
      a: "Our customer dashboard includes a dedicated Reschedule and Concierge Assistance workflow with zero penalty when requested according to the venue's cancellation policy window."
    }
  ],
  seo: {
    title: "Vows & Venues | Luxury Indian Wedding & Event Marketplace",
    description: "Plan and book verified Indian wedding venues, royal catering, grand mandap decor, and candid photographers across Lucknow, Jaipur, Delhi NCR, and Udaipur.",
    keywords: "Indian wedding marketplace, luxury wedding venues, banquet halls, wedding photographers, bridal makeup, caterers, mandap decor"
  },
  contact: {
    phone: "+91 98765 43210",
    email: "concierge@vowsandvenues.in",
    hours: "Monday – Sunday, 9:00 AM – 9:00 PM IST",
    address: "DLF Cyber City, Tower B, Gurugram / Hazratganj, Lucknow"
  }
}

export const DEFAULT_MEDIA_LIBRARY = [
  {
    id: "med_1",
    title: "Udaipur Royal Palace Lakeside Mandap",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=75",
    altText: "Traditional Indian wedding mandap with royal lake palace backdrop",
    category: "venues",
    caption: "Heritage lake palace venue overlooking Lake Pichola",
    active: true
  },
  {
    id: "med_2",
    title: "Grand Banquet Chandelier Ballroom",
    url: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?auto=format&fit=crop&w=800&q=75",
    altText: "Grand chandelier banquet hall set up for Indian reception",
    category: "venues",
    caption: "Luxury crystal chandeliers with gold-draped banquet tables",
    active: true
  },
  {
    id: "med_3",
    title: "Awadhi Royal Shahi Dastarkhwan",
    url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=75",
    altText: "Authentic Indian royal catering banquet setup",
    category: "catering",
    caption: "Live copper handi counters serving authentic Awadhi delicacies",
    active: true
  },
  {
    id: "med_4",
    title: "Pastel Rose & Mogra Canopy Mandap",
    url: "https://images.unsplash.com/photo-1587271636175-90d58cdad458?auto=format&fit=crop&w=800&q=75",
    altText: "Grand floral mandap with fresh blush roses and marigold garlands",
    category: "decor",
    caption: "Bespoke floral architecture designed for grand outdoor weddings",
    active: true
  },
  {
    id: "med_5",
    title: "Celebrity HD Bridal Makeup & Jewels",
    url: "https://images.unsplash.com/photo-1600685890506-593fdf55949b?auto=format&fit=crop&w=800&q=75",
    altText: "Indian bride getting royal HD makeup and kundan jewelry",
    category: "makeup",
    caption: "Flawless airbrush bridal styling with traditional royal ornamentation",
    active: true
  },
  {
    id: "med_6",
    title: "Handcrafted Heritage Zardozi Lehenga",
    url: "https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?auto=format&fit=crop&w=800&q=75",
    altText: "Crimson red silk lehenga with intricate gold zardozi embroidery",
    category: "outfits",
    caption: "Designer bridal couture and groom sherwani collection on rental",
    active: true
  },
  {
    id: "med_7",
    title: "Candid 4K Royal Couple Portrait",
    url: "https://images.unsplash.com/photo-1744805624954-a6686543c3ff?auto=format&fit=crop&w=800&q=75",
    altText: "Emotional candid Indian wedding couple moment during pheras",
    category: "photography",
    caption: "Award-winning cinematic storytelling and candid wedding cinematography",
    active: true
  },
  {
    id: "med_8",
    title: "High-Energy Sangeet DJ & Dhol Celebration",
    url: "https://images.unsplash.com/photo-1541126274323-dbac58d14741?auto=format&fit=crop&w=800&q=75",
    altText: "Concert-grade sound setup and Bollywood DJ stage with dance lighting",
    category: "music",
    caption: "State-of-the-art concert sound systems and Punjabi live dhol players",
    active: true
  },
  {
    id: "med_9",
    title: "Artisanal Brass & Dry Fruit Wedding Hampers",
    url: "https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?auto=format&fit=crop&w=800&q=75",
    altText: "Luxury customized return gift box with dry fruits and brass keepsakes",
    category: "gifts",
    caption: "Customized wedding favors and luxury gourmet celebration mementos",
    active: true
  },
  {
    id: "med_10",
    title: "Royal Velvet Calligraphy Invitation Suites",
    url: "https://images.unsplash.com/photo-1656104717095-9d062b0d4e8d?auto=format&fit=crop&w=800&q=75",
    altText: "Gold foil embossed royal wedding invitation cards with wax seals",
    category: "invitations",
    caption: "Bespoke boxed invitations and animated royal video invitations",
    active: true
  }
]

export const DEFAULT_COUPONS = [
  {
    code: "ROYAL2026",
    title: "Royal Grand Wedding Privilege",
    discountType: "fixed",
    discountValue: 15000,
    minOrder: 100000,
    maxDiscount: 15000,
    validUntil: "2026-12-31",
    active: true,
    description: "Flat ₹15,000 discount on multi-vendor celebrations over ₹1,00,000"
  },
  {
    code: "SHUBH10",
    title: "Festive Season Discount",
    discountType: "percentage",
    discountValue: 10,
    minOrder: 40000,
    maxDiscount: 20000,
    validUntil: "2026-11-30",
    active: true,
    description: "10% off up to ₹20,000 on weddings & celebrations"
  },
  {
    code: "CELEBRATE5K",
    title: "Intimate Gathering Privilege",
    discountType: "fixed",
    discountValue: 5000,
    minOrder: 30000,
    maxDiscount: 5000,
    validUntil: "2026-12-31",
    active: true,
    description: "Flat ₹5,000 discount on birthdays, anniversaries, and engagements"
  }
]
