# Fix Internal Server Error

## Problem
The "Internal Server Error" is happening because **Supabase environment variables are missing** from your Vercel deployment.

## Quick Fix

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 2: Add Environment Variables to Vercel

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to: https://vercel.com/brkt1s-projects/pmos-backend-setup--1-/settings/environment-variables
2. Click **"Add New"**
3. Add each variable:

   **Variable 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase Project URL
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

   **Variable 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon key
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

4. **Redeploy** your application:
   - Go to: https://vercel.com/brkt1s-projects/pmos-backend-setup--1-/deployments
   - Click the three dots (⋯) on the latest deployment
   - Click **"Redeploy"**
   - Or run: `vercel --prod`

**Option B: Via CLI**

Run these commands (you'll be prompted to enter values):

```bash
# Add Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# When prompted, paste your Supabase URL and press Enter

# Add Supabase Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# When prompted, paste your Supabase anon key and press Enter

# Also add for preview and development
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development

# Redeploy
vercel --prod
```

### Step 3: Verify Environment Variables

```bash
vercel env ls
```

You should see:
- `NEXT_PUBLIC_SUPABASE_URL` (Production, Preview, Development)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production, Preview, Development)

### Step 4: Test Your Application

After redeploying, visit your production URL:
https://pmos-backend-setup-1-8se2u75ec-brkt1s-projects.vercel.app

The Internal Server Error should be gone!

## Additional Steps

### Configure Supabase Redirect URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs**:
   - `https://pmos-backend-setup-1-8se2u75ec-brkt1s-projects.vercel.app`
   - `https://pmos-backend-setup-1-8se2u75ec-brkt1s-projects.vercel.app/**`

### Run Database Migrations

Make sure you've run all migrations in Supabase SQL Editor:

1. `scripts/001_create_pmos_schema.sql`
2. `scripts/002_add_roles_and_team.sql`
3. `scripts/003_add_advanced_features.sql`
4. `scripts/004_add_notifications_and_recurring.sql`

## Still Getting Errors?

Check the deployment logs:
```bash
vercel logs pmos-backend-setup-1-8se2u75ec-brkt1s-projects.vercel.app
```

Or view logs in Vercel Dashboard:
https://vercel.com/brkt1s-projects/pmos-backend-setup--1-/deployments

