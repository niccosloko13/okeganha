# OKEGANHA-DOCS-CONSOLIDADO.md

> Documento único consolidado para handoff técnico e implementação.

---

## 0) Índice rápido

1. Visão geral
2. Estrutura e módulos
3. Regras críticas (invariantes)
4. Fluxos de negócio
5. API e contratos
6. Segurança e antifraude
7. Banco e migração
8. Operação e incidentes
9. Observabilidade
10. Teste local
11. Próximos passos
12. Instruções de agente

---



---

# Fonte: README.md

# OKEGANHA

Aplicação Next.js com três módulos principais: usuário, admin e empresa.

## Rodando localmente

```bash
npm install
npm run dev
```

## Scripts úteis

```bash
npm run check:copy
npm run prisma:seed
npm run db:audit
npm run db:fix-local
npm run build
```

## Resetar senha local

```bash
node scripts/reset-password.js conta.empresa@okeganha.com Empresa12345
```

## Credenciais locais padrão

- Admin: `admin@okeganha.com` / `Admin12345`
- Usuário: `usuario@okeganha.com` / `Usuario12345`
- Empresa: `empresa@okeganha.com` / `Empresa12345`

## Fluxo público da empresa

- Empresa acessa `/rela/login` para criar conta.
- Conta entra como `PENDING` e aparece em `/admin/empresas`.
- Admin aprova, reprova ou bloqueia.
- Somente empresa `ACTIVE` acessa `/rela/dashboard`.


---

# Fonte: README-INDEX.md

# README-INDEX.md

Índice central da documentação técnica do OKEGANHA.

## Leitura Rápida (onboarding)
1. [SKILL-QUICKSTART.md](./SKILL-QUICKSTART.md)
2. [SKILL.md](./SKILL.md)
3. [SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md)

## Operação e Incidentes
- [RUNBOOK-PRODUCAO.md](./RUNBOOK-PRODUCAO.md)
- [ADMIN-PLAYBOOK.md](./ADMIN-PLAYBOOK.md)
- [OBSERVABILITY.md](./OBSERVABILITY.md)

## Segurança e Antifraude
- [ANTIFRAUDE-RULEBOOK.md](./ANTIFRAUDE-RULEBOOK.md)
- [SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md)
- [API-CONTRACTS.md](./API-CONTRACTS.md)

## Banco e Migração
- [DB-CONSTRAINTS.md](./DB-CONSTRAINTS.md)
- [MIGRATION-PLAYBOOK.md](./MIGRATION-PLAYBOOK.md)

## Referência Geral
- [SKILL.md](./SKILL.md)
- [SKILL-QUICKSTART.md](./SKILL-QUICKSTART.md)

## Comandos úteis
- `npm run check:copy`
- `npm run db:fix-campaigns`
- `npm run db:audit`
- `npx prisma generate`
- `npx prisma db push`
- `npm run build`


---

# Fonte: REVISAO-ATUAL.md

# Revisão Atual do OKEGANHA

## Módulos existentes

- Usuário (`/usuario/*`)
- Admin (`/admin/*`)
- Empresa (`/empresa/*`)
- Landing + autenticação pública (`/`, `/login`, `/cadastro`, `/rela/login`)

## Rotas de usuário

- `/usuario/dashboard`
- `/usuario/campanhas`
- `/usuario/campanhas/[id]`
- `/usuario/tarefas`
- `/usuario/tarefas/[id]`
- `/usuario/carteira`
- `/usuario/saques`
- `/usuario/perfil`
- `/usuario/redes`
- `/usuario/completar-cadastro`

## Rotas de admin

- `/admin/dashboard`
- `/admin/campanhas`, `/admin/campanhas/nova`, `/admin/campanhas/[id]`
- `/admin/tarefas`
- `/admin/saques`
- `/admin/usuarios`, `/admin/usuarios/[id]`
- `/admin/empresas`, `/admin/empresas/nova`, `/admin/empresas/[id]`
- `/admin/seguranca`
- `/admin/relatorios`

## Rotas de empresa

- `/rela/login`
- `/rela/status`
- `/rela/dashboard`
- `/rela/campanhas`
- `/rela/campanhas/nova`
- `/rela/financeiro`

## Seed de teste

