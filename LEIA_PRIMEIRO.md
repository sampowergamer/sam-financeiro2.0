# SAM FINANÇAS 2.1 — projeto Web/PWA para Firebase + Netlify

**Esta versão substitui a interface 1.0, mas mantém o mesmo projeto Firebase e os caminhos anteriores dos registros.** Não é necessário apagar o banco nem executar migração destrutiva. Faça um backup dos dados antes de trocar o site.

## 1. O que está incluído

- Visual escuro futurista, animações discretas, ícones vetoriais (Pix, dinheiro, carro, offshore, cripto), layout adaptado para celular e navegação inferior.
- Gráficos leves sem dependências de biblioteca de gráficos: receitas vs. despesas nos 6 meses anteriores, gastos por categoria e consumo do orçamento mensal.
- Contas em grupos **Pessoal**, **CNPJ**, **Offshore** e **Cripto**, com filtro de dashboard por entidade/CNPJ, vinculáveis a entidades **Pessoa Física**, **Empresa**, **Offshore** e **Holding familiar**.
- Saldo BRL de contas locais consolidado. Offshore e cripto NÃO são somados ao saldo em reais, nem convertidos por uma cotação fictícia.
- Movimentações: criar, editar valores e datas, excluir, transferir entre contas da mesma moeda, vincular veículo, e baixar CSV.
- Dívidas: cadastrar, editar vencimento/valor, baixar pagamentos parciais ou totais sem apagar histórico. O pagamento cria uma despesa vinculada à dívida. Exclusão é bloqueada se a dívida tem pagamentos.
- Cartões: cadastrar limites, dia de vencimento, imagem HTTPS ou upload PNG/JPEG/WebP de até 2 MB via Firebase Storage. Sem números completos de cartão.
- Veículos: consumo médio e preço do combustível, indicador básico de lucro das entregas (receitas da categoria Entregas menos despesas Combustível/Manutenção).
- Alertas dentro do painel: orçamento mensal, vencimentos próximos e estimativa conservadora de caixa.
- Histórico de criação/edição/exclusão a partir desta versão (últimas 15 alterações), exportação JSON e instalação PWA quando suportada pelo navegador.

## 2. Como instalar sem perder dados

1. **Backup obrigatório**: no painel atual, exporte os dados em JSON, se disponível. Se há registros relevantes, faça também exportação no Firebase/Firestore antes de trocar a versão.
2. No Firebase, abra **Cloud Firestore > Regras (Rules)**. Compare suas regras atuais com `firestore.rules`. Num projeto usado exclusivamente pelo SAM FINANÇAS, substitua pelas do pacote e clique **Publicar**. Se houver outros apps no mesmo banco, **mescle** as regras sem remover os acessos necessários desses apps.
3. Se quiser imagens enviadas diretamente, ative **Storage** e aplique/mescle `storage.rules` na aba Storage > Rules. O Firebase Storage pode exigir um plano de faturamento. **Imagens por URL HTTPS** não exigem upload no Storage.
4. No Firebase > Authentication > Sign-in method, ative **Email/Password**. Em **Settings > Authorized domains**, inclua `samfinanceiro.netlify.app`.
5. O arquivo `firebase-config.js` incluído foi montado com a configuração **Web** que você forneceu para o projeto `samfinanceiro02-5e492`. Compare com seu Firebase atual. São credenciais públicas do SDK Web: **NÃO** coloque chaves privadas de conta de serviço no GitHub.
6. Extraia o ZIP e envie **todo o conteúdo** da pasta `SAM_FINANCAS_2.1/` para a **raiz** do repositório GitHub `sam-financeiro2.0`. Inclua `src-assets/`, `sw.js`, `app.js`, `style.css`, `index.html` e demais arquivos. Se alterou a configuração Web depois do último envio, **mantenha a sua versão correta** de `firebase-config.js`.
7. Na Netlify, use a integração GitHub. Build command: **vazio**; Publish directory: **`.`** (ponto); sem gerador de site e sem compilação npm. Aguarde o deploy.
8. Abra `https://samfinanceiro.netlify.app/` e pressione Ctrl + Shift + R para atualizar. Em dispositivos com PWA instalado, feche e reabra o app depois do deploy.
9. Entre com **a mesma conta de e-mail** já cadastrada; não precisa criar outra. Teste primeiro registros sem informação real.

## 3. Checklist de testes após publicar

- [ ] Entrar com o usuário que já existia e ver os lançamentos/dívidas/cartões/veículos anteriores.
- [ ] Criar uma entidade de teste (CNPJ ou Pessoa Física) e uma conta ligada a ela.
- [ ] Registrar uma entrada BRL e uma despesa BRL; conferir os saldos e os gráficos.
- [ ] Editar a data da despesa e verificar a mudança de mês.
- [ ] Criar dívida de teste de R$ 100; pagar R$ 40 e conferir saldo devedor R$ 60 e despesa de R$ 40. Não registre pagamento duas vezes.
- [ ] Alterar teto mensal nas Configurações e conferir o indicador.
- [ ] Testar visual em celular; exportar CSV e backup JSON; verificar o arquivo baixado.
- [ ] Testar imagem por HTTPS; se Storage estiver ativo, testar upload de cartão até 2 MB.

