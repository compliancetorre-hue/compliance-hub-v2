-- ============================================================
-- SUPABASE RLS LOCKDOWN — executar no SQL Editor do projeto Supabase
-- ============================================================
-- Contexto: o frontend (frontend/js/supabase.js) foi corrigido para
-- nunca mais chamar a REST do Supabase diretamente com a anon key —
-- toda leitura/escrita agora passa OBRIGATORIAMENTE pela Edge Function
-- (que usa a service_role key, só existente no servidor).
--
-- Esse script fecha a mesma porta do lado do banco: mesmo que algum
-- código (atual ou futuro) volte a chamar a REST direto com a anon key,
-- ou que alguém use a anon key exposta no código-fonte para bater
-- direto em https://<projeto>.supabase.co/rest/v1/<tabela>, o Postgres
-- vai negar por RLS. A tabela "denuncias" é a mais sensível: contém
-- nome/telefone/e-mail de denunciantes e relatos de má conduta.
--
-- IMPORTANTE: rode este script você mesmo após revisar. Se sua Edge
-- Function usa a service_role key para acessar o banco, ela IGNORA RLS
-- automaticamente — então isso não quebra a função, só bloqueia acesso
-- direto via anon/authenticated key.
--
-- CONFIRMADO AO VIVO (leitura, sem nenhuma credencial além da anon key
-- pública do frontend): "denuncias", "settings" (incluindo a chave
-- "usuarios_extras", que guarda e-mail + hash de senha de cada usuário
-- extra) e "filiais" respondiam com dados reais. "audit_logs" (que hoje
-- guarda CPF completo de cada pesquisa do Due Diligence) foi adicionada
-- a este script porque também não estava protegida e não constava na
-- versão anterior. "usuarios" já retornou vazio nesse teste — mantenha
-- a checagem do passo 2 mesmo assim pra confirmar depois de rodar tudo.
-- ============================================================

ALTER TABLE filiais     ENABLE ROW LEVEL SECURITY;
ALTER TABLE riscos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE controles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE denuncias   ENABLE ROW LEVEL SECURITY;
ALTER TABLE fbboards    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rm_planos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda      ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs  ENABLE ROW LEVEL SECURITY;

-- Nenhuma policy é criada para anon/authenticated de propósito:
-- com RLS ligado e ZERO policies, toda query dessas roles é negada
-- por padrão. Só a service_role (usada pela Edge Function) continua
-- acessando normalmente, pois service_role sempre ignora RLS.

-- Revogação explícita de privilégios de tabela (defesa em profundidade,
-- redundante com RLS mas não custa nada):
REVOKE ALL ON filiais    FROM anon, authenticated;
REVOKE ALL ON riscos     FROM anon, authenticated;
REVOKE ALL ON controles  FROM anon, authenticated;
REVOKE ALL ON planos     FROM anon, authenticated;
REVOKE ALL ON denuncias  FROM anon, authenticated;
REVOKE ALL ON fbboards   FROM anon, authenticated;
REVOKE ALL ON rm_planos  FROM anon, authenticated;
REVOKE ALL ON agenda     FROM anon, authenticated;
REVOKE ALL ON settings   FROM anon, authenticated;
REVOKE ALL ON audit_logs FROM anon, authenticated;

-- ============================================================
-- Checklist depois de rodar:
-- 1. Confirme que a Edge Function conecta ao Postgres usando a
--    service_role key (não a anon key) — só ela ignora RLS.
-- 2. Teste no navegador, deslogado, uma chamada direta:
--      GET https://<projeto>.supabase.co/rest/v1/denuncias
--      (com header apikey: <anon key>)
--    Deve retornar vazio/erro de permissão, nunca os dados.
-- 3. Teste o fluxo normal do app logado — deve continuar funcionando,
--    pois passa pela Edge Function (service_role).
-- 4. Rotacione a anon key do projeto (Settings → API → gerar nova)
--    já que a atual ficou exposta publicamente no código-fonte por
--    tempo indeterminado — rotacionar não quebra nada essencial desde
--    que o novo valor seja atualizado em frontend/js/supabase.js.
-- ============================================================
