import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FolderOpen, FileText, Plus, ArrowRight } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { ACTION_TYPE_LABELS, PETITION_TYPE_LABELS } from '@/types/database';
import type { Database } from '@/integrations/supabase/types';

type ActionType = Database['public']['Enums']['action_type'];
type PetitionType = Database['public']['Enums']['petition_type'];

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    clients: 0,
    cases: 0,
    petitions: 0,
  });
  const [casesByType, setCasesByType] = useState<{ name: string; value: number; type: ActionType }[]>([]);
  const [petitionsByMonth, setPetitionsByMonth] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [clientsRes, casesRes, petitionsRes] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('cases').select('id, action_type'),
        supabase.from('petitions').select('id, created_at'),
      ]);

      setStats({
        clients: clientsRes.count || 0,
        cases: casesRes.data?.length || 0,
        petitions: petitionsRes.data?.length || 0,
      });

      // Process cases by action type
      if (casesRes.data) {
        const typeCounts: Record<ActionType, number> = {
          obrigacao_de_fazer: 0,
          cobranca: 0,
          indenizacao_danos_morais: 0,
        };
        casesRes.data.forEach((c) => {
          typeCounts[c.action_type as ActionType]++;
        });
        const chartData = (Object.entries(typeCounts) as [ActionType, number][])
          .filter(([_, count]) => count > 0)
          .map(([type, count]) => ({
            name: ACTION_TYPE_LABELS[type],
            value: count,
            type,
          }));
        setCasesByType(chartData);
      }

      // Process petitions by month (last 6 months)
      if (petitionsRes.data) {
        const monthCounts: Record<string, number> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthCounts[key] = 0;
        }
        petitionsRes.data.forEach((p) => {
          const date = new Date(p.created_at);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (key in monthCounts) {
            monthCounts[key]++;
          }
        });
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const chartData = Object.entries(monthCounts).map(([key, count]) => {
          const [year, month] = key.split('-');
          return {
            month: `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`,
            count,
          };
        });
        setPetitionsByMonth(chartData);
      }

      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Clientes',
      value: stats.clients,
      icon: Users,
      href: '/clients',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Processos',
      value: stats.cases,
      icon: FolderOpen,
      href: '/cases',
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      title: 'Petições',
      value: stats.petitions,
      icon: FileText,
      href: '/petitions',
      color: 'bg-green-500/10 text-green-600',
    },
  ];

  const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))'];

  const caseChartConfig = {
    obrigacao_de_fazer: { label: 'Obrigação de Fazer', color: 'hsl(var(--primary))' },
    cobranca: { label: 'Cobrança', color: 'hsl(var(--accent))' },
    indenizacao_danos_morais: { label: 'Indenização', color: 'hsl(var(--secondary))' },
  };

  const petitionChartConfig = {
    count: { label: 'Petições', color: 'hsl(var(--primary))' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Bem-vindo, {profile?.name?.split(' ')[0] || 'Advogado'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus clientes, processos e gere petições automaticamente.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {loading ? '...' : stat.value}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Action Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processos por Tipo de Ação</CardTitle>
            <CardDescription>Distribuição dos processos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Carregando...
              </div>
            ) : casesByType.length === 0 ? (
              <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
                <FolderOpen className="w-12 h-12 mb-2 opacity-50" />
                <p>Nenhum processo cadastrado</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/cases/new">Criar primeiro processo</Link>
                </Button>
              </div>
            ) : (
              <ChartContainer config={caseChartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={casesByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {casesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Petitions by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Petições por Período</CardTitle>
            <CardDescription>Petições geradas nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Carregando...
              </div>
            ) : petitionsByMonth.every((m) => m.count === 0) ? (
              <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="w-12 h-12 mb-2 opacity-50" />
                <p>Nenhuma petição gerada ainda</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/petitions/new">Gerar primeira petição</Link>
                </Button>
              </div>
            ) : (
              <ChartContainer config={petitionChartConfig} className="h-[250px]">
                <BarChart data={petitionsByMonth}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Comece a criar documentos jurídicos em poucos cliques
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/petitions/new">
              <Plus className="w-4 h-4 mr-2" />
              Nova Petição
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/clients/new">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/cases/new">
              <Plus className="w-4 h-4 mr-2" />
              Novo Processo
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