## 4. Modelo de dados e compatibilidade

- Configuração antiga permanece em `users/{uid}` (`digital`, `cash`, `dailyFuel`, `workDays`). Os novos campos `monthlyBudget` e `protectReserve` são aditivos.
- Coleções antigas permanecem em `users/{uid}/transactions`, `/debts`, `/cards`, `/vehicles`.
- Novas coleções `users/{uid}/accounts`, `/entities`, `/audit`.
- Para compatibilidade, o painel oferece duas contas **virtuais legadas**: `digital` e `cash`. Seus saldos iniciais continuam vindo do documento principal; as movimentações antigas com `account: 'digital'` ou `account: 'cash'` permanecem contabilizadas.
- Para novas contas, `openingBalance` deve ser o saldo **anterior** às movimentações que você vai cadastrar, e não o saldo de hoje após esses lançamentos.
- Pagamentos de dívidas são despesas de `transactions` com `debtId` e podem ser editados ou excluídos; isso recalcula o saldo devedor. A função "Quitada manualmente" não gera saída de caixa.
- O registro em `/audit` documenta edições novas feitas no painel, mas **não é trilha inviolável**: um administrador com acesso ao Firebase pode alterar dados no console. Os registros antigos não ganham histórico retroativo.

## 5. Limitações importantes

- **O sistema não impede gastos no mundo real**, nem substitui planejamento financeiro profissional. Alertas dependem dos dados cadastrados e das datas informadas.
- Projeção "saldo livre" = caixa BRL local menos dívidas vencidas ou vencendo em 30 dias, uma reserva de combustível semanal e a reserva de proteção configurada; **não inclui receitas futuras nem todos os gastos futuros**.
- Juros mostrados nas dívidas são informativos; não existe cálculo automático de juros de Shopee/cartões, amortização ou taxa efetiva. Sempre confira o credor.
- Não faz integração com Pix bancário, cartão, Open Finance, Receita Federal, corretoras ou cotações de criptomoedas; isso exige integrações, consentimento, segurança e (quando aplicável) obrigações regulatórias.
- Cripto aparece por unidade (BTC, USDT etc.), offshore por moeda (USD, EUR etc.) e não entra em saldo BRL sem conversão real confirmada.
- A tela é responsiva e instalável como **PWA** em navegadores compatíveis; **não é um APK Android** e não envia notificações push de dívidas em segundo plano nesta versão.
- O carregamento usa assinaturas de coleções inteiras do Firestore. A lista de movimentações exibe 40 por vez, mas para bases muito grandes será necessário implementar paginação real e resumos consolidados no servidor.
- Dados requerem rede e Firebase autenticado. O service worker cacheia a estrutura da página, **não garante acesso aos dados financeiros offline**.
- O download JSON salva somente registros atualmente carregados; confira o arquivo e mantenha cópias em local seguro. Não há importação/restauração automática.
- A exclusão de cartão não exclui automaticamente uma imagem anteriormente enviada ao Storage.
- O Storage pode requerer faturamento do projeto Firebase. Os custos de Firestore/Storage dependem do uso.

## 6. Diagnóstico rápido

- **`permission-denied`**: publique as regras 2.1 do Firestore (elas incluem `accounts`, `entities`, `audit`).
- **`auth/unauthorized-domain`**: autorize o domínio da Netlify no Authentication.
- **App não reage**: abra Console do navegador (F12) e verifique a primeira mensagem vermelha. O `app.js` deste pacote passou na verificação de sintaxe, mas a ligação com o seu Firebase deve ser testada após o deploy.
- **Upload de imagem falha**: ative Storage e publique as regras. Se não conseguir, use uma URL HTTPS da imagem.
- **Nova versão não aparece**: Netlify > Deploys, aguarde publicação e atualize com Ctrl+Shift+R. Se instalou PWA, feche e reabra.

## 7. Arquivos principais

`index.html`: estrutura e telas. `style.css`: tema e layout responsivo. `app.js`: lógica, Firebase, cálculos e gráficos. `firebase-config.js`: configuração Web pública recebida. `firestore.rules` / `storage.rules`: regras a publicar manualmente no Firebase. `manifest.webmanifest` / `sw.js` / `src-assets/`: instalação PWA e ícones. `netlify.toml`: deploy estático.

**Teste executado no ambiente de geração**: análise de sintaxe JavaScript e verificação estrutural de HTML/CSS. O ambiente não dispõe de acesso autenticado ao seu Firebase nem permitiu abrir Chromium para um teste de ponta a ponta; portanto, não foi verificado login, gravação real ou deploy em produção.
