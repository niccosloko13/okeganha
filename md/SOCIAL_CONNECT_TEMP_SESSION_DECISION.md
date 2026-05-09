# SOCIAL CONNECT TEMP SESSION DECISION

## Objetivo
Pausar a implementacao complexa de social connect permanente e registrar a decisao tecnica do MVP.

## Decisao
Para o MVP do OKEGANHA:

- nao salvar senha
- nao salvar cookie sensivel
- nao manter sessao social permanente

Modelo escolhido: **Social Connect temporario / ephemeral session**.

## Fluxo planejado (MVP + proxima fase)
1. Usuario entra no OKEGANHA.
2. Vai em Redes.
3. Clica conectar Instagram/TikTok/Facebook.
4. Futuramente o sistema abre sessao isolada/local.
5. Usuario faz login manualmente na rede social.
6. O sistema valida apenas que a sessao esta ativa e qual username esta logado.
7. Durante aquela sessao do OKEGANHA, as missoes sociais ficam liberadas.
8. Ao sair/logout do OKEGANHA, a sessao social e descartada.
9. No proximo login, o usuario conecta novamente.

## Regras de seguranca
- nunca pedir senha da rede social dentro do OKEGANHA
- nunca salvar senha
- nao persistir cookies sensiveis no banco
- nao depender disso agora para avancar RELA
- manter `UserSocialAccount` como status visual/declarativo por enquanto
- social verification real fica para fase futura

## Escopo MVP atual
- `/usuario/redes` deve comunicar claramente:
  - "Conexao temporaria em preparacao"
  - "No MVP, suas redes serao usadas apenas durante a sessao"
  - "Nunca pediremos sua senha"
- Botao atual continua salvando `username/profileUrl` como `PENDING`.
- Isso nao bloqueia o avancar para RELA Business.

## Pendencia futura
- Selenium/local browser assistido
- OAuth oficial quando possivel
- validacao de ownership real da conta social
- descarte automatico no logout
- sessao social temporaria em memoria/local runtime

## Status
Decisao aprovada para o MVP: seguir com modelo declarativo + conexao temporaria futura, sem persistencia sensivel.
