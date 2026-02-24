
# Plano: 4 Funcionalidades Premium para o Praxis Jur

## Visao Geral

Implementar 4 funcionalidades que elevam o nivel da plataforma:
1. **Assistente IA no Chat** - Chatbot juridico flutuante
2. **Dashboard Executivo com IA** - Resumo inteligente diario
3. **Editor de Peticoes Avancado** - Rich-text com formatacao juridica
4. **Exportar Peticoes como DOCX** - Documento Word formatado

---

## 1. Assistente IA no Chat

Um chatbot flutuante (botao no canto inferior direito) que o advogado pode abrir a qualquer momento para tirar duvidas sobre legislacao, prazos, e receber orientacao juridica baseada nos dados do escritorio.

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/legal-chat/index.ts` | Edge function que recebe mensagens, consulta a base juridica local (RAG) e chama a Lovable AI para responder |
| `src/components/chat/LegalChatWidget.tsx` | Componente flutuante principal (botao + painel de chat) |
| `src/components/chat/ChatMessage.tsx` | Componente de renderizacao de mensagem com suporte a markdown |
| `src/components/chat/ChatInput.tsx` | Input com envio por Enter e botao |

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/layout/MainLayout.tsx` | Adicionar `<LegalChatWidget />` no layout |
| `supabase/config.toml` | Registrar a nova edge function `legal-chat` com `verify_jwt = false` |

### Logica da Edge Function `legal-chat`

1. Receber mensagens do usuario + historico recente (ultimas 10 mensagens)
2. Detectar se a pergunta envolve legislacao (palavras-chave: "artigo", "lei", "codigo", "sumula")
3. Se sim, fazer RAG: chamar `search_legal_references` e `search_stj_acordaos` para buscar contexto real
4. Montar system prompt especializado em direito brasileiro, incluindo contexto RAG
5. Chamar Lovable AI (`google/gemini-3-flash-preview`) com streaming SSE
6. Retornar stream para o frontend

### Logica do Widget Frontend

- Botao flutuante no canto inferior direito com icone de chat e badge "IA"
- Ao clicar, abre painel lateral (400px de largura) com historico de mensagens
- Mensagens renderizadas com `react-markdown` (citacoes de lei em destaque)
- Streaming token-by-token igual ao padrao ja implementado no `usePetitionGeneration`
- Historico mantido apenas em memoria (useState), sem persistencia no banco
- Sugestoes rapidas ao abrir: "Qual o prazo para contestacao?", "Resumo do Art. 5 CF", "Diferenca entre agravo e apelacao"

---

## 2. Dashboard Executivo com IA

Adicionar um card de "Resumo Inteligente" no topo do Dashboard que analisa os dados do escritorio e gera alertas e insights automaticamente.

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/dashboard-insights/index.ts` | Edge function que coleta dados do usuario e gera insights com IA |
| `src/components/dashboard/AIInsightsCard.tsx` | Card premium com os insights gerados pela IA |

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Dashboard.tsx` | Adicionar o `<AIInsightsCard />` apos o header de boas-vindas |
| `supabase/config.toml` | Registrar `dashboard-insights` com `verify_jwt = false` |

### Logica da Edge Function `dashboard-insights`

1. Autenticar usuario via JWT
2. Consultar dados agregados:
   - Prazos vencendo nos proximos 7 dias (`deadlines`)
   - Processos parados ha mais de 30 dias sem movimentacao (`tracked_processes`)
   - Contas a receber atrasadas (`receivables` com status `atrasado`)
   - Processos no pipeline sem atividade recente (`case_pipeline`)
   - Total de peticoes geradas no mes
3. Montar prompt com os dados reais e chamar Lovable AI (`google/gemini-2.5-flash-lite`) em modo nao-streaming
4. Usar tool calling para retornar JSON estruturado com:
   - `alerts`: array de alertas urgentes (prazo vencendo, inadimplencia)
   - `insights`: array de observacoes (processos parados, tendencias)
   - `suggestions`: array de sugestoes de acao
5. Retornar JSON ao frontend

### Logica do Card Frontend

- Card com gradiente sutil e icone de Sparkles
- Secoes: "Alertas" (vermelho/amarelo), "Insights" (azul), "Sugestoes" (verde)
- Botao "Atualizar Analise" para regenerar
- Skeleton loading durante a geracao
- Cache local: armazenar no localStorage com TTL de 4 horas para nao gerar a cada page load

---

## 3. Editor de Peticoes Avancado

Substituir o `<Textarea>` atual do editor de peticoes por um editor rich-text baseado em TipTap (leve, extensivel, React-friendly).

### Dependencias Novas

