# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Select your organization (or create one)
4. Enter project name: `bidzen`
5. Set a strong database password
6. Select region closest to you
7. Click "Create new project"

Wait for the project to initialize (2-3 minutes).

## Step 2: Get Your Credentials

1. In your project, click "Settings" → "API"
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (secret key) → `SUPABASE_SERVICE_ROLE_KEY`

3. Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your-secret-key-minimum-32-characters-long
```

## Step 3: Initialize Database Schema

1. In Supabase, go to "SQL Editor"
2. Click "New Query"
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run"
5. Verify all tables are created:
   - `users`
   - `teams`
   - `players`
   - `auction_state`

## Step 4: Create Admin User

1. In Supabase, go to SQL Editor
2. Run this query to create admin user:

```sql
-- Password: Admin@123 (CHANGE THIS IN PRODUCTION!)
-- Hash: $2a$10$YOUR_BCRYPT_HASH_HERE
INSERT INTO users (id, username, password, role, team_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440099',
  'admin',
  '$2a$10$YourHashedPasswordHere',
  'super_admin',
  NULL
);
```

### To Generate Password Hash

Option 1: Use Node.js in a terminal:

```bash
node -e "const bc = require('bcryptjs'); console.log(bc.hashSync('Admin@123', 10))"
```

Option 2: Use the Auth Function (after deploying):

Create a temporary API endpoint to generate the hash:

```typescript
// app/api/setup/generate-hash/route.ts
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const { password } = await request.json();
  const hash = await hashPassword(password);
  return Response.json({ hash });
}
```

Then POST to it:

```bash
curl -X POST http://localhost:3000/api/setup/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password":"Admin@123"}'
```

## Step 5: Enable Realtime

1. In Supabase, go to "Realtime" → "Replication"
2. Enable replication for:
   - `public.players`
   - `public.teams`
   - `public.auction_state`
   - `public.users`

## Step 6: Configure RLS (Row Level Security)

Already configured in `schema.sql`, but to customize:

1. Go to "Database" → "RLS"
2. For `users` table: Restrict to own record
3. For `teams` table: Allow all to view
4. For `players` table: Allow all to view
5. For `auction_state` table: Allow all to view

## Step 7: Create Test Data

## Step 7A: Manage Player Images with CSV Import

Use this pattern for bulk upload:

1. **Upload images to Supabase Storage**
  - Go to `Storage` → `Create bucket`
  - Bucket name: `player-images`
  - Set as **Public** (recommended for current app)

2. **Organize files by batch** (optional but clean)
  - `batch-1/virat-kohli.jpg`
  - `batch-2/hardik-pandya.jpg`

3. **Prepare CSV for `players` table**
  - Include columns: `name,role,image_url,base_price,batch_number`
  - Example `image_url`:
    `https://<project-ref>.supabase.co/storage/v1/object/public/player-images/batch-1/virat-kohli.jpg`

4. **Import CSV**
  - Table Editor → `players` → `Insert` → `Import data from CSV`
  - Map CSV columns to table columns

5. **If you already imported players without images**
  - Re-import with `image_url`, or run SQL updates:

```sql
UPDATE players
SET image_url = 'https://<project-ref>.supabase.co/storage/v1/object/public/player-images/batch-1/virat-kohli.jpg'
WHERE name = 'Virat Kohli';
```

Notes:
- Never store image files directly in Postgres.
- Store URL/path only in `players.image_url`.
- If you make the bucket private later, app changes are needed to generate signed URLs.

### Create Teams

```sql
INSERT INTO teams (id, name, points) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Team Alpha', 10000),
  ('550e8400-e29b-41d4-a716-446655440002', 'Team Beta', 10000),
  ('550e8400-e29b-41d4-a716-446655440003', 'Team Gamma', 10000),
  ('550e8400-e29b-41d4-a716-446655440004', 'Team Delta', 10000);
```

### Create Test Players

