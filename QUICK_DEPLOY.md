# Quick Deploy to Vercel 🚀

## Quick Steps

### 1. Push Your Code
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy on Vercel

**Option A: Via Dashboard (Easiest)**
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub/GitLab repository
4. Add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
5. Click **"Deploy"**

**Option B: Via CLI**
```bash
npm i -g vercel
vercel login
vercel
# Follow prompts and add environment variables
```

### 3. Configure Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration, add:
- `https://your-project.vercel.app`
- `https://your-project.vercel.app/**`

### 4. Run Database Migrations

In Supabase SQL Editor, run in order:
1. `scripts/001_create_pmos_schema.sql`
2. `scripts/002_add_roles_and_team.sql`
3. `scripts/003_add_advanced_features.sql`
4. `scripts/004_add_notifications_and_recurring.sql`

### 5. Test Your Deployment

Visit your Vercel URL and test:
- ✅ Sign up / Login
- ✅ Create a task
- ✅ View notifications

## That's It! 🎉

Your PMOS app is now live on Vercel!

For detailed instructions, see `DEPLOYMENT.md`

