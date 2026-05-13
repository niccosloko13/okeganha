# OKEGANHA — SKILL.md (Contexto Completo para Próxima Agente)

Este documento resume o estado atual do sistema OKEGANHA para acelerar onboarding de uma próxima agente técnica.

## 1) Visão Geral

OKE GANHA é uma plataforma com três áreas principais:
- Usuário final (`/usuario/*`): encontra campanhas, executa tarefas, envia comprovação, acompanha carteira e solicita saque.
- Empresa (RELA Business, `/rela/*`) [com `/empresa/*` como legado tecnico temporario]: cria intenção de campanha e usa plano/tokens.
- Admin (`/admin/*`): opera o negócio (aprovações, segurança, campanhas, saques, usuários, empresas).

Stack:
- Next.js App Router + TypeScript + Tailwind
- Prisma + PostgreSQL
- Sessão custom JWT em cookie + Auth.js (Google)

## 2) Regras de Acesso (Roles)

Roles no `User`:
- `USER`
- `ADMIN`
- `COMPANY`

Regras atuais:
- `/usuario/*` só para `USER` (`requireRegularUser`).
- `ADMIN` em área de usuário é redirecionado para `/admin/dashboard`.
- `COMPANY` em área de usuário é redirecionado para `/rela/dashboard` (se ACTIVE) ou `/rela/status`.
- `/admin/*` exige `ADMIN`.
- Sessão bloqueada: usuário `BLOCKED` é redirecionado para `/conta/bloqueada` e sessão é limpa.

Arquivos-chave:
- `lib/auth.ts`
- `proxy.ts`
- `lib/session.ts`, `lib/company-session.ts`, `lib/admin-impersonation-token.ts`

## 3) Fluxos Principais

### 3.1 Usuário
- Cadastro/login (email+senha e Google)
- Completar cadastro (CPF, Pix, banco) para saque
- Explorar campanhas válidas
- Abrir tarefa, iniciar sessão de execução, finalizar sessão, enviar prova
- Aprovação admin gera crédito em carteira
- Saque com validações + risco

### 3.2 Empresa
- Cadastro público (`/rela/login`), status inicial `PENDING`
- Admin aprova/reprova/bloqueia
- Dashboard/plano/tokens
- Criação de campanha (intenção) e revisão operacional no admin

### 3.3 Admin
- Aprovações de campanhas, tarefas e saques
- Gestão de usuários/empresas
- Segurança/antifraude
- Impersonação de empresa
- Relatórios

## 4) Campanhas: Consistência Operacional

Invariante crítica:
- Campanha **não pode** estar `ACTIVE` com `reviewStatus != APPROVED`.

Hardening aplicado:
- Travas em ações de ativação no backend (`admin-actions`).
- Script de correção de base:
  - `npm run db:fix-campaigns`
  - Script: `scripts/fix-campaign-status.js`

Queries de usuário devem sempre filtrar:
- `status = ACTIVE`
- `reviewStatus = APPROVED`
- janela de data válida (`startDate <= now <= endDate`)

## 5) Antifraude (Estado Atual)

### 5.1 Modelos antifraude
- `UserActivityLog` (expandido)
- `UserRiskEvent`
- `TaskSession`
- `UserDevice`
- `TaskExternalVerification`
- `WithdrawalRiskCheck`

### 5.2 Sessão de tarefa (anti-burla)
APIs:
- `POST /api/task-session/start`
- `POST /api/task-session/heartbeat`
- `POST /api/task-session/finish`

Componente client:
- `components/tarefas/TaskSessionPanel.tsx`

Comportamento:
- Heartbeat 1s
- Captura foco/visibilidade/blur
- Só finaliza com `activeDuration >= requiredDuration`
- Perda de foco excessiva gera risco

### 5.3 Bot/device
Helpers:
- `lib/device-fingerprint.ts`
- `lib/bot-detection.ts`
- integrado em `lib/anti-fraud.ts`

Sinais considerados (MVP):
- `navigator.webdriver`
- plugins zerados
- UA suspeito (headless/playwright/puppeteer)
- inconsistências básicas de fingerprint
- padrão de clique rápido

### 5.4 Score dinâmico
Função:
- `calculateUserRiskScore()` em `lib/anti-fraud.ts`

Faixas:
- 0–30 LOW
- 31–60 MEDIUM
- 61–80 HIGH
- 81–100 CRITICAL

