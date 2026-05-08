// ===== CONSTANTES GLOBAIS =====
const SUPABASE_URL  = '%%SUPABASE_URL%%';
const EDGE_URL = SUPABASE_URL + '/functions/v1/api';

document.addEventListener('DOMContentLoaded',function(){
  const c=document.getElementById('content');if(!c)return;
  const p=document.createElement('div');
  p.className='page';p.id='page-due-diligence'
  p.innerHTML=ddHTML();
  c.appendChild(p);
});

function ddHTML(){return `
<div class="dd-hero">
  <div class="dd-hero-left">
    <div class="dd-hero-ico">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <div>
      <div class="dd-hero-t">Due Diligence — KYC &amp; Mídias Negativas</div>
      <div class="dd-hero-s">Pessoa Física (CPF) · Pessoa Jurídica (CNPJ) · Bhusca booleana · Verificação automática · Juntas Comerciais</div>
    </div>
  </div>
  <div class="dd-apills">
    <span class="dd-ap">CPF · PF</span><span class="dd-ap">CNPJ · PJ</span><span class="dd-ap">Boolean Search</span><span class="dd-ap">Mídias Negativas</span><span class="dd-ap-dim">Verificação auto</span>
  </div>
</div>

<div class="dd-tabs">
  <button class="dd-tab active" id="dd-tab-pj" onclick="ddSwitchTab('pj')">🏢 Pessoa Jurídica — CNPJ</button>
  <button class="dd-tab" id="dd-tab-pf" onclick="ddSwitchTab('pf')">👤 Pessoa Física — CPF</button>
</div>

<!-- ═══ PAINEL PJ ═══ -->
<div id="dd-panel-pj">
  <div class="section" style="margin-bottom:13px">
    <div class="section-header"><h2>🏢 Dados da empresa e do contrato</h2><button class="btn btn-outline btn-sm" onclick="ddLimpar('pj')">🗑️ Limpar</button></div>
    <div class="section-body">
      <div class="form-grid">
        <div class="field"><label>CNPJ *</label><input type="text" id="pj-cnpj" placeholder="00.000.000/0001-00" maxlength="18" oninput="this.value=ddMC(this.value)" onblur="pjAutoFill()"/></div>
        <div class="field"><label>Nome fantasia</label><input type="text" id="pj-fantasia" placeholder="Preenchido via API"/></div>
        <div class="field full"><label>Razão social</label><input type="text" id="pj-razao" placeholder="Preenchido automaticamente via API"/></div>
        <div class="field full"><label>Endereço</label><input type="text" id="pj-end" placeholder="Preenchido via API · ou informe manualmente"/></div>
        <div class="field full"><label>Sócios / representantes</label><input type="text" id="pj-socios" placeholder="Preenchido via API · ou informe manualmente"/></div>
        <div class="field"><label>Objeto do contrato</label><input type="text" id="pj-objeto" placeholder="Ex: Serviços de TI"/></div>
        <div class="field"><label>Valor estimado</label><input type="text" id="pj-valor" placeholder="Ex: R$ 50.000"/></div>
        <div class="field"><label>Modalidade de pagamento</label>
          <select id="pj-pagto"><option value="">Selecione</option><option value="100% antecipado">100% antecipado — maior risco</option><option value="Parcial antecipado">Parcial antecipado</option><option value="Parcelado conforme entrega">Parcelado conforme entrega</option><option value="Pós-entrega">Pós-entrega — menor risco</option></select>
        </div>
        <div class="field"><label>Estado sede (para Junta Comercial)</label>
          <select id="pj-estado"><option value="">Detectado via API</option>
            <option value="AC">AC — JUCEA</option><option value="AL">AL — JUCEAL</option><option value="AM">AM — JUCEA-AM</option><option value="AP">AP — JUCAP</option><option value="BA">BA — JUCEB</option><option value="CE">CE — JUCEC</option><option value="DF">DF — JUCDF</option><option value="ES">ES — JUCEES</option><option value="GO">GO — JUCEG</option><option value="MA">MA — JUCEMA</option><option value="MG">MG — JUCEMG</option><option value="MS">MS — JUCEMS</option><option value="MT">MT — JUCEMAT</option><option value="PA">PA — JUCEPA</option><option value="PB">PB — JUCEP</option><option value="PE">PE — JUCEPE</option><option value="PI">PI — JUCEPI</option><option value="PR">PR — JUCEPAR</option><option value="RJ">RJ — JUCERJA</option><option value="RN">RN — JUCERN</option><option value="RO">RO — JUCER</option><option value="RR">RR — JUCERR</option><option value="RS">RS — JUCERGS</option><option value="SC">SC — JUCESC</option><option value="SE">SE — JUCESE</option><option value="SP">SP — JUCESP</option><option value="TO">TO — JUCETINS</option>
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:13px;flex-wrap:wrap">
        <button class="btn btn-accent" id="pj-btnapi" onclick="pjConsultar()" style="flex:1;min-width:185px;padding:11px;font-size:.88rem;justify-content:center"><span id="pj-bico">🔍</span> <span id="pj-btxt">Consultar APIs + gerar links</span></button>
        <button class="btn btn-primary" onclick="pjSomenteLinks()" style="padding:11px 14px;font-size:.86rem">📋 Gerar links sem API</button>
        <button class="btn" onclick="ddToggleManual('pj')" style="padding:11px 13px;font-size:.86rem;background:#fffbeb;color:#92400e;border:1px solid #fcd34d">✏️ Manual</button>
      </div>
    </div>
  </div>
  <div id="pj-logwrap" style="display:none;margin-bottom:12px"><div style="background:#f8fafc;border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px"><div style="font-size:.67rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:7px">Log de consulta</div><div id="pj-log"></div></div></div>
  <div class="dd-vbar" id="pj-vbar"><div class="dd-vb-t"><span>🔎 Verificando resultados...</span><span id="pj-vb-pct" style="font-family:'DM Mono',monospace;font-weight:700">0%</span></div><div class="dd-vb-bar"><div class="dd-vb-fill" id="pj-vb-fill"></div></div><div class="dd-vb-stats">✅ Encontrados: <span class="dd-vb-f" id="pj-vb-f">0</span> &nbsp;|&nbsp; ➖ Sem resultado: <span class="dd-vb-n" id="pj-vb-n">0</span> &nbsp;|&nbsp; 🟣 Mídia negativa: <span class="dd-vb-neg" id="pj-vb-neg">0</span> &nbsp;|&nbsp; ⚠️ Manual: <span class="dd-vb-e" id="pj-vb-e">0</span></div></div>
  <div id="pj-manbox" style="display:none;margin-bottom:12px"><div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:var(--radius);padding:17px"><div style="font-size:.85rem;font-weight:700;color:#92400e;margin-bottom:9px">✏️ Modo manual — abra um link, copie o JSON (Ctrl+A → Ctrl+C) e cole aqui</div><div id="pj-manlinks" style="margin-bottom:11px"></div><div class="field"><label style="color:#92400e">JSON copiado da API</label><textarea id="pj-jsonpaste" style="min-height:85px;font-family:'DM Mono',monospace;font-size:.77rem;background:rgba(255,255,255,.8);border-color:#fcd34d" placeholder="Cole aqui o JSON retornado pela API..."></textarea></div><button class="btn btn-primary" onclick="ddParseManual('pj')" style="margin-top:8px">Processar JSON →</button></div></div>
  <div id="pj-result"></div>
</div>

<!-- ═══ PAINEL PF ═══ -->
<div id="dd-panel-pf" style="display:none">
  <div class="section" style="margin-bottom:13px">
    <div class="section-header"><h2>👤 Dados da pessoa física</h2><button class="btn btn-outline btn-sm" onclick="ddLimpar('pf')">🗑️ Limpar</button></div>
    <div class="section-body">
      <div class="form-grid">
        <div class="field"><label>CPF *</label><input type="text" id="pf-cpf" placeholder="000.000.000-00" maxlength="14" oninput="this.value=ddMCpf(this.value)"/></div>
        <div class="field"><label>Nome completo *</label><input type="text" id="pf-nome" placeholder="Ex: João da Silva Souza"/></div>
        <div class="field"><label>Data de nascimento</label><input type="text" id="pf-nasc" placeholder="DD/MM/AAAA" maxlength="10"/></div>
        <div class="field"><label>Profissão / cargo</label><input type="text" id="pf-prof" placeholder="Ex: Empresário, Servidor Público, Médico"/></div>
        <div class="field full"><label>Endereço (opcional — para Street View)</label><input type="text" id="pf-end" placeholder="Rua, número, bairro, cidade, CEP"/></div>
        <div class="field"><label>Empresa(s) vinculada(s)</label><input type="text" id="pf-empresa" placeholder="Ex: XYZ Ltda, ABC ME (opcional)"/></div>
        <div class="field"><label>PEP — Pessoa Exposta Politicamente?</label>
          <select id="pf-pep"><option value="nao">Não</option><option value="sim">Sim — cargo público</option><option value="relacionado">Relacionado a PEP</option></select>
        </div>
        <div class="field"><label>Natureza do relacionamento</label>
          <select id="pf-nat"><option value="">Selecione</option><option value="Contratante">Contratante</option><option value="Fornecedor">Fornecedor</option><option value="Sócio">Sócio</option><option value="Representante legal">Representante legal</option><option value="Avalista">Avalista / fiador</option></select>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:13px;flex-wrap:wrap">
        <button class="btn btn-accent" onclick="pfGerar()" style="flex:1;min-width:185px;padding:11px;font-size:.88rem;justify-content:center">🔍 Gerar links + verificar</button>
      </div>
    </div>
  </div>
  <div class="dd-vbar" id="pf-vbar"><div class="dd-vb-t"><span>🔎 Verificando resultados...</span><span id="pf-vb-pct" style="font-family:'DM Mono',monospace;font-weight:700">0%</span></div><div class="dd-vb-bar"><div class="dd-vb-fill" id="pf-vb-fill"></div></div><div class="dd-vb-stats">✅ Encontrados: <span class="dd-vb-f" id="pf-vb-f">0</span> &nbsp;|&nbsp; ➖ Sem resultado: <span class="dd-vb-n" id="pf-vb-n">0</span> &nbsp;|&nbsp; 🟣 Mídia negativa: <span class="dd-vb-neg" id="pf-vb-neg">0</span> &nbsp;|&nbsp; ⚠️ Manual: <span class="dd-vb-e" id="pf-vb-e">0</span></div></div>
  <div id="pf-result"></div>
</div>
`;}



// ══════════════════════════════════════════
// DATA STORE
// ══════════════════════════════════════════
let DB = {
  filiais: [],
  riscos: [],
  controles: [],
  planos: [],
  rmPlanos: [],  // carregado do Supabase após login
  denuncias: [],  // carregado do Supabase após login
  fbBoards: {
    'planos-acao': {
      name:'Planos de Ação', color:'#3b82f6',
      cols:[
        { id:'c1', name:'Não Iniciado', color:'#94a3b8', cards:[
          { id:'k1', title:'Treinamento LGPD', resp:'Fernanda', prazo: futureDate(20), prio:'Média', tag:'RH', check:['Preparar material','Agendar turmas','Registrar presença'], checkDone:[0,0,0] },
        ]},
        { id:'c2', name:'Em Andamento', color:'#3b82f6', cards:[
          { id:'k2', title:'Implementar MFA', resp:'João TI', prazo: futureDate(7), prio:'Alta', tag:'TI', check:['Mapear sistemas','Configurar','Testar','Deploy'], checkDone:[1,1,0,0] },
          { id:'k3', title:'Canal de Denúncias – Divulgação', resp:'Ana Paula', prazo: futureDate(10), prio:'Crítica', tag:'RH', check:['Criar cartilha','Enviar comunicado'], checkDone:[1,0] },
        ]},
        { id:'c3', name:'Em Revisão', color:'#f59e0b', cards:[] },
        { id:'c4', name:'Concluído', color:'#00c49a', cards:[
          { id:'k4', title:'Revisão Contratos Fornecedores', resp:'Carlos Mendes', prazo: futureDate(-10), prio:'Baixa', tag:'Jurídico', check:['Levantar contratos','Analisar','Assinar'], checkDone:[1,1,1] },
        ]},
      ]
    },
    'denuncias': {
      name:'Denúncias', color:'#ef4444',
      cols:[
        { id:'d1', name:'Aberta', color:'#3b82f6', cards:[
          { id:'j1', title:'DN-2025-002 · Assédio / BH', resp:'Fernanda Lima', prazo: futureDate(3), prio:'Crítica', tag:'Assédio', check:['Registrar','Notificar comitê','Iniciar investigação'], checkDone:[1,0,0] },
        ]},
        { id:'d2', name:'Em Análise', color:'#f59e0b', cards:[
          { id:'j2', title:'DN-2025-001 · Fraude / SP', resp:'Carlos Mendes', prazo: futureDate(5), prio:'Alta', tag:'Fraude', check:['Coletar evidências','Entrevistar','Relatório'], checkDone:[1,1,0] },
        ]},
        { id:'d3', name:'Encerrada', color:'#00c49a', cards:[
          { id:'j3', title:'DN-2025-003 · Conduta / RJ', resp:'Ana Paula', prazo: futureDate(-20), prio:'Média', tag:'Conduta', check:['Apurar','Decisão','Comunicar'], checkDone:[1,1,1] },
        ]},
        { id:'d4', name:'Arquivada', color:'#94a3b8', cards:[] },
      ]
    },
    'mapa-risco': {
      name:'Mapeamento de Risco', color:'#8b5cf6',
      cols:[
        { id:'r1', name:'Identificado', color:'#94a3b8', cards:[
          { id:'m1', title:'Vazamento de dados – TI', resp:'João TI', prazo: futureDate(14), prio:'Crítica', tag:'TI', check:['Mapear','Avaliar probabilidade','Definir controle'], checkDone:[1,1,0] },
        ]},
        { id:'r2', name:'Em Avaliação', color:'#f59e0b', cards:[
          { id:'m2', title:'Fraude Conciliação – Fin', resp:'Maria Fin', prazo: futureDate(7), prio:'Alta', tag:'Financeiro', check:['Analisar impacto','Propor mitigação'], checkDone:[1,0] },
        ]},
        { id:'r3', name:'Mitigação em Andamento', color:'#3b82f6', cards:[] },
        { id:'r4', name:'Residual Aceito', color:'#00c49a', cards:[] },
      ]
    }
  },
  _ids: { filial:17, risco:20, ctrl:6, plano:6, dn:200, fbCard:100, rmPlano:17, agenda:1 },
  agenda: []
};

function futureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════
const PAGE_TITLES = {
  relatorios:'Relatórios — Canal de Denúncia',
  importar:'Importar Planilha de Denúncias',
  dashboard:'Dashboard', filiais:'Filiais e Setores', 'mapa-risco':'Mapeamento de Risco',
  controles:'Controles Internos', 'planos-acao':'Planos de Ação',
  'canal-denuncia':'Canal de Denúncia', flowboard:'Flow Board',
  'due-diligence':'Due Diligence — KYC & Mídias Negativas'
};
let currentPage = 'dashboard';

function _gotoImpl(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-'+page)?.classList.add('active');
  document.querySelectorAll('#sidebar nav a').forEach(a => a.classList.remove('active'));
  const link = document.querySelector(`[data-page="${page}"]`);
  if(link) link.classList.add('active');
  if(el && el.classList) el.classList.add('active');
  document.getElementById('topbar-title').textContent = PAGE_TITLES[page] || page;
  currentPage = page;
  if(page === 'dashboard') renderDashboard();
  if(page === 'agenda') renderAgenda();
  if(page === 'filiais') renderFiliais();
  if(page === 'mapa-risco') { renderMapaRisco(); }
  if(page === 'controles') renderControles();
  if(page === 'planos-acao') renderPlanos();
  if(page === 'canal-denuncia') renderDenuncias();
  if(page === 'flowboard') renderFlowboard();
  closeMobile();
}

// ══════════════════════════════════════════
// MODAL HELPERS
// ══════════════════════════════════════════
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if(e.target === m) m.classList.remove('open'); });
});

// ══════════════════════════════════════════
// DATE & BADGE HELPERS
// ══════════════════════════════════════════
function formatDate(d) {
  if (!d) return '—';
  const [date] = d.split(' ');
  return date;
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
// DASHBOARD
// ══════════════════════════════════════════

// ══════════════════════════════════════════
// DASHBOARD DRILLDOWN
// ══════════════════════════════════════════
function openDashDrill(type) {
  const panel = document.getElementById('dash-drilldown');
  const thead = document.getElementById('dash-dd-thead').querySelector('tr');
  const tbody = document.getElementById('dash-dd-tbody');
  const icon_el = document.getElementById('dash-dd-icon');
  const title_el = document.getElementById('dash-dd-title');
  const count_el = document.getElementById('dash-dd-count');
  const header = document.getElementById('dash-dd-header');

  let rows = '', icon = '', title = '', color = 'var(--primary)', count = 0;

  if(type === 'controles') {
    icon = '🛡️'; title = 'Controles Internos'; color = 'var(--accent)';
    const items = (DB.controles||[]).slice().sort((a,b) => {
      const ord = {'Vencido':0,'Em Andamento':1,'Pendente':2,'Não Iniciado':3,'Concluído':4};
      return (ord[a.status]??5) - (ord[b.status]??5);
    });
    count = items.length;
    const statusCor = {'Concluído':'#10b981','Em Andamento':'#3b82f6','Pendente':'#f59e0b','Vencido':'#ef4444','Não Iniciado':'#94a3b8'};
    thead.innerHTML = '<th>Controle</th><th>Tipo</th><th>Filial / Setor</th><th>Responsável</th><th>Prazo</th><th>Progresso</th><th>Status</th>';
    rows = items.length ? items.map(c => {
      const sc = statusCor[c.status]||'#94a3b8';
      return `<tr>
        <td style="font-weight:700;font-size:.84rem">${c.nome}</td>
        <td style="font-size:.78rem">${c.tipo||'—'}</td>
        <td style="font-size:.78rem">${c.filial||'—'}<br><small style="color:var(--text-muted)">${c.setor||''}</small></td>
        <td style="font-size:.78rem">${c.resp||'—'}</td>
        <td style="font-size:.78rem">${prazoChip(c.prazo)}</td>
        <td style="min-width:80px">${progBar(c.prog||0)}</td>
        <td><span style="background:${sc};color:#fff;padding:2px 10px;border-radius:20px;font-size:.74rem;font-weight:700">${c.status}</span></td>
      </tr>`;
    }).join('') : '<tr><td colspan="7" class="empty"><div class="ico">✅</div>Nenhum controle cadastrado.</td></tr>';

  } else if(type === 'riscos') {
    icon = '⚠️'; title = 'Riscos Altos e Críticos'; color = 'var(--warn)';
    const items = (DB.riscos||[])
      .filter(r => ['Alto','Crítico'].includes(nivelRisco(r.prob, r.impacto)))
      .sort((a,b) => (b.prob*b.impacto) - (a.prob*a.impacto));
    count = items.length;
    const nvCor = {'Crítico':'#ef4444','Alto':'#f59e0b','Médio':'#3b82f6','Baixo':'#10b981'};
    thead.innerHTML = '<th>Risco</th><th>Unidade</th><th>Categoria</th><th>Dono / Setor</th><th>P</th><th>I</th><th>Nível</th><th>Controle</th>';
    rows = items.length ? items.map(r => {
      const nv = nivelRisco(r.prob, r.impacto);
      return `<tr>
        <td style="font-weight:700;font-size:.84rem;max-width:200px">${r.desc}</td>
        <td style="font-size:.78rem">${r.unidade||'—'}</td>
        <td style="font-size:.78rem">${r.cat||'—'}</td>
        <td style="font-size:.78rem">${r.setor||'—'}</td>
        <td style="text-align:center;font-weight:700">${r.prob}</td>
        <td style="text-align:center;font-weight:700">${r.impacto}</td>
        <td><span style="background:${nvCor[nv]};color:#fff;padding:2px 10px;border-radius:20px;font-size:.74rem;font-weight:700">${r.prob*r.impacto} ${nv}</span></td>
        <td style="font-size:.78rem;max-width:160px">${r.controle||'—'}</td>
      </tr>`;
    }).join('') : '<tr><td colspan="8" class="empty"><div class="ico">✅</div>Nenhum risco alto ou crítico.</td></tr>';

  } else if(type === 'acoes') {
    icon = '🚨'; title = 'Ações e Planos Vencidos'; color = 'var(--danger)';
    // Combine DB.planos (controles) + DB.rmPlanos (mapeamento)
    const planosVenc = (DB.planos||[]).filter(p => p.status === 'Vencido').map(p => ({...p, _tipo:'Controle Interno'}));
    const rmVenc = (DB.rmPlanos||[]).filter(p => p.status === 'Vencido').map(p => {
      const risco = (DB.riscos||[]).find(r=>r.id===p.riscoId);
      return {...p, origem: risco ? risco.desc.slice(0,40)+'…' : 'Mapeamento', _tipo:'Mapeamento de Risco'};
    });
    const items = [...planosVenc, ...rmVenc].sort((a,b) => (a.prazo||'').localeCompare(b.prazo||''));
    count = items.length;
    thead.innerHTML = '<th>Ação / Plano</th><th>Tipo</th><th>Origem / Filial</th><th>Responsável</th><th>Prazo</th><th>Progresso</th>';
    rows = items.length ? items.map(p => `<tr>
      <td style="font-weight:700;font-size:.84rem;max-width:200px">${p.titulo||p.nome||'—'}</td>
      <td><span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:10px;font-size:.73rem;font-weight:700">${p._tipo}</span></td>
      <td style="font-size:.78rem">${p.origem||p.filial||'—'}</td>
      <td style="font-size:.78rem">${p.resp||'—'}</td>
      <td>${prazoChip(p.prazo)}</td>
      <td style="min-width:80px">${progBar(p.prog||0,'red')}</td>
    </tr>`).join('') : '<tr><td colspan="6" class="empty"><div class="ico">✅</div>Nenhuma ação vencida.</td></tr>';

  } else if(type === 'denuncias') {
    icon = '📢'; title = 'Denúncias em Aberto'; color = 'var(--info)';
    const items = (DB.denuncias||[])
      .filter(d => ['Aberta','Em Análise'].includes(d.status))
      .sort((a,b) => (b.data||'').localeCompare(a.data||''));
    count = items.length;
    const pgCor = {'Leve':'#10b981','Médio':'#f59e0b','Grave':'#ef4444','Gravíssima':'#8b5cf6'};
    thead.innerHTML = '<th>Protocolo</th><th>Tipo</th><th>Filial / Setor</th><th>Recebida em</th><th>Perigo</th><th>Status</th><th>SLA</th>';
    rows = items.length ? items.map(d => {
      const dias = d.data ? Math.floor((new Date()-new Date(d.data))/86400000) : 0;
      const pct = Math.min(Math.round(dias/90*100),100);
      const slaCor = pct>=100?'#ef4444':pct>=70?'#f59e0b':'#10b981';
      return `<tr style="cursor:pointer" onclick="goto('canal-denuncia',document.querySelector('[data-page=canal-denuncia]'));closeDashDrill()">
        <td><strong style="font-family:'DM Mono',monospace;font-size:.78rem">${d.proto}</strong></td>
        <td style="font-size:.78rem">${d.cat}</td>
        <td style="font-size:.78rem">${d.filial}<br><small style="color:var(--text-muted)">${d.setor||''}</small></td>
        <td style="font-size:.78rem">${formatDate(d.data)}</td>
        <td><span style="background:${pgCor[d.perigo]||'#94a3b8'};color:#fff;padding:2px 8px;border-radius:10px;font-size:.73rem;font-weight:700">${d.perigo||'—'}</span></td>
        <td style="font-size:.78rem">${d.status}</td>
        <td style="font-size:.78rem;color:${slaCor};font-weight:700">${dias}d / 90d</td>
      </tr>`;
    }).join('') : '<tr><td colspan="7" class="empty"><div class="ico">✅</div>Nenhuma denúncia aberta.</td></tr>';
  }

  icon_el.textContent = icon;
  title_el.textContent = title;
  count_el.textContent = '· ' + count + ' item' + (count!==1?'s':'');
  header.style.borderBottomColor = color;
  tbody.innerHTML = rows;
  panel.style.display = '';
  panel.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function closeDashDrill() {
  const panel = document.getElementById('dash-drilldown');
  if(panel) panel.style.display = 'none';
}

function renderDashboard() {
  // KPIs
  // ── KPIs corrigidos
  document.getElementById('dash-total-controles').textContent = DB.controles.length;
  // Riscos: Alto + Crítico em todos os riscos (DB.riscos inclui PDV, Inventário, TI etc)
  const riscoAltos = (DB.riscos||[]).filter(r => ['Alto','Crítico'].includes(nivelRisco(r.prob, r.impacto))).length;
  document.getElementById('dash-riscos-altos').textContent = riscoAltos;
  // Ações vencidas: DB.planos (controles internos) + DB.rmPlanos (mapeamento de risco)
  const acVenc = (DB.planos||[]).filter(p => p.status === 'Vencido').length
               + (DB.rmPlanos||[]).filter(p => p.status === 'Vencido').length;
  document.getElementById('dash-acoes-venc').textContent = acVenc;
  // Denúncias em aberto: Abertas + Em Análise (mesmo critério do Relatório KPI)
  const dnAbertas   = (DB.denuncias||[]).filter(d => d.status === 'Aberta').length;
  const dnAnalise   = (DB.denuncias||[]).filter(d => d.status === 'Em Análise').length;
  const dnEmAberto  = dnAbertas + dnAnalise;
  document.getElementById('dash-denuncias').textContent = dnEmAberto;
  const subEl = document.getElementById('dash-denuncias-sub');
  if(subEl) subEl.textContent = dnAbertas + ' abertas · ' + dnAnalise + ' em análise';

  // Chart riscos
  const lvls = ['Crítico','Alto','Médio','Baixo'];
  const colors = ['#8b5cf6','#ef4444','#f59e0b','#00c49a'];
  const rCounts = lvls.map(l => DB.riscos.filter(r => nivelRisco(r.prob, r.impacto) === l).length);
  const rMax = Math.max(...rCounts, 1);
  document.getElementById('chart-riscos').innerHTML = lvls.map((l,i) =>
    `<div class="bar-row"><div class="bar-label">${l}</div><div class="bar-track"><div class="bar-fill" style="width:${rCounts[i]/rMax*100}%;background:${colors[i]}"></div></div><div class="bar-val">${rCounts[i]}</div></div>`
  ).join('');

  // Chart controles
  const cStatuses = ['Concluído','Em Andamento','Pendente','Vencido','Não Iniciado'];
  const cColors = ['#00c49a','#3b82f6','#f59e0b','#ef4444','#94a3b8'];
  const cCounts = cStatuses.map(s => DB.controles.filter(c => c.status === s).length);
  const cMax = Math.max(...cCounts, 1);
  document.getElementById('chart-controles').innerHTML = cStatuses.map((s,i) =>
    `<div class="bar-row"><div class="bar-label">${s}</div><div class="bar-track"><div class="bar-fill" style="width:${cCounts[i]/cMax*100}%;background:${cColors[i]}"></div></div><div class="bar-val">${cCounts[i]}</div></div>`
  ).join('');

  // Chart planos
  const pStatuses = ['Não Iniciado','Em Andamento','Concluído','Vencido'];
  const pColors = ['#94a3b8','#3b82f6','#00c49a','#ef4444'];
  const pCounts = pStatuses.map(s => DB.planos.filter(p => p.status === s).length);
  const pMax = Math.max(...pCounts, 1);
  document.getElementById('chart-planos').innerHTML = pStatuses.map((s,i) =>
    `<div class="bar-row"><div class="bar-label">${s}</div><div class="bar-track"><div class="bar-fill" style="width:${pCounts[i]/pMax*100}%;background:${pColors[i]}"></div></div><div class="bar-val">${pCounts[i]}</div></div>`
  ).join('');

  // Chart denuncias - by perigo level
  const pLvls = ['Leve','Médio','Grave','Gravíssima'];
  const pColors2 = ['#10b981','#f59e0b','#ef4444','#8b5cf6'];
  const pCounts2 = pLvls.map(l => DB.denuncias.filter(d => d.perigo === l).length);
  const pMax2 = Math.max(...pCounts2, 1);
  document.getElementById('chart-denuncias').innerHTML = pLvls.map((l,i) =>
    `<div class="bar-row"><div class="bar-label">${l}</div><div class="bar-track"><div class="bar-fill" style="width:${pCounts2[i]/pMax2*100}%;background:${pColors2[i]}"></div></div><div class="bar-val">${pCounts2[i]}</div></div>`
  ).join('');

  // Controles urgentes
  const ctrlUrg = DB.controles.filter(c => {
    const diff = diasAte(c.prazo);
    return diff !== null && diff <= 10;
  }).sort((a,b) => diasAte(a.prazo) - diasAte(b.prazo)).slice(0,5);
  const tbCtrl = document.getElementById('dash-controles-urgentes');
  if(ctrlUrg.length === 0) {
    document.getElementById('dash-empty-ctrl').classList.remove('hidden');
    tbCtrl.innerHTML = '';
  } else {
    document.getElementById('dash-empty-ctrl').classList.add('hidden');
    tbCtrl.innerHTML = ctrlUrg.map(c =>
      `<tr><td><strong>${c.nome}</strong></td><td>${c.filial}<br><small style="color:var(--text-muted)">${c.setor}</small></td><td>${prazoChip(c.prazo)}</td><td>${statusBadge(c.status)}</td></tr>`
    ).join('');
  }

  // Ações urgentes
  const acUrg = DB.planos.filter(p => {
    const diff = diasAte(p.prazo);
    return diff !== null && diff <= 10;
  }).sort((a,b) => diasAte(a.prazo) - diasAte(b.prazo)).slice(0,5);
  const tbAc = document.getElementById('dash-acoes-urgentes');
  if(acUrg.length === 0) {
    document.getElementById('dash-empty-acao').classList.remove('hidden');
    tbAc.innerHTML = '';
  } else {
    document.getElementById('dash-empty-acao').classList.add('hidden');
    tbAc.innerHTML = acUrg.map(p =>
      `<tr><td><strong>${p.titulo}</strong></td><td>${p.resp}</td><td>${prazoChip(p.prazo)}</td><td>${statusBadge(p.status)}</td></tr>`
    ).join('');
  }
}

// ══════════════════════════════════════════
// FILIAIS
// ══════════════════════════════════════════
function renderFiliais() {
  const q = document.getElementById('filtro-filial').value.toLowerCase();
  const grid = document.getElementById('filiais-grid');
  const items = DB.filiais.filter(f =>
    f.nome.toLowerCase().includes(q) || f.setor.toLowerCase().includes(q) ||
    (f.setores||'').toLowerCase().includes(q)
  );
  if(items.length === 0) { grid.innerHTML = '<div class="empty"><div class="ico">🏢</div>Nenhuma filial encontrada.</div>'; return; }
  grid.innerHTML = items.map(f => {
    const setoresArr = (f.setores||'').split(',').map(s=>s.trim()).filter(Boolean);
    const riscos = DB.riscos.filter(r => r.filial === f.nome).length;
    const controles = DB.controles.filter(c => c.filial === f.nome).length;
    const planos = DB.planos.filter(p => p.filial === f.nome).length;
    return `<div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:20px;position:relative">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="width:44px;height:44px;border-radius:10px;background:rgba(0,196,154,.1);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">🏢</div>
        <div>
          <div style="font-weight:700;font-size:.94rem;color:var(--primary)">${f.nome}</div>
          <div style="font-size:.76rem;color:var(--text-muted)">${f.cidade} · ${f.cnpj}</div>
        </div>
      </div>
      <div style="font-size:.8rem;margin-bottom:10px"><strong>Resp. Compliance:</strong> ${f.resp}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
        ${setoresArr.map(s=>`<span style="background:#f0f4f8;border-radius:20px;padding:2px 10px;font-size:.73rem;font-weight:600;color:var(--text-muted)">${s}</span>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div style="background:#f8fafc;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.1rem;font-weight:700;color:var(--primary)">${riscos}</div>
          <div style="font-size:.7rem;color:var(--text-muted)">Riscos</div>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.1rem;font-weight:700;color:var(--primary)">${controles}</div>
          <div style="font-size:.7rem;color:var(--text-muted)">Controles</div>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.1rem;font-weight:700;color:var(--primary)">${planos}</div>
          <div style="font-size:.7rem;color:var(--text-muted)">Planos</div>
        </div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-outline btn-sm" onclick="editFilial(${f.id})">✏️ Editar</button>
        <button class="btn btn-danger btn-sm" onclick="delFilial(${f.id})">🗑</button>
      </div>
    </div>`;
  }).join('');
}

function openModalFilial(id) {
  document.getElementById('f-filial-nome').value = '';
  document.getElementById('f-filial-cnpj').value = '';
  document.getElementById('f-filial-cidade').value = '';
  document.getElementById('f-filial-resp').value = '';
  document.getElementById('f-filial-setores').value = '';
  openModal('modal-filial');
}

function editFilial(id) {
  const f = DB.filiais.find(x => x.id === id);
  if(!f) return;
  document.getElementById('f-filial-nome').value = f.nome;
  document.getElementById('f-filial-cnpj').value = f.cnpj;
  document.getElementById('f-filial-cidade').value = f.cidade;
  document.getElementById('f-filial-resp').value = f.resp;
  document.getElementById('f-filial-setores').value = f.setores;
  document.getElementById('f-filial-setor').value = f.setor;
  openModal('modal-filial');
  // store edit target
  window._editFilialId = id;
}

function salvarFilial() {
  const nome = document.getElementById('f-filial-nome').value.trim();
  if(!nome) { alert('Informe o nome da filial.'); return; }
  if(window._editFilialId) {
    const f = DB.filiais.find(x => x.id === window._editFilialId);
    if(f) {
      f.nome = nome; f.cnpj = document.getElementById('f-filial-cnpj').value;
      f.cidade = document.getElementById('f-filial-cidade').value;
      f.resp = document.getElementById('f-filial-resp').value;
      f.setor = document.getElementById('f-filial-setor').value;
      f.setores = document.getElementById('f-filial-setores').value;
    }
    window._editFilialId = null;
  } else {
    DB.filiais.push({
      id: DB._ids.filial++,
      nome, cnpj: document.getElementById('f-filial-cnpj').value,
      cidade: document.getElementById('f-filial-cidade').value,
      resp: document.getElementById('f-filial-resp').value,
      setor: document.getElementById('f-filial-setor').value,
      setores: document.getElementById('f-filial-setores').value
    });
  }
  closeModal('modal-filial');
  populateFilialSelects();
  renderFiliais();
  const _fSaved = window._editFilialId
    ? DB.filiais.find(f => f.id === window._editFilialId)
    : DB.filiais[DB.filiais.length - 1];
  window._editFilialId = null;
  if(_fSaved) {
    saveLocalCache();
    sbSaveFilial(_fSaved).then(() => setSaveIndicator('☁️ Filial salva na nuvem','var(--accent)'));
  }
}

function delFilial(id) {
  if(!confirm('Excluir esta filial?')) return;
  DB.filiais = DB.filiais.filter(f => f.id !== id);
  populateFilialSelects();
  renderFiliais();
  saveLocalCache();
  sbDeleteFilial(id).then(() => setSaveIndicator('☁️ Filial excluída','var(--accent)'));
}

// ══════════════════════════════════════════
// MAPA DE RISCO
// ══════════════════════════════════════════
function renderRiscos() {
  const q = document.getElementById('filtro-risco-txt').value.toLowerCase();
  const nivel = document.getElementById('filtro-risco-nivel').value;
  const filial = document.getElementById('filtro-risco-filial').value;
  const tb = document.getElementById('tb-riscos');
  const items = DB.riscos.filter(r => {
    const niv = nivelRisco(r.prob, r.impacto);
    return (!q || r.desc.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q)) &&
           (!nivel || niv === nivel) &&
           (!filial || r.filial === filial);
  });
  if(items.length === 0) { tb.innerHTML = '<tr><td colspan="8" class="empty"><div class="ico">🗺️</div>Nenhum risco encontrado.</td></tr>'; return; }
  tb.innerHTML = items.map(r => {
    const niv = nivelRisco(r.prob, r.impacto);
    const score = r.prob * r.impacto;
    return `<tr>
      <td><strong>${r.desc}</strong></td>
      <td>${r.cat}</td>
      <td>${r.filial}<br><small style="color:var(--text-muted)">${r.setor}</small></td>
      <td style="text-align:center">${r.prob}/5</td>
      <td style="text-align:center">${r.impacto}/5</td>
      <td><span style="font-weight:700">${score}</span> ${statusBadge(niv)}</td>
      <td style="max-width:180px;font-size:.82rem">${r.controle||'—'}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editRisco(${r.id})">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="delRisco(${r.id})">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

function renderHeatMap() {
  const container = document.getElementById('heat-map');
  const probs = [5,4,3,2,1];
  const impacts = [1,2,3,4,5];
  const getColor = score => {
    if(score >= 16) return '#f3e8ff';
    if(score >= 9) return '#fee2e2';
    if(score >= 4) return '#fef3c7';
    return '#d1fae5';
  };
  const getTextColor = score => {
    if(score >= 16) return '#7e22ce';
    if(score >= 9) return '#991b1b';
    if(score >= 4) return '#92400e';
    return '#065f46';
  };
  let html = '<div style="display:flex;align-items:center;justify-content:center;font-size:.65rem;color:var(--text-muted);font-weight:700">P↕ / I→</div>';
  impacts.forEach(i => {
    html += `<div style="display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:var(--text-muted)">I=${i}</div>`;
  });
  probs.forEach(p => {
    html += `<div style="display:flex;align-items:center;justify-content:flex-end;padding-right:6px;font-size:.7rem;font-weight:700;color:var(--text-muted)">P=${p}</div>`;
    impacts.forEach(i => {
      const score = p * i;
      const count = DB.riscos.filter(r => r.prob === p && r.impacto === i).length;
      html += `<div style="background:${getColor(score)};color:${getTextColor(score)};border-radius:6px;padding:6px;text-align:center;font-size:.75rem;font-weight:700;border:1px solid rgba(0,0,0,.07)">
        ${score}${count > 0 ? `<div style="font-size:.65rem;margin-top:2px">${count} risco${count>1?'s':''}</div>` : ''}
      </div>`;
    });
  });
  container.innerHTML = html;
}

function openModalRisco() {
  window._editRiscoId = null;
  document.getElementById('f-risco-id').value = '';
  ['f-risco-desc','f-risco-setor','f-risco-controle','f-risco-obs'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-risco-prob').value = '3';
  document.getElementById('f-risco-impacto').value = '3';
  openModal('modal-risco');
}

function editRisco(id) {
  const r = DB.riscos.find(x => x.id === id);
  if(!r) return;
  window._editRiscoId = id;
  document.getElementById('f-risco-desc').value = r.desc;
  document.getElementById('f-risco-cat').value = r.cat;
  document.getElementById('f-risco-filial').value = r.filial;
  document.getElementById('f-risco-setor').value = r.setor;
  document.getElementById('f-risco-prob').value = r.prob;
  document.getElementById('f-risco-impacto').value = r.impacto;
  document.getElementById('f-risco-controle').value = r.controle;
  document.getElementById('f-risco-obs').value = r.obs;
  openModal('modal-risco');
}

function salvarRisco() {
  const desc = document.getElementById('f-risco-desc').value.trim();
  if(!desc) { alert('Informe a descrição do risco.'); return; }
  const data = {
    desc, cat: document.getElementById('f-risco-cat').value,
    filial: document.getElementById('f-risco-filial').value,
    setor: document.getElementById('f-risco-setor').value,
    prob: +document.getElementById('f-risco-prob').value,
    impacto: +document.getElementById('f-risco-impacto').value,
    controle: document.getElementById('f-risco-controle').value,
    obs: document.getElementById('f-risco-obs').value
  };
  if(window._editRiscoId) {
    Object.assign(DB.riscos.find(r => r.id === window._editRiscoId), data);
  } else {
    DB.riscos.push({ id: DB._ids.risco++, ...data });
  }
  closeModal('modal-risco');
  renderRiscos();
  renderHeatMap();
  saveLocalCache();
  const _rId = window._editRiscoId;
  const _rSaved = _rId ? DB.riscos.find(r=>r.id===_rId) : DB.riscos[DB.riscos.length-1];
  window._editRiscoId = null;
  if(_rSaved) sbSaveRisco(_rSaved).then(()=>setSaveIndicator('☁️ Risco salvo na nuvem','var(--accent)'));
}

function delRisco(id) {
  if(!confirm('Excluir este risco?')) return;
  DB.riscos = DB.riscos.filter(r => r.id !== id);
  renderRiscos(); renderHeatMap();
  saveLocalCache();
  sbDeleteRisco(id).then(()=>setSaveIndicator('☁️ Risco excluído','var(--accent)'));
}

// ══════════════════════════════════════════
// CONTROLES INTERNOS
// ══════════════════════════════════════════
function renderControles() {
  const q = document.getElementById('filtro-ctrl-txt').value.toLowerCase();
  const st = document.getElementById('filtro-ctrl-status').value;
  const fi = document.getElementById('filtro-ctrl-filial').value;
  const tb = document.getElementById('tb-controles');
  const items = DB.controles.filter(c =>
    (!q || c.nome.toLowerCase().includes(q) || c.resp.toLowerCase().includes(q)) &&
    (!st || c.status === st) &&
    (!fi || c.filial === fi)
  );
  if(items.length === 0) { tb.innerHTML = '<tr><td colspan="9" class="empty"><div class="ico">🔒</div>Nenhum controle encontrado.</td></tr>'; return; }
  const progClass = v => v >= 100 ? 'teal' : v >= 50 ? 'teal' : 'amber';
  tb.innerHTML = items.map(c => `<tr>
    <td><strong>${c.nome}</strong><br><small style="color:var(--text-muted)">${c.desc||''}</small></td>
    <td>${c.tipo}</td>
    <td>${c.filial}<br><small style="color:var(--text-muted)">${c.setor}</small></td>
    <td>${c.resp}</td>
    <td>${c.period}</td>
    <td>${prazoChip(c.prazo)}</td>
    <td>${statusBadge(c.status)}</td>
    <td>${progBar(c.prog||0, c.status==='Vencido'?'red':progClass(c.prog||0))}</td>
    <td>
      <button class="btn btn-outline btn-sm" onclick="editControle(${c.id})">✏️</button>
      <button class="btn btn-danger btn-sm" onclick="delControle(${c.id})">🗑</button>
    </td>
  </tr>`).join('');
}

function openModalControle() {
  window._editCtrlId = null;
  ['f-ctrl-nome','f-ctrl-setor','f-ctrl-resp','f-ctrl-prazo','f-ctrl-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-ctrl-prog').value = 0;
  openModal('modal-controle');
}

function editControle(id) {
  const c = DB.controles.find(x => x.id === id);
  if(!c) return;
  window._editCtrlId = id;
  document.getElementById('f-ctrl-nome').value = c.nome;
  document.getElementById('f-ctrl-tipo').value = c.tipo;
  document.getElementById('f-ctrl-filial').value = c.filial;
  document.getElementById('f-ctrl-setor').value = c.setor;
  document.getElementById('f-ctrl-resp').value = c.resp;
  document.getElementById('f-ctrl-period').value = c.period;
  document.getElementById('f-ctrl-prazo').value = c.prazo;
  document.getElementById('f-ctrl-status').value = c.status;
  document.getElementById('f-ctrl-prog').value = c.prog||0;
  document.getElementById('f-ctrl-desc').value = c.desc||'';
  openModal('modal-controle');
}

function salvarControle() {
  const nome = document.getElementById('f-ctrl-nome').value.trim();
  if(!nome) { alert('Informe o nome do controle.'); return; }
  const data = {
    nome, tipo: document.getElementById('f-ctrl-tipo').value,
    filial: document.getElementById('f-ctrl-filial').value,
    setor: document.getElementById('f-ctrl-setor').value,
    resp: document.getElementById('f-ctrl-resp').value,
    period: document.getElementById('f-ctrl-period').value,
    prazo: document.getElementById('f-ctrl-prazo').value,
    status: document.getElementById('f-ctrl-status').value,
    prog: +document.getElementById('f-ctrl-prog').value,
    desc: document.getElementById('f-ctrl-desc').value
  };
  if(window._editCtrlId) {
    Object.assign(DB.controles.find(c => c.id === window._editCtrlId), data);
  } else {
    DB.controles.push({ id: DB._ids.ctrl++, ...data });
  }
  closeModal('modal-controle');
  renderControles();
  saveLocalCache();
  const _cId = window._editCtrlId;
  const _cSaved = _cId ? DB.controles.find(c=>c.id===_cId) : DB.controles[DB.controles.length-1];
  window._editCtrlId = null;
  if(_cSaved) sbSaveControle(_cSaved).then(()=>setSaveIndicator('☁️ Controle salvo na nuvem','var(--accent)'));
}

function delControle(id) {
  if(!confirm('Excluir este controle?')) return;
  DB.controles = DB.controles.filter(c => c.id !== id);
  renderControles();
  saveLocalCache();
  sbDeleteControle(id).then(()=>setSaveIndicator('☁️ Controle excluído','var(--accent)'));
}

// ══════════════════════════════════════════
// PLANOS DE AÇÃO
// ══════════════════════════════════════════
let planoFilter = '';
function filterPlanos(st, el) {
  planoFilter = st;
  document.querySelectorAll('#planos-tabs .pill-tab').forEach(t => t.classList.remove('active'));
  if(el) el.classList.add('active');
  renderPlanos();
}

function renderPlanos() {
  const q = document.getElementById('filtro-plano-txt').value.toLowerCase();
  const fi = document.getElementById('filtro-plano-filial').value;
  const pr = document.getElementById('filtro-plano-prioridade').value;
  const tb = document.getElementById('tb-planos');
  const items = DB.planos.filter(p =>
    (!planoFilter || p.status === planoFilter) &&
    (!q || p.titulo.toLowerCase().includes(q) || p.resp.toLowerCase().includes(q)) &&
    (!fi || p.filial === fi) &&
    (!pr || p.prio === pr)
  );
  if(items.length === 0) { tb.innerHTML = '<tr><td colspan="9" class="empty"><div class="ico">📋</div>Nenhum plano encontrado.</td></tr>'; return; }
  tb.innerHTML = items.map(p => {
    const pc = p.status==='Vencido'?'red':p.prio==='Crítica'?'red':p.prio==='Alta'?'amber':'teal';
    return `<tr>
      <td><strong>${p.titulo}</strong>${p.desc?`<br><small style="color:var(--text-muted)">${p.desc}</small>`:''}</td>
      <td>${p.origem}</td>
      <td>${p.filial}<br><small style="color:var(--text-muted)">${p.setor}</small></td>
      <td>${p.resp}</td>
      <td>${prazoChip(p.prazo)}</td>
      <td>${statusBadge(p.prio)}</td>
      <td>${statusBadge(p.status)}</td>
      <td>${progBar(p.prog||0, pc)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editPlano(${p.id})">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="delPlano(${p.id})">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

function openModalPlano() {
  window._editPlanoId = null;
  ['f-plano-titulo','f-plano-setor','f-plano-resp','f-plano-prazo','f-plano-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-plano-prog').value = 0;
  openModal('modal-plano');
}

function editPlano(id) {
  const p = DB.planos.find(x => x.id === id);
  if(!p) return;
  window._editPlanoId = id;
  document.getElementById('f-plano-titulo').value = p.titulo;
  document.getElementById('f-plano-origem').value = p.origem;
  document.getElementById('f-plano-filial').value = p.filial;
  document.getElementById('f-plano-setor').value = p.setor;
  document.getElementById('f-plano-resp').value = p.resp;
  document.getElementById('f-plano-prazo').value = p.prazo;
  document.getElementById('f-plano-prio').value = p.prio;
  document.getElementById('f-plano-status').value = p.status;
  document.getElementById('f-plano-prog').value = p.prog||0;
  document.getElementById('f-plano-desc').value = p.desc||'';
  openModal('modal-plano');
}

function salvarPlano() {
  const titulo = document.getElementById('f-plano-titulo').value.trim();
  if(!titulo) { alert('Informe o título do plano.'); return; }
  const data = {
    titulo, origem: document.getElementById('f-plano-origem').value,
    filial: document.getElementById('f-plano-filial').value,
    setor: document.getElementById('f-plano-setor').value,
    resp: document.getElementById('f-plano-resp').value,
    prazo: document.getElementById('f-plano-prazo').value,
    prio: document.getElementById('f-plano-prio').value,
    status: document.getElementById('f-plano-status').value,
    prog: +document.getElementById('f-plano-prog').value,
    desc: document.getElementById('f-plano-desc').value
  };
  if(window._editPlanoId) {
    Object.assign(DB.planos.find(p => p.id === window._editPlanoId), data);
  } else {
    DB.planos.push({ id: DB._ids.plano++, ...data });
  }
  closeModal('modal-plano');
  renderPlanos();
  saveLocalCache();
  const _pId = window._editPlanoId;
  const _pSaved = _pId ? DB.planos.find(p=>p.id===_pId) : DB.planos[DB.planos.length-1];
  window._editPlanoId = null;
  if(_pSaved) sbSavePlano(_pSaved).then(()=>setSaveIndicator('☁️ Plano salvo na nuvem','var(--accent)'));
}

function delPlano(id) {
  if(!confirm('Excluir este plano?')) return;
  DB.planos = DB.planos.filter(p => p.id !== id);
  renderPlanos();
  saveLocalCache();
  sbDeletePlano(id).then(()=>setSaveIndicator('☁️ Plano excluído','var(--accent)'));
}


// ══════════════════════════════════════════
// DRILLDOWN DOS KPIs — CANAL DE DENÚNCIA
// ══════════════════════════════════════════
let _dnDdRows = [];
let _dnDdType = null;
let _dnDdSortCol = 'data';
let _dnDdSortDir = 'asc';

const _perigoOrderDn = { 'Gravíssima': 4, 'Grave': 3, 'Médio': 2, 'Leve': 1 };

function _dnDdVal(d, col) {
  switch(col) {
    case 'proto':  return d.proto || '';
    case 'cat':    return d.cat || '';
    case 'filial': return d.filial || '';
    case 'setor':  return d.setor || '';
    case 'data':   return d.data || '';
    case 'anon':   return d.anon || '';
    case 'perigo': return _perigoOrderDn[d.perigo] || 0;
    case 'status': return d.status || '';
    case 'conclusao': return d.conclusao || '';
    case 'resp':   return d.resp || '';
    default: return '';
  }
}

function dnDdSort(col, thEl) {
  if(_dnDdSortCol === col) {
    _dnDdSortDir = _dnDdSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    _dnDdSortCol = col;
    _dnDdSortDir = 'asc';
  }
  document.querySelectorAll('#dn-drilldown thead th').forEach(th => th.classList.remove('asc','desc'));
  if(thEl) thEl.classList.add(_dnDdSortDir);
  dnDdRenderRows();
}

function dnDdRenderRows() {
  const col = _dnDdSortCol;
  const dir = _dnDdSortDir;
  const sorted = [..._dnDdRows].sort((a, b) => {
    const va = _dnDdVal(a, col);
    const vb = _dnDdVal(b, col);
    if(typeof va === 'number') return dir === 'asc' ? va - vb : vb - va;
    return dir === 'asc'
      ? String(va).localeCompare(String(vb), 'pt-BR')
      : String(vb).localeCompare(String(va), 'pt-BR');
  });

  const tbody = document.getElementById('dn-dd-tbody');
  if(!tbody) return;

  if(sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="empty"><div class="ico">✅</div>Nenhuma denúncia neste grupo.</td></tr>';
  } else {
    const days2 = d => { const dt=_parseDataSafe(d.data); return dt ? Math.max(0,Math.floor((new Date()-dt)/86400000)) : 0; };
    tbody.innerHTML = sorted.map(d => {
      const dias = days2(d);
      const vencido = !['Encerrada','Arquivada'].includes(d.status) && dias > 90;
      const slaDisplay = vencido
        ? `<div class="sla-wrap"><div class="sla-label"><span style="color:var(--danger);font-weight:700">⚠ ${dias}d/90d</span><span style="color:var(--danger);font-weight:700">100%</span></div><div class="sla-bar"><div class="sla-fill over" style="width:100%"></div></div></div>`
        : slaBar(d.data, d.status);
      const rowBg = vencido ? 'background:#fff8f8' : '';
      return `<tr style="cursor:pointer;${rowBg}" onclick="openDnDetail(${d.id})" title="Ver relato completo">
        <td><strong style="font-family:'DM Mono',monospace;font-size:.78rem;white-space:nowrap">${d.proto}</strong></td>
        <td style="font-size:.78rem;max-width:130px">${d.cat}</td>
        <td style="font-size:.78rem;white-space:nowrap">${d.filial}</td>
        <td style="font-size:.78rem">${d.setor||'—'}</td>
        <td style="font-size:.78rem;white-space:nowrap">${formatDate(d.data)}</td>
        <td style="font-size:.78rem">${d.anon==='Anônima'?'🔒 Anônima':'👤 Identificada'}</td>
        <td>${perigoBadge(d.perigo)}</td>
        <td>${statusBadge(d.status)}</td>
        <td style="min-width:120px">${slaDisplay}</td>
        <td style="font-size:.78rem">${d.resp||'<span style="color:var(--text-muted)">—</span>'}</td>
        <td style="white-space:nowrap">
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();openDnDetail(${d.id})" title="Ver relato completo">👁</button>
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();editDenuncia(${d.id})" title="Editar">✏️</button>
        </td>
      </tr>`;
    }).join('');
  }

  const countEl = document.getElementById('dn-dd-count');
  if(countEl) countEl.textContent = `· ${sorted.length} denúncia${sorted.length!==1?'s':''}`;
}

function openDnDrilldown(type, icon, title) {
  _dnDdType = type;
  const all = DB.denuncias;
  let colorAccent = 'var(--accent)';

  // Select rows by type
  if(type === 'total') {
    _dnDdRows = [...all];
    colorAccent = 'var(--accent)';
    _dnDdSortCol = 'data'; _dnDdSortDir = 'desc';
  } else if(type === 'analise') {
    _dnDdRows = all.filter(d => d.status === 'Em Análise');
    colorAccent = 'var(--warn)';
    _dnDdSortCol = 'data'; _dnDdSortDir = 'asc';
  } else if(type === 'encerrada') {
    _dnDdRows = all.filter(d => ['Encerrada','Arquivada'].includes(d.status));
    colorAccent = 'var(--accent)';
    _dnDdSortCol = 'data'; _dnDdSortDir = 'desc';
  } else if(type === 'graves') {
    _dnDdRows = all.filter(d => ['Grave','Gravíssima'].includes(d.perigo));
    colorAccent = 'var(--danger)';
    _dnDdSortCol = 'perigo'; _dnDdSortDir = 'desc'; // gravíssimas primeiro
  } else if(type === 'sla') {
    _dnDdRows = all.filter(d => {
      if(['Encerrada','Arquivada'].includes(d.status)) return false;
      return !!_parseDataSafe(d.data) && Math.max(0,Math.floor((new Date()-_parseDataSafe(d.data))/86400000)) > 90;
    });
    colorAccent = 'var(--purple)';
    _dnDdSortCol = 'data'; _dnDdSortDir = 'asc'; // mais antigas primeiro
  }

  // Update header
  document.getElementById('dn-dd-icon').textContent = icon;
  document.getElementById('dn-dd-title').textContent = title;
  const header = document.getElementById('dn-dd-header');
  if(header) header.style.borderBottomColor = colorAccent;

  // Reset sort indicators
  document.querySelectorAll('#dn-drilldown thead th').forEach(th => th.classList.remove('asc','desc'));
  const activeTh = document.querySelector(`#dn-drilldown thead th[data-dncol="${_dnDdSortCol}"]`);
  if(activeTh) activeTh.classList.add(_dnDdSortDir);

  // Render
  dnDdRenderRows();

  // Show
  const panel = document.getElementById('dn-drilldown');
  panel.style.display = '';
  panel.style.animation = 'none';
  panel.offsetHeight; // reflow
  panel.style.animation = 'slideDown .2s ease';

  // Scroll into view
  setTimeout(() => panel.scrollIntoView({behavior:'smooth', block:'nearest'}), 60);
}

function closeDnDrilldown() {
  _dnDdType = null;
  _dnDdRows = [];
  const panel = document.getElementById('dn-drilldown');
  if(panel) panel.style.display = 'none';
  document.querySelectorAll('#dn-drilldown thead th').forEach(th => th.classList.remove('asc','desc'));
}


// ══════════════════════════════════════════
// DENÚNCIAS — TABS + SLA + PERIGO
// ══════════════════════════════════════════
let dnCurrentTab = 'recebidas';

function switchDnTab(tab, el) {
  dnCurrentTab = tab;
  document.querySelectorAll('.dn-pill-tab').forEach(b => b.classList.remove('active'));
  if(el) el.classList.add('active');
  document.getElementById('dn-tab-recebidas').style.display = (tab !== 'sla') ? '' : 'none';
  document.getElementById('dn-tab-sla').style.display = (tab === 'sla') ? '' : 'none';
  renderDenuncias();
}

function _parseDataSafe(dataStr) {
  if(!dataStr) return null;
  // Already ISO: 2026-04-16
  if(/^\d{4}-\d{2}-\d{2}/.test(String(dataStr))) {
    const d = new Date(String(dataStr).substring(0,10) + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }
  // DD/MM/YYYY
  const m1 = String(dataStr).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if(m1) {
    const y = m1[3].length===2 ? '20'+m1[3] : m1[3];
    const d = new Date(`${y}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }
  // MM/DD/YYYY
  const m2 = String(dataStr).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if(m2) {
    const d = new Date(`${m2[3]}-${m2[1].padStart(2,'0')}-${m2[2].padStart(2,'0')}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
function slaBar(dataStr, status) {
  if(['Encerrada','Arquivada'].includes(status)) {
    return '<span style="font-size:.75rem;color:var(--accent);font-weight:700">✅ Concluída</span>';
  }
  const dt = _parseDataSafe(dataStr);
  if(!dt) return '<span style="font-size:.75rem;color:var(--text-muted)">— / 90d</span>';
  const days = Math.max(0, Math.floor((new Date() - dt) / 86400000));
  const pct = Math.min(Math.round(days / 90 * 100), 100);
  const cls = pct >= 100 ? 'over' : pct >= 70 ? 'warn' : 'ok';
  const color = pct >= 100 ? 'var(--danger)' : pct >= 70 ? 'var(--warn)' : 'var(--accent)';
  return `<div class="sla-wrap">
    <div class="sla-label"><span style="color:${color}">${days}d / 90d</span><span style="color:${color}">${pct}%</span></div>
    <div class="sla-bar"><div class="sla-fill ${cls}" style="width:${pct}%"></div></div>
  </div>`;
}

function perigoBadge(p) {
  const map = { 'Leve':'badge-leve', 'Médio':'badge-medio', 'Grave':'badge-grave', 'Gravíssima':'badge-gravissima' };
  const ico = { 'Leve':'🟢', 'Médio':'🟡', 'Grave':'🔴', 'Gravíssima':'☣️' };
  return `<span class="badge ${map[p]||'badge-medio'}">${ico[p]||''}  ${p||'—'}</span>`;
}

function getFiltered() {
  const q = (document.getElementById('filtro-dn-txt')||{value:''}).value.toLowerCase();
  const cat = (document.getElementById('filtro-dn-categoria')||{value:''}).value;
  const perigo = (document.getElementById('filtro-dn-perigo')||{value:''}).value;
  const filial = (document.getElementById('filtro-dn-filial2')||{value:''}).value;
  return DB.denuncias.filter(d =>
    (!q || d.proto.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q) ||
           d.filial.toLowerCase().includes(q) || (d.relato||'').toLowerCase().includes(q)) &&
    (!cat || d.cat === cat) &&
    (!perigo || d.perigo === perigo) &&
    (!filial || d.filial === filial)
  );
}

// ── Sort state for main dn table
let _dnMainSortCol = 'data';
let _dnMainSortDir = 'desc';
// Sort state for SLA table
let _dnSlaSortCol = 'dias';
let _dnSlaSortDir = 'desc';

const _perigoOrderMain = { 'Gravíssima': 4, 'Grave': 3, 'Médio': 2, 'Leve': 1 };

function _dnMainVal(d, col) {
  switch(col) {
    case 'proto':  return d.proto || '';
    case 'cat':    return d.cat || '';
    case 'filial': return d.filial || '';
    case 'setor':  return d.setor || '';
    case 'data':   return d.data || '';
    case 'anon':   return d.anon || '';
    case 'perigo': return _perigoOrderMain[d.perigo] || 0;
    case 'status': return d.status || '';
    case 'resp':   return d.resp || '';
    case 'dias':   return d.data ? Math.floor((new Date()-new Date(d.data))/86400000) : 0;
    default:       return '';
  }
}

function _applySortDn(rows, col, dir) {
  return [...rows].sort((a, b) => {
    const va = _dnMainVal(a, col);
    const vb = _dnMainVal(b, col);
    if(typeof va === 'number') return dir === 'asc' ? va - vb : vb - va;
    return dir === 'asc'
      ? String(va).localeCompare(String(vb), 'pt-BR')
      : String(vb).localeCompare(String(va), 'pt-BR');
  });
}

function dnMainSort(col, thEl) {
  if(_dnMainSortCol === col) {
    _dnMainSortDir = _dnMainSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    _dnMainSortCol = col;
    _dnMainSortDir = 'asc';
  }
  // Update header indicators
  document.querySelectorAll('#dn-main-thead-tr th').forEach(th => th.classList.remove('asc','desc'));
  if(thEl) thEl.classList.add(_dnMainSortDir);
  // Re-render table body only (no full re-render to preserve KPIs)
  _renderDnMainBody();
}

function dnSlaSort(col, thEl) {
  if(_dnSlaSortCol === col) {
    _dnSlaSortDir = _dnSlaSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    _dnSlaSortCol = col;
    _dnSlaSortDir = 'asc';
  }
  document.querySelectorAll('#dn-sla-thead-tr th').forEach(th => th.classList.remove('asc','desc'));
  if(thEl) thEl.classList.add(_dnSlaSortDir);
  _renderDnSlaBody();
}

function _conclusaoBg(c){
  return {'Procedente':'#d1fae5','Improcedente':'#fee2e2','Inconclusiva':'#fef3c7','Arquivada':'#f1f5f9'}[c]||'#f8fafc';
}
function _conclusaoColor(c){
  return {'Procedente':'#065f46','Improcedente':'#991b1b','Inconclusiva':'#92400e','Arquivada':'#475569'}[c]||'#64748b';
}
function setConclusao(id, val) {
  const d = DB.denuncias.find(x=>x.id===id);
  if(!d) return;
  d.conclusao = val;
  saveLocalCache();
  auditLog('status', 'denuncias', `Conclusão da denúncia ${id} alterada para "${val}"`, {id, conclusao:val});
  setSaveIndicator('⏳ Salvando conclusão...','var(--warn)');
  sbSaveDenuncia(d).then(() => {
    setSaveIndicator('☁️ Conclusão salva na nuvem','var(--accent)');
  }).catch(() => {
    setSaveIndicator('⚠️ Erro ao salvar na nuvem','var(--danger)');
  });
}
function _conclusaoSelect(d) {
  const bg = _conclusaoBg(d.conclusao), cor = _conclusaoColor(d.conclusao);
  return `<select class="concl-sel"
    style="background:${bg};color:${cor}"
    onclick="event.stopPropagation()"
    onmousedown="event.stopPropagation()"
    onchange="event.stopPropagation();setConclusao(${d.id},this.value);this.style.background=_conclusaoBg(this.value);this.style.color=_conclusaoColor(this.value)">
    <option value=""                                        ${!d.conclusao              ?'selected':''}>— Pendente —</option>
    <option value="Procedente"   style="background:#d1fae5" ${d.conclusao==='Procedente'  ?'selected':''}>✅ Procedente</option>
    <option value="Improcedente" style="background:#fee2e2" ${d.conclusao==='Improcedente'?'selected':''}>❌ Improcedente</option>
    <option value="Inconclusiva" style="background:#fef3c7" ${d.conclusao==='Inconclusiva'?'selected':''}>⚠️ Inconclusiva</option>
    <option value="Arquivada"    style="background:#f1f5f9" ${d.conclusao==='Arquivada'   ?'selected':''}>📁 Arquivada</option>
  </select>`;
}

function _dnMainRow(d) {
  return `<tr style="cursor:pointer" onclick="openDnDetail(${d.id})" title="Ver relato completo">
    <td><strong style="font-family:'DM Mono',monospace;font-size:.82rem;white-space:nowrap">${d.proto}</strong></td>
    <td style="max-width:150px;font-size:.82rem">${d.cat}</td>
    <td style="font-size:.82rem">${d.filial}<br><small style="color:var(--text-muted)">${d.setor||''}</small></td>
    <td style="font-size:.82rem;white-space:nowrap">${formatDate(d.data)}</td>
    <td style="font-size:.82rem">${d.anon==='Anônima'?'<span style="color:var(--text-muted)">🔒 Anônima</span>':'<span style="color:var(--accent)">👤 Identificada</span>'}</td>
    <td>${perigoBadge(d.perigo)}</td>
    <td>${statusBadge(d.status)}</td>
    <td>${slaBar(d.data, d.status)}</td>
    <td onclick="event.stopPropagation()">${_conclusaoSelect(d)}</td>
    <td style="font-size:.82rem">${d.resp||'<span style="color:var(--text-muted)">—</span>'}</td>
    <td style="white-space:nowrap">
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();openDnDetail(${d.id})" title="Ver relato completo">👁</button>
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();editDenuncia(${d.id})">✏️</button>
      <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();delDenuncia(${d.id})">🗑</button>
    </td>
  </tr>`;
}

// Store last filtered items for re-sort without re-filter
let _dnLastTabItems = [];
let _dnLastSlaItems = [];

function _renderDnMainBody() {
  const tb = document.getElementById('tb-denuncias');
  if(!tb) return;
  const sorted = _applySortDn(_dnLastTabItems, _dnMainSortCol, _dnMainSortDir);
  if(sorted.length === 0) {
    tb.innerHTML = '<tr><td colspan="10" class="empty"><div class="ico">📢</div>Nenhuma denúncia nesta aba.</td></tr>';
  } else {
    tb.innerHTML = sorted.map(_dnMainRow).join('');
  }
}

function _renderDnSlaBody() {
  const tbSla = document.getElementById('tb-denuncias-sla');
  if(!tbSla) return;
  const sorted = _applySortDn(_dnLastSlaItems, _dnSlaSortCol, _dnSlaSortDir);
  if(sorted.length === 0) {
    tbSla.innerHTML = '<tr><td colspan="10" class="empty"><div class="ico">⏱️</div>Nenhuma denúncia.</td></tr>';
  } else {
    tbSla.innerHTML = sorted.map(d => {
      const days = d.data ? Math.floor((new Date()-new Date(d.data))/86400000) : 0;
      const pct = Math.min(Math.round(days/90*100),100);
      const daysColor = pct>=100?'var(--danger)':pct>=70?'var(--warn)':'var(--text)';
      const rowBg = pct >= 100 ? 'background:#fff8f8' : '';
      return `<tr style="cursor:pointer;${rowBg}" onclick="openDnDetail(${d.id})" title="Ver relato completo">
        <td><strong style="font-family:'DM Mono',monospace;font-size:.82rem;white-space:nowrap">${d.proto}</strong></td>
        <td style="font-size:.82rem;max-width:130px">${d.cat}</td>
        <td style="font-size:.82rem;white-space:nowrap">${d.filial}</td>
        <td style="font-size:.82rem;white-space:nowrap">${formatDate(d.data)}</td>
        <td style="font-weight:700;color:${daysColor};white-space:nowrap">${days} dias</td>
        <td>${slaBar(d.data, d.status)}</td>
        <td>${perigoBadge(d.perigo)}</td>
        <td>${statusBadge(d.status)}</td>
        <td style="font-size:.82rem">${d.resp||'—'}</td>
        <td style="white-space:nowrap">
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();openDnDetail(${d.id})" title="Ver relato completo">👁</button>
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();editDenuncia(${d.id})">✏️</button>
        </td>
      </tr>`;
    }).join('');
  }
}

function renderDenuncias() {
  const all = DB.denuncias;
  // KPIs
  document.getElementById('dn-total').textContent = all.length;
  document.getElementById('dn-analise').textContent = all.filter(d => d.status === 'Em Análise').length;
  document.getElementById('dn-encerrada').textContent = all.filter(d => ['Encerrada','Arquivada'].includes(d.status)).length;
  document.getElementById('dn-urgente').textContent = all.filter(d => ['Grave','Gravíssima'].includes(d.perigo)).length;
  const slaVenc = all.filter(d => {
    if(['Encerrada','Arquivada'].includes(d.status)) return false;
    return !!_parseDataSafe(d.data) && Math.max(0,Math.floor((new Date()-_parseDataSafe(d.data))/86400000)) > 90;
  }).length;
  document.getElementById('dn-sla-venc').textContent = slaVenc;

  // Tab counts
  document.getElementById('tab-count-recebidas').textContent = all.filter(d => d.status === 'Aberta').length;
  document.getElementById('tab-count-analise').textContent = all.filter(d => d.status === 'Em Análise').length;
  document.getElementById('tab-count-encerradas').textContent = all.filter(d => ['Encerrada','Arquivada'].includes(d.status)).length;
  document.getElementById('tab-count-sla').textContent = slaVenc;

  const filtered = getFiltered();

  // Main table: filter by tab
  let tabItems = filtered;
  if(dnCurrentTab === 'recebidas')  tabItems = filtered.filter(d => d.status === 'Aberta');
  if(dnCurrentTab === 'analise')    tabItems = filtered.filter(d => d.status === 'Em Análise');
  if(dnCurrentTab === 'encerradas') tabItems = filtered.filter(d => ['Encerrada','Arquivada'].includes(d.status));

  // Store for re-sort
  _dnLastTabItems = tabItems;
  _dnLastSlaItems = filtered;

  // Apply current sort and render
  _renderDnMainBody();

  // Sync sort indicator on main thead
  document.querySelectorAll('#dn-main-thead-tr th').forEach(th => th.classList.remove('asc','desc'));
  const mainActiveTh = document.querySelector(`#dn-main-thead-tr th[data-dnmain="${_dnMainSortCol}"]`);
  if(mainActiveTh) mainActiveTh.classList.add(_dnMainSortDir);

  // SLA table
  _renderDnSlaBody();

  // Sync sort indicator on SLA thead
  document.querySelectorAll('#dn-sla-thead-tr th').forEach(th => th.classList.remove('asc','desc'));
  const slaActiveTh = document.querySelector(`#dn-sla-thead-tr th[data-dnsla="${_dnSlaSortCol}"]`);
  if(slaActiveTh) slaActiveTh.classList.add(_dnSlaSortDir);
}

function getSelectedPerigo() {
  const radios = document.querySelectorAll('input[name="f-dn-perigo"]');
  for(const r of radios) if(r.checked) return r.value;
  return 'Leve';
}

function setSelectedPerigo(val) {
  const radios = document.querySelectorAll('input[name="f-dn-perigo"]');
  const btns = document.querySelectorAll('.perigo-btn');
  const outlines = {'Leve':'#d1fae5','Médio':'#fef3c7','Grave':'#fee2e2','Gravíssima':'#e9d5ff'};
  const bgs = {'Leve':'#f0fdf9','Médio':'#fffbeb','Grave':'#fff1f1','Gravíssima':'#fdf4ff'};
  const selected = {'Leve':'#10b981','Médio':'#f59e0b','Grave':'#ef4444','Gravíssima':'#8b5cf6'};
  radios.forEach(r => r.checked = r.value === val);
  btns.forEach(btn => {
    const v = btn.dataset.val;
    if(v === val) {
      btn.style.border = `2px solid ${selected[v]}`;
      btn.style.background = bgs[v];
      btn.style.boxShadow = `0 0 0 3px ${outlines[v]}`;
    } else {
      btn.style.border = `2px solid ${outlines[v]}`;
      btn.style.background = bgs[v];
      btn.style.boxShadow = 'none';
    }
  });
}

// Wire up perigo radio buttons via click on div
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.perigo-btn').forEach(btn => {
    btn.addEventListener('click', () => setSelectedPerigo(btn.dataset.val));
  });
});

function openModalDenuncia() {
  window._editDnId = null;
  ['f-dn-relato','f-dn-obs','f-dn-resp','f-dn-setor','f-dn-proto'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  const dataEl = document.getElementById('f-dn-data');
  if(dataEl) dataEl.value = new Date().toISOString().split('T')[0];
  setSelectedPerigo('Leve');
  openModal('modal-denuncia');
}

function editDenuncia(id) {
  const d = DB.denuncias.find(x => x.id === id);
  if(!d) return;
  window._editDnId = id;
  document.getElementById('f-dn-cat').value = d.cat;
  document.getElementById('f-dn-filial').value = d.filial;
  if(document.getElementById('f-dn-setor')) document.getElementById('f-dn-setor').value = d.setor||'';
  document.getElementById('f-dn-anon').value = d.anon;
  document.getElementById('f-dn-resp').value = d.resp||'';
  document.getElementById('f-dn-status').value = d.status;
  document.getElementById('f-dn-relato').value = d.relato;
  document.getElementById('f-dn-obs').value = d.obs||'';
  if(document.getElementById('f-dn-data')) document.getElementById('f-dn-data').value = d.data||'';
  if(document.getElementById('f-dn-proto')) document.getElementById('f-dn-proto').value = d.proto||'';
  setSelectedPerigo(d.perigo||'Leve');
  openModal('modal-denuncia');
}

function salvarDenuncia() {
  const relato = document.getElementById('f-dn-relato').value.trim();
  if(!relato) { alert('O relato é obrigatório.'); return; }
  const perigo = getSelectedPerigo();
  const dataReceb = document.getElementById('f-dn-data').value || new Date().toISOString().split('T')[0];
  const protoManual = (document.getElementById('f-dn-proto').value || '').trim();
  const data = {
    cat: document.getElementById('f-dn-cat').value,
    filial: document.getElementById('f-dn-filial').value,
    setor: (document.getElementById('f-dn-setor')||{value:''}).value,
    perigo,
    anon: document.getElementById('f-dn-anon').value,
    resp: document.getElementById('f-dn-resp').value,
    status: document.getElementById('f-dn-status').value,
    relato, obs: document.getElementById('f-dn-obs').value
  };
  if(window._editDnId) {
    Object.assign(DB.denuncias.find(d => d.id === window._editDnId), { ...data, data: dataReceb });
  } else {
    // Protocol: use manual if provided, otherwise auto-generate
    const maxId = DB.denuncias.reduce((m, d) => Math.max(m, d.id||0), 0);
    const newId = maxId + 1;
    const year = new Date().getFullYear();
    let proto = protoManual || `DN-${year}-${String(newId).padStart(3,'0')}`;
    // Check for duplicate protocol
    if(DB.denuncias.find(d => d.proto === proto)) {
      alert(`⚠️ O protocolo "${proto}" já existe. Por favor, use outro protocolo.`);
      return;
    }
    DB.denuncias.push({ id: newId, proto, data: dataReceb, ...data });
    DB._ids.dn = newId + 1;
    // Show protocol to user
    setTimeout(() => alert(`✅ Denúncia registrada!\n\nProtocolo: ${proto}\nData: ${dataReceb}\n\nGuarde este número para acompanhamento.`), 100);
  }
  // Salvar no Supabase
  const _dnId = window._editDnId;
  closeModal('modal-denuncia');
  renderDenuncias();
  saveLocalCache();
  const _dnSaved = _dnId
    ? DB.denuncias.find(d => d.id === _dnId)
    : DB.denuncias[DB.denuncias.length - 1];
  if(_dnSaved) {
    sbSaveDenuncia(_dnSaved).then(() => setSaveIndicator('☁️ Denúncia salva na nuvem','var(--accent)'));
  }
}

function delDenuncia(id) {
  if(!confirm('Excluir esta denúncia?')) return;
  DB.denuncias = DB.denuncias.filter(d => d.id !== id);
  renderDenuncias();
  saveLocalCache();
  sbDeleteDenuncia(id).then(() => setSaveIndicator('☁️ Excluída da nuvem','var(--accent)'));
}


// ══════════════════════════════════════════
// RELATÓRIOS — CANAL DE DENÚNCIA
// ══════════════════════════════════════════
function populateRelSelects(force) {
  const relFilial = document.getElementById('rel-filial');
  if(!relFilial) return;

  // Preserve current selections
  const prevFilial = relFilial.value;
  const relSetor = document.getElementById('rel-setor');
  const prevSetor = relSetor ? relSetor.value : '';

  // Build lists from data
  const filiais = [...new Set(DB.denuncias.map(d => d.filial).filter(Boolean))].sort();
  const setores = [...new Set(DB.denuncias.map(d => d.setor).filter(Boolean))].sort();

  // Only rebuild if forced (on init/import) OR if options count changed
  const needsRebuild = force || relFilial.options.length !== filiais.length + 1;

  if(needsRebuild) {
    relFilial.innerHTML = '<option value="">Todas as Filiais</option>' +
      filiais.map(f => `<option value="${f}">${f}</option>`).join('');
    // Restore previous selection
    if(prevFilial) relFilial.value = prevFilial;

    if(relSetor) {
      relSetor.innerHTML = '<option value="">Todos os Setores</option>' +
        setores.map(s => `<option value="${s}">${s}</option>`).join('');
      if(prevSetor) relSetor.value = prevSetor;
    }

    // Also update canal de denuncia filial filter
    const fi2 = document.getElementById('filtro-dn-filial2');
    if(fi2) {
      const prev2 = fi2.value;
      fi2.innerHTML = '<option value="">Todas as filiais</option>' +
        filiais.map(f => `<option value="${f}">${f}</option>`).join('');
      if(prev2) fi2.value = prev2;
    }
  }
}

// Call with force=true on init and after import
function populateRelSelectsForce() { populateRelSelects(true); }

function getRelFiltered() {
  const filial = (document.getElementById('rel-filial')||{value:''}).value;
  const setor  = (document.getElementById('rel-setor')||{value:''}).value;
  const cat    = (document.getElementById('rel-cat')||{value:''}).value;
  const perigo = (document.getElementById('rel-perigo')||{value:''}).value;
  const status = (document.getElementById('rel-status')||{value:''}).value;
  const periodo= parseInt((document.getElementById('rel-periodo')||{value:''}).value||0);

  // When a filial is selected, refresh setor options to match
  const relSetor = document.getElementById('rel-setor');
  if(relSetor) {
    const prevSetor = relSetor.value;
    const base = filial
      ? DB.denuncias.filter(d => d.filial === filial)
      : DB.denuncias;
    const setoresFor = [...new Set(base.map(d => d.setor).filter(Boolean))].sort();
    relSetor.innerHTML = '<option value="">Todos os Setores</option>' +
      setoresFor.map(s => `<option value="${s}">${s}</option>`).join('');
    if(prevSetor && setoresFor.includes(prevSetor)) relSetor.value = prevSetor;
  }

  return DB.denuncias.filter(d => {
    if(filial && d.filial !== filial) return false;
    if(setor && d.setor !== setor) return false;
    if(cat && d.cat !== cat) return false;
    if(perigo && d.perigo !== perigo) return false;
    if(status && d.status !== status) return false;
    if(periodo && d.data) {
      const days = Math.floor((new Date() - new Date(d.data)) / 86400000);
      if(days > periodo) return false;
    }
    return true;
  });
}

function relBarChart(containerId, data, colors) {
  const el = document.getElementById(containerId);
  if(!el) return;
  const max = Math.max(...Object.values(data), 1);
  el.innerHTML = Object.entries(data)
    .sort((a,b) => b[1]-a[1])
    .map(([label, val], i) => {
      const pct = Math.round(val/max*100);
      const color = Array.isArray(colors) ? colors[i % colors.length] : (colors[label]||'#3b82f6');
      return `<div class="bar-row">
        <div class="bar-label" style="width:130px;font-size:.74rem">${label}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
        <div class="bar-val">${val}</div>
      </div>`;
    }).join('');
}

function renderRelatorios() {
  populateRelSelects();
  const items = getRelFiltered();

  // Re-sync drilldown if open
  if(_lastDrilldownType) {
    const icon = document.getElementById('dd-icon') ? document.getElementById('dd-icon').textContent : '';
    const title = document.getElementById('dd-title-text') ? document.getElementById('dd-title-text').textContent : '';
    setTimeout(() => { if(_lastDrilldownType) openDrilldown(_lastDrilldownType, icon, title); }, 20);
  }

  // ── KPIs
  const kpiEl = document.getElementById('rel-kpis');
  const total = items.length;
  const abertas = items.filter(d => d.status==='Aberta').length;
  const analise = items.filter(d => d.status==='Em Análise').length;
  const encerradas = items.filter(d => d.status==='Encerrada').length;
  const slaVenc = items.filter(d => {
    if(['Encerrada','Arquivada'].includes(d.status)) return false;
    return !!_parseDataSafe(d.data) && Math.max(0,Math.floor((new Date()-_parseDataSafe(d.data))/86400000)) > 90;
  }).length;
  const graves = items.filter(d => ['Grave','Gravíssima'].includes(d.perigo)).length;

  kpiEl.innerHTML = `
    <div class="stat-card highlight kpi-card-clickable" onclick="openDrilldown('total','📢','Total Filtrado')" title="Ver todas as denúncias">
      <div class="stat-icon" style="background:rgba(0,196,154,.2)">📢</div>
      <div><div class="stat-num">${total}</div><div class="stat-label">Total Filtrado</div></div>
    </div>
    <div class="stat-card kpi-card-clickable" onclick="openDrilldown('aberta','🔓','Denúncias Abertas')" title="Ver denúncias abertas">
      <div class="stat-icon blue">🔓</div>
      <div><div class="stat-num" style="color:var(--info)">${abertas}</div><div class="stat-label">Abertas</div></div>
    </div>
    <div class="stat-card kpi-card-clickable" onclick="openDrilldown('analise','🔍','Em Análise')" title="Ver denúncias em análise">
      <div class="stat-icon amber">🔍</div>
      <div><div class="stat-num" style="color:var(--warn)">${analise}</div><div class="stat-label">Em Análise</div></div>
    </div>
    <div class="stat-card kpi-card-clickable" onclick="openDrilldown('encerrada','✅','Encerradas')" title="Ver denúncias encerradas">
      <div class="stat-icon teal">✅</div>
      <div><div class="stat-num" style="color:var(--accent)">${encerradas}</div><div class="stat-label">Encerradas</div></div>
    </div>
    <div class="stat-card kpi-card-clickable" onclick="openDrilldown('graves','🚨','Graves e Gravíssimas')" title="Ver denúncias graves">
      <div class="stat-icon red">🚨</div>
      <div><div class="stat-num" style="color:var(--danger)">${graves}</div><div class="stat-label">Graves/Gravíssimas</div></div>
    </div>
    <div class="stat-card kpi-card-clickable" onclick="openDrilldown('sla','⏱️','SLA Vencido — mais de 90 dias')" title="Ver denúncias com SLA vencido">
      <div class="stat-icon" style="background:#ede9fe">⏱️</div>
      <div><div class="stat-num" style="color:var(--purple)">${slaVenc}</div><div class="stat-label">SLA Vencido (90d)</div></div>
    </div>
  `;
  kpiEl.style.gridTemplateColumns = 'repeat(6,1fr)';

  // ── Chart filial
  const byFilial = {};
  items.forEach(d => { byFilial[d.filial] = (byFilial[d.filial]||0)+1; });
  const filialColors = ['#00c49a','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#10b981','#6366f1','#f97316','#ec4899','#14b8a6','#84cc16','#a855f7','#06b6d4','#fb923c','#e11d48','#7c3aed'];
  relBarChart('rel-chart-filial', byFilial, filialColors);

  // ── Chart categoria
  const byCat = {};
  items.forEach(d => { byCat[d.cat] = (byCat[d.cat]||0)+1; });
  relBarChart('rel-chart-cat', byCat, ['#3b82f6','#ef4444','#f59e0b','#8b5cf6','#00c49a','#f97316','#94a3b8']);

  // ── Chart perigo
  const perigoColors = {'Leve':'#10b981','Médio':'#f59e0b','Grave':'#ef4444','Gravíssima':'#8b5cf6'};
  const byPerigo = {'Leve':0,'Médio':0,'Grave':0,'Gravíssima':0};
  items.forEach(d => { if(byPerigo[d.perigo]!==undefined) byPerigo[d.perigo]++; });
  relBarChart('rel-chart-perigo', byPerigo, perigoColors);

  // ── Chart status
  const statusColors = {'Aberta':'#3b82f6','Em Análise':'#f59e0b','Encerrada':'#00c49a'};
  const byStatus = {'Aberta':0,'Em Análise':0,'Encerrada':0};
  items.forEach(d => { if(byStatus[d.status]!==undefined) byStatus[d.status]++; });
  relBarChart('rel-chart-status', byStatus, statusColors);

  // ── Conclusão chart
  const conclusaoColors = {'Procedente':'#10b981','Improcedente':'#ef4444','Inconclusiva':'#f59e0b','Arquivada':'#94a3b8','Pendente':'#cbd5e1'};
  const byConclusao = {'Procedente':0,'Improcedente':0,'Inconclusiva':0,'Arquivada':0,'Pendente':0};
  items.forEach(d => { const k = d.conclusao && byConclusao[d.conclusao]!==undefined ? d.conclusao : 'Pendente'; byConclusao[k]++; });
  relBarChart('rel-chart-conclusao', byConclusao, conclusaoColors);
  const kpiConc = document.getElementById('rel-conclusao-kpis');
  if(kpiConc) {
    const icons = {'Procedente':'✅','Improcedente':'❌','Inconclusiva':'⚠️','Arquivada':'📁','Pendente':'⏳'};
    kpiConc.innerHTML = Object.entries(byConclusao).map(([k,v]) =>
      `<div style="text-align:center;background:var(--bg);border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;min-width:100px">
        <div style="font-size:1.4rem">${icons[k]}</div>
        <div style="font-size:1.3rem;font-weight:800;color:${_conclusaoColor(k)}">${v}</div>
        <div style="font-size:.72rem;color:var(--text-muted);font-weight:600">${k}</div>
        <div style="font-size:.7rem;color:var(--text-muted)">${total>0?Math.round(v/total*100)+'%':''}</div>
      </div>`).join('');
  }

  // ── Ranking Filiais
  const filiaisAll = [...new Set(items.map(d=>d.filial))].sort();
  const tbFilial = document.getElementById('rel-tb-filial');
  const filialRanking = filiaisAll.map(f => {
    const fItems = items.filter(d=>d.filial===f);
    const venc = fItems.filter(d => !['Encerrada','Arquivada'].includes(d.status) && d.data && Math.floor((new Date()-new Date(d.data))/86400000)>90).length;
    const res = fItems.filter(d=>['Encerrada','Arquivada'].includes(d.status)).length;
    return {
      f, total: fItems.length,
      ab: fItems.filter(d=>d.status==='Aberta').length,
      an: fItems.filter(d=>d.status==='Em Análise').length,
      en: res,
      lv: fItems.filter(d=>d.perigo==='Leve').length,
      md: fItems.filter(d=>d.perigo==='Médio').length,
      gr: fItems.filter(d=>d.perigo==='Grave').length,
      gv: fItems.filter(d=>d.perigo==='Gravíssima').length,
      slaV: venc,
      pct: fItems.length ? Math.round(res/fItems.length*100) : 0
    };
  }).sort((a,b)=>b.total-a.total);

  tbFilial.innerHTML = filialRanking.map((r,i) => {
    const pctColor = r.pct>=80?'var(--accent)':r.pct>=50?'var(--warn)':'var(--danger)';
    return `<tr>
      <td style="font-weight:700;color:var(--text-muted)">#${i+1}</td>
      <td><strong>${r.f}</strong></td>
      <td style="font-weight:700">${r.total}</td>
      <td>${r.ab>0?`<span style="color:var(--info);font-weight:700">${r.ab}</span>`:r.ab}</td>
      <td>${r.an>0?`<span style="color:var(--warn);font-weight:700">${r.an}</span>`:r.an}</td>
      <td>${r.en}</td>
      <td><span class="badge badge-baixo">${r.lv}</span></td>
      <td><span class="badge badge-medio">${r.md}</span></td>
      <td><span class="badge badge-alto">${r.gr}</span></td>
      <td><span class="badge badge-critico">${r.gv}</span></td>
      <td>${r.slaV>0?`<span style="color:var(--danger);font-weight:700">${r.slaV}</span>`:'<span style="color:var(--accent)">0</span>'}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <div class="prog-bar" style="width:60px;display:inline-block"><div class="prog-fill teal" style="width:${r.pct}%"></div></div>
          <span style="font-weight:700;color:${pctColor}">${r.pct}%</span>
        </div>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="12" class="empty"><div class="ico">🏢</div>Nenhuma filial no filtro.</td></tr>';

  // ── Ranking Setores
  const setorMap = {};
  items.forEach(d => {
    const key = d.setor + '||' + d.filial;
    if(!setorMap[key]) setorMap[key] = {setor:d.setor, filial:d.filial, items:[]};
    setorMap[key].items.push(d);
  });
  const setorRanking = Object.values(setorMap).map(s => ({
    ...s,
    total: s.items.length,
    ab: s.items.filter(d=>d.status==='Aberta').length,
    graves: s.items.filter(d=>['Grave','Gravíssima'].includes(d.perigo)).length,
    en: s.items.filter(d=>['Encerrada','Arquivada'].includes(d.status)).length,
  })).sort((a,b)=>b.total-a.total).slice(0,20);

  const tbSetor = document.getElementById('rel-tb-setor');
  tbSetor.innerHTML = setorRanking.map((r,i) => {
    const pct = r.total ? Math.round(r.en/r.total*100) : 0;
    return `<tr>
      <td style="font-weight:700;color:var(--text-muted)">#${i+1}</td>
      <td><strong>${r.setor||'—'}</strong></td>
      <td style="font-size:.82rem">${r.filial}</td>
      <td style="font-weight:700">${r.total}</td>
      <td>${r.ab>0?`<span style="color:var(--info);font-weight:700">${r.ab}</span>`:r.ab}</td>
      <td>${r.graves>0?`<span class="badge badge-alto">${r.graves}</span>`:'<span style="color:var(--text-muted)">0</span>'}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <div class="prog-bar" style="width:60px;display:inline-block"><div class="prog-fill teal" style="width:${pct}%"></div></div>
          <span style="font-weight:700">${pct}%</span>
        </div>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" class="empty">Nenhum setor.</td></tr>';

  // ── Listagem completa
  const labelEl = document.getElementById('rel-count-label');
  if(labelEl) labelEl.textContent = `${items.length} denúncia${items.length!==1?'s':''} encontrada${items.length!==1?'s':''}`;

  const tbLista = document.getElementById('rel-tb-lista');
  tbLista.innerHTML = items.map(d => `<tr>
    <td><strong style="font-family:'DM Mono',monospace;font-size:.8rem">${d.proto}</strong></td>
    <td>${formatDate(d.data)}</td>
    <td style="font-size:.82rem">${d.filial}</td>
    <td style="font-size:.82rem">${d.setor||'—'}</td>
    <td style="font-size:.82rem">${d.cat}</td>
    <td>${perigoBadge(d.perigo)}</td>
    <td>${statusBadge(d.status)}</td>
    <td>${slaBar(d.data, d.status)}</td>
    <td style="font-size:.8rem">${d.anon==='Anônima'?'🔒':'👤'} ${d.anon}</td>
  </tr>`).join('') || '<tr><td colspan="9" class="empty"><div class="ico">📑</div>Nenhuma denúncia no filtro.</td></tr>';
}

function exportRelatorio() {
  const items = getRelFiltered();
  const headers = ['Protocolo','Data','Filial','Setor','Categoria','Perigo','Status','Anonimato','Relato (resumo)','Ação Inicial','Conclusão'];
  const rows = items.map(d => [
    d.proto, d.data, d.filial, d.setor, d.cat, d.perigo, d.status, d.anon,
    (d.relato||'').replace(/"/g,"'").substring(0,100),
    (d.acaoInicial||'').replace(/"/g,"'").substring(0,100),
    (d.obs||'').replace(/"/g,"'").substring(0,100)
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `relatorio_denuncias_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

function printRelatorio() {
  window.print();
}




// ══════════════════════════════════════════
// DRILLDOWN DOS KPIs — RELATÓRIOS (com ordenação)
// ══════════════════════════════════════════
let _lastDrilldownType = null;
let _ddRows = [];         // current rows in drilldown
let _ddSortCol = 'data';  // default sort
let _ddSortDir = 'asc';   // asc | desc

// Perigo sort order
const _perigoOrder = { 'Gravíssima': 4, 'Grave': 3, 'Médio': 2, 'Leve': 1 };

function _ddGetVal(d, col) {
  switch(col) {
    case 'proto':  return d.proto || '';
    case 'tipo':   return d.cat || '';
    case 'filial': return d.filial || '';
    case 'setor':  return d.setor || '';
    case 'data':   return d.data || '';
    case 'anon':   return d.anon || '';
    case 'perigo': return _perigoOrder[d.perigo] || 0;
    case 'status': return d.status || '';
    case 'resp':   return d.resp || '';
    default: return '';
  }
}

function ddSort(col, thEl) {
  // Toggle direction if same col, else reset to asc
  if(_ddSortCol === col) {
    _ddSortDir = _ddSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    _ddSortCol = col;
    _ddSortDir = 'asc';
  }
  // Update header classes
  document.querySelectorAll('#dd-thead-tr th').forEach(th => {
    th.classList.remove('asc','desc');
  });
  if(thEl) thEl.classList.add(_ddSortDir);
  ddRenderRows();
}

function ddRenderRows() {
  const col = _ddSortCol;
  const dir = _ddSortDir;
  const sorted = [..._ddRows].sort((a, b) => {
    const va = _ddGetVal(a, col);
    const vb = _ddGetVal(b, col);
    if(typeof va === 'number') return dir === 'asc' ? va - vb : vb - va;
    return dir === 'asc' ? String(va).localeCompare(String(vb), 'pt-BR') : String(vb).localeCompare(String(va), 'pt-BR');
  });

  const tbody = document.getElementById('dd-tbody');
  if(!tbody) return;

  if(sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="empty"><div class="ico">✅</div>Nenhuma denúncia neste grupo.</td></tr>';
    return;
  }

  tbody.innerHTML = sorted.map(d => {
    const days = d.data ? Math.floor((new Date()-new Date(d.data))/86400000) : 0;
    const slaVencido = !['Encerrada','Arquivada'].includes(d.status) && days > 90;
    const slaDisplay = slaVencido
      ? `<div class="sla-wrap"><div class="sla-label"><span style="color:var(--danger);font-weight:700">⚠ ${days}d / 90d</span><span style="color:var(--danger);font-weight:700">100%</span></div><div class="sla-bar"><div class="sla-fill over" style="width:100%"></div></div></div>`
      : slaBar(d.data, d.status);
    const rowBg = slaVencido ? 'background:#fff8f8' : '';
    return `<tr style="cursor:pointer;${rowBg}" onclick="openDnDetail(${d.id})" title="Clique para ver relato completo">
      <td><strong style="font-family:'DM Mono',monospace;font-size:.78rem;white-space:nowrap">${d.proto}</strong></td>
      <td style="font-size:.78rem;max-width:130px">${d.cat}</td>
      <td style="font-size:.78rem;white-space:nowrap">${d.filial}</td>
      <td style="font-size:.78rem">${d.setor||'—'}</td>
      <td style="font-size:.78rem;white-space:nowrap">${formatDate(d.data)}</td>
      <td style="font-size:.78rem">${d.anon==='Anônima'?'🔒 Anônima':'👤 Identificada'}</td>
      <td>${perigoBadge(d.perigo)}</td>
      <td>${statusBadge(d.status)}</td>
      <td style="min-width:120px">${slaDisplay}</td>
      <td style="font-size:.78rem">${d.resp||'<span style="color:var(--text-muted)">—</span>'}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();openDnDetail(${d.id})" title="Ver relato completo">👁</button>
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();editDenuncia(${d.id})" title="Editar">✏️</button>
      </td>
    </tr>`;
  }).join('');

  // Update count
  const countEl = document.getElementById('dd-count');
  if(countEl) countEl.textContent = `· ${sorted.length} denúncia${sorted.length!==1?'s':''}`;
}

function openDrilldown(type, icon, title) {
  _lastDrilldownType = type;
  const items = getRelFiltered();
  let colorAccent = 'var(--accent)';

  // Filter rows by type
  if(type === 'total') {
    _ddRows = [...items];
    colorAccent = 'var(--accent)';
  } else if(type === 'aberta') {
    _ddRows = items.filter(d => d.status === 'Aberta');
    colorAccent = 'var(--info)';
  } else if(type === 'analise') {
    _ddRows = items.filter(d => d.status === 'Em Análise');
    colorAccent = 'var(--warn)';
  } else if(type === 'encerrada') {
    _ddRows = items.filter(d => ['Encerrada','Arquivada'].includes(d.status));
    colorAccent = 'var(--accent)';
  } else if(type === 'graves') {
    _ddRows = items.filter(d => ['Grave','Gravíssima'].includes(d.perigo));
    colorAccent = 'var(--danger)';
    // Default sort: gravíssima first
    _ddSortCol = 'perigo'; _ddSortDir = 'desc';
  } else if(type === 'sla') {
    _ddRows = items.filter(d => {
      if(['Encerrada','Arquivada'].includes(d.status)) return false;
      return !!_parseDataSafe(d.data) && Math.max(0,Math.floor((new Date()-_parseDataSafe(d.data))/86400000)) > 90;
    });
    colorAccent = 'var(--purple)';
    // Default sort: oldest first
    _ddSortCol = 'data'; _ddSortDir = 'asc';
  } else {
    _ddRows = [...items];
  }

  // Update header UI
  document.getElementById('dd-icon').textContent = icon;
  document.getElementById('dd-title-text').textContent = title;
  const header = document.querySelector('#rel-drilldown .dd-header');
  header.style.background = 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)';
  header.style.borderBottom = `3px solid ${colorAccent}`;

  // Reset sort indicators in headers
  document.querySelectorAll('#dd-thead-tr th').forEach(th => th.classList.remove('asc','desc'));
  const activeTh = document.querySelector(`#dd-thead-tr th[data-col="${_ddSortCol}"]`);
  if(activeTh) activeTh.classList.add(_ddSortDir);

  // Render rows
  ddRenderRows();

  // Show panel
  const panel = document.getElementById('rel-drilldown');
  panel.classList.add('open');
  setTimeout(() => panel.scrollIntoView({behavior:'smooth', block:'nearest'}), 60);
}

function closeDrilldown() {
  _lastDrilldownType = null;
  _ddRows = [];
  document.getElementById('rel-drilldown').classList.remove('open');
  // Clear sort indicators
  document.querySelectorAll('#dd-thead-tr th').forEach(th => th.classList.remove('asc','desc'));
}


// ══════════════════════════════════════════
// IMPORTAR PLANILHA
// ══════════════════════════════════════════
let importParsedRows = [];

function renderImportar() {
  // Nothing dynamic needed on entry
}

function handleFileDrop(event) {
  const files = event.dataTransfer.files;
  if(files && files[0]) processImportFile(files[0]);
}

function handleFileSelect(event) {
  const files = event.target.files;
  if(files && files[0]) processImportFile(files[0]);
}

function clearFileImport() {
  importParsedRows = [];
  document.getElementById('file-input').value = '';
  document.getElementById('file-selected-info').style.display = 'none';
  document.getElementById('import-preview-section').style.display = 'none';
  document.getElementById('import-actions').style.display = 'none';
  document.getElementById('import-result').style.display = 'none';
}

function processImportFile(file) {
  const name = file.name;
  const size = (file.size / 1024).toFixed(1) + ' KB';
  document.getElementById('file-name-label').textContent = name;
  document.getElementById('file-size-label').textContent = size;
  const infoEl = document.getElementById('file-selected-info');
  infoEl.style.display = 'flex';

  const ext = name.split('.').pop().toLowerCase();
  if(ext === 'csv') {
    const reader = new FileReader();
    reader.onload = e => parseCSVImport(e.target.result);
    reader.readAsText(file, 'utf-8');
  } else if(ext === 'xlsx' || ext === 'xls') {
    const reader = new FileReader();
    reader.onload = e => parseXLSXImport(e.target.result);
    reader.readAsArrayBuffer(file);
  } else {
    alert('Formato não suportado. Use .xlsx ou .csv');
  }
}

function normalizeSheetHeaders(rows) {
  // Normaliza cabeçalhos no formato "A (Id)", "B (Hora de início)" -> "Id", "Hora de início"
  return rows.map(row => {
    const normalized = {};
    for (const key of Object.keys(row)) {
      const m = key.match(/^[A-Z]{1,2}\s*\((.+)\)$/);
      const newKey = m ? m[1].trim() : key;
      normalized[newKey] = row[key];
    }
    return normalized;
  });
}

function parseXLSXImport(buffer) {
  // Use SheetJS (bundled via CDN)
  if(typeof XLSX === 'undefined') {
    alert('Carregando biblioteca XLSX... Tente novamente em instante.');
    return;
  }
  const wb = XLSX.read(buffer, {type:'array', cellDates:true});
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(ws, {defval:'', raw:false});
  // Normaliza cabeçalhos no formato "A (Id)", "B (Hora de início)" etc.
  const normalizedRows = normalizeSheetHeaders(rawRows);
  buildImportPreview(normalizedRows);
}

function parseCSVImport(text) {
  // Simple CSV parser (handles quoted fields)
  const lines = text.split('\n');
  if(!lines.length) return;
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for(let i=1;i<lines.length;i++) {
    if(!lines[i].trim()) continue;
    const vals = parseCSVLine(lines[i]);
    const obj = {};
    headers.forEach((h,idx) => obj[h.trim()] = (vals[idx]||'').trim());
    rows.push(obj);
  }
  buildImportPreview(rows);
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for(let i=0;i<line.length;i++) {
    const ch = line[i];
    if(ch==='"') { inQuotes=!inQuotes; }
    else if(ch===',' && !inQuotes) { result.push(cur); cur=''; }
    else { cur+=ch; }
  }
  result.push(cur);
  return result;
}

function normalizeColName(name) {
  return (name||'').toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[\xa0\u200b]/g,'')
    .replace(/\s+/g,' ');
}

function findCol(row, variants) {
  const keys = Object.keys(row);
  for(const v of variants) {
    const norm = normalizeColName(v);
    for(const k of keys) {
      if(normalizeColName(k) === norm) return row[k]||'';
    }
  }
  // Fuzzy: partial match
  for(const v of variants) {
    const norm = normalizeColName(v);
    for(const k of keys) {
      if(normalizeColName(k).includes(norm) || norm.includes(normalizeColName(k))) return row[k]||'';
    }
  }
  return '';
}

function normalizeTipo(t) {
  if(!t) return 'Outros';
  const parts = t.split(';').map(p=>p.trim()).filter(p=>p && p.length < 80);
  const first = parts[0] || t.trim();
  if(first.length > 80) return first.substring(0,80);
  return first;
}

function inferStatus(row) {
  const conc = findCol(row, ['conclusão','conclusao','conclus']);
  const acao = findCol(row, ['ação inicial','acao inicial','ação_inicial']);
  if(conc && conc.trim()) return 'Encerrada';
  if(acao && acao.trim()) return 'Em Análise';
  return 'Aberta';
}

function inferPerigo(row) {
  const nivel = (findCol(row, ['nivel','nível']) || '').toUpperCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(['GRAVE','GRAVISSIMA','GRAVÍSSIMA'].includes(nivel)) return nivel==='GRAVISSIMA'||nivel==='GRAVÍSSIMA'?'Gravíssima':'Grave';
  if(['MEDIO','MÉDIO'].includes(nivel)) return 'Médio';
  if(nivel==='LEVE') return 'Leve';
  // infer from tipo
  const tipo = (findCol(row,['tipo de denuncia','tipo de denúncia'])||'').toLowerCase();
  if(/fraude|desvio/.test(tipo)) return 'Grave';
  if(/assedio|assédio|discrimin/.test(tipo)) return 'Médio';
  return 'Leve';
}

function inferAnon(row) {
  const email = (findCol(row, ['email']) || '').toLowerCase();
  const nome = findCol(row, ['nome (opcional)', 'nome opcional']);
  if(email.includes('anon') || email.includes('anôn')) return 'Anônima';
  if(nome && nome.trim()) return 'Identificada';
  return 'Anônima';
}

function parseImportDate(val) {
  if(!val) return '';
  if(val instanceof Date) return val.toISOString().split('T')[0];
  const s = String(val).trim();

  // Excel serial number (e.g. 45000)
  if(/^\d{5}$/.test(s)) {
    const d = new Date((parseInt(s)-25569)*86400*1000);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }

  // ISO YYYY-MM-DD (with or without time)
  if(/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0,10);

  // Formato com hora: DD/MM/YYYY HH:MM ou D/M/YYYY H:MM (padrão BR do Google Forms)
  // Ex: "25/11/2025 13:28", "28/11/2025 12:04", "1/3/2026 9:15"
  const mHora = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+\d{1,2}:\d{2}/);
  if(mHora) {
    const p1 = parseInt(mHora[1]);
    const p2 = parseInt(mHora[2]);
    const ano = mHora[3];
    // Se p1 > 12: é DD/MM/YYYY (dia primeiro, padrão BR)
    // Se p2 > 12: é MM/DD/YYYY (mês primeiro, padrão US) - impossível ter dia > 12 no mês
    // Padrão: assumir DD/MM/YYYY (formato BR, usado no Brasil)
    if(p1 > 12) {
      // Claramente DD/MM/YYYY
      return `${ano}-${mHora[2].padStart(2,'0')}-${mHora[1].padStart(2,'0')}`;
    }
    if(p2 > 12) {
      // Claramente MM/DD/YYYY (dia no segundo campo > 12)
      return `${ano}-${mHora[1].padStart(2,'0')}-${mHora[2].padStart(2,'0')}`;
    }
    // Ambos <= 12: assumir DD/MM/YYYY (padrão BR)
    return `${ano}-${mHora[2].padStart(2,'0')}-${mHora[1].padStart(2,'0')}`;
  }

  // Sem hora: DD/MM/YYYY ou D/M/YYYY
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if(m) {
    const y = m[3].length===2 ? '20'+m[3] : m[3];
    const p1 = parseInt(m[1]);
    const p2 = parseInt(m[2]);
    if(p1 > 12) return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    if(p2 > 12) return `${y}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
    // Ambos <= 12: assumir DD/MM/YYYY (padrão BR)
    return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  }

  return '';
}

function buildImportPreview(rawRows) {
  const existingProtos = new Set(DB.denuncias.map(d=>d.proto));
  const existingIds = new Set(DB.denuncias.map(d=>d.id));
  const parsed = [];

  for(const row of rawRows) {
    const idRaw = findCol(row, ['id','Id','ID']);
    if(!idRaw || String(idRaw).toLowerCase().includes('test') || String(idRaw).trim()==='') continue;
    const id = parseInt(idRaw);
    if(isNaN(id)) continue;

    // Try multiple column names for date (Google Forms, Excel, custom)
    const dateRaw = findCol(row, [
      'hora de início','hora de inicio','hora de iníc','timestamp','carimbo de data/hora',
      'carimbo de data','data e hora','data/hora','data','date','recebida em','recebido em',
      'hora de envio','hora envio'
    ]) || (() => {
      // Last resort: find any cell that looks like a date
      for(const k of Object.keys(row)) {
        const v = String(row[k]||'').trim();
        if(/^\d{1,2}\/\d{1,2}\/\d{4}/.test(v) || /^\d{4}-\d{2}-\d{2}/.test(v)) return v;
      }
      return '';
    })();
    const dataStr = parseImportDate(dateRaw) || new Date().toISOString().split('T')[0];
    const year = dataStr ? parseInt(dataStr.substring(0,4)) : new Date().getFullYear();
    const proto = `DN-${year}-${String(id).padStart(3,'0')}`;

    const tipo = normalizeTipo(findCol(row, ['tipo de denúncia','tipo de denuncia','tipo']));
    const relato = findCol(row, ['descrição do fato','descricao do fato','descrição','fato','relato']) || '';
    const acao = findCol(row, ['ação inicial','acao inicial','ação_inicial','acao_inicial']) || '';
    const obs = findCol(row, ['conclusão','conclusao','conclus']) || '';

    const isDuplicate = existingProtos.has(proto);

    parsed.push({
      id, proto, isDuplicate,
      cat: tipo,
      filial: (findCol(row, ['filial']) || '').trim(),
      setor: (findCol(row, ['setor']) || '').trim(),
      data: dataStr,
      anon: inferAnon(row),
      perigo: inferPerigo(row),
      status: inferStatus(row),
      resp: '',
      relato: relato,
      acaoInicial: acao,
      obs: obs,
    });
  }

  importParsedRows = parsed;

  const total = parsed.length;
  const novos = parsed.filter(r=>!r.isDuplicate).length;
  const dup = parsed.filter(r=>r.isDuplicate).length;
  const semData = parsed.filter(r=>!r.isDuplicate && (!r.data || r.data === new Date().toISOString().split('T')[0])).length;

  // Show column names detected for debugging
  const colsDetected = rawRows.length > 0 ? Object.keys(rawRows[0]).join(' · ') : '';

  // Show summary
  document.getElementById('import-preview-section').style.display = '';
  document.getElementById('import-preview-stats').textContent =
    `${total} linhas processadas`;
  // Show detected columns to help debug date issues
  const statsEl = document.getElementById('import-preview-stats');
  if(statsEl) statsEl.innerHTML = `${total} linhas processadas
    <div style="font-size:.72rem;color:var(--text-muted);margin-top:4px">📋 Colunas: <em>${colsDetected.slice(0,200)}</em></div>
    ${semData > 0 ? `<div style="font-size:.72rem;color:var(--warn);margin-top:2px">⚠️ ${semData} linha(s) sem data detectada</div>` : ''}
  `;

  document.getElementById('import-summary').innerHTML = `
    <div style="background:#f0fdf9;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:1.6rem;font-weight:700;color:var(--accent)">${total}</div>
      <div style="font-size:.75rem;color:var(--text-muted)">Total lido</div>
    </div>
    <div style="background:#dbeafe;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:1.6rem;font-weight:700;color:var(--info)">${novos}</div>
      <div style="font-size:.75rem;color:var(--text-muted)">Novas (serão importadas)</div>
    </div>
    <div style="background:#fef3c7;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:1.6rem;font-weight:700;color:var(--warn)">${dup}</div>
      <div style="font-size:.75rem;color:var(--text-muted)">Duplicadas (ignoradas)</div>
    </div>
    <div style="background:#f1f5f9;border-radius:8px;padding:12px;text-align:center">
      <div style="font-size:1.6rem;font-weight:700;color:var(--text-muted)">${DB.denuncias.length}</div>
      <div style="font-size:.75rem;color:var(--text-muted)">Já no sistema</div>
    </div>
  `;

  // Preview table
  const tb = document.getElementById('import-preview-tb');
  tb.innerHTML = parsed.map(r => {
    const statusClass = r.isDuplicate
      ? 'style="background:#fef3c7"'
      : (r.status==='Encerrada'?'style="background:#f0fdf9"':'');
    const situacao = r.isDuplicate
      ? '<span class="badge" style="background:#fef3c7;color:#92400e">⚠️ Duplicado</span>'
      : '<span class="badge badge-concluido">✅ Novo</span>';
    return `<tr ${statusClass}>
      <td>${situacao}</td>
      <td style="font-family:monospace">${r.id}</td>
      <td style="font-family:monospace;font-size:.8rem">${r.proto}</td>
      <td>${formatDate(r.data)}</td>
      <td style="font-size:.82rem">${r.filial||'—'}</td>
      <td style="font-size:.82rem">${r.setor||'—'}</td>
      <td style="font-size:.8rem;max-width:140px">${r.cat}</td>
      <td>${perigoBadge(r.perigo)}</td>
      <td>${statusBadge(r.status)}</td>
      <td style="font-size:.78rem;max-width:220px;color:var(--text-muted)">${(r.relato||'').substring(0,120)}${r.relato && r.relato.length>120?'…':''}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="10" class="empty"><div class="ico">📊</div>Nenhuma linha válida encontrada.</td></tr>';

  document.getElementById('import-actions').style.display = novos > 0 ? '' : 'none';
  if(novos === 0) {
    document.getElementById('btn-confirm-import').textContent = '✅ Confirmar Importação';
  }
  document.getElementById('import-result').style.display = 'none';
}

function confirmImport() {
  const btn = document.getElementById('btn-confirm-import');
  btn.disabled = true;
  btn.textContent = '⏳ Importando...';

  const novos = importParsedRows.filter(r=>!r.isDuplicate);
  let count = 0;
  for(const r of novos) {
    DB.denuncias.push({...r});
    count++;
  }

  // Update _ids
  if(count > 0) {
    DB._ids.dn = Math.max(...DB.denuncias.map(d=>d.id)) + 1;
  }

  // Show result
  const resultEl = document.getElementById('import-result');
  resultEl.style.display = '';
  resultEl.innerHTML = `
    <div style="background:#f0fdf9;border:1.5px solid var(--accent);border-radius:12px;padding:28px;text-align:center">
      <div style="font-size:2.5rem;margin-bottom:10px">🎉</div>
      <div style="font-size:1.1rem;font-weight:700;color:var(--primary);margin-bottom:6px">
        Importação concluída com sucesso!
      </div>
      <div style="font-size:.88rem;color:var(--text-muted);margin-bottom:16px">
        <strong style="color:var(--accent)">${count}</strong> novas denúncias adicionadas ·
        <strong>${importParsedRows.filter(r=>r.isDuplicate).length}</strong> duplicadas ignoradas ·
        Sistema agora com <strong>${DB.denuncias.length}</strong> denúncias no total
      ${importParsedRows.filter(r=>!r.isDuplicate&&!r.data).length > 0 ? '<br><span style="color:var(--warn)">⚠️ ' + importParsedRows.filter(r=>!r.isDuplicate&&!r.data).length + ' denúncias sem data detectada — verifique o nome da coluna de data</span>' : ''}
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn btn-primary" onclick="goto('canal-denuncia',document.querySelector('[data-page=canal-denuncia]'))">
          📢 Ver Canal de Denúncia
        </button>
        <button class="btn btn-accent" onclick="goto('relatorios',document.querySelector('[data-page=relatorios]'))">
          📑 Ver Relatórios
        </button>
        <button class="btn btn-outline" onclick="clearFileImport();populateRelSelects();">
          ⬆️ Nova Importação
        </button>
      </div>
    </div>
  `;

  document.getElementById('import-preview-section').style.display = 'none';
  document.getElementById('import-actions').style.display = 'none';

  // Salvar no Supabase
  saveLocalCache();
  if(count > 0) {
    const novas = importParsedRows.filter(r => !r.isDuplicate);
    setSaveIndicator('⏳ Enviando ' + count + ' itens para a nuvem...', 'var(--warn)');
    sbBulkImportDenuncias(novas).then(() => {
      setSaveIndicator('☁️ ' + count + ' denúncias salvas na nuvem', 'var(--accent)');
    });
  }

  // Refresh selects and rel counters
  populateRelSelectsForce();
  populateFilialSelects();

  btn.disabled = false;
  btn.textContent = '✅ Confirmar Importação';
}



// ── Detalhe de Denúncia (relato completo)
function openDnDetail(id) {
  const d = DB.denuncias.find(x => x.id === id);
  if(!d) return;
  document.getElementById('dn-detail-proto').textContent = d.proto;
  document.getElementById('dn-detail-perigo').innerHTML = perigoBadge(d.perigo);
  document.getElementById('dn-detail-status').innerHTML = statusBadge(d.status);
  document.getElementById('dn-detail-meta').textContent =
    `${d.filial}${d.setor?' · '+d.setor:''} · ${formatDate(d.data)} · ${d.anon}`;
  document.getElementById('dn-detail-cat').textContent = d.cat;
  document.getElementById('dn-detail-sla').innerHTML = slaBar(d.data, d.status);
  document.getElementById('dn-detail-relato').textContent = d.relato || '—';
  
  const acaoW = document.getElementById('dn-detail-acao-wrap');
  const obsW = document.getElementById('dn-detail-obs-wrap');
  if(d.acaoInicial) { acaoW.style.display=''; document.getElementById('dn-detail-acao').textContent = d.acaoInicial; }
  else acaoW.style.display='none';
  if(d.obs) { obsW.style.display=''; document.getElementById('dn-detail-obs').textContent = d.obs; }
  else obsW.style.display='none';
  
  document.getElementById('dn-detail-edit-btn').onclick = () => { closeModal('modal-dn-detail'); editDenuncia(id); };
  openModal('modal-dn-detail');
}


// ══════════════════════════════════════════
// FLOWBOARD
// ══════════════════════════════════════════
let fbCurrentView = 'planos-acao';
let fbDragCard = null;
let fbDragSrcCol = null;

function fbSetView(view, el) {
  fbCurrentView = view;
  document.querySelectorAll('.fb-filter-btn').forEach(b => b.classList.remove('active'));
  if(el) el.classList.add('active');
  renderFlowboard();
}

function renderFlowboard() {
  const board = DB.fbBoards[fbCurrentView];
  document.getElementById('fb-board-title').textContent = board.name;

  // Boards list
  const list = document.getElementById('fb-boards-list');
  list.innerHTML = Object.entries(DB.fbBoards).map(([k,b]) =>
    `<div class="fb-board-item ${k===fbCurrentView?'active':''}" onclick="fbSetView('${k}',null)">
      <div class="fb-board-dot" style="background:${b.color}"></div>
      ${b.name}
    </div>`
  ).join('');

  // Kanban columns
  const kanban = document.getElementById('fb-kanban');
  kanban.innerHTML = '';
  board.cols.forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'fb-col';
    colEl.dataset.colId = col.id;
    colEl.addEventListener('dragover', e => { e.preventDefault(); colEl.classList.add('drag-over'); });
    colEl.addEventListener('dragleave', () => colEl.classList.remove('drag-over'));
    colEl.addEventListener('drop', e => { e.preventDefault(); colEl.classList.remove('drag-over'); fbDrop(col.id); });

    colEl.innerHTML = `
      <div class="fb-col-header">
        <div class="fb-col-dot" style="background:${col.color}"></div>
        <div class="fb-col-name">${col.name}</div>
        <div class="fb-col-count">${col.cards.length}</div>
      </div>
      <div class="fb-cards" id="cards-${col.id}"></div>
      <button class="fb-add-card" onclick="fbAddCard('${col.id}')">+ Adicionar card</button>
    `;
    kanban.appendChild(colEl);

    const cardsEl = colEl.querySelector(`#cards-${col.id}`);
    col.cards.forEach(card => {
      cardsEl.appendChild(fbMakeCardEl(card, col.id));
    });
  });

  // Add col button
  const addCol = document.createElement('div');
  addCol.className = 'fb-add-col';
  addCol.innerHTML = `<button class="fb-add-col-btn" onclick="fbAddCol()">+ Nova Coluna</button>`;
  kanban.appendChild(addCol);
}

function fbMakeCardEl(card, colId) {
  const el = document.createElement('div');
  el.className = 'fb-card';
  el.draggable = true;
  el.dataset.cardId = card.id;

  const done = (card.checkDone||[]).filter(Boolean).length;
  const total = (card.check||[]).length;
  const checkPct = total > 0 ? Math.round(done/total*100) : 0;

  const prioColors = {Crítica:'#fde8ff',Alta:'#fee2e2',Média:'#fef3c7',Baixa:'#d1fae5'};
  const prioText = {Crítica:'#7e22ce',Alta:'#991b1b',Média:'#92400e',Baixa:'#065f46'};

  const today = new Date().toISOString().split('T')[0];
  let dateClass = '';
  if(card.prazo && card.prazo < today) dateClass = 'vencido';
  else if(card.prazo === today) dateClass = 'hoje';

  el.innerHTML = `
    <div class="fb-card-title">${card.title}</div>
    ${total > 0 ? `<div class="fb-card-checklist"><span>${done}/${total} tarefas</span><div class="fb-card-checklist-bar"><div class="fb-card-checklist-fill" style="width:${checkPct}%"></div></div></div>` : ''}
    <div class="fb-card-meta">
      ${card.prazo ? `<span class="fb-card-date ${dateClass}">📅 ${formatDate(card.prazo)}</span>` : ''}
      ${card.prio ? `<span class="fb-card-tag" style="background:${prioColors[card.prio]||'#f1f5f9'};color:${prioText[card.prio]||'#475569'}">${card.prio}</span>` : ''}
      ${card.tag ? `<span class="fb-card-tag" style="background:#f0f4f8;color:var(--text-muted)">${card.tag}</span>` : ''}
      ${card.resp ? `<div class="fb-card-avatar" style="background:var(--primary);margin-left:auto">${card.resp.slice(0,2).toUpperCase()}</div>` : ''}
    </div>
  `;

  el.addEventListener('dragstart', () => { fbDragCard = card.id; fbDragSrcCol = colId; el.classList.add('dragging'); });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));
  el.addEventListener('click', () => fbOpenCard(card.id, colId));
  return el;
}

function fbDrop(targetColId) {
  if(!fbDragCard || fbDragSrcCol === targetColId) return;
  const board = DB.fbBoards[fbCurrentView];
  const srcCol = board.cols.find(c => c.id === fbDragSrcCol);
  const tgtCol = board.cols.find(c => c.id === targetColId);
  if(!srcCol || !tgtCol) return;
  const cardIdx = srcCol.cards.findIndex(c => c.id === fbDragCard);
  if(cardIdx === -1) return;
  const [card] = srcCol.cards.splice(cardIdx, 1);
  tgtCol.cards.push(card);
  fbDragCard = null; fbDragSrcCol = null;
  renderFlowboard();
  saveLocalCache();
  setSaveIndicator('⏳ Salvando...','var(--warn)');
  sbSaveFbBoards().then(() => setSaveIndicator('☁️ FlowBoard salvo','var(--accent)'))
                  .catch(() => setSaveIndicator('⚠️ Erro ao salvar na nuvem','var(--danger)'));
}

function fbAddCard(colId) {
  const board = DB.fbBoards[fbCurrentView];
  document.getElementById('fb-modal-title').textContent = '📌 Novo Card';
  document.getElementById('fb-edit-id').value = '';
  document.getElementById('fb-edit-col').value = colId || board.cols[0]?.id || '';
  ['fb-titulo','fb-desc','fb-check','fb-resp','fb-prazo','fb-tag'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fb-prio').value = 'Média';
  document.getElementById('fb-del-btn').style.display = 'none';

  // Populate col select
  const sel = document.getElementById('fb-col-sel');
  sel.innerHTML = board.cols.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  if(colId) sel.value = colId;

  openModal('fb-card-modal');
}

function fbOpenCard(cardId, colId) {
  const board = DB.fbBoards[fbCurrentView];
  const col = board.cols.find(c => c.id === colId);
  const card = col?.cards.find(c => c.id === cardId);
  if(!card) return;
  document.getElementById('fb-modal-title').textContent = '✏️ Editar Card';
  document.getElementById('fb-edit-id').value = cardId;
  document.getElementById('fb-edit-col').value = colId;
  document.getElementById('fb-titulo').value = card.title;
  document.getElementById('fb-desc').value = card.desc||'';
  document.getElementById('fb-check').value = (card.check||[]).join('\n');
  document.getElementById('fb-resp').value = card.resp||'';
  document.getElementById('fb-prazo').value = card.prazo||'';
  document.getElementById('fb-prio').value = card.prio||'Média';
  document.getElementById('fb-tag').value = card.tag||'';
  document.getElementById('fb-del-btn').style.display = 'inline-flex';

  const sel = document.getElementById('fb-col-sel');
  sel.innerHTML = board.cols.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  sel.value = colId;

  openModal('fb-card-modal');
}

function fbSaveCard() {
  const title = document.getElementById('fb-titulo').value.trim();
  if(!title) { alert('Informe o título do card.'); return; }
  const board = DB.fbBoards[fbCurrentView];
  const editId = document.getElementById('fb-edit-id').value;
  const oldColId = document.getElementById('fb-edit-col').value;
  const newColId = document.getElementById('fb-col-sel').value;
  const checkLines = document.getElementById('fb-check').value.split('\n').map(l=>l.trim()).filter(Boolean);

  const cardData = {
    title, desc: document.getElementById('fb-desc').value,
    check: checkLines,
    checkDone: checkLines.map(()=>0),
    resp: document.getElementById('fb-resp').value,
    prazo: document.getElementById('fb-prazo').value,
    prio: document.getElementById('fb-prio').value,
    tag: document.getElementById('fb-tag').value,
  };

  if(editId) {
    // Edit existing
    const oldCol = board.cols.find(c => c.id === oldColId);
    const idx = oldCol?.cards.findIndex(c => c.id === editId);
    if(idx !== undefined && idx > -1) {
      const existing = oldCol.cards[idx];
      // preserve checkDone for existing tasks
      const newCheckDone = checkLines.map((line, i) => {
        const oldIdx = (existing.check||[]).indexOf(line);
        return oldIdx > -1 ? (existing.checkDone||[])[oldIdx] || 0 : 0;
      });
      cardData.checkDone = newCheckDone;
      cardData.id = editId;
      if(oldColId === newColId) {
        oldCol.cards[idx] = cardData;
      } else {
        oldCol.cards.splice(idx, 1);
        const newCol = board.cols.find(c => c.id === newColId);
        newCol?.cards.push(cardData);
      }
    }
  } else {
    cardData.id = 'fb' + (DB._ids.fbCard++);
    const col = board.cols.find(c => c.id === newColId);
    col?.cards.push(cardData);
  }

  closeModal('fb-card-modal');
  renderFlowboard();
  saveLocalCache();
  sbSaveFbBoards().then(()=>setSaveIndicator('☁️ FlowBoard salvo','var(--accent)'));
}

function fbDeleteCard() {
  const editId = document.getElementById('fb-edit-id').value;
  const oldColId = document.getElementById('fb-edit-col').value;
  if(!editId) return;
  if(!confirm('Excluir este card?')) return;
  const board = DB.fbBoards[fbCurrentView];
  const col = board.cols.find(c => c.id === oldColId);
  if(col) col.cards = col.cards.filter(c => c.id !== editId);
  closeModal('fb-card-modal');
  renderFlowboard();
  saveLocalCache();
  sbSaveFbBoards().then(()=>setSaveIndicator('☁️ FlowBoard atualizado','var(--accent)'));
}

function fbAddCol() {
  const name = prompt('Nome da nova coluna:');
  if(!name) return;
  const board = DB.fbBoards[fbCurrentView];
  const id = 'col' + Date.now();
  const colors = ['#94a3b8','#3b82f6','#f59e0b','#00c49a','#8b5cf6','#ef4444'];
  board.cols.push({ id, name, color: colors[board.cols.length % colors.length], cards: [] });
  renderFlowboard();
}

function fbNewBoard() {
  const name = prompt('Nome do novo quadro:');
  if(!name) return;
  const key = 'board-' + Date.now();
  DB.fbBoards[key] = {
    name, color: '#3b82f6',
    cols: [
      { id:'a1'+Date.now(), name:'A Fazer', color:'#94a3b8', cards:[] },
      { id:'a2'+Date.now(), name:'Em Andamento', color:'#3b82f6', cards:[] },
      { id:'a3'+Date.now(), name:'Concluído', color:'#00c49a', cards:[] },
    ]
  };
  fbSetView(key, null);
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

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════

// ══════════════════════════════════════════
// SISTEMA DE LOGIN
// ══════════════════════════════════════════

// Senhas armazenadas como SHA-256(email:senha:ch2025) — nunca em texto puro
let USUARIOS = [
  { email:'admin@torre.com.br', hash:'32b1257273dc71a74bdd6462a8c4ab72a569a1d932c4e79d9a801605e3c2c270', nome:'Administrador', perfil:'Admin', avatar:'AD', cor:'#0f2d4a' },
];
// Email do admin — imutável
const ADMIN_EMAIL = 'admin@torre.com.br';
// Derivar hash da senha (SHA-256 via SubtleCrypto)
async function _hashSenha(email, senha) {
  const msg = email.toLowerCase().trim() + ':' + senha + ':ch2025';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

let currentUser = null;
const SESSION_KEY = 'ch_session_v2';
const SESSION_EXPIRY_HOURS = 8;

function _saveSession(user) {
  const exp = Date.now() + SESSION_EXPIRY_HOURS * 3600 * 1000;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, perfil: user.perfil, nome: user.nome, avatar: user.avatar, cor: user.cor, exp }));
}
function _loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if(!raw) return null;
    const s = JSON.parse(raw);
    if(Date.now() > s.exp) { sessionStorage.removeItem(SESSION_KEY); return null; }
    return s;
  } catch(e) { return null; }
}
function _clearSession() { sessionStorage.removeItem(SESSION_KEY); }

function doLogin() {
  const emailEl = document.getElementById('login-email');
  const passEl  = document.getElementById('login-pass');
  const errorEl = document.getElementById('login-error');
  const btnEl   = document.getElementById('login-btn');
  const btnText = document.getElementById('login-btn-text');

  const email = (emailEl.value || '').trim().toLowerCase();
  const senha = passEl.value || '';

  errorEl.innerHTML = '';
  emailEl.classList.remove('error');
  passEl.classList.remove('error');

  if(!email) { emailEl.classList.add('error'); errorEl.innerHTML = '⚠️ Informe seu e-mail.'; emailEl.focus(); return; }
  if(!senha) { passEl.classList.add('error'); errorEl.innerHTML = '⚠️ Informe sua senha.'; passEl.focus(); return; }

  btnEl.disabled = true;
  btnText.innerHTML = '<div class="login-spinner"></div> Verificando...';

  doLoginAsync(email, senha, emailEl, passEl, errorEl, btnEl, btnText);
}

async function doLoginAsync(email, senha, emailEl, passEl, errorEl, btnEl, btnText) {
  try {
    const inputHash = await _hashSenha(email, senha);

    // Verificar localmente — se não achar, recarregar usuários extras e tentar de novo
    let user = USUARIOS.find(u => u.email === email && u.hash === inputHash);
    if(!user) {
      await usersLoad(); // recarrega extras do localStorage/Supabase
      user = USUARIOS.find(u => u.email === email && u.hash === inputHash);
    }

    if(!user) {
      btnEl.disabled = false;
      btnText.textContent = 'Entrar no Sistema';
      emailEl.classList.add('error');
      passEl.classList.add('error');
      errorEl.innerHTML = '❌ E-mail ou senha incorretos.';
      passEl.value = '';
      passEl.focus();
      const box = document.querySelector('.login-box');
      if(box) { box.style.animation='none'; box.offsetHeight; box.style.animation='shake .4s ease'; }
      return;
    }

    // Login OK — salvar sessão
    currentUser = user;
    _saveSession(user);

    if(USE_SUPABASE) {
      // Aguardar token do Edge Function ANTES de entrar no app
      try {
        showLoadingBar(true, 'Conectando ao servidor...');
        const r = await fetch(SUPABASE_URL + '/functions/v1/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, hash: inputHash })
        });
        showLoadingBar(false);
        console.log('[Login] Edge Function status:', r.status);
        if(r.ok) {
          const resp = await r.json();
          console.log('[Login] Token recebido:', resp.token ? 'SIM' : 'NÃO');
          if(resp && resp.token) setAppToken(resp.token);
        } else {
          const errText = await r.text();
          console.warn('[Login] Edge Function erro:', r.status, errText);
        }
      } catch(e) {
        showLoadingBar(false);
        console.warn('[Login] Edge Function indisponível:', e.message);
      }
    }

    enterApp(user);
  } catch(e) {
    btnEl.disabled = false;
    btnText.textContent = 'Entrar no Sistema';
    errorEl.innerHTML = '❌ Erro ao autenticar. Tente novamente.';
    console.error('Login error:', e);
  }
}

function enterApp(user) {
  // Carregar usuários extras e permissões sequencialmente
  (async () => {
    await usersLoad();         // carrega usuários do servidor
    permLoad();                // carrega permissões do localStorage
    await permLoadFromSupabase(); // atualiza com versão do Supabase
    permAtualizarNav();        // atualiza nav com permissões corretas
  })();

  // Log de login
  auditLog('login', 'sistema', `Login realizado`, {perfil: user.perfil});

  // Mostrar/ocultar botões admin
  const adminBtns = ['nav-permissoes','nav-usuarios','nav-audit','nav-branding'];
  adminBtns.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.display = (user.email === ADMIN_EMAIL) ? 'flex' : 'none';
  });
  // Mostrar grade admin só se for admin
  const adminGrid = document.getElementById('nav-admin-grid');
  if(adminGrid) adminGrid.style.display = (user.email === ADMIN_EMAIL || user.perfil === 'Admin') ? 'grid' : 'none';

  // Carregar dados do Supabase após login (token já disponível)
  if(USE_SUPABASE) {
    showLoadingBar(true, 'Carregando dados...');
    loadFromSupabase().then(ok => {
      showLoadingBar(false);
      if(ok) {
        populateFilialSelects();
        populateRelSelectsForce();
        renderDashboard();
        if(typeof renderMapaRisco === 'function') renderMapaRisco();
        if(typeof rmUpdateRiscoModalUnits === 'function') rmUpdateRiscoModalUnits();
      }
    }).catch(e => {
      showLoadingBar(false);
      console.warn('Erro ao carregar dados:', e.message);
    });
  }
  // Update topbar user info
  const avEl = document.getElementById('user-av');
  const nameEl = document.getElementById('user-name');
  if(avEl) { avEl.textContent = user.avatar; avEl.style.background = user.cor; }
  if(nameEl) nameEl.textContent = user.nome + ' · ' + user.perfil;

  // Hide login, show app
  const loginScreen = document.getElementById('login-screen');
  loginScreen.style.opacity = '1';
  loginScreen.style.transition = 'opacity .3s ease';
  setTimeout(() => {
    loginScreen.style.opacity = '0';
    setTimeout(() => {
      loginScreen.classList.add('hidden');
    }, 300);
  }, 50);
}

function doLogout() {
  if(!confirm('Deseja realmente sair do sistema?')) return;
  auditLog('logout', 'sistema', 'Logout realizado');
  currentUser = null;
  _clearSession();
  sessionStorage.removeItem('compliance_user');
  sessionStorage.removeItem('ch_app_token');

  // Reset form
  document.getElementById('login-email').value = '';
  document.getElementById('login-pass').value = '';
  document.getElementById('login-error').innerHTML = '';
  document.getElementById('login-email').classList.remove('error');
  document.getElementById('login-pass').classList.remove('error');
  document.getElementById('login-btn').disabled = false;
  document.getElementById('login-btn-text').textContent = 'Entrar no Sistema';

  // Show login
  const loginScreen = document.getElementById('login-screen');
  loginScreen.classList.remove('hidden');
  loginScreen.style.opacity = '0';
  loginScreen.style.transition = 'opacity .3s ease';
  setTimeout(() => { loginScreen.style.opacity = '1'; }, 10);

  // Restore default avatar
  const avEl = document.getElementById('user-av');
  const nameEl = document.getElementById('user-name');
  if(avEl) { avEl.textContent = 'GC'; avEl.style.background = ''; }
  if(nameEl) nameEl.textContent = 'Gestão Compliance';

  setTimeout(() => { document.getElementById('login-email').focus(); }, 350);
}

function showForgotPass() {
  alert('Para recuperar sua senha, entre em contato com o administrador do sistema.\n\nE-mail: admin@torre.com.br');
}

// Shake keyframe via style tag
const shakeStyle = document.createElement('style');
shakeStyle.textContent = '@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }';
document.head.appendChild(shakeStyle);

// Check session on load (auto-login if session exists)
// ── DevTools detection — warn user in sensitive sessions
(function() {
  let _dtOpen = false;
  const _dtThreshold = 160;
  setInterval(() => {
    const widthDiff = window.outerWidth - window.innerWidth > _dtThreshold;
    const heightDiff = window.outerHeight - window.innerHeight > _dtThreshold;
    if((widthDiff || heightDiff) && !_dtOpen) {
      _dtOpen = true;
      // Clear sensitive data from DOM when DevTools detected
      document.querySelectorAll('.relato-text, #dn-detail-relato, #dn-detail-acao').forEach(el => {
        if(el._originalContent === undefined) el._originalContent = el.textContent;
        el.textContent = '[Conteúdo protegido]';
      });
    } else if(!widthDiff && !heightDiff && _dtOpen) {
      _dtOpen = false;
      document.querySelectorAll('.relato-text, #dn-detail-relato, #dn-detail-acao').forEach(el => {
        if(el._originalContent !== undefined) el.textContent = el._originalContent;
      });
    }
  }, 1000);
})();

// ── Disable right-click context menu on sensitive areas
document.addEventListener('contextmenu', e => {
  if(e.target.closest('.section, .modal, .page')) e.preventDefault();
});

function checkSession() {
  try {
    // Try new session format first (ch_session_v2)
    const s = _loadSession();
    if(s) {
      // Find user data from USUARIOS list
      const u = USUARIOS.find(x => x.email === s.email);
      if(u) {
        currentUser = { ...u, perfil: s.perfil, nome: s.nome, avatar: s.avatar, cor: s.cor };
        enterApp(currentUser);
        return true;
      }
      // User from Edge Function response
      currentUser = { email: s.email, perfil: s.perfil, nome: s.nome, avatar: s.avatar, cor: s.cor };
      enterApp(currentUser);
      return true;
    }
    // Fallback: old session key
    const saved = sessionStorage.getItem('compliance_user');
    if(saved) {
      const user = JSON.parse(saved);
      currentUser = user;
      // Migrate to new format
      _saveSession(user);
      sessionStorage.removeItem('compliance_user');
      enterApp(user);
      return true;
    }
  } catch(e) { console.warn('checkSession:', e); }
  return false;
}



// ══════════════════════════════════════════
// SUPABASE CONFIG — preencha com suas credenciais
// ══════════════════════════════════════════
// ⚠️  SUBSTITUA os valores abaixo pelos do seu projeto Supabase
// Pegue em: https://app.supabase.com → Settings → API

// ✅ URL do projeto (correta)
  // ← JÁ DEFINIDA NO INÍCIO

// ⚠️  COLE AQUI sua anon key (começa com eyJ...)
// Pegue em: supabase.com → seu projeto → Settings → API → "anon public"
// Chave anon não é mais usada diretamente — todo acesso vai pelo Edge Function
// Anon key — injetada pelo CI/CD via GitHub Secrets
const SUPABASE_ANON = '%%SUPABASE_ANON_KEY%%';

// Ativo quando a anon key parece uma JWT válida (começa com eyJ)
// Também verifica se há uma chave salva no localStorage
// ── EDGE FUNCTION — único ponto de acesso ao banco (service_role fica no servidor)
// const EDGE_URL = SUPABASE_URL + '/functions/v1/api';  // ← JÁ DEFINIDA NO INÍCIO

function getAppToken() { return sessionStorage.getItem('ch_app_token') || ''; }
function setAppToken(t) { sessionStorage.setItem('ch_app_token', t); }

// Mantido por compatibilidade (não expõe chave ao cliente)
function getActiveKey() { return localStorage.getItem('sb_anon_key_override') || SUPABASE_ANON || ''; }
function getSbHeaders(extra) { return Object.assign({'Content-Type':'application/json','x-app-token':getAppToken()}, extra||{}); }
const SB_HEADERS = new Proxy({}, { get(_, prop) { return getSbHeaders()[prop]; } });

const USE_SUPABASE = SUPABASE_URL.includes('supabase.co');

function _efH() {
  const k=getActiveKey(); return { 'Content-Type': 'application/json', 'x-app-token': getAppToken(), ...(k?{'apikey':k,'Authorization':'Bearer '+k}:{}) };
}

// ── API helpers — todas as chamadas passam pelo Edge Function
async function sbGet(table, params='') {
  const qs = params ? '&' + params : '';
  const token = getAppToken();
  // Try Edge Function first if token available
  if(token) {
    try {
      const r = await fetch(`${EDGE_URL}/data/${table}?order=id${qs}`, { headers: _efH() });
      if(r.ok) return r.json();
      if(r.status !== 401) {
        const txt = await r.text().catch(()=>'');
        throw new Error(`${table}: HTTP ${r.status} ${txt.slice(0,100)}`);
      }
      console.warn('[sbGet] Edge 401, tentando REST direto...');
    } catch(e) {
      if(!e.message.includes('401')) throw e;
    }
  }
  // Fallback: direct Supabase REST with anon key
  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=id&limit=10000${qs ? '&'+qs : ''}`, {
    headers: { 'Content-Type':'application/json', 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer '+SUPABASE_ANON }
  });
  if(!r2.ok) {
    const txt = await r2.text().catch(()=>'');
    throw new Error(`${table}: HTTP ${r2.status} ${txt.slice(0,100)}`);
  }
  return r2.json();
}
async function sbInsert(table, body) { return sbUpsert(table, body); }
async function sbUpdate(table, id, body) { return sbUpsert(table, { id, ...body }); }
async function sbUpsert(table, body, _c='id') {
  const token = getAppToken();
  if(token) {
    try {
      const r = await fetch(`${EDGE_URL}/data/${table}`,
        { method:'POST', headers: _efH(), body: JSON.stringify(body) });
      if(r.ok) return r.json();
      if(r.status !== 401) {
        const txt = await r.text().catch(()=>'');
        throw new Error(`${table}: HTTP ${r.status} ${txt.slice(0,100)}`);
      }
    } catch(e) { if(!e.message.includes('HTTP 4')) throw e; }
  }
  // Fallback: direct REST
  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/${table}`,
    { method:'POST', headers: { 'Content-Type':'application/json', 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer '+SUPABASE_ANON, 'Prefer': 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(body) });
  if(!r2.ok) { const txt = await r2.text().catch(()=>''); throw new Error(`${table}: ${r2.status} ${txt.slice(0,80)}`); }
  return r2.json();
}
async function sbDelete(table, id) {
  // Try Edge Function first
  const token = getAppToken();
  if(token) {
    try {
      const r = await fetch(`${EDGE_URL}/data/${table}?id=${id}`,
        { method:'DELETE', headers: _efH() });
      if(r.ok) return;
    } catch(e) { console.warn('sbDelete Edge falhou, usando REST:', e.message); }
  }
  // Fallback: REST direto
  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,
    { method:'DELETE', headers: {'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON} });
  if(!r2.ok) throw new Error(`sbDelete ${table}: ${r2.status}`);
}
async function sbDeleteProto(proto) {
  const token = getAppToken();
  if(token) {
    try {
      const r = await fetch(`${EDGE_URL}/data/denuncias?proto=${encodeURIComponent(proto)}`,
        { method:'DELETE', headers: _efH() });
      if(r.ok) return;
    } catch(e) { console.warn('sbDeleteProto Edge falhou:', e.message); }
  }
  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/denuncias?proto=eq.${encodeURIComponent(proto)}`,
    { method:'DELETE', headers: {'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON} });
  if(!r2.ok) throw new Error(`sbDeleteProto: ${r2.status}`);
}

// ── Map DB.denuncias item → Supabase row
function dnToRow(d) {
  return {
    id: d.id, proto: d.proto, cat: d.cat, filial: d.filial, setor: d.setor||'',
    data: d.data||null, anon: d.anon, perigo: d.perigo, status: d.status,
    resp: d.resp||'', relato: d.relato||'', acao_inicial: d.acaoInicial||'', obs: d.obs||'',
    conclusao: d.conclusao||''
  };
}
function rowToDn(r) {
  // Normalize data: Supabase may return "YYYY-MM-DD" or timestamp "YYYY-MM-DDTHH:..."
  let dataStr = r.data||'';
  if(dataStr && dataStr.includes('T')) dataStr = dataStr.split('T')[0]; // strip time
  return {
    id: r.id, proto: r.proto, cat: r.cat, filial: r.filial, setor: r.setor||'',
    data: dataStr, anon: r.anon, perigo: r.perigo, status: r.status,
    resp: r.resp||'', relato: r.relato||'', acaoInicial: r.acao_inicial||'', obs: r.obs||'',
    conclusao: r.conclusao||''
  };
}

// ── Load ALL data from Supabase into DB
async function loadFromSupabase() {
  try {
    showLoadingBar(true, 'Conectando ao Supabase...');

    // Uma única chamada carrega tudo — economiza créditos Netlify/Supabase
    const allData = await (async () => {
      const token = getAppToken();
      if(token) {
        try {
          const r = await fetch(`${EDGE_URL}/load-all`, { headers: _efH() });
          if(r.ok) {
            const d = await r.json();
            return {
              filiais: d.filiais||[], riscos: d.riscos||[], controles: d.controles||[],
              planos: d.planos||[], denRows: d.denuncias||[], fbRows: d.fbboards||[],
              rmPlanos: d.rmPlanos||[], agenda: d.agenda||[], settings: d.settings||[]
            };
          }
        } catch(e) { console.warn('load-all falhou, usando REST direto:', e.message); }
      }
      // Fallback: REST direto com anon key
      const [f,r,c,p,dn,fb,ag1,ag2,st] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/filiais?order=id&limit=10000`, {headers:{'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON}}).then(x=>x.json()),
        fetch(`${SUPABASE_URL}/rest/v1/riscos?order=id&limit=10000`, {headers:{'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON}}).then(x=>x.json()),
        fetch(`${SUPABASE_URL}/rest/v1/controles?order=id&limit=10000`, {headers:{'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON}}).then(x=>x.json()),
        fetch(`${SUPABASE_URL}/rest/v1/planos?order=id&limit=10000`, {headers:{'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON}}).then(x=>x.json()),
        fetch(`${SUPABASE_URL}/rest/v1/denuncias?order=id&limit=10000`, {headers:{'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON}}).then(x=>x.json()),
        fetch(`${SUPABASE_URL}/rest/v1/fbboards?id=eq.main`, {headers:{'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON}}).then(x=>x.json()),
        fetch(`${SUPABASE_URL}/rest/v1/agenda?order=data&limit=10000`, {headers:{'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON}}).then(x=>x.json()),
        fetch(`${SUPABASE_URL}/rest/v1/rm_planos?order=id&limit=10000`, {headers:{'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON}}).then(x=>x.json()),
        fetch(`${SUPABASE_URL}/rest/v1/settings?select=*`, {headers:{'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON}}).then(x=>x.json()),
      ]);
      return { filiais:f||[], riscos:r||[], controles:c||[], planos:p||[], denRows:dn||[], fbRows:fb||[], rmPlanos:ag2||[], agenda:ag1||[], settings:st||[] };
    })();
    const { filiais, riscos, controles, planos, denRows, fbRows } = allData;
    // Restore extra data from load-all
    if(allData.rmPlanos?.length > 0) DB.rmPlanos = allData.rmPlanos.map(p=>({id:p.id,riscoId:p.risco_id,titulo:p.titulo,resp:p.resp||'',prazo:p.prazo||'',tipo:p.tipo||'Preventiva',status:p.status||'Não Iniciado',prog:p.prog||0}));
    if(allData.agenda?.length > 0) DB.agenda = allData.agenda.map(e=>({id:e.id,titulo:e.titulo,tipo:e.tipo||'Outro',data:e.data,hora:e.hora||'',horaFim:e.hora_fim||'',local:e.local||'',resp:e.resp||'',desc:e.descricao||'',lembrete:e.lembrete||'',recorrencia:e.recorrencia||'nenhuma'}));
    if(allData.settings?.length > 0) { const units = allData.settings.find(s=>s.key==='rm_units'); if(units?.value) { try { const su=JSON.parse(units.value); if(Array.isArray(su)) su.forEach(u=>{ if(u.id&&!RM_UNITS.some(x=>x.id===u.id)) RM_UNITS.push(u); }); } catch(e){} } }

    // ── FILIAIS: Supabase é a fonte de verdade se tiver dados, senão mantém built-in
    if(filiais.length > 0) {
      DB.filiais = filiais.map(f => ({
        id:f.id, nome:f.nome, cnpj:f.cnpj||'', cidade:f.cidade||'',
        resp:f.resp||'', setor:f.setor||'', setores:f.setores||''
      }));
    }

    // ── RISCOS: merge Supabase + built-in
    // ── RISCOS: Supabase é a única fonte de verdade
    if(riscos.length > 0) {
      DB.riscos = riscos.map(r => ({
        id:r.id, desc:r.descricao||r.desc||'', cat:r.cat||'', filial:r.filial||'Todas',
        setor:r.setor||'', unidade:r.unidade||'Geral',
        prob:r.prob||10, impacto:r.impacto||10, controle:r.controle||'', obs:r.obs||''
      }));
    }

    // ── CONTROLES
    if(controles.length > 0) {
      DB.controles = controles.map(c => ({
        id:c.id, nome:c.nome, tipo:c.tipo, filial:c.filial, setor:c.setor,
        resp:c.resp||'', period:c.period, prazo:c.prazo||'',
        status:c.status, prog:c.prog||0, desc:c.descricao||''
      }));
    }

    // ── PLANOS
    if(planos.length > 0) {
      DB.planos = planos.map(p => ({
        id:p.id, titulo:p.titulo, origem:p.origem||'', filial:p.filial, setor:p.setor,
        resp:p.resp||'', prazo:p.prazo||'', prio:p.prio, status:p.status,
        prog:p.prog||0, desc:p.descricao||''
      }));
    }

    // ── DENÚNCIAS: Supabase é a única fonte de verdade
    if(denRows.length > 0) {
      DB.denuncias = denRows.map(rowToDn);
    }

    // ── FLOWBOARD
    if(fbRows && fbRows[0] && fbRows[0].data) {
      const saved = fbRows[0].data;
      if(Object.keys(saved).length > 0) DB.fbBoards = saved;
    }

    // rm_planos, agenda e settings já carregados no load-all acima

    // ── Atualizar _ids com o máximo de todos os dados
    const maxId = arr => arr && arr.length ? Math.max(...arr.map(x=>x.id||0)) + 1 : 1;
    DB._ids.filial  = Math.max(DB._ids.filial||1,  maxId(DB.filiais));
    DB._ids.risco   = Math.max(DB._ids.risco||20,  maxId(DB.riscos));
    DB._ids.rmPlano = Math.max(DB._ids.rmPlano||17, maxId(DB.rmPlanos));
    DB._ids.ctrl    = Math.max(DB._ids.ctrl||1,    maxId(DB.controles));
    DB._ids.plano   = Math.max(DB._ids.plano||1,   maxId(DB.planos));
    DB._ids.dn      = Math.max(DB._ids.dn||1,      maxId(DB.denuncias));
    DB._ids.agenda  = Math.max(DB._ids.agenda||1,  maxId(DB.agenda));

    saveLocalCache();
    showLoadingBar(false);
    setSaveIndicator('☁️ Sincronizado', 'var(--accent)');
    console.log(`[ComplianceHub] Supabase OK: ${DB.riscos.length} riscos, ${DB.denuncias.length} denúncias, ${DB.filiais.length} filiais`);
    return true;
  } catch(e) {
    showLoadingBar(false);
    console.warn('[ComplianceHub] Supabase erro:', e.message);

    if(e.message && (e.message.includes('Failed to fetch') || e.message.includes('NetworkError'))) {
      setSaveIndicator('⚠️ Sem internet (cache local)', 'var(--warn)');
      return false;
    }
    if(e.message && e.message.includes('não existe')) {
      setSaveIndicator('❌ Tabelas não criadas', 'var(--danger)');
      setTimeout(() => alert('❌ ' + e.message + '\n\nExecute o arquivo supabase_COMPLETO.sql no SQL Editor do Supabase.'), 300);
      return false;
    }
    if(e.message && e.message.includes('sem permissão')) {
      setSaveIndicator('❌ Permissão negada', 'var(--danger)');
      setTimeout(() => alert('❌ ' + e.message + '\n\nExecute o arquivo supabase_LIBERAR_SCHEMA.sql no SQL Editor do Supabase.'), 300);
      return false;
    }
    setSaveIndicator('❌ ' + e.message.slice(0,50), 'var(--danger)');
    console.warn('[ComplianceHub] Erro Supabase:', e.message);
    return false;
  }
}

// ── Save single item to Supabase
async function sbSaveDenuncia(d) {
  if(!USE_SUPABASE) return;
  try {
    await sbUpsert('denuncias', dnToRow(d));
    auditLog('update','denuncias', `Denúncia ${d.proto||d.id} — status: ${d.status||''}`, {proto:d.proto, status:d.status});
  } catch(e) { console.warn('sbSaveDenuncia:', e.message); }
}
async function sbSaveAgenda(e) {
  if(!USE_SUPABASE) return;
  const row = {
    id:e.id, titulo:e.titulo, tipo:e.tipo||'Outro',
    data:e.data, hora:e.hora||'', hora_fim:e.horaFim||'',
    local:e.local||'', resp:e.resp||'', descricao:e.desc||'',
    lembrete:e.lembrete||'', recorrencia:e.recorrencia||'nenhuma'
  };
  try { await sbUpsert('agenda', row); auditLog('update','agenda',`Evento "${e.titulo}" salvo`,{data:e.data,tipo:e.tipo}); }
  catch(e2) { console.warn('sbSaveAgenda:', e2.message); }
}
async function sbDeleteAgenda(id) {
  if(!USE_SUPABASE) return;
  try { await sbDelete('agenda', id); auditLog('delete','agenda',`Evento ID ${id} excluído`,{id}); }
  catch(e) { console.warn('sbDeleteAgenda:', e.message); }
}
async function sbDeleteDenuncia(id) {
  if(!USE_SUPABASE) return;
  try {
    await sbDelete('denuncias', id);
    auditLog('delete','denuncias', `Denúncia ID ${id} excluída`, {id});
  } catch(e) { console.warn('sbDeleteDenuncia:', e.message); }
}
async function sbSaveFilial(f) {
  if(!USE_SUPABASE) return;
  const row = { id:f.id, nome:f.nome, cnpj:f.cnpj||'', cidade:f.cidade||'', resp:f.resp||'', setor:f.setor||'', setores:f.setores||'' };
  try { await sbUpsert('filiais', row); auditLog('update','filiais',`Filial "${f.nome}" salva`,{nome:f.nome}); }
  catch(e) { console.warn('sbSaveFilial:', e.message); }
}
async function sbDeleteFilial(id) {
  if(!USE_SUPABASE) return;
  try { await sbDelete('filiais', id); auditLog('delete','filiais',`Filial ID ${id} excluída`,{id}); }
  catch(e) { console.warn('sbDeleteFilial:', e.message); }
}
async function sbSaveRisco(r) {
  if(!USE_SUPABASE) return;
  const row = { id:r.id, descricao:r.desc, cat:r.cat, filial:r.filial||'Todas', setor:r.setor, unidade:r.unidade||'Geral', prob:r.prob, impacto:r.impacto, controle:r.controle||'', obs:r.obs||'' };
  try { await sbUpsert('riscos', row); auditLog('update','riscos',`Risco "${r.desc?.substring(0,40)}" salvo — ${r.unidade||''}`,{unidade:r.unidade}); }
  catch(e) { console.warn('sbSaveRisco:', e.message); }
}
async function sbDeleteRisco(id) {
  if(!USE_SUPABASE) return;
  try { await sbDelete('riscos', id); auditLog('delete','riscos',`Risco ID ${id} excluído`,{id}); }
  catch(e) { console.warn('sbDeleteRisco:', e.message); }
}
async function sbSaveRmPlano(p) {
  if(!USE_SUPABASE) return;
  // rmPlanos table: id, risco_id, titulo, resp, prazo, tipo, status, prog
  const row = { id:p.id, risco_id:p.riscoId, titulo:p.titulo, resp:p.resp||'', prazo:p.prazo||null, tipo:p.tipo||'Preventiva', status:p.status||'Não Iniciado', prog:p.prog||0 };
  try { await sbUpsert('rm_planos', row); auditLog('update','rm_planos',`Plano RM "${p.titulo}" salvo`,{titulo:p.titulo,status:p.status}); }
  catch(e) { console.warn('sbSaveRmPlano:', e.message); }
}
async function sbDeleteRmPlano(id) {
  if(!USE_SUPABASE) return;
  try { await sbDelete('rm_planos', id); auditLog('delete','rm_planos',`Plano RM ID ${id} excluído`,{id}); }
  catch(e) { console.warn('sbDeleteRmPlano:', e.message); }
}
async function sbSaveRmUnit(units) {
  if(!USE_SUPABASE) return;
  // Store custom units as JSON in a settings table
  try { await sbUpsert('settings', { key:'rm_units', value: JSON.stringify(units) }); }
  catch(e) { console.warn('sbSaveRmUnit:', e.message); }
}
async function sbSaveControle(c) {
  if(!USE_SUPABASE) return;
  const row = { id:c.id, nome:c.nome, tipo:c.tipo, filial:c.filial, setor:c.setor, resp:c.resp||'', period:c.period, prazo:c.prazo||null, status:c.status, prog:c.prog||0, descricao:c.desc||'' };
  try { await sbUpsert('controles', row); auditLog('update','controles',`Controle "${c.nome}" salvo`,{nome:c.nome,status:c.status}); }
  catch(e) { console.warn('sbSaveControle:', e.message); }
}
async function sbDeleteControle(id) {
  if(!USE_SUPABASE) return;
  try { await sbDelete('controles', id); auditLog('delete','controles',`Controle ID ${id} excluído`,{id}); }
  catch(e) { console.warn('sbDeleteControle:', e.message); }
}
async function sbSavePlano(p) {
  if(!USE_SUPABASE) return;
  const row = { id:p.id, titulo:p.titulo, origem:p.origem||'', filial:p.filial, setor:p.setor, resp:p.resp||'', prazo:p.prazo||null, prio:p.prio, status:p.status, prog:p.prog||0, descricao:p.desc||'' };
  try { await sbUpsert('planos', row); auditLog('update','planos',`Plano "${p.titulo}" salvo`,{titulo:p.titulo,status:p.status}); }
  catch(e) { console.warn('sbSavePlano:', e.message); }
}
async function sbDeletePlano(id) {
  if(!USE_SUPABASE) return;
  try { await sbDelete('planos', id); auditLog('delete','planos',`Plano ID ${id} excluído`,{id}); }
  catch(e) { console.warn('sbDeletePlano:', e.message); }
}
async function sbSaveFbBoards() {
  if(!USE_SUPABASE) return;
  try { await sbUpsert('fbboards', { id:'main', data: DB.fbBoards, updated_at: new Date().toISOString() }); }
  catch(e) { console.warn('sbSaveFbBoards:', e.message); }
}

// ── Bulk import denuncias to Supabase
async function sbBulkImportDenuncias(rows) {
  if(!USE_SUPABASE || rows.length === 0) return;
  let success = 0, failed = 0;
  try {
    // Send in batches of 50
    for(let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i+50).map(dnToRow);
      showLoadingBar(true, `Enviando ao Supabase... ${Math.min(i+50, rows.length)}/${rows.length}`);
      try {
        await sbUpsert('denuncias', batch);
        success += batch.length;
      } catch(batchErr) {
        console.warn('Batch falhou, tentando individualmente:', batchErr.message);
        // Retry individually to isolate bad rows
        for(const row of batch) {
          try {
            await sbUpsert('denuncias', row);
            success++;
          } catch(rowErr) {
            console.warn('Linha falhou id=' + row.id + ':', rowErr.message);
            failed++;
          }
        }
      }
    }
    showLoadingBar(false);
    if(failed > 0) {
      setSaveIndicator(`⚠️ ${success} salvas, ${failed} com erro`, 'var(--warn)');
    } else {
      auditLog('import', 'denuncias', `Planilha importada — ${success} denúncias`, {total:success, erros:failed});
    setSaveIndicator(`☁️ ${success} denúncias salvas na nuvem`, 'var(--accent)');
    }
  } catch(e) {
    console.warn('sbBulkImport erro geral:', e.message);
    showLoadingBar(false);
    setSaveIndicator('❌ Erro ao salvar na nuvem: ' + e.message.slice(0,60), 'var(--danger)');
  }
}

// ══════════════════════════════════════════
// CACHE LOCAL (fallback offline)
// ══════════════════════════════════════════
const DB_KEY = 'compliance_hub_db_v5';
function saveLocalCache() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify({
      filiais:DB.filiais, riscos:DB.riscos, rmPlanos:DB.rmPlanos||[],
      rmUnits:RM_UNITS,
      controles:DB.controles, planos:DB.planos, denuncias:DB.denuncias,
      fbBoards:DB.fbBoards, agenda:DB.agenda||[], _ids:DB._ids, _savedAt:new Date().toISOString()
    }));
  } catch(e) { console.warn('saveLocalCache:', e); }
}
function loadLocalCache() {
  try {
    // Limpar chaves antigas
    ['v1','v2','v3','v4'].forEach(v => { try { localStorage.removeItem('compliance_hub_db_'+v); } catch(e){} });
    const raw = localStorage.getItem(DB_KEY);
    if(!raw) return false;
    const s = JSON.parse(raw);
    if(!s) return false;
    // Filiais: cache só vence se tiver mais que o built-in (16)
    // Supabase é a fonte de verdade — cache local é só fallback offline
    if(s.filiais && s.filiais.length > 0) DB.filiais = s.filiais;
    if(s.riscos && s.riscos.length > 0) DB.riscos = s.riscos;
    if(s.rmPlanos && s.rmPlanos.length > 0) DB.rmPlanos = s.rmPlanos;
    if(s.controles && s.controles.length > 0) DB.controles = s.controles;
    if(s.planos && s.planos.length > 0) DB.planos = s.planos;
    if(s.denuncias && s.denuncias.length > 0) DB.denuncias = s.denuncias;
    if(s.fbBoards) DB.fbBoards = s.fbBoards;
    if(s.agenda && s.agenda.length > 0) DB.agenda = s.agenda;
    if(s._ids) Object.keys(s._ids).forEach(k => { if((s._ids[k]||0) > (DB._ids[k]||0)) DB._ids[k] = s._ids[k]; });
    // Restore custom units (keep built-in + add user-created ones)
    if(s.rmUnits && Array.isArray(s.rmUnits)) {
      s.rmUnits.forEach(u => {
        if(u.id && !RM_UNITS.some(x=>x.id===u.id)) {
          RM_UNITS.push(u);
        }
      });
    }
    return true;
  } catch(e) { return false; }
}
function forceResetCache() {
  if(!confirm('Limpar cache e recarregar dados originais?\nSuas denúncias serão mantidas.')) return;
  try {
    const dn = JSON.stringify(DB.denuncias);
    ['v1','v2','v3','v4','v5'].forEach(v => { try { localStorage.removeItem('compliance_hub_db_'+v); } catch(e){} });
    try { localStorage.clear(); } catch(e) {}
    try { DB.denuncias = JSON.parse(dn); saveLocalCache(); } catch(e) {}
  } catch(e) {}
  location.reload();
}
function clearLocalCache() { localStorage.removeItem(DB_KEY); }

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


// ══════════════════════════════════════════
// PAINEL ADMIN — GERENCIAR DADOS
// ══════════════════════════════════════════
function openAdminPanel() {
  const size = getDBSizeKB();
  const savedAt = (() => {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if(!raw) return 'Nunca salvo';
      const snap = JSON.parse(raw);
      return snap._savedAt
        ? new Date(snap._savedAt).toLocaleString('pt-BR')
        : 'Desconhecido';
    } catch(e) { return 'Erro'; }
  })();
  // Show Supabase connection status
  const sbStatusEl = document.getElementById('admin-sb-status');
  if(sbStatusEl) {
    sbStatusEl.textContent = USE_SUPABASE
      ? '🟢 Supabase configurado (' + SUPABASE_URL.replace('https://','').split('.')[0] + '.supabase.co)'
      : '🔴 Supabase não configurado — dados salvos só neste navegador';
    sbStatusEl.style.color = USE_SUPABASE ? 'var(--accent)' : 'var(--danger)';
  }

  document.getElementById('admin-size').textContent = size + ' KB';
  document.getElementById('admin-saved-at').textContent = savedAt;
  document.getElementById('admin-denuncias-count').textContent = DB.denuncias.length;
  document.getElementById('admin-filiais-count').textContent = DB.filiais.length;
  document.getElementById('admin-controles-count').textContent = DB.controles.length;
  document.getElementById('admin-planos-count').textContent = DB.planos.length;
  document.getElementById('admin-riscos-count').textContent = DB.riscos.length;
  openModal('modal-admin');
}

function adminSaveNow() {
  saveDB();
  const btn = document.getElementById('btn-admin-save');
  btn.textContent = '✅ Salvo!';
  setTimeout(() => { btn.textContent = '💾 Salvar Agora'; }, 1500);
  openAdminPanel(); // refresh stats
}

function adminExportJSON() {
  const snap = {
    filiais: DB.filiais, riscos: DB.riscos,
    controles: DB.controles, planos: DB.planos,
    denuncias: DB.denuncias, fbBoards: DB.fbBoards,
    _ids: DB._ids, _exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(snap, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'compliance_hub_backup_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
}

function adminImportJSON(e) {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const snap = JSON.parse(ev.target.result);
      if(!snap.denuncias) { alert('Arquivo inválido — não é um backup do Compliance Hub.'); return; }
      if(!confirm(`Importar backup de ${new Date(snap._exportedAt||Date.now()).toLocaleString('pt-BR')}?\n\nIsso substituirá TODOS os dados atuais.\n\nContinuar?`)) return;
      DB.filiais   = snap.filiais   || DB.filiais;
      DB.riscos    = snap.riscos    || DB.riscos;
      DB.controles = snap.controles || DB.controles;
      DB.planos    = snap.planos    || DB.planos;
      DB.denuncias = snap.denuncias || DB.denuncias;
      DB.fbBoards  = snap.fbBoards  || DB.fbBoards;
      DB._ids      = snap._ids      || DB._ids;
      saveDB();
      populateFilialSelects();
      populateRelSelectsForce();
      renderDashboard();
      closeModal('modal-admin');
      alert('✅ Backup importado com sucesso! ' + DB.denuncias.length + ' denúncias carregadas.');
    } catch(err) {
      alert('Erro ao importar: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

async function adminSyncSupabase() {
  if(!USE_SUPABASE) {
    alert('⚠️ Supabase não configurado.\n\nAbra o arquivo HTML e substitua os valores:\n- SUPABASE_URL\n- SUPABASE_ANON_KEY');
    return;
  }
  closeModal('modal-admin');
  const ok = await loadFromSupabase();
  if(ok) {
    populateFilialSelects();
    populateRelSelectsForce();
    renderDashboard();
    if(typeof renderMapaRisco === 'function') renderMapaRisco();
    alert('✅ Dados sincronizados com sucesso!\n\n' + DB.riscos.length + ' riscos, ' + DB.denuncias.length + ' denúncias carregadas da nuvem.');
  } else {
    alert('❌ Falha ao conectar ao Supabase.\n\nVerifique:\n1. URL e chave corretas\n2. Conexão com a internet\n3. Políticas RLS no Supabase');
  }
}

// Push ALL local data to Supabase (resolve inconsistências entre dispositivos)
async function adminPushToSupabase() {
  if(!USE_SUPABASE) { alert('Supabase não configurado.'); return; }
  if(!confirm('Isso vai enviar TODOS os dados locais para o Supabase, sobrescrevendo o que está na nuvem.\n\nContinuar?')) return;
  closeModal('modal-admin');
  setSaveIndicator('⏳ Enviando para nuvem...','var(--warn)');
  try {
    // Push riscos (apenas os que não são built-in puro — com unidade definida)
    const riscosToSync = (DB.riscos||[]);
    await Promise.all(riscosToSync.map(r => sbSaveRisco(r)));
    // Push rmPlanos
    const rmPlanosToSync = (DB.rmPlanos||[]);
    await Promise.all(rmPlanosToSync.map(p => sbSaveRmPlano(p)));
    // Push units
    await sbSaveRmUnit(RM_UNITS);
    // Push filiais
    await Promise.all((DB.filiais||[]).map(f => sbUpsert('filiais', {id:f.id,nome:f.nome,cnpj:f.cnpj||'',cidade:f.cidade||'',resp:f.resp||'',setor:f.setor||'',setores:f.setores||''})));
    // Push denuncias
    await Promise.all((DB.denuncias||[]).map(d => sbSaveDenuncia(d)));
    await Promise.all((DB.agenda||[]).map(e => sbSaveAgenda(e)));
    setSaveIndicator('☁️ Tudo enviado para nuvem','var(--accent)');
    alert('✅ Todos os dados foram enviados para o Supabase!\n\n' + riscosToSync.length + ' riscos\n' + rmPlanosToSync.length + ' planos\n' + (DB.denuncias||[]).length + ' denúncias\n' + (DB.agenda||[]).length + ' eventos');
  } catch(e) {
    setSaveIndicator('❌ Erro ao enviar','var(--danger)');
    alert('❌ Erro: ' + e.message);
  }
}

function adminReset() {
  if(!confirm('⚠️ ATENÇÃO\n\nIsso apagará TODAS as edições do cache local e recarregará da nuvem (se configurado).\n\nEsta ação não pode ser desfeita.\n\nTem certeza?')) return;
  if(!confirm('Confirme: deseja realmente resetar o cache local?')) return;
  clearLocalCache();
  location.reload();
}


function init() {
  // Date chip
  const now = new Date();
  document.getElementById('date-chip').textContent = now.toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });

  // ── Load data: try Supabase first, fall back to local cache
  if(USE_SUPABASE) {
    // Show cache immediately while Supabase loads
    loadLocalCache();
    populateFilialSelects();
    populateRelSelectsForce();
    renderDashboard();
    // Only load from Supabase if we have a valid token
    if(getAppToken()) {
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

function showAnonKeySetup() {
  const key = prompt(
    '🔑 Cole aqui sua ANON KEY do Supabase\n\n' +
    'Como pegar:\n' +
    '1. Acesse: https://supabase.com\n' +
    '2. Abra seu projeto\n' +
    '3. Clique em Settings → API\n' +
    '4. Copie o campo "anon public"\n\n' +
    'A chave começa com: eyJhbGci...'
  );
  if(!key || !key.startsWith('eyJ')) {
    if(key) alert('❌ Chave inválida! A anon key deve começar com "eyJ"\n\nCertifique-se de copiar o campo "anon public" (não o service_role)');
    return;
  }
  // Salvar a chave no localStorage e recarregar com ela
  localStorage.setItem('sb_anon_key_override', key);
  alert('✅ Chave salva! O sistema vai recarregar agora.');
  location.reload();
}

// Anon key override gerenciado por getActiveKey()

// ══════════════════════════════════════════
// DUE DILIGENCE v4 — CPF + CNPJ + Mídias Negativas + Boolean Search
// ══════════════════════════════════════════
let ddTab='pj', ddCnpjN='', ddVerQueues={pj:[],pf:[]}, ddStCount=0;
const JUNTAS={AC:{n:'JUCEA',u:'https://www.jucea.ac.gov.br/'},AL:{n:'JUCEAL',u:'https://www.juceal.al.gov.br/'},AM:{n:'JUCEA-AM',u:'https://www.jucea.am.gov.br/'},AP:{n:'JUCAP',u:'http://www.jucap.ap.gov.br/'},BA:{n:'JUCEB',u:'https://www.juceb.ba.gov.br/'},CE:{n:'JUCEC',u:'https://www.jucec.ce.gov.br/'},DF:{n:'JUCDF',u:'https://www.jucdf.df.gov.br/'},ES:{n:'JUCEES',u:'https://www.jucees.es.gov.br/'},GO:{n:'JUCEG',u:'https://www.juceg.go.gov.br/'},MA:{n:'JUCEMA',u:'https://www.jucema.ma.gov.br/'},MG:{n:'JUCEMG',u:'https://www.jucemg.mg.gov.br/'},MS:{n:'JUCEMS',u:'https://www.jucems.ms.gov.br/'},MT:{n:'JUCEMAT',u:'https://www.jucemat.mt.gov.br/'},PA:{n:'JUCEPA',u:'https://www.jucepa.pa.gov.br/'},PB:{n:'JUCEP',u:'https://www.jucep.pb.gov.br/'},PE:{n:'JUCEPE',u:'https://www.jucepe.pe.gov.br/'},PI:{n:'JUCEPI',u:'https://www.jucepi.pi.gov.br/'},PR:{n:'JUCEPAR',u:'https://www.jucepar.pr.gov.br/'},RJ:{n:'JUCERJA',u:'https://www.jucerja.rj.gov.br/'},RN:{n:'JUCERN',u:'https://www.jucern.rn.gov.br/'},RO:{n:'JUCER',u:'http://www.jucer.ro.gov.br/'},RR:{n:'JUCERR',u:'https://www.jucerr.rr.gov.br/'},RS:{n:'JUCERGS',u:'https://www.jucergs.rs.gov.br/'},SC:{n:'JUCESC',u:'https://www.jucesc.sc.gov.br/'},SE:{n:'JUCESE',u:'https://www.jucese.se.gov.br/'},SP:{n:'JUCESP',u:'https://www.jucesp.sp.gov.br/'},TO:{n:'JUCETINS',u:'https://www.jucetins.to.gov.br/'}};

// ── MASKS ─────────────────────────────────
function ddMC(v){v=v.replace(/\D/g,'');v=v.replace(/^(\d{2})(\d)/,'$1.$2');v=v.replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3');v=v.replace(/\.(\d{3})(\d)/,'.$1/$2');v=v.replace(/(\d{4})(\d)/,'$1-$2');return v.substr(0,18);}
function ddMCpf(v){v=v.replace(/\D/g,'');v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');return v.substr(0,14);}
function ddFmt(n){return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,'$1.$2.$3/$4-$5');}
function ddV(id){const e=document.getElementById(id);return e?e.value.trim():'';}
function ddSet(id,v){const e=document.getElementById(id);if(e&&v&&!e.value)e.value=v;}
function ddSC(s){const u=(s||'').toUpperCase();if(u.includes('ATIVA')||u==='02')return'ok';if(u.includes('INAPT')||u.includes('SUSPENS')||u.includes('BAIXAD')||u.includes('CANCEL'))return'err';return'warn';}

// ── TABS ──────────────────────────────────
function ddSwitchTab(tab){
  ddTab=tab;
  document.getElementById('dd-tab-pj').classList.toggle('active',tab==='pj');
  document.getElementById('dd-tab-pf').classList.toggle('active',tab==='pf');
  document.getElementById('dd-panel-pj').style.display=tab==='pj'?'block':'none';
  document.getElementById('dd-panel-pf').style.display=tab==='pf'?'block':'none';
}

// ── GOOGLE URL ────────────────────────────
function ddG(q){return{url:'https://www.google.com/search?q='+encodeURIComponent(q),query:q,isGoogle:true};}
function ddGT(q){return{url:'https://www.google.com/search?q='+encodeURIComponent(q)+'&tbm=nws',query:q+' [NOTÍCIAS]',isGoogle:true};}// Google Notícias
function ddA(url,q){return{url,query:q,isGoogle:false};}

// ── BOOLEAN SEARCH BUILDER ────────────────
// Constrói queries booleanas profissionais para mídias negativas
function buildBooleanQuery(alvo, doc){
  const base = `"${alvo}"`;
  const docStr = doc ? ` "${doc}"` : '';

  return {
    criminal: `${base}${docStr} AND (corrupção OR crime OR processo OR investigação OR fraude OR "lavagem de dinheiro" OR suborno OR "trabalho escravo" OR "lista suja" OR condenado OR réu OR "mandado de prisão" OR peculato OR tráfico OR sequestro) -site:instagram.com -site:facebook.com -site:tiktok.com`,
    financeiro: `${base}${docStr} AND (fraude OR "pirâmide financeira" OR Ponzi OR insolvência OR inadimplência OR offshore OR "evasão de divisas" OR "crimes financeiros" OR falência OR "recuperação judicial" OR protesto OR inadimplente OR estelionato) -site:instagram.com -site:facebook.com`,
    regulatorio: `${base}${docStr} AND (sanção OR "improbidade administrativa" OR OFAC OR blacklist OR "investigação MP" OR "Ministério Público" OR CVM OR BACEN OR "processo administrativo" OR interdição OR cassação OR suspenso) -site:instagram.com -site:facebook.com`,
    reputacional: `${base}${docStr} AND (escândalo OR denúncia OR "assédio moral" OR "assédio sexual" OR "desastre ambiental" OR "multa IBAMA" OR "direitos humanos" OR "trabalho análogo" OR golpe OR fraude OR calote OR enganou) -site:instagram.com`,
    pep: `"${alvo}" AND ("cargo público" OR "servidor público" OR governador OR senador OR deputado OR prefeito OR secretário OR ministro OR "Pessoa Politicamente Exposta" OR PEP OR "partido político")`,
    recente: `"${alvo}"${docStr} after:${new Date(Date.now()-365*24*60*60*1000).toISOString().split('T')[0]}`,
  };
}

// ── VERIFY ────────────────────────────────
let ddVStats={};
function ddInitStats(prefix){ddVStats[prefix]={f:0,n:0,neg:0,e:0,tot:0};}

async function ddCheckLink(statusEl, url, query, prefix, isNegative){
  if(!url||!url.includes('google.com/search')){
    ddSetStatus(statusEl,'manual','Verificação manual');
    ddVStats[prefix].e++;ddUpdVerBar(prefix,ddVerQueues[prefix].length);return;
  }
  const clean=query.replace(/site:\S+/g,'').replace(/"[^"]*"\s+AND\s+/g,'').replace(/AND|OR|NOT/g,'').replace(/[-"()]/g,'').replace(/\s+/g,' ').trim().substring(0,80);
  try{
    const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),7000);
    const r=await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(clean)}&format=json&no_html=1&skip_disambig=1`,{signal:ctrl.signal});
    clearTimeout(tid);if(!r.ok){throw new Error('err');}
    const d=await r.json();
    const has=!!(d.AbstractText?.length>15||d.RelatedTopics?.length>0||d.Results?.length>0||d.Answer?.length>0);
    if(has){
      if(isNegative){ddSetStatus(statusEl,'negative','🟣 Mídia negativa detectada');ddVStats[prefix].neg++;}
      else{ddSetStatus(statusEl,'found','✅ Encontrado');ddVStats[prefix].f++;}
    }else{ddSetStatus(statusEl,'not-found','➖ Sem resultados');ddVStats[prefix].n++;}
  }catch(e){ddSetStatus(statusEl,'manual','Verificação manual');ddVStats[prefix].e++;}
  ddUpdVerBar(prefix, ddVerQueues[prefix].length);
}

function ddSetStatus(el,cls,txt){
  if(!el)return;
  el.className='dd-st '+cls;
  el.innerHTML=`<div class="dd-std"></div>${txt}`;
}

// Atualiza painel de risco quando mídias negativas são detectadas em tempo real
function ddAtualizarPainelRisco(prefix) {
  const s = ddVStats[prefix];
  if(!s || s.neg === 0) return;
  const painelId = prefix === 'pj' ? 'pj-risk-midia' : 'pf-risk-midia';
  let painel = document.getElementById(painelId);
  if(!painel) {
    // Criar painel de alerta de mídias negativas
    const resultado = document.getElementById(prefix+'-result');
    if(!resultado) return;
    const riskBox = resultado.querySelector('.dd-rb');
    if(!riskBox) return;
    painel = document.createElement('div');
    painel.id = painelId;
    painel.style.cssText = 'background:#fdf4ff;border:2px solid #a855f7;border-radius:10px;padding:14px 16px;margin-bottom:12px';
    riskBox.insertAdjacentElement('afterend', painel);
  }
  painel.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <span style="font-size:1.3rem">🟣</span>
      <div>
        <div style="font-weight:800;color:#7e22ce;font-size:.9rem">ATENÇÃO — ${s.neg} mídia(s) negativa(s) detectada(s) automaticamente</div>
        <div style="font-size:.77rem;color:#6b21a8;margin-top:2px">Verifique os links marcados com 🟣 abaixo. Presença em mídias negativas eleva significativamente o risco contratual.</div>
      </div>
    </div>
    <div style="background:#fff;border-radius:8px;padding:10px 14px;font-size:.82rem;color:#7e22ce;font-weight:600">
      ⚠️ Recomendação: investigar o conteúdo de cada link marcado antes de qualquer decisão de contratação. 
      Considere elevar o nível de risco desta empresa para <strong>ALTO</strong> se o conteúdo confirmar irregularidades.
    </div>`;
}

function ddUpdVerBar(prefix, total){
  const s=ddVStats[prefix];
  const done=s.f+s.n+s.neg+s.e;
  const pct=total>0?Math.round((done/total)*100):0;
  const fill=document.getElementById(prefix+'-vb-fill');const pctEl=document.getElementById(prefix+'-vb-pct');
  if(fill)fill.style.width=pct+'%';if(pctEl)pctEl.textContent=pct+'%';
  ['f','n','neg','e'].forEach(k=>{const el=document.getElementById(prefix+'-vb-'+k);if(el)el.textContent=s[k];});
  if(done>=total){const vb=document.getElementById(prefix+'-vbar');const t=vb?.querySelector('.dd-vb-t span');if(t)setTimeout(()=>{t.textContent=`✅ Verificação concluída — ${s.neg} mídia(s) negativa(s) detectada(s)`;t.style.color=s.neg>0?'#7e22ce':'var(--text-muted)';},500);}
}

async function ddRunVerify(queue,prefix){
  ddInitStats(prefix);
  const vb=document.getElementById(prefix+'-vbar');if(vb)vb.classList.add('show');
  const fill=document.getElementById(prefix+'-vb-fill');const pctEl=document.getElementById(prefix+'-vb-pct');
  if(fill)fill.style.width='0%';if(pctEl)pctEl.textContent='0%';
  for(let i=0;i<queue.length;i+=2){
    const batch=queue.slice(i,i+2);
    await Promise.all(batch.map(item=>ddCheckLink(item.el,item.url,item.query,prefix,item.isNegative||false)));
    if(i+2<queue.length)await new Promise(r=>setTimeout(r,480));
  }
}

// ── LINK HTML ─────────────────────────────
function ddLiHTML(item, prefix, isNegative=false){
  if(item.disabled)return`<div class="dd-li disabled"><span class="dd-lb lb-${item.p||'g'}">${item.p==='r'?'CRÍTICO':item.p==='a'?'ATENÇÃO':'BASE'}</span><div class="dd-li-main"><div class="dd-li-lbl">${item.label}</div></div></div>`;
  const sid='ds'+(++ddStCount);
  const initCls=item.isGoogle?'checking':'manual';
  const initTxt=item.isGoogle?'Verificando...':'Verificação manual';
  const lbCls=item.isMidia?'lb-neg':(item.p==='r'?'lb-r':item.p==='a'?'lb-a':'lb-g');
  const lbTxt=item.isMidia?'MÍDIA NEG.':(item.p==='r'?'CRÍTICO':item.p==='a'?'ATENÇÃO':'BASE');
  const qchip=item.query?`<span class="dd-li-q" title="${item.query.replace(/"/g,"'")}">${item.query.length>68?item.query.substr(0,68)+'…':item.query}</span>`:'';
  if(item.isGoogle&&item.url&&item.url!=='#'){
    ddVerQueues[prefix].push({id:sid,url:item.url,query:item.query||'',isNegative:item.isMidia||isNegative});
  }
  return`<a class="dd-li" href="${item.url||'#'}" target="_blank" rel="noopener">
    <span class="dd-lb ${lbCls}">${lbTxt}</span>
    <div class="dd-li-main"><div class="dd-li-lbl">${item.label}</div>${qchip}</div>
    <div class="dd-st ${initCls}" id="${sid}"><div class="dd-std"></div>${initTxt}</div>
    <span style="color:var(--text-muted);font-size:.76rem;flex-shrink:0;margin-left:2px">↗</span>
  </a>`;
}

// ── LOG ───────────────────────────────────
function ddAddLog(prefix,msg,type='spin'){
  const w=document.getElementById(prefix+'-logwrap');const el=document.getElementById(prefix+'-log');
  if(w)w.style.display='block';
  const d=document.createElement('div');d.className='dd-logline';
  const ico=type==='spin'?'<div class="dd-lspin"></div>':`<div class="dd-ldot" style="background:${type==='ok'?'var(--accent)':type==='err'?'var(--danger)':'var(--warn)'}"></div>`;
  d.innerHTML=ico+`<span>${msg}</span>`;el.appendChild(d);return d;
}
function ddUpdLog(el,msg,type){
  if(!el)return;
  const dot=el.querySelector('.dd-lspin,.dd-ldot');
  if(dot){dot.className='dd-ldot';dot.style.background=type==='ok'?'var(--accent)':type==='err'?'var(--danger)':'var(--warn)';}
  const sp=el.querySelector('span');if(sp)sp.textContent=msg;
}

// ── API ───────────────────────────────────
async function ddTryApi(url,name,line){
  try{
    const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),9000);
    const r=await fetch(url,{signal:ctrl.signal,headers:{'Accept':'application/json'}});
    clearTimeout(tid);if(!r.ok){ddUpdLog(line,`${name} — HTTP ${r.status}`,'err');return null;}
    const d=await r.json();
    if(d&&(d.razao_social||d.nome||d.cnpj)){ddUpdLog(line,`${name} — dados recebidos`,'ok');return{api:name,data:d};}
    ddUpdLog(line,`${name} — resposta vazia`,'err');return null;
  }catch(e){ddUpdLog(line,`${name} — ${e.name==='AbortError'?'timeout':'bloqueado por CORS'}`,'err');return null;}
}

// ── NORMALIZE ─────────────────────────────
function ddNorm(d,api){
  try{
    let o={razao:'',situacao:'',abertura:'',porte:'',natureza:'',capital:'',email:'',telefone:'',uf:'',municipio:'',endereco:'',cnae_pri:{cod:'',desc:''},cnaes_sec:[],socios:[]};
    if(api==='BrasilAPI'||d.cnae_fiscal!==undefined){
      o.razao=d.razao_social||'';o.situacao=d.descricao_situacao_cadastral||String(d.situacao_cadastral||'')||'';
      o.abertura=d.data_inicio_atividade||'';o.porte=d.descricao_porte||'';o.natureza=d.natureza_juridica||'';
      o.capital=d.capital_social!=null?'R$ '+Number(d.capital_social).toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
      o.email=d.email||'';o.telefone=d.ddd_telefone_1?`(${d.ddd_telefone_1}) ${d.telefone_1||''}`:'';
      o.uf=d.uf||'';o.municipio=d.municipio||'';
      o.endereco=[d.logradouro,d.numero,d.complemento,d.bairro,d.municipio,d.uf,d.cep].filter(Boolean).join(', ');
      o.cnae_pri={cod:String(d.cnae_fiscal||''),desc:d.cnae_fiscal_descricao||''};
      o.cnaes_sec=(d.cnaes_secundarios||[]).map(c=>({cod:String(c.codigo||''),desc:c.descricao||''}));
      o.socios=(d.qsa||[]).map(s=>({nome:s.nome_socio||s.nome||'',qual:s.qualificacao_socio||''}));
    }else if(api==='ReceitaWS'||d.nome){
      o.razao=d.nome||'';o.situacao=d.situacao||'';o.abertura=d.abertura||'';o.porte=d.porte||'';o.natureza=d.natureza_juridica||'';
      o.capital=d.capital_social||'';o.email=d.email||'';o.telefone=d.telefone||'';
      o.uf=d.uf||'';o.municipio=d.municipio||'';
      o.endereco=[d.logradouro,d.numero,d.complemento,d.bairro,d.municipio,d.uf,d.cep].filter(Boolean).join(', ');
      o.cnae_pri={cod:(d.atividade_principal||[])[0]?.code||'',desc:(d.atividade_principal||[])[0]?.text||''};
      o.cnaes_sec=(d.atividades_secundarias||[]).map(c=>({cod:c.code||'',desc:c.text||''}));
      o.socios=(d.qsa||[]).map(s=>({nome:s.nome||'',qual:s.qual||''}));
    }else if(d.estabelecimento){
      const e=d.estabelecimento||{};
      o.razao=d.razao_social||'';o.situacao=e.situacao_cadastral||'';o.abertura=e.data_inicio_atividade||'';
      o.porte=(d.porte||{}).descricao||'';o.natureza=(d.natureza_juridica||{}).descricao||'';
      o.capital=d.capital_social!=null?'R$ '+Number(d.capital_social).toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
      o.email=e.email||'';o.telefone=e.ddd1?`(${e.ddd1}) ${e.telefone1||''}`:'';
      o.uf=(e.estado||{}).sigla||'';o.municipio=(e.cidade||{}).nome||'';
      o.endereco=[e.tipo_logradouro,e.logradouro,e.numero,e.complemento,e.bairro,(e.cidade||{}).nome,(e.estado||{}).sigla,e.cep].filter(Boolean).join(', ');
      o.cnae_pri={cod:String((e.cnae_fiscal||{}).id||e.cnae_fiscal||''),desc:(e.cnae_fiscal||{}).descricao||''};
      o.cnaes_sec=(e.cnae_fiscal_secundarios||[]).map(c=>({cod:String((c.cnae||{}).id||c.id||''),desc:(c.cnae||{}).descricao||c.descricao||''}));
      o.socios=(d.socios||[]).map(s=>({nome:s.nome||'',qual:(s.qualificacao||{}).descricao||''}));
    }
    return o;
  }catch(e){return null;}
}

// ── AUTOFILL PJ ───────────────────────────
async function pjAutoFill(){
  const raw=ddV('pj-cnpj').replace(/\D/g,'');if(raw.length!==14)return;
  ddCnpjN=raw;
  const l=ddAddLog('pj','Pré-carregando dados do CNPJ...','spin');
  const apis=[{name:'BrasilAPI',url:`https://brasilapi.com.br/api/cnpj/v1/${raw}`},{name:'ReceitaWS',url:`https://www.receitaws.com.br/v1/cnpj/${raw}`},{name:'CNPJ.ws',url:`https://publica.cnpj.ws/cnpj/${raw}`}];
  let found=null;for(const a of apis){found=await ddTryApi(a.url,a.name,l);if(found)break;}
  if(!found){ddUpdLog(l,'APIs indisponíveis — preencha manualmente','warn');return;}
  const info=ddNorm(found.data,found.api);if(!info)return;
  ddUpdLog(l,'Campos preenchidos automaticamente','ok');
  ddSet('pj-razao',info.razao);if(info.endereco)ddSet('pj-end',info.endereco);
  if(info.socios?.length)ddSet('pj-socios',info.socios.map(s=>s.nome).filter(Boolean).join(', '));
  if(info.uf){const sel=document.getElementById('pj-estado');if(sel)for(let o of sel.options){if(o.value===info.uf){sel.value=info.uf;break;}}}
  setTimeout(()=>{const lw=document.getElementById('pj-logwrap');if(lw)lw.style.display='none';},2500);
}

// ── GRUPOS LINKS PJ ───────────────────────
function pjBuildGrupos(razao,fantasia,cnpjNum,cnpjFmt,endStr,socios,uf){
  const RL=razao||cnpjFmt;const FT=fantasia||RL;
  const endQ=encodeURIComponent(endStr||'');
  const sArr=(socios||[]).filter(s=>s.nome).map(s=>s.nome);
  const junta=JUNTAS[uf]||null;
  const bool=buildBooleanQuery(RL,cnpjFmt);

  return[
    {title:'📋 Verificação cadastral',items:[
      {...ddA(`https://www.receitaws.com.br/v1/cnpj/${cnpjNum}`,`GET /v1/cnpj/${cnpjNum}`),label:'ReceitaWS — JSON direto (sem CAPTCHA)',p:'r'},
      {...ddA(`https://brasilapi.com.br/api/cnpj/v1/${cnpjNum}`,`GET /api/cnpj/v1/${cnpjNum}`),label:'BrasilAPI — JSON cadastral',p:'r'},
      {...ddA(`https://casadosdados.com.br/solucao/cnpj/${cnpjNum}`,`CNPJ ${cnpjNum}`),label:'Casa dos Dados — sócios e endereços vinculados',p:'a'},
      {...ddA(`https://portaltransparencia.gov.br/sancoes/ceis?termo=${cnpjNum}`,`CNPJ ${cnpjNum}`),label:'CEIS — impedida de contratar com o governo',p:'r'},
      {...ddA(`https://portaltransparencia.gov.br/sancoes/cnep?termo=${cnpjNum}`,`CNPJ ${cnpjNum}`),label:'CNEP — punições e sanções',p:'r'},
      {...ddA('https://sit.trabalho.gov.br/radar/','Busca manual'),label:'Lista Suja — trabalho escravo (Radar SIT)',p:'r'},
      {...ddG(`"${cnpjFmt}"`),label:`Google — CNPJ exato "${cnpjFmt}"`,p:'r'},
      {...ddG(`"${RL}" "${cnpjFmt}"`),label:'Google — razão social exata + CNPJ',p:'r'},
    ]},
    {title:'🟣 Mídias negativas — busca booleana (criminal)',items:[
      {...ddG(bool.criminal),label:'Boolean — riscos criminais (corrupção, fraude, lavagem, trabalho escravo)',p:'r',isMidia:true},
      {...ddGT(bool.criminal),label:'Notícias — riscos criminais (últimos 12 meses)',p:'r',isMidia:true},
      {...ddG(`"${RL}" AND ("lista suja" OR OFAC OR blacklist OR sanção OR "improbidade administrativa")`),label:'Boolean — sanções e listas restritivas',p:'r',isMidia:true},
    ]},
    {title:'🟣 Mídias negativas — financeiro e regulatório',items:[
      {...ddG(bool.financeiro),label:'Boolean — riscos financeiros (fraude, Ponzi, insolvência, evasão)',p:'r',isMidia:true},
      {...ddGT(bool.financeiro),label:'Notícias — riscos financeiros recentes',p:'r',isMidia:true},
      {...ddG(bool.regulatorio),label:'Boolean — riscos regulatórios (MP, CVM, BACEN, cassação)',p:'r',isMidia:true},
      {...ddG(bool.reputacional),label:'Boolean — riscos reputacionais (escândalos, assédio, ambiental)',p:'a',isMidia:true},
    ]},
    {title:'🟣 Mídias negativas — atividade recente (12 meses)',items:[
      {...ddG(bool.recente),label:`Google — "${RL}" · publicações do último ano`,p:'r',isMidia:true},
      {...ddGT(`"${RL}"`),label:`Google Notícias — "${RL}" ·  qualquer data`,p:'r',isMidia:true},
      {...ddG(`"${RL}" OR "${cnpjFmt}" site:g1.globo.com OR site:uol.com.br OR site:folha.uol.com.br OR site:estadao.com.br OR site:valor.com.br`),label:'Grandes veículos — G1, UOL, Folha, Estadão, Valor Econômico',p:'r',isMidia:true},
    ]},
    {title:'🏛️ Junta Comercial'+(uf?` — ${uf}`:''),items:[
      ...(junta?[
        {...ddA(junta.u,`Buscar: "${RL}" ou CNPJ ${cnpjFmt}`),label:`${junta.n} — ${uf} · Consultar registro e atos societários`,p:'r'},
        {...ddG(`"${RL}" ${junta.n}`),label:`Google — "${RL}" + ${junta.n}`,p:'r'},
        {...ddG(`"${cnpjFmt}" "junta comercial"`),label:'Google — CNPJ exato + "junta comercial"',p:'r'},
        {...ddG(`"${RL}" "ato constitutivo" OR "contrato social" OR "alteração contratual"`),label:'Google — documentos societários exatos',p:'a'},
      ]:[{label:'Selecione o estado para ativar os links da Junta Comercial',url:'#',query:'',p:'a',disabled:true}]),
      {...ddA('https://www.gov.br/drei/pt-br','Portal federal'),label:'DREI — Departamento Nacional de Registro Empresarial',p:'a'},
    ]},
    {title:'🏢 Fachada física',items:[
      ...(endStr?[
        {...ddA(`https://www.google.com/maps?q=${endQ}&layer=c`,`Endereço: ${endStr}`),label:'Google Street View — verificar fachada',p:'r'},
        {...ddA(`https://www.google.com/maps/search/${endQ}`,endStr),label:'Google Maps — tipo de imóvel',p:'a'},
        {...ddG(`"${endStr}" "${RL}"`),label:'Google — endereço exato + razão social',p:'a'},
        {...ddG(`"${endStr}" "escritório virtual" OR coworking OR "sala virtual"`),label:'Google — endereço + coworking / sala virtual',p:'r'},
      ]:[{label:'Preencha o endereço para ativar Street View',url:'#',query:'',p:'a',disabled:true}]),
    ]},
    {title:'🌐 Redes sociais',items:[
      {...ddG(`"${RL}" site:instagram.com`),label:'Instagram — razão social exata',p:'a'},
      {...ddG(`"${FT}" site:instagram.com`),label:'Instagram — nome fantasia exato',p:'a'},
      {...ddG(`"${RL}" site:facebook.com`),label:'Facebook — empresa exata',p:'a'},
      {...ddG(`"${RL}" site:linkedin.com`),label:'LinkedIn — empresa exata',p:'a'},
      {...ddG(`"${FT}".com.br OR "${FT}".com`),label:'Site oficial — domínio exato',p:'g'},
      {...ddG(`"${RL}" aposta OR bet OR cassino OR rifa OR "jogo online"`),label:'🚨 ALERTA PLD — apostas / bets',p:'r',isMidia:true},
    ]},
    {title:'⭐ Reputação',items:[
      {...ddA(`https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent('"'+FT+'"')}`,`"${FT}"`),label:'Reclame Aqui — nome fantasia exato',p:'r'},
      {...ddA(`https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent('"'+RL+'"')}`,`"${RL}"`),label:'Reclame Aqui — razão social exata',p:'r'},
      {...ddA('https://www.consumidor.gov.br/pages/indicador/relatos/abrir','Portal federal'),label:'Consumidor.gov.br',p:'r'},
      {...ddG(`"${RL}" "não entregou" OR calote OR golpe OR fraude OR abandonou`),label:`Google — "${RL}" calote / fraude (busca exata)`,p:'r',isMidia:true},
    ]},
    {title:'⚖️ Processos e dívidas',items:[
      {...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${cnpjNum}`,cnpjNum),label:'JusBrasil — processos por CNPJ',p:'r'},
      {...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${encodeURIComponent('"'+RL+'"')}`,`"${RL}"`),label:'JusBrasil — razão social exata',p:'r'},
      ...sArr.slice(0,3).map(s=>({...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${encodeURIComponent(s)}`,s),label:`JusBrasil — sócio "${s}"`,p:'a'})),
      {...ddA('https://www.cnj.jus.br/consulta-processual-nacional/',`CNPJ: ${cnpjFmt}`),label:'CNJ — consulta processual nacional',p:'r'},
      {...ddA(`https://www.in.gov.br/consulta/-/buscar/dou?q=${encodeURIComponent('"'+RL+'"')}`,`"${RL}"`),label:'Diário Oficial — publicações exatas',p:'a'},
      {...ddG(`"${RL}" "execução fiscal" OR protesto OR "dívida ativa"`),label:`Google — "${RL}" execução fiscal`,p:'a',isMidia:true},
    ]},
    {title:'👤 Sócios',items:[
      ...sArr.slice(0,4).flatMap(s=>[
        {...ddG(buildBooleanQuery(s,'').criminal),label:`Boolean mídias negativas — sócio "${s}"`,p:'r',isMidia:true},
        {...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${encodeURIComponent(s)}`,s),label:`JusBrasil — processos de "${s}"`,p:'r'},
        {...ddG(`"${s}" "${RL}"`),label:`Google — "${s}" + empresa exata`,p:'a'},
        {...ddG(`"${s}" site:linkedin.com`),label:`LinkedIn — "${s}"`,p:'a'},
      ]),
      ...(sArr.length===0?[{label:'Preencha o campo sócios',url:'#',query:'',p:'a',disabled:true}]:[]),
    ]},
    {title:'🏛️ Órgãos reguladores',items:[
      {...ddA(`https://www.bcb.gov.br/estabilidadefinanceira/pesquisainstituicao?nome=${encodeURIComponent(RL)}`,`"${RL}"`),label:'🔴 BACEN — autorização para funcionar como instituição financeira',p:'r'},
      {...ddA(`https://sistemas.cvm.gov.br/asp/cvmwww/enetads/adm_cons.asp?txtcnpj=${cnpjNum}`,`CNPJ: ${cnpjNum}`),label:'🔴 CVM — registro para operar no mercado de capitais',p:'r'},
      {...ddA(`https://www.susep.gov.br/menu/informacoes-ao-publico/consultas-cadastros`,`CNPJ: ${cnpjFmt}`),label:'🔴 SUSEP — autorização para operar seguros/previdência',p:'r'},
      {...ddA(`https://portaltransparencia.gov.br/sancoes/ceis?termo=${cnpjNum}`,`CNPJ: ${cnpjNum}`),label:'🔴 CEIS — impedida de contratar com o poder público',p:'r'},
      {...ddA(`https://portaltransparencia.gov.br/sancoes/cnep?termo=${cnpjNum}`,`CNPJ: ${cnpjNum}`),label:'🔴 CNEP — punições e sanções aplicadas',p:'r'},
      {...ddA('https://sit.trabalho.gov.br/radar/',`CNPJ: ${cnpjFmt}`),label:'🔴 Lista Suja MTE — trabalho escravo/análogo',p:'r'},
      {...ddA('https://cna.oab.org.br/',`"${RL}"`),label:'OAB — escritório de advocacia',p:'g'},
      {...ddA('https://www3.cfc.org.br/spw/crcs/ConselhoRegionalAtivo.aspx',`CNPJ: ${cnpjFmt}`),label:'CFC/CRC — empresa contábil',p:'g'},
      {...ddA('https://www.cofeci.gov.br/',`"${RL}"`),label:'CRECI/COFECI — imobiliária',p:'g'},
      {...ddA('https://www.antt.gov.br/',`CNPJ: ${cnpjFmt}`),label:'ANTT — empresa de transporte',p:'g'},
      {...ddA('https://consultas.anvisa.gov.br/#/',`CNPJ: ${cnpjFmt}`),label:'ANVISA — farmácia/alimentos/saúde',p:'g'},
      {...ddA('https://cadastur.turismo.gov.br/',`CNPJ: ${cnpjFmt}`),label:'Cadastur — agência de turismo',p:'g'},
      {...ddA(`https://www.in.gov.br/consulta/-/buscar/dou?q=${encodeURIComponent('"'+cnpjFmt+'"')}`,`"${cnpjFmt}"`),label:'Diário Oficial — publicações com o CNPJ',p:'a'},
    ]},
  ];
}

// ── GRUPOS LINKS PF ───────────────────────
function pfBuildGrupos(nome,cpf,cpfFmt,end,empresa,pep){
  const bool=buildBooleanQuery(nome,cpfFmt);
  const endQ=encodeURIComponent(end||'');

  return[
    {title:'📋 Verificação cadastral — CPF',items:[
      {...ddA('https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp',`CPF: ${cpfFmt}`),label:'Receita Federal — situação do CPF',p:'r'},
      {...ddG(`"${cpfFmt}"`),label:`Google — CPF exato "${cpfFmt}"`,p:'r'},
      {...ddG(`"${nome}" "${cpfFmt}"`),label:'Google — nome exato + CPF',p:'r'},
      {...ddA(`https://portaltransparencia.gov.br/sancoes/ceis?termo=${cpf}`,`CPF: ${cpfFmt}`),label:'CEIS — impedida de contratar com o governo',p:'r'},
      {...ddA(`https://portaltransparencia.gov.br/sancoes/cnep?termo=${cpf}`,`CPF: ${cpfFmt}`),label:'CNEP — punições e sanções',p:'r'},
      {...ddA('https://sit.trabalho.gov.br/radar/','Busca manual'),label:'Lista Suja — trabalho escravo',p:'r'},
    ]},
    ...(pep!=='nao'?[{title:'🏛️ PEP — Pessoa Politicamente Exposta',items:[
      {...ddG(`"${nome}" "Pessoa Politicamente Exposta" OR PEP OR "cargo público" OR governador OR senador OR deputado OR prefeito OR ministro`),label:`Boolean PEP — "${nome}" cargos públicos`,p:'r',isMidia:true},
      {...ddA('https://portaltransparencia.gov.br/servidores','Busca manual'),label:'Portal Transparência — servidores públicos federais',p:'r'},
      {...ddA('https://www.tse.jus.br/eleicoes/estatisticas/repositorio-de-dados-eleitorais-1','Busca manual'),label:'TSE — candidatos e filiações partidárias',p:'r'},
      {...ddG(`"${nome}" site:portaltransparencia.gov.br`),label:`Portal Transparência — "${nome}" exato`,p:'r',isMidia:true},
    ]}]:[]),
    {title:'🟣 Mídias negativas — criminal e fraude',items:[
      {...ddG(bool.criminal),label:'Boolean — riscos criminais (corrupção, fraude, lavagem, investigação)',p:'r',isMidia:true},
      {...ddGT(bool.criminal),label:'Notícias — riscos criminais recentes',p:'r',isMidia:true},
      {...ddG(`"${nome}" AND ("lista suja" OR OFAC OR blacklist OR sanção OR "improbidade administrativa")`),label:'Boolean — sanções e listas restritivas',p:'r',isMidia:true},
      {...ddG(`"${cpfFmt}" fraude OR golpe OR estelionato OR crime`),label:`Google — CPF exato em registros negativos`,p:'r',isMidia:true},
    ]},
    {title:'🟣 Mídias negativas — financeiro e reputacional',items:[
      {...ddG(bool.financeiro),label:'Boolean — riscos financeiros (fraude, Ponzi, insolvência)',p:'r',isMidia:true},
      {...ddGT(bool.financeiro),label:'Notícias financeiras recentes',p:'r',isMidia:true},
      {...ddG(bool.regulatorio),label:'Boolean — riscos regulatórios (MP, CVM, improbidade)',p:'r',isMidia:true},
      {...ddG(bool.reputacional),label:'Boolean — riscos reputacionais (escândalos, denúncias)',p:'a',isMidia:true},
    ]},
    {title:'🟣 Mídias negativas — publicações recentes',items:[
      {...ddG(bool.recente),label:`Google — "${nome}" · publicações do último ano`,p:'r',isMidia:true},
      {...ddGT(`"${nome}"`),label:`Google Notícias — "${nome}" qualquer data`,p:'r',isMidia:true},
      {...ddG(`"${nome}" site:g1.globo.com OR site:uol.com.br OR site:folha.uol.com.br OR site:estadao.com.br OR site:valor.com.br`),label:'Grandes veículos de jornalismo — G1, Folha, Estadão, Valor',p:'r',isMidia:true},
    ]},
    {title:'⚖️ Processos judiciais',items:[
      {...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${encodeURIComponent('"'+nome+'"')}`,`"${nome}"`),label:'JusBrasil — processos pelo nome exato',p:'r'},
      ...(cpf?[{...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${cpf}`,cpf),label:'JusBrasil — processos pelo CPF',p:'r'}]:[]),
      {...ddA('https://www.cnj.jus.br/consulta-processual-nacional/',`Nome: "${nome}"`),label:'CNJ — consulta processual nacional',p:'r'},
      {...ddG(`"${nome}" "execução fiscal" OR protesto OR "dívida ativa" OR inadimplente`),label:`Google — "${nome}" execução fiscal`,p:'a',isMidia:true},
    ]},
    ...(end?[{title:'🏠 Verificação de endereço',items:[
      {...ddA(`https://www.google.com/maps?q=${endQ}&layer=c`,`Endereço: ${end}`),label:'Google Street View — verificar endereço',p:'a'},
      {...ddA(`https://www.google.com/maps/search/${endQ}`,end),label:'Google Maps — localização',p:'a'},
      {...ddG(`"${nome}" "${end}"`),label:'Google — nome + endereço exatos',p:'a'},
    ]}]:[]),
    {title:'🌐 Redes sociais',items:[
      {...ddG(`"${nome}" site:instagram.com`),label:'Instagram — nome exato',p:'a'},
      {...ddG(`"${nome}" site:facebook.com`),label:'Facebook — nome exato',p:'a'},
      {...ddG(`"${nome}" site:linkedin.com`),label:'LinkedIn — perfil exato',p:'a'},
      {...ddG(`"${nome}" aposta OR bet OR cassino OR rifa`),label:'🚨 ALERTA PLD — apostas/bets',p:'r',isMidia:true},
    ]},
    ...(empresa?[{title:'🏢 Empresa(s) vinculada(s)',items:[
      {...ddG(`"${nome}" "${empresa}"`),label:`Google — "${nome}" + empresa vinculada`,p:'a'},
      {...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${encodeURIComponent(empresa)}`,empresa),label:`JusBrasil — processos da empresa "${empresa}"`,p:'a'},
      {...ddG(buildBooleanQuery(empresa,'').criminal),label:`Boolean mídias negativas — empresa "${empresa}"`,p:'r',isMidia:true},
    ]}]:[]),
    {title:'🏛️ Órgãos reguladores — habilitação profissional',items:[
      {...ddA(`https://cna.oab.org.br/Advogado/BuscaAvancada?Nome=${encodeURIComponent(nome)}`,`"${nome}"`),label:'OAB — advogado (ativo / suspenso / cancelado)',p:'r'},
      {...ddA(`https://portal.cfm.org.br/busca-medicos/?nome=${encodeURIComponent(nome)}`,`"${nome}"`),label:'CFM — médico (ativo / suspenso / cassado)',p:'r'},
      {...ddA(`https://www.cfp.org.br/registro/?nome=${encodeURIComponent(nome)}`,`"${nome}"`),label:'CFP — psicólogo',p:'r'},
      {...ddA(`https://cfo.org.br/servicos/consulta-cirurgiao-dentista/?nome=${encodeURIComponent(nome)}`,`"${nome}"`),label:'CFO — cirurgião-dentista',p:'r'},
      {...ddA('https://www.crea.org.br/',`Pesquisar: "${nome}"`),label:'CREA — engenheiro / técnico (busca manual)',p:'r'},
      {...ddA('https://www.cau.org.br/',`Pesquisar: "${nome}"`),label:'CAU — arquiteto (busca manual)',p:'r'},
      {...ddA('https://cfc.org.br/tecnico/consultar-registro-de-contabilista/',`Pesquisar: "${nome}"`),label:'CFC/CRC — contador (busca manual)',p:'r'},
      {...ddA('https://www.cofeci.gov.br/',`Pesquisar: "${nome}"`),label:'CRECI/COFECI — corretor de imóveis',p:'r'},
      {...ddA('https://www.bcb.gov.br/',`Pesquisar: "${nome}"`),label:'BACEN — operador financeiro / câmbio',p:'r'},
      {...ddA('https://www.cvm.gov.br/',`Pesquisar: "${nome}"`),label:'CVM — agente autônomo de investimentos',p:'r'},
      {...ddA('https://portaltransparencia.gov.br/sancoes/ceis?termo='+encodeURIComponent(nome),nome),label:'🔴 CEIS — impedido de contratar com o governo',p:'r'},
      {...ddA('https://portaltransparencia.gov.br/sancoes/cnep?termo='+encodeURIComponent(nome),nome),label:'🔴 CNEP — punições e sanções',p:'r'},
      {...ddA('https://sit.trabalho.gov.br/radar/',`Pesquisar: "${nome}" ou CPF`),label:'🔴 Lista Suja MTE — trabalho escravo',p:'r'},
      {...ddG(`"${nome}" conselho OR CRM OR CRO OR OAB OR CREA OR suspenso OR cassado OR cancelado OR inabilitado`),label:'Google — situação em conselhos profissionais',p:'r',isMidia:true},
    ]},
  ];
}

// ── MÍDIAS NEGATIVAS SECTION HTML ─────────
function ddMidiasHTML(alvo, doc){
  const bool=buildBooleanQuery(alvo,doc);
  return`<div class="dd-neg-section">
    <div class="dd-neg-title">🟣 Protocolo de Mídias Negativas — KYC</div>
    <div class="dd-neg-sub">Consulte os links abaixo para varredura estruturada de mídias negativas. As queries booleanas filtram ruído de redes sociais e focam em jornalismo investigativo e registros judiciais.</div>
    <div class="dd-neg-grid">
      <div class="dd-neg-cat"><div class="dd-neg-cat-t">⚠️ Riscos criminais</div><div class="dd-neg-cat-lbl">Corrupção · Lavagem de dinheiro · Processo judicial · Investigação · Trabalho escravo</div></div>
      <div class="dd-neg-cat"><div class="dd-neg-cat-t">💰 Riscos financeiros</div><div class="dd-neg-cat-lbl">Fraude · Pirâmide · Insolvência · Offshore · Evasão de divisas · Falência</div></div>
      <div class="dd-neg-cat"><div class="dd-neg-cat-t">🏛️ Riscos regulatórios</div><div class="dd-neg-cat-lbl">Sanções · Improbidade · MP · CVM · BACEN · Blacklist · OFAC</div></div>
      <div class="dd-neg-cat"><div class="dd-neg-cat-t">📰 Riscos reputacionais</div><div class="dd-neg-cat-lbl">Escândalos · Assédio · Ambiental · IBAMA · Denúncia · Golpe</div></div>
    </div>
    <div style="font-size:.72rem;font-weight:700;color:#6b21a8;margin:12px 0 4px;text-transform:uppercase;letter-spacing:.5px">Query booleana principal (criminal) — copie e cole no Google:</div>
    <div class="dd-neg-bool">${bool.criminal.replace(/AND/g,'<span class="kw-and">AND</span>').replace(/OR/g,'<span class="kw-or">OR</span>').replace(/-site:\S+/g,'<span class="kw-not">$&</span>').replace(/"[^"]+"/g,'<span class="kw-term">$&</span>').replace(/^<span class="kw-term">"[^"]+"<\/span>/,'<span class="kw-name">$&</span>')}</div>
    <div style="font-size:.7rem;color:#7e22ce;margin-top:6px;font-family:'DM Mono',monospace">Dica: No Google, clique em <strong>Ferramentas → Período → Último ano</strong> para filtrar publicações recentes.</div>
  </div>`;
}

// ── RENDER GRUPOS ─────────────────────────
function ddRenderGrupos(grupos, prefix){
  return grupos.map(g=>{
    const linksHtml=g.items.map(l=>ddLiHTML(l,prefix,l.isMidia||false)).join('');
    const allUrls=g.items.filter(i=>!i.disabled&&i.url&&i.url!=='#').map(i=>i.url);
    return`<div class="dd-seclbl">${g.title}</div><div>${linksHtml}<button class="dd-oa" onclick="ddOpenAll(${JSON.stringify(allUrls)})">Abrir todas deste grupo (${allUrls.length}) ↗</button></div>`;
  }).join('');
}

// ── RENDER PJ ─────────────────────────────
function pjRender(info,cnpjNum,apiName){
  const cnpjFmt=ddFmt(cnpjNum);
  const endStr=ddV('pj-end');const pagto=ddV('pj-pagto');
  const fantasia=ddV('pj-fantasia');
  const sociosInput=ddV('pj-socios').split(',').map(s=>s.trim()).filter(Boolean).map(n=>({nome:n,qual:''}));
  const socios=info.socios?.length?info.socios:sociosInput;
  const razao=info.razao||fantasia||cnpjFmt;
  const uf=info.uf||ddV('pj-estado');

  // ═══ ANÁLISE DE RISCO PROFISSIONAL ═══
  const alertas=[], atencao=[], positivos=[];
  let scoreRisco = 0; // 0=baixo, acumula pontos

  // ── 1. SITUAÇÃO CADASTRAL (peso alto)
  const sit=(info.situacao||'').toUpperCase();
  if(sit.includes('INAPT')||sit.includes('SUSPENS'))
    { alertas.push('🔴 CNPJ INAPTO/SUSPENSO — empresa irregular perante a Receita Federal. Contratos podem ser nulos.'); scoreRisco+=40; }
  else if(sit.includes('BAIXAD')||sit.includes('CANCEL'))
    { alertas.push('🔴 CNPJ BAIXADO/CANCELADO — empresa encerrada. Qualquer contrato será inválido.'); scoreRisco+=50; }
  else if(sit==='ATIVA'||sit.includes('ATIV'))
    { positivos.push('✅ CNPJ Ativo e regular perante a Receita Federal'); }

  // ── 2. TEMPO DE EXISTÊNCIA (peso médio)
  if(info.abertura){
    const s=info.abertura; let dt;
    if(/^\d{4}-\d{2}-\d{2}/.test(s)) dt=new Date(s);
    else { const p=s.split(/[\/\-]/); dt=new Date(`${p[2]}-${p[1]}-${p[0]}`); }
    if(!isNaN(dt)){
      const meses=Math.round((Date.now()-dt.getTime())/(1000*60*60*24*30));
      const anos=(meses/12).toFixed(1);
      if(meses<6) { alertas.push(`🔴 Empresa com apenas ${meses} meses — sem histórico operacional. Risco de empresa fantasma ou laranja.`); scoreRisco+=30; }
      else if(meses<18) { atencao.push(`⚠️ Empresa jovem (${meses} meses) — histórico financeiro limitado. Exigir referências de clientes anteriores.`); scoreRisco+=15; }
      else if(meses<36) { atencao.push(`⚠️ ${Math.round(meses)} meses de operação — verifique se há contratos anteriores similares.`); scoreRisco+=5; }
      else { positivos.push(`✅ Empresa com ${anos} anos de existência — histórico operacional estabelecido`); }
    }
  }

  // ── 3. CAPITAL SOCIAL vs VALOR DO CONTRATO (peso alto)
  const capN=parseFloat((info.capital||'0').replace(/[^0-9,]/g,'').replace(',','.'));
  const valN=parseFloat((ddV('pj-valor')||'0').replace(/[^0-9,]/g,'').replace(',','.'));
  if(capN>0){
    if(capN<10000) { atencao.push(`⚠️ Capital social baixíssimo (${info.capital}) — empresa pode não ter capacidade financeira para arcar com inadimplemento.`); scoreRisco+=20; }
    else if(capN<50000) { atencao.push(`⚠️ Capital social reduzido (${info.capital}) — avaliar capacidade de execução do contrato.`); scoreRisco+=10; }
    else { positivos.push(`✅ Capital social de ${info.capital}`); }
    if(valN>0 && valN>capN*5) { alertas.push(`🔴 Valor do contrato (R$ ${valN.toLocaleString('pt-BR')}) é ${Math.round(valN/capN)}x maior que o capital social — risco de inadimplência elevado.`); scoreRisco+=25; }
    else if(valN>0 && valN>capN*2) { atencao.push(`⚠️ Valor do contrato representa ${Math.round(valN/capN)}x o capital social — exigir garantias adicionais.`); scoreRisco+=10; }
  }

  // ── 4. PORTE DA EMPRESA
  const porte=(info.porte||'').toUpperCase();
  if(porte.includes('MEI')) { atencao.push('⚠️ Empresa MEI — faturamento limitado a ~R$ 81mil/ano. Avaliar capacidade de entrega para contratos maiores.'); scoreRisco+=10; }
  else if(porte.includes('MICRO')||porte.includes('EPP')) { atencao.push('⚠️ Micro ou pequena empresa — verificar estrutura operacional e capacidade de execução.'); scoreRisco+=5; }
  else if(porte.includes('GRANDE')||porte.includes('MÉDIO')) { positivos.push(`✅ Porte ${info.porte} — estrutura operacional mais consolidada`); }

  // ── 5. CNAE PRINCIPAL — atividades de risco
  const cnaeDesc=(info.cnae_pri?.desc||'').toLowerCase();
  const cnaeCode=(info.cnae_pri?.cod||'');
  const cnaesRisco=['642','643','649','661','662','663','64','65','66']; // setor financeiro não regulado
  const cnaesBet=['9200','9201','9209']; // jogos e apostas
  const cnaesPld=['5229','4921','7490','8299']; // alto risco PLD
  if(cnaesBet.some(c=>cnaeCode.startsWith(c))) { alertas.push('🔴 CNAE indica atividade de apostas/jogos — segmento de altíssimo risco PLD/FT.'); scoreRisco+=30; }
  else if(cnaesRisco.some(c=>cnaeCode.startsWith(c))) { atencao.push('⚠️ CNAE do setor financeiro — verificar regulação no BACEN/CVM.'); scoreRisco+=15; }
  else if(cnaesPld.some(c=>cnaeCode.startsWith(c))) { atencao.push('⚠️ Atividade com histórico de uso em esquemas de lavagem — diligência ampliada recomendada.'); scoreRisco+=10; }

  // ── 6. CONDIÇÃO DE PAGAMENTO (peso crítico)
  if(pagto==='100% antecipado') { alertas.push('🔴 PAGAMENTO 100% ANTECIPADO — máximo risco financeiro. Nunca aceitar sem garantias reais comprovadas.'); scoreRisco+=35; }
  else if(pagto==='Parcial antecipado') { atencao.push('⚠️ Pagamento parcialmente antecipado — liberar somente após análise jurídica e com contrato assinado.'); scoreRisco+=15; }
  else if(pagto==='30/60/90 dias'||pagto==='Contra entrega') { positivos.push('✅ Condição de pagamento favorável ao contratante'); }

  // ── 7. SÓCIOS — quantidade e perfil
  const numSocios=(info.socios||[]).length;
  if(numSocios===0) { atencao.push('⚠️ Nenhum sócio identificado nos dados da Receita Federal — verificar QSA atualizado na Junta Comercial.'); scoreRisco+=10; }
  else if(numSocios===1) { atencao.push('⚠️ Empresa com sócio único — risco de concentração e confusão patrimonial entre PF e PJ.'); scoreRisco+=5; }
  else { positivos.push(`✅ ${numSocios} sócio(s) identificado(s) — pesquisar individualmente`); }

  // ── 8. ENDEREÇO — sinais de risco
  const endLower=(endStr||'').toLowerCase();
  if(endLower.includes('caixa postal')||endLower.includes('cx postal')) { atencao.push('⚠️ Endereço com Caixa Postal — não permite verificar fachada física real.'); scoreRisco+=10; }
  if(!endStr||endStr.trim().length<10) { atencao.push('⚠️ Endereço não informado — impossível verificar existência física.'); scoreRisco+=15; }

  // ── SCORE FINAL E CLASSIFICAÇÃO
  const nivel = scoreRisco>=40?'alto': scoreRisco>=15?'medio':'baixo';
  const scoreLabel = scoreRisco>=40?`${scoreRisco} pts — ALTO RISCO`:scoreRisco>=15?`${scoreRisco} pts — RISCO MÉDIO`:`${scoreRisco} pts — RISCO BAIXO`;
  const nivelLabel = nivel==='alto'
    ?'⛔ ALTO RISCO — Não contratar sem investigação aprofundada'
    :nivel==='medio'
    ?'⚠️ RISCO MÉDIO — Prosseguir com cautela e garantias'
    :'✅ RISCO BAIXO — Perfil inicial favorável, conclua a pesquisa';

  const recItems = nivel==='alto'
    ?[
      'Suspender negociação até conclusão de due diligence completa com assessoria jurídica',
      'Não realizar nenhum pagamento antecipado sob nenhuma hipótese',
      'Solicitar certidões negativas: Receita Federal, PGFN, INSS, FGTS e Justiça do Trabalho',
      'Consultar o CEIS e CNEP no Portal da Transparência antes de qualquer assinatura',
      'Verificar histórico dos sócios individualmente em processos judiciais e mídias negativas',
    ]
    :nivel==='medio'
    ?[
      'Sanar todos os pontos de atenção antes de assinar o contrato',
      'Exigir contrato formal com cláusulas de multa, entrega e responsabilidade dos sócios',
      'Solicitar 3 referências de clientes anteriores e verificar cada uma',
      'Pagamento vinculado a marcos de entrega — nunca 100% antecipado',
      'Arquivar toda a documentação desta análise no processo de contratação',
    ]
    :[
      'Formalizar contrato escrito com cláusulas de multa, prazo e responsabilidade',
      'Solicitar certidões negativas antes da assinatura (CND Federal, Trabalhista, Estadual)',
      'Manter pagamentos vinculados a entregas documentadas e aceitas formalmente',
      'Pesquisar os grupos de links abaixo para confirmar ausência de mídias negativas',
      'Arquivar esta análise junto ao processo contratual por no mínimo 5 anos',
    ];

  const sc=ddSC(info.situacao);
  ddVerQueues.pj=[];ddStCount=0;
  const grupos=pjBuildGrupos(razao,fantasia,cnpjNum,cnpjFmt,endStr,socios,uf);
  const sociosHtml=socios.length?socios.map(s=>{const ini=(s.nome||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();return`<div class="dd-soc"><div class="dd-sav">${ini}</div><div><div style="font-size:.86rem;font-weight:600">${s.nome}</div><div style="font-size:.73rem;color:var(--text-muted)">${s.qual||'—'}</div></div></div>`;}).join(''):'<div style="font-size:.82rem;color:var(--text-muted)">Nenhum sócio listado</div>';
  const cnaesHtml=(info.cnaes_sec||[]).slice(0,5).map(c=>`<div class="dd-cnae"><span class="dd-cc">${c.cod}</span><span class="dd-cd">${c.desc}</span></div>`).join('')||'<div class="dd-cnae"><span class="dd-cd" style="color:var(--text-muted)">Nenhum secundário</span></div>';
  const now=new Date();const dtStr=now.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})+' às '+now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});

  const html=`
  <div class="dd-rb"><div class="dd-rt ${nivel}"><div><div class="dd-rl ${nivel}">${nivelLabel}</div><div class="dd-rs" style="color:${nivel==='alto'?'#991b1b':nivel==='medio'?'#92400e':'#065f46'}">Score baseado nos dados cadastrais · Conclua a pesquisa nos links abaixo</div></div><div class="dd-rbg">${alertas.length}× crítico · ${atencao.length}× atenção · via ${apiName}</div></div>
  ${alertas.length?`<div class="dd-as alto"><div class="dd-at">🚫 Alertas críticos</div><ul class="dd-al alr">${alertas.map(a=>`<li>${a}</li>`).join('')}</ul></div>`:''}
  ${atencao.length?`<div class="dd-as medio"><div class="dd-at">⚠️ Pontos de atenção</div><ul class="dd-al ala">${atencao.map(a=>`<li>${a}</li>`).join('')}</ul></div>`:''}
  </div>
  <div class="stat-grid" style="margin-bottom:14px">
    <div class="stat-card ${nivel==='alto'?'highlight':''}"><div class="stat-icon ${nivel==='alto'?'red':nivel==='medio'?'amber':'teal'}" style="font-size:1.5rem">${nivel==='alto'?'⛔':nivel==='medio'?'⚠️':'✅'}</div><div><div class="stat-num" style="color:${nivel==='alto'?'var(--danger)':nivel==='medio'?'var(--warn)':'var(--accent)'}">${nivel.toUpperCase()}</div><div class="stat-label">Risco contratual</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:#fef2f2;font-size:1.2rem">🚨</div><div><div class="stat-num" style="color:${alertas.length?'var(--danger)':'var(--text)'}">${alertas.length}</div><div class="stat-label">Alertas críticos</div></div></div>
    <div class="stat-card"><div class="stat-icon amber" style="font-size:1.2rem">⚠️</div><div><div class="stat-num" style="color:${atencao.length?'var(--warn)':'var(--text)'}">${atencao.length}</div><div class="stat-label">Pontos de atenção</div></div></div>
    <div class="stat-card"><div class="stat-icon teal" style="font-size:1.2rem">✅</div><div><div class="stat-num" style="color:var(--accent)">${positivos.length}</div><div class="stat-label">Pontos positivos</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:#f0f9ff;font-size:1.2rem">📊</div><div><div class="stat-num" style="color:${nivel==='alto'?'var(--danger)':nivel==='medio'?'var(--warn)':'var(--accent)'}; font-size:1.1rem">${scoreRisco}</div><div class="stat-label">Score de risco</div></div></div>
  </div>
  ${positivos.length?`<div style="background:#f0fdf9;border:1px solid #6ee7b7;border-radius:10px;padding:12px 16px;margin-bottom:12px"><div style="font-weight:700;font-size:.82rem;color:#065f46;margin-bottom:6px">✅ Pontos favoráveis identificados</div><ul style="margin:0;padding-left:18px;font-size:.82rem;color:#065f46;line-height:1.8">${positivos.map(p=>`<li>${p}</li>`).join('')}</ul></div>`:''}
  <div class="dd-recbox"><div class="dd-rechd ${nivel}"><span style="font-size:1.1rem">${nivel==='alto'?'🚫':nivel==='medio'?'⚠️':'✅'}</span><div class="dd-rcht">Plano de ação — o que fazer antes de assinar</div></div><div class="dd-recbd"><ul class="dd-recli">${recItems.map((r,i)=>`<li><strong>${i+1}.</strong> ${r}</li>`).join('')}</ul></div></div>
  ${ddMidiasHTML(razao,cnpjFmt)}
  <div class="section" style="margin-bottom:13px">
    <div class="section-header"><h2>🏛️ Dados cadastrais <span class="badge ${sc==='ok'?'badge-baixo':sc==='err'?'badge-alto':'badge-medio'}" style="margin-left:6px">${info.situacao||'—'}</span></h2><span style="font-size:.72rem;color:var(--text-muted);font-family:'DM Mono',monospace">via ${apiName} · ${dtStr}</span></div>
    <div class="section-body">
      <div class="dd-dg">
        <div class="dd-dr"><div class="dd-dl">Razão social</div><div class="dd-dv">${razao||'—'}</div></div>
        <div class="dd-dr"><div class="dd-dl">Situação</div><div class="dd-dv ${sc}">${info.situacao||'—'}</div></div>
        <div class="dd-dr"><div class="dd-dl">CNPJ</div><div class="dd-dv" style="font-family:'DM Mono',monospace">${cnpjFmt}</div></div>
        <div class="dd-dr"><div class="dd-dl">Data de abertura</div><div class="dd-dv">${info.abertura||'—'}</div></div>
        <div class="dd-dr"><div class="dd-dl">Porte</div><div class="dd-dv">${info.porte||'—'}</div></div>
        <div class="dd-dr"><div class="dd-dl">Capital social</div><div class="dd-dv">${info.capital||'—'}</div></div>
        <div class="dd-dr"><div class="dd-dl">E-mail (RF)</div><div class="dd-dv">${info.email||'—'}</div></div>
        <div class="dd-dr"><div class="dd-dl">Telefone (RF)</div><div class="dd-dv">${info.telefone||'—'}</div></div>
        <div class="dd-dr full"><div class="dd-dl">Endereço cadastrado na RF</div><div class="dd-dv">${info.endereco||'—'}</div></div>
      </div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-bottom:13px">
    <div class="section"><div class="section-header"><h2>📊 CNAE</h2></div><div class="section-body"><div class="dd-cnae dd-cprim"><span class="dd-cc">${info.cnae_pri?.cod||'—'}</span><span class="dd-cd"><strong>Principal:</strong> ${info.cnae_pri?.desc||'—'}</span></div>${cnaesHtml}</div></div>
    <div class="section"><div class="section-header"><h2>👤 QSA — Sócios</h2></div><div class="section-body">${sociosHtml}</div></div>
  </div>
  <div class="section" style="margin-bottom:13px">
    <div class="section-header"><h2>🔗 Links — busca exata + mídias negativas</h2><div style="display:flex;gap:5px;flex-wrap:wrap"><span class="badge badge-alto">CRÍTICO</span><span class="badge badge-medio">ATENÇÃO</span><span class="badge badge-baixo">BASE</span><span style="font-size:.66rem;background:#fde8ff;color:#7e22ce;padding:2px 7px;border-radius:4px;font-weight:700">🟣 MÍDIA NEG.</span></div></div>
    <div class="section-body">
      <div style="background:#f0fdf9;border:1px solid #6ee7b7;border-radius:7px;padding:8px 12px;margin-bottom:13px;font-size:.77rem;color:#065f46;display:flex;gap:7px;align-items:center"><span>ℹ️</span><span>Indicadores atualizados em segundo plano: <strong>✅ Encontrado · ➖ Sem resultado · 🟣 Mídia negativa detectada</strong></span></div>
      ${ddRenderGrupos(grupos,'pj')}
    </div>
  </div>
  <div class="dd-disc">⚠️ Busca exata com aspas duplas · Queries booleanas para mídias negativas eliminam ruído de redes sociais · Indicadores via DuckDuckGo (pode ter imprecisões) · Não substitui due diligence jurídica · ${dtStr}</div>
  <div style="display:flex;gap:10px;margin-top:14px">
    <button class="btn btn-accent" onclick="ddAnalisarComIA('${razao}','${cnpjFmt}','${nivel}',${scoreRisco},${alertas.length},${atencao.length},'${info.situacao||''}','${info.porte||''}','${info.capital||''}','${info.abertura||''}')" style="flex:1;justify-content:center">🤖 Análise Profunda com IA — Gemini</button>
    <button class="btn btn-outline" onclick="window.print()" style="justify-content:center">🖨️ PDF</button>
  </div>
  <div id="dd-ai-result" style="display:none;margin-top:16px"></div>`;

  const res=document.getElementById('pj-result');
  res.innerHTML=html;res.style.display='block';
  res.scrollIntoView({behavior:'smooth',block:'start'});
  const vb=document.getElementById('pj-vbar');if(vb)vb.classList.add('show');
  setTimeout(()=>ddRunVerify(ddVerQueues.pj.map(q=>({el:document.getElementById(q.id),url:q.url,query:q.query,isNegative:q.isNegative})),'pj'),400);
}

// ── ANÁLISE IA — Due Diligence ──────────────
async function ddAnalisarComIA(razao,cnpj,nivel,score,alertas,atencao,situacao,porte,capital,abertura){
  const GEMINI_KEY='AIzaSyB6ZjO_Lj9AhpphMZtwUKYeQdzRWLu6Qm8';
  const GEMINI_URL='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key='+GEMINI_KEY;
  const panel=document.getElementById('dd-ai-result');
  if(!panel) return;
  panel.style.display='block';
  panel.innerHTML=`<div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:12px 16px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px"><span style="color:#fff;font-weight:700">🤖 Análise Profunda com Gemini IA</span><div style="margin-left:auto;width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite"></div></div><div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:16px;font-size:.85rem;line-height:1.8;color:#374151">⏳ Analisando a empresa com inteligência artificial...</div>`;

  const prompt=`Você é um especialista em due diligence corporativa e análise de risco contratual brasileiro. Analise a empresa abaixo e forneça um parecer profissional completo como se estivesse preparando um relatório executivo para um diretor decidir se fecha ou não um contrato.

EMPRESA ANALISADA:
- Razão Social: ${razao}
- CNPJ: ${cnpj}
- Situação Receita Federal: ${situacao}
- Porte: ${porte}
- Capital Social: ${capital}
- Data de Abertura: ${abertura}
- Score de Risco Calculado: ${score} pontos
- Nível de Risco: ${nivel.toUpperCase()}
- Alertas Críticos: ${alertas}
- Pontos de Atenção: ${atencao}

Forneça uma análise estruturada com:

## 1. PARECER EXECUTIVO (3-4 linhas diretas e objetivas)

## 2. PRINCIPAIS RISCOS IDENTIFICADOS
Liste os riscos mais relevantes com base nos dados cadastrais.

## 3. PONTOS QUE PRECISAM SER INVESTIGADOS
O que verificar obrigatoriamente antes de assinar.

## 4. CLÁUSULAS CONTRATUAIS RECOMENDADAS
Quais proteções incluir no contrato caso decida avançar.

## 5. VEREDICTO FINAL
Uma linha clara: APROVAR / APROVAR COM RESSALVAS / REPROVAR — com justificativa objetiva.

Seja direto, profissional e objetivo. Use linguagem executiva. Responda em português.`;

  try{
    const r=await fetch(GEMINI_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.2,maxOutputTokens:1500}})});
    const d=await r.json();
    const txt=d.candidates?.[0]?.content?.parts?.[0]?.text||'Sem resposta';
    // Format markdown to HTML
    const html=txt
      .replace(/## (.+)/g,'<h3 style="color:#4f46e5;font-size:.9rem;font-weight:800;margin:14px 0 6px;border-bottom:2px solid #e0e7ff;padding-bottom:4px">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\n- /g,'<br>• ')
      .replace(/\n/g,'<br>');
    panel.innerHTML=`<div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:12px 16px;border-radius:10px 10px 0 0;display:flex;align-items:center;justify-content:space-between"><span style="color:#fff;font-weight:700">🤖 Análise Profunda com Gemini IA</span><button onclick="document.getElementById('dd-ai-result').style.display='none'" style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:50%;width:24px;height:24px;cursor:pointer">✕</button></div><div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:16px;font-size:.85rem;line-height:1.8;color:#374151">${html}</div>`;
  }catch(e){
    panel.innerHTML=`<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:14px;color:#991b1b">❌ Erro ao consultar IA: ${e.message}</div>`;
  }
}

// ── RENDER PF ─────────────────────────────
function pfRender(nome,cpf,cpfFmt,end,empresa,pep){
  const alertas=[],atencao=[];
  if(pep==='sim') alertas.push('Pessoa Politicamente Exposta (PEP) — diligência ampliada obrigatória conforme normativa BACEN');
  else if(pep==='relacionado') atencao.push('Relacionado a PEP — verificar grau de relacionamento e exigir documentação adicional');

  const nivel=alertas.length?'alto':atencao.length?'medio':'baixo';
  const nivelLabel=nivel==='alto'?'⛔ ALTO RISCO — PEP identificado':nivel==='medio'?'⚠️ RISCO MÉDIO — Verificar pontos sinalizados':'✅ RISCO INICIAL BAIXO — Complete a pesquisa';

  ddVerQueues.pf=[];ddStCount=0;
  const grupos=pfBuildGrupos(nome,cpf,cpfFmt,end,empresa,pep);
  const now=new Date();const dtStr=now.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})+' às '+now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});

  const pepBadge=pep!=='nao'?`<div class="dd-pep">⚠️ ${pep==='sim'?'PEP — Diligência ampliada obrigatória':'Relacionado a PEP — verificar vínculo'}</div>`:'';

  const html=`
  <div class="dd-rb"><div class="dd-rt ${nivel}"><div><div class="dd-rl ${nivel}">${nivelLabel}</div><div class="dd-rs" style="color:${nivel==='alto'?'#991b1b':nivel==='medio'?'#92400e':'#065f46'}">Varredura de mídias negativas com operadores booleanos profissionais</div></div><div class="dd-rbg">${alertas.length}× crítico · ${atencao.length}× atenção</div></div>
  ${alertas.length?`<div class="dd-as alto"><div class="dd-at">🚫 Alertas críticos</div><ul class="dd-al alr">${alertas.map(a=>`<li>${a}</li>`).join('')}</ul></div>`:''}
  ${atencao.length?`<div class="dd-as medio"><div class="dd-at">⚠️ Pontos de atenção</div><ul class="dd-al ala">${atencao.map(a=>`<li>${a}</li>`).join('')}</ul></div>`:''}
  </div>
  <div class="stat-grid" style="margin-bottom:14px">
    <div class="stat-card"><div class="stat-icon teal">👤</div><div><div class="stat-num" style="font-size:1rem">${nome}</div><div class="stat-label">Titular da análise</div></div></div>
    <div class="stat-card"><div class="stat-icon blue">🪪</div><div><div class="stat-num" style="font-size:1rem;font-family:'DM Mono',monospace">${cpfFmt||'—'}</div><div class="stat-label">CPF</div></div></div>
    <div class="stat-card"><div class="stat-icon ${pep!=='nao'?'amber':'teal'}">${pep!=='nao'?'⚠️':'✅'}</div><div><div class="stat-num" style="font-size:.95rem;color:${pep!=='nao'?'var(--warn)':'var(--accent)'}">${pep==='sim'?'PEP':pep==='relacionado'?'REL. PEP':'Não PEP'}</div><div class="stat-label">Exposição política</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:#fde8ff">🟣</div><div><div class="stat-num" style="font-size:1rem;color:#7e22ce">Ativa</div><div class="stat-label">Varredura mídias negativas</div></div></div>
  </div>
  ${pepBadge}
  ${ddMidiasHTML(nome,cpfFmt)}
  <div class="section" style="margin-bottom:13px">
    <div class="section-header"><h2>🔗 Links — busca exata + mídias negativas</h2><div style="display:flex;gap:5px;flex-wrap:wrap"><span class="badge badge-alto">CRÍTICO</span><span class="badge badge-medio">ATENÇÃO</span><span class="badge badge-baixo">BASE</span><span style="font-size:.66rem;background:#fde8ff;color:#7e22ce;padding:2px 7px;border-radius:4px;font-weight:700">🟣 MÍDIA NEG.</span></div></div>
    <div class="section-body">
      <div style="background:#f0fdf9;border:1px solid #6ee7b7;border-radius:7px;padding:8px 12px;margin-bottom:13px;font-size:.77rem;color:#065f46;display:flex;gap:7px;align-items:center"><span>ℹ️</span><span>Indicadores atualizados em segundo plano: <strong>✅ Encontrado · ➖ Sem resultado · 🟣 Mídia negativa detectada</strong></span></div>
      ${ddRenderGrupos(grupos,'pf')}
    </div>
  </div>
  <div class="dd-disc">⚠️ Busca booleana com aspas duplas e operadores AND/OR/NOT · Ruído de redes sociais filtrado com -site: · Indicadores via DuckDuckGo · Não substitui due diligence jurídica · ${dtStr}</div>
  <button class="btn btn-outline" onclick="window.print()" style="margin-top:10px;width:100%;justify-content:center">🖨️ Imprimir / Salvar como PDF</button>`;

  const res=document.getElementById('pf-result');
  res.innerHTML=html;res.style.display='block';
  res.scrollIntoView({behavior:'smooth',block:'start'});
  const vb=document.getElementById('pf-vbar');if(vb)vb.classList.add('show');
  setTimeout(()=>ddRunVerify(ddVerQueues.pf.map(q=>({el:document.getElementById(q.id),url:q.url,query:q.query,isNegative:q.isNegative})),'pf'),400);
}

// ── AÇÕES PJ ──────────────────────────────
async function pjConsultar(){
  const raw=ddV('pj-cnpj').replace(/\D/g,'');
  if(raw.length!==14){alert('Informe um CNPJ válido com 14 dígitos.');return;}
  ddCnpjN=raw;
  const btn=document.getElementById('pj-btnapi');
  btn.disabled=true;document.getElementById('pj-bico').textContent='⏳';document.getElementById('pj-btxt').textContent='Consultando APIs...';
  document.getElementById('pj-log').innerHTML='';document.getElementById('pj-logwrap').style.display='block';
  document.getElementById('pj-result').style.display='none';document.getElementById('pj-result').innerHTML='';
  document.getElementById('pj-manbox').style.display='none';
  const vb=document.getElementById('pj-vbar');if(vb)vb.classList.remove('show');
  ddAddLog('pj','Consultando 3 APIs públicas...','ok');
  const apis=[{name:'BrasilAPI',url:`https://brasilapi.com.br/api/cnpj/v1/${raw}`},{name:'ReceitaWS',url:`https://www.receitaws.com.br/v1/cnpj/${raw}`},{name:'CNPJ.ws',url:`https://publica.cnpj.ws/cnpj/${raw}`}];
  let found=null;
  for(const a of apis){const l=ddAddLog('pj',`Tentando ${a.name}...`,'spin');found=await ddTryApi(a.url,a.name,l);if(found)break;await new Promise(r=>setTimeout(r,350));}
  btn.disabled=false;document.getElementById('pj-bico').textContent='🔍';document.getElementById('pj-btxt').textContent='Consultar APIs + gerar links';
  if(!found){ddAddLog('pj','Todas as APIs bloqueadas — ativando modo manual','err');pjBuildManLinks(raw);document.getElementById('pj-manbox').style.display='block';pjSomenteLinks();return;}
  const info=ddNorm(found.data,found.api);if(!info){ddAddLog('pj','Erro ao processar resposta','err');return;}
  ddSet('pj-razao',info.razao);if(info.endereco&&!ddV('pj-end'))ddSet('pj-end',info.endereco);
  if(info.socios?.length&&!ddV('pj-socios'))ddSet('pj-socios',info.socios.map(s=>s.nome).filter(Boolean).join(', '));
  if(info.uf){const sel=document.getElementById('pj-estado');if(sel&&!sel.value)for(let o of sel.options){if(o.value===info.uf){sel.value=info.uf;break;}}}
  pjRender(info,raw,found.api);
}

function pjSomenteLinks(){
  const raw=ddV('pj-cnpj').replace(/\D/g,'');if(!raw){alert('Informe o CNPJ primeiro.');return;}
  ddCnpjN=raw;const cnpjFmt=ddFmt(raw);
  const razao=ddV('pj-razao')||ddV('pj-fantasia')||cnpjFmt;
  const fantasia=ddV('pj-fantasia');const endStr=ddV('pj-end');
  const socios=ddV('pj-socios').split(',').map(s=>s.trim()).filter(Boolean).map(n=>({nome:n,qual:''}));
  const uf=ddV('pj-estado');
  ddVerQueues.pj=[];ddStCount=0;
  const grupos=pjBuildGrupos(razao,fantasia,raw,cnpjFmt,endStr,socios,uf);
  const vb=document.getElementById('pj-vbar');if(vb)vb.classList.remove('show');
  const res=document.getElementById('pj-result');
  res.innerHTML=`
    <div class="dd-rb"><div class="dd-rt baixo"><div><div class="dd-rl baixo">📋 Links gerados — complete a pesquisa</div><div class="dd-rs" style="color:#065f46">Busca exata + mídias negativas + operadores booleanos</div></div></div></div>
    ${ddMidiasHTML(razao,cnpjFmt)}
    <div class="section"><div class="section-header"><h2>🔗 Links de pesquisa</h2></div><div class="section-body">${ddRenderGrupos(grupos,'pj')}</div></div>
    <div class="dd-disc">Todos os links usam aspas duplas para busca exata. Se não encontrar resultado, remova as aspas manualmente no Google.</div>`;
  res.style.display='block';res.scrollIntoView({behavior:'smooth',block:'start'});
  const vb2=document.getElementById('pj-vbar');if(vb2)vb2.classList.add('show');
  setTimeout(()=>ddRunVerify(ddVerQueues.pj.map(q=>({el:document.getElementById(q.id),url:q.url,query:q.query,isNegative:q.isNegative})),'pj'),400);
}

function pfGerar(){
  const nome=ddV('pf-nome');
  if(!nome){alert('Informe o nome completo da pessoa física.');return;}
  const cpf=ddV('pf-cpf').replace(/\D/g,'');
  const cpfFmt=cpf.length===11?cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4'):ddV('pf-cpf');
  const end=ddV('pf-end');const empresa=ddV('pf-empresa');const pep=ddV('pf-pep');
  const vb=document.getElementById('pf-vbar');if(vb)vb.classList.remove('show');
  document.getElementById('pf-result').style.display='none';document.getElementById('pf-result').innerHTML='';
  ddVerQueues.pf=[];ddStCount=0;
  pfRender(nome,cpf,cpfFmt,end,empresa,pep);
}

// ── MODO MANUAL ───────────────────────────
function pjBuildManLinks(cnpjNum){
  const el=document.getElementById('pj-manlinks');if(!el)return;
  const links=[{n:'BrasilAPI',u:`https://brasilapi.com.br/api/cnpj/v1/${cnpjNum}`,d:'API governamental'},{n:'ReceitaWS',u:`https://www.receitaws.com.br/v1/cnpj/${cnpjNum}`,d:'Completa com QSA'},{n:'CNPJ.ws',u:`https://publica.cnpj.ws/cnpj/${cnpjNum}`,d:'Sócios e CNAEs'},{n:'Minha Receita',u:`https://minhareceita.org/${cnpjNum}`,d:'Receita Federal direta'}];
  el.innerHTML=links.map((l,i)=>`<a class="dd-manlink" href="${l.u}" target="_blank"><div class="dd-mannum">${i+1}</div><div><strong>${l.n}</strong> — ${l.d}<div style="font-size:.67rem;font-family:'DM Mono',monospace;opacity:.65;margin-top:1px">${l.u}</div></div><span>↗</span></a>`).join('');
}

function ddToggleManual(prefix){
  const box=document.getElementById(prefix+'-manbox');const show=box.style.display==='none';
  box.style.display=show?'block':'none';
  if(show&&prefix==='pj'){const raw=ddV('pj-cnpj').replace(/\D/g,'');if(raw.length===14){ddCnpjN=raw;pjBuildManLinks(raw);}}
}

function ddParseManual(prefix){
  const raw=document.getElementById(prefix+'-jsonpaste').value.trim();
  if(!raw){alert('Cole o JSON antes de processar.');return;}
  let d;try{d=JSON.parse(raw);}catch(e){alert('JSON inválido.\n\nErro: '+e.message);return;}
  let info=null;
  for(const a of['BrasilAPI','ReceitaWS','CNPJ.ws']){info=ddNorm(d,a);if(info&&info.razao)break;}
  if(!info){alert('Não foi possível interpretar o JSON.');return;}
  document.getElementById(prefix+'-manbox').style.display='none';
  if(prefix==='pj') pjRender(info,ddCnpjN||'00000000000100','Manual');
}

function ddOpenAll(urls){if(!urls||!urls.length)return;urls.forEach(u=>{if(u&&u!=='#')window.open(u,'_blank');});}

function ddLimpar(prefix){
  if(prefix==='pj'){
    ['pj-cnpj','pj-razao','pj-fantasia','pj-end','pj-socios','pj-objeto','pj-valor'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
    ['pj-pagto','pj-estado'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
    const lw=document.getElementById('pj-logwrap');if(lw)lw.style.display='none';
    const lb=document.getElementById('pj-log');if(lb)lb.innerHTML='';
    const mb=document.getElementById('pj-manbox');if(mb)mb.style.display='none';
    const jp=document.getElementById('pj-jsonpaste');if(jp)jp.value='';
  } else {
    ['pf-cpf','pf-nome','pf-nasc','pf-prof','pf-end','pf-empresa'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
    ['pf-pep','pf-nat'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=id==='pf-pep'?'nao':'';});
  }
  const res=document.getElementById(prefix+'-result');if(res){res.innerHTML='';res.style.display='none';}
  const vb=document.getElementById(prefix+'-vbar');if(vb)vb.classList.remove('show');
  ddVerQueues[prefix]=[];ddStCount=0;
}
// ══════════════════════════════════════════
// END DUE DILIGENCE MODULE v4
// ══════════════════════════════════════════

// Check session first, then init app

// ════════════════════════════════════════════
// AGENDA — Google Calendar style
// ════════════════════════════════════════════
let _agView = 'mes';
let _agDate = new Date();
let _agSelDate = null;

const AG_TIPOS = {
  'Reunião':     { cor:'#1a73e8', bg:'#e8f0fe', icon:'🤝' },
  'Compromisso': { cor:'#8b5cf6', bg:'#ede9fe', icon:'📌' },
  'Prazo':       { cor:'#ea4335', bg:'#fce8e6', icon:'⏰' },
  'Auditoria':   { cor:'#f59e0b', bg:'#fef3c7', icon:'🔍' },
  'Treinamento': { cor:'#0f9d58', bg:'#e6f4ea', icon:'📚' },
  'Evento':      { cor:'#6366f1', bg:'#e0e7ff', icon:'🎯' },
  'Outro':       { cor:'#64748b', bg:'#f1f5f9', icon:'📋' },
};
const AG_MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const AG_MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const AG_DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const AG_DAYS_FULL = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];

function _agKey(d) {
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function _agToday() { const t=new Date(); t.setHours(0,0,0,0); return t; }

function agendaSetView(v) {
  _agView = v;
  ['mes','semana','lista'].forEach(x => {
    const b = document.getElementById('btn-view-'+x);
    if(!b) return;
    b.className = 'btn btn-sm ' + (x===v ? 'btn-accent' : 'btn-outline');
  });
  renderAgenda();
}

function agendaNavMonth(d) {
  if(_agView==='semana') _agDate = new Date(_agDate.getFullYear(), _agDate.getMonth(), _agDate.getDate()+d*7);
  else _agDate = new Date(_agDate.getFullYear(), _agDate.getMonth()+d, 1);
  renderAgenda();
}
function agendaGoToday() { _agDate = new Date(); renderAgenda(); }

function renderAgenda() {
  const el = document.getElementById('agenda-view-container');
  const titleEl = document.getElementById('agenda-month-title');
  if(!el) return;
  if(!DB.agenda) DB.agenda=[];
  const today = _agToday();

  if(_agView==='mes') _renderAgendaMes(el, titleEl, today);
  else if(_agView==='semana') _renderAgendaSemana(el, titleEl, today);
  else _renderAgendaLista(el, titleEl, today);
}

function _renderAgendaMes(el, titleEl, today) {
  const y=_agDate.getFullYear(), m=_agDate.getMonth();
  if(titleEl) titleEl.textContent = AG_MONTHS[m]+' '+y;
  const firstDow = new Date(y,m,1).getDay();
  const daysInMonth = new Date(y,m+1,0).getDate();
  const daysInPrev = new Date(y,m,0).getDate();

  let html = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:0;border:1px solid var(--border);border-radius:10px;overflow:hidden">`;
  // Day headers
  AG_DAYS.forEach((d,i) => {
    const isWeekend = i===0||i===6;
    html += `<div style="text-align:center;padding:8px 4px;font-size:.73rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${isWeekend?'#ea4335':'var(--text-muted)'};background:#f8fafc;border-bottom:1px solid var(--border)">${d}</div>`;
  });

  // All cells (prev + current + next)
  const totalCells = Math.ceil((firstDow + daysInMonth)/7)*7;
  for(let i=0; i<totalCells; i++) {
    let date, otherMonth=false;
    if(i<firstDow) { date=new Date(y,m-1,daysInPrev-firstDow+i+1); otherMonth=true; }
    else if(i>=firstDow+daysInMonth) { date=new Date(y,m+1,i-firstDow-daysInMonth+1); otherMonth=true; }
    else { date=new Date(y,m,i-firstDow+1); }

    const key = _agKey(date);
    const isToday = date.toDateString()===today.toDateString();
    const isSel = _agSelDate===key;
    const isWeekend = date.getDay()===0||date.getDay()===6;
    const evts = (DB.agenda||[]).filter(e=>e.data===key).sort((a,b)=>(a.hora||'').localeCompare(b.hora||''));
    const colEnd = i===totalCells-1;
    const rowEnd = i>=totalCells-7;

    const cellBg = isSel ? 'rgba(0,196,154,.07)' : otherMonth ? '#fafafa' : '#fff';
    const borderRight = i%7===6 ? '' : 'border-right:1px solid var(--border);';
    const borderBottom = rowEnd ? '' : 'border-bottom:1px solid var(--border);';
    const outlineStyle = isSel ? 'box-shadow:inset 0 0 0 2px var(--primary);' : '';

    html += `<div onclick="agendaClickDay('${key}')" style="min-height:90px;padding:5px 6px;background:${cellBg};cursor:pointer;${borderRight}${borderBottom}${outlineStyle}transition:background .1s;position:relative" onmouseover="this.style.background='${isSel?'rgba(0,196,154,.1)':'#f0fdf9'}'" onmouseout="this.style.background='${cellBg}'">`;

    // Day number
    if(isToday) {
      html += `<div style="display:flex;margin-bottom:3px"><span style="background:var(--primary);color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:800">${date.getDate()}</span></div>`;
    } else {
      html += `<div style="font-size:.78rem;font-weight:${isToday?800:600};color:${otherMonth?'#c0c0c0':isWeekend?'#ea4335':'var(--text)'};margin-bottom:3px">${date.getDate()}</div>`;
    }

    // Events (max 3)
    evts.slice(0,3).forEach(e => {
      const t = AG_TIPOS[e.tipo]||AG_TIPOS['Outro'];
      html += `<div onclick="event.stopPropagation();agendaEditEvento(${e.id})" title="${e.titulo}" style="font-size:.68rem;font-weight:600;padding:2px 6px;border-radius:4px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:${t.cor};color:#fff;cursor:pointer;max-width:100%">${e.hora?e.hora.slice(0,5)+' ':''}${e.titulo}</div>`;
    });
    if(evts.length>3) html += `<div style="font-size:.65rem;color:var(--primary);font-weight:700;cursor:pointer">+${evts.length-3} mais</div>`;

    html += `</div>`;
  }
  html += `</div>`;
  el.innerHTML = html;
}

function _renderAgendaSemana(el, titleEl, today) {
  const dow = _agDate.getDay();
  const mon = new Date(_agDate); mon.setDate(_agDate.getDate()-dow);
  const sun = new Date(mon); sun.setDate(mon.getDate()+6);
  if(titleEl) titleEl.textContent = mon.getDate()+' '+AG_MONTHS_SHORT[mon.getMonth()]+' – '+sun.getDate()+' '+AG_MONTHS_SHORT[sun.getMonth()]+' '+sun.getFullYear();

  let html = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px">`;
  for(let i=0;i<7;i++) {
    const date = new Date(mon); date.setDate(mon.getDate()+i);
    const key = _agKey(date);
    const isToday = date.toDateString()===today.toDateString();
    const isSel = _agSelDate===key;
    const isWeekend = date.getDay()===0||date.getDay()===6;
    const evts = (DB.agenda||[]).filter(e=>e.data===key).sort((a,b)=>(a.hora||'').localeCompare(b.hora||''));

    html += `<div onclick="agendaClickDay('${key}')" style="min-height:180px;border-radius:10px;border:${isSel?'2px solid var(--primary)':isToday?'2px solid var(--primary)':'1px solid var(--border)'};background:${isToday?'rgba(0,196,154,.04)':'var(--card)'};padding:10px 8px;cursor:pointer;transition:all .15s" onmouseover="this.style.background='#f0fdf9'" onmouseout="this.style.background='${isToday?'rgba(0,196,154,.04)':'var(--card)'}'">`;

    // Header
    html += `<div style="text-align:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border)">
      <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${isWeekend?'#ea4335':'var(--text-muted)'}">${AG_DAYS[date.getDay()]}</div>`;
    if(isToday) html += `<div style="background:var(--primary);color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;margin:4px auto 0">${date.getDate()}</div>`;
    else html += `<div style="font-size:1.1rem;font-weight:800;color:${isWeekend?'#ea4335':'var(--text)'};margin-top:4px">${date.getDate()}</div>`;
    html += `</div>`;

    evts.forEach(e => {
      const t = AG_TIPOS[e.tipo]||AG_TIPOS['Outro'];
      html += `<div onclick="event.stopPropagation();agendaEditEvento(${e.id})" style="font-size:.72rem;font-weight:600;padding:4px 7px;border-radius:6px;margin-bottom:4px;background:${t.cor};color:#fff;cursor:pointer;border-left:3px solid rgba(0,0,0,.15)">${t.icon} ${e.hora?'<span style=opacity:.85>'+e.hora.slice(0,5)+'</span> ':''}${e.titulo}</div>`;
    });
    if(!evts.length) html += `<div style="font-size:.72rem;color:var(--text-muted);text-align:center;margin-top:10px;opacity:.5">Livre</div>`;
    html += `</div>`;
  }
  html += `</div>`;
  el.innerHTML = html;
}

function _renderAgendaLista(el, titleEl, today) {
  if(titleEl) titleEl.textContent = 'Próximos eventos';
  const upcoming = (DB.agenda||[])
    .filter(e => e.data >= _agKey(today))
    .sort((a,b)=>a.data.localeCompare(b.data)||(a.hora||'').localeCompare(b.hora||''));

  if(!upcoming.length) {
    el.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
      <div style="font-size:3rem;margin-bottom:12px">📅</div>
      <div style="font-size:1rem;font-weight:700;margin-bottom:6px">Nenhum evento cadastrado</div>
      <div style="font-size:.85rem">Clique em <strong>+ Evento</strong> para adicionar</div>
    </div>`;
    return;
  }

  let lastDate=''; let html='';
  upcoming.forEach(e => {
    const t = AG_TIPOS[e.tipo]||AG_TIPOS['Outro'];
    if(e.data!==lastDate) {
      const d = new Date(e.data+'T00:00:00');
      const isToday = d.toDateString()===today.toDateString();
      const isTomorrow = d.toDateString()===new Date(today.getTime()+86400000).toDateString();
      const label = isToday ? '📍 Hoje' : isTomorrow ? '📅 Amanhã' : AG_DAYS_FULL[d.getDay()];
      html += `<div style="display:flex;align-items:center;gap:12px;margin:18px 0 8px">
        <div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:${isToday?'var(--primary)':'var(--text-muted)'}">${label}</div>
        <div style="font-weight:700;font-size:.9rem;color:var(--text)">${d.getDate()} de ${AG_MONTHS[d.getMonth()]} ${d.getFullYear()}</div>
        <div style="flex:1;height:1px;background:var(--border)"></div>
      </div>`;
      lastDate = e.data;
    }
    html += `<div onclick="agendaEditEvento(${e.id})" style="display:flex;gap:14px;align-items:flex-start;padding:12px 16px;border-radius:10px;border:1px solid var(--border);background:var(--card);margin-bottom:7px;cursor:pointer;border-left:4px solid ${t.cor};transition:all .12s" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform=''">
      <div style="font-size:.78rem;font-weight:700;color:var(--text-muted);min-width:52px;padding-top:2px">${e.hora||'Todo dia'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.9rem;color:var(--text)">${t.icon} ${e.titulo}</div>
        ${e.desc?`<div style="font-size:.78rem;color:var(--text-muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.desc}</div>`:''}
        <div style="display:flex;gap:10px;margin-top:4px;flex-wrap:wrap">
          ${e.local?`<span style="font-size:.73rem;color:var(--text-muted)">📍 ${e.local}</span>`:''}
          ${e.resp?`<span style="font-size:.73rem;color:var(--text-muted)">👤 ${e.resp}</span>`:''}
          ${e.horaFim?`<span style="font-size:.73rem;color:var(--text-muted)">⏱ até ${e.horaFim}</span>`:''}
        </div>
      </div>
      <div style="display:flex;gap:4px;align-items:flex-start">
        <span style="background:${t.bg};color:${t.cor};padding:2px 9px;border-radius:20px;font-size:.72rem;font-weight:700;white-space:nowrap">${e.tipo}</span>
        <button onclick="event.stopPropagation();agendaDelEvento(${e.id})" style="background:#fee2e2;border:none;color:#ef4444;border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:.8rem;display:flex;align-items:center;justify-content:center">🗑</button>
      </div>
    </div>`;
  });
  el.innerHTML = html;
}

function agendaClickDay(key) {
  _agSelDate = key;
  renderAgenda();
  const evts = (DB.agenda||[]).filter(e=>e.data===key).sort((a,b)=>(a.hora||'').localeCompare(b.hora||''));
  const panel = document.getElementById('agenda-day-panel');
  const ptitle = document.getElementById('agenda-day-panel-title');
  const pbody = document.getElementById('agenda-day-panel-body');
  if(!panel) return;
  const d = new Date(key+'T00:00:00');
  const today = _agToday();
  const isToday = d.toDateString()===today.toDateString();
  ptitle.textContent = (isToday?'Hoje — ':'')+AG_DAYS_FULL[d.getDay()]+', '+d.getDate()+' de '+AG_MONTHS[d.getMonth()]+' '+d.getFullYear();
  if(!evts.length) {
    pbody.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted)">
      <div style="font-size:1.8rem;margin-bottom:8px">📭</div>
      <div style="font-weight:600;margin-bottom:10px">Nenhum evento neste dia</div>
      <button onclick="agendaNovoEvento('${key}')" class="btn btn-accent btn-sm">+ Adicionar Evento</button>
    </div>`;
  } else {
    pbody.innerHTML = evts.map(e => {
      const t = AG_TIPOS[e.tipo]||AG_TIPOS['Outro'];
      return `<div style="display:flex;gap:12px;align-items:flex-start;padding:12px 16px;border-radius:10px;border:1px solid var(--border);background:var(--card);margin-bottom:8px;border-left:4px solid ${t.cor}">
        <div style="font-size:.8rem;font-weight:700;color:var(--text-muted);min-width:50px">${e.hora||'Todo dia'}${e.horaFim?'<br><span style=font-size:.7rem>até '+e.horaFim+'</span>':''}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:.92rem">${t.icon} ${e.titulo}</div>
          <div style="margin-top:3px"><span style="background:${t.bg};color:${t.cor};padding:1px 8px;border-radius:20px;font-size:.71rem;font-weight:700">${e.tipo}</span></div>
          ${e.desc?`<div style="font-size:.8rem;color:var(--text-muted);margin-top:5px">${e.desc}</div>`:''}
          ${e.local?`<div style="font-size:.77rem;color:var(--text-muted);margin-top:3px">📍 ${e.local}</div>`:''}
          ${e.resp?`<div style="font-size:.77rem;color:var(--text-muted);margin-top:2px">👤 ${e.resp}</div>`:''}
          ${e.lembrete?`<div style="font-size:.74rem;color:var(--warn);margin-top:2px">🔔 ${e.lembrete}</div>`:''}
          ${e.recorrencia&&e.recorrencia!=='nenhuma'?`<div style="font-size:.74rem;color:var(--info);margin-top:2px">🔁 ${e.recorrencia}</div>`:''}
        </div>
        <div style="display:flex;gap:4px">
          <button onclick="agendaEditEvento(${e.id})" class="btn btn-outline btn-sm" style="padding:4px 8px">✏️</button>
          <button onclick="agendaDelEvento(${e.id})" class="btn btn-danger btn-sm" style="padding:4px 8px">🗑</button>
        </div>
      </div>`;
    }).join('') + `<div style="margin-top:8px"><button onclick="agendaNovoEvento('${key}')" class="btn btn-outline btn-sm">+ Evento neste dia</button></div>`;
  }
  panel.style.display='';
  setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}),80);
}

function agendaNovoEvento(dataInicial) {
  window._agEditId = null;
  document.getElementById('ag-f-titulo').value='';
  document.getElementById('ag-f-tipo').value='Reunião';
  document.getElementById('ag-f-data').value = dataInicial||_agSelDate||_agKey(new Date());
  document.getElementById('ag-f-hora').value='';
  document.getElementById('ag-f-hora-fim').value='';
  document.getElementById('ag-f-local').value='';
  document.getElementById('ag-f-resp').value='';
  document.getElementById('ag-f-desc').value='';
  document.getElementById('ag-f-lembrete').value='';
  document.getElementById('ag-f-recorrencia').value='nenhuma';
  document.getElementById('ag-modal-title').textContent='📅 Novo Evento';
  openModal('modal-agenda');
}

function agendaEditEvento(id) {
  const e=(DB.agenda||[]).find(x=>x.id===id); if(!e) return;
  window._agEditId=id;
  document.getElementById('ag-f-titulo').value=e.titulo||'';
  document.getElementById('ag-f-tipo').value=e.tipo||'Reunião';
  document.getElementById('ag-f-data').value=e.data||'';
  document.getElementById('ag-f-hora').value=e.hora||'';
  document.getElementById('ag-f-hora-fim').value=e.horaFim||'';
  document.getElementById('ag-f-local').value=e.local||'';
  document.getElementById('ag-f-resp').value=e.resp||'';
  document.getElementById('ag-f-desc').value=e.desc||'';
  document.getElementById('ag-f-lembrete').value=e.lembrete||'';
  document.getElementById('ag-f-recorrencia').value=e.recorrencia||'nenhuma';
  document.getElementById('ag-modal-title').textContent='✏️ Editar Evento';
  openModal('modal-agenda');
}

function agendaSalvarEvento() {
  const titulo=document.getElementById('ag-f-titulo').value.trim();
  const data=document.getElementById('ag-f-data').value;
  if(!titulo){alert('Informe o título.');return;}
  if(!data){alert('Informe a data.');return;}
  const evt={titulo,data,
    tipo:document.getElementById('ag-f-tipo').value,
    hora:document.getElementById('ag-f-hora').value,
    horaFim:document.getElementById('ag-f-hora-fim').value,
    local:document.getElementById('ag-f-local').value.trim(),
    resp:document.getElementById('ag-f-resp').value.trim(),
    desc:document.getElementById('ag-f-desc').value.trim(),
    lembrete:document.getElementById('ag-f-lembrete').value,
    recorrencia:document.getElementById('ag-f-recorrencia').value,
  };
  if(!DB.agenda) DB.agenda=[];
  if(window._agEditId) Object.assign(DB.agenda.find(e=>e.id===window._agEditId),evt);
  else { DB._ids.agenda=(DB._ids.agenda||1)+1; DB.agenda.push({id:DB._ids.agenda,...evt}); }
  closeModal('modal-agenda');
  saveLocalCache();
  const _savedEvt = window._agEditId ? DB.agenda.find(e=>e.id===window._agEditId) : DB.agenda[DB.agenda.length-1];
  if(_savedEvt) sbSaveAgenda(_savedEvt).then(()=>setSaveIndicator('☁️ Evento salvo na nuvem','var(--accent)'));
  _agSelDate=data;
  renderAgenda();
  agendaClickDay(data);
}

function agendaDelEvento(id) {
  if(!confirm('Excluir este evento?')) return;
  DB.agenda=(DB.agenda||[]).filter(e=>e.id!==id);
  saveLocalCache();
  sbDeleteAgenda(id);
  if(_agSelDate) agendaClickDay(_agSelDate);
  renderAgenda();
  setSaveIndicator('🗑 Evento removido','var(--warn)');
}

async function agendaSyncNuvem() {
  if(!USE_SUPABASE) { alert('Supabase não configurado.'); return; }
  const eventos = DB.agenda||[];
  if(!eventos.length) { alert('Nenhum evento para sincronizar.'); return; }
  setSaveIndicator('⏳ Sincronizando agenda...','var(--warn)');
  try {
    await Promise.all(eventos.map(e => sbSaveAgenda(e)));
    setSaveIndicator('☁️ Agenda sincronizada — '+eventos.length+' evento(s)','var(--accent)');
  } catch(err) {
    setSaveIndicator('❌ Erro ao sincronizar','var(--danger)');
    console.error('Sync agenda:', err);
  }
}



// ════════════════════════════════════════════════════
// SISTEMA DE LOGS DE AUDITORIA
// ════════════════════════════════════════════════════
const LOGS_KEY = 'ch_audit_logs_v1';
const LOGS_MAX_LOCAL = 500; // máximo no localStorage

// Tipos de ação com ícone e cor
const LOG_TIPOS = {
  'login':       { icon:'🔐', label:'Login',           cls:'login'  },
  'logout':      { icon:'🚪', label:'Logout',          cls:'login'  },
  'create':      { icon:'➕', label:'Criação',         cls:'create' },
  'update':      { icon:'✏️', label:'Edição',          cls:'update' },
  'delete':      { icon:'🗑️', label:'Exclusão',       cls:'delete' },
  'import':      { icon:'📥', label:'Importação',      cls:'import' },
  'status':      { icon:'🔄', label:'Status alterado', cls:'update' },
  'permissao':   { icon:'🔑', label:'Permissão',       cls:'update' },
  'senha':       { icon:'🔒', label:'Senha',           cls:'update' },
  'usuario':     { icon:'👤', label:'Usuário',         cls:'create' },
};

// Módulos legíveis
const LOG_MODULOS = {
  'denuncias':'Canal de Denúncia', 'riscos':'Mapeamento de Risco',
  'controles':'Controles Internos', 'planos':'Planos de Ação',
  'filiais':'Filiais e Setores', 'agenda':'Agenda',
  'rm_planos':'Planos RM', 'usuarios':'Usuários', 'sistema':'Sistema',
  'fbboards':'Flow Board', 'permissoes':'Permissões',
};

let _logsCache = null; // cache em memória para a sessão

// ── REGISTRAR LOG
async function auditLog(acao, modulo, descricao, detalhes = {}) {
  if(!currentUser) return;
  const entry = {
    id: Date.now() + Math.random().toString(36).slice(2,6),
    ts: new Date().toISOString(),
    email: currentUser.email,
    nome: currentUser.nome,
    perfil: currentUser.perfil,
    acao,
    modulo,
    descricao,
    detalhes,
  };

  // Salvar localmente
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift(entry); // mais recente primeiro
    if(logs.length > LOGS_MAX_LOCAL) logs.length = LOGS_MAX_LOCAL;
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    _logsCache = logs;
  } catch(e) {}

  // Salvar no Supabase
  if(USE_SUPABASE) {
    sbUpsert('audit_logs', {
      id: entry.id,
      ts: entry.ts,
      email: entry.email,
      nome: entry.nome,
      perfil: entry.perfil,
      acao: entry.acao,
      modulo: entry.modulo,
      descricao: entry.descricao,
      detalhes: JSON.stringify(entry.detalhes || {})
    }).catch(e => console.warn('auditLog save:', e.message));
  }
}

// ── CARREGAR LOGS
async function logsLoad() {
  // Tentar Supabase (mais completo)
  if(USE_SUPABASE) {
    try {
      const rows = await sbGet('audit_logs', 'order=ts&limit=1000');
      if(rows && rows.length > 0) {
        const logs = rows.reverse().map(r => ({
          id: r.id, ts: r.ts, email: r.email, nome: r.nome,
          perfil: r.perfil, acao: r.acao, modulo: r.modulo,
          descricao: r.descricao,
          detalhes: typeof r.detalhes === 'string' ? JSON.parse(r.detalhes||'{}') : r.detalhes||{}
        }));
        _logsCache = logs;
        localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, LOGS_MAX_LOCAL)));
        return logs;
      }
    } catch(e) { console.warn('logsLoad Supabase:', e.message); }
  }
  // Fallback: localStorage
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    _logsCache = raw ? JSON.parse(raw) : [];
    return _logsCache;
  } catch(e) { return []; }
}

// ── BRANDING & APARÊNCIA ──
let BRANDING = {
  nome: 'Compliance',
  subtitulo: 'Sistema de Gestão',
  corPrimaria: '#0f2d4a',
  logoUrl: ''
};

const BRANDING_KEY = 'ch_branding_config';

async function carregarBranding() {
  try {
    // Tentar carregar do Supabase primeiro
    if(USE_SUPABASE && SUPABASE_URL) {
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/branding?limit=1`, { 
          headers: _efH() 
        });
        if(r.ok) {
          const data = await r.json();
          if(data && data.length > 0) {
            const config = data[0];
            BRANDING = {
              nome: config.nome || 'Compliance',
              subtitulo: config.subtitulo || 'Sistema de Gestão',
              corPrimaria: config.cor_primaria || '#0f2d4a',
              logoUrl: config.logo_url || ''
            };
            localStorage.setItem(BRANDING_KEY, JSON.stringify(BRANDING));
            aplicarBranding();
            return;
          }
        }
      } catch(e) { try { const r2=await fetch(`${SUPABASE_URL}/rest/v1/branding?limit=1`,{headers:{'apikey':getActiveKey(),'Authorization':'Bearer '+getActiveKey()}}); if(r2.ok){const d2=await r2.json();if(d2&&d2.length>0){const c2=d2[0];BRANDING={nome:c2.nome||'Compliance',subtitulo:c2.subtitulo||'Sistema de Gestão',corPrimaria:c2.cor_primaria||'#0f2d4a',logoUrl:c2.logo_url||''};localStorage.setItem(BRANDING_KEY,JSON.stringify(BRANDING));aplicarBranding();return;}} } catch(e2){} console.warn('Erro ao carregar branding do Supabase:', e.message); }
    }
    
    // Fallback: localStorage
    const saved = localStorage.getItem(BRANDING_KEY);
    if(saved) {
      const config = JSON.parse(saved);
      BRANDING = { ...BRANDING, ...config };
      aplicarBranding();
    } else {
      aplicarBranding(); // Aplicar padrão
    }
  } catch(e) { console.warn('Erro ao carregar branding:', e); }
}

function aplicarBranding() {
  // Mudar nome na sidebar
  const brandElements = document.querySelectorAll('.brand');
  brandElements.forEach(el => el.textContent = BRANDING.nome);

  // Mudar cor primária
  document.documentElement.style.setProperty('--primary', BRANDING.corPrimaria);

  // Mudar logo se configurada
  if(BRANDING.logoUrl) {
    const logoElements = document.querySelectorAll('[class*="logo"], [id*="logo"]');
    logoElements.forEach(el => {
      if(el.tagName === 'IMG') el.src = BRANDING.logoUrl;
    });
  }

  // Mudar title da página
  document.title = `${BRANDING.nome} · ${BRANDING.subtitulo}`;
}

function abrirPainelBranding() {
  if(!isAdmin()) { alert('Apenas o administrador pode alterar o branding.'); return; }
  openModal('modal-branding');
  
  // Preencher form com valores atuais
  document.getElementById('branding-nome').value = BRANDING.nome;
  document.getElementById('branding-subtitulo').value = BRANDING.subtitulo;
  document.getElementById('branding-cor-primaria').value = BRANDING.corPrimaria;
  document.getElementById('branding-cor-primaria-hex').value = BRANDING.corPrimaria;
  document.getElementById('branding-logo-url').value = BRANDING.logoUrl;

  // Preview da logo
  if(BRANDING.logoUrl) {
    const preview = document.getElementById('branding-logo-preview');
    const vazio = document.getElementById('branding-logo-vazio');
    preview.src = BRANDING.logoUrl;
    preview.style.display = 'block';
    vazio.style.display = 'none';
  }

  // Sincronizar cor ao mudar no input color
  document.getElementById('branding-cor-primaria').addEventListener('change', function() {
    document.getElementById('branding-cor-primaria-hex').value = this.value;
  });

  // Sincronizar cor ao mudar no input hex
  document.getElementById('branding-cor-primaria-hex').addEventListener('change', function() {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    if(hexRegex.test(this.value)) {
      document.getElementById('branding-cor-primaria').value = this.value;
    }
  });

  // Preview da logo ao mudar URL
  document.getElementById('branding-logo-url').addEventListener('change', function() {
    const preview = document.getElementById('branding-logo-preview');
    const vazio = document.getElementById('branding-logo-vazio');
    if(this.value.trim()) {
      preview.src = this.value;
      preview.onerror = function() {
        preview.style.display = 'none';
        vazio.style.display = 'block';
        alert('❌ Erro ao carregar a imagem. Verifique a URL.');
      };
      preview.onload = function() {
        preview.style.display = 'block';
        vazio.style.display = 'none';
      };
    } else {
      preview.style.display = 'none';
      vazio.style.display = 'block';
    }
  });
}

async function salvarBranding() {
  const nome = document.getElementById('branding-nome').value.trim() || 'Compliance';
  const subtitulo = document.getElementById('branding-subtitulo').value.trim() || 'Sistema de Gestão';
  const corPrimaria = document.getElementById('branding-cor-primaria').value || '#0f2d4a';
  const logoUrl = document.getElementById('branding-logo-url').value.trim() || '';

  BRANDING = { nome, subtitulo, corPrimaria, logoUrl };

  try {
    // Salvar no localStorage primeiro (sempre funciona)
    localStorage.setItem(BRANDING_KEY, JSON.stringify(BRANDING));
    aplicarBranding();

    // Tentar salvar no Supabase também
    if(USE_SUPABASE && SUPABASE_URL) {
      const payload = {
        nome,
        subtitulo,
        cor_primaria: corPrimaria,
        logo_url: logoUrl,
        atualizado_por: currentUser?.email || 'admin@torre.com.br'
      };

      try {
        // Primeiro, tentar atualizar via REST (mais simples que Edge Function)
        const r = await fetch(`${SUPABASE_URL}/rest/v1/branding?id=eq.1`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON,
            'Authorization': 'Bearer ' + SUPABASE_ANON
          },
          body: JSON.stringify(payload)
        });

        if(r.ok) {
          console.log('✅ Branding salvo no Supabase');
          auditLog('update', 'branding', 'Branding alterado', { nome, subtitulo, corPrimaria });
          alert('✅ Branding salvo com sucesso para todos os usuários!');
        } else {
          console.warn('Falha Supabase:', r.status, await r.text());
          alert('⚠️ Branding salvo localmente. Servidor pode estar indisponível.');
        }
      } catch(e) {
        console.warn('Erro ao enviar para Supabase:', e.message);
        alert('⚠️ Branding salvo localmente. Servidor pode estar indisponível.');
      }
    } else {
      auditLog('update', 'branding', 'Branding alterado (local)', { nome, subtitulo, corPrimaria });
      alert('✅ Branding salvo com sucesso!');
    }
    
    closeModal('modal-branding');
  } catch(e) {
    console.error('Erro ao salvar branding:', e);
    alert('❌ Erro ao salvar: ' + e.message);
  }
}

async function resetarBranding() {
  if(confirm('Tem certeza que deseja restaurar as configurações padrão?\n\nIsso afetará todos os usuários!')) {
    try {
      BRANDING = {
        nome: 'Compliance',
        subtitulo: 'Sistema de Gestão',
        corPrimaria: '#0f2d4a',
        logoUrl: ''
      };

      // Salvar localmente
      localStorage.removeItem(BRANDING_KEY);

      // Resetar no Supabase
      if(USE_SUPABASE && SUPABASE_URL) {
        try {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/branding?id=eq.1`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON,
              'Authorization': 'Bearer ' + SUPABASE_ANON
            },
            body: JSON.stringify({
              nome: 'Compliance',
              subtitulo: 'Sistema de Gestão',
              cor_primaria: '#0f2d4a',
              logo_url: '',
              atualizado_por: currentUser?.email || 'admin@torre.com.br'
            })
          });

          if(!r.ok) {
            console.warn('Erro ao resetar no Supabase');
          }
        } catch(e) {
          console.warn('Erro ao resetar:', e);
        }
      }

      aplicarBranding();
      auditLog('update', 'branding', 'Branding restaurado para padrão', {});
      alert('✅ Padrão restaurado!');
      closeModal('modal-branding');
    } catch(e) {
      alert('❌ Erro: ' + e.message);
    }
  }
}

// ── ABRIR PAINEL DE LOGS
async function abrirLogs() {
  if(!isAdmin()) { alert('Apenas o administrador pode ver os logs.'); return; }
  openModal('modal-logs');
  renderLogs('todos');
  // Recarregar do Supabase
  logsLoad().then(() => renderLogs(_logFiltroAtivo||'todos'));
}

let _logFiltroAtivo = 'todos';
let _logUserFiltro = '';

function renderLogs(filtro) {
  _logFiltroAtivo = filtro;

  // Update filter buttons
  document.querySelectorAll('.log-filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filtro === filtro);
  });

  const logs = _logsCache || [];
  const filtrados = logs.filter(l => {
    if(_logUserFiltro && !l.email.includes(_logUserFiltro) && !l.nome.toLowerCase().includes(_logUserFiltro.toLowerCase())) return false;
    if(filtro === 'todos') return true;
    if(filtro === 'delete') return l.acao === 'delete';
    if(filtro === 'login')  return ['login','logout'].includes(l.acao);
    if(filtro === 'denuncias') return l.modulo === 'denuncias';
    if(filtro === 'import') return l.acao === 'import';
    return l.acao === filtro || l.modulo === filtro;
  });

  // Stats
  const hoje = new Date().toDateString();
  const logHoje = logs.filter(l => new Date(l.ts).toDateString() === hoje).length;
  const logDelete = logs.filter(l => l.acao === 'delete').length;
  const usuarios = [...new Set(logs.map(l=>l.email))].length;

  document.getElementById('log-stat-total').textContent = logs.length;
  document.getElementById('log-stat-hoje').textContent = logHoje;
  document.getElementById('log-stat-delete').textContent = logDelete;
  document.getElementById('log-stat-users').textContent = usuarios;

  // Render list
  const container = document.getElementById('logs-list');
  if(!container) return;

  if(!filtrados.length) {
    container.innerHTML = `<div class="log-empty"><div style="font-size:2.5rem;margin-bottom:10px">📋</div><div style="font-weight:700">Nenhum log encontrado</div><div style="font-size:.83rem;margin-top:6px">As ações dos usuários aparecerão aqui</div></div>`;
    return;
  }

  container.innerHTML = filtrados.map(l => {
    const tipo = LOG_TIPOS[l.acao] || { icon:'📋', label:l.acao, cls:'update' };
    const modLabel = LOG_MODULOS[l.modulo] || l.modulo;
    const dt = new Date(l.ts);
    const agora = new Date();
    const diffMin = Math.round((agora - dt) / 60000);
    let timeStr;
    if(diffMin < 1) timeStr = 'Agora';
    else if(diffMin < 60) timeStr = diffMin + 'min atrás';
    else if(diffMin < 1440) timeStr = Math.round(diffMin/60) + 'h atrás';
    else timeStr = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});

    // User color
    const u = USUARIOS.find(x=>x.email===l.email);
    const cor = u ? u.cor : '#64748b';

    // Detalhes extras
    const det = l.detalhes || {};
    const detStr = Object.entries(det).filter(([k])=>k!=='id').map(([k,v])=>`${k}: ${v}`).join(' · ');

    return `<div class="log-item">
      <div class="log-icon ${tipo.cls}">${tipo.icon}</div>
      <div class="log-meta">
        <div class="log-title">${tipo.label} — <span style="color:var(--primary)">${modLabel}</span></div>
        <div class="log-detail">${l.descricao}${detStr?'<span style="color:#94a3b8"> · '+detStr+'</span>':''}</div>
        <span class="log-user" style="background:${cor}22;color:${cor}">
          <span style="width:16px;height:16px;border-radius:50%;background:${cor};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:800">${(l.nome||'?')[0]}</span>
          ${l.nome} · ${l.perfil}
        </span>
      </div>
      <div class="log-time">${timeStr}</div>
    </div>`;
  }).join('');
}

function logFiltrarUser(val) {
  _logUserFiltro = val;
  renderLogs(_logFiltroAtivo);
}

async function exportarLogs() {
  const logs = _logsCache || [];
  const csv = ['Data,Hora,Usuário,E-mail,Perfil,Ação,Módulo,Descrição']
    .concat(logs.map(l => {
      const dt = new Date(l.ts);
      return [
        dt.toLocaleDateString('pt-BR'),
        dt.toLocaleTimeString('pt-BR'),
        `"${l.nome}"`, l.email, l.perfil,
        l.acao, l.modulo,
        `"${(l.descricao||'').replace(/"/g,'""')}"`
      ].join(',');
    })).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'audit_logs_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
}

async function limparLogsAntigos() {
  if(!confirm('Limpar logs com mais de 90 dias?\n\nLogs recentes serão mantidos.')) return;
  const cutoff = new Date(Date.now() - 90*24*60*60*1000).toISOString();
  _logsCache = (_logsCache||[]).filter(l => l.ts > cutoff);
  localStorage.setItem(LOGS_KEY, JSON.stringify(_logsCache));
  setSaveIndicator('🗑 Logs antigos removidos','var(--warn)');
  renderLogs(_logFiltroAtivo);
}
// ════════════════════════════════════════════════════
// GESTÃO DE USUÁRIOS (Admin)
// ════════════════════════════════════════════════════
const USERS_KEY = 'ch_usuarios_v1';
const CORES_AVATAR = ['#0f2d4a','#00c49a','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#10b981','#f97316','#06b6d4','#ec4899'];

async function usersLoad() {
  // Limpar array — mantém só admin — evita re-adição de excluídos
  while(USUARIOS.length > 1) USUARIOS.pop();

  // Buscar via REST direto (anon key) — independente do Edge Function
  if(USE_SUPABASE) {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/settings?key=eq.usuarios_extras&select=value`,
        { headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON } }
      );
      if(r.ok) {
        const rows = await r.json();
        if(rows && rows[0] && rows[0].value) {
          const extras = JSON.parse(rows[0].value);
          if(Array.isArray(extras)) {
            extras.forEach(u => {
              if(u.email !== ADMIN_EMAIL) USUARIOS.push(u);
            });
            localStorage.setItem(USERS_KEY, JSON.stringify(extras));
            console.log('[usersLoad] OK:', extras.length, 'usuario(s)');
            return;
          }
        }
      }
    } catch(e) { console.warn('[usersLoad] REST erro:', e.message); }
  }

  // Fallback: localStorage
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if(raw) {
      const extras = JSON.parse(raw);
      if(Array.isArray(extras))
        extras.forEach(u => { if(u.email !== ADMIN_EMAIL) USUARIOS.push(u); });
    }
  } catch(e) {}
}

async function usersSave() {
  const extras = USUARIOS.filter(u => u.email !== ADMIN_EMAIL);
  // 1. Salvar local imediatamente
  localStorage.setItem(USERS_KEY, JSON.stringify(extras));
  // 2. Salvar no Supabase via REST direto (anon key — sem depender de token)
  if(USE_SUPABASE) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/settings`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': 'Bearer ' + SUPABASE_ANON,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({ key: 'usuarios_extras', value: JSON.stringify(extras) })
      });
      if(r.ok) console.log('[usersSave] Supabase OK —', extras.length, 'usuario(s)');
      else console.warn('[usersSave] Supabase status:', r.status);
    } catch(e) { console.warn('[usersSave] REST erro:', e.message); }
  }
}

function abrirGerenciarUsuarios() {
  if(!isAdmin()) return;
  renderUsersModal();
  openModal('modal-usuarios');
}

function renderUsersModal() {
  const el = document.getElementById('users-list');
  if(!el) return;
  const builtinEmails = [ADMIN_EMAIL];
  el.innerHTML = USUARIOS.map(u => {
    const isBuiltin = builtinEmails.includes(u.email);
    const isAdminUser = u.email === 'admin@torre.com.br';
    return `<div class="user-mgmt-card">
      <div class="perm-avatar" style="background:${u.cor||'#64748b'}">${u.avatar||'??'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.88rem">${u.nome}</div>
        <div style="font-size:.75rem;color:var(--text-muted)">${u.email}</div>
        <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
          <span style="background:#e0e7ff;color:#3730a3;padding:2px 8px;border-radius:10px;font-size:.7rem;font-weight:700">${u.perfil}</span>
          ${isBuiltin?'<span style="background:#fef9c3;color:#854d0e;padding:2px 8px;border-radius:10px;font-size:.7rem;font-weight:700">Padrão</span>':'<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:10px;font-size:.7rem;font-weight:700">Criado</span>'}
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-direction:column;align-items:flex-end">
        ${!isAdminUser?`<button onclick="abrirAlterarSenha('${u.email}','${u.nome}')" class="btn btn-outline btn-sm" style="font-size:.73rem;white-space:nowrap">🔑 Alterar Senha</button>`:''}
        ${!isBuiltin?`<button onclick="confirmarExcluirUsuario('${u.email}','${u.nome}')" class="btn btn-danger btn-sm" style="font-size:.73rem">🗑 Excluir</button>`:''}
      </div>
    </div>`;
  }).join('');
}

let _novoUserPerfil = 'Compliance';
let _novoUserCor = '#00c49a';

function abrirNovoUsuario() {
  if(!isAdmin()) return;
  _novoUserPerfil = 'Compliance'; _novoUserCor = '#00c49a';
  ['nu-nome','nu-email','nu-senha','nu-senha2'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  const erroEl = document.getElementById('nu-erro'); if(erroEl) erroEl.textContent='';
  const stEl = document.getElementById('nu-strength'); if(stEl) stEl.className='senha-strength';
  document.querySelectorAll('.perfil-opt').forEach(el=>el.classList.toggle('selected',el.dataset.perfil==='Compliance'));
  document.querySelectorAll('.cor-opt').forEach(el=>el.classList.toggle('selected',el.dataset.cor==='#00c49a'));
  _renderNovoUserPerms('Compliance');
  openModal('modal-novo-usuario');
}

function nuSelecionarPerfil(perfil, cor) {
  _novoUserPerfil = perfil;
  if(cor) { _novoUserCor=cor; document.querySelectorAll('.cor-opt').forEach(e=>e.classList.toggle('selected',e.dataset.cor===cor)); }
  document.querySelectorAll('.perfil-opt').forEach(e=>e.classList.toggle('selected',e.dataset.perfil===perfil));
  _renderNovoUserPerms(perfil);
}

function nuSelecionarCor(cor) {
  _novoUserCor=cor;
  document.querySelectorAll('.cor-opt').forEach(e=>e.classList.toggle('selected',e.dataset.cor===cor));
}

function _renderNovoUserPerms(perfil) {
  const container = document.getElementById('nu-perms');
  if(!container) return;
  const defaultPerms = PERM_PADRAO[perfil]||[];
  container.innerHTML = `<div style="font-size:.78rem;font-weight:700;color:var(--text-muted);margin-bottom:8px">Permissões (baseadas no perfil — personalizável):</div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">
      ${MODULOS.map(m => {
        const checked=defaultPerms.includes(m.id);
        return `<label style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;border:1px solid ${checked?'var(--accent)':'var(--border)'};background:${checked?'rgba(0,196,154,.06)':'var(--card)'};cursor:pointer;font-size:.78rem;font-weight:600;transition:all .15s">
          <input type="checkbox" id="nu-perm-${m.id}" ${checked?'checked':''} style="width:15px;height:15px;accent-color:var(--primary)">
          ${m.icon} ${m.label}${m.restrito?'<span style="font-size:.65rem;color:#9333ea;margin-left:auto">🔒</span>':''}
        </label>`;
      }).join('')}
    </div>`;
}

function nuSenhaStrength(val) {
  const bar=document.getElementById('nu-strength'); if(!bar) return;
  if(!val.length){bar.className='senha-strength';return;}
  const score=(val.length>=8?1:0)+(/[A-Z]/.test(val)?1:0)+(/[0-9]/.test(val)?1:0)+(/[^A-Za-z0-9]/.test(val)?1:0);
  bar.className='senha-strength '+(score<=1?'strength-weak':score<=2?'strength-medium':'strength-strong');
}

async function salvarNovoUsuario() {
  const nome=document.getElementById('nu-nome').value.trim();
  const email=document.getElementById('nu-email').value.trim().toLowerCase();
  const senha=document.getElementById('nu-senha').value;
  const senha2=document.getElementById('nu-senha2').value;
  const erro=document.getElementById('nu-erro');
  if(!nome){erro.textContent='Informe o nome.';return;}
  if(!email||!email.includes('@')){erro.textContent='E-mail inválido.';return;}
  // Recarregar antes de verificar duplicata
  await usersLoad();
  if(USUARIOS.find(u=>u.email===email)){erro.textContent='Este e-mail já está cadastrado.';return;}
  if(!senha||senha.length<6){erro.textContent='Senha deve ter pelo menos 6 caracteres.';return;}
  if(senha!==senha2){erro.textContent='As senhas não conferem.';return;}
  erro.textContent='';
  const palavras=nome.split(' ').filter(p=>p.length>0);
  const avatar=palavras.length>=2?(palavras[0][0]+palavras[palavras.length-1][0]).toUpperCase():nome.substring(0,2).toUpperCase();
  const hash=await _hashSenha(email,senha);
  const perms=MODULOS.filter(m=>{const el=document.getElementById(`nu-perm-${m.id}`);return el&&el.checked;}).map(m=>m.id);
  const novoUser={email,hash,nome,perfil:_novoUserPerfil,avatar,cor:_novoUserCor};
  USUARIOS.push(novoUser);
  PERMISSOES[email]=perms;
  permSave();
  await usersSave();
  closeModal('modal-novo-usuario');
  renderUsersModal();
  auditLog('usuario', 'usuarios', `Usuário "${nome}" criado`, {email, perfil:_novoUserPerfil});
  setSaveIndicator(`✅ Usuário ${nome} criado — sincronizado automaticamente`,'var(--accent)');
}

async function confirmarExcluirUsuario(email, nome) {
  if(!confirm(`Excluir "${nome}" (${email})?\n\nO usuário perderá todo o acesso ao sistema.`)) return;
  // Remove do array em memória
  const idx = USUARIOS.findIndex(u => u.email === email);
  if(idx >= 0) USUARIOS.splice(idx, 1);
  delete PERMISSOES[email];
  // Salvar sequencialmente para garantir consistência no servidor
  await usersSave();
  await permSave();
  auditLog('delete', 'usuarios', `Usuário "${nome}" excluído`, {email});
  renderUsersModal();
  setSaveIndicator(`🗑 Usuário "${nome}" removido e sincronizado`, 'var(--warn)');
}

function abrirAlterarSenha(email,nome) {
  document.getElementById('ap-email-label').textContent=`${nome} (${email})`;
  document.getElementById('ap-email-hidden').value=email;
  ['ap-senha-atual','ap-senha-nova','ap-senha-nova2'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const e=document.getElementById('ap-erro');if(e)e.textContent='';
  const s=document.getElementById('ap-strength');if(s)s.className='senha-strength';
  openModal('modal-alterar-senha');
}

function abrirAlterarMinhaSenha() {
  if(!currentUser) return;
  abrirAlterarSenha(currentUser.email, currentUser.nome);
}

async function salvarNovaSenha() {
  const email=document.getElementById('ap-email-hidden').value;
  const atual=document.getElementById('ap-senha-atual').value;
  const nova=document.getElementById('ap-senha-nova').value;
  const nova2=document.getElementById('ap-senha-nova2').value;
  const erro=document.getElementById('ap-erro');
  erro.textContent='';
  const user=USUARIOS.find(u=>u.email===email);
  if(!user){erro.textContent='Usuário não encontrado.';return;}
  const ehProprioUsuario=currentUser.email===email;
  if(ehProprioUsuario || !isAdmin()) {
    if(!atual){erro.textContent='Informe a senha atual.';return;}
    const hashAtual=await _hashSenha(email,atual);
    if(hashAtual!==user.hash){erro.textContent='Senha atual incorreta.';return;}
  }
  if(!nova||nova.length<6){erro.textContent='Nova senha deve ter pelo menos 6 caracteres.';return;}
  if(nova!==nova2){erro.textContent='As senhas não conferem.';return;}
  const novoHash=await _hashSenha(email,nova);
  user.hash=novoHash;
  await usersSave();
  closeModal('modal-alterar-senha');
  setSaveIndicator('✅ Senha alterada — sincronizada automaticamente','var(--accent)');
}

// ════════════════════════════════════════════════════
// SISTEMA DE PERMISSÕES POR MÓDULO
// ════════════════════════════════════════════════════

// Módulos do sistema com metadados
const MODULOS = [
  { id:'dashboard',      label:'Dashboard',           icon:'📊', grupo:'Visão Geral',  restrito:false },
  { id:'agenda',         label:'Agenda',              icon:'📅', grupo:'Visão Geral',  restrito:false },
  { id:'filiais',        label:'Filiais e Setores',   icon:'🏢', grupo:'Estrutura',    restrito:false },
  { id:'mapa-risco',     label:'Mapeamento de Risco', icon:'🗺️', grupo:'Compliance',   restrito:false },
  { id:'controles',      label:'Controles Internos',  icon:'🛡️', grupo:'Compliance',   restrito:false },
  { id:'planos-acao',    label:'Planos de Ação',      icon:'📋', grupo:'Compliance',   restrito:false },
  { id:'canal-denuncia', label:'Canal de Denúncia',   icon:'📢', grupo:'Denúncias',    restrito:true  },
  { id:'relatorios',     label:'Relatórios',          icon:'📈', grupo:'Análise',      restrito:true  },
  { id:'importar',       label:'Importar Planilha',   icon:'📥', grupo:'Análise',      restrito:false },
  { id:'flowboard',      label:'Flow Board',          icon:'🗂️', grupo:'Fluxo Visual', restrito:false },
  { id:'due-diligence',  label:'Due Diligence',       icon:'🔍', grupo:'Pesquisa',     restrito:false },
];

// Permissões padrão por perfil (sem personalização)
const PERM_PADRAO = {
  'Admin':        MODULOS.map(m=>m.id),
  'Compliance':   MODULOS.map(m=>m.id),
  'Auditoria':    MODULOS.filter(m=>!['importar'].includes(m.id)).map(m=>m.id),
  'RH':           ['dashboard','agenda','filiais'],
  'Diretoria':    MODULOS.filter(m=>!['importar','canal-denuncia'].includes(m.id)).map(m=>m.id),
  'Operações':    ['dashboard','agenda','filiais','mapa-risco','planos-acao'],
  'Visualizador': ['dashboard','filiais'],
  // Perfis personalizados (criados pelo admin) herdam Compliance por padrão
};

// Permissões salvas (admin pode personalizar por usuário)
let PERMISSOES = {}; // { 'email@...': ['dashboard','agenda',...] }
const PERM_KEY = 'ch_permissoes_v1';

function permLoad() {
  try {
    const raw = localStorage.getItem(PERM_KEY);
    if(raw) PERMISSOES = JSON.parse(raw);
  } catch(e) { PERMISSOES = {}; }
}

async function permSave() {
  localStorage.setItem(PERM_KEY, JSON.stringify(PERMISSOES));
  if(USE_SUPABASE) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/settings`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': 'Bearer ' + SUPABASE_ANON,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({ key: 'permissoes', value: JSON.stringify(PERMISSOES) })
      });
      if(r.ok) console.log('[permSave] OK');
      else console.warn('[permSave] status:', r.status);
    } catch(e) { console.warn('[permSave] erro:', e.message); }
  }
}

async function permLoadFromSupabase() {
  if(!USE_SUPABASE) return;
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/settings?key=eq.permissoes&select=value`,
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON } }
    );
    if(r.ok) {
      const rows = await r.json();
      if(rows && rows[0] && rows[0].value) {
        const sbPerms = JSON.parse(rows[0].value);
        PERMISSOES = { ...PERMISSOES, ...sbPerms };
        localStorage.setItem(PERM_KEY, JSON.stringify(PERMISSOES));
        console.log('[permLoad] OK');
      }
    }
  } catch(e) { console.warn('[permLoad] erro:', e.message); }
}

function permGetUser(email) {
  if(!email) return [];
  if(email === ADMIN_EMAIL) return MODULOS.map(m=>m.id);
  // Permissão personalizada tem prioridade
  if(PERMISSOES[email]) return PERMISSOES[email];
  // Senão usa o padrão do perfil
  const user = USUARIOS.find(u=>u.email===email);
  return user ? (PERM_PADRAO[user.perfil] || MODULOS.filter(m=>!m.restrito).map(m=>m.id)) : [];
}

function canAccess(modulo) {
  if(!currentUser) return false;
  if(currentUser.email === 'admin@torre.com.br' || currentUser.perfil === 'Admin') return true;
  return permGetUser(currentUser.email).includes(modulo);
}

function isAdmin() {
  return currentUser && (currentUser.email === ADMIN_EMAIL || currentUser.perfil === 'Admin');
}

// ── Atualizar nav com base nas permissões
function permAtualizarNav() {
  MODULOS.forEach(m => {
    const el = document.querySelector(`[data-page="${m.id}"]`);
    if(!el) return;
    const tem = canAccess(m.id);
    el.classList.toggle('nav-item-locked', !tem);
    el.style.pointerEvents = tem ? '' : 'none';
    el.title = tem ? '' : 'Sem permissão — solicite acesso ao administrador';
  });
}

// ── Interceptar goto para verificar permissão
function goto(page, el) {
  if(!canAccess(page)) {
    const modulo = MODULOS.find(m=>m.id===page);
    const nome = modulo ? modulo.label : page;
    _showPermDenied(nome);
    return;
  }
  _gotoImpl(page, el);
}

function _showPermDenied(modulo) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px;max-width:420px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3)">
      <div style="font-size:3rem;margin-bottom:12px">🔒</div>
      <div style="font-size:1.1rem;font-weight:800;color:#1e293b;margin-bottom:8px">Acesso Restrito</div>
      <div style="font-size:.88rem;color:#64748b;line-height:1.6;margin-bottom:20px">
        Você não tem permissão para acessar o módulo <strong>${modulo}</strong>.<br>
        Solicite acesso ao administrador do sistema.
      </div>
      <div style="font-size:.8rem;color:#94a3b8;margin-bottom:16px">👤 admin@torre.com.br</div>
      <button onclick="this.closest('div[style]').remove()" 
        style="background:var(--primary);color:#fff;border:none;padding:10px 28px;border-radius:8px;font-weight:700;cursor:pointer">
        Entendi
      </button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });
}

// ════════════════════════════════════════════════════
// MODAL DE GERENCIAMENTO DE PERMISSÕES (só Admin)
// ════════════════════════════════════════════════════
function abrirGerenciarPermissoes() {
  if(!isAdmin()) { alert('Apenas o administrador pode gerenciar permissões.'); return; }
  renderPermModal();
  openModal('modal-permissoes');
}

function renderPermModal() {
  const container = document.getElementById('perm-users-list');
  if(!container) return;

  const outrosUsuarios = USUARIOS.filter(u => u.email !== ADMIN_EMAIL);

  if(!outrosUsuarios.length) {
    container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-muted)">
      <div style="font-size:2rem;margin-bottom:10px">👥</div>
      <div style="font-weight:700;margin-bottom:6px">Nenhum usuário criado ainda</div>
      <div style="font-size:.83rem">Vá em <strong>👥 Gerenciar Usuários</strong> para criar o primeiro usuário.</div>
    </div>`;
    return;
  }

  container.innerHTML = outrosUsuarios.map(user => {
    const perms = permGetUser(user.email);
    const modulosRestritos = MODULOS.filter(m => m.restrito);
    const temTodos = MODULOS.every(m => perms.includes(m.id));

    return `
    <div class="perm-user-card" id="perm-card-${user.email.replace('@','_').replace('.','_')}">
      <div class="perm-avatar" style="background:${user.cor}">${user.avatar}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.9rem">${user.nome}</div>
        <div style="font-size:.75rem;color:var(--text-muted)">${user.email} · <em>${user.perfil}</em></div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">
        <button onclick="permExpandir('${user.email}')" class="btn btn-outline btn-sm" style="font-size:.75rem">
          ⚙️ Configurar módulos
        </button>
        <button onclick="permDarTudo('${user.email}')" class="btn btn-outline btn-sm" style="font-size:.75rem;color:var(--accent)">
          ✅ Liberar tudo
        </button>
        <button onclick="permRevogarTudo('${user.email}')" class="btn btn-danger btn-sm" style="font-size:.75rem">
          🚫 Revogar tudo
        </button>
      </div>
      <div id="perm-expand-${user.email.replace(/[@.]/g,'_')}" style="display:none;width:100%;margin-top:12px">
        ${renderPermModulos(user.email, perms)}
      </div>
    </div>`;
  }).join('');
}

function renderPermModulos(email, perms) {
  const grupos = [...new Set(MODULOS.map(m=>m.grupo))];
  return grupos.map(grupo => {
    const mods = MODULOS.filter(m=>m.grupo===grupo);
    return `
      <div class="perm-section-title">${grupo}</div>
      <div class="perm-modules">
        ${mods.map(m => {
          const tem = perms.includes(m.id);
          return `
            <div class="perm-mod-item ${tem?'granted':'denied'}" id="perm-mod-${email.replace(/[@.]/g,'_')}-${m.id}"
              onclick="permToggle('${email}','${m.id}')">
              <span style="font-size:1.1rem">${m.icon}</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:.8rem;font-weight:700">${m.label}</div>
                ${m.restrito?'<div style="font-size:.68rem;color:#9333ea;font-weight:600">🔒 Acesso restrito</div>':''}
              </div>
              <button class="perm-toggle ${tem?'on':'off'}" onclick="event.stopPropagation();permToggle('${email}','${m.id}')"></button>
            </div>`;
        }).join('')}
      </div>`;
  }).join('');
}

function permExpandir(email) {
  const key = email.replace(/[@.]/g,'_');
  const el = document.getElementById(`perm-expand-${key}`);
  if(!el) return;
  const visible = el.style.display !== 'none';
  // Fechar todos
  document.querySelectorAll('[id^="perm-expand-"]').forEach(e => e.style.display='none');
  if(!visible) el.style.display='block';
}

async function permToggle(email, modulo) {
  if(!PERMISSOES[email]) {
    PERMISSOES[email] = [...permGetUser(email)];
  }
  const idx = PERMISSOES[email].indexOf(modulo);
  if(idx >= 0) PERMISSOES[email].splice(idx, 1);
  else PERMISSOES[email].push(modulo);
  await permSave();
  permAtualizarNav();

  // Atualizar UI do toggle
  const key = email.replace(/[@.]/g,'_');
  const item = document.getElementById(`perm-mod-${key}-${modulo}`);
  if(item) {
    const tem = PERMISSOES[email].includes(modulo);
    item.className = `perm-mod-item ${tem?'granted':'denied'}`;
    const btn = item.querySelector('.perm-toggle');
    if(btn) btn.className = `perm-toggle ${tem?'on':'off'}`;
  }
  setSaveIndicator('✅ Permissão atualizada','var(--accent)');
}

async function permDarTudo(email) {
  PERMISSOES[email] = MODULOS.map(m=>m.id);
  await permSave();
  permAtualizarNav();
  renderPermModal();
  setSaveIndicator(`✅ Acesso total liberado para ${email}`,'var(--accent)');
}

async function permRevogarTudo(email) {
  if(!confirm(`Revogar TODOS os acessos de ${email}?

O usuário não conseguirá acessar nenhum módulo.`)) return;
  PERMISSOES[email] = [];
  await permSave();
  permAtualizarNav();
  renderPermModal();
  setSaveIndicator(`⛔ Acesso revogado para ${email}`,'var(--danger)');
}
// ════════════════════════════════════════════
// MAPEAMENTO DE RISCO — UNIDADES
// ════════════════════════════════════════════
let RM_UNITS = [
  {id:'PDV',icon:'🛒',cor:'#ef4444'},{id:'Inventário',icon:'📦',cor:'#f59e0b'},
  {id:'TI',icon:'💻',cor:'#3b82f6'},{id:'RH',icon:'👥',cor:'#8b5cf6'},
  {id:'Fiscal',icon:'📊',cor:'#10b981'},{id:'Auditoria',icon:'🔍',cor:'#6366f1'},
  {id:'Jurídico',icon:'⚖️',cor:'#64748b'},{id:'Operações',icon:'⚙️',cor:'#0ea5e9'},
  {id:'Geral',icon:'🗂️',cor:'#78716c'},
];
let _rmUnit = 'PDV', _rmTab = 'riscos';

function renderMapaRisco() {
  const tabs = document.getElementById('rm-unit-tabs');
  if(!tabs) return;
  tabs.innerHTML = RM_UNITS.map(u => {
    const cnt = (DB.riscos||[]).filter(r=>r.unidade===u.id).length;
    return `<button class="rm-tab${_rmUnit===u.id?' active':''}" onclick="_rmSetUnit('${u.id}')">
      ${u.icon} ${u.id} <span style="background:${_rmUnit===u.id?'rgba(255,255,255,.25)':'var(--border)'};border-radius:20px;padding:1px 7px;font-size:.7rem;margin-left:3px">${cnt}</span>
    </button>`;
  }).join('');
  _rmRenderBody();
}

function _rmSetUnit(uid) { _rmUnit=uid; renderMapaRisco(); }
function _rmSetTab(t) {
  _rmTab=t;
  document.querySelectorAll('.rm-subtab').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
  document.querySelectorAll('.rm-subpanel').forEach(p=>p.classList.toggle('active',p.dataset.panel===t));
}

function _rmNivel(p,i){const s=p*i;return s>=150?'Crítico':s>=75?'Alto':s>=25?'Médio':'Baixo';}
function _rmNivelCor(nv){return{Crítico:'#ef4444',Alto:'#f59e0b',Médio:'#3b82f6',Baixo:'#10b981'}[nv]||'#94a3b8';}

function _rmRenderBody() {
  const body = document.getElementById('rm-unit-body');
  if(!body) return;
  const u = RM_UNITS.find(x=>x.id===_rmUnit)||RM_UNITS[0];
  const riscos = (DB.riscos||[]).filter(r=>r.unidade===_rmUnit);
  const planos = (DB.rmPlanos||[]).filter(p=>riscos.some(r=>r.id===p.riscoId));

  body.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <span style="font-size:1.3rem">${u.icon}</span>
      <strong style="color:var(--primary)">${u.id}</strong>
      <span style="background:${u.cor};color:#fff;padding:2px 9px;border-radius:20px;font-size:.73rem;font-weight:700">${riscos.length} riscos</span>
      <div class="rm-subtabs" style="margin-left:auto;margin-bottom:0">
        <button class="rm-subtab${_rmTab==='riscos'?' active':''}" data-tab="riscos" onclick="_rmSetTab('riscos')">🎯 Riscos</button>
        <button class="rm-subtab${_rmTab==='planos'?' active':''}" data-tab="planos" onclick="_rmSetTab('planos')">📋 Planos de Ação</button>
        <button class="rm-subtab${_rmTab==='heatmap'?' active':''}" data-tab="heatmap" onclick="_rmSetTab('heatmap')">🔢 Heat Map</button>
      </div>
    </div>
    <div class="rm-subpanel${_rmTab==='riscos'?' active':''}" data-panel="riscos">${_rmHtmlRiscos(riscos)}</div>
    <div class="rm-subpanel${_rmTab==='planos'?' active':''}" data-panel="planos">${_rmHtmlPlanos(riscos, planos)}</div>
    <div class="rm-subpanel${_rmTab==='heatmap'?' active':''}" data-panel="heatmap">${_rmHtmlHeat(riscos)}</div>
  `;
}

function _rmHtmlRiscos(riscos) {
  if(!riscos.length) return `<div style="text-align:center;padding:30px;color:var(--text-muted)">
    <div style="font-size:2rem;margin-bottom:8px">🎯</div>
    <div style="font-weight:600">Nenhum risco nesta unidade</div>
    <div style="font-size:.82rem">Clique em "+ Novo Risco" ou importe um arquivo Word</div>
  </div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Risco</th><th>Categoria</th><th>Dono</th><th>P</th><th>I</th><th>Nível</th><th>Controle</th><th>Planos</th><th>Ações</th></tr></thead>
    <tbody>${riscos.map(r=>{
      const nv=_rmNivel(r.prob,r.impacto), cor=_rmNivelCor(nv);
      const cnt=(DB.rmPlanos||[]).filter(p=>p.riscoId===r.id).length;
      return `<tr>
        <td style="font-family:'DM Mono',monospace;font-size:.76rem;color:var(--text-muted)">#${r.id}</td>
        <td style="max-width:240px;font-size:.84rem;font-weight:600">${r.desc}</td>
        <td style="font-size:.75rem">${r.cat}</td>
        <td style="font-size:.78rem">${r.setor||'—'}</td>
        <td style="text-align:center;font-weight:700">${r.prob}</td>
        <td style="text-align:center;font-weight:700">${r.impacto}</td>
        <td><span style="background:${cor};color:#fff;padding:2px 9px;border-radius:20px;font-size:.75rem;font-weight:700">${r.prob*r.impacto} ${nv}</span></td>
        <td style="font-size:.78rem;max-width:150px">${r.controle||'—'}</td>
        <td><span style="font-size:.78rem;color:var(--text-muted)">${cnt}</span>
          <button class="btn btn-outline btn-sm" style="padding:2px 7px;font-size:.71rem;margin-left:3px" onclick="rmNovoPlano(${r.id})">+ Ação</button>
        </td>
        <td style="white-space:nowrap">
          <button class="btn btn-outline btn-sm" onclick="rmEditRisco(${r.id})">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="rmDelRisco(${r.id})">🗑</button>
        </td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

function _rmHtmlPlanos(riscos, planos) {
  if(!planos.length) return `<div style="text-align:center;padding:30px;color:var(--text-muted)">
    <div style="font-size:2rem;margin-bottom:8px">📋</div>
    <div style="font-weight:600">Nenhum plano cadastrado</div>
    <div style="font-size:.82rem">Abra a aba Riscos e clique em "+ Ação" em um risco</div>
  </div>`;
  return riscos.filter(r=>(DB.rmPlanos||[]).some(p=>p.riscoId===r.id)).map(r=>{
    const rPlanos=(DB.rmPlanos||[]).filter(p=>p.riscoId===r.id);
    const nv=_rmNivel(r.prob,r.impacto), cor=_rmNivelCor(nv);
    return `<div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;padding-bottom:5px;border-bottom:2px solid ${cor}">
        <span style="background:${cor};color:#fff;padding:1px 7px;border-radius:4px;font-size:.71rem;font-weight:700">${nv}</span>
        <strong style="font-size:.88rem;color:var(--primary)">${r.desc}</strong>
      </div>
      ${rPlanos.map(pl=>{
        const dias=pl.prazo?Math.ceil((new Date(pl.prazo)-new Date())/86400000):null;
        const sc=pl.status==='Concluído'?'#10b981':pl.status==='Vencido'?'#ef4444':pl.status==='Em Andamento'?'#3b82f6':'#94a3b8';
        return `<div class="plan-card">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
            <div style="flex:1">
              <div class="plan-card-title">${pl.titulo}</div>
              <div class="plan-card-meta">
                <span>👤 ${pl.resp}</span>
                <span>📅 ${pl.prazo||'—'}</span>
                ${dias!==null?`<span style="color:${dias<0?'#ef4444':dias<=7?'#f59e0b':'#10b981'}">${dias<0?'⚠️ '+Math.abs(dias)+'d vencido':'⏳ '+dias+'d'}</span>`:''}
                <span style="background:${sc};color:#fff;padding:1px 7px;border-radius:10px;font-size:.71rem">${pl.status}</span>
              </div>
            </div>
            <div style="display:flex;gap:3px">
              <button class="btn btn-outline btn-sm" onclick="rmEditPlano(${pl.id})">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="rmDelPlano(${pl.id})">🗑</button>
            </div>
          </div>
          <div class="plan-prog"><div class="plan-prog-fill" style="width:${pl.prog||0}%;background:${sc}"></div></div>
          <div style="font-size:.71rem;color:var(--text-muted);margin-top:2px">${pl.prog||0}% concluído</div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

function _rmHtmlHeat(riscos) {
  const vs=[5,10,15], lb={5:'Baixo',10:'Médio',15:'Alto'};
  return `<div style="display:inline-block">
    <div style="font-size:.78rem;font-weight:700;color:var(--text-muted);margin-bottom:8px">Probabilidade × Impacto</div>
    <div style="display:grid;grid-template-columns:60px repeat(3,80px);gap:4px;font-size:.76rem">
      <div style="font-weight:700;color:var(--text-muted);display:flex;align-items:flex-end;padding-bottom:4px">P \ I</div>
      ${vs.map(i=>`<div style="text-align:center;font-weight:700;padding:4px 0">${lb[i]}</div>`).join('')}
      ${[...vs].reverse().map(p=>`
        <div style="font-weight:700;display:flex;align-items:center">${lb[p]}</div>
        ${vs.map(i=>{const pxi=p*i,cnt=riscos.filter(r=>r.prob===p&&r.impacto===i).length;
          const bg=pxi>=150?'#fecaca':pxi>=75?'#fef3c7':pxi>=25?'#dbeafe':'#d1fae5';
          const fc=pxi>=150?'#991b1b':pxi>=75?'#92400e':pxi>=25?'#1e3a8a':'#065f46';
          return `<div style="background:${bg};color:${fc};border-radius:6px;padding:10px 4px;text-align:center">
            <div style="font-weight:800">${pxi}</div>
            ${cnt?`<div style="font-size:.7rem">${cnt} risco${cnt>1?'s':''}</div>`:'<div style="opacity:.3;font-size:.7rem">—</div>'}
          </div>`;
        }).join('')}
      `).join('')}
    </div>
  </div>`;
}

// ── Novo Risco
function rmNovoRisco() {
  window._rmEditId = null;
  ['rm-f-desc','rm-f-cat','rm-f-setor','rm-f-controle','rm-f-obs'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  rmUpdateRiscoModalUnits();
  const un=document.getElementById('rm-f-unidade'); if(un) un.value=_rmUnit;
  const pr=document.getElementById('rm-f-prob'); if(pr) pr.value='10';
  const im=document.getElementById('rm-f-impacto'); if(im) im.value='10';
  document.getElementById('rm-modal-title').textContent='🎯 Novo Risco';
  openModal('modal-rm-risco');
}
function rmEditRisco(id) {
  const r=(DB.riscos||[]).find(x=>x.id===id); if(!r) return;
  window._rmEditId=id;
  document.getElementById('rm-f-desc').value=r.desc||'';
  document.getElementById('rm-f-cat').value=r.cat||'';
  document.getElementById('rm-f-setor').value=r.setor||'';
  rmUpdateRiscoModalUnits();
  document.getElementById('rm-f-unidade').value=r.unidade||_rmUnit;
  document.getElementById('rm-f-prob').value=r.prob||10;
  document.getElementById('rm-f-impacto').value=r.impacto||10;
  document.getElementById('rm-f-controle').value=r.controle||'';
  document.getElementById('rm-f-obs').value=r.obs||'';
  document.getElementById('rm-modal-title').textContent='✏️ Editar Risco';
  openModal('modal-rm-risco');
}
function rmSalvarRisco() {
  const data={
    desc:document.getElementById('rm-f-desc').value.trim(),
    cat:document.getElementById('rm-f-cat').value.trim(),
    setor:document.getElementById('rm-f-setor').value.trim(),
    unidade:document.getElementById('rm-f-unidade').value,
    prob:parseInt(document.getElementById('rm-f-prob').value)||10,
    impacto:parseInt(document.getElementById('rm-f-impacto').value)||10,
    controle:document.getElementById('rm-f-controle').value.trim(),
    obs:document.getElementById('rm-f-obs').value.trim(),
    filial:'Todas',
  };
  if(!data.desc){alert('Informe a descrição.');return;}
  if(!DB.riscos) DB.riscos=[];
  if(window._rmEditId) Object.assign(DB.riscos.find(r=>r.id===window._rmEditId),data);
  else { DB._ids.risco=(DB._ids.risco||20)+1; DB.riscos.push({id:DB._ids.risco,...data}); }
  const _saved = window._rmEditId ? DB.riscos.find(r=>r.id===window._rmEditId) : DB.riscos[DB.riscos.length-1];
  closeModal('modal-rm-risco');
  saveLocalCache(); renderMapaRisco();
  if(_saved) sbSaveRisco(_saved).then(()=>setSaveIndicator('☁️ Risco salvo na nuvem','var(--accent)'));
}
function rmDelRisco(id) {
  if(!confirm('Excluir risco e planos vinculados?')) return;
  const planosToDelete = (DB.rmPlanos||[]).filter(p=>p.riscoId===id).map(p=>p.id);
  DB.riscos=(DB.riscos||[]).filter(r=>r.id!==id);
  DB.rmPlanos=(DB.rmPlanos||[]).filter(p=>p.riscoId!==id);
  saveLocalCache(); renderMapaRisco();
  sbDeleteRisco(id);
  planosToDelete.forEach(pid => sbDeleteRmPlano(pid));
  setSaveIndicator('☁️ Risco removido da nuvem','var(--accent)');
}
// ── Planos
function rmNovoPlano(riscoId) {
  window._rmEditPlanoId=null; window._rmPlanoRiscoId=riscoId;
  ['rm-f-plano-titulo','rm-f-plano-resp'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  document.getElementById('rm-f-plano-prazo').value='';
  document.getElementById('rm-f-plano-tipo').value='Preventiva';
  document.getElementById('rm-f-plano-status').value='Não Iniciado';
  document.getElementById('rm-f-plano-prog').value='0';
  const pv=document.getElementById('rm-plano-prog-val'); if(pv) pv.textContent='0%';
  const r=(DB.riscos||[]).find(x=>x.id===riscoId);
  document.getElementById('rm-modal-plano-risco').textContent=r?r.desc:'';
  openModal('modal-rm-plano');
}
function rmEditPlano(id) {
  const pl=(DB.rmPlanos||[]).find(x=>x.id===id); if(!pl) return;
  window._rmEditPlanoId=id; window._rmPlanoRiscoId=pl.riscoId;
  document.getElementById('rm-f-plano-titulo').value=pl.titulo||'';
  document.getElementById('rm-f-plano-resp').value=pl.resp||'';
  document.getElementById('rm-f-plano-prazo').value=pl.prazo||'';
  document.getElementById('rm-f-plano-tipo').value=pl.tipo||'Preventiva';
  document.getElementById('rm-f-plano-status').value=pl.status||'Não Iniciado';
  document.getElementById('rm-f-plano-prog').value=pl.prog||0;
  const pv=document.getElementById('rm-plano-prog-val'); if(pv) pv.textContent=(pl.prog||0)+'%';
  const r=(DB.riscos||[]).find(x=>x.id===pl.riscoId);
  document.getElementById('rm-modal-plano-risco').textContent=r?r.desc:'';
  openModal('modal-rm-plano');
}
function rmSalvarPlano() {
  const data={
    riscoId:window._rmPlanoRiscoId,
    titulo:document.getElementById('rm-f-plano-titulo').value.trim(),
    resp:document.getElementById('rm-f-plano-resp').value.trim(),
    prazo:document.getElementById('rm-f-plano-prazo').value,
    tipo:document.getElementById('rm-f-plano-tipo').value,
    status:document.getElementById('rm-f-plano-status').value,
    prog:parseInt(document.getElementById('rm-f-plano-prog').value)||0,
  };
  if(!data.titulo){alert('Informe o título.');return;}
  if(!DB.rmPlanos) DB.rmPlanos=[];
  if(window._rmEditPlanoId) Object.assign(DB.rmPlanos.find(p=>p.id===window._rmEditPlanoId),data);
  else { DB._ids.rmPlano=(DB._ids.rmPlano||17)+1; DB.rmPlanos.push({id:DB._ids.rmPlano,...data}); }
  const _savedPl = window._rmEditPlanoId ? DB.rmPlanos.find(p=>p.id===window._rmEditPlanoId) : DB.rmPlanos[DB.rmPlanos.length-1];
  closeModal('modal-rm-plano');
  _rmTab='planos'; saveLocalCache(); renderMapaRisco();
  if(_savedPl) sbSaveRmPlano(_savedPl).then(()=>setSaveIndicator('☁️ Plano salvo na nuvem','var(--accent)'));
}
function rmDelPlano(id) {
  if(!confirm('Excluir plano?')) return;
  DB.rmPlanos=(DB.rmPlanos||[]).filter(p=>p.id!==id);
  saveLocalCache(); renderMapaRisco();
  sbDeleteRmPlano(id);
  setSaveIndicator('☁️ Plano removido da nuvem','var(--accent)');
}
// ── Import Word
// ── Import Word helpers
let _rmPendingFile = null;

function rmToggleImport() {
  const w = document.getElementById('rm-import-wrap');
  if(!w) return;
  const open = w.style.display !== 'none';
  w.style.display = open ? 'none' : '';
  // Close units panel if open
  const u = document.getElementById('rm-units-wrap');
  if(u && !open) u.style.display = 'none';
  if(!open) rmPopulateImportUnitSel();
}

function rmToggleUnitsPanel() {
  const u = document.getElementById('rm-units-wrap');
  if(!u) return;
  const open = u.style.display !== 'none';
  u.style.display = open ? 'none' : '';
  // Close import panel if open
  const w = document.getElementById('rm-import-wrap');
  if(w && !open) w.style.display = 'none';
  if(!open) rmRenderUnitsList();
}

function rmPopulateImportUnitSel() {
  const sel = document.getElementById('rm-import-unit-sel');
  if(!sel) return;
  sel.innerHTML = RM_UNITS.map(u =>
    `<option value="${u.id}">${u.icon} ${u.id}</option>`
  ).join('');
  // Default to current active unit
  sel.value = _rmUnit || RM_UNITS[0].id;
}

function rmSetFileAndPreview(file) {
  if(!file) return;
  _rmPendingFile = file;
  const nameEl = document.getElementById('rm-file-name');
  if(nameEl) nameEl.textContent = '📄 ' + file.name;
  const btn = document.getElementById('rm-import-btn');
  if(btn) { btn.disabled = false; btn.style.opacity = '1'; }
  const log = document.getElementById('rm-import-log');
  if(log) log.innerHTML = `<span style="color:var(--text-muted)">Arquivo pronto. Escolha a unidade e clique em Importar.</span>`;
}

async function rmProcessWord() {
  const file = _rmPendingFile;
  if(!file) { alert('Selecione um arquivo primeiro.'); return; }
  const unidade = (document.getElementById('rm-import-unit-sel')||{}).value || _rmUnit;
  const skipDup = document.getElementById('rm-import-skip-dup')?.checked !== false;
  const clearUnit = document.getElementById('rm-import-clear-unit')?.checked === true;
  const log = document.getElementById('rm-import-log');
  const btn = document.getElementById('rm-import-btn');
  if(btn) { btn.disabled=true; btn.textContent='⏳ Importando...'; }
  if(log) log.innerHTML='<span style="color:var(--text-muted)">⏳ Lendo arquivo...</span>';
  try {
    if(typeof JSZip==='undefined') {
      await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
    }
    const buf = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file('word/document.xml').async('string');
    // Extract table rows correctly: find each <w:tr> and within it extract text from <w:t> tags per cell
    const rows = [];
    // Split XML into table rows
    const trParts = xml.split(/<w:tr\b/);
    for(let ti = 1; ti < trParts.length; ti++) {
      const trXml = trParts[ti].split('</w:tr>')[0];
      // Split into cells
      const tcParts = trXml.split(/<w:tc\b/);
      const cellTexts = [];
      for(let ci = 1; ci < tcParts.length; ci++) {
        const tcXml = tcParts[ci].split('</w:tc>')[0];
        // Extract all <w:t> text within this cell
        const tMatches = tcXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
        const cellText = tMatches
          .map(t => t.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''))
          .join('')
          .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&apos;/g,"'").replace(/&quot;/g,'"')
          .trim();
        if(cellText) cellTexts.push(cellText);
      }
      if(cellTexts.length > 1) rows.push(cellTexts.join('\t'));
    }
    // Also extract paragraph headings (outside tables) for section detection
    const paraMatches = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) || [];
    const headings = paraMatches.map(p => {
      const ts = p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
      return ts.map(t => t.replace(/<w:t[^>]*>/,'').replace(/<\/w:t>/,'')).join('').trim();
    }).filter(h => h.length > 3);
    const txt = headings.join('\n') + '\n' + rows.join('\n');
    // Clear existing risks for this unit if requested
    if(clearUnit) {
      DB.riscos = (DB.riscos||[]).filter(r => r.unidade !== unidade);
    }
    const cnt = _rmParseWord(txt, unidade, skipDup);
    if(log) log.innerHTML=`<span style="color:var(--accent)">✅ ${cnt} risco(s) importado(s) para <strong>${unidade}</strong></span>`;
    // Reset file state
    _rmPendingFile = null;
    const nameEl = document.getElementById('rm-file-name');
    if(nameEl) nameEl.textContent = 'Arraste o arquivo .docx aqui';
    if(btn) { btn.disabled=true; btn.textContent='📥 Importar para a Unidade'; btn.style.opacity='.5'; }
    document.getElementById('rm-import-wrap').style.display='none';
    _rmUnit=unidade; _rmTab='riscos';
    renderMapaRisco(); saveLocalCache();
    // Sync imported risks to Supabase
    if(USE_SUPABASE) {
      const imported = (DB.riscos||[]).filter(r=>r.unidade===unidade&&r.obs==='Importado de Word');
      Promise.all(imported.map(r=>sbSaveRisco(r)))
        .then(()=>setSaveIndicator('☁️ '+imported.length+' riscos salvos na nuvem','var(--accent)'))
        .catch(e=>console.warn('sync riscos:', e));
    }
  } catch(e) {
    if(log) log.innerHTML=`<span style="color:var(--danger)">❌ Erro: ${e.message}</span>`;
    if(btn) { btn.disabled=false; btn.textContent='📥 Importar para a Unidade'; btn.style.opacity='1'; }
  }
}

function _rmParseWord(txt, unidade, skipDup=true) {
  if(!DB.riscos) DB.riscos = [];
  let count = 0;

  // txt has two parts:
  // 1. Paragraph headings (newline separated)
  // 2. Table rows where cells are tab-separated: "01\tRisco desc\tCategoria\tDono\t10\t15\t150\tMitigar"
  //    or "01\tRisco desc\tCategoria\tRelacionado\t10\t15\t150\tDono"

  const lines = txt.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  const skipStarters = ['Manter','Realizar','Executar','Definir','Implementar','Revisar','Adotar',
    'Acionar','Padronizar','Treinar','Submeter','Aprovar','Classificar','Monitorar','Bloquear',
    'Suspender','Integrar','Controlar','Conciliar','Recuperar','Ativar','Atender','Negociar',
    'Escalar','Comunicar','Verificar','Garantir','Assegurar','Documentar','Auditar','Contratar',
    'Emitir','Elaborar','Implantar','Tornar','Reportar','Estabelecer','Migrar','Arquitetura',
    'Defesa','Campanhas','Backups','Patches','Quarentena','Investigações','Rollback',
    'Mapear','Priorização','Avaliação de risco','Due diligence','Plano de','Política de',
    'Segregação','Checagem','Canal de','Procedimento','Integração RH','Controle de acesso',
    'Conciliação','Auditoria de','Criptografia','Classificação da','Ritos','Modelo padrão',
    'Calendário de','Revisão por','Gestão de ciclo','Infraestrutura redundante','Gestão de identidades'];

  // Track seen IDs to avoid importing duplicate numbered rows (actions also use 1,2,3...)
  // Only accept rows where ID resets to small numbers in the summary section context
  let lastId = 0; let summaryDone = false; const seenDescs = new Set();

  for(const line of lines) {
    // Split by tab — table rows have cells separated by tabs
    const cells = line.split('\t').map(c => c.trim()).filter(c => c.length > 0);

    // Risk row: first cell is a 1-2 digit ID, second cell is the risk description
    if(cells.length < 2) continue;
    if(!cells[0].match(/^\d{1,2}$/)) continue;
    const idNum = parseInt(cells[0]);
    const desc = cells[1];
    if(!desc || desc.length < 8) continue;

    // Skip header rows
    if(['ID','Id','Risco','Ação preventiva','Ação de contingência','Ação','Responsável',
        'Evidência','Monitoramento','Acompanhamento'].includes(desc)) continue;

    // Skip action verb rows
    if(skipStarters.some(v => desc.startsWith(v))) continue;

    // Skip metadata rows
    if(/^(Data|Versão|Descrição|Classificação|Probabilidade|Impacto|Nível|Prob|P\\\\|P\\\\ I)/i.test(desc)) continue;

    // KEY FILTER: A real risk row MUST have P and I values (5, 10 or 15) OR text (Baixo/Médio/Alto)
    // AND must have at least 4 cells (ID, desc, category, something, P, I...)
    // Action rows typically have only 2-3 cells: ID, action text, responsible
    const pMap = {'Baixo':5,'Médio':10,'Alto':15};
    const numCells = cells.filter(c => ['5','10','15'].includes(c));
    const textVals = cells.filter(c => pMap[c] !== undefined);
    const hasPxI = numCells.length >= 2 || textVals.length >= 2;

    // If no P×I found AND row has < 4 cells, it's likely an action row — skip
    if(!hasPxI && cells.length < 4) continue;

    // Also skip if id resets to 1 after we already found risks (action sub-tables restart at 1)
    if(summaryDone) continue;

    let prob = 10, impacto = 10;
    if(numCells.length >= 2) {
      prob = parseInt(numCells[0]); impacto = parseInt(numCells[1]);
    } else if(textVals.length >= 2) {
      prob = pMap[textVals[0]]; impacto = pMap[textVals[1]];
    }

    // If ID goes back down to 1 after being higher, we left the summary table
    if(idNum === 1 && lastId > 1 && count > 0) { summaryDone = true; continue; }
    lastId = idNum;

    // Extract category (cell[2] usually)
    let cat = '', setor = '';
    for(let ci = 2; ci < Math.min(cells.length, 6); ci++) {
      const c = cells[ci];
      if(!c || c.length < 3) continue;
      if(['5','10','15','25','50','75','100','150','225','Mitigar','Aceitar','Transferir','Evitar'].includes(c)) continue;
      if(/^\d+$/.test(c)) continue;
      if(!cat) cat = c.slice(0, 80);
      else if(!setor) { setor = c.slice(0, 80); break; }
    }

    // Dup check by description prefix
    const descKey = desc.slice(0,25).toLowerCase();
    if(seenDescs.has(descKey)) continue;
    const isDup = (DB.riscos||[]).some(r =>
      r.unidade===unidade && r.desc.slice(0,25).toLowerCase()===descKey
    );
    if(skipDup && isDup) continue;
    seenDescs.add(descKey);

    DB._ids.risco = (DB._ids.risco || 20) + 1;
    DB.riscos.push({
      id: DB._ids.risco,
      desc: desc.slice(0, 220),
      cat: cat || 'Ver documento',
      setor: setor || 'Ver documento',
      unidade, filial: 'Todas',
      prob, impacto,
      controle: 'Ver documento',
      obs: 'Importado de Word'
    });
    count++;
  }

  return count;
}

// ── Gerenciar Unidades
function rmRenderUnitsList() {
  const el = document.getElementById('rm-units-list');
  if(!el) return;
  el.innerHTML = RM_UNITS.map((u,i) => {
    const cnt = (DB.riscos||[]).filter(r=>r.unidade===u.id).length;
    return `<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--card);border:1px solid var(--border);border-radius:8px;margin-bottom:6px">
      <span style="font-size:1.3rem">${u.icon}</span>
      <div style="flex:1">
        <div style="font-weight:700;font-size:.88rem;color:var(--primary)">${u.id}</div>
        <div style="font-size:.75rem;color:var(--text-muted)">${cnt} risco${cnt!==1?'s':''}</div>
      </div>
      <div style="width:14px;height:14px;border-radius:50%;background:${u.cor};flex-shrink:0"></div>
      ${cnt===0 ? `<button onclick="rmDeleteUnit(${i})" class="btn btn-danger btn-sm" title="Excluir unidade">🗑</button>` : `<span style="font-size:.72rem;color:var(--text-muted);padding:2px 7px;border:1px solid var(--border);border-radius:4px" title="Tem riscos — esvazie antes de excluir">🔒</span>`}
    </div>`;
  }).join('');
}


// ── Populate unit selects dynamically from RM_UNITS
function rmUpdateRiscoModalUnits() {
  const sel = document.getElementById('rm-f-unidade');
  if(!sel) return;
  const cur = sel.value;
  sel.innerHTML = RM_UNITS.map(u => `<option value="${u.id}">${u.icon} ${u.id}</option>`).join('');
  if(cur && RM_UNITS.some(u=>u.id===cur)) sel.value = cur;
  else sel.value = _rmUnit || RM_UNITS[0]?.id || 'PDV';
}

function rmUpdatePlanoModalUnits() {
  // Plano modal doesn't have a unit select but refresh risco modal
  rmUpdateRiscoModalUnits();
}

function rmAddUnit() {
  const name = (document.getElementById('rm-new-unit-name')||{}).value?.trim();
  const icon = (document.getElementById('rm-new-unit-icon')||{}).value?.trim() || '📋';
  const cor  = (document.getElementById('rm-new-unit-cor')||{}).value || '#3b82f6';
  if(!name) { alert('Informe o nome da unidade.'); return; }
  if(RM_UNITS.some(u=>u.id.toLowerCase()===name.toLowerCase())) { alert('Já existe uma unidade com esse nome.'); return; }
  RM_UNITS.push({id:name, icon, cor});
  document.getElementById('rm-new-unit-name').value='';
  document.getElementById('rm-new-unit-icon').value='';
  saveLocalCache();
  sbSaveRmUnit(RM_UNITS);
  rmRenderUnitsList();
  renderMapaRisco();
  rmPopulateImportUnitSel();
  rmUpdateRiscoModalUnits();
  rmUpdatePlanoModalUnits();
  setSaveIndicator && setSaveIndicator('✅ Unidade criada e salva','var(--accent)');
}

function rmDeleteUnit(idx) {
  const u = RM_UNITS[idx];
  if(!u) return;
  const cnt = (DB.riscos||[]).filter(r=>r.unidade===u.id).length;
  if(cnt>0) { alert('Esta unidade tem '+cnt+' risco(s) cadastrado(s). Exclua os riscos primeiro.'); return; }
  if(!confirm('Excluir a unidade "'+u.id+'"?')) return;
  RM_UNITS.splice(idx,1);
  if(_rmUnit===u.id) _rmUnit = RM_UNITS[0]?.id || 'PDV';
  saveLocalCache();
  sbSaveRmUnit(RM_UNITS);
  rmRenderUnitsList();
  renderMapaRisco();
  rmPopulateImportUnitSel();
  rmUpdateRiscoModalUnits();
  rmUpdatePlanoModalUnits();
}
// ── AI análise de riscos (stub — conecta com Gemini se chave configurada)
async function aiAnalisarRiscos() {
  const btn=document.getElementById('btn-ai-risco');
  if(btn){btn.disabled=true;btn.textContent='⏳ Analisando...';}
  const GEMINI_KEY='AIzaSyB6ZjO_Lj9AhpphMZtwUKYeQdzRWLu6Qm8';
  const GEMINI_URL='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key='+GEMINI_KEY;
  const riscos=(DB.riscos||[]);
  const lista=riscos.map(r=>`[${r.unidade||'?'}] ${r.desc} P:${r.prob} I:${r.impacto} Controle:${r.controle||'Nenhum'}`).join('\n');
  const prompt=`Você é especialista em gestão de riscos da Torre e Cia Supermercados.\nAnalise esta matriz de ${riscos.length} riscos e forneça:\n## Riscos Críticos\n## Lacunas nos Controles\n## 3 Recomendações Prioritárias\n## Score de Risco Geral: X/10\n\nRISCOS:\n${lista}\n\nResponda em português.`;
  let panel=document.getElementById('ai-risco-panel');
  if(!panel){panel=document.createElement('div');panel.id='ai-risco-panel';panel.style.cssText='position:fixed;bottom:20px;right:20px;width:480px;max-width:95vw;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.25);border-radius:12px;overflow:hidden;max-height:80vh;display:flex;flex-direction:column';document.body.appendChild(panel);}
  panel.style.display='flex';
  panel.innerHTML='<div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:11px 16px;display:flex;align-items:center;justify-content:space-between"><span style="color:#fff;font-weight:700;font-size:.88rem">🤖 Análise de Risco — Gemini AI</span><button onclick="this.closest(\'#ai-risco-panel\').style.display=\'none\'" style="background:rgba(255,255,255,.18);border:none;color:#fff;border-radius:50%;width:24px;height:24px;cursor:pointer">✕</button></div><div id="ai-risco-body" style="padding:16px;background:#fff;overflow-y:auto;font-size:.85rem;line-height:1.7;flex:1">⏳ Analisando...</div>';
  try {
    const r=await fetch(GEMINI_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.3,maxOutputTokens:1200}})});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const d=await r.json();
    const txt=d.candidates?.[0]?.content?.parts?.[0]?.text||'Sem resposta.';
    const body=document.getElementById('ai-risco-body');
    if(body) body.innerHTML=txt.replace(/\n/g,'<br>').replace(/## (.*?)(<br>|$)/g,'<strong style="color:var(--primary);display:block;margin:10px 0 4px">$1</strong>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
  } catch(e) {
    const body=document.getElementById('ai-risco-body');
    if(body) body.innerHTML='<span style="color:var(--danger)">❌ '+e.message+'</span>';
  }
  if(btn){btn.disabled=false;btn.innerHTML='🤖 Avaliar com IA';}
}

// Inicializar: carregar usuários extras ANTES de verificar sessão/login
(async function appInit() {
  carregarBranding(); // Carregar branding customizado
  await usersLoad(); // carrega usuários extras do localStorage/Supabase
  checkSession();
  init();
})();



