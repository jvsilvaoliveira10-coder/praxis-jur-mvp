import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Building2, Tag, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, ACCOUNT_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from '@/types/finance';
import { Badge } from '@/components/ui/badge';

interface Account {
  id: string;
  name: string;
  account_type: string;
  bank_name: string | null;
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  color: string | null;
}

interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
  color: string | null;
  icon: string | null;
  is_system: boolean;
}

interface CostCenter {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
}

const FinanceSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);

  // Account modal state
  const [accountModal, setAccountModal] = useState<{ open: boolean; item: Account | null }>({
    open: false,
    item: null,
  });
  const [accountForm, setAccountForm] = useState({
    name: '',
    account_type: 'banco',
    bank_name: '',
    initial_balance: '',
    color: '#3B82F6',
  });

  // Category modal state
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; item: Category | null }>({
    open: false,
    item: null,
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'receita' as 'receita' | 'despesa',
    color: '#3B82F6',
  });

  // Cost center modal state
  const [costCenterModal, setCostCenterModal] = useState<{ open: boolean; item: CostCenter | null }>({
    open: false,
    item: null,
  });
  const [costCenterForm, setCostCenterForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    
    const [accountsRes, categoriesRes, costCentersRes] = await Promise.all([
      supabase.from('financial_accounts').select('*').order('name'),
      supabase.from('financial_categories').select('*').order('type, name'),
      supabase.from('cost_centers').select('*').order('name'),
    ]);

    if (accountsRes.data) setAccounts(accountsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
    if (costCentersRes.data) setCostCenters(costCentersRes.data);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Account functions
  const openAccountModal = (account?: Account) => {
    if (account) {
      setAccountForm({
        name: account.name,
        account_type: account.account_type,
        bank_name: account.bank_name || '',
        initial_balance: String(account.initial_balance),
        color: account.color || '#3B82F6',
      });
      setAccountModal({ open: true, item: account });
    } else {
      setAccountForm({ name: '', account_type: 'banco', bank_name: '', initial_balance: '', color: '#3B82F6' });
      setAccountModal({ open: true, item: null });
    }
  };

  const saveAccount = async () => {
    if (!accountForm.name) {
      toast({ variant: 'destructive', title: 'Nome obrigatório' });
      return;
    }

    const payload = {
      name: accountForm.name,
      account_type: accountForm.account_type as 'banco' | 'caixa' | 'carteira_digital',
      bank_name: accountForm.bank_name || null,
      initial_balance: parseFloat(accountForm.initial_balance.replace(',', '.')) || 0,
      color: accountForm.color,
    };

    if (accountModal.item) {
      const { error } = await supabase
        .from('financial_accounts')
        .update(payload)
        .eq('id', accountModal.item.id);
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao atualizar', description: error.message });
      } else {
        toast({ title: 'Conta atualizada' });
        setAccountModal({ open: false, item: null });
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('financial_accounts')
        .insert([{ ...payload, user_id: user?.id!, current_balance: payload.initial_balance }]);
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao criar', description: error.message });
      } else {
        toast({ title: 'Conta criada' });
        setAccountModal({ open: false, item: null });
        fetchData();
      }
    }
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from('financial_accounts').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Conta excluída' });
      fetchData();
    }
  };

  // Category functions
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setCategoryForm({
        name: category.name,
        type: category.type,
        color: category.color || '#3B82F6',
      });
      setCategoryModal({ open: true, item: category });
    } else {
      setCategoryForm({ name: '', type: 'receita', color: '#3B82F6' });
      setCategoryModal({ open: true, item: null });
    }
  };

  const saveCategory = async () => {
    if (!categoryForm.name) {
      toast({ variant: 'destructive', title: 'Nome obrigatório' });
      return;
    }

    const payload = {
      name: categoryForm.name,
      type: categoryForm.type,
      color: categoryForm.color,
    };

    if (categoryModal.item) {
      const { error } = await supabase
        .from('financial_categories')
        .update(payload)
        .eq('id', categoryModal.item.id);
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao atualizar', description: error.message });
      } else {
        toast({ title: 'Categoria atualizada' });
        setCategoryModal({ open: false, item: null });
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('financial_categories')
        .insert([{ ...payload, user_id: user?.id! }]);
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao criar', description: error.message });
      } else {
        toast({ title: 'Categoria criada' });
        setCategoryModal({ open: false, item: null });
        fetchData();
      }
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('financial_categories').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Categoria excluída' });
      fetchData();
    }
  };

  // Cost center functions
  const openCostCenterModal = (costCenter?: CostCenter) => {
    if (costCenter) {
      setCostCenterForm({
        name: costCenter.name,
        code: costCenter.code || '',
        description: costCenter.description || '',
      });
      setCostCenterModal({ open: true, item: costCenter });
    } else {
      setCostCenterForm({ name: '', code: '', description: '' });
      setCostCenterModal({ open: true, item: null });
    }
  };

  const saveCostCenter = async () => {
    if (!costCenterForm.name) {
      toast({ variant: 'destructive', title: 'Nome obrigatório' });
      return;
    }

    const payload = {
      name: costCenterForm.name,
      code: costCenterForm.code || null,
      description: costCenterForm.description || null,
    };

    if (costCenterModal.item) {
      const { error } = await supabase
        .from('cost_centers')
        .update(payload)
        .eq('id', costCenterModal.item.id);
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao atualizar', description: error.message });
      } else {
        toast({ title: 'Centro de custo atualizado' });
        setCostCenterModal({ open: false, item: null });
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('cost_centers')
        .insert([{ ...payload, user_id: user?.id! }]);
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao criar', description: error.message });
      } else {
        toast({ title: 'Centro de custo criado' });
        setCostCenterModal({ open: false, item: null });
        fetchData();
      }
    }
  };

  const deleteCostCenter = async (id: string) => {
    const { error } = await supabase.from('cost_centers').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Centro de custo excluído' });
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Configurações Financeiras</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas contas bancárias, categorias e centros de custo
        </p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Contas</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <span className="hidden sm:inline">Categorias</span>
          </TabsTrigger>
          <TabsTrigger value="costcenters" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Centros de Custo</span>
          </TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contas Bancárias</CardTitle>
                <CardDescription>Gerencie suas contas e caixas</CardDescription>
              </div>
              <Button onClick={() => openAccountModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead className="text-right">Saldo Atual</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: account.color || '#3B82F6' }}
                          />
                          {account.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ACCOUNT_TYPE_LABELS[account.account_type as keyof typeof ACCOUNT_TYPE_LABELS] || account.account_type}
                      </TableCell>
                      <TableCell>{account.bank_name || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(account.current_balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openAccountModal(account)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteAccount(account.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {accounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhuma conta cadastrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Organize suas receitas e despesas</CardDescription>
              </div>
              <Button onClick={() => openCategoryModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color || '#3B82F6' }}
                          />
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.type === 'receita' ? 'default' : 'secondary'}>
                          {TRANSACTION_TYPE_LABELS[category.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openCategoryModal(category)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!category.is_system && (
                            <Button variant="ghost" size="icon" onClick={() => deleteCategory(category.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Nenhuma categoria cadastrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Centers Tab */}
        <TabsContent value="costcenters">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Centros de Custo</CardTitle>
                <CardDescription>Separe custos por área ou projeto</CardDescription>
              </div>
              <Button onClick={() => openCostCenterModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Centro
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costCenters.map((cc) => (
                    <TableRow key={cc.id}>
                      <TableCell className="font-medium">{cc.name}</TableCell>
                      <TableCell>
                        {cc.code && <Badge variant="outline">{cc.code}</Badge>}
                      </TableCell>
                      <TableCell className="max-w-48 truncate">{cc.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openCostCenterModal(cc)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteCostCenter(cc.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {costCenters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum centro de custo cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Modal */}
      <Dialog open={accountModal.open} onOpenChange={(open) => setAccountModal({ ...accountModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{accountModal.item ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                placeholder="Ex: Conta Principal"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={accountForm.account_type} onValueChange={(v) => setAccountForm({ ...accountForm, account_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Banco</Label>
              <Input
                value={accountForm.bank_name}
                onChange={(e) => setAccountForm({ ...accountForm, bank_name: e.target.value })}
                placeholder="Ex: Itaú"
              />
            </div>
            <div className="space-y-2">
              <Label>Saldo Inicial (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={accountForm.initial_balance}
                onChange={(e) => setAccountForm({ ...accountForm, initial_balance: e.target.value })}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <Input
                type="color"
                value={accountForm.color}
                onChange={(e) => setAccountForm({ ...accountForm, color: e.target.value })}
                className="h-10 p-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountModal({ open: false, item: null })}>
              Cancelar
            </Button>
            <Button onClick={saveAccount}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={categoryModal.open} onOpenChange={(open) => setCategoryModal({ ...categoryModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{categoryModal.item ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ex: Honorários"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={categoryForm.type} 
                onValueChange={(v) => setCategoryForm({ ...categoryForm, type: v as 'receita' | 'despesa' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <Input
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                className="h-10 p-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryModal({ open: false, item: null })}>
              Cancelar
            </Button>
            <Button onClick={saveCategory}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cost Center Modal */}
      <Dialog open={costCenterModal.open} onOpenChange={(open) => setCostCenterModal({ ...costCenterModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{costCenterModal.item ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={costCenterForm.name}
                onChange={(e) => setCostCenterForm({ ...costCenterForm, name: e.target.value })}
                placeholder="Ex: Administrativo"
              />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={costCenterForm.code}
                onChange={(e) => setCostCenterForm({ ...costCenterForm, code: e.target.value })}
                placeholder="Ex: ADM"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={costCenterForm.description}
                onChange={(e) => setCostCenterForm({ ...costCenterForm, description: e.target.value })}
                placeholder="Despesas administrativas gerais"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCostCenterModal({ open: false, item: null })}>
              Cancelar
            </Button>
            <Button onClick={saveCostCenter}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceSettings;
