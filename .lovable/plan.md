

# Modelos do Escritorio como Base para IA

## Situacao Atual

O sistema ja tem:
- Tabela `petition_templates` onde o advogado cadastra modelos
- No formulario de peticao, um dropdown para selecionar um modelo ativo
- A edge function `generate-petition` ja recebe `templateContent` e injeta no prompt como "MODELO DO ESCRITORIO"

Porem, a experiencia atual tem lacunas:
1. O advogado so pode criar modelos pelo editor de texto -- nao pode **subir um arquivo** (DOCX/PDF)
2. O template so e usado se o advogado manualmente selecionar no dropdown
3. Nao ha auto-matching: se o tipo de peticao bate com um modelo, deveria sugerir automaticamente

## Melhorias Propostas

### 1. Upload de Arquivos de Modelos

Permitir que o advogado faca upload de arquivos `.docx` e `.txt` na pagina de criacao de template (`/templates/new`), alem do editor manual. O conteudo do arquivo sera extraido e inserido no campo de conteudo do template.

### 2. Auto-sugestao de Modelo

Quando o advogado selecionar o tipo de peticao no formulario, se existir um modelo ativo do mesmo tipo, exibir um banner sugerindo usa-lo automaticamente como base para a IA.

### 3. Indicador Visual no Formulario

Mostrar claramente quando um modelo do escritorio sera usado como base, com badge "Usando modelo do escritorio" e preview resumido.

---

## Secao Tecnica

### Arquivos Modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/TemplateForm.tsx` | Adicionar zona de upload (DOCX/TXT) usando react-dropzone; extrair texto e preencher o editor |
| `src/pages/PetitionForm.tsx` | Auto-selecionar template quando `petition_type` bater com um modelo ativo; banner de sugestao |
| `supabase/functions/extract-template/index.ts` | (Novo) Edge function para extrair texto de DOCX usando a lib `mammoth` no Deno |

### Upload de DOCX - Fluxo

1. Advogado arrasta um `.docx` ou `.txt` na zona de upload em `/templates/new`
2. Para `.txt`: leitura direta no browser via `FileReader`
3. Para `.docx`: enviar para edge function `extract-template` que usa `mammoth` para converter DOCX para HTML/texto
4. Conteudo extraido e inserido no RichTextEditor para revisao antes de salvar

### Auto-sugestao no PetitionForm

```text
Quando petition_type muda:
  -> Filtrar templates ativos do mesmo piece_type
  -> Se encontrar 1+ template:
     -> Mostrar banner: "Voce tem X modelo(s) para este tipo de peticao. Usar como base?"
     -> Ao clicar, auto-seleciona o primeiro (ou abre seletor se >1)
  -> Template selecionado e passado para a IA no campo templateContent (ja funciona)
```

### Edge Function: extract-template

Nova edge function para processar uploads DOCX:

```typescript
// supabase/functions/extract-template/index.ts
// Recebe o arquivo DOCX como base64
// Usa mammoth para converter para HTML
// Retorna o HTML extraido
```

### Dependencias

- `react-dropzone` (ja instalado no projeto)
- Nenhuma nova dependencia frontend necessaria
- `mammoth` via esm.sh no edge function para parsing DOCX

### Nenhuma alteracao de banco

A tabela `petition_templates` ja suporta tudo que precisamos -- o campo `content` (text) armazena o conteudo do modelo independente de como foi criado (digitado ou uploaded).

