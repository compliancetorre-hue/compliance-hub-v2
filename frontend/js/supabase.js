// ══════════════════════════════════════════
// SUPABASE CONFIG — preencha com suas credenciais
// ══════════════════════════════════════════
// ⚠️  SUBSTITUA os valores abaixo pelos do seu projeto Supabase
// Pegue em: https://app.supabase.com → Settings → API

// ✅ URL do projeto (correta)
  // ← JÁ DEFINIDA NO INÍCIO

// Todo acesso a dados passa OBRIGATORIAMENTE pela Edge Function.
// Não existe mais fallback de leitura/escrita direto na REST do Supabase
// com a anon key: esse caminho ignorava a autorização da Edge Function e,
// se as políticas de RLS não estivessem 100% corretas no banco, permitia
// que qualquer visitante lesse/alterasse/apagasse denúncias diretamente.
// A anon key só é necessária para o Supabase rotear a chamada até a função
// (obrigatório no gateway do Supabase) — a autorização real é o x-app-token.
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodGt1YXJsc2psbmZremZteHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDkwMTQsImV4cCI6MjA5MTE4NTAxNH0.5rw_iN9_-IYyNlqaOAXdy5wpmrOcvVO-QAUEQBgl3eA';

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

// ── API helpers — todas as chamadas passam OBRIGATORIAMENTE pela Edge Function.
// Sem token de app, a chamada falha (fail-closed) em vez de cair para a REST direta.

// Helper de baixo nível — "path" já inclui a query string completa (ex: "riscos?order=id")
async function _edgeGet(path) {
  const token = getAppToken();
  if(!token) throw new Error(`${path}: sessão inválida (sem token de servidor)`);
  const r = await fetch(`${EDGE_URL}/data/${path}`, { headers: _efH() });
  if(!r.ok) {
    const txt = await r.text().catch(()=>'');
    throw new Error(`${path}: HTTP ${r.status} ${txt.slice(0,100)}`);
  }
  return r.json();
}
async function sbGet(table, params='') {
  const qs = params ? '&' + params : '';
  return _edgeGet(`${table}?order=id${qs}`);
}
async function sbInsert(table, body) { return sbUpsert(table, body); }
async function sbUpdate(table, id, body) { return sbUpsert(table, { id, ...body }); }
async function sbUpsert(table, body, _c='id') {
  const token = getAppToken();
  if(!token) throw new Error(`${table}: sessão inválida (sem token de servidor)`);
  const r = await fetch(`${EDGE_URL}/data/${table}`,
    { method:'POST', headers: _efH(), body: JSON.stringify(body) });
  if(!r.ok) {
    const txt = await r.text().catch(()=>'');
    throw new Error(`${table}: HTTP ${r.status} ${txt.slice(0,100)}`);
  }
  return r.json();
}
async function sbDelete(table, id) {
  const token = getAppToken();
  if(!token) throw new Error(`${table}: sessão inválida (sem token de servidor)`);
  const r = await fetch(`${EDGE_URL}/data/${table}?id=${id}`,
    { method:'DELETE', headers: _efH() });
  if(!r.ok) throw new Error(`sbDelete ${table}: ${r.status}`);
}
async function sbDeleteProto(proto) {
  const token = getAppToken();
  if(!token) throw new Error(`denuncias: sessão inválida (sem token de servidor)`);
  const r = await fetch(`${EDGE_URL}/data/denuncias?proto=${encodeURIComponent(proto)}`,
    { method:'DELETE', headers: _efH() });
  if(!r.ok) throw new Error(`sbDeleteProto: ${r.status}`);
}

// ── Map DB.denuncias item → Supabase row
function dnToRow(d) {
  return {
    id: d.id, proto: d.proto, cat: d.cat, filial: d.filial, setor: d.setor||'',
    data: d.data||null, anon: d.anon, perigo: d.perigo, status: d.status,
    resp: d.resp||'', relato: d.relato||'', acao_inicial: d.acaoInicial||'', obs: d.obs||'',
    conclusao: d.conclusao||'',
    denunciante_nome: d.nome||'', denunciante_tel: d.tel||'', denunciante_email: d.email||''
  };
}
function rowToDn(r) {
  let dataStr = r.data||'';
  if(dataStr && dataStr.includes('T')) dataStr = dataStr.split('T')[0];
  return {
    id: r.id, proto: r.proto, cat: r.cat, filial: r.filial, setor: r.setor||'',
    data: dataStr, anon: r.anon, perigo: r.perigo, status: r.status,
    resp: r.resp||'', relato: r.relato||'', acaoInicial: r.acao_inicial||'', obs: r.obs||'',
    conclusao: r.conclusao||'',
    nome: r.denunciante_nome||'', tel: r.denunciante_tel||'', email: r.denunciante_email||''
  };
}

