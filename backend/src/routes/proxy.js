const express = require('express');
const router = express.Router();

// Proxy JusBrasil → chave fica SOMENTE no servidor (nunca no cliente)
router.get('/jusbrasil/:tipo/:doc', async (req, res) => {
  const { tipo } = req.params;
  const doc = req.params.doc.replace(/\D/g, '');
  if (!['cpf', 'cnpj'].includes(tipo)) return res.status(400).json({ error: 'Tipo invalido' });
  if (!doc) return res.status(400).json({ error: 'Documento invalido' });
  if (!process.env.JUSBRASIL_API_KEY) return res.status(503).json({ error: 'Integracao JusBrasil nao configurada' });

  const ep = `https://api.jusbrasil.com.br/lawsuit/search/parties/${tipo}/${doc}`;
  try {
    const response = await fetch(ep, {
      headers: { 'Authorization': 'Token ' + process.env.JUSBRASIL_API_KEY, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) return res.status(502).json({ error: 'Falha ao consultar JusBrasil' });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Falha ao consultar JusBrasil' });
  }
});

// Proxy CNPJ → BrasilAPI (server-side, sem CORS)
router.get('/cnpj/:cnpj', async (req, res) => {
  const cnpj = req.params.cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) return res.status(400).json({ error: 'CNPJ inválido' });

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) {
      const status = response.status === 404 ? 404 : 502;
      return res.status(status).json({ error: 'CNPJ não encontrado na Receita Federal' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Falha ao consultar BrasilAPI' });
  }
});

module.exports = router;
