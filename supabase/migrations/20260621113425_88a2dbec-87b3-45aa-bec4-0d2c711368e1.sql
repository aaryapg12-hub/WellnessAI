
-- Fix search_path on touch_updated_at (handle_new_user already has it)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Revoke public execute on SECURITY DEFINER trigger function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Storage policies: users manage own files in avatars/ and skin-uploads/
CREATE POLICY "Users read own avatars" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users upload own avatars" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own avatars" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own avatars" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own skin" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'skin-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users upload own skin" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'skin-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own skin" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'skin-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
