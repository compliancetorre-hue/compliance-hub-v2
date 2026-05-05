// ============================================================
// GERENCIAMENTO DE AUTENTICACAO NO FRONTEND
// Token armazenado em sessionStorage (nao localStorage):
// - expira quando o navegador fecha
// - nao acessivel por outras abas de outros dominios
// NUNCA armazenar senha ou dados sensiveis no frontend
// ============================================================

const Auth = {
  /**
   * Realiza o login chamando a API e armazena o token
   */
  login: async (email, senha) => {
    const data = await API.auth.login(email, senha);

    if (!data.token) throw new Error('Resposta invalida do servidor');

    // Armazenar token e dados basicos do usuario (sem dados sensiveis)
    sessionStorage.setItem('auth_token', data.token);
    sessionStorage.setItem('user', JSON.stringify({
      id: data.usuario.id,
      nome: data.usuario.nome,
      email: data.usuario.email,
      perfil: data.usuario.perfil,
      filial_id: data.usuario.filial_id
    }));

    return data.usuario;
  },

  /**
   * Realiza o logout - limpa token e redireciona
   */
  logout: async () => {
    try {
      await API.auth.logout();
    } catch {} finally {
      sessionStorage.clear();
      window.location.href = 'index.html';
    }
  },

  /**
   * Verifica se ha um token valido armazenado
   */
  isAuthenticated: () => {
    const token = sessionStorage.getItem('auth_token');
    if (!token) return false;

    // Verificar se o token nao expirou (decodificando o payload)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        sessionStorage.clear();
        return false;
      }
      return true;
    } catch {
      sessionStorage.clear();
      return false;
    }
  },

  /**
   * Retorna dados basicos do usuario logado (sem dados sensiveis)
   */
  getUser: () => {
    try {
      return JSON.parse(sessionStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  },

  /**
   * Verifica se o usuario tem um dos perfis necessarios
   */
  hasPerfil: (...perfis) => {
    const user = Auth.getUser();
    return user && perfis.includes(user.perfil);
  },

  /**
   * Protege uma pagina - redireciona para login se nao autenticado
   * Usar no inicio de cada pagina protegida
   */
  requireAuth: () => {
    if (!Auth.isAuthenticated()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  /**
   * Protege uma pagina por perfil - redireciona se sem permissao
   */
  requirePerfil: (...perfis) => {
    if (!Auth.requireAuth()) return false;
    if (!Auth.hasPerfil(...perfis)) {
      alert('Voce nao tem permissao para acessar esta pagina');
      window.history.back();
      return false;
    }
    return true;
  }
};
