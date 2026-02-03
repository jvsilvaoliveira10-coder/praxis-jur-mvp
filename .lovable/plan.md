
# Plano: Landing Page 360 - Hub Completo para Advogados

## Objetivo

Atualizar a landing page existente para comunicar que o Práxis AI é uma plataforma 360° completa, onde o advogado pode gerenciar todo o escritório em um único lugar: produção jurídica, gestão de processos (CRM), acompanhamento e gestão financeira.

---

## Diagnóstico da Estrutura Atual

### Ordem das Seções Existentes
1. Header (navegação)
2. HeroSection (headline + CTAs)
3. ProblemSection (3 problemas)
4. FeaturesSection (8 funcionalidades jurídicas)
5. HowItWorksSection (4 passos)
6. AISection (destaque IA)
7. SecuritySection (segurança)
8. TargetAudienceSection (público-alvo)
9. FAQSection (perguntas)
10. CTASection (call to action final)
11. Footer

### O que Falta Comunicar
- Gestão de Processos estilo Kanban/CRM
- Dashboard financeiro profissional
- Controle de receitas e despesas
- Relatórios gerenciais
- Contratos de honorários
- Conceito de "hub único" / "plataforma 360"

---

## Parte 1: Atualização do HeroSection

### Novo Headline e Subtítulo

De:
- Título: "Petições jurídicas em minutos, não em horas"
- Subtítulo: "Plataforma inteligente para advogados brasileiros. Gere petições com IA, organize modelos e acompanhe processos automaticamente."

Para:
- Título: "Seu escritório completo em uma só plataforma"
- Subtítulo: "Hub 360° para advogados brasileiros. Gere petições com IA, gerencie processos como projetos, controle suas finanças e tenha visão total do seu negócio."

### Novos Trust Indicators
Substituir os 3 indicadores atuais por:
1. "Gestão jurídica + financeira integrada"
2. "100% adaptado ao foro brasileiro"
3. "Sem cartão de crédito"

---

## Parte 2: Expandir ProblemSection

### Adicionar 4º Problema (Financeiro)

Problemas atuais (3):
1. Tempo perdido
2. Desorganização
3. Acompanhamento manual

Novo problema a adicionar:
```
{
  icon: Calculator,
  title: 'Controle financeiro precário',
  description: 'Planilhas espalhadas, inadimplência não monitorada e falta de visão sobre a saúde financeira do escritório.'
}
```

Layout: Mudar de 3 colunas para 4 colunas (2x2 no mobile)

---

## Parte 3: Reorganizar FeaturesSection

### Nova Estrutura com Tabs/Categorias

Em vez de 8 cards genéricos, organizar em 3 módulos com visual de tabs ou seções distintas:

**Módulo 1: Produção Jurídica (8 features existentes - cor primária/teal)**
- Geração com IA
- Upload de Modelos
- IA que Aprende
- Pastas Organizadas
- Pesquisa de Jurisprudência
- Exportação em PDF

**Módulo 2: Gestão de Processos (6 novas features - cor azul)**
```
{
  icon: Kanban,
  title: 'Pipeline Kanban',
  description: 'Visualize todos os processos em etapas customizáveis, do primeiro contato ao encerramento.'
},
{
  icon: ListChecks,
  title: 'Checklists por Processo',
  description: 'Nunca esqueça uma tarefa. Crie checklists personalizados para cada caso.'
},
{
  icon: History,
  title: 'Histórico de Atividades',
  description: 'Registro automático de todas as movimentações e alterações em cada processo.'
},
{
  icon: CalendarDays,
  title: 'Visualização em Calendário',
  description: 'Veja prazos e compromissos de todos os processos em uma única agenda.'
},
{
  icon: Bell,
  title: 'Acompanhamento Automático',
  description: 'Monitoramento via DataJud com notificações de novas movimentações.'
},
{
  icon: Flag,
  title: 'Prioridades e Prazos',
  description: 'Defina prioridades e prazos por etapa para nunca perder um deadline.'
}
```

**Módulo 3: Gestão Financeira (6 novas features - cor verde)**
```
{
  icon: Wallet,
  title: 'Contas a Receber',
  description: 'Controle de honorários, consultas e valores pendentes com alertas de vencimento.'
},
{
  icon: Receipt,
  title: 'Contas a Pagar',
  description: 'Gestão de despesas operacionais, custas processuais e vencimentos.'
},
{
  icon: TrendingUp,
  title: 'Fluxo de Caixa',
  description: 'Visão em tempo real do dinheiro entrando e saindo, com projeções futuras.'
},
{
  icon: FileSignature,
  title: 'Contratos de Honorários',
  description: 'Gestão de contratos recorrentes com geração automática de cobranças.'
},
{
  icon: BarChart3,
  title: 'Dashboard Avançado',
  description: 'Métricas, gráficos e indicadores para tomar decisões informadas.'
},
{
  icon: FileSpreadsheet,
  title: 'Relatórios Gerenciais',
  description: 'DRE, análise de inadimplência, ROI por cliente e exportação em PDF.'
}
```

