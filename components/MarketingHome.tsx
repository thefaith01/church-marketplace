'use client'

import { useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Reusable bits                                                      */
/* ------------------------------------------------------------------ */

function Arch({
  stroke = '#C05A36',
  width = 26,
  height = 30,
  opacity = 0.45,
}: {
  stroke?: string
  width?: number
  height?: number
  opacity?: number
}) {
  return (
    <svg width={width} height={height} viewBox="0 0 26 30" fill="none">
      <path d="M2 29 V13 a11 11 0 0 1 22 0 V29" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M13 29 V8.5" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" opacity={opacity} />
    </svg>
  )
}

const NAV = [
  { href: '#how', label: 'How it works' },
  { href: '#trust', label: 'Why verified' },
  { href: '#who', label: "Who it's for" },
  { href: '#product', label: 'Inside the marketplace' },
]

const AUDIENCES = {
  members: {
    label: 'For members',
    lead: 'Find providers from your church and partner churches, never strangers from the open internet.',
    points: [
      'Browse services from people your community already vouches for.',
      'Search and filter for home, family, or professional help.',
      'Message privately to agree the details before you commit.',
      'Send clear booking requests that keep everyone aligned.',
    ],
  },
  providers: {
    label: 'For providers',
    lead: 'Offer your skills to a community grounded in shared faith and real accountability.',
    points: [
      'Create clear listings for your services, pricing and availability.',
      'Receive messages and bookings from verified members only.',
      'Flip listings Active or Inactive as your schedule changes.',
      'Grow your livelihood inside a community of real accountability.',
    ],
  },
  churches: {
    label: 'For churches',
    lead: 'Steward accountability for your congregation with simple, human verification.',
    points: [
      'Confirm membership so access stays gated to real members.',
      'Keep clean records of members, providers and listings.',
      'Deactivate anything that no longer fits your values.',
      'Help your community find opportunity and support each other.',
    ],
  },
} as const

type AudienceKey = keyof typeof AUDIENCES

const CATEGORIES = [
  'All',
  'Home & Trades',
  'Family & Care',
  'Professional',
  'Beauty & Wellness',
  'Tutoring & Music',
  'Food & Events',
]

const LISTINGS = [
  { initials: 'GA', name: 'Grace Adeyemi', title: 'Home & deep cleaning', category: 'Home & Trades', area: 'Croydon', price: '£18/hr', church: 'Redeemer, Croydon' },
  { initials: 'DO', name: 'Daniel Okoro', title: 'Plumbing & heating', category: 'Home & Trades', area: 'South London', price: 'Quote', church: 'Grace Chapel, Lewisham' },
  { initials: 'SB', name: 'Sarah Bennett', title: 'Childminding & nanny', category: 'Family & Care', area: 'Bromley', price: '£12/hr', church: 'St. Mary’s, Bromley' },
  { initials: 'MT', name: 'Michael Tran', title: 'Web & brand design', category: 'Professional', area: 'Remote', price: 'from £450', church: 'Hope City, London' },
  { initials: 'EM', name: 'Esther Mensah', title: 'Hair & protective styles', category: 'Beauty & Wellness', area: 'Lewisham', price: 'from £35', church: 'New Life, Peckham' },
  { initials: 'JP', name: 'Joshua Park', title: 'GCSE maths tutoring', category: 'Tutoring & Music', area: 'Online', price: '£25/hr', church: 'Cornerstone, Ealing' },
  { initials: 'RC', name: 'Ruth Cole', title: 'Event catering', category: 'Food & Events', area: 'Greater London', price: 'Quote', church: 'Emmanuel, Croydon' },
  { initials: 'PA', name: 'Peter Adeniyi', title: 'Moving & removals', category: 'Home & Trades', area: 'London-wide', price: 'Quote', church: 'Redeemer, Croydon' },
  { initials: 'HL', name: 'Hannah Lee', title: 'Family photography', category: 'Professional', area: 'Kent', price: 'from £200', church: 'Grace Chapel, Lewisham' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function MarketingHome({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [audience, setAudience] = useState<AudienceKey>('members')
  const [cat, setCat] = useState('All')

  const cur = AUDIENCES[audience]
  const listings = cat === 'All' ? LISTINGS : LISTINGS.filter((l) => l.category === cat)

  // Auth-aware destinations for the call-to-action buttons.
  const ctaHref = isLoggedIn ? '/dashboard' : '/signup'

  const FOOTER_COLS = [
    {
      head: 'Product',
      links: [
        { l: 'How it works', h: '#how' },
        { l: 'Why verified', h: '#trust' },
        { l: 'Browse services', h: '/listings' },
      ],
    },
    {
      head: 'Community',
      links: [
        { l: 'For churches', h: '#who' },
        { l: 'For providers', h: '#who' },
        { l: 'About us', h: '/about' },
      ],
    },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream font-sans text-ink">
      {/* ============================ NAV ============================ */}
      <header className="sticky top-0 z-50 border-b border-[#E7DDC9] bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-8 py-3.5">
          <a href="#top" className="flex items-center gap-[11px] no-underline">
            <Arch />
            <span className="font-display text-[25px] font-extrabold tracking-[-0.02em] text-ink">cmm</span>
          </a>
          <nav className="hidden items-center gap-[30px] md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-[15px] font-medium text-[#5A4F40] no-underline transition-colors hover:text-clay">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3.5">
            {isLoggedIn ? (
              <a href="/dashboard" className="whitespace-nowrap rounded-full bg-clay px-5 py-2.5 text-[15px] font-semibold text-paper no-underline">Dashboard</a>
            ) : (
              <>
                <a href="/login" className="whitespace-nowrap text-[15px] font-semibold text-ink no-underline">Log in</a>
                <a href="/signup" className="whitespace-nowrap rounded-full bg-clay px-5 py-2.5 text-[15px] font-semibold text-paper no-underline">Get verified</a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ============================ HERO ============================ */}
      <section id="top" className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-8 pb-10 pt-[72px] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-[26px] inline-flex items-center gap-[9px] rounded-full border border-[#E2D5BD] bg-chip px-[11px] py-[7px]">
            <span className="h-[7px] w-[7px] rounded-full bg-forest shadow-[0_0_0_3px_rgba(46,87,64,0.16)]" />
            <span className="text-[13px] font-semibold text-[#3C5040]">For church members across congregations</span>
          </div>
          <h1 className="font-display text-[68px] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink [text-wrap:balance]">
            Hire from the
            <br />
            <a href="/about#ekklesia" className="font-serif text-[68px] font-medium italic text-clay hover:underline">
              ekklesia<sup className="text-[26px] font-semibold not-italic">*</sup>
            </a>
          </h1>
          <p className="mt-6 max-w-[480px] text-[19px] leading-[1.55] text-[#5A4F40] [text-wrap:pretty]">
            A private marketplace where committed members of local churches hire one another across congregations, not just your own. Every member is church-verified before they can take part.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <a href={ctaHref} className="rounded-full bg-clay px-7 py-[15px] text-base font-semibold text-paper no-underline shadow-[0_6px_18px_rgba(192,90,54,0.28)]">
              {isLoggedIn ? 'Go to your dashboard' : "Get verified, it's free"}
            </a>
            <a href="#how" className="rounded-full border-[1.5px] border-[#D8C9AE] px-6 py-[15px] text-base font-semibold text-ink no-underline">See how it works</a>
          </div>
          <div className="mt-[38px] flex items-center gap-3.5">
            <div className="flex">
              <span className="grid h-9 w-9 place-items-center rounded-full border-[2.5px] border-cream bg-clay text-[13px] font-bold text-white">GA</span>
              <span className="-ml-3 grid h-9 w-9 place-items-center rounded-full border-[2.5px] border-cream bg-forest text-[13px] font-bold text-white">DO</span>
              <span className="-ml-3 grid h-9 w-9 place-items-center rounded-full border-[2.5px] border-cream bg-honey text-[13px] font-bold text-[#3A2A12]">EM</span>
              <span className="-ml-3 grid h-9 w-9 place-items-center rounded-full border-[2.5px] border-cream bg-[#7A6A55] text-[13px] font-bold text-white">+</span>
            </div>
            <p className="text-sm leading-[1.4] text-muted">
              Every member
              <br />
              <strong className="text-ink">verified by their church</strong>
            </p>
          </div>
        </div>

        {/* hero visual */}
        <div className="relative h-[480px]">
          <div className="absolute right-2 top-2 h-[380px] w-[300px] rounded-[160px_160px_28px_28px] bg-gradient-to-b from-[#E8D9BE] to-[#E0C9A4]" />
          <div className="absolute left-0 top-10 w-[330px] animate-floaty rounded-[22px] border border-[#EADFCB] bg-paper p-[22px] shadow-[0_24px_48px_-18px_rgba(60,40,20,0.28)]">
            <div className="flex items-center gap-[13px]">
              <span className="grid h-[52px] w-[52px] place-items-center rounded-full bg-clay font-display text-lg font-bold text-white">GA</span>
              <div className="flex-1">
                <div className="text-[17px] font-bold text-ink">Grace Adeyemi</div>
                <div className="text-[13px] text-[#8A7C66]">Redeemer Church, Croydon</div>
              </div>
              <span className="inline-flex items-center gap-[5px] rounded-full bg-sage px-2.5 py-[5px] text-[11.5px] font-bold text-forest">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l2.4 1.7 2.9-.2 1.2 2.7 2.5 1.5-.7 2.8.7 2.8-2.5 1.5-1.2 2.7-2.9-.2L12 22l-2.4-1.7-2.9.2-1.2-2.7L3 16.5l.7-2.8L3 10.9l2.5-1.5 1.2-2.7 2.9.2z" fill="#2E5740" />
                  <path d="M9 12l2 2 4-4" stroke="#E4EBDD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#EFE7D6] pt-4">
              <span className="rounded-full bg-chip px-[11px] py-[5px] text-xs font-semibold text-[#6F5E45]">Home cleaning</span>
              <span className="font-display text-lg font-bold text-ink">
                £18<span className="text-[13px] font-medium text-[#8A7C66]">/hr</span>
              </span>
            </div>
            <div className="mt-3.5 flex gap-2">
              <button className="flex-1 rounded-xl bg-clay p-[11px] text-sm font-semibold text-paper">Request booking</button>
              <button className="rounded-xl border-[1.5px] border-[#E5D8C0] bg-white px-3.5 py-[11px] text-sm font-semibold text-ink">Message</button>
            </div>
          </div>
          <div className="absolute bottom-6 right-0 flex animate-floaty2 items-center gap-[11px] rounded-2xl bg-forest px-[18px] py-3.5 text-[#EAF1E2] shadow-[0_16px_32px_-12px_rgba(46,87,64,0.5)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 18.3 5 14.4 5 10V6l7-3z" stroke="#DDA23A" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 11.5l2 2 4-4" stroke="#EAF1E2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="leading-[1.25]">
              <div className="text-sm font-bold">Church-verified</div>
              <div className="text-xs opacity-80">Confirmed members only</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ TICKER ============================ */}
      <div className="mt-6 overflow-hidden border-y border-[#E7DDC9] py-4">
        <div className="flex w-max animate-ticker gap-12 whitespace-nowrap">
          {[0, 1].map((i) => (
            <span key={i} className="font-display text-[17px] font-semibold text-[#B4A488]">
              Cleaning&nbsp;&nbsp;·&nbsp;&nbsp;Plumbing&nbsp;&nbsp;·&nbsp;&nbsp;Childminding&nbsp;&nbsp;·&nbsp;&nbsp;Web design&nbsp;&nbsp;·&nbsp;&nbsp;Tutoring&nbsp;&nbsp;·&nbsp;&nbsp;Catering&nbsp;&nbsp;·&nbsp;&nbsp;Removals&nbsp;&nbsp;·&nbsp;&nbsp;Photography&nbsp;&nbsp;·&nbsp;&nbsp;Hair &amp; beauty&nbsp;&nbsp;·&nbsp;&nbsp;Bookkeeping&nbsp;&nbsp;·&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ============================ HOW IT WORKS ============================ */}
      <section id="how" className="mx-auto max-w-[1200px] px-8 pb-14 pt-24">
        <div className="mx-auto mb-14 max-w-[620px] text-center">
          <p className="mb-3 font-serif text-xl italic text-clay">Four simple steps</p>
          <h2 className="font-display text-[44px] font-bold leading-[1.05] tracking-[-0.02em] text-ink">From stranger to known, the human way</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: '1', title: 'Sign up', body: 'Join as a member or a provider with your email and a few details.' },
            { n: '2', title: 'Link your church', body: 'Share a reference so an admin can confirm your membership.' },
            { n: '3', title: 'Get verified', body: 'Once confirmed, the whole marketplace unlocks for you.', check: true },
          ].map((s) => (
            <div key={s.n} className="rounded-[20px] border border-line bg-paper p-7">
              <div className={`mb-5 grid h-[54px] w-[54px] place-items-center rounded-[50%_50%_14px_14px] ${s.check ? 'bg-sage' : 'bg-chip'}`}>
                {s.check ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#2E5740" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="font-display text-[22px] font-extrabold text-clay">{s.n}</span>
                )}
              </div>
              <h3 className="mb-2 font-display text-xl font-bold text-ink">{s.title}</h3>
              <p className="text-[15px] leading-[1.5] text-muted">{s.body}</p>
            </div>
          ))}
          <div className="rounded-[20px] border border-ink bg-ink p-7">
            <div className="mb-5 grid h-[54px] w-[54px] place-items-center rounded-[50%_50%_14px_14px] bg-[#3A2E22]">
              <span className="font-display text-[22px] font-extrabold text-honey">4</span>
            </div>
            <h3 className="mb-2 font-display text-xl font-bold text-paper">Connect &amp; book</h3>
            <p className="text-[15px] leading-[1.5] text-[#C9BCA6]">Message, agree the details, and book people from your church family directly.</p>
          </div>
        </div>
      </section>

      {/* ============================ TRUST ============================ */}
      <section id="trust" className="mt-12 bg-forest">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 px-8 py-[88px] lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="mb-3.5 font-serif text-xl italic text-honey">Why verification comes first</p>
            <h2 className="font-display text-[46px] font-bold leading-[1.04] tracking-[-0.02em] text-paper [text-wrap:balance]">Accountability before the first hello.</h2>
            <p className="mt-[22px] max-w-[480px] text-lg leading-[1.6] text-[#CBD7C2]">
              On an open marketplace, anyone can sign up. Here, every person is a confirmed member of a local church, not just an attendee, before they can browse, message or book. That verification is the foundation everything else is built on.
            </p>
            <div className="mt-9 flex flex-wrap gap-10">
              {[
                { stat: 'Verified', label: 'every member, no exceptions' },
                { stat: 'Private', label: 'members-only by design' },
                { stat: 'Accountable', label: 'grounded in real churches' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-[28px] font-extrabold text-honey">{s.stat}</div>
                  <div className="mt-0.5 text-sm text-[#A9BCA0]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3.5">
            {[
              {
                bg: 'bg-sage',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 18.3 5 14.4 5 10V6l7-3z" stroke="#2E5740" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M9 11.5l2 2 4-4" stroke="#2E5740" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Church-confirmed identity',
                body: 'A real person your community knows.',
              },
              {
                bg: 'bg-[#F1E2CC]',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M4 5h16v11H7l-3 3z" stroke="#C05A36" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Private, members-only',
                body: 'No strangers from the open internet.',
              },
              {
                bg: 'bg-chip',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="8" r="3" stroke="#7A6A55" strokeWidth="1.8" />
                    <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.5a3 3 0 0 1 0 6M16.5 19a5.5 5.5 0 0 0-2-4.3" stroke="#7A6A55" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Accountable offline too',
                body: 'Leaders can follow up the human way.',
              },
            ].map((c) => (
              <div key={c.title} className="flex items-center gap-3.5 rounded-2xl bg-paper px-5 py-[18px]">
                <span className={`grid h-[42px] w-[42px] flex-shrink-0 place-items-center rounded-xl ${c.bg}`}>{c.icon}</span>
                <div>
                  <div className="text-[15.5px] font-bold text-ink">{c.title}</div>
                  <div className="text-[13.5px] text-muted">{c.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CATEGORIES ============================ */}
      <section className="mx-auto max-w-[1200px] px-8 pb-10 pt-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-2.5 font-serif text-xl italic text-clay">Whatever you need doing</p>
            <h2 className="font-display text-[44px] font-bold leading-[1.05] tracking-[-0.02em] text-ink">Real skills, real neighbours</h2>
          </div>
          <a href="/listings" className="border-b-2 border-clay pb-0.5 text-[15px] font-semibold text-ink no-underline">Browse all services →</a>
        </div>
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Home & Trades', body: 'Cleaning, plumbing, repairs, removals', icon: <path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M9.5 20v-6h5v6" stroke="#C05A36" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /> },
            { title: 'Family & Care', body: 'Childminding, eldercare, tutoring', icon: <path d="M12 20s-7-4.3-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.7 12 20 12 20z" stroke="#C05A36" strokeWidth="1.7" strokeLinejoin="round" /> },
            { title: 'Professional', body: 'Design, bookkeeping, photography', icon: <><rect x="3" y="7" width="18" height="13" rx="2" stroke="#C05A36" strokeWidth="1.7" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#C05A36" strokeWidth="1.7" strokeLinecap="round" /></> },
            { title: 'Beauty & Wellness', body: 'Hair, braiding, fitness, therapy', icon: <><path d="M12 3v18M5 8c0 4 3 5 7 5s7-1 7-5" stroke="#C05A36" strokeWidth="1.7" strokeLinecap="round" /><circle cx="12" cy="5" r="2" stroke="#C05A36" strokeWidth="1.7" /></> },
            { title: 'Tutoring & Music', body: 'Maths, English, piano, vocals', icon: <><path d="M9 18V6l11-2v12M9 14l11-2" stroke="#C05A36" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6.5" cy="18" r="2.5" stroke="#C05A36" strokeWidth="1.7" /></> },
            { title: 'Food & Events', body: 'Catering, baking, event help', icon: <path d="M6 3v8a3 3 0 0 0 6 0V3M9 3v18M18 3c-1.5 1-2 3-2 6s.5 4 2 4v8" stroke="#C05A36" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /> },
          ].map((c) => (
            <div key={c.title} className="rounded-[18px] border border-line bg-paper p-6">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">{c.icon}</svg>
              <h3 className="mb-[5px] mt-4 font-display text-[19px] font-bold text-ink">{c.title}</h3>
              <p className="text-sm text-[#7A6E5C]">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ WHO IT'S FOR ============================ */}
      <section id="who" className="mx-auto max-w-[1080px] px-8 py-20">
        <div className="grid grid-cols-1 items-center gap-12 rounded-[28px] border border-line bg-paper p-6 sm:p-9 lg:grid-cols-[0.85fr_1fr] lg:p-12">
          <div>
            <h2 className="font-display text-[38px] font-bold leading-[1.05] tracking-[-0.02em] text-ink">Built for everyone in the pew</h2>
            <p className="mt-3.5 text-base leading-[1.55] text-muted">Members hire, providers earn, and churches keep it accountable. Pick a view:</p>
            <div className="mt-[26px] flex w-full gap-1.5 rounded-[28px] bg-chip p-[5px] sm:inline-flex sm:w-auto">
              {(['members', 'providers', 'churches'] as AudienceKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setAudience(k)}
                  className={`flex-1 whitespace-nowrap rounded-full px-2 py-2.5 text-center text-[13.5px] font-semibold capitalize transition-all sm:flex-none sm:px-5 sm:text-[14.5px] ${
                    audience === k ? 'bg-ink text-cream' : 'bg-transparent text-muted'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-[280px] rounded-[20px] bg-cream p-8">
            <h3 className="font-display text-2xl font-bold text-clay">{cur.label}</h3>
            <p className="mt-2 text-base leading-[1.5] text-[#5A4F40]">{cur.lead}</p>
            <div className="mt-5 flex flex-col gap-3">
              {cur.points.map((p) => (
                <div key={p} className="flex items-start gap-[11px]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-px flex-shrink-0">
                    <circle cx="12" cy="12" r="10" fill="#E4EBDD" />
                    <path d="M8 12l2.5 2.5L16 9" stroke="#2E5740" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[15.5px] leading-[1.45] text-[#3C3528]">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ SUPPORT THE CHURCH ============================ */}
      <section className="mx-auto max-w-[1200px] px-8 pb-[90px] pt-10">
        <div className="mx-auto mb-[52px] max-w-[680px] text-center">
          <p className="mb-2.5 font-serif text-xl italic text-clay">Bigger than a transaction</p>
          <h2 className="font-display text-[43px] font-bold leading-[1.05] tracking-[-0.02em] text-ink [text-wrap:balance]">Hire one believer, strengthen a whole church</h2>
          <p className="mt-4 text-[17.5px] leading-[1.55] text-muted [text-wrap:pretty]">
            When you hire a verified member, you support their livelihood and the church they faithfully give to. Your everyday spending becomes quiet support for the body of Christ.
          </p>
        </div>
        <div className="flex flex-wrap items-stretch gap-3">
          <div className="min-w-[230px] flex-1 rounded-[22px] bg-clay p-[30px] text-paper">
            <div className="mb-[34px] flex items-center justify-between">
              <span className="font-display text-[15px] font-extrabold opacity-65">01</span>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.4" stroke="#FCF8F1" strokeWidth="1.8" />
                <path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke="#FCF8F1" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="mb-[7px] font-display text-[22px] font-bold">You hire</h3>
            <p className="text-[14.5px] leading-[1.5] opacity-90">Choose a church-verified provider from congregations right across the network, not just your own.</p>
          </div>
          <div className="flex items-center text-[#C9B79A]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="#C9B79A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div className="min-w-[230px] flex-1 rounded-[22px] border border-line bg-paper p-[30px]">
            <div className="mb-[34px] flex items-center justify-between">
              <span className="font-display text-[15px] font-extrabold text-[#C9B79A]">02</span>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="9" r="5" stroke="#C05A36" strokeWidth="1.8" />
                <path d="M14.5 5.2a5 5 0 0 1 0 9.6" stroke="#C05A36" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="mb-[7px] font-display text-[22px] font-bold text-ink">They earn</h3>
            <p className="text-[14.5px] leading-[1.5] text-muted">Honest work and fair pay kept within the community of faith, not handed to a stranger.</p>
          </div>
          <div className="flex items-center text-[#C9B79A]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="#C9B79A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div className="min-w-[230px] flex-1 rounded-[22px] bg-forest p-[30px] text-paper">
            <div className="mb-[34px] flex items-center justify-between">
              <span className="font-display text-[15px] font-extrabold text-honey">03</span>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 2.5v3.5M10.3 4.2h3.4" stroke="#DDA23A" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M5 21V11l7-3.8 7 3.8v10" stroke="#FCF8F1" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9.5 21v-4.6h5V21" stroke="#FCF8F1" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mb-[7px] font-display text-[22px] font-bold">Their church is supported</h3>
            <p className="text-[14.5px] leading-[1.5] text-[#C8D7BF]">Through their giving and tithes, a share of your spend flows back to the local church.</p>
          </div>
        </div>
        <p className="mt-[30px] text-center font-serif text-xl italic text-[#7A6E5C]">Every job becomes a small act of giving.</p>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="mx-auto mb-[90px] max-w-[1200px] px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-ink px-12 py-[72px] text-center">
          <div className="absolute left-1/2 top-[-60px] h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(192,90,54,0.35),transparent_70%)]" />
          <div className="relative">
            <div className="mb-[22px] flex justify-center">
              <Arch stroke="#DDA23A" width={40} height={46} opacity={0.5} />
            </div>
            <h2 className="font-display text-[52px] font-extrabold leading-[1.02] tracking-[-0.025em] text-paper [text-wrap:balance]">Find your people.</h2>
            <p className="mx-auto mt-[18px] max-w-[440px] text-lg leading-[1.5] text-[#C9BCA6]">Get verified through your church and join a community grounded in real accountability.</p>
            <div className="mt-[34px] flex flex-wrap justify-center gap-3.5">
              <a href={ctaHref} className="rounded-full bg-clay px-[30px] py-[15px] text-base font-semibold text-paper no-underline">
                {isLoggedIn ? 'Go to dashboard' : 'Get verified'}
              </a>
              <a href="/about" className="rounded-full border-[1.5px] border-[#4A3E30] px-7 py-[15px] text-base font-semibold text-paper no-underline">Talk to us about your church</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer className="border-t border-[#E7DDC9]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-8 pb-10 pt-[54px] md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3.5 flex items-center gap-2.5">
              <Arch width={24} height={28} />
              <span className="font-display text-[21px] font-extrabold text-ink">cmm</span>
            </div>
            <p className="max-w-[240px] text-[14.5px] leading-[1.55] text-[#7A6E5C]">A community marketplace for verified church members. Grounded in real congregations, not algorithm ratings.</p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.head}>
              <div className="mb-3.5 text-[13px] font-bold uppercase tracking-[0.08em] text-faint">{col.head}</div>
              <div className="flex flex-col gap-2.5">
                {col.links.map((x) => (
                  <a key={x.l} href={x.h} className="text-[15px] text-[#5A4F40] no-underline">{x.l}</a>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div className="mb-3.5 text-[13px] font-bold uppercase tracking-[0.08em] text-faint">Coming soon</div>
            <div className="flex flex-col gap-2.5">
              {['Events', 'Community', 'Mentorship'].map((l) => (
                <span key={l} className="text-[15px] text-[#A99A82]">{l}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 border-t border-[#E7DDC9] px-8 pb-10 pt-5">
          <span className="text-[13.5px] text-faint">© 2026 CMM Church Member Marketplace</span>
          <div className="flex flex-wrap gap-4 text-[13.5px]">
            <a href="/help" className="text-faint no-underline hover:text-clay">Help</a>
            <a href="/terms" className="text-faint no-underline hover:text-clay">Terms</a>
            <a href="/privacy" className="text-faint no-underline hover:text-clay">Privacy</a>
          </div>
        </div>
      </footer>

      {/* ============================ PRODUCT SCREENS ============================ */}
      <section id="product" className="border-t border-[#DAD2C4] bg-[#E9E4DA]">
        <div className="mx-auto max-w-[1240px] px-8 pb-24 pt-20">
          <div className="mx-auto mb-14 max-w-[600px] text-center">
            <p className="mb-2.5 font-serif text-xl italic text-clay">Inside the marketplace</p>
            <h2 className="font-display text-[40px] font-bold tracking-[-0.02em] text-ink">The same warmth, all the way in</h2>
            <p className="mt-3 text-base text-muted">An illustrative preview of the member experience. Names and listings shown are samples only. The browse filter below is live, try it.</p>
          </div>

          {/* Dashboard frame */}
          <div className="mb-3.5 flex items-center gap-2.5">
            <span className="font-display text-[15px] font-bold text-[#7A6E5C]">01 Member dashboard</span>
            <span className="h-px flex-1 bg-[#D5CCBC]" />
          </div>
          <div className="mb-14 overflow-hidden rounded-[20px] border border-[#E2D9C8] bg-cream shadow-[0_24px_60px_-30px_rgba(60,40,20,0.4)]">
            <AppHeader active="Dashboard" />
            <div className="px-9 pb-10 pt-8">
              <h3 className="font-display text-[30px] font-bold text-ink">Welcome back, Ruth</h3>
              <p className="mt-1 text-[15px] text-[#7A6E5C]">Your hub for the church marketplace.</p>
              <div className="mt-[22px] flex flex-col items-start gap-3 rounded-2xl border border-[#E8D3A6] bg-[#F4E7CE] px-[22px] py-[18px] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="grid h-[42px] w-[42px] flex-shrink-0 place-items-center rounded-xl bg-honey">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#3A2A12" strokeWidth="1.8" />
                      <path d="M12 7.5V12l3 2" stroke="#3A2A12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <div className="text-base font-bold text-[#5A4214]">Verification pending</div>
                    <div className="mt-px text-sm text-[#7A6230]">Your church admin is confirming your membership. Most features unlock once verified.</div>
                  </div>
                </div>
                <a href="#" className="shrink-0 whitespace-nowrap rounded-full bg-clay px-[18px] py-2.5 text-sm font-semibold text-paper no-underline">Check status</a>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-[18px] border border-line bg-paper p-6">
                  <h4 className="mb-4 font-display text-[18px] font-bold text-ink">Your profile</h4>
                  <div className="flex flex-col gap-[11px]">
                    {[
                      ['Name', 'Ruth Adeyemi'],
                      ['Role', 'Member'],
                      ['Church', 'Redeemer, Croydon'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-sm text-faint">{k}</span>
                        <span className="text-sm font-semibold text-ink">{v}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-faint">Verification</span>
                      <span className="rounded-full bg-[#F4E7CE] px-2.5 py-[3px] text-xs font-bold text-[#8A6420]">Pending</span>
                    </div>
                  </div>
                  <a href="#" className="mt-[18px] block rounded-xl border-[1.5px] border-[#E5D8C0] p-2.5 text-center text-sm font-semibold text-[#5A4F40] no-underline">Edit church info</a>
                </div>
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {['Browse services', 'Messages'].map((t) => (
                    <div key={t} className="rounded-2xl border border-line bg-paper p-5 opacity-55">
                      <div className="flex justify-between">
                        <span className="text-base font-bold text-ink">{t}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="5" y="11" width="14" height="9" rx="2" stroke="#9A8C76" strokeWidth="1.8" />
                          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#9A8C76" strokeWidth="1.8" />
                        </svg>
                      </div>
                      <p className="mt-2 text-[13.5px] text-faint">{t === 'Messages' ? 'Unlocks after verification.' : 'Find providers nearby.'}</p>
                    </div>
                  ))}
                  <div className="col-span-1 flex items-center justify-between rounded-2xl bg-forest p-5 sm:col-span-2">
                    <div>
                      <div className="text-base font-bold text-paper">While you wait…</div>
                      <p className="mt-1 text-[13.5px] text-[#B6C8AD]">Complete your profile so verification is quick.</p>
                    </div>
                    <a href="#" className="whitespace-nowrap rounded-full bg-honey px-4 py-[9px] text-[13.5px] font-bold text-[#3A2A12] no-underline">Finish profile</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listings frame */}
          <div className="mb-3.5 flex items-center gap-2.5">
            <span className="font-display text-[15px] font-bold text-[#7A6E5C]">
              02 Browse services <span className="text-clay">(live filter)</span>
            </span>
            <span className="h-px flex-1 bg-[#D5CCBC]" />
          </div>
          <div className="overflow-hidden rounded-[20px] border border-[#E2D9C8] bg-cream shadow-[0_24px_60px_-30px_rgba(60,40,20,0.4)]">
            <AppHeader active="Browse" />
            <div className="px-9 pb-10 pt-8">
              <h3 className="font-display text-[30px] font-bold text-ink">Find services</h3>
              <p className="mt-1 text-[15px] text-[#7A6E5C]">Offered by verified members of your church network.</p>
              <div className="mt-6 flex flex-wrap gap-[9px]">
                {CATEGORIES.map((name) => {
                  const active = cat === name
                  return (
                    <button
                      key={name}
                      onClick={() => setCat(name)}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-all ${
                        active ? 'border-clay bg-clay text-paper' : 'border-[#E2D7C2] bg-white text-muted'
                      }`}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
              <p className="mt-5 text-sm text-faint">
                <strong className="text-ink">{listings.length}</strong> verified providers
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {listings.map((l) => (
                  <div key={l.name + l.title} className="rounded-[18px] border border-line bg-paper p-5">
                    <div className="flex items-center gap-[11px]">
                      <span className="grid h-[42px] w-[42px] place-items-center rounded-full bg-clay font-display text-sm font-bold text-white">{l.initials}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-bold text-ink">{l.name}</div>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] text-faint">{l.church}</div>
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 18.3 5 14.4 5 10V6l7-3z" fill="#E4EBDD" />
                        <path d="M9 11.5l2 2 4-4" stroke="#2E5740" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h4 className="my-3.5 font-display text-[17px] font-bold text-ink">{l.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-semibold text-[#6F5E45]">{l.category}</span>
                      <span className="text-[13px] text-[#7A6E5C]">{l.area}</span>
                    </div>
                    <div className="mt-3.5 flex items-center justify-between border-t border-[#EFE7D6] pt-3.5">
                      <span className="font-display text-base font-bold text-ink">{l.price}</span>
                      <span className="rounded-full bg-clay px-3.5 py-[7px] text-[13px] font-semibold text-paper">View</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  App preview header (shared by the two product screens)             */
/* ------------------------------------------------------------------ */

function AppHeader({ active }: { active: 'Dashboard' | 'Browse' }) {
  const items = ['Dashboard', 'Browse', 'Messages', 'Bookings']
  return (
    <div className="flex items-center justify-between border-b border-[#E7DDC9] bg-cream/90 px-6 py-3.5">
      <div className="flex items-center gap-[9px]">
        <Arch width={20} height={24} />
        <span className="font-display text-lg font-extrabold text-ink">cmm</span>
      </div>
      <div className="hidden gap-6 md:flex">
        {items.map((i) => (
          <span key={i} className={`text-sm ${i === active ? 'font-semibold text-ink' : 'text-[#8A7C66]'}`}>{i}</span>
        ))}
      </div>
      <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-forest text-[13px] font-bold text-white">RA</span>
    </div>
  )
}
