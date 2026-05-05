const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/db');
const { requirePerfil } = require('../middleware/auth');
const { registrarLog } = require('../services/logService');

const router = express.Router();

// Campos seguros para retornar (NUNCA retornar senha_hash)
const CAMPOS_SEGUROS = 'id, nome, email, perfil, filial_id, ativo, deve_trocar_senha, ultimo_login, criado_em, atualizado_em';

// ============================================================
// GET /api/users
// Listar usuarios (admin ve todos, gestor ve propria filial)
// ============================================================
router.get('/', requirePerfil('admin','gestor'), async (req, res, next) => {
  try {
    const isAdmin = req.user.perfil === 'admin';
    const result = await query(
      `SELECT ${CAMPOS_SEGUROS}, f.nome as filial_nome
       FROM usuarios u
       LEFT JOIN filiais f ON f.id = u.filial_id
       WHERE ($1 OR u.filial_id = $2)
       ORDER BY u.nome`,
      [isAdmin, req.user.filial_id]
    );
    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) { next(err); }
});

// ============================================================
// GET /api/users/me
// Dados do proprio usuario logado
// ============================================================
router.get('/me', async (req, res) => {
  res.json({
    id: req.user.id,
    nome: req.user.nome,
    email: req.user.email,
    perfil: req.user.perfil,
    filial_id: req.user.filial_id
  });
});

// ============================================================
// POST /api/users
// Criar novo usuario (admin only)
// ============================================================
router.post('/', requirePerfil('admin'), [
  body('email').isEmail().normalizeEmail(),
  body('nome').isLength({ min: 3 }),
  body('perfil').isIn(['admin','gestor','analista','auditor','viewer']),
  body('filial_id').isUUID()
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { nome, email, perfil, filial_id } = req.body;
    // Gerar senha temporaria forte
    const senhaTemp = Math.random().toString(36).slice(-8) + 'A1!';
    const senhaHash = await bcrypt.hash(senhaTemp, 12);

    const result = await query(`
      INSERT INTO usuarios (nome, email, senha_hash, perfil, filial_id, deve_trocar_senha)
      VALUES ($1,$2,$3,$4,$5,true)
      RETURNING ${CAMPOS_SEGUROS}
    `, [nome, email, senhaHash, perfil, filial_id]);

    await registrarLog({
      tipo: 'create', usuario_id: req.user.id, usuario_nome: req.user.nome,
      descricao: `Usuario criado: ${email}`, tabela_afetada: 'usuarios',
      registro_id: result.rows[0].id, ip: req.ip
    });

    // Retornar senha temporaria apenas na criacao (para ser enviada ao usuario)
    res.status(201).json({ ...result.rows[0], senha_temporaria: senhaTemp });
  } catch (err) { next(err); }
});

// ============================================================
// PATCH /api/users/:id
// Atualizar usuario (admin ou proprio usuario)
// ============================================================
router.patch('/:id', async (req, res, next) => {
  const isAdmin = req.user.perfil === 'admin';
  const isSelf = req.user.id === req.params.id;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  try {
    const { nome, perfil, ativo, filial_id } = req.body;

    // Usuario nao-admin nao pode mudar perfil/ativo/filial
    const updates = isAdmin
      ? { nome, perfil, ativo, filial_id }
      : { nome };

    const antes = await query(`SELECT ${CAMPOS_SEGUROS} FROM usuarios WHERE id = $1`, [req.params.id]);
    if (antes.rows.length === 0) return res.status(404).json({ error: 'Usuario nao encontrado' });

    const result = await query(`
      UPDATE usuarios SET
        nome = COALESCE($1, nome),
        perfil = COALESCE($2, perfil),
        ativo = COALESCE($3, ativo),
        filial_id = COALESCE($4, filial_id),
        atualizado_em = NOW()
      WHERE id = $5
      RETURNING ${CAMPOS_SEGUROS}
    `, [updates.nome, updates.perfil, updates.ativo, updates.filial_id, req.params.id]);

    await registrarLog({
      tipo: 'update', usuario_id: req.user.id, usuario_nome: req.user.nome,
      descricao: `Usuario atualizado: ${antes.rows[0].email}`, tabela_afetada: 'usuarios',
      registro_id: req.params.id, dados_anteriores: antes.rows[0], dados_novos: updates, ip: req.ip
    });

    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// ============================================================
// DELETE /api/users/:id -> Desativar (soft delete)
// Nunca deletar fisicamente, apenas desativar
// ============================================================
router.delete('/:id', requirePerfil('admin'), async (req, res, next) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ error: 'Nao e possivel desativar a propria conta' });
  }
  try {
    await query('UPDATE usuarios SET ativo = false, atualizado_em = NOW() WHERE id = $1', [req.params.id]);
    await registrarLog({
      tipo: 'delete', usuario_id: req.user.id, usuario_nome: req.user.nome,
      descricao: `Usuario desativado: ${req.params.id}`, tabela_afetada: 'usuarios',
      registro_id: req.params.id, ip: req.ip
    });
    res.json({ message: 'Usuario desativado com sucesso' });
  } catch (err) { next(err); }
});

module.exports = router;