### Design da Seção
- Header com 3 botões/tabs de navegação: "Produção Jurídica" | "Gestão de Processos" | "Financeiro"
- Cards aparecem em grid ao clicar em cada tab
- Animação de transição suave entre tabs
- Badge colorido em cada card indicando o módulo

---

## Parte 4: Nova Seção - ProcessManagementSection

### Criar Componente Dedicado para o CRM/Kanban

**Arquivo:** `src/components/landing/ProcessManagementSection.tsx`

**Posição:** Entre FeaturesSection e HowItWorksSection

**Estrutura:**
```
+--------------------------------------------------+
|  [Badge: Gestão de Processos]                    |
|                                                  |
|  Acompanhe cada caso do início ao fim            |
|                                                  |
|  Descrição sobre o pipeline Kanban               |
+--------------------------------------------------+

[Grid 2 colunas]

Coluna 1 (Mockup do Kanban):
  - Visual estilizado do board Kanban
  - 4 colunas: Consulta | Documentação | Protocolado | Encerrado
  - Cards simulados com nomes e badges
  - Seta indicando movimento de arrastar

Coluna 2 (Benefícios):
  - Visualize processos em etapas claras
  - Arraste cards para atualizar status
  - Checklists para não esquecer tarefas
  - Histórico completo de movimentações
  - Prazos por etapa com alertas
  - Múltiplas visualizações: Kanban, Lista, Calendário

[Botão: Experimentar Gestão de Processos]
```

### Design Visual
- Fundo com gradiente sutil (bg-muted/30)
- Mockup do Kanban com cards coloridos simulando um board real
- Animação de entrada com useInView

---

## Parte 5: Nova Seção - FinanceSection

### Criar Componente Dedicado para o Módulo Financeiro

**Arquivo:** `src/components/landing/FinanceSection.tsx`

**Posição:** Após AISection

**Estrutura:**
```
+--------------------------------------------------+
|  [Badge: Gestão Financeira]                      |
|                                                  |
|  Controle total das finanças do seu escritório   |
|                                                  |
|  Descrição sobre o dashboard financeiro          |
+--------------------------------------------------+

[Grid 2 colunas]

Coluna 1 (Lista de benefícios):
  - Dashboard com métricas em tempo real
  - Receitas, despesas e lucro líquido
  - Alertas de inadimplência automáticos
  - Fluxo de caixa projetado
  - Contratos de honorários recorrentes
  - Relatórios DRE e análise por cliente
  - Tudo integrado com seus clientes e processos

Coluna 2 (Mockup do Dashboard):
  - Visual estilizado do dashboard financeiro
  - 4 cards de métricas (Receita, Despesa, Lucro, Saldo)
  - Mini gráfico de barras representando fluxo de caixa
  - Cards com cores diferenciadas (verde para receita, vermelho para despesa)

[Botão: Conhecer Módulo Financeiro]
```

### Design Visual
- Layout inverso da ProcessManagementSection (mockup à direita, texto à esquerda)
- Fundo com gradiente de verde sutil
- Cards com cores verde/vermelho para representar finanças
- Animação de entrada com useInView

---

## Parte 6: Nova Seção - IntegrationSection

### Mostrar a Integração entre Módulos

**Arquivo:** `src/components/landing/IntegrationSection.tsx`

**Posição:** Entre FinanceSection e SecuritySection

**Estrutura:**
```
+--------------------------------------------------+
|  Uma plataforma, três módulos integrados         |
|                                                  |
|  Tudo conectado, tudo em um só lugar             |
+--------------------------------------------------+

[Diagrama visual com 3 círculos interconectados]

  +---------------+
  |   Produção    |
  |   Jurídica    |
  +-------+-------+
          |
    +-----+-----+
    |           |
+---v---+   +---v---+
| Gestão |   |Gestão |
|Processos|  |Financ.|
+---+---+   +---+---+
    |           |
    +-----+-----+
          |
    [Cliente no centro]

[Texto explicativo em 3 colunas]

Coluna 1: Produção + Processos
- Petições vinculadas ao caso no pipeline
- Ao gerar petição, tarefa marcada como concluída
- Documentos organizados por processo

Coluna 2: Processos + Financeiro
- Honorários vinculados ao processo
- Custas processuais registradas
- Saldo e ROI por caso

Coluna 3: Financeiro + Produção
- Cliente com histórico financeiro
- Receitas por tipo de peça
- Produtividade vs faturamento
```

