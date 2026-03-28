# BidZen - Real-time Auction Management System

A production-ready Next.js auction platform with real-time updates, role-based access control, and strict authentication.

## What this app does

BidZen helps run a live sports-style auction with 4 live dashboards at the same time:

- **Presenter** shows the current player on the main stage screen.
- **Controller** submits the final sold bid and winning team.
- **Team Owner** watches team balance and purchased players in real time.
- **Super Admin** manages users, teams, players, and auction setup.

When a controller submits a bid, the system:

1. Marks that player as sold
2. Deducts points from the winning team
3. Moves to the next unsold player
4. Updates all dashboards live

---

## Quick Start (3-5 minutes)

1. Install dependencies:

```bash
npm install
```

2. Configure `.env.local` (see Environment section below).

3. Run database schema in Supabase SQL editor:

- `supabase/schema.sql`

4. Start app:

```bash
npm run dev
```

5. Open browser:

- `http://localhost:3000`

If dev server gets chunk/port issues, run:

```bash
npm run dev:reset
```

## 🚀 Features

- **4 Role-Based Dashboards**: Super Admin, Presenter, Controller, Team Owner
- **Real-time Updates**: Supabase Realtime for live data synchronization
- **Batch-Based Auction**: Players grouped in batches with automatic progression
- **Team Points System**: Dynamic points management with deductions on player purchase
- **No Public Signup**: Admin-only user creation with role assignment
- **Production-Ready**: TypeScript, JWT auth, secure password hashing

## Recent Updates (March 2026)

- Added **Mark as Unsold** action in Controller flow.
- Implemented **Unsold Batch** using **batch 10** (instead of batch 7).
- Added second-pass unsold behavior:
  - First unsold: player moves to batch 10.
  - If marked unsold again in batch 10: player is assigned to auto-managed **Unsold** team.
  - Auction completes after batch 10 is exhausted.
- Added **Ending Page** after auction completion with summary stats:
  - Total sold players
  - Total amount raised
  - Unsold count
- Removed rankings and unsold-player listing from ending page for a cleaner finish.
- Added clickable team cards in Super Admin dashboard to open a **Team Squad modal**.
- Improved modal usability:
  - Added visible header close button
  - Added optional footer hiding for read-only views
  - Improved sizing and scrolling on smaller screens
- Improved mobile responsiveness across dashboards (Admin, Controller, Presenter, Team Owner):
  - Better spacing, typography scaling, and card behavior
  - Improved small-screen layout and readability
- Added team export functionality:
  - **Team Owner** can export only their team squad to **Excel**
  - **Super Admin** can export all teams to a single Excel file with:
    - One sheet per team
    - Each sheet containing only that team's players
- Removed PDF export option and standardized exports to Excel-only.
- Excluded auto-managed **Unsold** team from normal bidding/operational flows where appropriate.

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Environment variables configured

## 🔧 Installation

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret_key_min_32_chars
```

### 3. Initialize Supabase Database

1. Go to your Supabase project
2. Open SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Execute the SQL to create all tables and indexes

### 4. Create Admin User

Run a script to hash the password and create the first admin:

```typescript
import { hashPassword } from '@/lib/auth';

// Generate hashed password (8+ chars, uppercase, lowercase, numbers)
const hash = await hashPassword('Admin@123');
console.log(hash); // Use this hash in your DB
```

Then insert into `users` table:

```sql
INSERT INTO users (id, username, password, role, team_id)
VALUES (
  'your-uuid',
  'admin',
  'hashed_password_here',
  'super_admin',
  NULL
);
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### Useful Development Commands

```bash
npm run dev         # start Next.js dev server
npm run dev:clean   # clear .next cache
npm run dev:reset   # kill node, clear .next, restart dev server
npm run build       # production build
npm run lint        # lint checks
```

## 📚 User Roles & Capabilities

### 👑 Super Admin
- Create/delete users (username, password, role assignment)
- Create/edit/delete teams
- Add/edit/delete players
- Assign players to batches
- Reset user passwords

**Access**: `/admin`

### 🎤 Presenter
- View current player being auctioned
- Start auction
- Monitor batch progress
- Alert if any team < 1000 points

**Access**: `/presenter`

### 🧑‍💻 Controller
- Input final bid prices
- Select winning team
- Auto-progress to next player
- View all teams' points in real-time

**Access**: `/controller`

### 🏏 Team Owner
- View only their team data
- See remaining points
- View purchased players
- Cannot see other teams' info

**Access**: `/team`

## 🎯 Auction Flow

1. **Admin creates teams** (e.g., Team Alpha, Team Beta)
2. **Admin adds players** assigned to batches (Batch 1, 2, 3...)
3. **Presenter clicks "Start Auction"**
4. **Current player displays** on Presenter dashboard
5. **Controller enters bid price + selects winning team**
6. **System automatically**:
   - Deducts points from winning team
   - Assigns player to team
   - Moves to next player
