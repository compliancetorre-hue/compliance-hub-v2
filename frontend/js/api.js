// ============================================================
// CAMADA DE COMUNICACAO COM A API
// Todas as chamadas ao backend passam por aqui
// O token JWT e injetado automaticamente em cada requisicao
// ZERO dados de negocio no frontend - tudo vem da API
// ============================================================

const API_BASE = window.API_BASE_URL || 'http://localhost:3001/api';

/**
 * Funcao base para chamadas autenticadas a API
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem('auth_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  // Token expirado ou invalido - redirecionar para login
  if (response.status === 401) {
    sessionStorage.clear();
    window.location.href = 'index.html';
    return;
  }

  // Erro de permissao
  if (response.status === 403) {
    throw new Error('Voce nao tem permissao para realizar esta acao');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Extrair mensagem de erro da API
    const msg = data.error || data.message || (data.errors && data.errors[0]?.msg) || 'Erro na requisicao';
    throw new Error(msg);
  }

  return data;
};

// ============================================================
// API - Metodos organizados por modulo
// ============================================================
const API = {
  // Autenticacao
  auth: {
    login: (email, senha) => apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    }),
    logout: () => apiFetch('/auth/logout', { method: 'POST' }),
    alterarSenha: (senha_atual, nova_senha) => apiFetch('/auth/alterar-senha', {
      method: 'POST',
      body: JSON.stringify({ senha_atual, nova_senha })
    })
  },

  // Usuarios
  usuarios: {
    listar: () => apiFetch('/users'),
    eu: () => apiFetch('/users/me'),
    criar: (dados) => apiFetch('/users', { method: 'POST', body: JSON.stringify(dados) }),
    atualizar: (id, dados) => apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
    desativar: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' })
  },

  // Denuncias
  denuncias: {
    listar: (filtros = {}) => {
      const params = new URLSearchParams(filtros).toString();
      return apiFetch(`/denuncias${params ? '?' + params : ''}`);
    },
    buscar: (id) => apiFetch(`/denuncias/${id}`),
    criar: (dados) => apiFetch('/denuncias', { method: 'POST', body: JSON.stringify(dados) }),
    atualizar: (id, dados) => apiFetch(`/denuncias/${id}`, { method: 'PATCH', body: JSON.stringify(dados) })
  },

  // Empresas
  empresas: {
    listar: (filtros = {}) => {
      const params = new URLSearchParams(filtros).toString();
      return apiFetch(`/empresas${params ? '?' + params : ''}`);
    },
    buscar: (id) => apiFetch(`/empresas/${id}`),
    criar: (dados) => apiFetch('/empresas', { method: 'POST', body: JSON.stringify(dados) }),
    atualizar: (id, dados) => apiFetch(`/empresas/${id}`, { method: 'PATCH', body: JSON.stringify(dados) })
  },

  // Tarefas
  tarefas: {
    listar: (filtros = {}) => {
      const params = new URLSearchParams(filtros).toString();
      return apiFetch(`/tarefas${params ? '?' + params : ''}`);
    },
    buscar: (id) => apiFetch(`/tarefas/${id}`),
    criar: (dados) => apiFetch('/tarefas', { method: 'POST', body: JSON.stringify(dados) }),
    atualizar: (id, dados) => apiFetch(`/tarefas/${id}`, { method: 'PATCH', body: JSON.stringify(dados) }),
    cancelar: (id) => apiFetch(`/tarefas/${id}`, { method: 'DELETE' })
  },

  // Logs de Auditoria
  logs: {
    listar: (filtros = {}) => {
      const params = new URLSearchParams(filtros).toString();
      return apiFetch(`/logs${params ? '?' + params : ''}`);
    },
    buscar: (id) => apiFetch(`/logs/${id}`),
    porUsuario: (userId) => apiFetch(`/logs/usuario/${userId}`)
  }
};
