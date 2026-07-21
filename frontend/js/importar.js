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
    if (files && files[0]) processImportFile(files[0]);
}
document.addEventListener('drop', (event) => {
  const files = event.target.files;
  if (files && files[0]) processImportFile(files[0]);
});

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
  const wb = XLSX.read(buffer, {type:'array', cellDates:true, codepage: 65001});
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(ws, {defval:'', raw:true, cellDates:true});
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
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/[\xa0​]/g,'')
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
    .normalize('NFD').replace(/[̀-ͯ]/g,'');
  if(['GRAVE','GRAVISSIMA','GRAVÍSSIMA'].includes(nivel)) return nivel==='GRAVISSIMA'||nivel==='GRAVÍSSIMA'?'Gravíssima':'Grave';
  if(['MEDIO','MÉDIO'].includes(nivel)) return 'Médio';
  if(nivel==='LEVE') return 'Leve';
  // infer from tipo
  const tipo = (findCol(row,['tipo de denuncia','tipo de denúncia'])||'').toLowerCase();
  if(/fraude|desvio/.test(tipo)) return 'Grave';
  if(/assedio|assédio|discrimin/.test(tipo)) return 'Médio';
  return 'Leve';
}

function dnAutoAnon() {
  const nome = (document.getElementById('f-dn-nome')||{value:''}).value.trim();
  const tel = (document.getElementById('f-dn-tel')||{value:''}).value.trim();
  const email = (document.getElementById('f-dn-email')||{value:''}).value.trim();
  const sel = document.getElementById('f-dn-anon');
  if(sel) sel.value = (nome || tel || email) ? 'Identificada' : 'Anônima';
}

function inferAnon(row) {
  const nome  = findCol(row, ['nome (opcional)','nome opcional','nome do denunciante']);
  const tel   = findCol(row, ['numero de telefone (opcional)','número de telefone (opcional)','telefone (opcional)','telefone','celular','whatsapp']);
  const email = (() => { for(const k of Object.keys(row)) { const nk=normalizeColName(k); if(nk.includes('endereco') && nk.includes('email')) return String(row[k]||'').trim(); } return ''; })();
  if((nome && nome.trim()) || (tel && tel.trim()) || (email && email.trim())) return 'Identificada';
  return 'Anônima';
}

function parseImportDate(val) {
  if(!val) return '';
  if(val instanceof Date) return val.toISOString().split('T')[0];
  const s = String(val).trim();

  // Excel serial number (e.g. 45000)
  if(/^\d{5}(\.\d+)?$/.test(s)) {
    const d = new Date((parseInt(s)-25569)*86400*1000);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }

  // ISO YYYY-MM-DD (with or without time)
  if(/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0,10);

  // Formato com hora: DD/MM/YYYY HH:MM ou D/M/YYYY H:MM (padrão BR do Google Forms)
  // Ex: "25/11/2025 13:28", "28/11/2025 12:04", "1/3/2026 9:15"
  const mHora = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+\d{1,2}:\d{2}/);
  if(mHora) {
    const p1 = parseInt(mHora[1]);
    const p2 = parseInt(mHora[2]);
    const ano = mHora[3].length===2 ? '20'+mHora[3] : mHora[3];
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

    const dnNome = (findCol(row, ['nome (opcional)','nome opcional','nome do denunciante']) || '').trim();
    const dnTel  = (findCol(row, ['numero de telefone (opcional)','número de telefone (opcional)','telefone (opcional)','telefone','celular','whatsapp']) || '').trim();
    const dnEmail= (() => { for(const k of Object.keys(row)) { const nk=normalizeColName(k); if(nk.includes('endereco') && nk.includes('email')) return String(row[k]||'').trim(); } return ''; })();

    parsed.push({
      id, proto, isDuplicate,
      cat: tipo,
      filial: (findCol(row, ['filial']) || '').trim(),
      setor: (findCol(row, ['setor']) || '').trim(),
      data: dataStr,
      nome: dnNome,
      tel: dnTel,
      email: dnEmail,
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
