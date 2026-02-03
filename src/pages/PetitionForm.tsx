import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PetitionType, 
  PETITION_TYPE_LABELS, 
  Case,
  Client,
  ACTION_TYPE_LABELS,
  PetitionTemplate,
  PieceType,
  PIECE_TYPE_LABELS,
  MARITAL_STATUS_LABELS,
  MaritalStatus
} from '@/types/database';
import { 
  generatePetition, 
  getDefaultFacts, 
  getDefaultLegalBasis, 
  getDefaultRequests 
} from '@/lib/petition-templates';
import { exportToPDF } from '@/lib/pdf-export';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, FileText, Download, Wand2, BookTemplate, Info, Sparkles, Loader2, Briefcase, Type, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import PremiumFormHeader from '@/components/forms/PremiumFormHeader';

const PetitionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [cases, setCases] = useState<(Case & { client: Client })[]>([]);
  const [selectedCase, setSelectedCase] = useState<(Case & { client: Client }) | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PetitionTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('form');

  const [form, setForm] = useState({
    case_id: '',
    petition_type: 'peticao_inicial' as PetitionType,
    title: '',
    facts: '',
    legalBasis: '',
    requests: '',
    opposingPartyQualification: '',
    content: '',
    template_id: '',
    userContext: '',
  });

  const { data: templates } = useQuery({
    queryKey: ['petition-templates-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('petition_templates')
        .select('*')
        .eq('active', true)
        .order('title');

      if (error) throw error;
      return data as PetitionTemplate[];
    },
    enabled: !!user,
  });

  const filteredTemplates = templates?.filter(t => {
    const pieceTypeMap: Record<PetitionType, PieceType> = {
      peticao_inicial: 'peticao_inicial',
      contestacao: 'contestacao',
      peticao_simples: 'peticao_simples',
    };
    return t.piece_type === pieceTypeMap[form.petition_type];
  }) || [];

  useEffect(() => {
    const fetchCases = async () => {
      const { data } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });
      setCases(data as any[] || []);
    };
    fetchCases();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const fetchPetition = async () => {
        const { data, error } = await supabase
          .from('petitions')
          .select(`
            *,
            case:cases(
              *,
              client:clients(*)
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (error || !data) {
          toast({
            variant: 'destructive',
            title: 'Petição não encontrada',
          });
          navigate('/petitions');
        } else {
          setForm({
            case_id: data.case_id,
            petition_type: data.petition_type as PetitionType,
            title: data.title,
            facts: '',
            legalBasis: '',
            requests: '',
            opposingPartyQualification: '',
            content: data.content,
            template_id: '',
            userContext: '',
          });
          setSelectedCase(data.case as any);
          setActiveTab('editor');
        }
      };
      fetchPetition();
    }
  }, [id, isEdit, navigate, toast]);

  useEffect(() => {
    if (form.case_id) {
      const caseData = cases.find(c => c.id === form.case_id);
      if (caseData) {
        setSelectedCase(caseData);
        if (!isEdit) {
          setForm(prev => ({
            ...prev,
            facts: getDefaultFacts(caseData.action_type),
            legalBasis: getDefaultLegalBasis(caseData.action_type),
            requests: getDefaultRequests(caseData.action_type),
            title: `${PETITION_TYPE_LABELS[prev.petition_type]} - ${caseData.client.name}`,
          }));
        }
      }
    }
  }, [form.case_id, cases, isEdit]);

  useEffect(() => {
    if (form.template_id && templates) {
      const template = templates.find(t => t.id === form.template_id);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [form.template_id, templates]);

  const handlePetitionTypeChange = (type: PetitionType) => {
    setForm(prev => ({
      ...prev,
      petition_type: type,
      template_id: '',
      title: selectedCase 
        ? `${PETITION_TYPE_LABELS[type]} - ${selectedCase.client.name}`
        : prev.title,
    }));
    setSelectedTemplate(null);
  };

  const handleGenerate = () => {
    if (!selectedCase) {
      toast({
        variant: 'destructive',
        title: 'Selecione um processo',
      });
      return;
    }

    let content: string;

    if (selectedTemplate) {
      content = applyTemplateToCase(selectedTemplate.content, selectedCase, form);
      toast({
        title: 'Petição gerada com modelo do escritório!',
        description: 'O modelo foi aplicado. Revise e faça os ajustes necessários.',
      });
    } else {
      content = generatePetition({
        client: selectedCase.client,
        case: selectedCase,
        petitionType: form.petition_type,
        facts: form.facts,
        legalBasis: form.legalBasis,
        requests: form.requests,
        opposingPartyQualification: form.opposingPartyQualification,
      });
      toast({
        title: 'Petição gerada com sucesso!',
        description: 'Revise o texto e faça os ajustes necessários.',
      });
    }

    setForm(prev => ({ ...prev, content }));
    setActiveTab('editor');
  };

  const handleGenerateWithAI = async () => {
    if (!selectedCase) {
      toast({
        variant: 'destructive',
        title: 'Selecione um processo',
      });
      return;
    }

    if (!form.userContext.trim()) {
      toast({
        variant: 'destructive',
        title: 'Contextualização necessária',
        description: 'Descreva o contexto específico do caso para a IA gerar a petição.',
      });
      return;
    }

    setAiGenerating(true);
    setForm(prev => ({ ...prev, content: '' }));
    setActiveTab('editor');

    try {
      const client = selectedCase.client;
      
      const addressParts: string[] = [];
      if (client.address_street) {
        let line = client.address_street;
        if (client.address_number) line += `, nº ${client.address_number}`;
        if (client.address_complement) line += `, ${client.address_complement}`;
        addressParts.push(line);
      }
      if (client.address_neighborhood) addressParts.push(client.address_neighborhood);
      if (client.address_city && client.address_state) {
        addressParts.push(`${client.address_city}/${client.address_state}`);
      }
      if (client.address_zip) addressParts.push(`CEP ${client.address_zip}`);

      const requestBody = {
        templateContent: selectedTemplate?.content,
        templateTitle: selectedTemplate?.title,
        caseData: {
          court: selectedCase.court,
          processNumber: selectedCase.process_number,
          actionType: ACTION_TYPE_LABELS[selectedCase.action_type],
          opposingParty: selectedCase.opposing_party,
        },
        clientData: {
          name: client.name,
          document: client.document,
          type: client.type,
          nationality: client.nationality,
          maritalStatus: client.marital_status ? MARITAL_STATUS_LABELS[client.marital_status as MaritalStatus] : undefined,
          profession: client.profession,
          rg: client.rg,
          issuingBody: client.issuing_body,
          email: client.email,
          phone: client.phone,
          address: addressParts.join(', '),
          tradeName: client.trade_name,
          legalRepName: client.legal_rep_name,
          legalRepCpf: client.legal_rep_cpf,
          legalRepPosition: client.legal_rep_position,
        },
        petitionType: PETITION_TYPE_LABELS[form.petition_type],
        userContext: form.userContext,
        facts: form.facts,
        legalBasis: form.legalBasis,
        requests: form.requests,
        opposingPartyQualification: form.opposingPartyQualification,
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-petition`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar petição');
      }

      if (!response.body) {
        throw new Error('Resposta sem corpo');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let generatedContent = '';

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
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              generatedContent += content;
              setForm(prev => ({ ...prev, content: generatedContent }));
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

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
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              generatedContent += content;
              setForm(prev => ({ ...prev, content: generatedContent }));
            }
          } catch { /* ignore */ }
        }
      }

      toast({
        title: 'Petição gerada com IA!',
        description: 'Revise o texto gerado e faça os ajustes necessários.',
      });
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar petição',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const applyTemplateToCase = (
    templateContent: string, 
    caseData: Case & { client: Client },
    formData: typeof form
  ): string => {
    const client = caseData.client;
    
    const placeholders: Record<string, string> = {
      '[VARA/COMARCA]': caseData.court,
      '[NUMERO_PROCESSO]': caseData.process_number || '[NÚMERO DO PROCESSO]',
      '[NOME_CLIENTE]': client.name.toUpperCase(),
      '[CLIENTE]': client.name,
      '[CPF_CLIENTE]': client.document || '',
      '[CNPJ_CLIENTE]': client.document || '',
      '[DOCUMENTO_CLIENTE]': client.document || '',
      '[RG_CLIENTE]': client.rg || '',
      '[NACIONALIDADE]': client.nationality || 'brasileiro(a)',
      '[ESTADO_CIVIL]': client.marital_status || '',
      '[PROFISSAO]': client.profession || '',
      '[ENDERECO_CLIENTE]': formatClientAddress(client),
      '[EMAIL_CLIENTE]': client.email || '',
      '[TELEFONE_CLIENTE]': client.phone || '',
      '[PARTE_CONTRARIA]': caseData.opposing_party.toUpperCase(),
      '[PARTE_RE]': caseData.opposing_party.toUpperCase(),
      '[TIPO_ACAO]': ACTION_TYPE_LABELS[caseData.action_type],
      '[FATOS]': formData.facts,
      '[FUNDAMENTOS]': formData.legalBasis,
      '[PEDIDOS]': formData.requests,
      '[DATA]': formatDate(),
    };

    let result = templateContent;
    
    for (const [placeholder, value] of Object.entries(placeholders)) {
      result = result.replace(new RegExp(escapeRegex(placeholder), 'gi'), value);
    }

    return result;
  };

  const formatClientAddress = (client: Client): string => {
    const parts: string[] = [];
    if (client.address_street) {
      let line = client.address_street;
      if (client.address_number) line += `, nº ${client.address_number}`;
      if (client.address_complement) line += `, ${client.address_complement}`;
      parts.push(line);
    }
    if (client.address_neighborhood) parts.push(client.address_neighborhood);
    if (client.address_city && client.address_state) {
      parts.push(`${client.address_city}/${client.address_state}`);
    }
    if (client.address_zip) parts.push(`CEP ${client.address_zip}`);
    return parts.join(', ');
  };

  const formatDate = (): string => {
    const date = new Date();
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const escapeRegex = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const handleSave = async () => {
    if (!form.content) {
      toast({
        variant: 'destructive',
        title: 'Gere a petição primeiro',
      });
      return;
    }

    setLoading(true);

    const payload = {
      case_id: form.case_id,
      petition_type: form.petition_type,
      title: form.title,
      content: form.content,
    };

    if (isEdit) {
      const { error } = await supabase
        .from('petitions')
        .update(payload)
        .eq('id', id);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao atualizar petição',
          description: error.message,
        });
      } else {
        toast({ title: 'Petição salva com sucesso' });
        navigate('/petitions');
      }
    } else {
      const { error } = await supabase.from('petitions').insert({
        ...payload,
        user_id: user?.id,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar petição',
          description: error.message,
        });
      } else {
        toast({ title: 'Petição salva com sucesso' });
        navigate('/petitions');
      }
    }

    setLoading(false);
  };

  const handleExportPDF = () => {
    if (!form.content) {
      toast({
        variant: 'destructive',
        title: 'Não há conteúdo para exportar',
      });
      return;
    }
    exportToPDF(form.content, form.title);
    toast({ title: 'PDF exportado com sucesso!' });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PremiumFormHeader
          icon={<FileText className="w-6 h-6 text-primary" />}
          title={isEdit ? 'Editar Petição' : 'Nova Petição'}
          subtitle={isEdit ? 'Edite o conteúdo da petição' : 'Gere uma petição automaticamente com IA'}
          backPath="/petitions"
        />
        <div className="flex gap-2 ml-auto">
          {form.content && (
            <Button variant="outline" onClick={handleExportPDF} className="h-11 rounded-xl">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading || !form.content} className="btn-premium">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-12 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="form" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm h-10 px-4">
            <FileText className="w-4 h-4 mr-2" />
            Formulário
          </TabsTrigger>
          <TabsTrigger value="editor" disabled={!form.content && !isEdit} className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm h-10 px-4">
            <Wand2 className="w-4 h-4 mr-2" />
            Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-5 mt-6">
          <div className="grid md:grid-cols-2 gap-5">
            <Card className="card-premium">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Dados Básicos</CardTitle>
                <CardDescription>
                  Selecione o processo e tipo de petição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="label-premium">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    Processo <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={form.case_id} 
                    onValueChange={(v) => setForm({ ...form, case_id: v })}
                  >
                    <SelectTrigger className="select-premium">
                      <SelectValue placeholder="Selecione o processo" />
                    </SelectTrigger>
                    <SelectContent>
                      {cases.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.client.name} - {ACTION_TYPE_LABELS[c.action_type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {cases.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum processo cadastrado.{' '}
                      <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/cases/new')}>
                        Cadastre um processo primeiro.
                      </Button>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="label-premium">
                    <Type className="w-4 h-4 text-muted-foreground" />
                    Tipo de Petição
                  </Label>
                  <Select 
                    value={form.petition_type} 
                    onValueChange={(v) => handlePetitionTypeChange(v as PetitionType)}
                  >
                    <SelectTrigger className="select-premium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PETITION_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="label-premium">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Título da Petição
                  </Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Título para identificação"
                    className="input-premium"
                  />
                </div>

                {form.petition_type === 'peticao_inicial' && (
                  <div className="space-y-2">
                    <Label className="label-premium">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Qualificação da Parte Contrária <span className="text-muted-foreground text-xs">(opcional)</span>
                    </Label>
                    <Textarea
                      value={form.opposingPartyQualification}
                      onChange={(e) => setForm({ ...form, opposingPartyQualification: e.target.value })}
                      placeholder="Ex: EMPRESA XYZ LTDA, inscrita no CNPJ sob nº..."
                      rows={3}
                      className="textarea-premium"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedCase && (
              <Card className="card-premium">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Informações do Processo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-medium">{selectedCase.client.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Documento:</span>
                    <span className="font-medium">{selectedCase.client.document}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Vara/Comarca:</span>
                    <span className="font-medium">{selectedCase.court}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Tipo de Ação:</span>
                    <span className="font-medium">{ACTION_TYPE_LABELS[selectedCase.action_type]}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Parte Contrária:</span>
                    <span className="font-medium">{selectedCase.opposing_party}</span>
                  </div>
                  {selectedCase.process_number && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Nº Processo:</span>
                      <span className="font-medium">{selectedCase.process_number}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Template Selection Card */}
          <Card className="card-premium border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <BookTemplate className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Modelo do Escritório</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Selecione um modelo cadastrado pelo escritório para usar como base na geração da petição.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>
                Use um modelo personalizado do seu escritório (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="label-premium">Modelo de {PETITION_TYPE_LABELS[form.petition_type]}</Label>
                <Select 
                  value={form.template_id || '__default__'} 
                  onValueChange={(v) => setForm({ ...form, template_id: v === '__default__' ? '' : v })}
                >
                  <SelectTrigger className="select-premium">
                    <SelectValue placeholder="Selecione um modelo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__default__">Usar modelo padrão do sistema</SelectItem>
                    {filteredTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filteredTemplates.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum modelo ativo para {PETITION_TYPE_LABELS[form.petition_type].toLowerCase()}.{' '}
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/templates/new')}>
                    Cadastrar modelo
                  </Button>
                </p>
              )}

              {selectedTemplate && (
                <div className="p-4 bg-background rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{selectedTemplate.title}</span>
                    <Badge variant="outline">
                      {PIECE_TYPE_LABELS[selectedTemplate.piece_type as PieceType]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {selectedTemplate.content.substring(0, 200)}...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Generation Card */}
          <Card className="card-premium border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-lg text-primary">Geração com IA</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Recomendado
                </Badge>
              </div>
              <CardDescription>
                Deixe a IA gerar uma petição completa com linguagem jurídica profissional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="label-premium">
                  Contextualização do Caso
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help ml-1" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Descreva detalhes específicos do caso, como circunstâncias particulares, provas existentes, jurisprudência relevante, estratégia argumentativa, valores envolvidos, etc.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Textarea
                  value={form.userContext}
                  onChange={(e) => setForm({ ...form, userContext: e.target.value })}
                  placeholder="Ex: Cliente comprou um veículo zero-km que apresentou defeito no motor após 3 meses de uso. Já foram 5 tentativas de reparo sem sucesso. Temos nota fiscal, ordens de serviço e laudo técnico comprovando o defeito de fabricação..."
                  rows={6}
                  className="textarea-premium text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Quanto mais detalhes você fornecer, mais precisa e personalizada será a petição gerada pela IA.
                </p>
              </div>

              <Button 
                onClick={handleGenerateWithAI} 
                className="w-full btn-premium h-12"
                disabled={!selectedCase || aiGenerating}
                size="lg"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Petição com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Conteúdo Manual da Petição</CardTitle>
              <CardDescription>
                {selectedTemplate 
                  ? 'O modelo selecionado será usado como base. Preencha os campos adicionais abaixo para geração manual.'
                  : 'Preencha os campos abaixo para geração manual (sem IA).'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="label-premium">Dos Fatos</Label>
                <Textarea
                  value={form.facts}
                  onChange={(e) => setForm({ ...form, facts: e.target.value })}
                  placeholder="Descreva os fatos que fundamentam a petição..."
                  rows={8}
                  className="textarea-premium font-mono text-sm"
                />
              </div>

              {form.petition_type !== 'peticao_simples' && (
                <div className="space-y-2">
                  <Label className="label-premium">Do Direito</Label>
                  <Textarea
                    value={form.legalBasis}
                    onChange={(e) => setForm({ ...form, legalBasis: e.target.value })}
                    placeholder="Apresente os fundamentos jurídicos..."
                    rows={8}
                    className="textarea-premium font-mono text-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="label-premium">Dos Pedidos</Label>
                <Textarea
                  value={form.requests}
                  onChange={(e) => setForm({ ...form, requests: e.target.value })}
                  placeholder="Liste os pedidos..."
                  rows={6}
                  className="textarea-premium font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full h-11 rounded-xl"
                variant="outline"
                disabled={!selectedCase || aiGenerating}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {selectedTemplate ? 'Gerar Manual com Modelo' : 'Gerar Petição Manual'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="mt-6">
          <Card className="card-premium">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Editor de Petição</CardTitle>
                  <CardDescription>
                    Revise e edite o texto gerado. Você pode fazer alterações livremente.
                  </CardDescription>
                </div>
                {aiGenerating && (
                  <Badge variant="outline" className="animate-pulse">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Gerando...
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="min-h-[600px] font-mono text-sm leading-relaxed scrollbar-legal rounded-xl border-border/50"
                placeholder={aiGenerating ? "A petição está sendo gerada pela IA..." : "O conteúdo da petição aparecerá aqui..."}
                disabled={aiGenerating}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PetitionForm;
