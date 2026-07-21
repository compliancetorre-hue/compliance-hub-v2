
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
