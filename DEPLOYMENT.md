# PMOS Deployment Guide - Vercel

This guide will help you deploy your PMOS application to Vercel.

## Prerequisites

1. **GitHub/GitLab/Bitbucket Account** - Your code should be in a Git repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Supabase Project** - Your database should be set up and migrations run

## Step 1: Prepare Your Repository

Make sure your code is committed and pushed to your Git repository:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Set Up Supabase

### 2.1 Run Database Migrations

In your Supabase SQL Editor, run these migrations in order:

1. `scripts/001_create_pmos_schema.sql`
2. `scripts/002_add_roles_and_team.sql`
3. `scripts/003_add_advanced_features.sql`
4. `scripts/004_add_notifications_and_recurring.sql`

### 2.2 Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click **"Add New Project"**

2. **Import Your Repository**
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your PMOS repository
   - Click **"Import"**

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   Click **"Environment Variables"** and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   Replace the values with your actual Supabase credentials.

5. **Deploy**
   - Click **"Deploy"**
   - Wait for the build to complete (usually 2-5 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Set environment variables when prompted

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 4: Configure Vercel Settings

### 4.1 Set Up Environment Variables for All Environments

In Vercel Dashboard → Your Project → Settings → Environment Variables:

- Add `NEXT_PUBLIC_SUPABASE_URL` for:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

- Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` for:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

### 4.2 Configure Build Settings (if needed)

If you encounter build issues, you can adjust in **Settings → General**:

- **Node.js Version**: 18.x or 20.x (recommended)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## Step 5: Set Up Recurring Task Generation (Optional)

To enable automatic recurring task generation, you have a few options:

### Option 1: Vercel Cron Jobs (Recommended)

1. **Add Cron Secret to Environment Variables**
   In Vercel Dashboard → Environment Variables, add:
   ```
   CRON_SECRET=your-secret-key-here
   ```
   Generate a random secret key (e.g., use `openssl rand -hex 32`)

2. **Configure Vercel Cron**
   Create or update `vercel.json` to include cron configuration:
   ```json
   {
     "crons": [{
       "path": "/api/cron/generate-tasks",
       "schedule": "0 0 * * *"
     }]
   }
   ```
   This runs daily at midnight UTC.

3. **The API route is already created** at `app/api/cron/generate-tasks/route.ts`

### Option 2: External Cron Service

Use a service like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- GitHub Actions

Point it to a Supabase Edge Function or API endpoint that calls `generate_recurring_tasks()`.

### Option 3: Supabase Edge Function + Cron

Create a Supabase Edge Function and schedule it with pg_cron or external cron.

## Step 6: Verify Deployment

1. **Visit Your Deployed URL**
   - Vercel will provide a URL like `your-project.vercel.app`
   - Visit it in your browser

2. **Test Key Features**
   - ✅ Sign up / Login
   - ✅ Create a task
   - ✅ View notifications
   - ✅ Create recurring task
   - ✅ Use templates

3. **Check Console for Errors**
   - Open browser DevTools
   - Check Console tab for any errors

## Troubleshooting

### Build Errors

**Error: Missing environment variables**
- Ensure all env vars are set in Vercel Dashboard
- Redeploy after adding env vars

**Error: Module not found**
- Run `npm install` locally to check for missing dependencies
- Ensure `package.json` has all required dependencies

**Error: TypeScript errors**
- Check `tsconfig.json` settings
- The build is set to ignore TypeScript errors, but check console warnings

### Runtime Errors

**Error: Supabase connection failed**
- Verify environment variables are correct
- Check Supabase project is active
- Ensure RLS policies are set correctly

**Error: Authentication not working**
- Check Supabase Auth settings
- Verify redirect URLs in Supabase dashboard:
  - Add your Vercel URL to allowed redirect URLs
  - Format: `https://your-project.vercel.app/**`

### Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

Add these URLs:
- `https://your-project.vercel.app`
- `https://your-project.vercel.app/auth/callback`
- `https://your-project.vercel.app/**`

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables set in Vercel
- [ ] Supabase redirect URLs configured
- [ ] Application loads without errors
- [ ] Authentication works (sign up/login)
- [ ] Can create tasks
- [ ] Notifications work
- [ ] Recurring tasks can be created
- [ ] Templates work
- [ ] Activity logs display

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with your custom domain

## Continuous Deployment

Vercel automatically deploys on every push to your main branch:
- **Production**: Deploys from `main` branch
- **Preview**: Creates preview deployments for pull requests

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify Supabase connection
4. Review environment variables

---

**Congratulations! Your PMOS application is now live on Vercel! 🚀**

