const { query } = require('../database/db');

// ============================================================
// SERVICO DE LOG DE AUDITORIA
// Registra todas as acoes criticas no sistema
// A tabela logs_auditoria e imutavel (sem UPDATE/DELETE)
// ============================================================

/**
 * Registra uma acao de auditoria
 * @param {Object} dados
 * @param {string} dados.tipo - login | logout | create | update | delete | export | import | denuncia
 * @param {string} dados.usuario_id - UUID do usuario que realizou a acao
 * @param {string} dados.usuario_nome - Nome do usuario (cache para historico)
 * @param {string} dados.descricao - Descricao legivel da acao
 * @param {string} [dados.tabela_afetada] - Nome da tabela afetada (opcional)
 * @param {string} [dados.registro_id] - UUID do registro afetado (opcional)
 * @param {Object} [dados.dados_anteriores] - Estado anterior do registro (opcional)
 * @param {Object} [dados.dados_novos] - Novo estado do registro (opcional)
 * @param {string} [dados.ip] - IP do cliente
 * @param {string} [dados.user_agent] - User agent do cliente
 */
const registrarLog = async ({
  tipo,
  usuario_id,
  usuario_nome,
  descricao,
  tabela_afetada = null,
  registro_id = null,
  dados_anteriores = null,
  dados_novos = null,
  ip = null,
  user_agent = null
}) => {
  try {
    // Remover campos sensiveis dos dados antes de logar
    const sanitizar = (obj) => {
      if (!obj) return null;
      const copia = { ...obj };
      delete copia.senha;
      delete copia.senha_hash;
      delete copia.password;
      delete copia.token;
      return copia;
    };

    await query(
      `INSERT INTO logs_auditoria
        (tipo, usuario_id, usuario_nome, descricao, tabela_afetada, registro_id, dados_anteriores, dados_novos, ip, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        tipo,
        usuario_id || null,
        usuario_nome || null,
        descricao,
        tabela_afetada,
        registro_id || null,
        dados_anteriores ? JSON.stringify(sanitizar(dados_anteriores)) : null,
        dados_novos ? JSON.stringify(sanitizar(dados_novos)) : null,
        ip,
        user_agent
      ]
    );
  } catch (err) {
    // Log de auditoria nao deve derrubar a requisicao principal
    console.error('AVISO: Falha ao registrar log de auditoria:', err.message);
  }
};

/**
 * Middleware que loga automaticamente acoes de criacao, edicao e exclusao
 * Usar como: router.post('/', authenticateToken, autoLog('create', 'empresas'), handler)
 */
const autoLog = (tipo, tabela) => async (req, res, next) => {
  const original = res.json.bind(res);
  res.json = async (data) => {
    // Logar apenas respostas de sucesso (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      await registrarLog({
        tipo,
        usuario_id: req.user.id,
        usuario_nome: req.user.nome,
        descricao: `${tipo.toUpperCase()} em ${tabela}`,
        tabela_afetada: tabela,
        registro_id: data?.id || data?.data?.id || null,
        dados_novos: req.body,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
    }
    return original(data);
  };
  next();
};

module.exports = { registrarLog, autoLog };