### Design Visual
- Fundo neutro (bg-card)
- Ícones conectados por linhas pontilhadas animadas
- Cards com exemplos de integração
- Animação de entrada sequencial

---

## Parte 7: Atualizar TargetAudienceSection

### Adicionar Benefícios Financeiros e de Gestão

**Audiência 1 - Advogados Autônomos:**
Benefícios atuais + novos:
- Mais tempo para captar clientes
- Redução de custos operacionais
- Maior competitividade
- **Controle financeiro sem planilhas** (novo)
- **Visão clara de cada processo** (novo)

**Audiência 2 - Pequenos Escritórios:**
Benefícios atuais + novos:
- Padronização de documentos
- Onboarding acelerado
- Gestão centralizada
- **Dashboard financeiro compartilhado** (novo)
- **Pipeline visual para toda equipe** (novo)

**Audiência 3 - Advogados de Volume:**
Benefícios atuais + novos:
- Escala sem aumento de equipe
- Menor custo por peça
- Consistência na produção
- **Relatórios de rentabilidade** (novo)
- **Identificação de gargalos** (novo)

---

## Parte 8: Atualizar FAQSection

### Adicionar 4 Novas Perguntas

```
{
  question: 'A plataforma substitui meu software financeiro?',
  answer: 'O módulo financeiro do Práxis AI foi desenvolvido especificamente para 
  escritórios de advocacia, com funcionalidades como controle de honorários, custas 
  processuais, contratos recorrentes e DRE. Para a maioria dos advogados autônomos 
  e pequenos escritórios, ele é suficiente.'
},
{
  question: 'Como funciona a gestão de processos estilo Kanban?',
  answer: 'Você visualiza todos os seus processos em um quadro com colunas representando 
  cada etapa (Consulta Inicial, Documentação, Protocolado, etc.). Basta arrastar o card 
  do processo para a próxima etapa. O sistema registra automaticamente o histórico de 
  movimentações e você pode adicionar checklists e prazos.'
},
{
  question: 'Posso ver quanto lucro cada cliente me gera?',
  answer: 'Sim! O módulo de relatórios permite analisar receitas e custos por cliente 
  e por processo, mostrando o ROI de cada relacionamento. Isso ajuda a identificar 
  clientes rentáveis e processos que dão prejuízo.'
},
{
  question: 'Os módulos funcionam de forma integrada?',
  answer: 'Sim! Ao cadastrar um cliente, você já pode vincular honorários. Ao acompanhar 
  um processo no pipeline, você vê as custas lançadas e o saldo financeiro. Ao gerar 
  uma petição, a tarefa no checklist é marcada como concluída. Tudo conectado.'
}
```

---

## Parte 9: Atualizar Header e Footer

### LandingHeader - Novos Links

De:
```
- Funcionalidades
- Como Funciona
- Segurança
- FAQ
```

Para:
```
- Funcionalidades (âncora para features)
- Gestão de Processos (âncora para nova seção)
- Financeiro (âncora para nova seção financeira)
- FAQ
```

### LandingFooter

Atualizar descrição:
De: "Práxis AI é uma plataforma de produtividade para advogados."

Para: "Práxis AI é a plataforma completa para advogados: produção jurídica, gestão de processos e controle financeiro em um só lugar."

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/landing/ProcessManagementSection.tsx` | Seção destacando CRM/Kanban |
| `src/components/landing/FinanceSection.tsx` | Seção destacando módulo financeiro |
| `src/components/landing/IntegrationSection.tsx` | Seção mostrando integração dos módulos |

---

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/pages/Index.tsx` | Importar e adicionar novas seções na ordem correta |
| `src/components/landing/HeroSection.tsx` | Atualizar headline, subtítulo e trust indicators |
| `src/components/landing/ProblemSection.tsx` | Adicionar 4º problema (financeiro), ajustar layout |
| `src/components/landing/FeaturesSection.tsx` | Reorganizar em 3 módulos com tabs/categorias |
| `src/components/landing/TargetAudienceSection.tsx` | Adicionar benefícios de gestão e financeiro |
| `src/components/landing/FAQSection.tsx` | Adicionar 4 novas perguntas |
| `src/components/landing/LandingHeader.tsx` | Atualizar links de navegação |
| `src/components/landing/LandingFooter.tsx` | Atualizar descrição |

