

# Conformidade LGPD - Cookies e Privacidade

## Situacao Atual

O site atualmente **nao possui**:
- Banner de consentimento de cookies
- Pagina de Politica de Privacidade
- Pagina de Termos de Uso
- Links para essas paginas no rodape
- Mecanismo de gerenciamento de consentimento do usuario

O unico cookie utilizado atualmente e o `sidebar:state` (funcional, para manter o estado da sidebar).

---

## O Que Sera Implementado

### 1. Banner de Consentimento de Cookies
- Componente flutuante na parte inferior da tela, exibido na primeira visita
- Opcoes: "Aceitar Todos", "Apenas Necessarios" e "Configurar"
- Salva a preferencia no `localStorage` para nao exibir novamente
- Design discreto e responsivo (mobile e desktop)

### 2. Pagina de Politica de Privacidade (`/privacidade`)
- Conteudo em portugues cobrindo os requisitos da LGPD:
  - Dados coletados e finalidade
  - Base legal para tratamento
  - Direitos do titular (acesso, correcao, exclusao, portabilidade)
  - Cookies utilizados e suas finalidades
  - Compartilhamento com terceiros (Stripe, etc.)
  - Contato do encarregado (DPO)
  - Retencao e seguranca dos dados

### 3. Pagina de Termos de Uso (`/termos`)
- Conteudo basico cobrindo:
  - Descricao do servico
  - Responsabilidades do usuario e da plataforma
  - Limitacao de responsabilidade (peticoes geradas por IA)
  - Propriedade intelectual
  - Rescisao e cancelamento

### 4. Atualizacao do Rodape
- Adicionar links para "Politica de Privacidade" e "Termos de Uso" no `LandingFooter`

---

## Detalhes Tecnicos

### Arquivos a criar:
- `src/components/cookie/CookieConsentBanner.tsx` - Componente do banner
- `src/pages/PrivacyPolicy.tsx` - Pagina de politica de privacidade
- `src/pages/TermsOfService.tsx` - Pagina de termos de uso

### Arquivos a modificar:
- `src/App.tsx` - Adicionar rotas `/privacidade` e `/termos`
- `src/components/landing/LandingFooter.tsx` - Adicionar links
- `src/pages/Index.tsx` ou `src/components/layout/MainLayout.tsx` - Incluir o banner de cookies

### Abordagem:
- **Sem integracao externa necessaria** - O consentimento sera gerenciado via `localStorage`
- O banner nao bloqueia a navegacao (modelo de consentimento "soft")
- Nenhum cookie de rastreamento/analytics esta sendo usado atualmente, entao o risco e baixo, mas o banner e obrigatorio pela LGPD para transparencia

