    <div class="dd2-card">
      <div class="dd2-card-title">&#9989; Checklist de Qualidade</div>
      <div class="dd2-checklist" id="dd2-checklist-content"></div>
    </div>
  </div>
</div>
`;}


// ═══════════════════════════════════════════════════════
// DUE DILIGENCE 2 — JAVASCRIPT
// ═══════════════════════════════════════════════════════

// DD2_API removido — chamadas migradas para APIs públicas diretas
const DD2_DATAJUD_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const DD2_TRIBUNAIS = [
  {sigla:'TJSP',nome:'TJSP'},
  {sigla:'TJRJ',nome:'TJRJ'},
  {sigla:'TJMG',nome:'TJMG'},
  {sigla:'TJRS',nome:'TJRS'},
  {sigla:'TJPR',nome:'TJPR'},
  {sigla:'TJSC',nome:'TJSC'},
  {sigla:'TJBA',nome:'TJBA'},
  {sigla:'TJGO',nome:'TJGO'},
  {sigla:'TJPE',nome:'TJPE'},
  {sigla:'TJCE',nome:'TJCE'},
  {sigla:'TJAM',nome:'TJAM'},
  {sigla:'TJMT',nome:'TJMT'},
  {sigla:'TJMS',nome:'TJMS'},
  {sigla:'TJPA',nome:'TJPA'},
  {sigla:'TJDF',nome:'TJDF'},
  {sigla:'TST',nome:'TST'},
  {sigla:'STJ',nome:'STJ'}
];

let dd2JudicialData = [];
let dd2CadastralData = null;
let dd2SancoesData = {ceis:[],cnep:[]};
let dd2PepData = [];
let dd2MidiaData = [];

function dd2FormatDoc(input){
  const tipo = document.getElementById('dd2-tipo').value;
  let v = input.value.replace(/\D/g,'');
  if(tipo==='cnpj'){
    v=v.substring(0,14);
    v=v.replace(/(\d{2})(\d)/,'$1.$2');
    v=v.replace(/(\d{3})(\d)/,'$1.$2');
    v=v.replace(/(\d{3})(\d)/,'$1/$2');
    v=v.replace(/(\d{4})(\d)/,'$1-$2');
  } else {
    v=v.substring(0,11);
    v=v.replace(/(\d{3})(\d)/,'$1.$2');
    v=v.replace(/(\d{3})(\d)/,'$1.$2');
    v=v.replace(/(\d{3})(\d)/,'$1-$2');
  }
  input.value=v;
}

function dd2GetToken(){
  const t=localStorage.getItem('ch_token');
  return t||null;
}

function dd2SetStep(id,state){
  const el=document.getElementById('dd2-step-'+id);
  if(!el)return;
  el.className='dd2-step '+state;
}

function dd2SetProgress(pct){
  const el=document.getElementById('dd2-prog-fill');
  if(el)el.style.width=pct+'%';
}

async function dd2Iniciar(){
  const doc=document.getElementById('dd2-doc').value.replace(/\D/g,'');
  const tipo=document.getElementById('dd2-tipo').value;
  if(doc.length<11){alert('Informe um documento válido.');return;}
  const token=dd2GetToken();
  const scCad=document.getElementById('dd2-sc-cadastral').checked;
  const scFis=document.getElementById('dd2-sc-fiscal').checked;
  const scJud=document.getElementById('dd2-sc-judicial').checked;
  const scSan=document.getElementById('dd2-sc-sancoes').checked;
  const scPep=document.getElementById('dd2-sc-pep').checked;
  const scMid=document.getElementById('dd2-sc-midia').checked;
  document.getElementById('dd2-progress').style.display='block';
  document.getElementById('dd2-report').style.display='none';
  document.getElementById('dd2-sec-midia').style.display=scMid?'block':'none';
  dd2SetProgress(5);
  dd2JudicialData=[];dd2CadastralData=null;dd2SancoesData={ceis:[],cnep:[]};dd2PepData=[];dd2MidiaData=[];
  const headers={'Authorization':'Bearer '+token};
  const tasks=[];
  if(scCad&&tipo==='cnpj'){
    dd2SetStep('cadastral','active');
    tasks.push(
      fetch('https://brasilapi.com.br/api/cnpj/v1/'+doc).then(r=>r.ok?r.json():null).then(d=>{
        dd2CadastralData=d;dd2SetStep('cadastral','done');dd2SetProgress(20);
        dd2RenderCadastral(d);dd2RenderFiscal(d);
      }).catch(()=>{dd2SetStep('cadastral','error');})
    );
  } else {
    dd2SetStep('cadastral','done');dd2SetProgress(20);
    document.getElementById('dd2-cadastral-content').innerHTML='<p style="color:#64748b;font-size:.85rem">Consulta cadastral disponível apenas para CNPJ.</p>';
    document.getElementById('dd2-fiscal-content').innerHTML='<p style="color:#64748b;font-size:.85rem">Consulta fiscal disponível apenas para CNPJ.</p>';
  }
  if(scJud){
    dd2SetStep('judicial','active');
    tasks.push(
      dd2FetchJudicial(doc,headers).then(()=>{
        dd2SetStep('judicial','done');dd2SetProgress(50);
      }).catch(()=>{dd2SetStep('judicial','error');})
    );
  } else {
    dd2SetStep('judicial','done');
    document.getElementById('dd2-judicial-content').innerHTML='<p style="color:#64748b;font-size:.85rem">Consulta judicial não selecionada.</p>';
  }
  if(scSan){
    dd2SetStep('sancoes','active');
    tasks.push(
Promise.all([
          fetch('https://api.portaldatransparencia.gov.br/api-de-dados/ceis?cnpjSancionado='+doc+'&pagina=1').then(r=>r.ok?r.json():[]).catch(()=>[]),
                  fetch('https://api.portaldatransparencia.gov.br/api-de-dados/cnep?cnpjSancionado='+doc+'&pagina=1').then(r=>r.ok?r.json():[]).catch(()=>[])
                        ]).then(([ceis,cnep])=>{
                                dd2SancoesData={ceis:Array.isArray(ceis)?ceis:[],cnep:Array.isArray(cnep)?cnep:[]};
                                        dd2SetStep('sancoes','done');dd2SetProgress(65);
                                                dd2RenderSancoes(dd2SancoesData);
                                                      }).catch(()=>{dd2SetStep('sancoes','error');dd2RenderSancoes({ceis:[],cnep:[]});})
    );
  } else {
    dd2SetStep('sancoes','done');
    document.getElementById('dd2-sancoes-content').innerHTML='<p style="color:#64748b;font-size:.85rem">Consulta de sanções não selecionada.</p>';
  }
  if(scPep){
    dd2SetStep('pep','active');
    const nome=dd2CadastralData?.razao_social||dd2CadastralData?.nome||'';
    tasks.push(
      dd2FetchPep(nome,doc).then(d=>{
        dd2PepData=d;dd2SetStep('pep','done');dd2SetProgress(78);
        dd2RenderPep(d);
      }).catch(()=>{dd2SetStep('pep','error');dd2RenderPep([]);})
    );
  } else {
    dd2SetStep('pep','done');
    document.getElementById('dd2-pep-content').innerHTML='<p style="color:#64748b;font-size:.85rem">Consulta PEP não selecionada.</p>';
  }
  if(scMid){
    dd2SetStep('midia','active');
    const nome=dd2CadastralData?.razao_social||dd2CadastralData?.nome||doc;
    tasks.push(
fetch('https://corsproxy.io/?url='+encodeURIComponent('https://api.duckduckgo.com/?q='+encodeURIComponent(nome+' corrupção fraude escândalo')+'&format=json&no_html=1&skip_disambig=1')).then(r=>r.ok?r.json():null).then(d=>{
          const items=(d?.RelatedTopics||[]).filter(t=>t.FirstURL&&t.Text).map(t=>({link:t.FirstURL,title :t.Text,source:{name:'DuckDuckGo'},pubDate:'',content_text:t.Text}));
                  dd2MidiaData=items;dd2SetStep('midia','done');dd2SetProgress(88);
                          dd2RenderMidia(dd2MidiaData);
                                }).catch(()=>{dd2SetStep('midia','error');dd2RenderMidia([]);})
    );
  } else { dd2SetStep('midia','done'); }
  await Promise.allSettled(tasks);
  dd2SetStep('analise','active');
  dd2SetProgress(95);
  dd2RenderScore();
  dd2RenderTimeline();
  dd2RenderChecklist();
  dd2SetStep('analise','done');
  dd2SetProgress(100);
  const now=new Date();
  document.getElementById('dd2-export-meta').textContent='Relatório gerado em '+now.toLocaleDateString('pt-BR')+' '+now.toLocaleTimeString('pt-BR')+' — '+doc;
  document.getElementById('dd2-progress').style.display='none';
  document.getElementById('dd2-report').style.display='block';
}

async function dd2FetchJudicial(doc,headers){
  const results=[];
  const calls=DD2_TRIBUNAIS.map(t=>
    fetch('https://api-publica.datajud.cnj.jus.br/api_publica_'+t.sigla.toLowerCase()+'/_search',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'APIKey '+DD2_DATAJUD_KEY},
      body:JSON.stringify({query:{bool:{should:[{match:{numeroProcesso:doc}},{match:{cpfCnpj:doc}}]}},size:50}),
      signal:AbortSignal.timeout(15000)
    }).then(r=>r.ok?r.json():null).then(d=>{
      if(d?.hits?.hits?.length){
        d.hits.hits.forEach(h=>{const s=h._source||{};results.push({...s,_tribunal:t.sigla});});
      }
    }).catch(()=>{})
  );
  await Promise.allSettled(calls);
  dd2JudicialData=results;
  dd2RenderJudicial(results);
}

async function dd2FetchPep(nome,doc){
  if(!nome&&!doc)return[];
  const q=nome?encodeURIComponent(nome.split(' ').slice(0,3).join(' ')):doc;
  const r=await fetch('https://api.portaldatransparencia.gov.br/api-de-dados/pep?nome='+q+'&pagina=1',{signal:AbortSignal.timeout(10000)});
  if(!r.ok)return[];
  return await r.json();
}

function dd2RenderCadastral(d){
  const el=document.getElementById('dd2-cadastral-content');
  if(!d){el.innerHTML='<p style="color:#ef4444">Não foi possível obter dados cadastrais.</p>';return;}
  const r=d;
  const sit=r.situacao_cadastral||r.situacao||r.status||'—';
  const sitOk=(sit.toUpperCase().includes('ATIVA')||sit.toUpperCase().includes('REGULAR'));
  el.innerHTML=`<div class="dd2-grid-3">
    <div class="dd2-field-item"><label>CNPJ</label><span>${r.cnpj||'—'}</span></div>
    <div class="dd2-field-item"><label>Razão Social</label><span>${r.razao_social||r.nome||'—'}</span></div>
    <div class="dd2-field-item"><label>Nome Fantasia</label><span>${r.nome_fantasia||'—'}</span></div>
    <div class="dd2-field-item"><label>Situação Cadastral</label><span><span class="dd2-badge ${sitOk?'ok':'danger'}">${sit}</span></span></div>
    <div class="dd2-field-item"><label>Data de Abertura</label><span>${r.data_abertura||r.data_inicio_atividade||'—'}</span></div>
    <div class="dd2-field-item"><label>Natureza Jurídica</label><span>${r.natureza_juridica?.descricao||r.natureza_juridica||'—'}</span></div>
    <div class="dd2-field-item"><label>Porte</label><span>${r.porte?.descricao||r.porte||'—'}</span></div>
    <div class="dd2-field-item"><label>Capital Social</label><span>R$ ${Number(r.capital_social||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></div>
    <div class="dd2-field-item"><label>CNAE Principal</label><span>${r.cnae_fiscal_descricao||r.cnae_fiscal?.descricao||'—'}</span></div>
    <div class="dd2-field-item" style="grid-column:1/-1"><label>Endereço</label><span>${[r.logradouro,r.numero,r.complemento,r.bairro,r.municipio?.descricao||r.municipio,r.uf].filter(Boolean).join(', ')||'—'}</span></div>
  </div>`;
  if(r.qsa?.length){
    document.getElementById('dd2-sec-qsa').style.display='block';
    document.getElementById('dd2-qsa-content').innerHTML=`<div style="overflow-x:auto"><table class="dd2-table"><thead><tr><th>Nome</th><th>Qualificação</th><th>Faixa Etária</th></tr></thead><tbody>${r.qsa.map(s=>`<tr><td>${s.nome_socio||s.nome||'—'}</td><td>${s.qualificacao_socio?.descricao||s.qualificacao||'—'}</td><td>${s.faixa_etaria||'—'}</td></tr>`).join('')}</tbody></table></div>`;
  }
}

function dd2RenderFiscal(d){
  const el=document.getElementById('dd2-fiscal-content');
  if(!d){el.innerHTML='<p style="color:#ef4444">Dados fiscais não disponíveis.</p>';return;}
  const sit=d.situacao_cadastral||d.situacao||d.status||'—';
  const sitOk=(sit.toUpperCase().includes('ATIVA')||sit.toUpperCase().includes('REGULAR'));
  el.innerHTML=`<div style="overflow-x:auto"><table class="dd2-table"><thead><tr><th>Verificação</th><th>Resultado</th><th>Status</th></tr></thead><tbody>
    <tr><td>Situação na Receita Federal</td><td>${sit}</td><td><span class="dd2-badge ${sitOk?'ok':'danger'}">${sitOk?'Regular':'Irregular'}</span></td></tr>
    <tr><td>Data de Abertura</td><td>${d.data_abertura||d.data_inicio_atividade||'—'}</td><td><span class="dd2-badge info">Info</span></td></tr>
    <tr><td>Optante Simples Nacional</td><td>${d.opcao_pelo_simples?'Sim':'Não'}</td><td><span class="dd2-badge info">Info</span></td></tr>
    <tr><td>Optante MEI</td><td>${d.opcao_pelo_mei?'Sim':'Não'}</td><td><span class="dd2-badge info">Info</span></td></tr>
  </tbody></table></div>`;
}

function dd2RenderJudicial(data){
  const el=document.getElementById('dd2-judicial-content');
  const filters=document.getElementById('dd2-judicial-filters');
  if(!data.length){el.innerHTML='<p style="color:#22c55e;font-weight:600">✅ Nenhum processo encontrado nos tribunais consultados.</p>';return;}
  filters.style.display='flex';
  const tribunais=[...new Set(data.map(p=>p._tribunal||p.tribunal||'—'))].sort();
  const graus=[...new Set(data.map(p=>p.grau||'—'))].filter(Boolean).sort();
  const tSel=document.getElementById('dd2-f-tribunal');
  const gSel=document.getElementById('dd2-f-grau');
  tSel.innerHTML='<option value="">Todos os Tribunais ('+data.length+')</option>'+tribunais.map(t=>`<option>${t}</option>`).join('');
  gSel.innerHTML='<option value="">Todos os Graus</option>'+graus.map(g=>`<option>${g}</option>`).join('');
  dd2FiltrarJudicial();
}

function dd2FiltrarJudicial(){
