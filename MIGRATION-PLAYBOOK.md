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
