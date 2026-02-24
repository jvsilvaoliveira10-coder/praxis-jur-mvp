import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import {
  Plug, Eye, EyeOff, Loader2, Save, TestTube, Upload, Trash2,
  CheckCircle2, XCircle, Circle, ShieldCheck, FileKey
} from 'lucide-react';

interface IntegrationData {
  id?: string;
  provider: string;
  api_key: string;
  api_secret: string;
  environment: string;
  is_active: boolean;
  last_tested_at: string | null;
  test_status: string | null;
  certificate_path: string | null;
  certificate_name: string | null;
  certificate_uploaded_at: string | null;
}

const PROVIDERS = [
  {
    id: 'd4sign',
    name: 'D4Sign',
    description: 'Plataforma brasileira de assinatura digital',
    hasSecret: true,
    secretLabel: 'Crypt Key',
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Plataforma global de assinatura eletrônica',
    hasSecret: false,
    secretLabel: '',
  },
  {
    id: 'clicksign',
    name: 'Clicksign',
    description: 'Assinatura eletrônica com validade jurídica',
    hasSecret: false,
    secretLabel: '',
  },
];

const ProviderCard = ({
  provider,
  data,
  onSave,
  onTest,
}: {
  provider: typeof PROVIDERS[0];
  data: IntegrationData;
  onSave: (data: IntegrationData) => Promise<void>;
  onTest: (data: IntegrationData) => Promise<void>;
}) => {
  const [formData, setFormData] = useState(data);
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await onTest(formData);
    } finally {
      setTesting(false);
    }
  };

  const statusIcon = formData.test_status === 'success'
    ? <CheckCircle2 className="w-4 h-4 text-primary" />
    : formData.test_status === 'failed'
    ? <XCircle className="w-4 h-4 text-destructive" />
    : <Circle className="w-4 h-4 text-muted-foreground" />;

  const statusLabel = formData.test_status === 'success'
    ? 'Conectado'
    : formData.test_status === 'failed'
    ? 'Falha na conexão'
    : 'Não testado';

  const statusVariant = formData.test_status === 'success'
    ? 'default'
    : formData.test_status === 'failed'
    ? 'destructive'
    : 'secondary';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plug className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{provider.name}</CardTitle>
              <CardDescription className="text-xs">{provider.description}</CardDescription>
            </div>
          </div>
          <Badge variant={statusVariant as any} className="flex items-center gap-1">
            {statusIcon}
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>API Key / Token</Label>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder={`Cole sua API Key do ${provider.name}`}
              value={formData.api_key}
              onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {provider.hasSecret && (
          <div className="space-y-2">
            <Label>{provider.secretLabel}</Label>
            <div className="relative">
              <Input
                type={showSecret ? 'text' : 'password'}
                placeholder={`Cole sua ${provider.secretLabel}`}
                value={formData.api_secret}
                onChange={(e) => setFormData(prev => ({ ...prev, api_secret: e.target.value }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Ambiente</Label>
          <Select
            value={formData.environment}
            onValueChange={(v) => setFormData(prev => ({ ...prev, environment: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
              <SelectItem value="production">Produção</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.last_tested_at && (
          <p className="text-xs text-muted-foreground">
            Último teste: {new Date(formData.last_tested_at).toLocaleString('pt-BR')}
          </p>
        )}

        <div className="flex gap-2">
          <Button onClick={handleTest} variant="outline" size="sm" disabled={testing || !formData.api_key}>
            {testing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <TestTube className="w-4 h-4 mr-1" />}
            Testar Conexão
          </Button>
          <Button onClick={handleSave} size="sm" disabled={saving || !formData.api_key}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CertificateCard = ({
  certificateData,
  onUpload,
  onRemove,
}: {
  certificateData: { name: string | null; uploaded_at: string | null; path: string | null };
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}) => {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-pkcs12': ['.pfx', '.p12'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileKey className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Certificado Digital A1</CardTitle>
            <CardDescription className="text-xs">
              Faça upload do seu certificado .pfx/.p12 para uso com tribunais
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {certificateData.name ? (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{certificateData.name}</p>
                {certificateData.uploaded_at && (
                  <p className="text-xs text-muted-foreground">
                    Enviado em: {new Date(certificateData.uploaded_at).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemove} disabled={removing}>
              {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Enviando certificado...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arraste seu certificado .pfx ou .p12 aqui, ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">Máximo: 10MB</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const IntegrationsTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Record<string, IntegrationData>>({});

  const defaultData = (provider: string): IntegrationData => ({
    provider,
    api_key: '',
    api_secret: '',
    environment: 'sandbox',
    is_active: true,
    last_tested_at: null,
    test_status: null,
    certificate_path: null,
    certificate_name: null,
    certificate_uploaded_at: null,
  });

  useEffect(() => {
    if (!user) return;
    loadIntegrations();
  }, [user]);

  const loadIntegrations = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      const map: Record<string, IntegrationData> = {};
      data.forEach((row: any) => {
        map[row.provider] = {
          id: row.id,
          provider: row.provider,
          api_key: '', // Never expose encrypted keys
          api_secret: '',
          environment: row.environment,
          is_active: row.is_active,
          last_tested_at: row.last_tested_at,
          test_status: row.test_status,
          certificate_path: row.certificate_path,
          certificate_name: row.certificate_name,
          certificate_uploaded_at: row.certificate_uploaded_at,
        };
      });
      setIntegrations(map);
    }
    setLoading(false);
  };

  const handleSave = async (data: IntegrationData) => {
    if (!user) return;

    const existing = integrations[data.provider];

    try {
      const { data: result, error } = await supabase.functions.invoke('manage-integration', {
        body: {
          action: 'save',
          provider: data.provider,
          api_key: data.api_key,
          api_secret: data.api_secret || undefined,
          environment: data.environment,
          integration_id: existing?.id || undefined,
        },
      });

      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || 'Erro desconhecido');

      toast.success(`${data.provider.toUpperCase()} salvo com sucesso!`);
      await loadIntegrations();
    } catch (error: any) {
      toast.error('Erro ao salvar integração: ' + (error.message || 'Tente novamente'));
    }
  };

  const handleTest = async (data: IntegrationData) => {
    if (!user) return;

    try {
      const { data: result, error } = await supabase.functions.invoke('test-integration', {
        body: {
          provider: data.provider,
          api_key: data.api_key,
          environment: data.environment,
          ...(data.api_secret ? { api_secret: data.api_secret } : {}),
        },
      });

      if (error) throw error;

      // Update test status in DB
      const existing = integrations[data.provider];
      if (existing?.id) {
        await supabase
          .from('user_integrations')
          .update({
            last_tested_at: new Date().toISOString(),
            test_status: result.success ? 'success' : 'failed',
          })
          .eq('id', existing.id);
      }

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      await loadIntegrations();
    } catch (error: any) {
      toast.error('Erro ao testar conexão: ' + (error.message || 'Tente novamente'));
    }
  };

  const handleCertificateUpload = async (file: File) => {
    if (!user) return;

    const filePath = `${user.id}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('user-certificates')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Erro ao enviar certificado: ' + uploadError.message);
      return;
    }

    // Save certificate info in a special 'certificate_a1' integration row
    const existing = integrations['certificate_a1'];
    if (existing?.id) {
      await supabase
        .from('user_integrations')
        .update({
          certificate_path: filePath,
          certificate_name: file.name,
          certificate_uploaded_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('user_integrations')
        .insert({
          user_id: user.id,
          provider: 'certificate_a1',
          certificate_path: filePath,
          certificate_name: file.name,
          certificate_uploaded_at: new Date().toISOString(),
        });
    }

    toast.success('Certificado enviado com sucesso!');
    await loadIntegrations();
  };

  const handleCertificateRemove = async () => {
    if (!user) return;

    const certData = integrations['certificate_a1'];
    if (!certData?.certificate_path) return;

    await supabase.storage
      .from('user-certificates')
      .remove([certData.certificate_path]);

    if (certData.id) {
      await supabase
        .from('user_integrations')
        .update({
          certificate_path: null,
          certificate_name: null,
          certificate_uploaded_at: null,
        })
        .eq('id', certData.id);
    }

    toast.success('Certificado removido');
    await loadIntegrations();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const certData = integrations['certificate_a1'] || defaultData('certificate_a1');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Plug className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Integrações</h3>
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        Cadastre suas credenciais para conectar provedores de assinatura digital e certificados.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {PROVIDERS.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            data={integrations[provider.id] || defaultData(provider.id)}
            onSave={handleSave}
            onTest={handleTest}
          />
        ))}
      </div>

      <CertificateCard
        certificateData={{
          name: certData.certificate_name,
          uploaded_at: certData.certificate_uploaded_at,
          path: certData.certificate_path,
        }}
        onUpload={handleCertificateUpload}
        onRemove={handleCertificateRemove}
      />
    </div>
  );
};

export default IntegrationsTab;
