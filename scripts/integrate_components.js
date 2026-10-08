const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'app', 'page.js');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Navbar replacement
const navStart = content.indexOf('{/* TOP ANNOUNCEMENT BANNER */}');
const navEnd = content.indexOf('</header>');
if (navStart === -1 || navEnd === -1) {
  console.error('Navbar markers not found');
  process.exit(1);
}
const navStartLine = content.lastIndexOf('\n', navStart);
const navEndLine = content.indexOf('\n', navEnd);

const newNavbar = `
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
      />`;

content = content.slice(0, navStartLine) + newNavbar + content.slice(navEndLine);
console.log('Navbar replaced successfully');

// 2. Home view replacement
const homeStart = content.indexOf("{activeTab === 'home' && (");
const exploreStart = content.indexOf("{activeTab === 'explore' && (");
if (homeStart === -1 || exploreStart === -1) {
  console.error('Home markers not found');
  process.exit(1);
}
const homeStartLine = content.lastIndexOf('\n', homeStart);
// Find the end of activeTab === 'home' which is right before the explore comment block
const exploreComment = content.lastIndexOf('{/* 2. EXPLORE MARKETPLACE', exploreStart);
const homeEndLine = content.lastIndexOf('\n', exploreComment);

const newHome = `
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

            {/* CURATED PRIVILEGES / OFFERS */}
            <CuratedOffers
              offers={cmsContent?.offers || []}
              onSelectOffer={(code) => {
                setBookingDetails(prev => ({ ...prev, promoCode: code }))
                toast.success(\`Applied \${code} to your event booking!\`)
              }}
            />

            {/* 11 EDITORIAL CATEGORIES */}
            <EditorialCategories
              categories={categories}
              onSelectCategory={(slug) => {
                setFilterCategory(slug)
                setActiveTab('explore')
              }}
            />

            {/* FEATURED SIGNATURE CREATORS & VENUES */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
                <div>
                  <div className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#4a1525] mb-1">
                    Curated Excellence
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1917]">
                    Featured Event Creators &amp; Venues
                  </h2>
                  <p className="text-xs text-[#78716c] mt-1">
                    Top-rated verified partners across {selectedCity === 'All Cities' ? 'Pan-India' : selectedCity} with verified reviews.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFilterCategory('all')
                    setActiveTab('explore')
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4a1525] hover:text-[#2d0c16] underline underline-offset-4 cursor-pointer mt-3 sm:mt-0"
                >
                  View Full Directory ({vendors.length}) &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredCreators.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    isFavorite={wishlistIds.includes(vendor.id)}
                    onToggleFavorite={handleToggleWishlist}
                    onSelectVendor={(v) => setSelectedVendorModal(v)}
                    onAddToEvent={(v) => handleAddVendorToEvent(v)}
                  />
                ))}
              </div>
            </section>

            {/* REAL CELEBRATIONS & EDITORIAL MEMOIRS */}
            {cmsContent?.testimonials?.length > 0 && (
              <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#e8e2d5]">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#4a1525] mb-1">
                    Client Memoirs
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1917]">
                    Celebrated by India&apos;s Discerning Families
                  </h2>
                  <p className="text-xs text-[#78716c] mt-2">
                    Real experiences from grand multi-day celebrations planned seamlessly through Vows &amp; Venues.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cmsContent.testimonials.map((t, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d5] shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1 text-[#c5a059] mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#c5a059]" />
                          ))}
                        </div>
                        <p className="font-serif italic text-sm text-[#2b2723] leading-relaxed mb-6">
                          &ldquo;{t.quote}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-[#f5f0eb]">
                        <img
                          src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=srgb&fm=jpg&q=85'}
                          alt={t.author}
                          className="w-11 h-11 rounded-full object-cover border border-[#c5a059]"
                        />
                        <div>
                          <div className="font-serif font-bold text-sm text-[#1c1917]">{t.author}</div>
                          <div className="text-[11px] text-[#78716c]">{t.event} &bull; {t.city}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FREQUENTLY ASKED QUESTIONS */}
            {cmsContent?.faqs?.length > 0 && (
              <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#e8e2d5]">
                <div className="text-center mb-10">
                  <div className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#4a1525] mb-1">
                    Questions &amp; Guidance
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-[#1c1917]">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-4">
                  {cmsContent.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="group bg-white rounded-2xl border border-[#e8e2d5] p-5 transition-all [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex items-center justify-between font-serif font-bold text-base text-[#1c1917] cursor-pointer">
                        <span>{faq.q}</span>
                        <ChevronDown className="w-4 h-4 text-[#78716c] group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-3 text-xs text-[#57534e] leading-relaxed">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* VIP CONCIERGE BANNER */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="bg-[#4a1525] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                <div className="space-y-3 max-w-xl">
                  <span className="bg-[#c5a059] text-[#1c1917] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    VIP Wedding Concierge
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#faf8f5]">
                    Need Bespoke Assistance for a Destination Celebration?
                  </h3>
                  <p className="text-xs text-[#f5ebd7]/85 leading-relaxed">
                    Our luxury event specialists offer complimentary one-on-one consultation, custom palace sourcing, and consolidated vendor contracts.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setActiveTab('builder')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="px-6 py-3.5 bg-[#c5a059] hover:bg-[#d4b06a] text-[#1c1917] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Start Event Architect
                  </button>
                  <a
                    href="tel:+919876543210"
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/20 text-center cursor-pointer"
                  >
                    Call Concierge Desk
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}
`;

