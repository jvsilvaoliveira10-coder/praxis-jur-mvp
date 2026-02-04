

# Plano: Correção de Cache + Visualização Completa de Jurisprudência

## Resumo Executivo

Este plano combina duas melhorias críticas:
1. **Correção do parser de data** - para que o cache local funcione corretamente
2. **Visualização detalhada dos acórdãos** - para que o advogado saiba o que está selecionando antes de usar na petição

---

## Problema 1: Cache Falha por Formato de Data

### Diagnóstico
A API Datajud retorna datas no formato compacto (`20251224000000`), mas o código atual assume formato ISO (`2025-12-24T00:00:00`).

**Linha problemática (220-222):**
```typescript
// ATUAL - falha com formato compacto
const dataJulgamento = acordaoMovimento?.dataHora
  ? acordaoMovimento.dataHora.split('T')[0]  // "20251224000000".split('T') = ["20251224000000"]
  : source.dataAjuizamento?.split('T')[0] || null;
```

### Solução
Criar parser robusto que aceita múltiplos formatos:

```typescript
function parseDatajudDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  
  // Formato ISO: "2025-12-24T00:00:00" ou "2025-12-24"
  if (dateStr.includes('-')) {
    return dateStr.split('T')[0];
  }
  
  // Formato compacto: "20251224000000" ou "20251224"
  if (dateStr.length >= 8 && /^\d+$/.test(dateStr)) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  
  return null;
}
```

---

## Problema 2: Advogado Não Sabe o Que Está Selecionando

### Situação Atual
- A ementa aparece com `line-clamp-6` (apenas 6 linhas visíveis)
- Não há como expandir para ler a ementa completa
- Dados vindos da API Datajud têm ementa limitada (apenas assuntos/movimentações)
- Não há modal de detalhes para analisar o acórdão antes de selecionar

### Solução: Modal de Detalhes Expandido

Criar um modal/sheet que mostra:
- **Ementa completa** (sem limite de linhas)
- **Decisão/Resumo** quando disponível
- **Metadados completos** (relator, órgão, datas, classe)
- **Assuntos do processo**
- **Referências legais citadas**
- **Link para o processo no STJ** (quando disponível)
- **Botão "Usar na petição"** diretamente no modal

---

## Arquitetura da Solução

```text
+------------------+     +--------------------+     +-------------------+
| STJResultCard    |     | STJDetailSheet     |     | Formulário        |
| (lista resumida) |---->| (modal detalhado)  |---->| de Petição        |
+------------------+     +--------------------+     +-------------------+
    - 6 linhas ementa      - Ementa completa        - Jurisprudência
    - Clique "Ver mais"    - Decisão/Notas          selecionada
    - Badge fonte          - Link STJ oficial
                           - Botão "Usar"
```

---

## Implementação Detalhada

### Fase 1: Correção do Parser de Data

**Arquivo:** `supabase/functions/search-stj-jurisprudence/index.ts`

**Mudanças:**
1. Adicionar função `parseDatajudDate()` após linha 75
2. Atualizar `mapDatajudToAcordao()` para usar o novo parser (linhas 220-222)
3. Aplicar também na `data_publicacao` (linha 232)

### Fase 2: Novo Componente de Detalhes

**Arquivo:** `src/components/jurisprudence/STJDetailSheet.tsx` (CRIAR)

**Funcionalidades:**
- Sheet/modal lateral que abre ao clicar "Ver detalhes"
- Exibe ementa completa com scroll
- Mostra todos os metadados organizados
- Seção de assuntos/palavras-chave
- Seção de referências legais
- Botão "Usar na petição" em destaque
- Link para processo no portal do STJ (quando disponível)

**Estrutura do componente:**
```typescript
interface STJDetailSheetProps {
  acordao: STJAcordao | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (acordao: STJAcordao) => void;
  isSelected: boolean;
}
```

### Fase 3: Atualização do Card de Resultado

**Arquivo:** `src/components/jurisprudence/STJResultCard.tsx`

**Mudanças:**
1. Adicionar botão "Ver detalhes" ao lado de "Usar na petição"
2. Passar callback para abrir o sheet de detalhes
3. Corrigir badge duplicado "STJ STJ" (linha 35-36)

### Fase 4: Integração na Página

**Arquivo:** `src/components/jurisprudence/STJResults.tsx`

**Mudanças:**
1. Adicionar estado para controlar o sheet (acordão selecionado para visualização)
2. Renderizar `STJDetailSheet` com o acordão selecionado
3. Passar callbacks para os cards abrirem o sheet

---

## Fluxo do Usuário (Após Implementação)

1. Advogado busca "danos morais"
2. Lista de resultados aparece (cards resumidos com 6 linhas de ementa)
3. Advogado clica em **"Ver detalhes"** em um card interessante
4. Sheet lateral abre com:
   - Ementa completa (scrollável)
   - Relator, órgão, datas formatadas
   - Palavras-chave/assuntos
   - Referências legais
   - Link para portal STJ
