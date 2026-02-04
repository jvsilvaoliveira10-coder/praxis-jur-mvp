import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Play,
  Loader2,
  FileJson,
  Building2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrgaoStats {
  orgao: string;
  acordaos: number;
  arquivosImportados: number;
  arquivosPendentes: number;
}

interface SyncStatus {
  totalOrgaos: number;
  totalArquivosImportados: number;
  totalArquivosPendentes: number;
  totalAcordaos: number;
  porOrgao: OrgaoStats[];
  ultimaSincronizacao: string | null;
}

interface SyncResult {
  orgao: string;
  arquivo: string;
  status: 'success' | 'error' | 'skipped';
  importados?: number;
  message?: string;
}

export function STJSyncPanel() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState<SyncResult[]>([]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-sync-stj', {
        body: { statusOnly: true },
      });

      if (error) throw error;
      if (data?.success && data?.status) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      toast.error('Erro ao carregar status da base STJ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const startSync = async (maxFiles = 5) => {
    setSyncing(true);
    setSyncLog([]);
    
    try {
      toast.info(`Iniciando sincronização (${maxFiles} arquivos)...`);
      
      const { data, error } = await supabase.functions.invoke('auto-sync-stj', {
        body: { maxFiles },
      });

      if (error) throw error;

      if (data?.success) {
        if (data.results) {
          setSyncLog(data.results);
        }
        
        const summary = data.summary;
        if (summary?.acordaosImportados > 0) {
          toast.success(`Importados ${summary.acordaosImportados} acórdãos de ${summary.sucesso} arquivos`);
        } else if (summary?.pulados > 0) {
          toast.info('Todos os arquivos já foram importados anteriormente');
        } else {
          toast.info(data.message || 'Sincronização concluída');
        }
        
        // Atualiza status
        await fetchStatus();
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro ao sincronizar dados do STJ');
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const totalProgress = status 
    ? (status.totalArquivosImportados / (status.totalArquivosImportados + status.totalArquivosPendentes)) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas gerais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Acórdãos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status?.totalAcordaos?.toLocaleString('pt-BR') || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Na base local
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arquivos Importados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {status?.totalArquivosImportados || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              De {(status?.totalArquivosImportados || 0) + (status?.totalArquivosPendentes || 0)} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arquivos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {status?.totalArquivosPendentes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando importação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {formatDate(status?.ultimaSincronizacao || null)}
            </div>
            <p className="text-xs text-muted-foreground">
              {status?.totalOrgaos || 10} órgãos julgadores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de progresso geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Progresso da Importação</CardTitle>
              <CardDescription>
                Base de dados do Portal de Dados Abertos do STJ
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchStatus}
                disabled={loading || syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                size="sm"
                onClick={() => startSync(5)}
                disabled={syncing || (status?.totalArquivosPendentes === 0)}
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Sincronizar (5 arquivos)
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => startSync(20)}
                disabled={syncing || (status?.totalArquivosPendentes === 0)}
              >
                Sync Completo (20)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {status?.totalArquivosImportados || 0} de{' '}
                {(status?.totalArquivosImportados || 0) + (status?.totalArquivosPendentes || 0)} arquivos
              </span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Status por órgão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Status por Órgão Julgador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {status?.porOrgao?.map((orgao) => (
              <div 
                key={orgao.orgao}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div>
                  <p className="font-medium text-sm">{orgao.orgao}</p>
                  <p className="text-xs text-muted-foreground">
                    {orgao.acordaos.toLocaleString('pt-BR')} acórdãos
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {orgao.arquivosPendentes > 0 ? (
                    <Badge variant="outline" className="text-orange-600">
                      {orgao.arquivosPendentes} pendentes
                    </Badge>
                  ) : orgao.arquivosImportados > 0 ? (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Vazio
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Log de sincronização */}
      {syncLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Log da Última Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {syncLog.map((log, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded border text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {log.status === 'success' && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {log.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      {log.status === 'skipped' && (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{log.orgao}</span>
                      <span className="text-muted-foreground">{log.arquivo}</span>
                    </div>
                    <div>
                      {log.status === 'success' && log.importados && (
                        <Badge variant="secondary">
                          +{log.importados} acórdãos
                        </Badge>
                      )}
                      {log.status === 'skipped' && (
                        <Badge variant="outline">Já importado</Badge>
                      )}
                      {log.status === 'error' && (
                        <Badge variant="destructive">{log.message || 'Erro'}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
