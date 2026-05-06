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