---

## Nova Ordem das Seções

1. Header (navegação atualizada)
2. **HeroSection** (headline 360 atualizado)
3. **ProblemSection** (4 problemas, incluindo financeiro)
4. **FeaturesSection** (3 módulos em tabs: Jurídico, Processos, Financeiro)
5. **ProcessManagementSection** (NOVA - destaque do CRM/Kanban)
6. HowItWorksSection (mantém)
7. AISection (mantém)
8. **FinanceSection** (NOVA - destaque do módulo financeiro)
9. **IntegrationSection** (NOVA - integração dos módulos)
10. SecuritySection (mantém)
11. **TargetAudienceSection** (com benefícios adicionais)
12. **FAQSection** (com 4 novas perguntas)
13. CTASection (mantém)
14. Footer (descrição atualizada)

---

## Design e Consistência Visual

### Padrões a Manter
- Animações de entrada com useInView
- Tipografia serif para títulos (font-serif font-bold)
- Cards com hover:shadow-lg
- Badges coloridos para categorias
- Gradientes sutis de fundo
- Transições com duration-700 e delays escalonados

### Cores por Módulo
- **Produção Jurídica**: Cor primária (teal) - já em uso
- **Gestão de Processos**: Azul (blue-500/blue-600) - associado a organização
- **Financeiro**: Verde (green-500/green-600) - associado a dinheiro

### Ícones Novos (do lucide-react)
- Kanban (para pipeline)
- ListChecks (para checklists)
- History (para histórico)
- CalendarDays (para calendário)
- Flag (para prioridades)
- Wallet (para carteira)
- Receipt (para recibo)
- TrendingUp (para crescimento)
- BarChart3 (para gráficos)
- FileSpreadsheet (para relatórios)
- FileSignature (para contratos)
- Calculator (para financeiro/problemas)

---

## Mockups Visuais

### Mockup do Kanban (ProcessManagementSection)
```
+---------------+  +---------------+  +---------------+  +---------------+
| Consulta      |  | Documentação  |  | Protocolado   |  | Encerrado     |
| Inicial (3)   |  | (2)           |  | (4)           |  | (8)           |
+---------------+  +---------------+  +---------------+  +---------------+
|               |  |               |  |               |  |               |
| +----------+  |  | +----------+  |  | +----------+  |  | +----------+  |
| | Maria S. |  |  | | João P.  |  |  | | Empresa  |  |  | | Pedro R. |  |
| | [Alta]   |  |  | | [Média]  |  |  | | ABC      |  |  | | [Baixa]  |  |
| +----------+  |  | +----------+  |  | +----------+  |  | +----------+  |
|               |  |               |  |               |  |               |
+---------------+  +---------------+  +---------------+  +---------------+
```

### Mockup do Dashboard Financeiro (FinanceSection)
```
+-------------------+  +-------------------+
| Receita do Mês    |  | Despesas do Mês   |
| R$ 45.000         |  | R$ 18.000         |
| +15.2%            |  | +3.5%             |
+-------------------+  +-------------------+

+-------------------+  +-------------------+
| Lucro Líquido     |  | Saldo Total       |
| R$ 27.000         |  | R$ 85.000         |
| +28.4%            |  | +12.1%            |
+-------------------+  +-------------------+

[Gráfico de barras: Receitas vs Despesas últimos 6 meses]
```

---

## Mensagens de Marketing

### Proposta de Valor Principal
"Seu escritório completo em uma só plataforma"

### Taglines por Módulo
- **Produção**: "Petições em minutos com IA que aprende seu estilo"
- **Processos**: "Visualize cada caso do primeiro contato ao encerramento"
- **Financeiro**: "Controle total das finanças sem planilhas"

### Chamadas para Ação
- "Começar Gratuitamente"
- "Experimentar Gestão de Processos"
- "Conhecer Módulo Financeiro"
- "Criar Conta Gratuita"

---

## Resultado Esperado

1. **Posicionamento 360°** - Visitante entende que Práxis é uma solução completa
2. **Diferenciação clara** - Destaca-se de ferramentas que só fazem uma coisa
3. **Valor percebido aumentado** - Justifica pagamento futuro por entregar mais
4. **Clareza nos módulos** - Jurídico, Processos e Financeiro claramente explicados
5. **Consistência visual** - Novas seções no mesmo estilo elegante das existentes
6. **Conversão otimizada** - Mais motivos para o visitante criar conta
7. **Educação do usuário** - Visitante sai sabendo tudo que a plataforma oferece
