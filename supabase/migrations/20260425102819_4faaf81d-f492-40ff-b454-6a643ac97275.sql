
CREATE TABLE public.sar_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_key text NOT NULL UNIQUE,
  name text DEFAULT '',
  mobile text DEFAULT '',
  reg_no text DEFAULT '',
  quarter text DEFAULT '',
  courses jsonb DEFAULT '[]'::jsonb,
  entries jsonb DEFAULT '[]'::jsonb,
  place text DEFAULT '',
  date_signed text DEFAULT '',
  proof_urls jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sar_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read drafts" ON public.sar_drafts FOR SELECT USING (true);
CREATE POLICY "Public insert drafts" ON public.sar_drafts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update drafts" ON public.sar_drafts FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER sar_drafts_updated_at
BEFORE UPDATE ON public.sar_drafts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('sar-proofs', 'sar-proofs', true);

CREATE POLICY "Public read proofs" ON storage.objects FOR SELECT USING (bucket_id = 'sar-proofs');
CREATE POLICY "Public upload proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sar-proofs');
CREATE POLICY "Public delete proofs" ON storage.objects FOR DELETE USING (bucket_id = 'sar-proofs');
