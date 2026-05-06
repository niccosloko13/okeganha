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

- Empresa acessa `/empresa/acesso` para criar conta.
- Conta entra como `PENDING` e aparece em `/admin/empresas`.
- Admin aprova, reprova ou bloqueia.
- Somente empresa `ACTIVE` acessa `/empresa/dashboard`.
