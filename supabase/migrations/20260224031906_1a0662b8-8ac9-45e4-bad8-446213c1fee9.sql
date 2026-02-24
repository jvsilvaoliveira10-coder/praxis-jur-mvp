
-- Trigger para auto-criar preferencias para novos usuarios (com email ativado)
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, email_alerts_enabled, daily_digest_enabled, urgent_alerts_enabled)
  VALUES (NEW.id, true, true, true);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notification_preferences();
