const jwt = require('jsonwebtoken');
const { query } = require('../database/db');

// ============================================================
// MIDDLEWARE: Verificacao de Token JWT
// ============================================================
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso nao fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    // Verificar se o usuario ainda existe e esta ativo no banco
    const result = await query(
      'SELECT id, email, nome, perfil, ativo, filial_id FROM usuarios WHERE id = $1 AND ativo = true',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario nao encontrado ou inativo' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Faca login novamente.' });
    }
    return res.status(403).json({ error: 'Token invalido' });
  }
};

// ============================================================
// MIDDLEWARE: Verificacao de Perfil (RBAC)
// Perfis: 'admin', 'gestor', 'analista', 'auditor', 'viewer'
// ============================================================
const requirePerfil = (...perfisPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Nao autenticado' });
    }
    if (!perfisPermitidos.includes(req.user.perfil)) {
      return res.status(403).json({
        error: 'Acesso negado. Permissao insuficiente.',
        perfil_necessario: perfisPermitidos
      });
    }
    next();
  };
};

// ============================================================
// MIDDLEWARE: Verificacao de Filial
// Impede usuario de acessar dados de outra filial
// ============================================================
const requireFilial = (req, res, next) => {
  if (req.user.perfil === 'admin') return next(); // admin ve tudo
  
  const filialReq = req.query.filial_id || req.body.filial_id || req.params.filial_id;
  if (filialReq && filialReq !== req.user.filial_id) {
    return res.status(403).json({ error: 'Acesso negado a dados de outra filial' });
  }
  
  // Injetar filial_id automaticamente para garantir isolamento
  req.filial_id = req.user.filial_id;
  next();
};

module.exports = { authenticateToken, requirePerfil, requireFilial };