5. Advogado lê e decide: clica **"Usar na petição"**
6. Sheet fecha, card aparece como "Selecionado"
7. Ao criar petição, jurisprudência selecionada é incluída automaticamente

---

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/functions/search-stj-jurisprudence/index.ts` | Modificar | Adicionar parser de data robusto |
| `src/components/jurisprudence/STJDetailSheet.tsx` | Criar | Modal de detalhes do acórdão |
| `src/components/jurisprudence/STJResultCard.tsx` | Modificar | Adicionar botão "Ver detalhes", corrigir badge |
| `src/components/jurisprudence/STJResults.tsx` | Modificar | Integrar sheet de detalhes |

---

## Ordem de Execução

1. Corrigir parser de data na Edge Function (cache funciona)
2. Deploy da Edge Function
3. Testar que cache está funcionando
4. Criar componente `STJDetailSheet`
5. Atualizar `STJResultCard` com botão de detalhes
6. Integrar sheet na página de resultados
7. Testar fluxo completo end-to-end

---

## Seção Técnica

### Parser de Data Robusto

```typescript
function parseDatajudDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  
  const cleaned = String(dateStr).trim();
  
  // Formato ISO: "2025-12-24T00:00:00" ou "2025-12-24"
  if (cleaned.includes('-')) {
    return cleaned.split('T')[0];
  }
  
  // Formato compacto: "20251224000000" ou "20251224"
  if (cleaned.length >= 8 && /^\d+$/.test(cleaned)) {
    const year = cleaned.substring(0, 4);
    const month = cleaned.substring(4, 6);
    const day = cleaned.substring(6, 8);
    
    // Validação básica
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${year}-${month}-${day}`;
    }
  }
  
  return null;
}
```

### Estrutura do Sheet de Detalhes

```typescript
// STJDetailSheet.tsx
const STJDetailSheet = ({ acordao, isOpen, onClose, onSelect, isSelected }: Props) => {
  if (!acordao) return null;

  const stjUrl = acordao.processo 
    ? `https://processo.stj.jus.br/processo/pesquisa/?termo=${acordao.processo}`
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{acordao.classe} {acordao.processo}</SheetTitle>
          <SheetDescription>Detalhes do Acórdão STJ</SheetDescription>
        </SheetHeader>

        {/* Metadados */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <InfoItem icon={User} label="Relator" value={acordao.relator} />
          <InfoItem icon={Building} label="Órgão" value={acordao.orgao_julgador} />
          <InfoItem icon={Calendar} label="Julgamento" value={formatDate(acordao.data_julgamento)} />
          <InfoItem icon={BookOpen} label="Publicação" value={formatDate(acordao.data_publicacao)} />
        </div>

        {/* Ementa Completa */}
        <div className="space-y-2">
          <h4 className="font-semibold">Ementa</h4>
          <ScrollArea className="h-[300px] rounded border p-4">
            <p className="text-sm whitespace-pre-wrap">{acordao.ementa}</p>
          </ScrollArea>
        </div>

        {/* Palavras-chave */}
        {acordao.palavras_destaque?.length > 0 && (
          <div className="space-y-2 pt-4">
            <h4 className="font-semibold text-sm">Assuntos/Palavras-chave</h4>
            <div className="flex flex-wrap gap-1">
              {acordao.palavras_destaque.map((p, i) => (
                <Badge key={i} variant="secondary">{p}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Referências Legais */}
        {acordao.referencias_legais?.length > 0 && (
          <div className="space-y-2 pt-4">
            <h4 className="font-semibold text-sm">Referências Legais</h4>
            <ul className="text-sm space-y-1">
              {acordao.referencias_legais.map((ref, i) => (
                <li key={i}>{ref}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Ações */}
        <SheetFooter className="pt-6 gap-2">
          {stjUrl && (
            <Button variant="outline" asChild>
              <a href={stjUrl} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver no STJ
              </a>
            </Button>
          )}
          <Button onClick={() => onSelect(acordao)} variant={isSelected ? "secondary" : "default"}>
            {isSelected ? (
              <><Check className="mr-2 h-4 w-4" /> Selecionado</>
            ) : (
              <><Plus className="mr-2 h-4 w-4" /> Usar na petição</>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
```

---

## Benefícios

| Benefício | Descrição |
|-----------|-----------|
| **Cache funcionando** | Acórdãos importados são salvos para buscas futuras |
| **Decisão informada** | Advogado lê ementa completa antes de selecionar |
| **Acesso ao original** | Link direto para o processo no portal STJ |
| **UX aprimorada** | Modal organizado com todas as informações |
| **Menos cliques** | Botão "Usar na petição" direto no modal |

---

## Correções Adicionais

1. **Badge duplicado "STJ STJ"** na linha 35-36 do STJResultCard.tsx - será corrigido
2. **Ementa vazia da API Datajud** - melhorar fallback para usar assuntos de forma mais informativa

