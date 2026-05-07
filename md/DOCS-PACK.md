# DOCS-PACK.md

Pacote de documentação recomendado para repasse técnico do projeto OKEGANHA.

## 1) Visão geral rápida (15-30 min)
1. `README.md`
2. `README-INDEX.md`
3. `REVISAO-ATUAL.md`

Objetivo: entender módulos, rotas principais e estado funcional atual.

## 2) Regras críticas do sistema (obrigatório)
1. `SKILL-QUICKSTART.md`
2. `SKILL.md`
3. `DB-CONSTRAINTS.md`
4. `SECURITY-CHECKLIST.md`

Objetivo: não quebrar invariantes de role, campanha ativa/aprovada e fluxo financeiro.

## 3) Backend e contratos
1. `API-CONTRACTS.md`
2. `ANTIFRAUDE-RULEBOOK.md`
3. `OBSERVABILITY.md`

Objetivo: implementar APIs e antifraude com comportamento compatível.

## 4) Operação, incidentes e rotina
1. `RUNBOOK-PRODUCAO.md`
2. `ADMIN-PLAYBOOK.md`
3. `MIGRATION-PLAYBOOK.md`

Objetivo: padronizar operação diária, resposta a incidentes e mudanças de schema.

## 5) Testes locais e handoff
1. `TESTE-LOCAL.md`
2. `AGENTS.md`

Objetivo: validar fluxo empresa/admin localmente e alinhar instruções de agentes.

## Checklist mínimo antes de iniciar implementação
- Ler blocos 1 e 2 completos.
- Validar comandos essenciais: `npx prisma generate`, `npx prisma db push`, `npm run db:audit`, `npm run build`.
- Confirmar invariantes:
  - campanha para usuário: `ACTIVE + APPROVED + janela de data válida`
  - `COMPANY` fora do fluxo `/usuario/*`
  - saque e aprovação sem duplicidade financeira

## Observações de qualidade de docs
- O conjunto está organizado e coerente para repasse.
- Existem pequenas inconsistências de link em duas rotas de docs (faltando `?`):
  - `/admin/usuarios/[id]tab=antifraude`
- Recomendação: ajustar para `/admin/usuarios/[id]?tab=antifraude` em:
  - `SKILL-QUICKSTART.md`
  - `RUNBOOK-PRODUCAO.md`
