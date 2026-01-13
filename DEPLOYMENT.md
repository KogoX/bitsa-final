# Deployment Guide

## Vercel Deployment

### Prerequisites
- GitHub/GitLab/Bitbucket account with your code repository
- Vercel account (free tier available)

### Step 1: Environment Variables Setup

Before deploying, you need to set up environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
VITE_SUPABASE_URL=https://pcidxtldmftxqdrlfnkz.supabase.co
VITE_SUPABASE_PROJECT_ID=pcidxtldmftxqdrlfnkz
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjaWR4dGxkbWZ0eHFkcmxmbmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxOTcsImV4cCI6MjA3Nzk5OTE5N30.wGJ7_gESpR8FBYSJ1Odo3GEuA40dzPbiw5H_BZeFPjY
```

**Note:** These are public keys and safe to expose. The anon key is designed for client-side use.

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect Vite
5. Verify build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. Add environment variables (from Step 1)
7. Click **"Deploy"**

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (first time - will prompt for configuration)
vercel

# Deploy to production
vercel --prod
```

### Step 3: Supabase Edge Functions

**Important:** Your Supabase Edge Functions (`src/supabase/functions/server/`) are deployed separately to Supabase, NOT to Vercel.

To deploy Edge Functions:
1. Use Supabase CLI or Dashboard
2. Deploy the `make-server-430e8b93` function
3. The functions run on Supabase's Deno runtime

### Step 4: Post-Deployment

After deployment:
1. Your site will be live at `https://your-project.vercel.app`
2. Test all functionality:
   - Authentication
   - Admin access
   - Blog posts
   - Events
   - Gallery

### Troubleshooting

**Build fails:**
- Check that all environment variables are set
- Verify `package.json` has correct build script
- Check Vercel build logs for specific errors

**Environment variables not working:**
- Ensure variables start with `VITE_` prefix (required for Vite)
- Redeploy after adding variables
- Check variable names match exactly

**Supabase connection issues:**
- Verify Supabase project is active
- Check Edge Functions are deployed
- Verify API keys are correct

## Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update values in `.env.local` if needed

3. Run development server:
   ```bash
   npm install
   npm run dev
   ```

## Security Notes

- The `VITE_SUPABASE_ANON_KEY` is public and safe to expose in client-side code
- Never commit `.env.local` or `.env` files to Git
- For production, use environment variables in Vercel dashboard
- Supabase Row Level Security (RLS) policies protect your data
