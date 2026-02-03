import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Edit, FileSignature, Power, PowerOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency, CONTRACT_TYPE_LABELS } from '@/types/finance';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FeeContract {
  id: string;
  contract_name: string;
  contract_type: string;
  monthly_amount: number | null;
  success_fee_percentage: number | null;
  per_act_amount: number | null;
  billing_day: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  client_id: string;
  clients?: { name: string } | null;
}

const FeeContracts = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [contracts, setContracts] = useState<FeeContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchContracts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fee_contracts')
      .select(`*, clients(name)`)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao carregar contratos', description: error.message });
    } else {
      setContracts(data as FeeContract[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('fee_contracts')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar', description: error.message });
    } else {
      toast({ title: currentStatus ? 'Contrato desativado' : 'Contrato ativado' });
      fetchContracts();
    }
  };

  const filteredContracts = contracts.filter((item) => {
    const matchesSearch = 
      item.contract_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.clients?.name?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && item.is_active) ||
      (statusFilter === 'inactive' && !item.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalMonthly = filteredContracts
    .filter(c => c.is_active && c.monthly_amount)
    .reduce((sum, c) => sum + (c.monthly_amount || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Contratos de Honorários</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gerencie seus contratos de honorários recorrentes
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/financeiro/contratos/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Contrato
          </Link>
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Receita Mensal Recorrente</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatCurrency(totalMonthly)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredContracts.filter(c => c.is_active).length} contratos ativos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileSignature className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {search || statusFilter !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhum contrato cadastrado'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search || statusFilter !== 'all' ? 'Tente outros filtros' : 'Clique em "Novo Contrato" para começar'}
              </p>
            </div>
          ) : isMobile ? (
            <div className="space-y-3">
              {filteredContracts.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.contract_name}</p>
                      {item.clients?.name && (
                        <p className="text-sm text-muted-foreground">{item.clients.name}</p>
                      )}
                    </div>
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                      {item.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {CONTRACT_TYPE_LABELS[item.contract_type as keyof typeof CONTRACT_TYPE_LABELS] || item.contract_type}
                    </span>
                    {item.monthly_amount && (
                      <span className="font-bold text-lg">{formatCurrency(item.monthly_amount)}/mês</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link to={`/financeiro/contratos/${item.id}/editar`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(item.id, item.is_active)}
                    >
                      {item.is_active ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor Mensal</TableHead>
                    <TableHead>Dia Venc.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-48 truncate">
                        {item.contract_name}
                      </TableCell>
                      <TableCell>{item.clients?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {CONTRACT_TYPE_LABELS[item.contract_type as keyof typeof CONTRACT_TYPE_LABELS] || item.contract_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.monthly_amount ? formatCurrency(item.monthly_amount) : '-'}
                      </TableCell>
                      <TableCell>
                        {item.billing_day ? `Dia ${item.billing_day}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? 'default' : 'secondary'}>
                          {item.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/financeiro/contratos/${item.id}/editar`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleActive(item.id, item.is_active)}
                            title={item.is_active ? 'Desativar' : 'Ativar'}
                          >
                            {item.is_active ? (
                              <PowerOff className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Power className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeContracts;
