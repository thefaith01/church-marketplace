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
- Rotate `JWT_SECRET` to a strong value (code now warns until you do) + redeploy
- VAPID keys are set; web push is ready once the notifications batch is deployed
- Complete the Vercel billing address so the domain auto-renews
- Enable Row Level Security on the Supabase tables (optional defense in depth)

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
- ✅ Safety guidance in copy (due-diligence framing on the About and Terms pages)
- ✅ Verification renewal — verification expires (providers 1 year, members 2 years)
  and must be re-confirmed; dashboard shows an "expired" banner
- ✅ Member → provider requests — members ask to offer services; needs church
  acknowledgement (a note/document upload, a request to their church leader, or an
  admin reaching out via the church contact); admin approves to flip the role
- ✅ Admin audit log — verify/revoke (admin + leader) and provider-request decisions
  are recorded with who, what, and when (`/admin/audit`)

## Phase 2 — Discovery & matching

- ✅ First-class Category model (icons, slugs); admin-managed, used by forms + browse
- ✅ "Request a service": members post a need, providers respond by message
- ✅ Acts of service (free community help) listings, flagged and badged
- ✅ Smart matching: providers emailed when a new request matches their category
- ✅ "Hired by your church" recommendations on the browse page
- ✅ Favorites / saved listings
- ✅ Saved searches — save the current keyword/category/area/pricing filter and
  re-apply it as a chip on the browse page
- ✅ Sorting on browse (newest, oldest, name A–Z; featured always first)
- ⬜ Location + radius filtering, availability filters
  (radius needs a geocoding service; deferred until one is chosen)

## Phase 3 — Engagement & retention

- ✅ Live messaging (polls the authenticated API; messages appear without refresh).
  A true-websocket upgrade would need Supabase Auth + RLS, since the app uses its own JWT.
- ✅ Notifications system — in-app center (bell + unread badge at /notifications),
  web push (service worker + VAPID), and email, all routed through one dispatcher
  (lib/notify) and controlled from a per-user preferences page (/dashboard/notifications).
  Wired for messages, bookings (request/accept/decline), verification, and provider decisions.
- ✅ Mobile header menu (hamburger) so navigation works on phones, logged in or out.
- ✅ Admins have full user capabilities (create/manage listings, message, book) on top of admin.
- ✅ Two-sided completion — provider marks done → member confirms (or reports a problem,
  which reopens it and notifies the provider, with an option to escalate to the church
  leader). Both sides are notified at each step.
- ✅ Testimonials on completed bookings — member can leave an optional written testimonial
  (no star ratings), moderated by an admin, shown on the provider's profile once approved.
- ⬜ Weekly digest email
- ⬜ Provider availability calendar + "request a time"

## Phase 4 — Church & admin tooling (COMPLETE ✅)

- ✅ Per-church admin = the church leader, scoped to their own church (invite links,
  bulk verify, analytics, all limited to their congregation)
- ✅ Church onboarding via invite links — shareable join link per church plus
  single-use email invites; joiners are pre-linked to the church and still confirmed
- ✅ Bulk verification — select multiple pending members and confirm them at once
- ✅ CSV member import — paste/upload a list and choose to send invites, add to a
  pre-approved roster (auto-links matching signups), or both
- ✅ Per-church analytics at /leader/analytics (members, verified, pending, providers,
  listings, bookings, invites, roster)
- ✅ Shareable church pages — /churches/[id] (join CTA + the church's public service
  listings) and /join/[code] work by URL for recruiting. No public directory and no nav
  link, so the platform doesn't broadcast a list of every congregation (/churches → home).

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
- ✅ Input validation + rate limiting on auth routes (login, signup, password reset)
- ✅ Security response headers (HSTS, nosniff, frame-deny, referrer, permissions)
- ✅ JWT secret hardening — code now requires a real secret and warns on the weak placeholder
- 🔨 Security pass remainder: rotate JWT_SECRET to a strong value (your action),
  Row Level Security on Supabase, CSRF tokens on form posts
- ⬜ Accessibility audit, SEO + metadata, structured data, full responsive pass
- ⬜ Error monitoring (Sentry), PWA + push

---

## Suggested next

1. Rotate `JWT_SECRET` to a strong value and deploy the security batch (built, not yet pushed).
2. Switch on avatars/photos by creating the public `media` bucket in Supabase (code already done).
3. Church tooling (Phase 4): onboarding + invite links and per-church analytics, to grow to more churches.
4. Finish the security pass: Row Level Security + CSRF tokens (both optional, defense in depth).
5. Weekly digest email and provider availability / "request a time" (Phase 3).

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
add_provider_requests_audit_saved_verified
add_notifications_push
add_church_invites_roster
add_booking_confirmation_testimonials
```

All migrations above are applied and live. The next code batch (security hardening:
rate limiting, validation, headers, JWT hardening) has **no** schema change, so it
needs only `npm run build` + commit + push, plus rotating `JWT_SECRET` in Vercel.

If `prisma migrate dev` ever warns about resetting the database or "drift," stop
and check before answering, so you don't wipe data on a shared database.
