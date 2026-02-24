import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GenerationStage {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
}

export interface PetitionMetadata {
  legislationFound: { label: string; source: string }[];
  jurisprudenceFound: { label: string; source: string }[];
  templateUsed?: string;
  generationTimeMs: number;
  model?: string;
}

export interface GeneratePetitionParams {
  userId: string;
  caseId: string;
  caseData: {
    court: string;
    processNumber: string | null;
    actionType: string;
    opposingParty: string;
  };
  clientData: {
    name: string;
    document: string;
    type: string;
    nationality?: string | null;
    maritalStatus?: string | null;
    profession?: string | null;
    rg?: string | null;
    issuingBody?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string;
    tradeName?: string | null;
    legalRepName?: string | null;
    legalRepCpf?: string | null;
    legalRepPosition?: string | null;
  };
  petitionType: string;
  userContext: string;
  facts: string;
  legalBasis: string;
  requests: string;
  opposingPartyQualification?: string;
  selectedTemplateId?: string;
  templateContent?: string;
  templateTitle?: string;
}

const DEFAULT_STAGES: GenerationStage[] = [
  { id: 'analyze', label: 'Analisando contexto do caso', status: 'pending' },
  { id: 'legislation', label: 'Pesquisando legislação aplicável', status: 'pending' },
  { id: 'jurisprudence', label: 'Buscando jurisprudência relevante', status: 'pending' },
  { id: 'template', label: 'Analisando estilo do escritório', status: 'pending' },
  { id: 'generate', label: 'Gerando petição fundamentada', status: 'pending' },
  { id: 'validate', label: 'Validando citações e referências', status: 'pending' },
];

export const usePetitionGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [metadata, setMetadata] = useState<PetitionMetadata | null>(null);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [stages, setStages] = useState<GenerationStage[]>(DEFAULT_STAGES);
  const [error, setError] = useState<string | null>(null);

  const updateStage = useCallback((stageId: string, status: GenerationStage['status'], detail?: string) => {
    setStages(prev => prev.map(s => 
      s.id === stageId ? { ...s, status, detail } : s
    ));
    if (status === 'running') setCurrentStage(stageId);
  }, []);

  const resetStages = useCallback(() => {
    setStages(DEFAULT_STAGES.map(s => ({ ...s, status: 'pending' as const })));
    setCurrentStage(null);
    setMetadata(null);
    setError(null);
  }, []);

  const generatePetition = useCallback(async (params: GeneratePetitionParams) => {
    return generateWithEdgeFunction(params);
  }, []);

  const generateWithEdgeFunction = async (params: GeneratePetitionParams) => {
    setIsGenerating(true);
    setGeneratedContent('');
    resetStages();
    
    const startTime = Date.now();
    updateStage('analyze', 'running');

    try {
      // Fetch firm settings to enrich the petition
      const { data: firmSettings } = await supabase
        .from('law_firm_settings')
        .select('lawyer_name, oab_number, oab_state, firm_name, address_city, address_state, phone, email, signature_text')
        .maybeSingle();

      updateStage('analyze', 'done');
      updateStage('legislation', 'running');

      const requestBody = {
        templateContent: params.templateContent,
        templateTitle: params.templateTitle,
        caseData: params.caseData,
        clientData: params.clientData,
        petitionType: params.petitionType,
        userContext: params.userContext,
        facts: params.facts,
        legalBasis: params.legalBasis,
        requests: params.requests,
        opposingPartyQualification: params.opposingPartyQualification,
        firmSettings: firmSettings ? {
          lawyerName: firmSettings.lawyer_name,
          oabNumber: firmSettings.oab_number,
          oabState: firmSettings.oab_state,
          firmName: firmSettings.firm_name,
          city: firmSettings.address_city,
          state: firmSettings.address_state,
          phone: firmSettings.phone,
          email: firmSettings.email,
          signatureText: firmSettings.signature_text,
        } : undefined,
      };

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-petition`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar petição');
      }

      if (!response.body) throw new Error('Resposta sem corpo');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);

            // Handle stage updates
            if (parsed.stage) {
              updateStage(parsed.stage, parsed.stageStatus || 'running', parsed.stageDetail);
              continue;
            }

            // Handle metadata from RAG
            if (parsed.metadata) {
              setMetadata({
                legislationFound: parsed.metadata.legislationFound || [],
                jurisprudenceFound: parsed.metadata.jurisprudenceFound || [],
                templateUsed: parsed.metadata.templateUsed,
                generationTimeMs: Date.now() - startTime,
                model: parsed.metadata.model,
              });
              continue;
            }

            // Handle content chunks (OpenAI format)
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
              content += chunk;
              setGeneratedContent(content);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Process remaining
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);

            if (parsed.metadata) {
              setMetadata({
                legislationFound: parsed.metadata.legislationFound || [],
                jurisprudenceFound: parsed.metadata.jurisprudenceFound || [],
                templateUsed: parsed.metadata.templateUsed,
                generationTimeMs: Date.now() - startTime,
                model: parsed.metadata.model,
              });
              continue;
            }

            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
              content += chunk;
              setGeneratedContent(content);
            }
          } catch { /* ignore */ }
        }
      }

      updateStage('generate', 'done');
      setStages(prev => prev.map(s => 
        s.status === 'pending' ? { ...s, status: 'done' as const } : s
      ));

      // If no metadata was received from the server, set empty
      setMetadata(prev => prev || {
        legislationFound: [],
        jurisprudenceFound: [],
        generationTimeMs: Date.now() - startTime,
        model: 'Edge Function',
      });
    } catch (err) {
      console.error('Edge function generation error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar petição');
      if (currentStage) updateStage(currentStage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatedContent,
    metadata,
    currentStage,
    stages,
    error,
    generatePetition,
    setGeneratedContent,
    resetStages,
  };
};