7. **Repeat until all batches complete**

## 🔐 Authentication

- **Method**: JWT tokens stored in browser cookies
- **Password Hashing**: bcryptjs (10 salt rounds)
- **Token Expiry**: 7 days
- **Required Password Strength**:
  - Minimum 8 characters
  - 1 uppercase letter
  - 1 lowercase letter
  - 1 number

## 📊 Database Schema

### Users
```
- id (UUID)
- username (unique)
- password (hashed)
- role (super_admin | presenter | controller | team_owner)
- team_id (nullable, references teams)
```

### Teams
```
- id (UUID)
- name (unique)
- points (default: 10000)
```

### Players
```
- id (UUID)
- name
- role
- image_url
- base_price
- batch_number
- sold_price (null until auctioned)
- team_id (null until purchased)
```

### Auction State
```
- id (fixed UUID)
- current_batch (number)
- current_player_index (number)
- auction_started (boolean)
```

## 🔄 Real-Time Features

All dashboards subscribe to live updates:

```typescript
- useAuctionState() → Current batch/player
- usePlayers() → Player assignments
- useTeams() → Team points
- useRealtime Data<T>() → Generic realtime hook
```

Changes reflect instantly across all connected clients.

## 📁 Project Structure

```
bidzen/
├── app/
│   ├── api/              # API routes (auth, auction, admin)
│   ├── (auth)/           # Auth pages (login)
│   ├── (dashboard)/      # Role-based dashboards
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── dashboards/       # Role-specific dashboards
│   └── shared/           # Reusable UI components
├── lib/
│   ├── api-client/       # API query functions
│   ├── hooks/            # Custom React hooks
│   ├── auth.ts           # Password hashing/validation
│   ├── token.ts          # Token management
│   └── supabase.ts       # Supabase client initialization
├── types/
│   └── index.ts          # TypeScript interfaces
├── supabase/
│   └── schema.sql        # Database schema
├── middleware.ts         # Route protection middleware
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Auction
- `GET /api/auction/state` - Current auction state
- `POST /api/auction/start` - Start auction (Presenter)
- `POST /api/auction/bid` - Submit bid (Controller)
- `GET /api/auction/next-player` - Get next player

### Teams
- `GET /api/teams` - List all teams
- `GET /api/teams/[teamId]` - Get specific team

### Players
- `GET /api/players` - List all players
- `GET /api/players?batch=1` - Filter by batch

### Admin Only
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/[userId]/password` - Reset password
- `GET /api/admin/teams` - List teams
- `POST /api/admin/teams` - Create team
- `PUT /api/admin/teams/[teamId]` - Update team
- `DELETE /api/admin/teams/[teamId]` - Delete team
- `GET /api/admin/players` - List players
- `POST /api/admin/players` - Create player
- `PUT /api/admin/players/[playerId]` - Update player
- `DELETE /api/admin/players/[playerId]` - Delete player

## 🧪 Testing

### Test Login
Username: `admin`
Password: `Admin@123` (or your set password)

### Create Test Data
1. Login as admin
2. Create teams (Team A, Team B, Team C)
3. Create players (Name, Role, Base Price, Batch)
4. Create users for other roles

## 🚀 Deployment

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=prod_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=prod_service_key
JWT_SECRET=generate_min_32_char_random_string
NODE_ENV=production
```

### Deploy to Vercel

```bash
npm run build
# Vercel auto-deploys on git push
```

## 🛡️ Security Features

- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcryptjs
- ✅ HTTP-only secure cookies
- ✅ Route protection middleware
- ✅ Server-side validation
- ✅ Supabase Row-Level Security (RLS)
- ✅ CORS enabled for API

## 📈 Performance

- Real-time Supabase subscriptions
- Server-side rendering with Next.js
- Optimized images with Next Image
- CSS-in-JS with Tailwind
- Automatic code splitting
- Database indexing on frequently queried columns

## 🐛 Troubleshooting

### Cannot login
- Verify admin user exists in database
- Check password hash is correct
- Ensure JWT_SECRET is set

### Real-time updates not working
- Check Supabase Realtime is enabled
- Verify ANON_KEY has realtime permissions
- Check browser network tab for subscription errors

### API 401 Unauthorized
- Token may have expired (7 days)
- Login again to refresh token
- Check Authorization header is set

## 📝 License

MIT

## 🎯 Next Steps

1. [Set up Supabase account](https://supabase.com)
2. Create a new project
3. Run schema.sql in SQL Editor
4. Configure environment variables
5. `npm install && npm run dev`
6. Login and start creating auctions!

---

**BidZen** - Modern real-time auction management for teams.