// ── Load ALL data from Supabase into DB
async function loadFromSupabase() {
  try {
    showLoadingBar(true, 'Conectando ao Supabase...');

    // A Edge Function não expõe um endpoint de carga em lote — carregamos
    // cada tabela em paralelo pela mesma rota segura usada por sbGet/sbUpsert.
    const allData = await (async () => {
      const token = getAppToken();
      if(!token) throw new Error('sessão inválida (sem token de servidor)');
      const [filiaisR, riscosR, controlesR, planosR, denunciasR, fbR, agendaR, rmR, settingsR] = await Promise.all([
        _edgeGet('filiais?order=id'),
        _edgeGet('riscos?order=id'),
        _edgeGet('controles?order=id'),
        _edgeGet('planos?order=id'),
        _edgeGet('denuncias?order=id'),
        // A Edge Function faz .eq(chave,valor) puro por parâmetro — não
        // entende a sintaxe "campo=eq.valor" do PostgREST. Usar "id=eq.main"
        // aqui procurava literalmente por um id igual à string "eq.main",
        // que nunca existe (o registro salvo por sbSaveFbBoards tem
        // id:"main"), então o Flow Board nunca carregava do Supabase em
        // outro navegador — só parecia salvar porque o cache local
        // (localStorage) escondia o problema no mesmo navegador.
        _edgeGet('fbboards?id=main'),
        _edgeGet('agenda?order=data'),
        _edgeGet('rm_planos?order=id'),
        _edgeGet('settings?select=*')
      ]);
      return {
        filiais: filiaisR||[], riscos: riscosR||[], controles: controlesR||[],
        planos: planosR||[], denRows: denunciasR||[], fbRows: fbR||[],
        rmPlanos: rmR||[], agenda: agendaR||[], settings: settingsR||[]
      };
    })();
    const { filiais, riscos, controles, planos, denRows, fbRows } = allData;
    // Restore extra data from load-all
    if(allData.rmPlanos?.length > 0) DB.rmPlanos = allData.rmPlanos.map(p=>({id:p.id,riscoId:p.risco_id,titulo:p.titulo,resp:p.resp||'',prazo:p.prazo||'',tipo:p.tipo||'Preventiva',status:p.status||'Não Iniciado',prog:p.prog||0,andamento:p.andamento||''}));
    if(allData.agenda?.length > 0) DB.agenda = allData.agenda.map(e=>({id:e.id,titulo:e.titulo,tipo:e.tipo||'Outro',data:e.data,hora:e.hora||'',horaFim:e.hora_fim||'',local:e.local||'',resp:e.resp||'',desc:e.descricao||'',lembrete:e.lembrete||'',recorrencia:e.recorrencia||'nenhuma'}));
    if(allData.settings?.length > 0) { const units = allData.settings.find(s=>s.key==='rm_units'); if(units?.value) { try { const su=JSON.parse(units.value); if(Array.isArray(su)) su.forEach(u=>{ if(u.id&&!RM_UNITS.some(x=>x.id===u.id)) RM_UNITS.push(u); }); } catch(e){} } }
    if(allData.settings?.length > 0) { const textos = allData.settings.find(s=>s.key==='ui_text_overrides'); if(textos?.value) { try { uiOverrides = JSON.parse(textos.value) || {}; aplicarUiOverrides(); } catch(e){} } }

    // ── FILIAIS: Supabase é a fonte de verdade se tiver dados, senão mantém built-in
    if(filiais.length > 0) {
      DB.filiais = filiais.map(f => ({
        id:f.id, nome:f.nome, cnpj:f.cnpj||'', cidade:f.cidade||'',
        resp:f.resp||'', respTel:f.resp_tel||'',
        gerente:f.gerente||'', gerenteTel:f.gerente_tel||'',
        sub:f.sub||'', subTel:f.sub_tel||'',
        setor:f.setor||'', setores:f.setores||''
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
  const row = {
    id:f.id, nome:f.nome, cnpj:f.cnpj||'', cidade:f.cidade||'',
    resp:f.resp||'', resp_tel:f.respTel||'',
    gerente:f.gerente||'', gerente_tel:f.gerenteTel||'',
    sub:f.sub||'', sub_tel:f.subTel||'',
    setor:f.setor||'', setores:f.setores||''
  };
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
  // rmPlanos table: id, risco_id, titulo, resp, prazo, tipo, status, prog, andamento
  const row = { id:p.id, risco_id:p.riscoId, titulo:p.titulo, resp:p.resp||'', prazo:p.prazo||null, tipo:p.tipo||'Preventiva', status:p.status||'Não Iniciado', prog:p.prog||0, andamento:p.andamento||'' };
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
    // SEGURANÇA: denúncias NÃO são gravadas no localStorage. Elas contêm PII
    // do denunciante (nome/telefone/e-mail) e o relato — dado sensível que não
    // pode ficar em texto claro no disco do navegador. Ficam só em memória
    // durante a sessão e são sempre recarregadas do Supabase após o login.
    localStorage.setItem(DB_KEY, JSON.stringify({
      filiais:DB.filiais, riscos:DB.riscos, rmPlanos:DB.rmPlanos||[],
      rmUnits:RM_UNITS,
      controles:DB.controles, planos:DB.planos,
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
    // SEGURANÇA: denúncias não são mais lidas do cache local (ver
    // saveLocalCache). Se um cache antigo ainda tiver denúncias gravadas em
    // texto claro, purga agora regravando o cache sem elas.
    if(s.denuncias) { try { delete s.denuncias; localStorage.setItem(DB_KEY, JSON.stringify(s)); } catch(e){} }
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

// SEGURANÇA: em TODO carregamento da página (mesmo deslogado), remove do cache
// em disco qualquer denúncia que tenha sido gravada em texto claro por versões
// anteriores do app. Roda antes do login porque loadLocalCache() agora só é
// chamado com sessão válida — sem isto, o cache legado ficaria acessível a quem
// abrisse o localStorage direto, sem autenticar.
(function purgeLegacyDenunciasCache() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if(!raw) return;
    const s = JSON.parse(raw);
    if(s && s.denuncias) { delete s.denuncias; localStorage.setItem(DB_KEY, JSON.stringify(s)); }
  } catch(e) {}
})();
