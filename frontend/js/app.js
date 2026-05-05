// ============================================================
// LOGICA PRINCIPAL DA APLICACAO
// Todos os dados vem da API - NUNCA hardcoded aqui
// Verificacao de autenticacao obrigatoria no carregamento
// ============================================================

// ============================================================
// INICIALIZACAO - Verificar autenticacao antes de qualquer coisa
// ============================================================
(function init() {
  if (!Auth.requireAuth()) return; // Redireciona para login se nao autenticado

  const user = Auth.getUser();
  if (!user) return;

  // Exibir nome do usuario na interface
  const userNameEl = document.getElementById('user-nome');
  if (userNameEl) userNameEl.textContent = user.nome;

  // Mostrar/ocultar elementos baseado no perfil
  document.querySelectorAll('[data-perfil]').forEach(el => {
    const perfisPermitidos = el.dataset.perfil.split(',').map(p => p.trim());
    if (!perfisPermitidos.includes(user.perfil)) {
      el.style.display = 'none';
    }
  });

  // Inicializar pagina atual
  const pagina = document.body.dataset.pagina;
  if (pagina && AppPages[pagina]) {
    AppPages[pagina]();
  }
})();

// ============================================================
// HELPERS DE UI
// ============================================================
const UI = {
  loading: (show = true, container = document.body) => {
    const existing = container.querySelector('.app-loading');
    if (show && !existing) {
      const el = document.createElement('div');
      el.className = 'app-loading';
      el.innerHTML = '<div class="spinner"></div>';
      container.appendChild(el);
    } else if (!show && existing) {
      existing.remove();
    }
  },

  toast: (mensagem, tipo = 'info', duracao = 4000) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duracao);
  },

  confirmar: (mensagem) => window.confirm(mensagem),

  formatarData: (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  },

  formatarDataHora: (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  }
};

// ============================================================
// PAGINAS - Cada modulo carrega seus dados da API
// ============================================================
const AppPages = {

  // Dashboard - carrega estatisticas da API
  dashboard: async () => {
    try {
      UI.loading(true);
      const [tarefas, denuncias] = await Promise.all([
        API.tarefas.listar({ status: 'A Fazer' }),
        API.denuncias.listar({ status: 'Pendente' })
      ]);

      const el = (id) => document.getElementById(id);
      if (el('stat-tarefas')) el('stat-tarefas').textContent = tarefas.total || 0;
      if (el('stat-denuncias')) el('stat-denuncias').textContent = denuncias.total || 0;
    } catch (err) {
      UI.toast('Erro ao carregar dashboard: ' + err.message, 'error');
    } finally {
      UI.loading(false);
    }
  },

  // Denuncias - carrega lista da API
  denuncias: async () => {
    try {
      UI.loading(true);
      const result = await API.denuncias.listar();
      renderizarDenuncias(result.data || []);
    } catch (err) {
      UI.toast('Erro ao carregar denuncias: ' + err.message, 'error');
    } finally {
      UI.loading(false);
    }
  },

  // Tarefas - carrega lista da API
  tarefas: async () => {
    try {
      UI.loading(true);
      const result = await API.tarefas.listar();
      renderizarTarefas(result.data || []);
    } catch (err) {
      UI.toast('Erro ao carregar tarefas: ' + err.message, 'error');
    } finally {
      UI.loading(false);
    }
  },

  // Empresas - carrega lista da API
  empresas: async () => {
    try {
      UI.loading(true);
      const result = await API.empresas.listar();
      renderizarEmpresas(result.data || []);
    } catch (err) {
      UI.toast('Erro ao carregar empresas: ' + err.message, 'error');
    } finally {
      UI.loading(false);
    }
  },

  // Usuarios - apenas admin/gestor
  usuarios: async () => {
    if (!Auth.hasPerfil('admin','gestor')) {
      UI.toast('Sem permissao para acessar usuarios', 'error');
      return;
    }
    try {
      UI.loading(true);
      const result = await API.usuarios.listar();
      renderizarUsuarios(result.data || []);
    } catch (err) {
      UI.toast('Erro ao carregar usuarios: ' + err.message, 'error');
    } finally {
      UI.loading(false);
    }
  },

  // Logs de Auditoria - apenas admin/auditor
  logs: async () => {
    if (!Auth.hasPerfil('admin','auditor')) {
      UI.toast('Sem permissao para acessar logs', 'error');
      return;
    }
    try {
      UI.loading(true);
      const result = await API.logs.listar();
      renderizarLogs(result.data || []);
    } catch (err) {
      UI.toast('Erro ao carregar logs: ' + err.message, 'error');
    } finally {
      UI.loading(false);
    }
  }
};

