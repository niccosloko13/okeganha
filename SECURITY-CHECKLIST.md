# SECURITY-CHECKLIST.md

## Pré-release
- [ ] `SESSION_SECRET` configurado
- [ ] `npm run check:copy` OK
- [ ] `npm run db:audit` OK
- [ ] `npm run build` OK

## Auth/Authz
- [ ] `/usuario/*` só USER
- [ ] `/admin/*` só ADMIN
- [ ] `/empresa/*` só COMPANY ativo

## Backend Safety
- [ ] Todas actions críticas com validação Zod
- [ ] Idempotência em aprovação de tarefa
- [ ] Saque protegido contra concorrência
- [ ] Bloqueio automático crítico testado

## Privacidade/LGPD
- [ ] Sem coleta de senha externa
- [ ] Sem scraping agressivo
- [ ] Logs limitados ao necessário de segurança
