# CMM Roadmap

A phased plan for building out Church Member Marketplace. The guiding principle:
trust comes from real church membership and accountability, not star ratings.
Features should reinforce that, not dilute it.

Status keys: ✅ done · 🔨 in progress · ⬜ planned

---

## Phase 0 — Finish the core loop (in progress)

The minimum for the marketplace to feel complete and reliable.

- ✅ Auth, verification gate, listings, messaging, bookings, admin
- ✅ Full cmm rebrand across every page + shared UI kit
- ✅ Create/edit/delete listings, listing detail, provider profile page (basic)
- ✅ Re-verification with document upload
- 🔨 Church linking: pick from an admin-managed list or type a reference
- 🔨 Admin church management (create / activate / deactivate churches)
- 🔨 Provider bio on profiles
- 🔨 Email notifications: booking accepted/declined → requester, new booking →
  provider, new message → recipient, verified → member
- 🔨 Real password reset (token emailed, link sets a new password)
- ✅ Booking lifecycle: COMPLETED and CANCELLED states + "mark as done" / cancel

Requires database migrations (see the runbook at the bottom).

## Phase 1 — Trust & safety, the church way

Trust signals that fit a no-public-ratings model.

- ⬜ Member endorsements / "vouches" (a member confirms they'd recommend someone),
  visible only inside the network
- ✅ Report / flag flow for users and listings, with an admin moderation queue
- ⬜ Verification renewal (status can expire and be re-confirmed)
- ⬜ Admin audit log (who verified/deactivated what, when)
- ⬜ Safety guidance on payments; disputes routed to church leaders

## Phase 2 — Discovery & matching

- ✅ First-class Category model (icons, slugs); admin-managed, used by listing forms + browse
- ⬜ Location + radius filtering, availability filters, sorting
- ✅ "Request a service": members post a need, providers respond by message
- ⬜ Favorites / shortlist and saved searches

## Phase 3 — Engagement & retention

- ⬜ In-app notifications center + weekly digest email
- ⬜ Real-time messaging via Supabase Realtime (replace refresh-based threads)
- ⬜ Provider availability calendar
- ⬜ Testimonials limited to completed, verified bookings (moderated)

## Phase 4 — Church & admin tooling

- ⬜ Split roles: platform admins vs per-church admins with scoped permissions
- ⬜ Church onboarding flow + invite links for congregations
- ⬜ Bulk verification and CSV member import
- ⬜ Per-church analytics (signups, verifications, bookings)

## Phase 5 — Giving & monetization

- ⬜ Receipts / "this supported a member of <church>" and per-church totals
- ⬜ Featured listings (uses existing SubscriptionStatus FREE/PAID)
- ⬜ Church sponsorships
- Keep actual payment off-platform for now; add invoicing/receipts, not processing

## Phase 6 — Quality & infrastructure

- ✅ CI: GitHub Action running typecheck + build on every push (.github/workflows/ci.yml)
- ⬜ Tests (API routes, auth, booking flow)
- ⬜ Input validation + rate limiting on auth and form-POST routes
- ⬜ Security pass (JWT, bcrypt, CSRF on form posts, access controls)
- ⬜ Accessibility audit, SEO + metadata, structured data on public pages
- ⬜ Avatar / image uploads (Supabase storage helper already half-built)
- ⬜ Error monitoring (Sentry), full responsive pass, PWA + push

---

## Sequencing

1. Finish Phase 0 (this work)
2. Phase 4 church tooling + Phase 2 "request a service" — these unlock real usage
   at more churches
3. Phase 1 trust features + Phase 5 giving story
4. Phase 6 quality/CI runs alongside everything from here on

---

## Migration runbook (Phase 0)

Phase 0 adds two things to the schema: `UserProfile.bio` and a
`PasswordResetToken` model. Church linking needs no schema change (the
`UserProfile.church` relation already exists).

Run this on your machine, in the `CMM` folder, after pulling these changes:

There are two migrations to run (bio/reset was the first wave; booking states are
the second). If you've already applied the first, just run the booking one.

```bash
# Wave 1 (if not already applied): UserProfile.bio + PasswordResetToken
npx prisma migrate dev --name add_bio_and_password_reset

# Wave 2: COMPLETED and CANCELLED booking states
npx prisma migrate dev --name add_booking_states

# Wave 3: Report, Category, and ServiceRequest models
npx prisma migrate dev --name add_reports_categories_requests

# 2. Commit the generated migration files along with the code.
git add .
git commit -m "Phase 0: church linking, bio, emails, password reset + migration"
git push
```

Applying it to **production (Supabase)**. Your Vercel build runs
`prisma generate && next build`, which updates the client types but does NOT
apply migrations to the database. Pick one:

- Easiest: after pushing, run against production once:
  `npx prisma migrate deploy` with your production `DIRECT_URL` in the
  environment. This applies any pending migration files to Supabase.
- Or paste the generated SQL (in
  `prisma/migrations/<timestamp>_add_bio_and_password_reset/migration.sql`)
  into the Supabase SQL editor and run it.

Important: apply the migration to production **before or at the same time** as
the deploy, so the new columns exist when the new code runs. If code referencing
`bio` or the reset table ships before the DB has them, those routes will error at
runtime.

If you'd rather automate it, add `prisma migrate deploy &&` to the front of the
`build` script in package.json so every deploy applies pending migrations. Tell
me and I'll wire that up.
