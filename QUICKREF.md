# Developer Quick Reference

## 🚀 Getting Started in 5 Minutes

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.local.example .env.local

# 3. Edit .env.local with your Supabase credentials

# 4. Set up database (see SUPABASE_SETUP.md)

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

---

## 📁 File Navigation Guide

| What I Need | Where to Look |
|-------------|---------------|
| Add new API endpoint | `app/api/[route]/route.ts` |
| Create new page | `app/(dashboard)/[role]/page.tsx` |
| Add shared component | `components/shared/` |
| Add dashboard component | `components/dashboards/` |
| Modify API client | `lib/api-client/queries.ts` |
| Add custom hook | `lib/hooks/useYourHook.ts` |
| Define types | `types/index.ts` |
| Database schema | `supabase/schema.sql` |
| Environment vars | `.env.local` |
| Styling | `app/globals.css` + `tailwind.config.ts` |

---

## 🔑 Key Concepts

### Authentication Flow
```
Login Page → Submit Credentials → API /auth/login 
→ Get JWT Token → Save to Cookie → Redirect to Dashboard
```

### Real-Time Data Flow
```
Component Mounts → useTeams/usePlayers Hook 
→ Supabase Subscription → Listen for Changes 
→ Update State → Re-render Component
```

### Auction Flow
```
Presenter Starts → System Loads Player → Controller Enters Bid 
→ API processes → Points Deducted → Auto-advance to Next Player 
→ Repeat until Complete
```

### API Authentication
```typescript
// All API routes (except login) require JWT token
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
const decoded = jwt.verify(token, JWT_SECRET);
```

---

## 💻 Common Tasks

### Add New API Endpoint

```typescript
// app/api/route/name/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error message' },
      { status: 500 }
    );
  }
}
```

### Create React Component

```typescript
// components/shared/MyComponent.tsx
'use client'; // If using client features

interface Props {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

### Use Real-Time Data

```typescript
'use client';

import { useTeams } from '@/lib/hooks/useRealtime';

export function MyComponent() {
  const { data: teams, isLoading, error } = useTeams();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {teams.map((team) => (
        <li key={team.id}>{team.name}</li>
      ))}
    </ul>
  );
}
```

### Make API Call

```typescript
import apiCall from '@/lib/api-client';

// Call endpoint
const response = await apiCall('/teams', {
  method: 'POST',
  body: JSON.stringify({ name: 'Team A' }),
});

if (response.error) {
  console.error(response.error);
} else {
  console.log(response.data); // Typed as Team
}
```

### Protect Route by Role

```typescript
// app/presenter/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function PresenterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not presenter
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'presenter')) {
      router.push('/login');
    }
  }, [user, isLoading]);

  // Rest of component...
}
```

---

## 🗄️ Database Quick Reference

### CSV Import + Player Images (Recommended Workflow)

1. Create a Supabase Storage bucket named `player-images`.
2. Upload all player image files to paths like:
  - `batch-1/virat-kohli.jpg`
  - `batch-1/ab-de-villiers.jpg`
3. Keep your `players` CSV with an `image_url` column.
4. In `image_url`, store either:
  - Public URL (easy): `https://<project-ref>.supabase.co/storage/v1/object/public/player-images/batch-1/virat-kohli.jpg`
  - Object path (advanced): `batch-1/virat-kohli.jpg` (requires URL generation in app)
5. Import CSV into `public.players` from Supabase Table Editor.

Recommended CSV columns for this project:
`name,role,image_url,base_price,batch_number`

Important:
- Do not put raw image binary in CSV.
- If bucket is private, the current UI will need signed URL logic before images render.
- For now, use a public bucket for fastest setup.

### Query Players in Batch

```typescript
const { data: players } = await supabase
  .from('players')
  .select('*')
  .eq('batch_number', 1)
  .order('created_at');
```

### Update Team Points

```typescript
const { data, error } = await supabase
  .from('teams')
  .update({ points: 9500 })
  .eq('id', teamId)
  .select()
  .single();
```

### Get Current User

