-- Table for caching search queries
CREATE TABLE public.jurisprudence_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query_text TEXT NOT NULL,
  query_hash TEXT NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Table for individual jurisprudence results
CREATE TABLE public.jurisprudence_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID REFERENCES public.jurisprudence_searches(id) ON DELETE CASCADE,
  external_id TEXT,
  process_number TEXT,
  ementa TEXT NOT NULL,
  orgao_julgador TEXT,
  relator TEXT,
  judgment_date DATE,
  decision_type TEXT,
  pdf_url TEXT,
  full_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for linking jurisprudence to petitions
CREATE TABLE public.petition_jurisprudence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  jurisprudence_id UUID NOT NULL REFERENCES public.jurisprudence_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(petition_id, jurisprudence_id)
);

-- Table for user's saved/favorite jurisprudence (Phase 2, but create structure now)
CREATE TABLE public.saved_jurisprudence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  jurisprudence_id UUID NOT NULL REFERENCES public.jurisprudence_results(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, jurisprudence_id)
);

-- Create indexes for performance
CREATE INDEX idx_jurisprudence_searches_hash ON public.jurisprudence_searches(query_hash);
CREATE INDEX idx_jurisprudence_searches_expires ON public.jurisprudence_searches(expires_at);
CREATE INDEX idx_jurisprudence_searches_user ON public.jurisprudence_searches(user_id);
CREATE INDEX idx_jurisprudence_results_search ON public.jurisprudence_results(search_id);
CREATE INDEX idx_petition_jurisprudence_petition ON public.petition_jurisprudence(petition_id);
CREATE INDEX idx_saved_jurisprudence_user ON public.saved_jurisprudence(user_id);

-- Enable RLS on all tables
ALTER TABLE public.jurisprudence_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurisprudence_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_jurisprudence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jurisprudence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jurisprudence_searches
CREATE POLICY "Users can view their own searches"
  ON public.jurisprudence_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own searches"
  ON public.jurisprudence_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own searches"
  ON public.jurisprudence_searches FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for jurisprudence_results (accessible if user owns the search)
CREATE POLICY "Users can view results from their searches"
  ON public.jurisprudence_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jurisprudence_searches 
      WHERE id = jurisprudence_results.search_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create results for their searches"
  ON public.jurisprudence_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jurisprudence_searches 
      WHERE id = jurisprudence_results.search_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for petition_jurisprudence
CREATE POLICY "Users can view their petition jurisprudence links"
  ON public.petition_jurisprudence FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create petition jurisprudence links"
  ON public.petition_jurisprudence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their petition jurisprudence links"
  ON public.petition_jurisprudence FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for saved_jurisprudence
CREATE POLICY "Users can view their saved jurisprudence"
  ON public.saved_jurisprudence FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save jurisprudence"
  ON public.saved_jurisprudence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved jurisprudence"
  ON public.saved_jurisprudence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved jurisprudence"
  ON public.saved_jurisprudence FOR DELETE
  USING (auth.uid() = user_id);