// ============================================================
// FUNCOES DE RENDERIZACAO (sem dados hardcoded)
// ============================================================
const renderizarDenuncias = (denuncias) => {
  const container = document.getElementById('lista-denuncias');
  if (!container) return;
  if (denuncias.length === 0) {
    container.innerHTML = '<div class="empty">Nenhuma denuncia encontrada</div>';
    return;
  }
  container.innerHTML = denuncias.map(d => `
    <div class="card denuncia-card" onclick="abrirDenuncia('${d.id}')">
      <div class="card-header">
        <span class="protocolo">${d.protocolo}</span>
        <span class="badge badge-${d.perigo.toLowerCase()}">${d.perigo}</span>
        <span class="badge">${d.status}</span>
      </div>
      <div class="card-body">
        <p class="categoria">${d.categoria}</p>
        <p class="data">${UI.formatarData(d.criado_em)}</p>
      </div>
    </div>
  `).join('');
};

const renderizarTarefas = (tarefas) => {
  const container = document.getElementById('lista-tarefas');
  if (!container) return;
  if (tarefas.length === 0) {
    container.innerHTML = '<div class="empty">Nenhuma tarefa encontrada</div>';
    return;
  }
  container.innerHTML = tarefas.map(t => `
    <div class="card tarefa-card">
      <div class="card-header">
        <span class="titulo">${t.titulo}</span>
        <span class="badge badge-prioridade-${t.prioridade.toLowerCase()}">${t.prioridade}</span>
      </div>
      <div class="card-body">
        <p>Status: ${t.status}</p>
        <p>Responsavel: ${t.responsavel_nome || '-'}</p>
        <p>Prazo: ${UI.formatarData(t.data_prazo)}</p>
      </div>
    </div>
  `).join('');
};

const renderizarEmpresas = (empresas) => {
  const container = document.getElementById('lista-empresas');
  if (!container) return;
  container.innerHTML = empresas.length === 0
    ? '<div class="empty">Nenhuma empresa cadastrada</div>'
    : empresas.map(e => `
      <tr>
        <td>${e.razao_social}</td>
        <td>${e.cnpj_formatado || e.cnpj || '-'}</td>
        <td><span class="badge badge-risco-${e.risco_geral.toLowerCase()}">${e.risco_geral}</span></td>
        <td>${e.categoria || '-'}</td>
        <td>${e.uf || '-'}</td>
      </tr>
    `).join('');
};

const renderizarUsuarios = (usuarios) => {
  const container = document.getElementById('lista-usuarios');
  if (!container) return;
  container.innerHTML = usuarios.length === 0
    ? '<div class="empty">Nenhum usuario encontrado</div>'
    : usuarios.map(u => `
      <tr>
        <td>${u.nome}</td>
        <td>${u.email}</td>
        <td>${u.perfil}</td>
        <td>${u.filial_nome || '-'}</td>
        <td><span class="badge ${u.ativo ? 'badge-success' : 'badge-danger'}">${u.ativo ? 'Ativo' : 'Inativo'}</span></td>
      </tr>
    `).join('');
};

const renderizarLogs = (logs) => {
  const container = document.getElementById('lista-logs');
  if (!container) return;
  container.innerHTML = logs.length === 0
    ? '<div class="empty">Nenhum log encontrado</div>'
    : logs.map(l => `
      <tr>
        <td>${UI.formatarDataHora(l.criado_em)}</td>
        <td><span class="badge badge-tipo-${l.tipo}">${l.tipo}</span></td>
        <td>${l.usuario_nome || '-'}</td>
        <td>${l.descricao}</td>
        <td>${l.ip || '-'}</td>
      </tr>
    `).join('');
};

// Logout
const logout = () => {
  if (UI.confirmar('Deseja sair do sistema?')) {
    Auth.logout();
  }
};
