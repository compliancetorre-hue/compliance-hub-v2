// ══════════════════════════════════════════
// DASHBOARD DRILLDOWN
// ══════════════════════════════════════════
function openDashDrill(type) {
  const panel  = document.getElementById('dash-drilldown');
  const thead  = document.getElementById('dash-dd-thead').querySelector('tr');
  const tbody  = document.getElementById('dash-dd-tbody');
  const icon_el  = document.getElementById('dash-dd-icon');
  const title_el = document.getElementById('dash-dd-title');
  const count_el = document.getElementById('dash-dd-count');
  const header   = document.getElementById('dash-dd-header');

  let rows = '', icon = '', title = '', color = 'var(--primary)', count = 0;

  if(type === 'controles') {
    // Controles Monitorados → mostra todos os riscos cadastrados
    icon = '🛡️'; title = 'Riscos Monitorados'; color = 'var(--accent)';
    const nvCor = {'Crítico':'#ef4444','Alto':'#f59e0b','Médio':'#3b82f6','Baixo':'#10b981'};
    const items = (DB.riscos||[]).slice().sort((a,b) => (b.prob*b.impacto)-(a.prob*a.impacto));
    count = items.length;
    thead.innerHTML = '<th>Risco</th><th>Unidade</th><th>Categoria</th><th>Dono / Setor</th><th>P</th><th>I</th><th>Nível</th><th>Controle</th>';
    rows = items.length ? items.map(r => {
      const nv = nivelRisco(r.prob, r.impacto);
      return `<tr>
        <td style="font-weight:700;font-size:.84rem;max-width:220px">${r.desc||'—'}</td>
        <td style="font-size:.78rem">${r.unidade||r.filial||'—'}</td>
        <td style="font-size:.78rem">${r.cat||'—'}</td>
        <td style="font-size:.78rem">${r.setor||'—'}</td>
        <td style="text-align:center;font-weight:700">${r.prob}</td>
        <td style="text-align:center;font-weight:700">${r.impacto}</td>
        <td><span style="background:${nvCor[nv]}22;color:${nvCor[nv]};padding:2px 8px;border-radius:10px;font-size:.73rem;font-weight:700">${nv}</span></td>
        <td style="font-size:.75rem;max-width:180px">${r.controle||'—'}</td>
      </tr>`;
    }).join('') : '<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">Nenhum risco cadastrado.</td></tr>';

  } else if(type === 'riscos') {
    // Planos de Ação → mostra todos os rmPlanos do mapeamento de risco
    icon = '📋'; title = 'Planos de Ação'; color = 'var(--warn)';
    const items = (DB.rmPlanos||[]).slice().sort((a,b) => (a.prazo||'').localeCompare(b.prazo||''));
    count = items.length;
    const stCor = {'Não Iniciado':'#94a3b8','Em Andamento':'#3b82f6','Concluído':'#00c49a','Vencido':'#ef4444'};
    thead.innerHTML = '<th>Plano de Ação</th><th>Responsável</th><th>Prazo</th><th>Status</th><th>Progresso</th>';
    rows = items.length ? items.map(p => {
      const st = p.status||'Não Iniciado';
      return `<tr>
        <td style="font-weight:700;font-size:.84rem;max-width:240px">${p.titulo||'—'}</td>
        <td style="font-size:.78rem">${p.resp||'—'}</td>
        <td>${prazoChip(p.prazo)}</td>
        <td><span style="background:${stCor[st]||'#94a3b8'}22;color:${stCor[st]||'#94a3b8'};padding:2px 8px;border-radius:10px;font-size:.73rem;font-weight:700">${st}</span></td>
        <td style="min-width:80px">${progBar(p.prog||0)}</td>
      </tr>`;
    }).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhum plano cadastrado.</td></tr>';

  } else if(type === 'acoes') {
    // Ações Vencidas → rmPlanos com prazo já vencido (data < hoje)
    icon = '🚨'; title = 'Ações e Planos Vencidos'; color = '#ef4444';
    const _hoje = new Date(); _hoje.setHours(0,0,0,0);
    const items = (DB.rmPlanos||[])
      .filter(p => p.prazo && new Date(p.prazo) < _hoje && p.status !== 'Concluído')
      .sort((a,b) => (a.prazo||'').localeCompare(b.prazo||''));
    count = items.length;
    thead.innerHTML = '<th>Plano / Ação</th><th>Responsável</th><th>Prazo</th><th>Status</th><th>Progresso</th>';
    rows = items.length ? items.map(p => {
      const st = p.status||'Não Iniciado';
      const stCor = {'Não Iniciado':'#94a3b8','Em Andamento':'#3b82f6','Concluído':'#00c49a','Vencido':'#ef4444'};
      return `<tr>
        <td style="font-weight:700;font-size:.84rem;max-width:240px">${p.titulo||'—'}</td>
        <td style="font-size:.78rem">${p.resp||'—'}</td>
        <td>${prazoChip(p.prazo)}</td>
        <td><span style="background:${stCor[st]||'#94a3b8'}22;color:${stCor[st]||'#94a3b8'};padding:2px 8px;border-radius:10px;font-size:.73rem;font-weight:700">${st}</span></td>
        <td style="min-width:80px">${progBar(p.prog||0)}</td>
      </tr>`;
    }).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhuma ação vencida.</td></tr>';
  }

  icon_el.textContent  = icon;
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
  // ── KPIs
  document.getElementById('dash-total-controles').textContent = (DB.riscos||[]).length;
  const totalPlanos = (DB.rmPlanos||[]).length;
  document.getElementById('dash-riscos-altos').textContent = totalPlanos;
  const _hoje = new Date(); _hoje.setHours(0,0,0,0);
  const acVenc = (DB.rmPlanos||[]).filter(p => p.prazo && new Date(p.prazo) < _hoje && p.status !== 'Concluído').length;
  document.getElementById('dash-acoes-venc').textContent = acVenc;
  const dnAbertas = (DB.denuncias||[]).filter(d => d.status === 'Aberta').length;
  const dnAnalise = (DB.denuncias||[]).filter(d => d.status === 'Em Análise').length;
  document.getElementById('dash-denuncias').textContent = dnAbertas + dnAnalise;
  const subEl = document.getElementById('dash-denuncias-sub');
  if(subEl) subEl.textContent = dnAbertas + ' abertas · ' + dnAnalise + ' em análise';

  // ── Chart: Riscos por Nível
  const lvls = ['Crítico','Alto','Médio','Baixo'];
  const lvlColors = ['#8b5cf6','#ef4444','#f59e0b','#10b981'];
  const rCounts = lvls.map(l => (DB.riscos||[]).filter(r => nivelRisco(r.prob,r.impacto)===l).length);
  const rMax = Math.max(...rCounts, 1);
  document.getElementById('chart-riscos').innerHTML = lvls.map((l,i) =>
    `<div class="bar-row"><div class="bar-label">${l}</div><div class="bar-track"><div class="bar-fill" style="width:${rCounts[i]/rMax*100}%;background:${lvlColors[i]}"></div></div><div class="bar-val">${rCounts[i]}</div></div>`
  ).join('');

  // ── Chart: Status dos Planos de Ação (rmPlanos)
  const cStatuses = ['Não Iniciado','Em Andamento','Concluído','Vencido'];
  const cColors = ['#94a3b8','#3b82f6','#00c49a','#ef4444'];
  const cCounts = cStatuses.map(s => (DB.rmPlanos||[]).filter(p => p.status===s).length);
  const cMax = Math.max(...cCounts, 1);
  document.getElementById('chart-controles').innerHTML = cStatuses.map((s,i) =>
    `<div class="bar-row"><div class="bar-label">${s}</div><div class="bar-track"><div class="bar-fill" style="width:${cCounts[i]/cMax*100}%;background:${cColors[i]}"></div></div><div class="bar-val">${cCounts[i]}</div></div>`
  ).join('');

  // ── Chart: Planos de Ação por Status (rmPlanos)
  const pStatuses = ['Não Iniciado','Em Andamento','Concluído','Vencido'];
  const pColors = ['#94a3b8','#3b82f6','#00c49a','#ef4444'];
  const pCounts = pStatuses.map(s => (DB.rmPlanos||[]).filter(p => p.status===s).length);
  const pMax = Math.max(...pCounts, 1);
  document.getElementById('chart-planos').innerHTML = pStatuses.map((s,i) =>
    `<div class="bar-row"><div class="bar-label">${s}</div><div class="bar-track"><div class="bar-fill" style="width:${pCounts[i]/pMax*100}%;background:${pColors[i]}"></div></div><div class="bar-val">${pCounts[i]}</div></div>`
  ).join('');

  // ── Chart: Denúncias por Nível de Perigo
  const pLvls = ['Leve','Médio','Grave','Gravissima'];
  const pColors2 = ['#10b981','#f59e0b','#ef4444','#7c3aed'];
  const pCounts2 = pLvls.map(l => (DB.denuncias||[]).filter(d => d.perigo===l).length);
  const pMax2 = Math.max(...pCounts2, 1);
  document.getElementById('chart-denuncias').innerHTML = pLvls.map((l,i) =>
    `<div class="bar-row"><div class="bar-label">${l}</div><div class="bar-track"><div class="bar-fill" style="width:${pCounts2[i]/pMax2*100}%;background:${pColors2[i]}"></div></div><div class="bar-val">${pCounts2[i]}</div></div>`
  ).join('');

  // ── Tabela: Riscos Críticos e Altos (substitui "Controles com Prazo Vencendo")
  const nvCor = {'Crítico':'#ef4444','Alto':'#f59e0b','Médio':'#3b82f6','Baixo':'#10b981'};
  const riscosCrit = (DB.riscos||[])
    .filter(r => ['Crítico','Alto'].includes(nivelRisco(r.prob,r.impacto)))
    .sort((a,b) => (b.prob*b.impacto)-(a.prob*a.impacto)).slice(0,5);
  const tbCtrl = document.getElementById('dash-controles-urgentes');
  if(riscosCrit.length === 0) {
    document.getElementById('dash-empty-ctrl').classList.remove('hidden');
    tbCtrl.innerHTML = '';
  } else {
    document.getElementById('dash-empty-ctrl').classList.add('hidden');
    tbCtrl.innerHTML = riscosCrit.map(r => {
      const nv = nivelRisco(r.prob,r.impacto);
      return `<tr><td><strong>${r.desc||'—'}</strong></td><td>${r.unidade||r.filial||'—'}</td><td><span style="background:${nvCor[nv]}22;color:${nvCor[nv]};padding:2px 8px;border-radius:10px;font-size:.73rem;font-weight:700">${nv}</span></td><td style="font-size:.75rem">${r.cat||'—'}</td></tr>`;
    }).join('');
  }

  // ── Tabela: Planos de Ação com Prazo Próximo (substitui "Ações com Prazo Próximo")
  const acUrg = (DB.rmPlanos||[]).filter(p => {
    const diff = diasAte(p.prazo);
    return diff !== null && diff <= 30 && p.status !== 'Concluído';
  }).sort((a,b) => diasAte(a.prazo)-diasAte(b.prazo)).slice(0,5);
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
