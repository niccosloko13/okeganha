# ADMIN_MODERNIZATION_PLAN

## Objetivo

Modernizar a area Admin para refletir a arquitetura atual com OKEGANHA (usuario), RELA (empresa) e operacao interna.

## Rotas admin existentes

- `/admin/dashboard`
- `/admin/campanhas`
- `/admin/campanhas/nova`
- `/admin/campanhas/[id]`
- `/admin/tarefas`
- `/admin/saques`
- `/admin/usuarios`
- `/admin/usuarios/[id]`
- `/admin/empresas`
- `/admin/empresas/nova`
- `/admin/empresas/[id]`
- `/admin/antifraude`
- `/admin/logs-usuarios`
- `/admin/seguranca`
- `/admin/relatorios`

## Pontos legados/antigos

- Visual com forte heranca do tema antigo claro.
- Linguagem visual pouco segmentada por contexto (moderacao, risco, financeiro).
- Faltam atalhos operacionais por fila (pendencias de saque, pendencias de empresa, pendencias de campanha).

## Relacao com dominios do sistema

- Usuarios: bloqueio/desbloqueio, revisoes, historico.
- Empresas RELA: aprovacao de status, plano, tokens e suporte.
- Campanhas: aprovacao, pausa, consistencia operacional.
- Missoes/tarefas: revisao de submissao e idempotencia de credito.
- Saques: aprovacao, bloqueio e auditoria.
- Antifraude: score, eventos, logs de sessao.
- Social connect: estado declarativo e revisao futura.

## Ordem recomendada de modernizacao

1. **Shell/Admin Nav**
   - tema dark executivo
   - agrupamento por dominio (Operacao, Risco, Financeiro)
2. **Dashboard operacional**
   - filas pendentes por prioridade
   - cards de risco e saques em destaque
3. **Empresas RELA**
   - funil PENDING -> ACTIVE/REJECTED/BLOCKED
4. **Campanhas e missoes**
   - pipeline de aprovacao com filtros rapidos
5. **Antifraude e logs**
   - timeline consolidada por usuario e por evento
6. **Relatorios**
   - resumo executivo para operacao diaria

## Regras de auth

- Login admin oficial: `/admin/login` e `/admin`.
- ADMIN nunca deve ser enviado para `/login` de usuario.
- USER sem permissao em `/admin/*` deve ir para `/login`.
- COMPANY sem permissao em `/admin/*` deve ir para `/rela/login`.

## Pendencias tecnicas

- Revisar componentes admin para remover strings antigas com encoding inconsistente.
- Unificar componentes de tabela e cards para reduzir divergencia visual.
- Definir bibliotecas de grafico (ou placeholders consistentes) para relatorios.