```typescript
const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

### Subscribe to Changes

```typescript
const subscription = supabase
  .channel('public:teams')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'teams' },
    (payload) => {
      console.log('Teams updated!', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## 🎨 Styling Guide

### Colors
```typescript
// Primary brand color
bg-primary // Blue
text-primary

// Status colors
bg-success // Green
bg-danger // Red
bg-warning // Orange

// Neutral
bg-gray-50 to bg-gray-900
```

### Common Patterns

```typescript
// Card with shadow
<div className="bg-white rounded-lg shadow-md p-6">

// Button variants
<Button variant="primary" size="lg">
<Button variant="danger" size="sm">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Flex centering
<div className="flex items-center justify-center h-screen">

// Padding/Margin
p-4 // padding
m-4 // margin
mb-6 // margin-bottom
```

---

## 🔍 Debugging Tips

### Check Authentication

```typescript
// In browser console
localStorage.getItem('bidzen_token'); // Check if token exists
```

### View Real-Time Logs

```typescript
// Enable Supabase debug logs
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
supabase.realtime.setAuth(token); // Check auth
```

### Check API Response

```typescript
// Add logging to API routes
console.log('Request body:', await request.json());
console.log('Error:', error);
```

### Database Debugging

Visit Supabase dashboard:
- SQL Editor: Run queries
- Table Editor: View/edit data
- Logs: Check database errors
- Realtime: Monitor subscriptions

---

## 📦 Dependencies Overview

| Package | Purpose | Version |
|---------|---------|---------|
| next | Framework | ^14.0.0 |
| react | UI Library | ^18.2.0 |
| typescript | Type Safety | ^5.0.0 |
| supabase-js | Backend | ^2.38.0 |
| tailwindcss | Styling | ^3.3.0 |
| bcryptjs | Password Hashing | ^2.4.3 |
| jsonwebtoken | JWT Auth | ^9.1.0 |
| js-cookie | Cookie Management | ^3.0.5 |

---

## 🧪 Testing Scenarios

### Test Login Flow
```
1. Go to http://localhost:3000/login
2. Enter: admin / Admin@123
3. Should redirect to /admin
```

### Test Auction Flow
```
1. Login as Admin
2. Create Teams (Team A, Team B)
3. Create Players with batch numbers
4. Login as Presenter
5. Click "Start Auction"
6. Login as Controller
7. Enter bid price & select team
8. Should deduct points & advance
```

### Test Real-Time
```
1. Open dashboard in 2 browser tabs
2. In Tab 1: Create new team
3. In Tab 2: Should see new team appear instantly
```

### Test Role Access
```
1. Login as controller
2. Try to access /admin
3. Should redirect to /controller
```

---

## 🚨 Common Issues & Solutions

### Issue: "No token provided" (401)
```
Solution: 
- Check token is in Authorization header
- Token format: "Bearer <token>"
- Token may have expired (7 days)
- Clear cookies and re-login
```

### Issue: Real-time not updating
```
Solution:
- Check RLS is disabled/visible
- Verify subscription is active
- Check browser console for errors
- Check Supabase realtime is enabled
```

### Issue: "User not found"
```
Solution:
- Check user exists in Supabase
- Verify password hash is correct
- Check user role is set
```

### Issue: CORS errors
```
Solution:
- Check API route exists
- Verify Authorization header format
- Check request method (GET vs POST)
```

---

## 📊 Performance Checklist

- [ ] Use `useCallback` for expensive operations
- [ ] Memoize components with `React.memo` if needed
- [ ] Use database indexes on frequently queried columns
- [ ] Limit real-time subscriptions (unsubscribe on unmount)
- [ ] Compress images
- [ ] Lazy load components
- [ ] Minimize bundle size
- [ ] Cache API responses

---

## 🔒 Security Checklist

- [ ] Never commit `.env.local`
- [ ] Always validate on server
- [ ] Check user role before sensitive operations
- [ ] Use HTTPS in production
- [ ] Rotate JWT_SECRET regularly
- [ ] Enable database RLS
- [ ] Rate limit API endpoints
- [ ] Sanitize user input
- [ ] Use prepared statements
- [ ] Enable 2FA for admin accounts

---

## 📖 Documentation Structure

- **README.md** - Start here for overview
- **API.md** - List all endpoints & examples
- **SUPABASE_SETUP.md** - Database setup steps
- **DEPLOYMENT.md** - Deploy to production
- **PROJECT_SUMMARY.md** - Complete feature list (this file)
- **Code Comments** - Inline explanations

---

## 🎯 Development Workflow

```
1. Create feature branch
   git checkout -b feature/my-feature

2. Make changes in components/api/lib

3. Test locally
   npm run dev

4. Check for errors
   npm run lint

5. Commit changes
   git add .
   git commit -m "feat: description"

6. Push to remote
   git push origin feature/my-feature

7. Create Pull Request on GitHub

8. Deploy to staging/production
```

---

## 💬 Code Style

### Function Naming
```typescript
// Components
function MyComponent() { }

// Hooks
function useMyHook() { }

// Utilities
function parseUserData() { }

// API routes
export async function POST(request) { }
```

### Variable Naming
```typescript
// Constants
const MAX_RETRIES = 3;

// Boolean
const isLoading = true;

// Arrays
const users: User[] = [];

// Objects
const userData: User = { };
```

---

## 🚀 Deployment Checklist

- [ ] Test all features locally
- [ ] No console errors/warnings
- [ ] Environment variables set
- [ ] Database backups enabled
- [ ] HTTPS configured
- [ ] Monitoring enabled
- [ ] Error tracking setup
- [ ] Admin procedures documented
- [ ] User manual created
- [ ] Support contact provided

---

## 📞 Quick Help

**How do I...?**

| Task | Location |
|------|----------|
| Add authentication | `lib/auth.ts`, `app/api/auth/` |
| Create dashboard | `components/dashboards/`, `app/(dashboard)/` |
| Query database | `lib/api-client/queries.ts` or `supabase` |
| Style components | `components/shared/` (Tailwind) |
| Add API endpoint | `app/api/[route]/route.ts` |
| Protect routes | `middleware.ts` |
| Make real-time | `lib/hooks/useRealtime.ts` |
| Handle errors | Use try-catch, return NextResponse.json errors |
| Validate input | Use validation in API route |
| Get logged-in user | `useAuth()` hook |

---

## 🎓 Learning Path

1. **Day 1**: Setup, read README, explore file structure
2. **Day 2**: Study API documentation, understand endpoints
3. **Day 3**: Review dashboard components, understand data flow
4. **Day 4**: Test all user roles & features
5. **Day 5**: Deploy to staging, test production flow

---

## ✨ Pro Tips

1. **Use TypeScript** - Leverage type safety
2. **Check types** - Use cursor hover for info
3. **Read comments** - Code has inline explanations
4. **Use browser DevTools** - Network tab for API debugging
5. **Check error logs** - Detailed errors in console
6. **Use Supabase UI** - Visual debugging of database
7. **Commit often** - Small, focused commits
8. **Document changes** - Help future developers

---

**Happy Coding! 🚀**

For detailed help, see README.md or other documentation files.
