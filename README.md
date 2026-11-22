# SAM FINANÇAS — versão inicial web

## Instalação
1. Crie um projeto no Firebase Console e registre um **aplicativo Web**.
2. Copie as credenciais públicas do SDK Web para `firebase-config.js` (não use `google-services.json`).
3. Ative **Authentication > Sign-in method > Email/Password**.
4. Crie **Cloud Firestore** e publique as regras de `firestore.rules`.
5. Ative **Cloud Storage** e publique `storage.rules` (o Storage pode exigir plano de faturamento).
6. No Firebase Authentication > Settings > Authorized domains, adicione o domínio final da Netlify.
7. Suba estes arquivos em um repositório GitHub, mantendo `index.html` na raiz.
8. Na Netlify, escolha **Add new project > Import existing project > GitHub**, selecione o repositório. Build command: **vazio**; Publish directory: `.`. Publique.
9. Abra o endereço HTTPS da Netlify e crie sua conta.

## O que funciona nesta versão
- Login/cadastro por e-mail e senha e dados separados por usuário.
- Saldo digital e espécie, movimentações, transferências, receitas e despesas.
- Cadastro de dívidas, cartões e veículos, imagens de cartões com upload.
- Alertas **na tela** de vencimento e projeção conservadora de caixa.
- Exportação JSON para backup e layout responsivo.

## Limitações e próximos incrementos
- Esta é uma **versão inicial**, não um sistema financeiro auditado ou garantido 100% operacional em produção.
- Não inclui notificações push, integração bancária/Open Finance, consulta de veículos, API de peças, cálculo automático de juros compostos, amortização ou parcelamentos.
- Os valores de dívidas são cadastrados manualmente. Não marque pagamento apenas excluindo dívida; isso remove o registro.
- A projeção de 30 dias deduz vencimentos conhecidos e **uma** reserva semanal de combustível; não é uma previsão completa de fluxo de caixa.
- Despesas e dívidas podem se sobrepor se registradas manualmente duas vezes; faça conciliação.
- Não armazene números completos de cartão, CVV, senhas bancárias ou documentos sensíveis.
- As regras do Firestore e Storage restringem acesso por usuário, mas devem passar por revisão e testes antes de uso real.
- O login depende de Firebase configurado e conexão à internet.

## Observação
Não é possível garantir a publicação ou testar autenticação e persistência reais sem seu projeto Firebase. Faça os testes antes de inserir dados financeiros reais.
