require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, query } = require('./db');

// ============================================================
// SEED - Dados Iniciais do Sistema
// Executa: npm run seed
// IMPORTANTE: Altere a senha do admin apos o primeiro login!
// ============================================================

const seed = async () => {
  console.log('Iniciando seed do banco de dados...');

  try {
    // 1. Criar filial principal
    const filialResult = await query(`
      INSERT INTO filiais (nome, cnpj)
      VALUES ('Matriz', '00.000.000/0001-00')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    let filialId;
    if (filialResult.rows.length > 0) {
      filialId = filialResult.rows[0].id;
      console.log('Filial criada:', filialId);
    } else {
      const f = await query('SELECT id FROM filiais LIMIT 1');
      filialId = f.rows[0].id;
      console.log('Filial ja existe:', filialId);
    }

    // 2. Criar usuario admin inicial
    // A senha DEVE ser alterada imediatamente apos o primeiro login
    const SENHA_INICIAL = process.env.ADMIN_SENHA_INICIAL || 'Admin@12345';
    const senhaHash = await bcrypt.hash(SENHA_INICIAL, 12);

    const adminResult = await query(`
      INSERT INTO usuarios (nome, email, senha_hash, perfil, filial_id, ativo, deve_trocar_senha)
      VALUES ($1, $2, $3, 'admin', $4, true, true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email
    `, ['Administrador', 'admin@compliance.local', senhaHash, filialId]);

    if (adminResult.rows.length > 0) {
      console.log('');
      console.log('==============================================');
      console.log('USUARIO ADMIN CRIADO COM SUCESSO');
      console.log('Email: admin@compliance.local');
      console.log('Senha: ' + SENHA_INICIAL);
      console.log('ALTERE A SENHA NO PRIMEIRO LOGIN!');
      console.log('==============================================');
      console.log('');
    } else {
      console.log('Usuario admin ja existe - seed ignorado');
    }

    // 3. Inserir configuracoes iniciais do sistema
    await query(`
      INSERT INTO configuracoes (chave, valor, descricao) VALUES
        ('sistema_nome', 'Compliance Hub', 'Nome do sistema exibido na interface'),
        ('sla_prazo_padrao_dias', '30', 'Prazo padrao em dias para resolucao de denuncias'),
        ('notificacoes_email', 'false', 'Ativar notificacoes por email'),
        ('versao', '2.0.0', 'Versao do sistema')
      ON CONFLICT (chave) DO NOTHING
    `);

    console.log('Configuracoes iniciais inseridas');
    console.log('Seed concluido com sucesso!');

  } catch (err) {
    console.error('Erro no seed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seed();
