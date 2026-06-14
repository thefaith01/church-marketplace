# CMM Roadmap

A phased plan for building out Church Member Marketplace.

**Guiding principle.** The value is real church membership and the accountability
it brings, not star ratings and not a promise that anyone is trustworthy.
Membership is verified through a member's local church and is a starting point for
your own judgment, never a substitute for it. Features should reinforce that.

Status keys: ✅ done · 🔨 in progress · ⬜ planned · ✕ not pursuing

---

## Live now (deployed)

cmm-branded marketplace on Vercel + Supabase, custom domain **cmmarketplace.org**,
transactional email via Resend, private document storage, and CI on every push.

**Configured:** Resend (`RESEND_API_KEY`, `EMAIL_FROM`), `APP_URL`, Supabase
(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), private `verification-docs` bucket,
domain connected, GitHub Actions CI.

**Outstanding config (small):**
- Public `media` bucket in Supabase, to switch on avatars + listing photos
- Rotate `JWT_SECRET` off the placeholder value (you said you'd do this later)
- Complete the Vercel billing address so the domain auto-renews
- Enable Row Level Security on the Supabase tables (part of the Phase 6 security pass)

---

## Phase 0 — Core loop (COMPLETE ✅)

- ✅ Auth, verification gate, listings, messaging, bookings, admin
- ✅ Full cmm rebrand across every page + shared UI kit
- ✅ Create / edit / delete listings, listing detail, provider profiles
- ✅ Church linking (pick from an admin list or type) + admin church management
- ✅ Provider bio
- ✅ Re-verification with private document upload (admin signed-URL viewing)
- ✅ Email notifications: booking accepted/declined → requester, new booking →
  provider, new message → recipient (debounced), verified → member
- ✅ Real password reset (emailed token → set a new password)
- ✅ Booking lifecycle: ACCEPTED, DECLINED, COMPLETED, CANCELLED + mark-as-done / cancel

## Phase 1 — Accountability & safety, the church way

- ✅ Church leader (elder) approval — leaders verify/revoke members of their own church
- ✅ Report / flag flow for listings and members + admin moderation queue
- ✅ Background-check flags for sensitive categories (admin-set; badged on listings)
- 🔨 Safety guidance in copy (due-diligence framing now on the About and Terms pages)
- ⬜ Verification renewal (status can expire and be re-confirmed)
- ⬜ Admin audit log (who verified/deactivated what, when)

## Phase 2 — Discovery & matching

- ✅ First-class Category model (icons, slugs); admin-managed, used by forms + browse
- ✅ "Request a service": members post a need, providers respond by message
- ✅ Acts of service (free community help) listings, flagged and badged
- ✅ Smart matching: providers emailed when a new request matches their category
- ✅ "Hired by your church" recommendations on the browse page
- ✅ Favorites / saved listings
- ⬜ Saved searches
- ⬜ Location + radius filtering, availability filters, sorting

## Phase 3 — Engagement & retention

- ✅ Live messaging (polls the authenticated API; messages appear without refresh).
  A true-websocket upgrade would need Supabase Auth + RLS, since the app uses its own JWT.
- ⬜ In-app notifications center + weekly digest email
- ⬜ Provider availability calendar + "request a time"
- ⬜ Testimonials limited to completed, verified bookings (moderated)

## Phase 4 — Church & admin tooling

- ⬜ Split roles: platform admins vs per-church admins with scoped permissions
  (elder approval in Phase 1 is the first step)
- ⬜ Church onboarding flow + invite links for congregations
- ⬜ Bulk verification and CSV member import
- ⬜ Per-church analytics (signups, verifications, bookings) + public church pages

## Phase 5 — Giving & monetization

- ✅ Featured listings (admin-set; sorted first with a badge)
- ⬜ Church sponsorships
- ✕ Giving receipts / "supported your church" (declined)
- Payments stay off-platform; add invoicing/quotes later, not processing

## Phase 6 — Quality, content & infrastructure

- ✅ CI: GitHub Action running typecheck + build on every push
- ✅ Avatars + listing photos (code done; needs the public `media` bucket)
- ✅ Terms, Privacy, and Help/FAQ pages
- ⬜ Guided onboarding (members vs providers)
- ⬜ Tests (API routes, auth, booking flow)
- ⬜ Input validation + rate limiting on auth and form-POST routes
- ⬜ Security pass: Row Level Security, JWT rotation, CSRF on form posts, access-control review
- ⬜ Accessibility audit, SEO + metadata, structured data, full responsive pass
- ⬜ Error monitoring (Sentry), PWA + push

---

## Suggested next

1. Switch on avatars/photos (create the `media` bucket) and the JWT rotation —
   both small and already half-set-up.
2. Notifications center + weekly digest (Phase 3), so members come back.
3. Church tooling (Phase 4): invite links and per-church analytics, to grow to more churches.
4. Run the security pass (Phase 6) in parallel as you head toward real users.

---

## Migrations & deploy

Your local `.env` points at the Supabase database, so `npx prisma migrate dev`
applies changes straight to it. There is no separate `migrate deploy` step. CI
runs typecheck + build on every push.

For each schema change: from the `CMM` folder run

```bash
npx prisma migrate dev --name <short_name>
git add . && git commit -m "<message>" && git push
```

Migrations applied so far:

```
init
add_bio_and_password_reset
add_booking_states
add_reports_categories_requests
add_leader_featured_freehelp
add_favorites_checks_images
```

If `prisma migrate dev` ever warns about resetting the database or "drift," stop
and check before answering, so you don't wipe data on a shared database.
