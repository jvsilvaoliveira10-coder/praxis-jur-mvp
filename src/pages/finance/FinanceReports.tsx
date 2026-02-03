import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DREReport } from '@/components/finance/reports/DREReport';
import { CashFlowReport } from '@/components/finance/reports/CashFlowReport';
import { ClientAnalysisReport } from '@/components/finance/reports/ClientAnalysisReport';
import { OverdueReport } from '@/components/finance/reports/OverdueReport';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  BarChart3,
  FolderOpen,
  Repeat
} from 'lucide-react';

const FinanceReports = () => {
  const [activeTab, setActiveTab] = useState('dre');

  const reports = [
    { 
      id: 'dre', 
      label: 'DRE', 
      icon: FileText, 
      description: 'Demonstrativo de Resultado' 
    },
    { 
      id: 'cashflow', 
      label: 'Fluxo de Caixa', 
      icon: TrendingUp, 
      description: 'Receitas e despesas mensais' 
    },
    { 
      id: 'clients', 
      label: 'Por Cliente', 
      icon: Users, 
      description: 'Análise de faturamento' 
    },
    { 
      id: 'overdue', 
      label: 'Inadimplência', 
      icon: AlertTriangle, 
      description: 'Títulos em atraso' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Relatórios Financeiros</h1>
        <p className="text-muted-foreground">
          Análises gerenciais e demonstrativos do escritório
        </p>
      </div>

      {/* Report Selection Cards for Mobile */}
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        {reports.map((report) => (
          <Card 
            key={report.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeTab === report.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveTab(report.id)}
          >
            <CardContent className="p-4 text-center">
              <report.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-medium text-sm">{report.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for Desktop */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden lg:block">
        <TabsList className="grid w-full grid-cols-4">
          {reports.map((report) => (
            <TabsTrigger 
              key={report.id} 
              value={report.id}
              className="flex items-center gap-2"
            >
              <report.icon className="h-4 w-4" />
              {report.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Report Content */}
      <div className="mt-6">
        {activeTab === 'dre' && <DREReport />}
        {activeTab === 'cashflow' && <CashFlowReport />}
        {activeTab === 'clients' && <ClientAnalysisReport />}
        {activeTab === 'overdue' && <OverdueReport />}
      </div>
    </div>
  );
};

export default FinanceReports;