- Admin: `admin@okeganha.com` (role `ADMIN`)
- Usuário: `usuario@okeganha.com` (role `USER`)
- Empresa: `empresa@okeganha.com` (role `COMPANY` e `companyId` vinculado)
- Company teste: `ACTIVE`, plano `PREMIUM`, `tokensBalance=1500`
- Campanhas, tarefas, submissões, transações e saque pendente gerados
- Redes sociais de teste para usuário comum (manual, sem OAuth)

## Fluxo usuário -> tarefa -> carteira -> saque

1. Usuário escolhe campanha e tarefa.
2. Envia comprovação (`PENDING`).
3. Admin aprova (`APPROVED`) e gera crédito na carteira.
4. Usuário solicita saque (respeitando regras de saldo/validação).

## Fluxo empresa -> aprovação -> campanha -> tokens

1. Conta empresa criada com status inicial `PENDING`.
2. Admin aprova para `ACTIVE`.
3. Empresa cria campanha.
4. Tokens são consumidos nas operações da campanha conforme regras vigentes.

## Fluxo admin -> aprovação operacional

- Aprova/reprova/bloqueia empresas.
- Aprova/reprova tarefas enviadas.
- Aprova/marca pago/reprova saques.
- Ajusta tokens/plano da empresa.
- Pode usar impersonação de empresa para suporte operacional.

## Pendências conhecidas

- Conexões sociais do usuário estão em modo manual (sem OAuth).
- Verificação facial segue em modo mock.
- Pagamentos continuam manuais (sem gateway).
- Falta ampliar cobertura de testes automatizados.

## Próximos passos recomendados

1. Criar testes de integração para ações críticas (aprovação, saque, vínculos de role).
2. Implementar trilha de auditoria visual para todas as mutações do admin.
3. Evoluir conexão social para OAuth oficial por plataforma.
4. Adicionar monitoramento de antifraude em tempo real com alertas.


---

# Fonte: SKILL-QUICKSTART.md

# OKEGANHA — SKILL-QUICKSTART.md

Guia rápido para assumir o projeto sem perder contexto.

## 1) Comandos Essenciais

1. `npx prisma generate`
2. `npx prisma db push`
3. `npm run db:fix-campaigns`
4. `npm run db:audit`
5. `npm run check:copy`
6. `npm run build`

## 2) Invariantes Críticas (NÃO QUEBRAR)

1. Role e acesso:
- `/usuario/*` apenas `USER`
- `/admin/*` apenas `ADMIN`
- `COMPANY` nunca entra em fluxo de usuário (CPF/Pix)

2. Campanhas:
- Usuário só pode ver campanha com:
  - `status = ACTIVE`
  - `reviewStatus = APPROVED`
  - data válida (`startDate <= now <= endDate`)
- Nunca permitir `ACTIVE` sem `APPROVED`

3. Financeiro:
- Aprovação de tarefa não pode gerar crédito duplicado
- Saque deve ser atômico (sem saldo negativo/concorrrência)
- `SESSION_SECRET` obrigatório, sem fallback inseguro

4. Antifraude:
- Score dinâmico 0–100
- `score >= 85` bloqueia automaticamente
- Usuário `BLOCKED` não acessa `/usuario/*`

## 3) Arquivos Críticos

- `prisma/schema.prisma`
- `lib/auth.ts`
- `lib/anti-fraud.ts`
- `app/actions/user-actions.ts`
- `app/actions/admin-actions.ts`
- `proxy.ts`
- `scripts/audit-database.js`
- `scripts/fix-campaign-status.js`

## 4) Antifraude (Estado Atual)

Modelos:
- `UserActivityLog`
- `UserRiskEvent`
- `TaskSession`
- `UserDevice`
- `TaskExternalVerification`
- `WithdrawalRiskCheck`

Sessão de tarefa (API):
- `POST /api/task-session/start`
- `POST /api/task-session/heartbeat`
- `POST /api/task-session/finish`

Admin:
- `/admin/antifraude`
- `/admin/logs-usuarios`
- `/admin/usuarios/[id]tab=antifraude`

## 5) Fluxo Operacional Rápido

1. Rodar auditoria e corrigir inconsistências:
- `npm run db:fix-campaigns`
- `npm run db:audit`

2. Se auditoria mostrar `ACTIVE sem APPROVED > 0`:
- parar release
- corrigir base + revisar actions de ativação

3. Antes de entregar qualquer alteração:
- `npm run check:copy`
- `npm run build`

## 6) Limitações Conhecidas

