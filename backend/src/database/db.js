const { Pool } = require('pg');

// ============================================================
// CONEXAO COM BANCO DE DADOS PostgreSQL
// Credenciais NUNCA hardcoded - sempre via variavel de ambiente
// ============================================================
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: process.env.DB_SSL_NO_VERIFY !== 'true' }
    : false,
  max: 20,                    // maximo de conexoes no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexao na inicializacao
pool.connect((err, client, release) => {
  if (err) {
    console.error('ERRO: Falha ao conectar ao banco de dados:', err.message);
    process.exit(1);
  }
  release();
  console.log('Banco de dados conectado com sucesso');
});

// Wrapper para queries com logging de erros
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Query executada', { duration: duration + 'ms', rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('Erro na query:', err.message);
    throw err;
  }
};

module.exports = { pool, query };
