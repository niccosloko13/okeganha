# OKEGANHA — Gamification Foundation

## 1. Visão do Produto

OKEGANHA será a experiência gamificada para usuários finais.

Objetivo:
Transformar tarefas simples em um sistema de progressão divertido, confiável e escalável.

O usuário deve sentir:

- progresso
- recompensa
- evolução
- exclusividade
- confiança

NÃO queremos aparência de:

- cassino
- aposta
- roleta
- “dinheiro fácil”
- spam

Queremos:

- missões
- progresso
- XP
- níveis
- reputação
- benefícios
- retenção saudável

---

## 2. Loop Principal do Usuário

Fluxo principal:

Usuário entra
?
Vê energia, XP, nível e saldo
?
Escolhe missão
?
Gasta energia
?
Executa missão
?
Envia prova
?
Missão entra em análise
?
Missão aprovada
?
Recebe saldo + XP
?
Pode desbloquear caixa misteriosa
?
Sobe nível
?
Recebe benefícios
?
Volta no dia seguinte

---

## 3. Sistema de Energia

Objetivo:
Controlar custo, abuso, spam e retenção.

Energia NÃO representa dinheiro.
Energia representa capacidade diária de atividade.

### Energia inicial

- 1000 energia/dia

### Usuário verificado

- 1400 energia/dia

### Usuário nível alto

- 1800 a 2200 energia/dia

### Regras

- Missões consomem energia.
- Usuário sem energia não executa missão.
- Energia recarrega diariamente.
- Futuramente poderá existir:
  - bônus diário
  - bônus de sequência
  - energia de caixa misteriosa

---

## 4. Sistema de XP

XP representa progresso.

### XP inicial por ação

Instagram:

- Curtida: +12 XP
- Seguir: +20 XP
- Comentário: +28 XP
- Reels curto: +18 XP

TikTok:

- Curtida: +10 XP
- Seguir: +18 XP
- Comentário: +26 XP
- Vídeo curto: +16 XP

Facebook:

- Curtida: +8 XP
- Seguir: +15 XP
- Comentário: +22 XP
- Vídeo: +14 XP

YouTube:

- Curtida: +18 XP
- Inscrever-se: +30 XP
- Comentário: +40 XP
- Vídeo longo: +50 XP

CPA/Offerwall:

- +80 a +300 XP

---

## 5. Sistema de Níveis

### Progressão planejada

Nível 2: 300 XP
Nível 3: 900 XP
Nível 4: 1800 XP
Nível 5: 3000 XP
Nível 6: 4500 XP
Nível 7: 6500 XP
Nível 8: 9000 XP
Nível 9: 12000 XP
Nível 10: 15500 XP

Objetivo:
Usuário ativo alcançar nível 10 em aproximadamente 7–14 dias.

---

## 6. Benefícios por Nível

Usuários de nível maior recebem:

- mais energia
- saque mais rápido
- prioridade em missões
- bônus pequenos
- limite maior de tarefas
- caixas melhores
- bônus temporário de XP

---

## 7. Sistema de Perfil Verificado

Usuário com check verificado significa:

- onboarding completo
- comportamento saudável
- baixo risco
- tarefas aprovadas
- sem fraude recente

Benefícios:

- mais energia
- prioridade
- saque mais rápido
- caixas melhores

---

## 8. Trust Score / Reputação

Base do score:

- taxa de aprovação
- tempo assistindo missão
- consistência de device
- IP/VPN/proxy
- múltiplas contas suspeitas
- comportamento humano
- histórico de saque
- denúncias
- reversões

Trust score NÃO será visível completamente ao usuário.

---

## 9. Caixa Misteriosa

Sistema sem aparência de aposta.

Objetivo:
Criar retenção e surpresa positiva.

Possíveis recompensas:

- alguns centavos
- +1 energia
- double XP temporário
- bônus pequeno
- prioridade em missão
- reputação positiva

Usuários suspeitos NÃO recebem caixa.

Inicialmente:

- apenas estrutura/UI
- sem economia agressiva

---

## 10. Sistema de Missões

Tipos futuros:

- curtir post
- seguir perfil
- comentar
- assistir reels/vídeo
- rewarded ads
- offerwall CPA
- campanhas locais

Todas devem aparecer como:
“Missões”

Internamente terão providers diferentes.

---

## 11. Arquitetura Futura

Criar base futura para:

MissionProvider:

- LOCAL_CAMPAIGN
- REWARDED_AD
- OFFERWALL_CPA

O usuário não vê diferença técnica.

---

## 12. Monetização

Ordem futura:

1. Empresas locais
2. Rewarded ads
3. Offerwall CPA

IMPORTANTE:
Não integrar agora.
Primeiro estabilizar gameplay e retenção.

---

## 13. Custos Planejados

500 usuários ativos:
~R$12.000/mês bruto estimado.

1000 usuários ativos:
~R$24.000/mês bruto estimado.

Energia é mecanismo de controle econômico.

---

## 14. Próximos Passos Técnicos

Após este documento:

FASE 1

- implementar energy
- implementar xp
- implementar level
- implementar trustScore
- implementar isVerifiedProfile

FASE 2

- novo dashboard mobile-first
- bottom navigation
- cards premium
- barra XP
- energia visual
- nível
- selo verificado

FASE 3

- caixa misteriosa
- worker antifraude
- task validation
- recheck de ações

FASE 4

- rewarded ads
- offerwall
- CPA
- providers de missão
