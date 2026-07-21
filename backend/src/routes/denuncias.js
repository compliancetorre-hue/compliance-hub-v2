const express = require('express');
const { body, query: qv, validationResult } = require('express-validator');
const { query } = require('../database/db');
const { requirePerfil, requireFilial } = require('../middleware/auth');
const { registrarLog } = require('../services/logService');

const router = express.Router();

// Gerar protocolo unico (formato: DN-YYYYMM-XXXX)
const gerarProtocolo = () => {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DN-${ano}${mes}-${rand}`;
};

// ============================================================
// POST /api/denuncias
// Registrar nova denuncia (qualquer usuario autenticado)
// Dados do denunciante NUNCA aparecem para perfis sem permissao
// ============================================================
router.post('/', [
  body('categoria').notEmpty().withMessage('Categoria obrigatoria'),
  body('descricao').isLength({ min: 20 }).withMessage('Descricao deve ter ao menos 20 caracteres'),
  body('perigo').isIn(['Leve','Medio','Grave','Gravissima']).optional()
], requireFilial, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { categoria, setor, descricao, anonima = true, denunciante_nome, denunciante_email, perigo = 'Leve' } = req.body;

    const protocolo = gerarProtocolo();

    const result = await query(`
      INSERT INTO denuncias (protocolo, categoria, filial_id, setor, descricao, anonima,
        denunciante_nome, denunciante_email, perigo, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Pendente')
      RETURNING id, protocolo, categoria, status, criado_em
    `, [
      protocolo,
      categoria,
      req.filial_id,
      setor || null,
      descricao,
      anonima,
      anonima ? null : (denunciante_nome || null),
      anonima ? null : (denunciante_email || null),
      perigo
    ]);

    await registrarLog({
      tipo: 'create',
      usuario_id: req.user.id,
      usuario_nome: req.user.nome,
      descricao: `Nova denuncia registrada: ${protocolo}`,
      tabela_afetada: 'denuncias',
      registro_id: result.rows[0].id,
      ip: req.ip
    });

    res.status(201).json({
      message: 'Denuncia registrada com sucesso',
      protocolo: result.rows[0].protocolo,
      id: result.rows[0].id
    });
  } catch (err) { next(err); }
});

// ============================================================
// GET /api/denuncias
// Listar denuncias (analista+ ve sem dados do denunciante)
// Apenas admin/gestor ve dados de identificacao)
// ============================================================
router.get('/', requireFilial, async (req, res, next) => {
  try {
    const podeVerIdentidade = ['admin','gestor'].includes(req.user.perfil);

    const result = await query(`
      SELECT
        d.id, d.protocolo, d.categoria, d.setor, d.perigo, d.status,
        d.criado_em, d.data_limite, d.anonima,
        CASE WHEN $1 THEN d.descricao ELSE LEFT(d.descricao, 100) || '...' END as descricao,
        CASE WHEN $1 AND NOT d.anonima THEN d.denunciante_nome ELSE NULL END as denunciante_nome,
        CASE WHEN $1 AND NOT d.anonima THEN d.denunciante_email ELSE NULL END as denunciante_email,
        u.nome as responsavel_nome
      FROM denuncias d
      LEFT JOIN usuarios u ON u.id = d.responsavel_id
      WHERE d.filial_id = $2
      ORDER BY d.criado_em DESC
    `, [podeVerIdentidade, req.filial_id]);

    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) { next(err); }
});

// ============================================================
// GET /api/denuncias/:id
// Detalhes de uma denuncia (com controle de acesso aos dados)
// ============================================================
router.get('/:id', requireFilial, async (req, res, next) => {
  try {
    const podeVerIdentidade = ['admin','gestor'].includes(req.user.perfil);

    const result = await query(`
      SELECT
        d.*,
        CASE WHEN NOT $1 THEN NULL ELSE d.denunciante_nome END as denunciante_nome,
        CASE WHEN NOT $1 THEN NULL ELSE d.denunciante_email END as denunciante_email,
        u.nome as responsavel_nome
      FROM denuncias d
      LEFT JOIN usuarios u ON u.id = d.responsavel_id
      WHERE d.id = $2 AND d.filial_id = $3
    `, [podeVerIdentidade, req.params.id, req.filial_id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Denuncia nao encontrada' });

    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// ============================================================
// PATCH /api/denuncias/:id
// Atualizar status da denuncia (analista+)
// ============================================================
router.patch('/:id', [
  requireFilial,
  requirePerfil('admin','gestor','analista')
], async (req, res, next) => {
  try {
    const { status, responsavel_id, data_limite, resolucao } = req.body;

    const antes = await query('SELECT * FROM denuncias WHERE id = $1 AND filial_id = $2', [req.params.id, req.filial_id]);
    if (antes.rows.length === 0) return res.status(404).json({ error: 'Denuncia nao encontrada' });

    const result = await query(`
      UPDATE denuncias SET
        status = COALESCE($1, status),
        responsavel_id = COALESCE($2, responsavel_id),
        data_limite = COALESCE($3, data_limite),
        resolucao = COALESCE($4, resolucao),
        atualizado_em = NOW()
      WHERE id = $5 AND filial_id = $6
      RETURNING id, protocolo, status, atualizado_em
    `, [status, responsavel_id, data_limite, resolucao, req.params.id, req.filial_id]);

    await registrarLog({
      tipo: 'update',
      usuario_id: req.user.id,
      usuario_nome: req.user.nome,
      descricao: `Denuncia ${antes.rows[0].protocolo} atualizada`,
      tabela_afetada: 'denuncias',
      registro_id: req.params.id,
      dados_anteriores: antes.rows[0],
      dados_novos: req.body,
      ip: req.ip
    });

    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
