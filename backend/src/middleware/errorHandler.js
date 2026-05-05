// ============================================================
// MIDDLEWARE: Tratamento Centralizado de Erros
// Evita vazar stack traces e detalhes internos para o cliente
// ============================================================
const errorHandler = (err, req, res, next) => {
  // Log completo do erro no servidor (nunca exposto ao cliente)
  console.error('[ERROR]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.id || 'anonimo'
  });

  // Erros de validacao do banco (PostgreSQL)
  if (err.code === '23505') { // unique_violation
    return res.status(409).json({ error: 'Registro duplicado. Este dado ja existe.' });
  }
  if (err.code === '23503') { // foreign_key_violation
    return res.status(409).json({ error: 'Referencia invalida. Verifique os dados informados.' });
  }
  if (err.code === '22P02') { // invalid_text_representation (UUID invalido)
    return res.status(400).json({ error: 'ID invalido.' });
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalido.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado. Faca login novamente.' });
  }

  // Erro generico - NUNCA expor detalhes em producao
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor'
    : err.message || 'Erro interno do servidor';

  res.status(statusCode).json({ error: message });
};

// Criar erro com status code customizado
const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, createError };
