function init() {
  // Date chip
  const now = new Date();
  document.getElementById('date-chip').textContent = now.toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });

  // ── Load data: try Supabase first, fall back to local cache
  if(USE_SUPABASE) {
    // SEGURANÇA: nada de dados (cache local ou render do dashboard) antes de
    // o servidor validar a sessão. Sem token de servidor, só o login aparece —
    // denúncias e demais dados sensíveis não entram na memória nem no DOM.
    // (Antes, loadLocalCache()+renderDashboard() rodavam aqui sem checar
    // login, deixando o cache exposto atrás do overlay de login.)
    if(getAppToken()) {
      loadLocalCache();
      populateFilialSelects();
      populateRelSelectsForce();
      renderDashboard();
      loadFromSupabase().then(ok => {
        if(ok) {
          populateFilialSelects();
          populateRelSelectsForce();
          renderDashboard();
          if(typeof renderMapaRisco === 'function') renderMapaRisco();
          if(typeof rmUpdateRiscoModalUnits === 'function') rmUpdateRiscoModalUnits();
        }
      }).catch(e => {
        console.warn('Supabase load error (ignorado):', e.message);
      });
    }
    return; // init continues in async callback above
  } else {
    // No Supabase configured — use localStorage only
    const loaded = loadLocalCache();
    if(loaded) console.log('[ComplianceHub] Dados do cache local.');
    else console.log('[ComplianceHub] ⚠️ Configure o Supabase para persistência em nuvem.');
    setSaveIndicator('💾 Modo local (sem nuvem)', '#f59e0b');
  }

  populateFilialSelects();
  populateRelSelectsForce();
  renderDashboard();
  if(typeof rmUpdateRiscoModalUnits === 'function') rmUpdateRiscoModalUnits();

  // Focus email field on login
  setTimeout(() => {
    const emailEl = document.getElementById('login-email');
    if(emailEl && !document.getElementById('login-screen').classList.contains('hidden')) {
      emailEl.focus();
    }
  }, 200);
}

// Verificar se Supabase está configurado
if(!USE_SUPABASE) {
  // Mostra aviso na tela depois de carregar
  setTimeout(() => {
    const ind = document.getElementById('save-indicator');
    if(ind) {
      ind.innerHTML = '⚠️ Anon Key não configurada';
      ind.style.color = '#f59e0b';
      ind.style.cursor = 'pointer';
      ind.title = 'Clique para configurar';
      ind.onclick = () => showAnonKeySetup();
    }
  }, 1000);
}

// Inicializar: carregar usuários extras ANTES de verificar sessão/login
(async function appInit() {
  carregarBranding(); // Carregar branding customizado
  await usersLoad(); // carrega usuários extras do localStorage/Supabase
  checkSession();
  init();
})();
