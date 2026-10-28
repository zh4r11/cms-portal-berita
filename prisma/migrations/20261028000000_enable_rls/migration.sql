-- Supabase membuka schema public lewat Data API; RLS tanpa policy menutup akses itu.
-- Aplikasi terhubung sebagai pemilik tabel, jadi tidak terpengaruh.
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;
