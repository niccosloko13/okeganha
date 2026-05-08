# USER APP EXPERIENCE AND SOCIAL CONNECT — Progress

## Escopo desta fase
Implementação da primeira fase visual/UX do plano sem alterar schema, migrations, auth crítico, financeiro, empresa/admin.

## Arquivos alterados
- app/usuario/perfil/page.tsx
- app/usuario/redes/page.tsx
- app/usuario/missoes/page.tsx
- app/usuario/tarefas/page.tsx
- app/usuario/tarefas/[id]/page.tsx
- app/usuario/dashboard/page.tsx
- components/gamification/index.tsx
- components/gamification/PremiumStateCard.tsx
- components/gamification/SocialConnectCard.tsx
- components/usuario/UserSocialAccountsForm.tsx
- lib/gamification-assets.ts
- public/gamification/badges/levels/nivel1.webp

## Decisões tomadas
1. Perfil Gamer
- Perfil reposicionado como hub de identidade gamer com blocos de XP, energia, nível, trust e onboarding.
- Formulário de edição mantido em seção secundária dark/glass.

2. Social Connect visual seguro
- Criado `SocialConnectCard` com status visuais:
  - NOT_CONNECTED
  - PENDING
  - CONNECTED
  - ERROR
  - RECHECK_REQUIRED
- Botões visuais:
  - Conectar
  - Reconectar
  - Ver perfil
- Sem senha, sem fluxo de login real, sem cookies de redes sociais.

3. Tela /usuario/redes refeita
- Grade premium com cards grandes por plataforma.
- Texto de segurança explícito sobre conexão por fluxo seguro/OAuth no futuro.

4. Tela focada de missão
- /usuario/tarefas/[id] alinhada ao visual gamer premium:
  - plataforma
  - empresa
  - recompensa
  - XP
  - energia
  - tempo obrigatório
  - instruções
  - botão de finalizar visualmente bloqueado
  - painel de sessão/timer já existente preservado
- Sem adicionar lógica crítica nova.

5. Missões melhorada
- Grid premium com cards de raridade e estado vazio bonito.
- CTA forte e linguagem de recompensas/energia/XP.

6. Dashboard revisado
- Mantido hero premium com sensação de sistema vivo.
- Missão recomendada como CTA principal.
- Caixa misteriosa com progresso e aura.
- Carteira compacta e mais informativa.

## O que ficou pronto
- Base visual consistente para usuário em dark/glass premium.
- Social connect visual seguro pronto para integração futura.
- Missão focada pronta para testes com conteúdo real.
- Estados premium para vazio/review/booster/recompensa.

## O que ainda não foi implementado
- Conexão social real via OAuth/API oficial.
- Verificação social automática/worker dedicado.
- Sistema completo de conquistas persistentes.
- Modal de recompensa final com animação dedicada.
- Multiple assets de level frame por nível (hoje com fallback).

## Próximos passos antes de RELA
1. Finalizar sistema de `level-frame` por nível com número dinâmico e glow consistente.
2. Consolidar microinterações premium sem custo alto de performance.
3. Conectar missão recomendada a critérios de recomendação mais inteligentes.
4. Preparar seed/campanhas de teste para validação com empresas reais.
5. Iniciar integração progressiva com RELA Business apenas após UX usuário consolidada.
