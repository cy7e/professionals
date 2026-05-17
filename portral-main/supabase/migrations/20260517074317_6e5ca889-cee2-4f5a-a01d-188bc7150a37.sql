
-- Lock down search_path and ensure already set
alter function public.has_role(uuid, public.app_role) set search_path = public;
alter function public.handle_new_user() set search_path = public;
alter function public.touch_updated_at() set search_path = public;

-- Revoke execute from public roles; RLS still works because SECURITY DEFINER policies execute as owner
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
