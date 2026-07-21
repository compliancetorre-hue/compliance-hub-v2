const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/db');
const { registrarLog } = require('../services/logService');

const router = express.Router();

// ============================================================
// POST /api/auth/login
// Login com email + senha, retorna JWT
// ============================================================
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email invalido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, senha } = req.body;

  try {
    // Buscar usuario pelo email
    const result = await query(
      'SELECT id, email, nome, senha_hash, perfil, ativo, filial_id, tentativas_login, bloqueado_ate FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Nao revelar se email existe ou nao (seguranca)
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    const usuario = result.rows[0];

    // Verificar se conta esta bloqueada
    if (usuario.bloqueado_ate && new Date(usuario.bloqueado_ate) > new Date()) {
      return res.status(423).json({ error: 'Conta temporariamente bloqueada. Tente novamente mais tarde.' });
    }

    // Verificar se usuario esta ativo
    if (!usuario.ativo) {
      return res.status(403).json({ error: 'Conta desativada. Contate o administrador.' });
    }

    // Verificar senha com bcrypt
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      // Incrementar tentativas falhas
      const tentativas = (usuario.tentativas_login || 0) + 1;
      let bloqueadoAte = null;

      if (tentativas >= 5) {
        bloqueadoAte = new Date(Date.now() + 15 * 60 * 1000); // bloquear 15 min
        await query('UPDATE usuarios SET tentativas_login = $1, bloqueado_ate = $2 WHERE id = $3', [tentativas, bloqueadoAte, usuario.id]);
        return res.status(423).json({ error: 'Muitas tentativas. Conta bloqueada por 15 minutos.' });
      }

      await query('UPDATE usuarios SET tentativas_login = $1 WHERE id = $2', [tentativas, usuario.id]);
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    // Login bem-sucedido - resetar tentativas
    await query('UPDATE usuarios SET tentativas_login = 0, bloqueado_ate = NULL, ultimo_login = NOW() WHERE id = $1', [usuario.id]);

    // Gerar JWT
    const token = jwt.sign(
      { userId: usuario.id, perfil: usuario.perfil, filial_id: usuario.filial_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // Registrar log de acesso
    await registrarLog({ tipo: 'login', usuario_id: usuario.id, descricao: 'Login realizado com sucesso', ip: req.ip });

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        filial_id: usuario.filial_id
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================================
// POST /api/auth/logout
// Invalida a sessao (log)
// ============================================================
router.post('/logout', async (req, res) => {
  // Em uma implementacao mais completa, invalidar o token em uma blocklist (Redis)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await registrarLog({ tipo: 'logout', usuario_id: decoded.userId, descricao: 'Logout realizado', ip: req.ip });
    } catch {}
  }
  res.json({ message: 'Logout realizado com sucesso' });
});

// ============================================================
// POST /api/auth/alterar-senha
// Altera senha do proprio usuario autenticado
// ============================================================
router.post('/alterar-senha', [
  body('senha_atual').notEmpty(),
  body('nova_senha').isLength({ min: 8 }).withMessage('Minimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*d)/).withMessage('Deve conter maiuscula, minuscula e numero')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Nao autenticado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query('SELECT id, senha_hash FROM usuarios WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario nao encontrado' });

    const usuario = result.rows[0];
    const senhaAtualValida = await bcrypt.compare(req.body.senha_atual, usuario.senha_hash);
    if (!senhaAtualValida) return res.status(401).json({ error: 'Senha atual incorreta' });

    const novaSenhaHash = await bcrypt.hash(req.body.nova_senha, 12);
    await query('UPDATE usuarios SET senha_hash = $1, updated_at = NOW() WHERE id = $2', [novaSenhaHash, usuario.id]);
    await registrarLog({ tipo: 'update', usuario_id: usuario.id, descricao: 'Senha alterada', ip: req.ip });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