```sql
INSERT INTO players (name, role, image_url, base_price, batch_number) VALUES
  ('Virat Kohli', 'Batsman', NULL, 1500, 1),
  ('AB de Villiers', 'Batsman', NULL, 1400, 1),
  ('Jasprit Bumrah', 'Bowler', NULL, 1200, 1),
  ('Rohit Sharma', 'Batsman', NULL, 1500, 1),
  ('Suryakumar Yadav', 'Batsman', NULL, 800, 2),
  ('Hardik Pandya', 'All-rounder', NULL, 900, 2),
  ('Bhuvneshwar Kumar', 'Bowler', NULL, 700, 2),
  ('KL Rahul', 'Batsman', NULL, 1000, 3);
```

### Create Test Users

You'll need to generate password hashes for each. Example hashes below (all passwords are `Pass@123`):

```sql
INSERT INTO users (id, username, password, role, team_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440099', 'admin', '$2a$10$hash_here', 'super_admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440100', 'presenter', '$2a$10$hash_here', 'presenter', NULL),
  ('550e8400-e29b-41d4-a716-446655440101', 'controller', '$2a$10$hash_here', 'controller', NULL),
  ('550e8400-e29b-41d4-a716-446655440102', 'owner1', '$2a$10$hash_here', 'team_owner', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440103', 'owner2', '$2a$10$hash_here', 'team_owner', '550e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440104', 'owner3', '$2a$10$hash_here', 'team_owner', '550e8400-e29b-41d4-a716-446655440003');
```

## Step 8: Backup & Security

### Regular Backups

1. Go to "Settings" → "Backups"
2. Enable daily backups
3. Set retention to 30 days

### Security Settings

1. Go to "Settings" → "Access Control"
2. Configure IP whitelist if needed
3. Enable 2FA for account
4. Create separate read-only service role for backups

### Database Security

1. Restrict direct client access - only allow through API
2. Use Row Level Security policies
3. Rotate secrets regularly
4. Never commit secrets to git

## Monitoring

### Check Realtime Connections

```sql
-- In SQL Editor, check active subscriptions
-- This helps debug real-time issues
SELECT * FROM pg_stat_replication;
```

### View Recent Errors

Go to "Logs" → "API" and "Database" to check for errors.

### Performance Monitoring

1. Check "API Reports" for slow queries
2. Review database query execution times
3. Monitor storage usage

## Troubleshooting

### Realtime Not Working

```
Solution:
1. Check RLS policies allow SELECT
2. Verify replication is enabled for table
3. Check browser console for connection errors
4. Check Supabase service status
```

### Auth Issues

```
Solution:
1. Verify JWT_SECRET matches in .env
2. Check token expiry (7 days)
3. Clear cookies and re-login
4. Check clocks are synchronized
```

### Connection Issues

```
Solution:
1. Verify environment variables are correct
2. Check project not paused (Settings → Pause)
3. Check internet connection
4. Verify Supabase service status
```

### Error: relation "teams" does not exist

```
Cause:
The `users` table was created before `teams` in an older schema version,
but `users.team_id` has a foreign key to `teams(id)`.

Fix:
1. Use the latest `supabase/schema.sql` from this project.
2. Run the full schema in one go from top to bottom.
3. If you partially ran old SQL, reset and re-run:

DROP TABLE IF EXISTS auction_state CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

Then run `supabase/schema.sql` again.
```

## Managing Your Project

### Reset Database

```sql
-- WARNING: THIS DELETES ALL DATA
DROP TABLE IF EXISTS auction_state CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then re-run schema.sql
```

### Export Database

1. Settings → Database → Backups
2. Click "Download" on any backup
3. Or use: `pg_dump yourdb > backup.sql`

### Update Realtime Configuration

```bash
# Via CLI
supabase db remote set-config --config realtime.max_bytes_per_second=1000000
```

## Next Steps

1. ✅ Create Supabase project
2. ✅ Copy credentials to `.env.local`
3. ✅ Run schema.sql
4. ✅ Create admin user
5. ✅ Enable realtime
6. ✅ Create test data
7. 🚀 Run `npm run dev`
8. 🔓 Login as admin
9. 📊 Start testing!

---

For more help, visit [Supabase Docs](https://supabase.com/docs)
