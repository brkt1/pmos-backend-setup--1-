-- Add Team Member Authentication and Dashboard Access
-- This allows team members to have their own accounts and dashboards

-- ============================================
-- 1. UPDATE TEAM MEMBERS TABLE
-- ============================================
-- Add user_id column to link team members to auth.users
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add invite token and status
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_invite_token ON public.team_members(invite_token);

-- ============================================
-- 2. UPDATE RLS POLICIES FOR TEAM MEMBERS
-- ============================================

-- Allow team members to view their own team member record
DROP POLICY IF EXISTS "Users can view own team members" ON public.team_members;
CREATE POLICY "Managers can view own team members"
  ON public.team_members FOR SELECT
  USING (auth.uid() = manager_id);

CREATE POLICY "Team members can view own record"
  ON public.team_members FOR SELECT
  USING (auth.uid() = user_id);

-- Allow team members to update their own record (for accepting invite)
CREATE POLICY "Team members can update own record"
  ON public.team_members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. UPDATE TASKS RLS POLICIES
-- ============================================

-- Update tasks policy to allow team members to view their assigned tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.id = tasks.assigned_to 
      AND team_members.user_id = auth.uid()
    )
  );

-- Allow team members to update tasks assigned to them
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.id = tasks.assigned_to 
      AND team_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.id = tasks.assigned_to 
      AND team_members.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. UPDATE TASK COMMENTS RLS POLICIES
-- ============================================

-- Allow team members to view and add comments on their assigned tasks
DROP POLICY IF EXISTS "Users can view comments on their tasks" ON public.task_comments;
CREATE POLICY "Users can view comments on their tasks"
  ON public.task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_comments.task_id 
      AND (
        tasks.user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.team_members 
          WHERE team_members.id = tasks.assigned_to 
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert comments on their tasks" ON public.task_comments;
CREATE POLICY "Users can insert comments on their tasks"
  ON public.task_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_comments.task_id 
      AND (
        tasks.user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.team_members 
          WHERE team_members.id = tasks.assigned_to 
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

-- ============================================
-- 5. UPDATE NOTIFICATIONS RLS POLICIES
-- ============================================

-- Allow team members to view their own notifications
-- (Already exists, but ensuring it's correct)
-- The existing policy should work fine

-- ============================================
-- 6. FUNCTION TO GENERATE INVITE TOKEN
-- ============================================
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a random token
  token := encode(gen_random_bytes(32), 'base64');
  -- Remove any characters that might cause issues in URLs
  token := replace(replace(token, '/', '_'), '+', '-');
  RETURN token;
END;
$$;

-- ============================================
-- 7. FUNCTION TO ACCEPT INVITE
-- ============================================
CREATE OR REPLACE FUNCTION accept_team_invite(p_token TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  member_record RECORD;
BEGIN
  -- Find the team member record by token
  SELECT * INTO member_record
  FROM public.team_members
  WHERE invite_token = p_token
  AND user_id IS NULL
  AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update the team member record
  UPDATE public.team_members
  SET user_id = p_user_id,
      accepted_at = NOW(),
      invite_token = NULL
  WHERE id = member_record.id;
  
  RETURN TRUE;
END;
$$;

-- ============================================
-- 8. FUNCTION TO CHECK IF USER IS MANAGER OR TEAM MEMBER
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_manager BOOLEAN;
  is_team_member BOOLEAN;
BEGIN
  -- Check if user is a manager (has their own account)
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = p_user_id
  ) INTO is_manager;
  
  -- Check if user is a team member
  SELECT EXISTS (
    SELECT 1 FROM public.team_members WHERE user_id = p_user_id
  ) INTO is_team_member;
  
  IF is_manager AND is_team_member THEN
    RETURN 'both';
  ELSIF is_manager THEN
    RETURN 'manager';
  ELSIF is_team_member THEN
    RETURN 'team_member';
  ELSE
    RETURN 'none';
  END IF;
END;
$$;

