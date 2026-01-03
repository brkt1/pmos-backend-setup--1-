-- PMOS Database Schema
-- Personal Management Operating System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. VISION LAYER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.vision (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  long_term_goal TEXT,
  core_values JSONB DEFAULT '[]'::jsonb,
  non_negotiables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vision ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vision
CREATE POLICY "Users can view own vision"
  ON public.vision FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vision"
  ON public.vision FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vision"
  ON public.vision FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vision"
  ON public.vision FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. STRATEGY LAYER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  priority INTEGER CHECK (priority BETWEEN 1 AND 3),
  metric_name TEXT,
  metric_target TEXT,
  risks TEXT[] DEFAULT ARRAY[]::TEXT[],
  active BOOLEAN DEFAULT true,
  month_year DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strategies
CREATE POLICY "Users can view own strategies"
  ON public.strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategies"
  ON public.strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies"
  ON public.strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies"
  ON public.strategies FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. EXECUTION LAYER - PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. EXECUTION LAYER - TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  owner TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  standard TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'delayed')),
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. DAILY DASHBOARD TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_dashboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  top_priorities JSONB DEFAULT '[]'::jsonb,
  people_to_check JSONB DEFAULT '[]'::jsonb,
  tasks_to_complete JSONB DEFAULT '[]'::jsonb,
  metrics_to_measure JSONB DEFAULT '[]'::jsonb,
  evening_review TEXT,
  evening_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_dashboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_dashboards
CREATE POLICY "Users can view own daily dashboards"
  ON public.daily_dashboards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily dashboards"
  ON public.daily_dashboards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily dashboards"
  ON public.daily_dashboards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily dashboards"
  ON public.daily_dashboards FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. DAILY BEHAVIOR LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_behavior_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  behavior_rule TEXT NOT NULL,
  checked BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.daily_behavior_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_behavior_logs
CREATE POLICY "Users can view own behavior logs"
  ON public.daily_behavior_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own behavior logs"
  ON public.daily_behavior_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own behavior logs"
  ON public.daily_behavior_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own behavior logs"
  ON public.daily_behavior_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 8. WEEKLY REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  goals_review TEXT,
  people_issues TEXT,
  process_improvements TEXT,
  unnecessary_work_removed TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weekly_reviews
CREATE POLICY "Users can view own weekly reviews"
  ON public.weekly_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reviews"
  ON public.weekly_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reviews"
  ON public.weekly_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly reviews"
  ON public.weekly_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vision_updated_at
  BEFORE UPDATE ON public.vision
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON public.strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_dashboards_updated_at
  BEFORE UPDATE ON public.daily_dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_reviews_updated_at
  BEFORE UPDATE ON public.weekly_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create user profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-create daily dashboard
CREATE OR REPLACE FUNCTION create_or_get_daily_dashboard(p_user_id UUID, p_date DATE)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dashboard_id UUID;
BEGIN
  INSERT INTO public.daily_dashboards (user_id, date)
  VALUES (p_user_id, p_date)
  ON CONFLICT (user_id, date) DO NOTHING
  RETURNING id INTO dashboard_id;
  
  IF dashboard_id IS NULL THEN
    SELECT id INTO dashboard_id
    FROM public.daily_dashboards
    WHERE user_id = p_user_id AND date = p_date;
  END IF;
  
  RETURN dashboard_id;
END;
$$;
