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
      <td><strong>${escapeHtml(r.f)}</strong></td>
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
      <td><strong>${r.setor?escapeHtml(r.setor):'—'}</strong></td>
      <td style="font-size:.82rem">${escapeHtml(r.filial)}</td>
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
    <td><strong style="font-family:'DM Mono',monospace;font-size:.8rem">${escapeHtml(d.proto)}</strong></td>
    <td>${formatDate(d.data)}</td>
    <td style="font-size:.82rem">${escapeHtml(d.filial)}</td>
    <td style="font-size:.82rem">${d.setor?escapeHtml(d.setor):'—'}</td>
    <td style="font-size:.82rem">${escapeHtml(d.cat)}</td>
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
      <td><strong style="font-family:'DM Mono',monospace;font-size:.78rem;white-space:nowrap">${escapeHtml(d.proto)}</strong></td>
      <td style="font-size:.78rem;max-width:130px">${escapeHtml(d.cat)}</td>
      <td style="font-size:.78rem;white-space:nowrap">${escapeHtml(d.filial)}</td>
      <td style="font-size:.78rem">${d.setor?escapeHtml(d.setor):'—'}</td>
      <td style="font-size:.78rem;white-space:nowrap">${formatDate(d.data)}</td>
      <td style="font-size:.78rem">${d.anon==='Anônima'?'🔒 Anônima':'👤 Identificada'}</td>
      <td>${perigoBadge(d.perigo)}</td>
      <td>${statusBadge(d.status)}</td>
      <td style="min-width:120px">${slaDisplay}</td>
      <td style="font-size:.78rem">${d.resp?escapeHtml(d.resp):'<span style="color:var(--text-muted)">—</span>'}</td>
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