- Verificação externa (+1d/+3d) está em estado de agendamento/registro inicial; falta worker real de execução.
- Fingerprint ainda é MVP (sem coleta avançada completa de canvas/webgl).

## 7) Próximo Passo Recomendado (P0)

Implementar worker/cron para processar `TaskExternalVerification` vencidas e aplicar reação automática (risco, retenção de saque, alertas admin).


---

# Fonte: SKILL.md

# OKEGANHA — SKILL.md (Contexto Completo para Próxima Agente)

Este documento resume o estado atual do sistema OKEGANHA para acelerar onboarding de uma próxima agente técnica.

## 1) Visão Geral

OKE GANHA é uma plataforma com três áreas principais:
- Usuário final (`/usuario/*`): encontra campanhas, executa tarefas, envia comprovação, acompanha carteira e solicita saque.
- Empresa (`/empresa/*`): cria intenção de campanha e usa plano/tokens.
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


---

# Fonte: DB-CONSTRAINTS.md

# DB-CONSTRAINTS.md

## Invariantes de Banco
1. Campanha ativa para usuário exige:
- `Campaign.status = ACTIVE`
- `Campaign.reviewStatus = APPROVED`

2. Crédito por submissão:
- Não pode duplicar (`WalletTransaction` protegida por unicidade)

3. Roles:
- `companyId` só para `User.role = COMPANY`
- `USER/ADMIN` sem `companyId`

4. Saque:
- Sem saldo negativo
- Operação atômica de hold + request

5. Usuário bloqueado:
- Não acessa `/usuario/*`
- Sessão inválida

## Scripts de Sanidade
- `npm run db:audit`
- `npm run db:fix-campaigns`
- `npm run db:fix-local`


---

# Fonte: API-CONTRACTS.md

# API-CONTRACTS.md

## POST /api/task-session/start
Body:
- `taskId: string`

Resposta sucesso:
- `{ ok: true, session: { id, requiredDuration, activeDuration, focusLossCount } }`

## POST /api/task-session/heartbeat
Body:
- `sessionId: string`
- `isVisible: boolean`
- `isFocused: boolean`
- `focusLossIncrement: 0|1`
- `deviceFingerprint` (opcional)

Resposta sucesso:
- `{ ok: true, session, canFinish }`

## POST /api/task-session/finish
Body:
- `sessionId: string`

Resposta sucesso:
- `{ ok: true, session }`

## Server Actions críticas
- `submitTaskProofAction`
- `requestWithdrawalAction`
- `approveSubmission`
- `approveCampaignReview`

Regra: backend nunca confia no frontend para status sensível.


---

# Fonte: SECURITY-CHECKLIST.md

# SECURITY-CHECKLIST.md

## Pré-release
- [ ] `SESSION_SECRET` configurado
- [ ] `npm run check:copy` OK
- [ ] `npm run db:audit` OK
- [ ] `npm run build` OK

## Auth/Authz
- [ ] `/usuario/*` só USER
- [ ] `/admin/*` só ADMIN
- [ ] `/empresa/*` só COMPANY ativo

## Backend Safety
- [ ] Todas actions críticas com validação Zod
- [ ] Idempotência em aprovação de tarefa
- [ ] Saque protegido contra concorrência
- [ ] Bloqueio automático crítico testado

## Privacidade/LGPD
- [ ] Sem coleta de senha externa
- [ ] Sem scraping agressivo
- [ ] Logs limitados ao necessário de segurança


---

# Fonte: ANTIFRAUDE-RULEBOOK.md

# ANTIFRAUDE-RULEBOOK.md

## Objetivo
Definir regras, thresholds e resposta operacional do antifraude.

## Faixas de Score
- 0–30: LOW
- 31–60: MEDIUM
- 61–80: HIGH
- 81–100: CRITICAL
- Bloqueio automático: score >= 85

## Sinais Atuais
- Mais de 5 envios de comprovação em menos de 2 min
- Mais de 3 solicitações de saque em menos de 10 min
- Tentativas repetidas de rota proibida
- Texto de comprovação repetido
- Muitos dispositivos em curto prazo
- Fingerprint compartilhado entre contas
- Sessões com perda de foco excessiva

## Regras de Ação
- LOW: registrar apenas
- MEDIUM: registrar + monitorar
- HIGH: bloquear saque + revisão manual
- CRITICAL: bloquear conta automaticamente + invalidar sessão

