-- Add roles and team management to PMOS
-- This allows users to add team members and assign tasks to them

-- ============================================
-- 1. ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles
CREATE POLICY "Users can view own roles"
  ON public.roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles"
  ON public.roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roles"
  ON public.roles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own roles"
  ON public.roles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(manager_id, email)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Users can view own team members"
  ON public.team_members FOR SELECT
  USING (auth.uid() = manager_id);

CREATE POLICY "Users can insert own team members"
  ON public.team_members FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Users can update own team members"
  ON public.team_members FOR UPDATE
  USING (auth.uid() = manager_id);

CREATE POLICY "Users can delete own team members"
  ON public.team_members FOR DELETE
  USING (auth.uid() = manager_id);

-- ============================================
-- 3. UPDATE TASKS TABLE
-- ============================================
-- Add assigned_to field to link tasks to team members
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.team_members(id) ON DELETE SET NULL;

-- Update RLS to allow viewing tasks assigned to team members
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.id = tasks.assigned_to 
      AND team_members.manager_id = auth.uid()
    )
  );

-- ============================================
-- 4. TRIGGERS
-- ============================================
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

