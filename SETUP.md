# Quick Start Guide

## Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your DATABASE_URL and JWT_SECRET
```

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

## Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Testing the Flow

1. **Sign Up** at `/signup`
   - Create two accounts: one MEMBER, one PROVIDER
   - Add church details (any values work for testing)

2. **Admin Verification**
   - Visit database with `npx prisma studio`
   - Update `UserProfile.verificationStatus` to `VERIFIED` for your test users

3. **Explore**
   - Dashboard shows verification status
   - Once verified, can browse listings and messaging
   - Providers can create listings
   - Members can request bookings

## Key Files to Understand

- `prisma/schema.prisma` - Database schema
- `lib/auth.ts` - Verification gate logic
- `lib/session.ts` - Get current user from JWT token
- `app/(auth)/*` - Sign up/login flows
- `app/dashboard/*` - Main user hub
- `app/api/auth/*` - Auth endpoints

## Making an Admin

```javascript
// In your database (prisma studio):
// Find a User and set isAdmin: true
```

Then visit `/manage` to see admin dashboard.

## Notes

- Passwords are bcrypt-hashed (12 rounds)
- JWT tokens valid for 30 days
- All session data in httpOnly cookie
- Verification required for browse/message/book

## Troubleshooting

**Port 3000 in use?**
```bash
npm run dev -- -p 3001
```

**Database connection fails?**
- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running

**Prisma client out of sync?**
```bash
npx prisma generate
```

## Next Steps

1. Implement file uploads for church reference letters
2. Add email notifications for admins
3. Build admin verification UI (`/admin/users`)
4. Add payment integration
5. Expand provider profiles
