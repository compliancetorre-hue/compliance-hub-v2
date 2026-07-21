// ══════════════════════════════════════════
// Escapa texto de origem não confiável antes de inserir via innerHTML
function escapeHtml(str) {
  if(str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function formatDate(d) {
  if(!d) return '—';
  const [y,m,dd] = d.split('-');
  return `${dd}/${m}/${y}`;
}
function diasAte(d) {
  if(!d) return null;
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  return diff;
}
function prazoChip(d) {
  const diff = diasAte(d);
  if(diff === null) return '—';
  if(diff < 0) return `<span class="prazo-venc">⚠ ${Math.abs(diff)}d atrás</span>`;
  if(diff <= 7) return `<span class="prazo-warn">⏰ ${diff}d</span>`;
  return `<span class="prazo-ok">📅 ${formatDate(d)}</span>`;
}
function statusBadge(s) {
  const map = {
    'Alto':'badge-alto','Médio':'badge-medio','Baixo':'badge-baixo','Crítico':'badge-critico',
    'Aberta':'badge-aberta','Em Análise':'badge-analise','Encerrada':'badge-encerrada','Arquivada':'badge-arquivada',
    'Pendente':'badge-pendente','Concluído':'badge-concluido','Vencido':'badge-vencido',
    'Em Andamento':'badge-andamento','Não Iniciado':'badge-naoinitiado',
    'Crítica':'badge-critico','Alta':'badge-alto','Média':'badge-medio','Baixa':'badge-baixo',
  };
  return `<span class="badge ${map[s]||'badge-pendente'}">${s}</span>`;
}
function nivelRisco(p, i) {
  const score = p * i;
  if(score >= 150) return 'Crítico';
  if(score >= 75)  return 'Alto';
  if(score >= 25)  return 'Médio';
  if(score >= 16)  return 'Crítico';
  if(score >= 9)   return 'Alto';
  if(score >= 4)   return 'Médio';
  return 'Baixo';
}
function progBar(v, cls='teal') {
  return `<div style="min-width:80px"><div style="font-size:.75rem;font-weight:600;color:var(--text-muted)">${v}%</div><div class="prog-bar"><div class="prog-fill ${cls}" style="width:${v}%"></div></div></div>`;
}

// ══════════════════════════════════════════
// FILIAL SELECTS
// ══════════════════════════════════════════
function populateFilialSelects() {
  const ids = ['f-risco-filial','f-ctrl-filial','f-plano-filial','f-dn-filial',
                'filtro-risco-filial','filtro-ctrl-filial','filtro-plano-filial','filtro-dn-filial','filtro-dn-filial2'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    const isFilter = id.startsWith('filtro');
    el.innerHTML = isFilter ? '<option value="">Todas as filiais</option>' : '';
    DB.filiais.forEach(f => {
      el.innerHTML += `<option value="${f.nome}">${f.nome}</option>`;
    });
  });
}

// ══════════════════════════════════════════
// MOBILE
// ══════════════════════════════════════════
function toggleMobile() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
  document.getElementById('mobile-overlay').classList.toggle('open');
}
function closeMobile() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('mobile-overlay').classList.remove('open');
}

// saveDB = salva cache local + agenda sync Supabase
let _saveTimer = null;
function saveDB() {
  saveLocalCache();
  setSaveIndicator('💾 Salvando...', 'var(--warn)');
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => setSaveIndicator('✅ Salvo localmente', 'var(--accent)'), 500);
}

function setSaveIndicator(text, color) {
  const el = document.getElementById('save-indicator');
  if(!el) return;
  el.textContent = text; el.style.color = color;
}

function getDBSizeKB() {
  try { const r = localStorage.getItem(DB_KEY); return r ? (r.length/1024).toFixed(1):'0'; } catch(e){ return '?'; }
}

// ── Loading bar for Supabase ops
function showLoadingBar(show, msg='') {
  let bar = document.getElementById('sb-loading');
  if(!bar) {
    bar = document.createElement('div');
    bar.id = 'sb-loading';
    bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;height:3px;background:var(--accent);animation:sbload 1.5s ease-in-out infinite;display:none;transition:opacity .3s';
    const style = document.createElement('style');
    style.textContent = '@keyframes sbload{0%{left:0;right:100%}50%{left:0;right:0}100%{left:100%;right:0}}';
    document.head.appendChild(style);
    document.body.appendChild(bar);
  }
  bar.style.display = show ? 'block' : 'none';
  if(msg) setSaveIndicator('⏳ ' + msg, 'var(--warn)');
}
