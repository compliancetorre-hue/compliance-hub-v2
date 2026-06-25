const express = require('express');
const router = express.Router();

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
