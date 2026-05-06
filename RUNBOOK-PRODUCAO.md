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
