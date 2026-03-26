# Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors in development
- [ ] Environment variables documented
- [ ] Database backups configured
- [ ] All user roles tested
- [ ] Realtime features tested
- [ ] Mobile responsive design verified
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Rate limiting considered

## Environment Variables for Production

Create `.env.production.local`:

```env
# Supabase (Production Project)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# JWT Secret (MUST be 32+ characters, random, and UNIQUE)
JWT_SECRET=generate_random_string_32_plus_characters

# Node Environment
NODE_ENV=production

# Optional: Domain for email
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Generate Secure JWT_SECRET

**Option 1: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option 2: Using Node**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 3: Using Python**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Building for Production

### 1. Preview Build Locally

```bash
npm run build
npm start
```

Test all critical flows:
- Login
- Each dashboard
- Real-time updates
- Auction flow

### 2. Verify Build Output

```bash
# Check for errors
npm run lint

# Check TypeScript
npx tsc --noEmit

# Build
npm run build
```

## Deployment Options

### Option 1: Vercel (Recommended)

**Advantages:**
- Zero-config deployment
- Built for Next.js
- Free tier available
- Automatic HTTPS
- Environment variable management

**Steps:**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Set environment variables:
   - Click "Environment Variables"
   - Add all variables from `.env.production.local`
6. Click "Deploy"

**Custom Domain:**
1. In Vercel dashboard → Domain
2. Add your domain
3. Update DNS records (follow Vercel's instructions)
4. Enable auto-renewal

### Option 2: Railway

**Steps:**

1. Create Railway account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Create new project
4. Add environment variables in Project Settings
5. Deploy automatically on push

### Option 3: Self-Hosted (VPS)

**Requirements:**
- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx or similar reverse proxy
- SSL certificate (Let's Encrypt)
- PM2 or similar process manager

**Installation:**

```bash
# SSH into your server
ssh user@your_server_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone your_repo_url
cd your_project

# Install dependencies
npm install --production

# Build
npm run build

# Install PM2
npm install -g pm2

# Start app
pm2 start npm --name "bidzen" -- start
pm2 save
pm2 startup

# Configure Nginx (reverse proxy)
# Create /etc/nginx/sites-available/default
# ... (see Nginx config below)

# Enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# SSL Certificate (Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your_domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your_domain.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 4: Docker

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

ENV NODE_ENV production
EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  bidzen:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    restart: unless-stopped
```

**Build and run:**

```bash
docker-compose up -d
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check site is accessible
curl https://your_domain.com

# Check API is working
curl https://your_domain.com/api/teams
```

### 2. Set Up Monitoring

**Recommended Tools:**
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay
- [Datadog](https://datadoghq.com) - APM
- [Uptime Robot](https://uptimerobot.com) - Uptime monitoring

**Sentry Setup:**

```bash
npm install @sentry/nextjs
```

Add to `next.config.js`:

```javascript
const withSentry = require("@sentry/nextjs")();
module.exports = withSentry({
  // ... existing config
}, {
  org: "your-org",
  project: "bidzen",
});
```

### 3. Set Up Backup Strategy

```bash
# Automated Supabase backup
# Already configured in Supabase settings

# Database backups to S3
supabase db push --prod

# Code backup (Git)
git push origin main
```

### 4. Configure CDN (Optional)

For static assets, use CloudFlare:

1. Update DNS to point to Cloudflare
2. Configure caching rules
3. Enable HTTP/2
4. Enable MINIFY CSS/JS

## Monitoring & Logging

### View Application Logs

**Vercel:**
```
Dashboard → your-project → Logs
```

**Railway:**
```
Dashboard → your-app → Logs
```

**Self-hosted:**
```bash
# PM2 logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Key Metrics to Monitor

1. **Response Time** - Should be < 200ms
2. **Error Rate** - Should be < 0.1%
3. **CPU Usage** - Should be < 70%
4. **Memory Usage** - Should be < 80%
5. **Database Connections** - Track active connections
6. **Realtime Subscriptions** - Monitor active subscriptions

## Scaling

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Upgrade Supabase plan

### Horizontal Scaling
- Use load balancer (AWS ELB, Nginx)
- Deploy multiple app instances
- Use Redis for session management

## Security Best Practices

### Before Going Live

- [ ] Rotate all secrets
- [ ] Enable database backups
- [ ] Set up rate limiting
- [ ] Enable CORS properly
- [ ] Use HTTPS everywhere
- [ ] Set security headers
- [ ] Enable 2FA for admin accounts
- [ ] Review RLS policies
- [ ] Test auth thoroughly
- [ ] Review logging/privacy

### Regularly

- [ ] Review access logs
- [ ] Update dependencies
- [ ] Rotate secrets quarterly
- [ ] Monitor for security advisories
- [ ] Run security audits
- [ ] Review failed login attempts

### Environment-Specific

**Production:**
- Strict CSP headers
- Rate limiting enabled
- Activity logging
- Email alerts
- Incident response plan

**Staging:**
- Test all updates here
- Replica of production data (anonymized)
- Same performance characteristics

## Rollback Plan

### If Something Goes Wrong

1. **Revert Code:**
   ```bash
   git revert <commit_hash>
   git push origin main
   # Vercel auto-redeploys
   ```

2. **Revert Database:**
   ```
   Supabase → Backups → Download & Restore
   ```

3. **Check Status:**
   - Monitor logs
   - Verify auth working
   - Test critical flows

4. **Communicate:**
   - Notify users of incident
   - Post status update
   - Document what happened

## Support & Help

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)

---

**Deployment Checklist Summary:**
1. ✅ Test locally
2. ✅ Set production environment variables
3. ✅ Choose deployment platform
4. ✅ Deploy
5. ✅ Verify all features work
6. ✅ Set up monitoring
7. ✅ Configure backups
8. ✅ Set up alerts
9. ✅ Document procedures
10. ✅ Monitor first 48 hours
