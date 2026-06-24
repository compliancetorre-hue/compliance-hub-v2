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
      dd2FetchCnpj(doc).then(d=>{
        dd2CadastralData=d;dd2SetStep('cadastral','done');dd2SetProgress(20);
        dd2RenderCadastral(d);dd2RenderFiscal(d);
      }).catch(()=>{dd2SetStep('cadastral','error');})
    );
  } else {
    dd2SetStep('cadastral','done');dd2SetProgress(20);
    document.getElementById('dd2-cadastral-content').innerHTML='<p style="color:#64748b;font-size:.85rem">Consulta cadastral disponÃ­vel apenas para CNPJ.</p>';
    document.getElementById('dd2-fiscal-content').innerHTML='<p style="color:#64748b;font-size:.85rem">Consulta fiscal disponÃ­vel apenas para CNPJ.</p>';
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
    document.getElementById('dd2-judicial-content').innerHTML='<p style="color:#64748b;font-size:.85rem">Consulta judicial nÃ£o selecionada.</p>';
  }
  if(scSan){
    dd2SetStep('sancoes','active');
    tasks.push(
Promise.all([
          fetch('https://corsproxy.io/?url='+encodeURIComponent('https://api.portaldatransparencia.gov.br/api-de-dados/ceis?cnpjSancionado='+doc+'&pagina=1')).then(r=>r.ok?r.json():[]).catch(()=>[]),
                  fetch('https://corsproxy.io/?url='+encodeURIComponent('https://api.portaldatransparencia.gov.br/api-de-dados/cnep?cnpjSancionado='+doc+'&pagina=1')).then(r=>r.ok?r.json():[]).catch(()=>[])
                        ]).then(([ceis,cnep])=>{
                                dd2SancoesData={ceis:Array.isArray(ceis)?ceis:[],cnep:Array.isArray(cnep)?cnep:[]};
                                        dd2SetStep('sancoes','done');dd2SetProgress(65);
                                                dd2RenderSancoes(dd2SancoesData);
                                                      }).catch(()=>{dd2SetStep('sancoes','error');dd2RenderSancoes({ceis:[],cnep:[]});})
    );
  } else {
    dd2SetStep('sancoes','done');
    document.getElementById('dd2-sancoes-content').innerHTML='<p style="color:#64748b;font-size:.85rem">Consulta de sanÃ§Ãµes nÃ£o selecionada.</p>';
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
    document.getElementById('dd2-pep-content').innerHTML='<p style="color:#64748b;font-size:.85rem">Consulta PEP nÃ£o selecionada.</p>';
  }
  if(scMid){
    dd2SetStep('midia','active');
    const nome=dd2CadastralData?.razao_social||dd2CadastralData?.nome||doc;
    tasks.push(
fetch('https://corsproxy.io/?url='+encodeURIComponent('https://api.duckduckgo.com/?q='+encodeURIComponent(nome+' corrupÃ§Ã£o fraude escÃ¢ndalo')+'&format=json&no_html=1&skip_disambig=1')).then(r=>r.ok?r.json():null).then(d=>{
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
  document.getElementById('dd2-export-meta').textContent='RelatÃ³rio gerado em '+now.toLocaleDateString('pt-BR')+' '+now.toLocaleTimeString('pt-BR')+' â '+doc;
  document.getElementById('dd2-progress').style.display='none';
  document.getElementById('dd2-report').style.display='block';
}
async function dd2FetchJudicial(doc,headers){
  const results=[];
  const calls=DD2_TRIBUNAIS.map(t=>
    fetch('https://corsproxy.io/?url='+encodeURIComponent('https://api-publica.datajud.cnj.jus.br/api_publica_'+t.sigla.toLowerCase()+'/_search'),{
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
  const r=await fetch('https://corsproxy.io/?url='+encodeURIComponent('https://api.portaldatransparencia.gov.br/api-de-dados/pep?nome='+q+'&pagina=1'),{signal:AbortSignal.timeout(10000)});
  if(!r.ok)return[];
  return await r.json();
}
function dd2RenderCadastral(d){
  const el=document.getElementById('dd2-cadastral-content');
  if(!d){el.innerHTML='<p style="color:#ef4444">NÃ£o foi possÃ­vel obter dados cadastrais.</p>';return;}
  const r=d;
  const sit=String(r.descricao_situacao_cadastral||r.situacao_cadastral||r.situacao||r.status||'â');
  const sitOk=(sit.toUpperCase().includes('ATIVA')||sit.toUpperCase().includes('REGULAR'));
  el.innerHTML=`<div class="dd2-grid-3">
    <div class="dd2-field-item"><label>CNPJ</label><span>${r.cnpj||'â'}</span></div>
    <div class="dd2-field-item"><label>RazÃ£o Social</label><span>${r.razao_social||r.nome||'â'}</span></div>
    <div class="dd2-field-item"><label>Nome Fantasia</label><span>${r.nome_fantasia||'â'}</span></div>
    <div class="dd2-field-item"><label>SituaÃ§Ã£o Cadastral</label><span><span class="dd2-badge ${sitOk?'ok':'danger'}">${sit}</span></span></div>
    <div class="dd2-field-item"><label>Data de Abertura</label><span>${r.data_abertura||r.data_inicio_atividade||'â'}</span></div>
    <div class="dd2-field-item"><label>Natureza JurÃ­dica</label><span>${r.natureza_juridica?.descricao||r.natureza_juridica||'â'}</span></div>
    <div class="dd2-field-item"><label>Porte</label><span>${r.porte?.descricao||r.porte||'â'}</span></div>
    <div class="dd2-field-item"><label>Capital Social</label><span>R$ ${Number(r.capital_social||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></div>
    <div class="dd2-field-item"><label>CNAE Principal</label><span>${r.cnae_fiscal_descricao||r.cnae_fiscal?.descricao||'â'}</span></div>
    <div class="dd2-field-item" style="grid-column:1/-1"><label>EndereÃ§o</label><span>${[r.logradouro,r.numero,r.complemento,r.bairro,r.municipio?.descricao||r.municipio,r.uf].filter(Boolean).join(', ')||'â'}</span></div>
  </div>`;
  if(r.qsa?.length){
    document.getElementById('dd2-sec-qsa').style.display='block';
    document.getElementById('dd2-qsa-content').innerHTML=`<div style="overflow-x:auto"><table class="dd2-table"><thead><tr><th>Nome</th><th>QualificaÃ§Ã£o</th><th>Faixa EtÃ¡ria</th></tr></thead><tbody>${r.qsa.map(s=>`<tr><td>${s.nome_socio||s.nome||'â'}</td><td>${s.qualificacao_socio?.descricao||s.qualificacao||'â'}</td><td>${s.faixa_etaria||'â'}</td></tr>`).join('')}</tbody></table></div>`;
  }
}
function dd2RenderFiscal(d){
  const el=document.getElementById('dd2-fiscal-content');
  if(!d){el.innerHTML='<p style="color:#ef4444">Dados fiscais nÃ£o disponÃ­veis.</p>';return;}
  const sit=String(d.descricao_situacao_cadastral||d.situacao_cadastral||d.situacao||d.status||'â');
  const sitOk=(sit.toUpperCase().includes('ATIVA')||sit.toUpperCase().includes('REGULAR'));
  el.innerHTML=`<div style="overflow-x:auto"><table class="dd2-table"><thead><tr><th>VerificaÃ§Ã£o</th><th>Resultado</th><th>Status</th></tr></thead><tbody>
    <tr><td>SituaÃ§Ã£o na Receita Federal</td><td>${sit}</td><td><span class="dd2-badge ${sitOk?'ok':'danger'}">${sitOk?'Regular':'Irregular'}</span></td></tr>
    <tr><td>Data de Abertura</td><td>${d.data_abertura||d.data_inicio_atividade||'â'}</td><td><span class="dd2-badge info">Info</span></td></tr>
    <tr><td>Optante Simples Nacional</td><td>${d.opcao_pelo_simples?'Sim':'NÃ£o'}</td><td><span class="dd2-badge info">Info</span></td></tr>
    <tr><td>Optante MEI</td><td>${d.opcao_pelo_mei?'Sim':'NÃ£o'}</td><td><span class="dd2-badge info">Info</span></td></tr>
  </tbody></table></div>`;
}
function dd2RenderJudicial(data){
  const el=document.getElementById('dd2-judicial-content');
  const filters=document.getElementById('dd2-judicial-filters');
  const docBusca=dd2CadastralData?.cnpj?.replace(/\D/g,'')||data._doc||'';const docFmt=docBusca.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,'$1.$2.$3/$4-$5');const nomeBusca=dd2CadastralData?.razao_social||'';if(!data.length){el.innerHTML=`<div style="padding:12px;background:#fef9c3;border:1px solid #fde047;border-radius:8px;margin-bottom:12px"><p style="font-weight:600;color:#854d0e;margin:0 0 4px">â ï¸ A API pÃºblica do DataJud CNJ nÃ£o indexa dados de partes (CPF/CNPJ).</p><p style="font-size:.82rem;color:#92400e;margin:0">Para verificar processos deste CNPJ, acesse diretamente os sistemas abaixo:</p></div><div style="display:grid;gap:8px">${[{n:'JusBrasil â Consulta Processual',u:'https://www.jusbrasil.com.br/consulta-processual/?q='+encodeURIComponent(docFmt||nomeBusca)},{n:'CNJ â Consulta Processual Unificada',u:'https://cnj.jus.br/pesquisas-judiciarias/justica-em-numeros/'},{n:'TJSP â Consulta por CNPJ',u:'https://esaj.tjsp.jus.br/cpopg/search.do?conversationId=&cbPesquisa=NMDOS&dadosConsulta.valorConsultaNuUnificado=&dadosConsulta.valorConsulta='+encodeURIComponent(nomeBusca)+'&dadosConsulta.tipoNuProcesso=UNIFICADO'},{n:'TJRJ â Consulta de Processos',u:'https://www3.tjrj.jus.br/consultaprocessual/#/consultapublica'},{n:'TST â Consulta de Processos Trabalhistas',u:'https://consultaprocessual.tst.jus.br/consultaProcessual/consultaTstNumUnica.do?conscsjt=&numeroTst=&consulta=Consultar&camposPesquisados=dnsMemorial&nmParteReclamante='+encodeURIComponent(nomeBusca)},{n:'TRF1 â Processos Federais',u:'https://processual.trf1.jus.br/consultaProcessual/processo.php?secao=TRF1&proc=&enviar=Pesquisar'},{n:'Portal e-SAJ (TJSP)',u:'https://esaj.tjsp.jus.br/cpopg/open.do'}].map(l=>`<a href="${l.u}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;text-decoration:none;color:#0f2d4a;font-size:.85rem;font-weight:500"><span>ð</span>${l.n}</a>`).join('')}</div>`;return;}
  filters.style.display='flex';
  const tribunais=[...new Set(data.map(p=>p._tribunal||p.tribunal||'â'))].sort();
  const graus=[...new Set(data.map(p=>p.grau||'â'))].filter(Boolean).sort();
  const tSel=document.getElementById('dd2-f-tribunal');
  const gSel=document.getElementById('dd2-f-grau');
  tSel.innerHTML='<option value="">Todos os Tribunais ('+data.length+')</option>'+tribunais.map(t=>`<option>${t}</option>`).join('');
  gSel.innerHTML='<option value="">Todos os Graus</option>'+graus.map(g=>`<option>${g}</option>`).join('');
  dd2FiltrarJudicial();
}
function dd2FiltrarJudicial(){
  const tribunal=document.getElementById('dd2-f-tribunal')?.value||'';
  const grau=document.getElementById('dd2-f-grau')?.value||'';
  const polo=document.getElementById('dd2-f-polo')?.value||'';
  let filtered=dd2JudicialData;
  if(tribunal)filtered=filtered.filter(p=>(p._tribunal||p.tribunal||'')==tribunal);
  if(grau)filtered=filtered.filter(p=>(p.grau||'')==grau);
  const el=document.getElementById('dd2-judicial-content');
  if(!filtered.length){el.innerHTML='<p style="color:#64748b">Nenhum processo encontrado com os filtros selecionados.</p>';return;}
  el.innerHTML=`<p style="font-size:.82rem;color:#64748b;margin-bottom:8px">Exibindo ${filtered.length} processo(s)</p>
  <div style="overflow-x:auto"><table class="dd2-table"><thead><tr><th>NÃºmero CNJ</th><th>Classe / Assunto</th><th>Tribunal</th><th>Grau</th><th>Ãlt. AtualizaÃ§Ã£o</th></tr></thead>
  <tbody>${filtered.slice(0,100).map(p=>{
    const num=p.numeroProcesso||p.numero||'â';
    const classe=p.classe?.nome||p.classe||'â';
    const assunto=(p.assuntos||[]).map(a=>a.nome||a).join(', ')||'â';
    const trib=p._tribunal||p.tribunal||'â';
    const grauP=p.grau||'â';
    const upd=p.dataHoraUltimaAtualizacao||p.dataAjuizamento||'â';
    return `<tr><td style="font-family:monospace;font-size:.75rem">${num}</td><td>${classe}<br><span style="font-size:.73rem;color:#64748b">${assunto}</span></td><td><span class="dd2-badge info">${trib}</span></td><td>${grauP}</td><td style="font-size:.75rem">${upd.substring(0,10)}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function dd2RenderSancoes(d){
  const el=document.getElementById('dd2-sancoes-content');
  const ceis=d?.ceis||[];
  const cnep=d?.cnep||[];
  const all=[...ceis.map(s=>({...s,_base:'CEIS'})),...cnep.map(s=>({...s,_base:'CNEP'}))];
  if(!all.length){el.innerHTML='<p style="color:#22c55e;font-weight:600">â Nenhuma sanÃ§Ã£o encontrada nas bases CEIS/CNEP.</p>';return;}
  el.innerHTML=`<div style="overflow-x:auto"><table class="dd2-table"><thead><tr><th>Base</th><th>Tipo de SanÃ§Ã£o</th><th>ÃrgÃ£o Sancionador</th><th>VigÃªncia</th><th>Status</th></tr></thead>
  <tbody>${all.map(s=>`<tr><td><span class="dd2-badge danger">${s._base}</span></td><td>${s.tipoSancao||s.tipo||'â'}</td><td>${s.orgaoSancionador?.nome||s.orgaoSancionador||'â'}</td><td>${s.dataInicioSancao||'â'} â ${s.dataFimSancao||'vigente'}</td><td><span class="dd2-badge ${s.dataFimSancao?'warn':'danger'}">${s.dataFimSancao?'Encerrada':'Vigente'}</span></td></tr>`).join('')}</tbody></table></div>`;
}
function dd2RenderPep(data){
  const el=document.getElementById('dd2-pep-content');
  if(!Array.isArray(data)||!data.length){el.innerHTML='<p style="color:#22c55e;font-weight:600">â Nenhum registro PEP encontrado.</p>';return;}
  el.innerHTML=`<div style="overflow-x:auto"><table class="dd2-table"><thead><tr><th>Nome</th><th>Cargo / FunÃ§Ã£o</th><th>ÃrgÃ£o</th><th>PerÃ­odo</th><th>Status</th></tr></thead>
  <tbody>${data.slice(0,50).map(p=>`<tr><td>${p.nome||'â'}</td><td>${p.funcao||p.cargo||'â'}</td><td>${p.orgao||'â'}</td><td>${p.dataInicio||'â'} â ${p.dataFim||'atual'}</td><td><span class="dd2-badge pep">&#9888; PEP</span></td></tr>`).join('')}</tbody></table></div>`;
}
function dd2RenderMidia(data){
  const el=document.getElementById('dd2-midia-content');
  if(!data.length){el.innerHTML='<p style="color:#22c55e;font-weight:600">â Nenhuma notÃ­cia negativa encontrada.</p>';return;}
  el.innerHTML=data.slice(0,20).map(n=>`<div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:8px;background:#fff">
    <div style="font-weight:600;font-size:.88rem;margin-bottom:4px"><a href="${n.link||'#'}" target="_blank" style="color:#0f2d4a;text-decoration:none">${n.title||'Sem tÃ­tulo'}</a></div>
    <div style="font-size:.78rem;color:#64748b">${n.pubDate||''} â ${n.source?.name||n.author||''}</div>
    <div style="font-size:.82rem;color:#64748b;margin-top:4px">${(n.content_text||n.description||'').substring(0,200)}...</div>
  </div>`).join('');
}
function dd2RenderScore(){
  const gauge=document.getElementById('dd2-gauge');
  const label=document.getElementById('dd2-gauge-label');
  const pillarsEl=document.getElementById('dd2-pillars');
  let score=0;
  const d=dd2CadastralData;
  const sit=String(d?.descricao_situacao_cadastral||d?.situacao_cadastral||d?.situacao||d?.status||'');
  if(sit&&!sit.toUpperCase().includes('ATIVA')&&!sit.toUpperCase().includes('REGULAR'))score+=30;
  const sanTotal=(dd2SancoesData?.ceis||[]).length+(dd2SancoesData?.cnep||[]).length;
  if(sanTotal>0)score=Math.min(100,score+40);
  if(dd2PepData.length>0)score=Math.min(100,score+20);
  score=Math.min(100,score);
  gauge.textContent=score;
  if(score<25){gauge.className='dd2-gauge-circle low';label.textContent='RISCO BAIXO';label.style.color='#22c55e';}
  else if(score<60){gauge.className='dd2-gauge-circle medium';label.textContent='RISCO MÃDIO';label.style.color='#f59e0b';}
  else{gauge.className='dd2-gauge-circle high';label.textContent='RISCO ALTO';label.style.color='#ef4444';}
  const pillars=[
    {icon:'&#127963;',label:'Cadastral',ok:!sit||sit.toUpperCase().includes('ATIVA')||sit.toUpperCase().includes('REGULAR')},
    {icon:'&#9878;',label:'Judicial',ok:dd2JudicialData.length===0},
    {icon:'&#128171;',label:'SanÃ§Ãµes',ok:sanTotal===0},
    {icon:'&#127963;',label:'PEP',ok:dd2PepData.length===0},
    {icon:'&#128240;',label:'MÃ­dia',ok:dd2MidiaData.length===0}
  ];
  pillarsEl.innerHTML=pillars.map(p=>`<div class="dd2-pillar">
    <div class="dd2-pillar-icon">${p.icon}</div>
    <div class="dd2-pillar-label">${p.label}</div>
    <div class="dd2-pillar-status ${p.ok?'ok':'bad'}">${p.ok?'OK':'AtenÃ§Ã£o'}</div>
  </div>`).join('');
}
function dd2RenderTimeline(){
