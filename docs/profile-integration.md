# Perfil: adaptação da branch antiga

## Contrato adotado

A página continua autenticando no servidor e lendo `perfis` com RLS. O nome editável é `perfis.nome`, preservando o modelo atual, em vez de criar uma segunda fonte em `user_metadata.full_name`. Telegram, preferência `receive_logs` e logout continuam disponíveis. Nenhuma coluna nova foi criada.

O componente cliente recebe apenas nome e URL da imagem; consultas e mutações Supabase permanecem no backend. Formulários e rotas usam Zod. Senhas exigem pelo menos oito caracteres e confirmação, conforme o fluxo de recuperação já existente no projeto. A alteração usa a [API updateUser do Supabase](https://supabase.com/docs/reference/javascript/auth-updateuser).

## Avatar

O contrato aceita PNG, JPEG e WebP, até 2 MB. SVG, arquivo vazio, tamanho excessivo e assinatura incompatível são rejeitados. O servidor gera o caminho `USER_ID/UUID.ext`, com extensão derivada do MIME validado, e faz upload com o cliente autenticado para respeitar o RLS. O arquivo é removido se a atualização de `avatar_url` falhar.

É necessário que o bucket `avatars` exista, seja público para exibição e permita upload no diretório do próprio usuário. A verificação dessa configuração deve ocorrer antes de integrar o PR. Fonte: [Supabase Storage](https://supabase.com/docs/guides/storage/uploads/standard-uploads).

## Exclusão de conta

A rota exige usuário autenticado e a confirmação literal EXCLUIR; usa exclusivamente o ID obtido da sessão, nunca um ID enviado pelo cliente. O cliente administrativo é separado das cookies para que a credencial administrativa não seja substituída pela sessão comum. A chave fica somente no backend, conforme [deleteUser](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser).

Os objetos no diretório de avatar do usuário são removidos antes da exclusão, pois o Supabase impede excluir usuários que ainda possuem objetos no Storage. As sessões são revogadas globalmente e, após a exclusão, a sessão local é limpa. A operação não garante remoção de dados comerciais do ERP nem de objetos legados fora desse diretório; falhas administrativas são informadas sem expor detalhes internos.

A exclusão efetiva deve ser validada apenas com uma conta descartável criada especificamente para o teste. Os testes automatizados com a conta comum cobrem rejeição de requisições inválidas e não autenticadas; não excluem essa conta.

## Logout e CI

O botão Sair encerra apenas a sessão atual (`scope: local`), conforme [signOut](https://supabase.com/docs/reference/javascript/auth-signout). A exclusão da conta revoga todas as sessões de propósito.

No CI da consolidação, dois testes de Webhooks encontraram a tela de login. Os jobs usam a mesma conta e o logout global podia invalidar sessões de outros jobs. O teste de logout agora comprova que outra sessão continua autenticada e não reescreve o arquivo global de autenticação.

## Validação

Testes unitários cobrem nome, senha, confirmação de exclusão, tamanho/MIME/assinatura do avatar. Testes de navegador verificam a preservação de Telegram/logs, edição e recarga do nome (com restauração do dado de teste), senhas divergentes, uploads inválidos, resposta controlada de upload e rejeição de visitantes sem sessão.

A configuração administrativa local retornou Invalid API key/Invalid Compact JWS na primeira consulta. A validação real do bucket, upload e exclusão descartável depende de corrigir essa configuração ou disponibilizar o plugin Supabase. Esses fluxos não devem ser marcados como validados enquanto essa verificação estiver pendente.
