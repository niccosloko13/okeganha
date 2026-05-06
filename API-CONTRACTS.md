# API-CONTRACTS.md

## POST /api/task-session/start
Body:
- `taskId: string`

Resposta sucesso:
- `{ ok: true, session: { id, requiredDuration, activeDuration, focusLossCount } }`

## POST /api/task-session/heartbeat
Body:
- `sessionId: string`
- `isVisible: boolean`
- `isFocused: boolean`
- `focusLossIncrement: 0|1`
- `deviceFingerprint` (opcional)

Resposta sucesso:
- `{ ok: true, session, canFinish }`

## POST /api/task-session/finish
Body:
- `sessionId: string`

Resposta sucesso:
- `{ ok: true, session }`

## Server Actions críticas
- `submitTaskProofAction`
- `requestWithdrawalAction`
- `approveSubmission`
- `approveCampaignReview`

Regra: backend nunca confia no frontend para status sensível.
