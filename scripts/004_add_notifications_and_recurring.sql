-- Additional Features: Notifications for due dates and Recurring Task Generation
-- This script adds triggers for task due date notifications and a function to generate tasks from recurring templates

-- ============================================
-- 1. FUNCTION TO CREATE NOTIFICATIONS FOR DUE TASKS
-- ============================================
CREATE OR REPLACE FUNCTION notify_task_due()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create notification when task deadline is within 24 hours
  IF NEW.deadline IS NOT NULL AND OLD.deadline IS DISTINCT FROM NEW.deadline THEN
    IF NEW.deadline <= NOW() + INTERVAL '24 hours' AND NEW.deadline > NOW() THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        NEW.user_id,
        'task_due',
        'Task Due Soon',
        'Task "' || NEW.title || '" is due within 24 hours',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER task_due_notification
  AFTER INSERT OR UPDATE OF deadline ON public.tasks
  FOR EACH ROW
  WHEN (NEW.deadline IS NOT NULL)
  EXECUTE FUNCTION notify_task_due();

-- ============================================
-- 2. FUNCTION TO CREATE NOTIFICATIONS FOR OVERDUE TASKS
-- ============================================
CREATE OR REPLACE FUNCTION notify_task_overdue()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create notification when task becomes overdue
  IF NEW.deadline IS NOT NULL AND NEW.deadline < NOW() AND NEW.status != 'completed' THEN
    -- Check if notification already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.notifications 
      WHERE related_id = NEW.id 
      AND type = 'task_overdue' 
      AND created_at > NOW() - INTERVAL '1 day'
    ) THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        NEW.user_id,
        'task_overdue',
        'Task Overdue',
        'Task "' || NEW.title || '" is overdue',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER task_overdue_notification
  AFTER INSERT OR UPDATE OF deadline, status ON public.tasks
  FOR EACH ROW
  WHEN (NEW.deadline IS NOT NULL AND NEW.status != 'completed')
  EXECUTE FUNCTION notify_task_overdue();

-- ============================================
-- 3. FUNCTION TO GENERATE TASKS FROM RECURRING TEMPLATES
-- ============================================
CREATE OR REPLACE FUNCTION generate_recurring_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recurring_task RECORD;
  next_date DATE;
  task_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Loop through all active recurring tasks where next_due_date is today or in the past
  FOR recurring_task IN 
    SELECT * FROM public.recurring_tasks 
    WHERE active = true 
    AND next_due_date <= CURRENT_DATE
  LOOP
    -- Create the task
    INSERT INTO public.tasks (
      user_id,
      title,
      description,
      deadline,
      status,
      priority,
      created_at,
      updated_at
    )
    VALUES (
      recurring_task.user_id,
      recurring_task.title,
      recurring_task.description,
      recurring_task.next_due_date::timestamp with time zone,
      'pending',
      'medium',
      NOW(),
      NOW()
    );

    -- Calculate next due date based on recurrence type
    CASE recurring_task.recurrence_type
      WHEN 'daily' THEN
        next_date := recurring_task.next_due_date + (recurring_task.recurrence_interval || ' days')::INTERVAL;
      WHEN 'weekly' THEN
        next_date := recurring_task.next_due_date + (recurring_task.recurrence_interval || ' weeks')::INTERVAL;
      WHEN 'monthly' THEN
        next_date := recurring_task.next_due_date + (recurring_task.recurrence_interval || ' months')::INTERVAL;
      WHEN 'yearly' THEN
        next_date := recurring_task.next_due_date + (recurring_task.recurrence_interval || ' years')::INTERVAL;
      ELSE
        next_date := recurring_task.next_due_date + INTERVAL '1 week';
    END CASE;

    -- Update the recurring task's next_due_date
    UPDATE public.recurring_tasks
    SET next_due_date = next_date,
        updated_at = NOW()
    WHERE id = recurring_task.id;
  END LOOP;
END;
$$;

-- ============================================
-- 4. FUNCTION TO CREATE NOTIFICATION ON TASK COMPLETION
-- ============================================
CREATE OR REPLACE FUNCTION notify_task_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.user_id,
      'task_completed',
      'Task Completed',
      'Task "' || NEW.title || '" has been completed',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER task_completed_notification
  AFTER UPDATE OF status ON public.tasks
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION notify_task_completed();

-- ============================================
-- 5. FUNCTION TO CREATE NOTIFICATION ON COMMENT ADDED
-- ============================================
CREATE OR REPLACE FUNCTION notify_comment_added()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  task_owner_id UUID;
BEGIN
  -- Get the task owner
  SELECT user_id INTO task_owner_id
  FROM public.tasks
  WHERE id = NEW.task_id;

  -- Create notification for task owner (if not the commenter)
  IF task_owner_id IS NOT NULL AND task_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      task_owner_id,
      'comment_added',
      'New Comment',
      'A new comment was added to task "' || (SELECT title FROM public.tasks WHERE id = NEW.task_id) || '"',
      NEW.task_id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER comment_added_notification
  AFTER INSERT ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_added();

-- ============================================
-- NOTES
-- ============================================
-- To run the recurring task generation function manually:
-- SELECT generate_recurring_tasks();
--
-- To set up automatic execution, you can:
-- 1. Use Supabase Edge Functions (recommended)
-- 2. Use pg_cron extension if available
-- 3. Use external cron service to call the function via API
--
-- Example pg_cron setup (if extension is enabled):
-- SELECT cron.schedule('generate-recurring-tasks', '0 0 * * *', 'SELECT generate_recurring_tasks()');

