# RELA BUSINESS SEPARATION PLAN

## Objetivo
Separar definitivamente:

- OKEGANHA (usuario final B2C)
- RELA Business (empresa B2B)
- Admin interno (operacao)

Mantendo backend compartilhado quando fizer sentido, com experiencias, rotas, auth e linguagem separadas.

---

## 1. Separacao de marcas

- **OKEGANHA** = app publico para usuario final
  - missoes
  - XP
  - energia
  - recompensas
  - caixa
  - perfil verificado

- **RELA Business** = produto B2B para empresas
  - campanhas
  - relatorios
  - metricas
  - orcamento
  - tokens/creditos
  - performance local
  - engajamento verificado

- **Admin** = operacao interna
  - aprovacao
  - antifraude
  - usuarios
  - empresas
  - saques
  - campanhas
  - auditoria

---

## 2. Rotas finais

### OKE (usuario final)
- `/`
- `/login`
- `/cadastro`
- `/usuario/*`

### RELA (empresa)
- `/rela`
- `/rela/login`
- `/rela/cadastro`
- `/rela/dashboard`
- `/rela/campanhas`
- `/rela/campanhas/nova`
- `/rela/relatorios`
- `/rela/financeiro`
- `/rela/configuracoes`

### Admin
- `/admin/login`
- `/admin/*`

---

## 3. Regras de auth e redirecionamento

### Usuario (USER)
- `/login` e `/cadastro` orientados a USER.
- USER autenticado vai para `/usuario/dashboard`.
- COMPANY tentando acessar `/usuario/*` redireciona para `/rela/dashboard`.
- ADMIN tentando acessar `/usuario/*` redireciona para `/admin`.

### Empresa (COMPANY)
- `/rela/login` e `/rela/cadastro` orientados a COMPANY.
- COMPANY autenticada vai para `/rela/dashboard`.
- USER tentando acessar `/rela/*` redireciona para `/usuario/dashboard`.
- ADMIN tentando acessar `/rela/*` redireciona para `/admin`.

### Admin (ADMIN)
- `/admin/login` exclusivo para ADMIN.
- ADMIN autenticado vai para `/admin`.
- USER/COMPANY nunca acessam `/admin/*`.

---

## 4. Cookies e sessoes

Meta de separacao:

- `okeganha_user_session`
- `rela_company_session`
- `okeganha_admin_session`

### Situacao atual
Se houver cookie unico hoje, manter funcional no curto prazo.

### Transicao segura (sem quebrar build)
1. Introduzir leitura multipla de cookie (novo + legado).
2. Escrever novo cookie por contexto de login (USER/COMPANY/ADMIN).
3. Middleware aceita legado por periodo de transicao.
4. Migrar paginas de login para emissao separada.
5. Remover legado apenas apos validacao completa de sessao.

---

## 5. Reaproveitamento vs refactor

### Manter/reaproveitar
- `Company`
- `Campaign`
- `Task`
- `TaskSubmission`
- `CompanyTokenLedger`
- dashboard tecnico antigo de empresa (base funcional)
- aprovacoes de admin
- tokens/plans
- reports

### Refazer
- layout
- copy
- navegacao
- onboarding da empresa
- dashboard da empresa
- paginas antigas `/empresa/*` para nova marca RELA

---

## 6. Linguagem proibida no RELA

Nao usar:

- ganhar dinheiro
- usuario ganhando
- app de recompensa
- XP
- energia
- caixa misteriosa
- cassino/jogo

Usar:

- engajamento verificado
- campanhas locais
- prova de entrega
- metricas transparentes
- crescimento regional
- performance
- alcance
- reputacao digital

---

## 7. Direcao visual RELA

Princípios:

- premium B2B
- dark elegante
- glass sofisticado
- paleta azul/roxo/ciano (ou preto/dourado, se aprovado)
- menos gamer
- mais executivo
- dashboard de performance
- percepcao de produto de alto valor para empresario

---

## 8. Dashboard RELA ideal

Blocos principais:

- campanhas ativas
- orcamento usado
- engajamentos entregues
- custo por acao
- status de analise
- tokens/creditos
- proximas recomendacoes
- relatorio resumido
- CTA forte: criar campanha

---

## 9. Fluxo da empresa (RELA)

1. Empresa cria conta.
2. Conta inicia com status `PENDING`.
3. Admin aprova empresa.
4. Empresa recebe/contrata plano e tokens.
5. Empresa cria campanha.
6. Campanha vai para analise.
7. Admin aprova campanha.
8. Missoes aparecem para usuarios finais.
9. Empresa acompanha metricas e performance.

---

## 10. Plano de execucao

### Fase 1
- Documentar e bloquear mistura de auth.
- Remover links de empresa da home OKE.
- Criar landing simples premium em `/rela`.
- Criar `/rela/login` separado.
- Mapear todo `/empresa` legado.

### Fase 2
- Migrar visual de `/empresa` para `/rela`.
- Criar RELA dashboard premium.
- Manter `/empresa` redirecionando para `/rela`.

### Fase 3
- Entregar relatorios, planos, tokens e campanhas em operacao real.

---

## Validacao continua

Em cada etapa:

- `npm run check:copy`
- `npm run db:audit`
- `npm run build`

---

## Escopo desta entrega

Somente documentacao.  
Nao aplicar migracao de rota/auth nesta etapa.
