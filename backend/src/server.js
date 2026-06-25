require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const denunciaRoutes = require('./routes/denuncias');
const empresaRoutes = require('./routes/empresas');
const tarefaRoutes = require('./routes/tarefas');
const logRoutes = require('./routes/logs');
const proxyRoutes = require('./routes/proxy');
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// SEGURANCA - Headers HTTP seguros
// ============================================================
app.use(helmet());

// ============================================================
// CORS - Apenas origens autorizadas
// ============================================================
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Origem nao permitida pelo CORS'));
  },
  credentials: true
}));

// ============================================================
// RATE LIMITING - Protecao contra brute force
// ============================================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Muitas requisicoes. Tente novamente em 15 minutos.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

app.use(globalLimiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// ROTAS PUBLICAS (sem autenticacao)
// ============================================================
app.use('/api/auth', loginLimiter, authRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ============================================================
// ROTAS PROTEGIDAS (requerem JWT valido)
// ============================================================
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/denuncias', authenticateToken, denunciaRoutes);
app.use('/api/empresas', authenticateToken, empresaRoutes);
app.use('/api/tarefas', authenticateToken, tarefaRoutes);
app.use('/api/logs', authenticateToken, logRoutes);
app.use('/api/proxy', authenticateToken, proxyRoutes);

// ============================================================
// TRATAMENTO DE ERROS
// ============================================================
app.use(errorHandler);

// Rota nao encontrada
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota nao encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
