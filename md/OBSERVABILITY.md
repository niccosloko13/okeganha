# OBSERVABILITY.md

## Métricas essenciais
- Campanhas ACTIVE sem APPROVED
- Créditos duplicados por referenceId
- Saques bloqueados por risco
- Usuários bloqueados por CRITICAL
- Eventos suspeitos por dia
- Sessões com foco perdido excessivo

## Alertas recomendados
- `ACTIVE sem APPROVED > 0`
- `Crédito duplicado > 0`
- `Bloqueios CRITICAL acima de baseline`
- `Falha de build em main`

## Consultas operacionais
- `npm run db:audit`
- `/admin/antifraude`
- `/admin/logs-usuarios`

## SLO interno sugerido
- 100% de consistência de campanha ativa
- 0 duplicidade financeira
- tempo de resposta para revisão de bloqueio: < 24h