- `@tiptap/react` - Core React do TipTap
- `@tiptap/starter-kit` - Kit basico (bold, italic, headings, lists, blockquote)
- `@tiptap/extension-underline` - Sublinhado
- `@tiptap/extension-text-align` - Alinhamento de texto
- `@tiptap/extension-placeholder` - Placeholder

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/editor/RichTextEditor.tsx` | Editor TipTap com toolbar juridica |
| `src/components/editor/EditorToolbar.tsx` | Barra de ferramentas com botoes de formatacao |
| `src/components/editor/editor-styles.css` | Estilos CSS do editor (tipografia juridica) |

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/PetitionForm.tsx` | Substituir o `<Textarea>` na aba "Editor" (linhas 857-865) pelo `<RichTextEditor>`. Converter conteudo entre texto puro e HTML |

### Funcionalidades do Editor

- **Toolbar**: Negrito, Italico, Sublinhado, Titulos (H1-H3), Lista numerada, Lista com marcadores, Citacao (blockquote), Alinhamento (esquerda, centro, direita, justificado)
- **Estilo juridico**: Fonte serif (Times), espacamento 1.5, paragrafos identados
- **Atalhos**: Ctrl+B (negrito), Ctrl+I (italico), Ctrl+U (sublinhado)
- **Conversao**: Ao receber texto puro da IA, converter paragrafos em `<p>`, cabecalhos em `<h2>`, etc. Ao salvar, manter como HTML no banco

### Notas Tecnicas

- O conteudo gerado pela IA vem como texto puro. O editor fara uma conversao automatica: detectar linhas em maiusculas como `<h2>`, numeracao romana como `<h3>`, e paragrafos normais como `<p>`
- O campo `content` na tabela `petitions` ja e `text`, entao vai aceitar HTML sem problemas
- A exportacao PDF e DOCX trabalhara a partir do HTML

---

## 4. Exportar Peticoes como DOCX

Adicionar botao "Exportar Word" ao lado do "Exportar PDF" existente, gerando um .docx formatado com cabecalho do escritorio.

### Dependencias Novas

- `docx` - Biblioteca para gerar arquivos .docx programaticamente
- `file-saver` - Para disparar o download no browser

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/lib/docx-export.ts` | Funcao `exportToDocx(content, title, firmSettings)` que gera o arquivo Word |

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/PetitionForm.tsx` | Adicionar botao "Exportar Word" ao lado do PDF. Importar e chamar `exportToDocx` |

### Estrutura do DOCX Gerado

```text
+----------------------------------+
|  [LOGO]  Nome do Escritorio      |
|  OAB/UF - Telefone - Email       |
|  Endereco completo               |
|----------------------------------|
|                                  |
|  EXCELENTISSIMO SENHOR DOUTOR    |
|  JUIZ DE DIREITO DA...           |
|                                  |
|  [Conteudo da peticao]           |
|                                  |
|  Local, data.                    |
|                                  |
|  ___________________________     |
|  Nome do Advogado                |
|  OAB/UF                          |
+----------------------------------+
```

### Logica do `docx-export.ts`

1. Receber `content` (HTML do editor), `title`, e `firmSettings`
2. Parsear o HTML em blocos (paragrafos, headings, listas)
3. Para cada bloco, criar o equivalente em `docx.Paragraph` com formatacao:
   - Titulos: fonte Times, 14pt, negrito, centralizado
   - Paragrafos: fonte Times, 12pt, justificado, identacao de primeira linha
   - Citacoes: italico, recuado
4. Adicionar cabecalho com dados do escritorio (logo se disponivel via URL)
5. Adicionar rodape com assinatura
6. Gerar e disparar download

---

## Secao Tecnica - Detalhes de Implementacao

### Edge Functions - Headers CORS

Ambas as novas edge functions (`legal-chat` e `dashboard-insights`) seguem o mesmo padrao CORS ja usado nas funcoes existentes.

### Modelo de IA por Funcionalidade

| Funcionalidade | Modelo | Justificativa |
|---------------|--------|---------------|
| Chat juridico | `google/gemini-3-flash-preview` | Respostas rapidas, custo baixo, bom para Q&A |
| Dashboard insights | `google/gemini-2.5-flash-lite` | Mais barato, analise simples de dados estruturados |

### Conversao Texto Puro -> HTML (para o editor)

```text
Regras de conversao:
- Linha toda em MAIUSCULAS -> <h2>
- Linha comecando com "I -", "II -", etc. -> <h3>
- Linha comecando com "Art." -> <p class="legal-article">
- Linha vazia -> quebra de paragrafo
- Demais linhas -> <p>
```

### Ordem de Implementacao Sugerida

1. Editor Rich-Text (base para as outras funcionalidades)
2. Exportar DOCX (depende do editor para HTML)
3. Assistente IA no Chat (independente)
4. Dashboard Executivo com IA (independente)

### Pacotes NPM Necessarios

```
@tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-placeholder docx file-saver
```

Tipos TypeScript: `@types/file-saver`