## Falso Positivo (playbook)
1. Revisar logs em `/admin/logs-usuarios`
2. Revisar aba antifraude do usuário
3. Confirmar origem (IP/device/frequência)
4. Se legítimo, desbloquear e registrar nota interna
5. Ajustar regra se houver padrão recorrente de falso positivo

## Não Fazer
- Não coletar senha de rede social
- Não automatizar redes sociais
- Não bloquear por evento fraco isolado


---

# Fonte: RUNBOOK-PRODUCAO.md

# RUNBOOK-PRODUCAO.md

## Incidente: campanha inconsistente
Sintoma: ACTIVE sem APPROVED.

Passos:
1. `npm run db:audit`
2. `npm run db:fix-campaigns`
3. Reexecutar `npm run db:audit`
4. Validar dashboard usuário

## Incidente: usuário bloqueado indevidamente
1. Abrir `/admin/usuarios/[id]tab=antifraude`
2. Revisar eventos e logs recentes
3. Se falso positivo: desbloquear + nota interna
4. Registrar caso em `AdminAuditLog`

## Incidente: saque travado
1. Verificar `WithdrawalRiskCheck`
2. Verificar score e motivos
3. Confirmar onboarding/identidade
4. Reprocessar manualmente se for caso legítimo

## Incidente: build falha
1. `npm run check:copy`
2. `npx prisma generate`
3. `npm run build`
4. Corrigir tipagem/encoding antes de merge


---

# Fonte: ADMIN-PLAYBOOK.md

# ADMIN-PLAYBOOK.md

## Rotina diária
1. Abrir `/admin/antifraude`
2. Revisar alertas HIGH/CRITICAL
3. Abrir `/admin/logs-usuarios` para timeline
4. Revisar pendências de tarefa e saque

## Aprovação de tarefa
- Confirmar prova adequada
- Evitar dupla aprovação
- Em suspeita, reprovar com motivo claro

## Saques
- Validar score de risco + identidade
- Se HIGH, manter bloqueado para revisão

## Empresas
- Aprovar apenas cadastros consistentes
- Em fraude/abuso, bloquear e registrar auditoria

## Impersonação
- Usar apenas para diagnóstico
- Encerrar após uso


---

# Fonte: MIGRATION-PLAYBOOK.md

# MIGRATION-PLAYBOOK.md

## Fluxo seguro de migração
1. Atualizar `prisma/schema.prisma`
2. `npx prisma generate`
3. `npx prisma db push`
4. `npm run db:audit`
5. `npm run build`

## Regras
- Nunca subir schema quebrando invariantes financeiras
- Antes de ativar regra nova, criar script de correção de dados
- Validar index/unique em tabelas de transação

## Rollback prático
- Pausar deploy
- Restaurar branch estável
- Reaplicar push de schema compatível
- Rodar audit completo


---

# Fonte: OBSERVABILITY.md

# OBSERVABILITY.md

## Métricas essenciais
- Campanhas ACTIVE sem APPROVED
- Créditos duplicados por referenceId
- Saques bloqueados por risco
- Usuários bloqueados por CRITICAL
- Eventos suspeitos por dia
- Sessões com foco perdido excessivo

## Alertas recomendados
- `ACTIVE sem APPROVED > 0`
- `Crédito duplicado > 0`
- `Bloqueios CRITICAL acima de baseline`
- `Falha de build em main`

## Consultas operacionais
- `npm run db:audit`
- `/admin/antifraude`
- `/admin/logs-usuarios`

## SLO interno sugerido
- 100% de consistência de campanha ativa
- 0 duplicidade financeira
- tempo de resposta para revisão de bloqueio: < 24h


---

# Fonte: TESTE-LOCAL.md

# Teste local de conta empresa

## Criar empresa pública

1. Abra `http://localhost:3000/rela/login`.
2. Vá na aba **Criar conta empresa**.
3. Preencha os campos obrigatórios.

Exemplos para teste:

- CNPJ (formato): `12.345.678/0001-99`
- WhatsApp (formato): `(13) 99741-0019`

Ao enviar com sucesso:

- a empresa é criada com status `PENDING`,
- o usuário COMPANY é criado com senha hash (nunca texto puro),
- o sistema redireciona para `/rela/status`.

## Aprovação admin

1. Entre como admin.
2. Abra `http://localhost:3000/admin/empresas`.
3. A empresa recém-criada aparece com status `PENDING`.
4. Use a ação **Aprovar** para liberar o painel completo.


---

# Fonte: AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