Bloqueio automático:
- `score >= 85` -> `User.status = BLOCKED`, sessão invalidada, logs e redirecionamento para `/conta/bloqueada`.

### 5.5 Saque com camada antifraude
- `runWithdrawalRiskCheck()` antes de sacar.
- Decisão `ALLOW | REVIEW | BLOCK`.
- Persistência em `WithdrawalRiskCheck`.

## 6) Carteira / Financeiro

Garantias implementadas:
- Crédito duplicado protegido por regra de banco em `WalletTransaction`.
- Aprovação de submissão idempotente/transacional.
- Saque concorrente protegido por transação e recálculo interno de saldo.

Arquivos-chave:
- `app/actions/admin-actions.ts`
- `app/actions/user-actions.ts`
- `prisma/schema.prisma`

## 7) Admin: Observabilidade e Segurança

Novas telas:
- `/admin/antifraude`
- `/admin/logs-usuarios`

Navegação:
- adicionadas no `components/admin/AdminSidebar.tsx`

Detalhe usuário:
- aba `Antifraude` em `/admin/usuarios/[id]`

## 8) Scripts Operacionais

Disponíveis no `package.json`:
- `npm run check:copy` (detecção de mojibake)
- `npm run db:audit` (auditoria de consistência)
- `npm run db:fix-campaigns` (corrige ACTIVE sem APPROVED)
- `npm run db:fix-local` (sanidade local de roles)
- `npm run reset:password`
- `npm run build`

Prisma:
- `npx prisma generate`
- `npx prisma db push`

## 9) Auditoria (db:audit) — Checks Atuais

O script `scripts/audit-database.js` valida, entre outros:
- usuários por role
- `USER/ADMIN` com `companyId` indevido
- `COMPANY` sem `companyId`
- campanhas sem empresa
- campanhas `ACTIVE` sem `APPROVED`
- créditos duplicados por `referenceId`
- submissões órfãs
- aprovadas sem reward positivo
- logs suspeitos recentes
- bloqueados com login recente
- fingerprints compartilhados
- sessões com perda de foco excessiva

## 10) Segurança / LGPD

Diretrizes respeitadas:
- Sem senha de redes sociais
- Sem automação de redes sociais
- Sem scraping agressivo
- Verificação indireta por comportamento + comprovação + revisão admin
- Coleta mínima para segurança operacional

## 11) Limitações Conhecidas (MVP)

- Verificação externa (`TaskExternalVerification`) está no modo agendamento/registro inicial; falta worker/cron de execução contínua real.
- Fingerprint usa sinais básicos + placeholders (`canvasHash`/`webglHash` simplificados no client).
- `users blocked with active session` em audit é proxy por login recente (não rastreia sessão de browser em tabela dedicada).

## 12) Próximas Melhorias Recomendadas (Ordem)

P0:
1. Worker/cron para processar `TaskExternalVerification` vencida (+1d/+3d) e reação automática.
2. Persistência de sessão ativa de browser (session registry) para auditoria mais precisa.
3. Política automática para multi-conta (linkagem e ação em lote com revisão humana).

P1:
1. Fingerprint avançado (canvas/webgl reais, tolerância a mudanças legítimas).
2. Score antifraude calibrado por telemetria real (redução de falso positivo).
3. Dashboard admin com métricas agregadas por janela temporal.

P2:
1. Pipeline de investigação assistida para analista antifraude.
2. Regras adaptativas por categoria/plataforma de campanha.

## 13) Runbook Rápido para Próxima Agente

1. Validar ambiente:
- `.env` com `DATABASE_URL`, `SESSION_SECRET`, etc.

2. Sincronizar schema:
- `npx prisma generate`
- `npx prisma db push`

3. Sanear base:
- `npm run db:fix-campaigns`
- `npm run db:audit`

4. Garantir qualidade:
- `npm run check:copy`
- `npm run build`

## 14) Arquivos Mais Sensíveis (Ler Antes de Mudar)

- `prisma/schema.prisma`
- `lib/auth.ts`
- `lib/anti-fraud.ts`
- `app/actions/admin-actions.ts`
- `app/actions/user-actions.ts`
- `proxy.ts`
- `scripts/audit-database.js`

---

Se você é a próxima agente: preserve as invariantes financeiras e de role antes de qualquer alteração visual. Segurança e consistência têm prioridade sobre feature velocity.
