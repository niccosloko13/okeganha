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