content = content.slice(0, homeStartLine) + newHome + content.slice(homeEndLine);
console.log('Home view replaced successfully');

// 3. Event Builder replacement
const builderStart = content.indexOf("{activeTab === 'builder' && (");
const wishlistStart = content.indexOf("{activeTab === 'wishlist' && (");
if (builderStart === -1 || wishlistStart === -1) {
  console.error('Builder markers not found');
  process.exit(1);
}
const builderStartLine = content.lastIndexOf('\n', builderStart);
const wishlistComment = content.lastIndexOf('{/* 6. WISHLIST', wishlistStart);
const builderEndLine = content.lastIndexOf('\n', wishlistComment);

const newBuilder = `
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
`;

content = content.slice(0, builderStartLine) + newBuilder + content.slice(builderEndLine);
console.log('Builder replaced successfully');

// 4. Admin Portal replacement
const adminStart = content.indexOf("{activeTab === 'admin_portal' && (");
const mainEnd = content.indexOf('</main>');
if (adminStart === -1 || mainEnd === -1) {
  console.error('Admin markers not found');
  process.exit(1);
}
const adminStartLine = content.lastIndexOf('\n', adminStart);
const adminEndLine = content.lastIndexOf('\n', mainEnd);

const newAdmin = `
        {activeTab === 'admin_portal' && (
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
        )}
      `;

content = content.slice(0, adminStartLine) + newAdmin + content.slice(adminEndLine);
console.log('Admin portal replaced successfully');

// 5. Vendor Detail Modal replacement
const modalStart = content.indexOf('{selectedVendorModal && (');
const bookingModalStart = content.indexOf('{isBookingModalOpen && (');
if (modalStart === -1 || bookingModalStart === -1) {
  console.error('Modal markers not found');
  process.exit(1);
}
const modalStartLine = content.lastIndexOf('\n', content.lastIndexOf('{/* VENDOR DETAIL MODAL', modalStart));
const bookingComment = content.lastIndexOf('{/* 7-STEP BOOKING', bookingModalStart);
const modalEndLine = content.lastIndexOf('\n', bookingComment);

const newModal = `
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
        />
      )}
`;

content = content.slice(0, modalStartLine) + newModal + content.slice(modalEndLine);
console.log('Vendor detail modal replaced successfully');

// 6. Footer replacement
const footerStart = content.indexOf('<footer');
const footerEnd = content.indexOf('</footer>');
if (footerStart === -1 || footerEnd === -1) {
  console.error('Footer markers not found');
  process.exit(1);
}
const footerStartLine = content.lastIndexOf('\n', content.lastIndexOf('{/* FOOTER', footerStart));
const footerEndLine = content.indexOf('\n', footerEnd);

const newFooter = `
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
      />`;

content = content.slice(0, footerStartLine) + newFooter + content.slice(footerEndLine);
console.log('Footer replaced successfully');

fs.writeFileSync(pagePath, content, 'utf8');
console.log('app/page.js successfully updated with all modular components!');
