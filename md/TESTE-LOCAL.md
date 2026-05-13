# Teste local de conta empresa (RELA oficial)

## Criar empresa pública

1. Abra `http://localhost:3000/rela/login`.
2. Vá na aba **Criar conta empresa**.
3. Preencha os campos obrigatórios.

Exemplos para teste:

- CNPJ (formato): `12.345.678/0001-99`
- WhatsApp (formato): `(13) 99741-0019`

Ao enviar com sucesso:

- a empresa é criada com status `PENDING`,
- o usuário COMPANY é criado com senha hash (nunca texto puro),
- o sistema redireciona para `/rela/status`.

## Aprovação admin

1. Entre como admin.
2. Abra `http://localhost:3000/admin/empresas`.
3. A empresa recém-criada aparece com status `PENDING`.
4. Use a ação **Aprovar** para liberar o painel completo.
