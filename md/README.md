# OKEGANHA

Aplicacao Next.js com tres modulos:
- Usuario final (OKEGANHA): `/`, `/login`, `/cadastro`, `/usuario/*`
- Empresas (RELA Business): `/rela/*`
- Admin interno: `/admin/*`

`/empresa/*` permanece apenas como legado tecnico temporario.

## Rodando localmente

```bash
npm install
npm run dev
```

## Scripts uteis

```bash
npm run check:copy
npm run prisma:seed
npm run db:audit
npm run db:fix-local
npm run build
```

## Credenciais locais padrao

- Admin: `admin@okeganha.com` / `Admin12345`
- Usuario: `usuario@okeganha.com` / `Usuario12345`
- Empresa: `empresa@okeganha.com` / `Empresa12345`

## Fluxo oficial de empresa (RELA)

- Empresa acessa `/rela/cadastro` para criar conta.
- Login empresarial em `/rela/login`.
- Conta inicia como `PENDING` e aparece em `/admin/empresas`.
- Admin aprova/reprova/bloqueia.
- Empresa `ACTIVE` acessa `/rela/dashboard`.
- Empresa nao ativa segue para `/rela/status`.

## Legado tecnico temporario

- `/empresa/acesso` -> `/rela/login`
- `/empresa/login` -> `/rela/login`
- `/empresa/status` -> `/rela/status`
- `/empresa` -> `/rela/dashboard`
