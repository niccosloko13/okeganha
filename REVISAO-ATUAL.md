# Revisão Atual do OKEGANHA

## Módulos existentes

- Usuário (`/usuario/*`)
- Admin (`/admin/*`)
- Empresa (`/empresa/*`)
- Landing + autenticação pública (`/`, `/login`, `/cadastro`, `/empresa/acesso`)

## Rotas de usuário

- `/usuario/dashboard`
- `/usuario/campanhas`
- `/usuario/campanhas/[id]`
- `/usuario/tarefas`
- `/usuario/tarefas/[id]`
- `/usuario/carteira`
- `/usuario/saques`
- `/usuario/perfil`
- `/usuario/redes`
- `/usuario/completar-cadastro`

## Rotas de admin

- `/admin/dashboard`
- `/admin/campanhas`, `/admin/campanhas/nova`, `/admin/campanhas/[id]`
- `/admin/tarefas`
- `/admin/saques`
- `/admin/usuarios`, `/admin/usuarios/[id]`
- `/admin/empresas`, `/admin/empresas/nova`, `/admin/empresas/[id]`
- `/admin/seguranca`
- `/admin/relatorios`

## Rotas de empresa

- `/empresa/acesso`
- `/empresa/status`
- `/empresa/dashboard`
- `/empresa/campanhas`
- `/empresa/campanhas/nova`
- `/empresa/plano`

## Seed de teste

- Admin: `admin@okeganha.com` (role `ADMIN`)
- Usuário: `usuario@okeganha.com` (role `USER`)
- Empresa: `empresa@okeganha.com` (role `COMPANY` e `companyId` vinculado)
- Company teste: `ACTIVE`, plano `PREMIUM`, `tokensBalance=1500`
- Campanhas, tarefas, submissões, transações e saque pendente gerados
- Redes sociais de teste para usuário comum (manual, sem OAuth)

## Fluxo usuário -> tarefa -> carteira -> saque

1. Usuário escolhe campanha e tarefa.
2. Envia comprovação (`PENDING`).
3. Admin aprova (`APPROVED`) e gera crédito na carteira.
4. Usuário solicita saque (respeitando regras de saldo/validação).

## Fluxo empresa -> aprovação -> campanha -> tokens

1. Conta empresa criada com status inicial `PENDING`.
2. Admin aprova para `ACTIVE`.
3. Empresa cria campanha.
4. Tokens são consumidos nas operações da campanha conforme regras vigentes.

## Fluxo admin -> aprovação operacional

- Aprova/reprova/bloqueia empresas.
- Aprova/reprova tarefas enviadas.
- Aprova/marca pago/reprova saques.
- Ajusta tokens/plano da empresa.
- Pode usar impersonação de empresa para suporte operacional.

## Pendências conhecidas

- Conexões sociais do usuário estão em modo manual (sem OAuth).
- Verificação facial segue em modo mock.
- Pagamentos continuam manuais (sem gateway).
- Falta ampliar cobertura de testes automatizados.

## Próximos passos recomendados

1. Criar testes de integração para ações críticas (aprovação, saque, vínculos de role).
2. Implementar trilha de auditoria visual para todas as mutações do admin.
3. Evoluir conexão social para OAuth oficial por plataforma.
4. Adicionar monitoramento de antifraude em tempo real com alertas.
