# ANTIFRAUDE-RULEBOOK.md

## Objetivo
Definir regras, thresholds e resposta operacional do antifraude.

## Faixas de Score
- 0–30: LOW
- 31–60: MEDIUM
- 61–80: HIGH
- 81–100: CRITICAL
- Bloqueio automático: score >= 85

## Sinais Atuais
- Mais de 5 envios de comprovação em menos de 2 min
- Mais de 3 solicitações de saque em menos de 10 min
- Tentativas repetidas de rota proibida
- Texto de comprovação repetido
- Muitos dispositivos em curto prazo
- Fingerprint compartilhado entre contas
- Sessões com perda de foco excessiva

## Regras de Ação
- LOW: registrar apenas
- MEDIUM: registrar + monitorar
- HIGH: bloquear saque + revisão manual
- CRITICAL: bloquear conta automaticamente + invalidar sessão

## Falso Positivo (playbook)
1. Revisar logs em `/admin/logs-usuarios`
2. Revisar aba antifraude do usuário
3. Confirmar origem (IP/device/frequência)
4. Se legítimo, desbloquear e registrar nota interna
5. Ajustar regra se houver padrão recorrente de falso positivo

## Não Fazer
- Não coletar senha de rede social
- Não automatizar redes sociais
- Não bloquear por evento fraco isolado
