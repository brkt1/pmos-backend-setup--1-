-- Advanced Features for PMOS
-- Adds priorities, comments, notifications, and more

-- ============================================
-- 1. ADD PRIORITY TO TASKS
-- ============================================
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- ============================================
-- 2. TASK COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_comments
CREATE POLICY "Users can view comments on their tasks"
  ON public.task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_comments.task_id 
      AND (tasks.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_members.id = tasks.assigned_to 
        AND team_members.manager_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can insert comments on their tasks"
  ON public.task_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_comments.task_id 
      AND (tasks.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_members.id = tasks.assigned_to 
        AND team_members.manager_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can update own comments"
  ON public.task_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.task_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. TASK ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.task_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.task_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_activity_log
CREATE POLICY "Users can view activity on their tasks"
  ON public.task_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_activity_log.task_id 
      AND (tasks.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_members.id = tasks.assigned_to 
        AND team_members.manager_id = auth.uid()
      ))
    )
  );

CREATE POLICY "System can insert activity logs"
  ON public.task_activity_log FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 4. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_due', 'task_overdue', 'task_completed', 'comment_added')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 5. USER SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  email_notifications BOOLEAN DEFAULT true,
  task_reminders BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '09:00:00',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. RECURRING TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recurring_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  recurrence_interval INTEGER DEFAULT 1,
  next_due_date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.recurring_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recurring_tasks
CREATE POLICY "Users can manage own recurring tasks"
  ON public.recurring_tasks FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 7. TASK TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  standard TEXT,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_templates
CREATE POLICY "Users can manage own task templates"
  ON public.task_templates FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 8. TRIGGERS
-- ============================================
CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_tasks_updated_at
  BEFORE UPDATE ON public.recurring_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON public.task_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. FUNCTION TO CREATE NOTIFICATION ON TASK ASSIGNMENT
-- ============================================
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    SELECT 
      tm.manager_id,
      'task_assigned',
      'Task Assigned',
      'Task "' || NEW.title || '" has been assigned to ' || COALESCE(tm.full_name, tm.email),
      NEW.id
    FROM public.team_members tm
    WHERE tm.id = NEW.assigned_to;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER task_assignment_notification
  AFTER UPDATE OF assigned_to ON public.tasks
  FOR EACH ROW
  WHEN (NEW.assigned_to IS NOT NULL)
  EXECUTE FUNCTION notify_task_assigned();

-- ============================================
-- 10. FUNCTION TO LOG TASK CHANGES
-- ============================================
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.task_activity_log (task_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, NEW.user_id, 'status_changed', OLD.status, NEW.status);
  END IF;
  
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO public.task_activity_log (task_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, NEW.user_id, 'assigned_changed', 
      COALESCE((SELECT email FROM public.team_members WHERE id = OLD.assigned_to), 'Unassigned'),
      COALESCE((SELECT email FROM public.team_members WHERE id = NEW.assigned_to), 'Unassigned')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER task_change_logger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_changes();

