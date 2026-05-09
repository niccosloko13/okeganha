# OKEGANHA USER CLEANUP REPORT

## Objetivo da rodada
Deixar o OKEGANHA focado em usuario final, removendo exposicao visual e copy B2B da experiencia publica e da area do usuario, sem apagar legado de empresa.

## Links/copy B2B encontrados
- Referencia a "campanhas ativas" na home publica (`app/page.tsx`).
- Fluxo de login COMPANY em `/login` enviando para dashboards/status de empresa diretamente.
- Rotas legadas de empresa existentes no backend (`/empresa/*`) e auth interno.

## Arquivos alterados
- `app/page.tsx`
- `app/actions/auth-actions.ts`
- `lib/auth.ts`

## O que foi removido/ajustado no OKEGANHA
- Home publica:
  - copy alterada de "campanhas ativas" para "missoes ativas".
- Auth em `/login`:
  - COMPANY agora e redirecionado para ponto unico legado: `/empresa/acesso`.
  - Evita qualquer queda no fluxo do usuario final.
- Guards de auth (acesso indevido de COMPANY em area USER/ADMIN):
  - redirecionamento padronizado para `/empresa/acesso`.

## O que foi mantido como legado para RELA
- Rotas `/empresa/*` continuam operacionais (nao removidas).
- Backend de empresa/campanha/tarefa mantido.
- Modelos `Company`, `Campaign`, `Task`, `TaskSubmission` e afins mantidos.

## Navegacao do usuario final
- A navegacao premium em `GamificationShell` permanece com:
  - Inicio
  - Missoes
  - Caixa
  - Carteira
  - Perfil
  - Redes
  - Sair

## Pendencias antes de iniciar /rela
- Criar rotas dedicadas:
  - `/rela`
  - `/rela/login`
  - `/rela/cadastro`
- Migrar fluxo legado `/empresa/acesso` para `/rela/login`.
- Consolidar cookies/sessoes separadas por contexto (USER/COMPANY/ADMIN), conforme plano tecnico.
