# Revisao Atual do OKEGANHA

## Modulos existentes

- Usuario (`/usuario/*`)
- Admin (`/admin/*`)
- RELA Business (`/rela/*`) como fluxo oficial de empresa
- Landing e auth publica de usuario (`/`, `/login`, `/cadastro`)

`/empresa/*` permanece como legado tecnico temporario.

## Rotas oficiais de empresa (RELA)

- `/rela`
- `/rela/login`
- `/rela/cadastro`
- `/rela/status`
- `/rela/dashboard`
- `/rela/campanhas`
- `/rela/campanhas/nova`
- `/rela/relatorios`
- `/rela/financeiro`
- `/rela/configuracoes`

## Legado tecnico temporario de empresa

- `/empresa/acesso` -> `/rela/login`
- `/empresa/login` -> `/rela/login`
- `/empresa/status` -> `/rela/status`
- `/empresa` -> `/rela/dashboard`
- Demais `/empresa/(painel)/*` mantidas para compatibilidade operacional.
