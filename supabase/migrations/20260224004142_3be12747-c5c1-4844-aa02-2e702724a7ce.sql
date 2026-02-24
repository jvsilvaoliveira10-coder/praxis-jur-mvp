
-- Drop permissive write policies on legal_codes
DROP POLICY IF EXISTS "Service role can insert legal codes" ON public.legal_codes;
DROP POLICY IF EXISTS "Service role can update legal codes" ON public.legal_codes;

CREATE POLICY "Service role can insert legal codes"
  ON public.legal_codes FOR INSERT
  WITH CHECK ((auth.jwt()->>'role') = 'service_role');

CREATE POLICY "Service role can update legal codes"
  ON public.legal_codes FOR UPDATE
  USING ((auth.jwt()->>'role') = 'service_role');

-- Drop permissive write policies on legal_articles
DROP POLICY IF EXISTS "Service role can insert legal articles" ON public.legal_articles;
DROP POLICY IF EXISTS "Service role can update legal articles" ON public.legal_articles;

CREATE POLICY "Service role can insert legal articles"
  ON public.legal_articles FOR INSERT
  WITH CHECK ((auth.jwt()->>'role') = 'service_role');

CREATE POLICY "Service role can update legal articles"
  ON public.legal_articles FOR UPDATE
  USING ((auth.jwt()->>'role') = 'service_role');

-- Drop permissive write policies on sumulas
DROP POLICY IF EXISTS "Service role can insert sumulas" ON public.sumulas;
DROP POLICY IF EXISTS "Service role can update sumulas" ON public.sumulas;

CREATE POLICY "Service role can insert sumulas"
  ON public.sumulas FOR INSERT
  WITH CHECK ((auth.jwt()->>'role') = 'service_role');

CREATE POLICY "Service role can update sumulas"
  ON public.sumulas FOR UPDATE
  USING ((auth.jwt()->>'role') = 'service_role');

-- Drop permissive write policies on legal_themes
DROP POLICY IF EXISTS "Service role can insert legal themes" ON public.legal_themes;
DROP POLICY IF EXISTS "Service role can update legal themes" ON public.legal_themes;

CREATE POLICY "Service role can insert legal themes"
  ON public.legal_themes FOR INSERT
  WITH CHECK ((auth.jwt()->>'role') = 'service_role');

CREATE POLICY "Service role can update legal themes"
  ON public.legal_themes FOR UPDATE
  USING ((auth.jwt()->>'role') = 'service_role');
