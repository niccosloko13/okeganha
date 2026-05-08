# 1. Visão final da área do usuário

A área do usuário não deve parecer dashboard/admin.
Deve parecer:

- app mobile premium
- game reward system
- fintech gamer
- sistema vivo de missões

Menu final:

- Início
- Missões
- Caixa
- Carteira
- Perfil

Remover linguagem antiga:

- Campanhas
- Tarefas

Usar sempre:

- Missões
- Recompensas
- Energia
- XP
- Nível
- Caixa misteriosa
- Perfil verificado

# 2. Home ideal

A home deve ter:

- Hero cinematográfico do usuário

  - avatar
  - nome
  - nível
  - XP
  - energia
  - streak
  - trust/verificado
  - CTA principal: Começar missão

- Missão recomendada

  - plataforma
  - recompensa
  - XP
  - energia necessária
  - raridade
  - botão Começar

- Caixa misteriosa

  - baú grande
  - progresso
  - faltam X missões
  - raridade
  - CTA

- Carteira compacta

  - saldo
  - progresso saque
  - botão sacar
  - moeda premium

- Atividade recente

  - missões em análise
  - aprovadas
  - última recompensa

# 3. Sistema visual

Definir que todos os assets estão em:

`public/gamification`

Manter paths centralizados em:
`lib/gamification-assets.ts`

Componentes principais:

- GamificationShell
- LevelBadge
- XPBar
- EnergyBar
- MissionCard
- RewardChest
- WalletCard
- ProfileCard
- SocialConnectCard
- ContentPreviewCard

LevelBadge:

- não usar imagem com número fixo
- usar moldura sem número
- número renderizado via HTML/CSS com glow
- level dinâmico com `user.level`

# 4. Social Connect seguro

Criar plano para Instagram, TikTok e Facebook.

IMPORTANTE:

- NÃO pedir senha do usuário
- NÃO armazenar senha
- NÃO simular login coletando credencial
- NÃO fazer automação insegura

Fluxo seguro planejado:

- Usuário clica em Conectar Instagram/TikTok/Facebook
- Sistema abre sessão autorizada/fluxo de conexão
- Usuário confirma conta
- Sistema registra apenas:

  - platform
  - username/profileUrl
  - status
  - connectedAt
  - verificationStatus
  - metadata segura
- Status possíveis:

  - NOT_CONNECTED
  - PENDING
  - CONNECTED
  - ERROR
  - RECHECK_REQUIRED

Selenium:

- permitido apenas para sessão controlada pelo próprio usuário em ambiente seguro
- nunca coletar senha
- nunca salvar cookie sensível sem criptografia/planejamento
- usar somente para confirmação/verificação quando não houver OAuth/API oficial viável
- documentar risco e preferência por APIs/OAuth oficiais

# 5. Perfil do usuário

Perfil deve virar “hub de identidade gamer”.

Mostrar:

- avatar
- nome
- email
- nível
- XP
- energia
- trustScore
- perfil verificado
- onboarding status
- redes conectadas:

  - Instagram
  - TikTok
  - Facebook
- conquistas
- histórico rápido

Formulário de edição deve ficar em seção secundária:

- Editar dados
- Pix
- telefone
- banco

Nada de card branco antigo.

# 6. Missões reais

Tipos iniciais:

- Instagram follow/like/comment
- TikTok follow/like/watch
- Facebook follow/like/share
- YouTube watch/subscribe/like
- Google Review

Cada missão deve ter:

- plataforma
- título
- descrição
- contentUrl
- rewardCents
- xpReward
- energyCost
- requiredWatchSeconds
- proofType
- status
- rarity

# 7. Visualização de conteúdo

Quando usuário abre missão:

Tela focada:

- preview do conteúdo
- plataforma
- empresa
- recompensa
- XP
- energia consumida
- tempo obrigatório
- botão iniciar
- progresso/timer
- botão finalizar somente depois da regra cumprida
- área de prova se necessário

Para vídeos:

- watch tracking
- visibility tracking
- tempo assistido
- focus loss
- heartbeat
- não permitir finalizar antes do tempo

Para comentário/follow/like:

- mostrar instrução clara
- abrir link externo
- pedir confirmação/prova
- colocar em análise
- futuro worker revalida

# 8. Antifraude Fase 1

Manter:

- logs completos
- watch tracking
- visibility tracking
- saldo em análise
- proof opcional
- userActivityLog fail-safe
- antifraude nunca derruba auth/onboarding

# 9. Fluxo empresa para teste futuro

Preparar para quando criarmos RELA Business:

Empresa cria campanha com:

- plataforma
- link do conteúdo
- tipo de ação
- orçamento
- quantidade de ações
- recompensa por usuário
- XP/energia sugeridos
- regras de aprovação
- status em análise

Admin aprova campanha.
Usuários recebem missões.

# 10. Regras antes de ir para RELA Business

Antes de começar RELA:

- área do usuário precisa estar visualmente redonda
- Missões precisa funcionar com dados reais ou estado vazio premium
- Perfil precisa ter social connect preparado
- Carteira precisa mostrar saldo/análise/saques corretamente
- completar cadastro precisa estar no tema novo
- build/check/db:audit verdes

# 11. Próximas implementações recomendadas

Ordem:

1. corrigir visual final do dashboard
2. refazer perfil gamer
3. criar SocialConnectCard
4. criar tela de missão focada
5. preparar seed/admin para empresa teste
6. só depois iniciar RELA Business
