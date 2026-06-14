# Church Member Marketplace

A private, church-verified marketplace where Christians hire each other for services. Trust comes from church verification, not public ratings.

## Features

- **Member Verification**: Admin-verified users ensure community trust
- **Service Marketplace**: Browse and list services from verified providers
- **Messaging System**: Direct communication between members and providers
- **Booking Requests**: Simple request and response workflow
- **Role-Based Access**: Members, Providers, and Admins have different capabilities
- **Verification Gate**: All marketplace features locked behind church verification

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT with bcrypt
- **Runtime**: Node.js

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `JWT_SECRET` (any secure random string)

3. **Set up Prisma:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
church-member-marketplace/
├── app/
│   ├── (auth)/              # Auth routes (signup, login)
│   ├── api/                 # API endpoints
│   ├── dashboard/           # User dashboard
│   ├── listings/            # Browse services
│   ├── my-listings/         # Provider's listings
│   ├── messages/            # Messaging system
│   ├── manage/              # Bookings and admin
│   ├── layout.tsx           # Root layout with Header
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Global styles
│   └── not-found.tsx        # 404 page
├── components/
│   ├── Header.tsx           # Navigation header
│   ├── VerificationGate.tsx # Locked feature warning
│   └── ListingCard.tsx      # Service listing component
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── auth.ts              # Auth helper functions
│   ├── jwt.ts               # JWT sign/verify
│   └── session.ts           # Get current user/profile
├── prisma/
│   └── schema.prisma        # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local.example
```

## Key Models

### User
- Email and password auth
- Admin flag
- One UserProfile
- Multiple Listings (if Provider)
- Messages and Conversations

### UserProfile
- Full name, role (MEMBER/PROVIDER/ADMIN)
- Verification status (UNVERIFIED/PENDING/VERIFIED)
- Church reference info
- Linked Church

### Listing
- Title, category, description, pricing
- Status (ACTIVE/INACTIVE)
- Provider relationship
- Multiple BookingRequests

### Conversation & Message
- Two participants
- Multiple messages
- Associated booking requests

### BookingRequest
- Status (PENDING/ACCEPTED/DECLINED)
- Links listing, requester, provider
- Optional conversation

## Core Business Logic

### Verification Gate
Everything requires verification:
- `canBrowseMarketplace()` → must be VERIFIED
- `canMessage()` → must be VERIFIED
- `canBook()` → must be VERIFIED and not ADMIN

Unverified users see a lock icon and prompt to contact admin.

### User Flows

**Member**:
1. Sign up with email, password, full name
2. Add church details (admin verifies later)
3. Await verification from admin
4. Browse services, message providers, request bookings

**Provider**:
1. Sign up with PROVIDER role
2. Create service listings
3. Receive booking requests
4. Message with interested members

**Admin**:
1. Verify pending users
2. Manage listings and bookings
3. Link users to churches
4. Dashboard with overview stats

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/signup` | POST | Create account |
| `/api/auth/login` | POST | Log in |
| `/api/messages` | GET/POST | Send/fetch messages |
| `/api/health` | GET | Health check |

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# View database GUI (optional)
npx prisma studio
```

## Deployment

### Build for production
```bash
npm run build
npm start
```

### Environment variables
Create `.env.local` in production with:
```
DATABASE_URL=...
JWT_SECRET=... (use a strong random string)
```

## Next Steps

- **File uploads**: Implement `uploadFile()` in signup API for church reference letters (Supabase, S3, etc.)
- **Payment integration**: Add Stripe for paid subscriptions
- **Email notifications**: Send verification emails to admins
- **Admin pages**: Build `/admin/users`, `/admin/listings`, `/admin/bookings`
- **Additional features**: Provider profiles, reviews, ratings, service categories
- **Mobile**: Responsive design already in Tailwind

## Notes

- JWT tokens expire after 30 days
- Passwords hashed with bcrypt (12 rounds)
- Session stored in httpOnly cookie
- All marketplace features gated by verification
- Admin bypass not yet implemented (easy to add)

## License

MIT
