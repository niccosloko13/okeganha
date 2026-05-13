# RELA PROGRESS

## Status atual

RELA Business esta ativo dentro do app principal como fluxo oficial de empresa.
OKEGANHA usuario final permanece separado.
Admin interno permanece separado.

## Rotas RELA ativas

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
- `/rela/suporte`

## Fluxo auth empresarial aplicado

- Login COMPANY em `/rela/login`
- Cadastro COMPANY em `/rela/cadastro`
- COMPANY `ACTIVE` -> `/rela/dashboard`
- COMPANY `PENDING/REJECTED/BLOCKED` -> `/rela/status`
- USER tentando acessar RELA -> `/usuario/dashboard`
- ADMIN tentando acessar RELA -> `/admin`

## Legado tecnico temporario

- `/empresa/acesso` -> `/rela/login`
- `/empresa/login` -> `/rela/login`
- `/empresa/status` -> `/rela/status`
- `/empresa` -> `/rela/dashboard`
- `/empresa/(painel)/*` mantido temporariamente para compatibilidade operacional.

## Proximos passos

1. Migrar visual restante de `/empresa/(painel)/*` para padrao RELA.
2. Encerrar legado `/empresa/*` quando operacao estiver 100% estabilizada em `/rela/*`.
3. Atualizar toda documentacao operacional para RELA como padrao definitivo de empresa.
