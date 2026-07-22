// ══════════════════════════════════════════
// DUE DILIGENCE v4 — CPF + CNPJ + Mídias Negativas + Boolean Search
// ══════════════════════════════════════════
let ddTab='pj', ddCnpjN='';
// Cada Junta Comercial estadual tem seu próprio domínio, que muda com
// frequência — testamos os 27 em jul/2026 e 6 estavam com o domínio morto
// (DNS não resolvia, timeout ou certificado inválido), 3 redirecionavam pra
// página errada (homepage genérica ou site institucional sem relação).
// Em vez de manter 27 URLs fixas que apodrecem sozinhas, usamos o diretório
// do DREI (Departamento Nacional de Registro Empresarial, órgão federal que
// regula todas as Juntas), que mantém o link de cada estado atualizado.
const JUNTAS_SLUG={AC:'acre-ac',AL:'alagoas-al-alagoas-al-1',AM:'amazonas-am',AP:'amapa-ap',BA:'bahia-ba',CE:'ceara-ce',DF:'distrito-federal-df',ES:'espirito-santo-es',GO:'goias-go',MA:'maranhao-ma',MG:'minas-gerais-mg',MS:'mato-grosso-do-sul-ms',MT:'mato-grosso-mt',PA:'para-pa',PB:'paraiba-pb',PE:'pernambuco-pe',PI:'piaui-pi',PR:'parana-pr',RJ:'rio-de-janeiro-rj',RN:'rio-grande-do-norte-rn',RO:'rondonia-ro',RR:'roraima-rr',RS:'rio-grande-do-sul-rs',SC:'santa-catarina-sc',SE:'sergipe-se',SP:'sao-paulo-sp',TO:'tocantins-to'};
const JUNTAS_NOME={AC:'JUCEAC',AL:'JUCEAL',AM:'JUCEA',AP:'JUCAP',BA:'JUCEB',CE:'JUCEC',DF:'JUCIS-DF',ES:'JUCEES',GO:'JUCEG',MA:'JUCEMA',MG:'JUCEMG',MS:'JUCEMS',MT:'JUCEMAT',PA:'JUCEPA',PB:'JUCEP',PE:'JUCEPE',PI:'JUCEPI',PR:'JUCEPAR',RJ:'JUCERJA',RN:'JUCERN',RO:'JUCER',RR:'JUCERR',RS:'JUCIS-RS',SC:'JUCESC',SE:'JUCESE',SP:'JUCESP',TO:'JUCETINS'};
const JUNTAS={};
Object.keys(JUNTAS_SLUG).forEach(uf=>{JUNTAS[uf]={n:JUNTAS_NOME[uf],u:`https://www.gov.br/empresas-e-negocios/pt-br/drei/juntas-comerciais/${JUNTAS_SLUG[uf]}`};});

// ── MASKS ─────────────────────────────────
function ddMC(v){v=v.replace(/\D/g,'');v=v.replace(/^(\d{2})(\d)/,'$1.$2');v=v.replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3');v=v.replace(/\.(\d{3})(\d)/,'.$1/$2');v=v.replace(/(\d{4})(\d)/,'$1-$2');return v.substr(0,18);}
function ddMCpf(v){v=v.replace(/\D/g,'');v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');return v.substr(0,14);}
function ddFmt(n){return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,'$1.$2.$3/$4-$5');}
// CPF é dado pessoal (LGPD) — no log de auditoria mostra só os 2 últimos
// dígitos, o suficiente pra rastrear sem expor o documento inteiro.
function ddMascaraCpf(cpf){cpf=(cpf||'').replace(/\D/g,'');return cpf.length===11?`***.***.***-${cpf.slice(9)}`:'';}
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
function buildBooleanQuery(alvo, doc, alt){
  // "alt" é um nome alternativo pro mesmo alvo (nome fantasia de uma
  // empresa, por ex.) — a imprensa quase nunca escreve a razão social
  // completa ("X HOLDING FINANCEIRA LTDA"), só o nome fantasia ("X Bank").
  // Sem essa alternativa a busca em Notícias fica presa a zero resultado
  // pra qualquer empresa com nome fantasia diferente da razão social
  // (confirmado ao vivo: razão social sozinha = 0, com o nome fantasia
  // via OR = dezenas de resultados, pro mesmo caso real).
  const base = (alt && alt.trim() && alt.trim().toLowerCase()!==alvo.trim().toLowerCase())
    ? `("${alvo}" OR "${alt}")`
    : `"${alvo}"`;
  const docStr = doc ? ` "${doc}"` : '';

  return {
    criminal: `${base}${docStr} AND (corrupção OR crime OR processo OR investigação OR fraude OR "lavagem de dinheiro" OR suborno OR "trabalho escravo" OR "lista suja" OR condenado OR réu OR "mandado de prisão" OR peculato OR tráfico OR sequestro) -site:instagram.com -site:facebook.com -site:tiktok.com`,
    financeiro: `${base}${docStr} AND (fraude OR "pirâmide financeira" OR Ponzi OR insolvência OR inadimplência OR offshore OR "evasão de divisas" OR "crimes financeiros" OR falência OR "recuperação judicial" OR protesto OR inadimplente OR estelionato) -site:instagram.com -site:facebook.com`,
    regulatorio: `${base}${docStr} AND (sanção OR "improbidade administrativa" OR OFAC OR blacklist OR "investigação MP" OR "Ministério Público" OR CVM OR BACEN OR "processo administrativo" OR interdição OR cassação OR suspenso) -site:instagram.com -site:facebook.com`,
    reputacional: `${base}${docStr} AND (escândalo OR denúncia OR "assédio moral" OR "assédio sexual" OR "desastre ambiental" OR "multa IBAMA" OR "direitos humanos" OR "trabalho análogo" OR golpe OR fraude OR calote OR enganou) -site:instagram.com`,
    pep: `${base} AND ("cargo público" OR "servidor público" OR governador OR senador OR deputado OR prefeito OR secretário OR ministro OR "Pessoa Politicamente Exposta" OR PEP OR "partido político")`,
    recente: `${base}${docStr} after:${new Date(Date.now()-365*24*60*60*1000).toISOString().split('T')[0]}`,
  };
}

// Nome "curto" pra busca em rede social: primeiro + último nome, pulando
// conectivos. Nome civil completo entre aspas ("Bruno Felipe Lima
// Magalhães") quase nunca existe literalmente num perfil — a pessoa se
// apresenta como "Bruno Magalhães" — então a busca exata com o nome
// inteiro devolve zero mesmo quando o perfil existe.
function ddNomeCurto(nome){
  const conectivos=new Set(['da','de','do','das','dos','e']);
  const t=(nome||'').trim().split(/\s+/).filter(p=>!conectivos.has(p.toLowerCase()));
  if(t.length<=2)return nome.trim();
  return t[0]+' '+t[t.length-1];
}

// ── LINK HTML + VERIFICAÇÃO AUTOMÁTICA ────
// A antiga "verificação automática" daqui usava a API de respostas
// instantâneas do DuckDuckGo — que não é motor de busca e gerava falso
// negativo em série; foi removida. O que existe agora é diferente e
// honesto: pros links cuja FONTE tem API pública de verdade (CEIS, CNEP,
// Leniência, CEPIM, CEAF, PEP, TCU, DJEN, DOU, Querido Diário, sanções
// internacionais, Google Notícias via RSS), a consulta REAL é feita na
// própria fonte e o link ganha um selo "✅ nada encontrado" / "🔴 N
// resultado(s)". O que é barrado por CAPTCHA/bot-protection (Google web,
// Reclame Aqui, JusBrasil, Lista Suja, juntas...) fica com selo "manual" —
// sem fingir verificação. Os motores são os mesmos do Due Diligence 2
// (due-diligence2.js, carregado na mesma página).
let ddVfSeq=0;let ddVfFila=[];

const DD_VCHIP_BASE='font-size:.66rem;font-weight:700;padding:2px 7px;border-radius:4px;flex-shrink:0;white-space:nowrap';

function ddLiHTML(item){
  if(item.disabled)return`<div class="dd-li disabled"><span class="dd-lb lb-${item.p||'g'}">${item.p==='r'?'CRÍTICO':item.p==='a'?'ATENÇÃO':'BASE'}</span><div class="dd-li-main"><div class="dd-li-lbl">${item.label}</div></div></div>`;
  const lbCls=item.isMidia?'lb-neg':(item.p==='r'?'lb-r':item.p==='a'?'lb-a':'lb-g');
  const lbTxt=item.isMidia?'MÍDIA NEG.':(item.p==='r'?'CRÍTICO':item.p==='a'?'ATENÇÃO':'BASE');
  const qchip=item.query?`<span class="dd-li-q" title="${item.query.replace(/"/g,"'")}">${item.query.length>68?item.query.substr(0,68)+'…':item.query}</span>`:'';
  let vchip;
  if(item.v){
    const id='dd-vf-'+(++ddVfSeq);
    ddVfFila.push({id,run:item.v});
    vchip=`<span id="${id}" style="${DD_VCHIP_BASE};background:#f1f5f9;color:#64748b" title="Consultando a fonte oficial automaticamente...">⏳ verificando…</span>`;
  }else{
    vchip=`<span style="${DD_VCHIP_BASE};background:#f8fafc;color:#94a3b8" title="Essa fonte não tem API pública (CAPTCHA/bloqueio) — abra o link e confira você mesmo">manual</span>`;
  }
  return`<a class="dd-li" href="${item.url||'#'}" target="_blank" rel="noopener">
    <span class="dd-lb ${lbCls}">${lbTxt}</span>
    <div class="dd-li-main"><div class="dd-li-lbl">${item.label}</div>${qchip}</div>
    ${vchip}
    <span style="color:var(--text-muted);font-size:.76rem;flex-shrink:0;margin-left:2px">↗</span>
  </a>`;
}

// Fábricas de verificadores — cada uma devolve uma função async que retorna
// a QUANTIDADE de registros achados na fonte. Todas reutilizam os motores
// do due-diligence2.js; se ele não estiver carregado, o selo vira "não
// verificado" em vez de quebrar a página.
function ddVfPortal(rota,params){return async()=>{
  if(typeof dd2PortalUrl!=='function')throw new Error('motor indisponível');
  const r=await fetch(dd2PortalUrl(rota,params+'&pagina=1'),{headers:dd2PortalHeaders(),signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const d=await r.json();
  return Array.isArray(d)?d.length:0;
};}
function ddVfGNews(q){return async()=>{
  if(typeof dd2FetchGoogleNewsRSS!=='function')throw new Error('motor indisponível');
  return (await dd2FetchGoogleNewsRSS(q)).length;
};}
function ddVfDou(q){return async()=>{
  if(typeof dd2FetchDOU!=='function')throw new Error('motor indisponível');
  return (await dd2FetchDOU(q)).length;
};}
function ddVfQD(q){return async()=>{
  if(typeof dd2FetchQueridoDiario!=='function')throw new Error('motor indisponível');
  return (await dd2FetchQueridoDiario(q)).length;
};}
function ddVfDjen(nome,docFmt){return async()=>{
  if(typeof dd2FetchDJEN!=='function')throw new Error('motor indisponível');
  const buscas=[];
  if(docFmt)buscas.push(dd2FetchDJEN({texto:docFmt}));
  if(nome)buscas.push(dd2FetchDJEN({nomeParte:nome}));
  if(!buscas.length)return 0;
  const rs=await Promise.allSettled(buscas);
  const ok=rs.filter(r=>r.status==='fulfilled');
  if(!ok.length)throw new Error('DJEN indisponível');
  const ids=new Set();
  ok.forEach(r=>r.value.forEach(i=>ids.add(i.id)));
  return ids.size;
};}
function ddVfTcu(docNum,nome){return async()=>{
  if(typeof dd2FetchTCUInidoneos!=='function')throw new Error('motor indisponível');
  const items=await dd2FetchTCUInidoneos();
  let n=docNum?dd2TcuPorDocumento(items,docNum).length:0;
  if(nome)n+=dd2TcuPorNome(items,nome).length;
  return n;
};}
function ddVfSanctions(nome){return async()=>{
  if(typeof dd2FetchSanctionsNetwork!=='function')throw new Error('motor indisponível');
  return dd2FiltrarRuidoSancoesIntl(await dd2FetchSanctionsNetwork(nome),nome).length;
};}
function ddVfPep(nome,cpf){return async()=>{
  if(typeof dd2FetchPep!=='function')throw new Error('motor indisponível');
  return (await dd2FetchPep(nome,cpf)).length;
};}

// Roda a fila em lotes pequenos (concorrência 3 + pausa) pra não estourar
// os rate limits do Portal/DJEN, atualizando cada selo conforme termina.
async function ddRodarVerificacoes(){
  const fila=ddVfFila.splice(0);
  for(let i=0;i<fila.length;i+=3){
    await Promise.allSettled(fila.slice(i,i+3).map(async f=>{
      const el=document.getElementById(f.id);
      if(!el)return;
      try{
        const n=await f.run();
        if(n>0){
          el.style.background='#fee2e2';el.style.color='#b91c1c';
          el.textContent='🔴 '+n+' resultado(s)';
          el.title='A fonte oficial retornou '+n+' registro(s) pro termo pesquisado — abra o link pra conferir o teor';
        }else{
          el.style.background='#dcfce7';el.style.color='#15803d';
          el.textContent='✅ nada encontrado';
          el.title='Consulta automática feita na própria fonte — nenhum registro pro termo pesquisado';
        }
      }catch(e){
        el.style.background='#fef3c7';el.style.color='#b45309';
        el.textContent='⚠️ não verificado';
        el.title='A consulta automática falhou ('+(e?.message||'erro')+') — confira manualmente no link';
      }
    }));
    if(i+3<fila.length)await new Promise(r=>setTimeout(r,400));
  }
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
    let o={razao:'',fantasia:'',situacao:'',abertura:'',porte:'',natureza:'',capital:'',capitalNum:null,email:'',telefone:'',uf:'',municipio:'',endereco:'',cnae_pri:{cod:'',desc:''},cnaes_sec:[],socios:[]};
    if(api==='BrasilAPI'||d.cnae_fiscal!==undefined){
      o.razao=d.razao_social||'';o.fantasia=d.nome_fantasia||'';o.situacao=d.descricao_situacao_cadastral||String(d.situacao_cadastral||'')||'';
      o.abertura=d.data_inicio_atividade||'';o.porte=d.descricao_porte||'';o.natureza=d.natureza_juridica||'';
      o.capital=d.capital_social!=null?'R$ '+Number(d.capital_social).toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
      o.capitalNum=d.capital_social!=null?Number(d.capital_social):null;
      o.email=d.email||'';o.telefone=d.ddd_telefone_1?`(${d.ddd_telefone_1}) ${d.telefone_1||''}`:'';
      o.uf=d.uf||'';o.municipio=d.municipio||'';
      o.endereco=[d.logradouro,d.numero,d.complemento,d.bairro,d.municipio,d.uf,d.cep].filter(Boolean).join(', ');
      o.cnae_pri={cod:String(d.cnae_fiscal||''),desc:d.cnae_fiscal_descricao||''};
      o.cnaes_sec=(d.cnaes_secundarios||[]).map(c=>({cod:String(c.codigo||''),desc:c.descricao||''}));
      o.socios=(d.qsa||[]).map(s=>({nome:s.nome_socio||s.nome||'',qual:s.qualificacao_socio||''}));
    }else if(api==='ReceitaWS'||d.nome){
      o.razao=d.nome||'';o.fantasia=d.fantasia||'';o.situacao=d.situacao||'';o.abertura=d.abertura||'';o.porte=d.porte||'';o.natureza=d.natureza_juridica||'';
      o.capital=d.capital_social||'';o.capitalNum=d.capital_social!=null&&!isNaN(Number(d.capital_social))?Number(d.capital_social):null;o.email=d.email||'';o.telefone=d.telefone||'';
      o.uf=d.uf||'';o.municipio=d.municipio||'';
      o.endereco=[d.logradouro,d.numero,d.complemento,d.bairro,d.municipio,d.uf,d.cep].filter(Boolean).join(', ');
      o.cnae_pri={cod:(d.atividade_principal||[])[0]?.code||'',desc:(d.atividade_principal||[])[0]?.text||''};
      o.cnaes_sec=(d.atividades_secundarias||[]).map(c=>({cod:c.code||'',desc:c.text||''}));
      o.socios=(d.qsa||[]).map(s=>({nome:s.nome||'',qual:s.qual||''}));
    }else if(d.estabelecimento){
      const e=d.estabelecimento||{};
      o.razao=d.razao_social||'';o.fantasia=e.nome_fantasia||'';o.situacao=e.situacao_cadastral||'';o.abertura=e.data_inicio_atividade||'';
      o.porte=(d.porte||{}).descricao||'';o.natureza=(d.natureza_juridica||{}).descricao||'';
      o.capital=d.capital_social!=null?'R$ '+Number(d.capital_social).toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
      o.capitalNum=d.capital_social!=null?Number(d.capital_social):null;
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
      {...ddA(`https://portaldatransparencia.gov.br/sancoes/ceis?termo=${cnpjNum}`,`CNPJ ${cnpjNum}`),label:'CEIS — impedida de contratar com o governo',p:'r',v:ddVfPortal('ceis','codigoSancionado='+cnpjNum)},
      {...ddA(`https://portaldatransparencia.gov.br/sancoes/cnep?termo=${cnpjNum}`,`CNPJ ${cnpjNum}`),label:'CNEP — punições e sanções',p:'r',v:ddVfPortal('cnep','codigoSancionado='+cnpjNum)},
      {...ddA(`https://portaldatransparencia.gov.br/sancoes/acordos-leniencia?termo=${cnpjNum}`,`CNPJ ${cnpjNum}`),label:'Acordos de Leniência — CGU',p:'r',v:ddVfPortal('acordos-leniencia','cnpjSancionado='+cnpjNum)},
      {...ddA(`https://portaldatransparencia.gov.br/sancoes/cepim?termo=${cnpjNum}`,`CNPJ ${cnpjNum}`),label:'CEPIM — impedida de celebrar convênio com a União',p:'r',v:ddVfPortal('cepim','cnpjSancionado='+cnpjNum)},
      {...ddA('https://portal.tcu.gov.br/responsabilizacao-publica/licitantes-inidoneas/',`CNPJ ${cnpjFmt}`),label:'TCU — licitantes declarados inidôneos',p:'r',v:ddVfTcu(cnpjNum,RL)},
      {...ddA('https://sanctionssearch.ofac.treas.gov/',`"${RL}"`),label:'Sanções internacionais — OFAC/ONU/UE (agregador)',p:'r',v:ddVfSanctions(RL)},
      {...ddA('https://sit.trabalho.gov.br/radar/','Busca manual'),label:'Lista Suja — trabalho escravo (Radar SIT)',p:'r'},
      {...ddG(`"${cnpjFmt}"`),label:`Google — CNPJ exato "${cnpjFmt}"`,p:'r'},
      {...ddG(`"${RL}" "${cnpjFmt}"`),label:'Google — razão social exata + CNPJ',p:'r'},
    ]},
    {title:'🟣 Mídias negativas — busca booleana (criminal)',items:[
      {...ddG(bool.criminal),label:'Boolean — riscos criminais (corrupção, fraude, lavagem, trabalho escravo)',p:'r',isMidia:true},
      {...ddGT(bool.criminal),label:'Notícias — riscos criminais (últimos 12 meses)',p:'r',isMidia:true,v:ddVfGNews(bool.criminal)},
      {...ddG(`"${RL}" AND ("lista suja" OR OFAC OR blacklist OR sanção OR "improbidade administrativa")`),label:'Boolean — sanções e listas restritivas',p:'r',isMidia:true},
    ]},
    {title:'🟣 Mídias negativas — financeiro e regulatório',items:[
      {...ddG(bool.financeiro),label:'Boolean — riscos financeiros (fraude, Ponzi, insolvência, evasão)',p:'r',isMidia:true},
      {...ddGT(bool.financeiro),label:'Notícias — riscos financeiros recentes',p:'r',isMidia:true,v:ddVfGNews(bool.financeiro)},
      {...ddG(bool.regulatorio),label:'Boolean — riscos regulatórios (MP, CVM, BACEN, cassação)',p:'r',isMidia:true},
      {...ddG(bool.reputacional),label:'Boolean — riscos reputacionais (escândalos, assédio, ambiental)',p:'a',isMidia:true},
    ]},
    {title:'🟣 Mídias negativas — atividade recente (12 meses)',items:[
      {...ddG(bool.recente),label:`Google — "${RL}" · publicações do último ano`,p:'r',isMidia:true},
      {...ddGT(`"${RL}"`),label:`Google Notícias — "${RL}" ·  qualquer data`,p:'r',isMidia:true,v:ddVfGNews(`"${RL}"`)},
      {...ddG(`"${RL}" OR "${cnpjFmt}" site:g1.globo.com OR site:uol.com.br OR site:folha.uol.com.br OR site:estadao.com.br OR site:valor.com.br`),label:'Grandes veículos — G1, UOL, Folha, Estadão, Valor Econômico',p:'r',isMidia:true},
    ]},
    {title:'🏛️ Junta Comercial'+(uf?` — ${uf}`:''),items:[
      ...(junta?[
        {...ddA(junta.u,`Buscar: "${RL}" ou CNPJ ${cnpjFmt}`),label:`${junta.n} — ${uf} · Consultar registro e atos societários`,p:'r'},
        {...ddG(`"${RL}" ${junta.n}`),label:`Google — "${RL}" + ${junta.n}`,p:'r'},
        {...ddG(`"${cnpjFmt}" "junta comercial"`),label:'Google — CNPJ exato + "junta comercial"',p:'r'},
        {...ddG(`"${RL}" "ato constitutivo" OR "contrato social" OR "alteração contratual"`),label:'Google — documentos societários exatos',p:'a'},
      ]:[{label:'Selecione o estado para ativar os links da Junta Comercial',url:'#',query:'',p:'a',disabled:true}]),
      {...ddA('https://www.gov.br/empresas-e-negocios/pt-br/drei','Portal federal'),label:'DREI — Departamento Nacional de Registro Empresarial',p:'a'},
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
      {...ddA(`https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(FT)}`,FT),label:'Instagram — busca interna da rede (requer login)',p:'a'},
      {...ddA(`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(FT)}`,FT),label:'LinkedIn — busca interna de empresas',p:'a'},
      {...ddG(`"${FT}" site:instagram.com OR site:facebook.com`),label:'Instagram/Facebook via Google — nome fantasia (como a empresa se apresenta)',p:'a'},
      {...ddG(`"${RL}" site:linkedin.com OR site:instagram.com OR site:facebook.com`),label:'Redes via Google — razão social exata',p:'a'},
      {...ddG(`"${FT}".com.br OR "${FT}".com`),label:'Site oficial — domínio exato',p:'g'},
      {...ddG(`"${FT}" aposta OR bet OR cassino OR rifa OR "jogo online"`),label:'🚨 ALERTA PLD — apostas / bets (nome fantasia)',p:'r',isMidia:true},
      {...ddG(`"${RL}" aposta OR bet OR cassino OR rifa OR "jogo online"`),label:'🚨 ALERTA PLD — apostas / bets (razão social)',p:'r',isMidia:true},
    ]},
    {title:'⭐ Reputação',items:[
      {...ddA(`https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent('"'+FT+'"')}`,`"${FT}"`),label:'Reclame Aqui — nome fantasia exato',p:'r'},
      {...ddA(`https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent('"'+RL+'"')}`,`"${RL}"`),label:'Reclame Aqui — razão social exata',p:'r'},
      {...ddA('https://www.consumidor.gov.br/pages/principal/','Portal federal'),label:'Consumidor.gov.br',p:'r'},
      {...ddG(`"${RL}" "não entregou" OR calote OR golpe OR fraude OR abandonou`),label:`Google — "${RL}" calote / fraude (busca exata)`,p:'r',isMidia:true},
    ]},
    {title:'⚖️ Processos e dívidas',items:[
      {...ddA(`https://comunica.pje.jus.br/`,`"${RL}" / CNPJ ${cnpjFmt}`),label:'DJEN — citações e intimações em todo o país (CNJ)',p:'r',v:ddVfDjen(RL,cnpjFmt)},
      {...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${cnpjNum}`,cnpjNum),label:'JusBrasil — processos por CNPJ',p:'r'},
      {...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${encodeURIComponent('"'+RL+'"')}`,`"${RL}"`),label:'JusBrasil — razão social exata',p:'r'},
      ...sArr.slice(0,3).map(s=>({...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${encodeURIComponent(s)}`,s),label:`JusBrasil — sócio "${s}"`,p:'a'})),
      {...ddA('https://www.cnj.jus.br/pjecnj/',`CNPJ: ${cnpjFmt}`),label:'CNJ — consulta processual nacional',p:'r'},
      {...ddA(`https://www.in.gov.br/consulta/-/buscar/dou?q=${encodeURIComponent('"'+RL+'"')}`,`"${RL}"`),label:'Diário Oficial da União — publicações exatas',p:'a',v:ddVfDou(RL)},
      {...ddA(`https://queridodiario.ok.org.br/pesquisa?termo=${encodeURIComponent('"'+RL+'"')}`,`"${RL}"`),label:'Querido Diário — diários oficiais de 350+ municípios',p:'a',v:ddVfQD(RL)},
      {...ddG(`"${RL}" "execução fiscal" OR protesto OR "dívida ativa"`),label:`Google — "${RL}" execução fiscal`,p:'a',isMidia:true},
    ]},
    {title:'👤 Sócios',items:[
      ...sArr.slice(0,4).flatMap(s=>[
        {...ddG(buildBooleanQuery(s,'').criminal),label:`Boolean mídias negativas — sócio "${s}"`,p:'r',isMidia:true},
        {...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${encodeURIComponent(s)}`,s),label:`JusBrasil — processos de "${s}"`,p:'r'},
        {...ddG(`"${s}" "${RL}"`),label:`Google — "${s}" + empresa exata`,p:'a'},
        {...ddA(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(s)}`,s),label:`LinkedIn — busca interna: "${ddNomeCurto(s)}"`,p:'a'},
      ]),
      ...(sArr.length===0?[{label:'Preencha o campo sócios',url:'#',query:'',p:'a',disabled:true}]:[]),
    ]},
    {title:'🏛️ Órgãos reguladores',items:[
      {...ddA(`https://www.bcb.gov.br/estabilidadefinanceira/pesquisainstituicao?nome=${encodeURIComponent(RL)}`,`"${RL}"`),label:'🔴 BACEN — autorização para funcionar como instituição financeira',p:'r'},
      {...ddA(`https://sistemas.cvm.gov.br/port/processos/consultaprocessos.asp`,`CNPJ: ${cnpjNum}`),label:'🔴 CVM — registro para operar no mercado de capitais',p:'r'},
      {...ddA(`https://www.gov.br/pt-br/servicos/consultar-entidades-licenciadas-pela-susep`,`CNPJ: ${cnpjFmt}`),label:'🔴 SUSEP — autorização para operar seguros/previdência',p:'r'},
      {...ddA(`https://portaldatransparencia.gov.br/sancoes/ceis?termo=${cnpjNum}`,`CNPJ: ${cnpjNum}`),label:'🔴 CEIS — impedida de contratar com o poder público',p:'r',v:ddVfPortal('ceis','codigoSancionado='+cnpjNum)},
      {...ddA(`https://portaldatransparencia.gov.br/sancoes/cnep?termo=${cnpjNum}`,`CNPJ: ${cnpjNum}`),label:'🔴 CNEP — punições e sanções aplicadas',p:'r',v:ddVfPortal('cnep','codigoSancionado='+cnpjNum)},
      {...ddA('https://sit.trabalho.gov.br/radar/',`CNPJ: ${cnpjFmt}`),label:'🔴 Lista Suja MTE — trabalho escravo/análogo',p:'r'},
      {...ddA('https://cna.oab.org.br/',`"${RL}"`),label:'OAB — escritório de advocacia',p:'g'},
      {...ddA('https://www3.cfc.org.br/spw/crcs/ConselhoRegionalAtivo.aspx',`CNPJ: ${cnpjFmt}`),label:'CFC/CRC — empresa contábil',p:'g'},
      {...ddA('https://www.cofeci.gov.br/',`"${RL}"`),label:'CRECI/COFECI — imobiliária',p:'g'},
      {...ddA('https://www.antt.gov.br/',`CNPJ: ${cnpjFmt}`),label:'ANTT — empresa de transporte',p:'g'},
      {...ddA('https://consultas.anvisa.gov.br/#/',`CNPJ: ${cnpjFmt}`),label:'ANVISA — farmácia/alimentos/saúde',p:'g'},
      {...ddA('https://cadastur.turismo.gov.br/',`CNPJ: ${cnpjFmt}`),label:'Cadastur — agência de turismo',p:'g'},
      {...ddA(`https://www.in.gov.br/consulta/-/buscar/dou?q=${encodeURIComponent('"'+cnpjFmt+'"')}`,`"${cnpjFmt}"`),label:'Diário Oficial — publicações com o CNPJ',p:'a',v:ddVfDou(cnpjFmt)},
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
      {...ddA(`https://portaldatransparencia.gov.br/sancoes/ceis?termo=${cpf||encodeURIComponent(nome)}`,cpf?`CPF: ${cpfFmt}`:`"${nome}"`),label:'CEIS — impedida de contratar com o governo',p:'r',v:ddVfPortal('ceis',cpf?'codigoSancionado='+cpf:'nomeSancionado='+encodeURIComponent(nome))},
      {...ddA(`https://portaldatransparencia.gov.br/sancoes/cnep?termo=${cpf||encodeURIComponent(nome)}`,cpf?`CPF: ${cpfFmt}`:`"${nome}"`),label:'CNEP — punições e sanções',p:'r',v:ddVfPortal('cnep',cpf?'codigoSancionado='+cpf:'nomeSancionado='+encodeURIComponent(nome))},
      {...ddA(`https://portaldatransparencia.gov.br/sancoes/ceaf?termo=${cpf||encodeURIComponent(nome)}`,cpf?`CPF: ${cpfFmt}`:`"${nome}"`),label:'CEAF — expulsões da administração federal',p:'r',v:ddVfPortal('ceaf',cpf?'cpfSancionado='+cpf:'nomeSancionado='+encodeURIComponent(nome))},
      {...ddA('https://portaldatransparencia.gov.br/pessoa-fisica/busca/lista',`"${nome}"`),label:'PEP — base oficial de Pessoas Expostas Politicamente (CGU)',p:'r',v:ddVfPep(nome,cpf)},
      {...ddA('https://portal.tcu.gov.br/responsabilizacao-publica/licitantes-inidoneas/',`"${nome}"`),label:'TCU — inidôneos (pessoa física também consta)',p:'r',v:ddVfTcu(cpf,nome)},
      {...ddA('https://sanctionssearch.ofac.treas.gov/',`"${nome}"`),label:'Sanções internacionais — OFAC/ONU/UE (agregador)',p:'r',v:ddVfSanctions(nome)},
      {...ddA('https://sit.trabalho.gov.br/radar/','Busca manual'),label:'Lista Suja — trabalho escravo',p:'r'},
    ]},
    ...(pep!=='nao'?[{title:'🏛️ PEP — Pessoa Politicamente Exposta',items:[
      {...ddG(`"${nome}" "Pessoa Politicamente Exposta" OR PEP OR "cargo público" OR governador OR senador OR deputado OR prefeito OR ministro`),label:`Boolean PEP — "${nome}" cargos públicos`,p:'r',isMidia:true},
      {...ddA('https://portaldatransparencia.gov.br/servidores','Busca manual'),label:'Portal Transparência — servidores públicos federais',p:'r'},
      {...ddA('https://www.tse.jus.br/eleicoes/contas-eleitorais','Busca manual'),label:'TSE — candidatos e filiações partidárias',p:'r'},
      {...ddG(`"${nome}" site:portaldatransparencia.gov.br`),label:`Portal Transparência — "${nome}" exato`,p:'r',isMidia:true},
    ]}]:[]),
    {title:'🟣 Mídias negativas — criminal e fraude',items:[
      {...ddG(bool.criminal),label:'Boolean — riscos criminais (corrupção, fraude, lavagem, investigação)',p:'r',isMidia:true},
      {...ddGT(bool.criminal),label:'Notícias — riscos criminais recentes',p:'r',isMidia:true,v:ddVfGNews(bool.criminal)},
      {...ddG(`"${nome}" AND ("lista suja" OR OFAC OR blacklist OR sanção OR "improbidade administrativa")`),label:'Boolean — sanções e listas restritivas',p:'r',isMidia:true},
      {...ddG(`"${cpfFmt}" fraude OR golpe OR estelionato OR crime`),label:`Google — CPF exato em registros negativos`,p:'r',isMidia:true},
    ]},
    {title:'🟣 Mídias negativas — financeiro e reputacional',items:[
      {...ddG(bool.financeiro),label:'Boolean — riscos financeiros (fraude, Ponzi, insolvência)',p:'r',isMidia:true},
      {...ddGT(bool.financeiro),label:'Notícias financeiras recentes',p:'r',isMidia:true,v:ddVfGNews(bool.financeiro)},
      {...ddG(bool.regulatorio),label:'Boolean — riscos regulatórios (MP, CVM, improbidade)',p:'r',isMidia:true},
      {...ddG(bool.reputacional),label:'Boolean — riscos reputacionais (escândalos, denúncias)',p:'a',isMidia:true},
    ]},
    {title:'🟣 Mídias negativas — publicações recentes',items:[
      {...ddG(bool.recente),label:`Google — "${nome}" · publicações do último ano`,p:'r',isMidia:true},
      {...ddGT(`"${nome}"`),label:`Google Notícias — "${nome}" qualquer data`,p:'r',isMidia:true,v:ddVfGNews(`"${nome}"`)},
      {...ddG(`"${nome}" site:g1.globo.com OR site:uol.com.br OR site:folha.uol.com.br OR site:estadao.com.br OR site:valor.com.br`),label:'Grandes veículos de jornalismo — G1, Folha, Estadão, Valor',p:'r',isMidia:true},
    ]},
    {title:'⚖️ Processos judiciais',items:[
      {...ddA(`https://comunica.pje.jus.br/`,`"${nome}"${cpfFmt?' / CPF '+cpfFmt:''}`),label:'DJEN — citações e intimações em todo o país (CNJ)',p:'r',v:ddVfDjen(nome,cpf?cpfFmt:'')},
      {...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${encodeURIComponent('"'+nome+'"')}`,`"${nome}"`),label:'JusBrasil — processos pelo nome exato',p:'r'},
      ...(cpf?[{...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${cpf}`,cpf),label:'JusBrasil — processos pelo CPF',p:'r'}]:[]),
      {...ddA('https://www.cnj.jus.br/pjecnj/',`Nome: "${nome}"`),label:'CNJ — consulta processual nacional',p:'r'},
      {...ddA(`https://www.in.gov.br/consulta/-/buscar/dou?q=${encodeURIComponent('"'+nome+'"')}`,`"${nome}"`),label:'Diário Oficial da União — publicações exatas',p:'a',v:ddVfDou(nome)},
      {...ddA(`https://queridodiario.ok.org.br/pesquisa?termo=${encodeURIComponent('"'+nome+'"')}`,`"${nome}"`),label:'Querido Diário — diários oficiais de 350+ municípios',p:'a',v:ddVfQD(nome)},
      {...ddG(`"${nome}" "execução fiscal" OR protesto OR "dívida ativa" OR inadimplente`),label:`Google — "${nome}" execução fiscal`,p:'a',isMidia:true},
    ]},
    ...(end?[{title:'🏠 Verificação de endereço',items:[
      {...ddA(`https://www.google.com/maps?q=${endQ}&layer=c`,`Endereço: ${end}`),label:'Google Street View — verificar endereço',p:'a'},
      {...ddA(`https://www.google.com/maps/search/${endQ}`,end),label:'Google Maps — localização',p:'a'},
      {...ddG(`"${nome}" "${end}"`),label:'Google — nome + endereço exatos',p:'a'},
    ]}]:[]),
    {title:'🌐 Redes sociais',items:(()=>{
      const nomeCurto=ddNomeCurto(nome);
      return[
      {...ddA(`https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(nomeCurto)}`,nomeCurto),label:'Instagram — busca interna da rede (melhor cobertura; requer login)',p:'a'},
      {...ddA(`https://www.facebook.com/search/people/?q=${encodeURIComponent(nomeCurto)}`,nomeCurto),label:'Facebook — busca interna de pessoas (requer login)',p:'a'},
      {...ddA(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(nome)}`,nome),label:'LinkedIn — busca interna de pessoas',p:'a'},
      {...ddG(`"${nomeCurto}" site:instagram.com OR site:facebook.com OR site:linkedin.com`),label:`Redes via Google — "${nomeCurto}" (nome curto: nome completo raramente existe em perfil)`,p:'a'},
      {...ddG(`"${nome}" aposta OR bet OR cassino OR rifa`),label:'🚨 ALERTA PLD — apostas/bets (nome completo)',p:'r',isMidia:true},
      {...ddG(`"${nomeCurto}" aposta OR bet OR cassino OR rifa`),label:`🚨 ALERTA PLD — apostas/bets ("${nomeCurto}")`,p:'r',isMidia:true},
      ];})()},
    ...(empresa?[{title:'🏢 Empresa(s) vinculada(s)',items:[
      {...ddG(`"${nome}" "${empresa}"`),label:`Google — "${nome}" + empresa vinculada`,p:'a'},
      {...ddA(`https://www.jusbrasil.com.br/consulta-processual/?q=${encodeURIComponent(empresa)}`,empresa),label:`JusBrasil — processos da empresa "${empresa}"`,p:'a'},
      {...ddG(buildBooleanQuery(empresa,'').criminal),label:`Boolean mídias negativas — empresa "${empresa}"`,p:'r',isMidia:true},
    ]}]:[]),
    {title:'🏛️ Órgãos reguladores — habilitação profissional',items:[
      {...ddA(`https://cna.oab.org.br/Advogado/BuscaAvancada?Nome=${encodeURIComponent(nome)}`,`"${nome}"`),label:'OAB — advogado (ativo / suspenso / cancelado)',p:'r'},
      {...ddA(`https://portal.cfm.org.br/busca-medicos/?nome=${encodeURIComponent(nome)}`,`"${nome}"`),label:'CFM — médico (ativo / suspenso / cassado)',p:'r'},
      {...ddA(`https://cadastro.cfp.org.br/`,`"${nome}"`),label:'CFP — psicólogo',p:'r'},
      {...ddA(`https://busca-profissionais.cfo.org.br/`,`"${nome}"`),label:'CFO — cirurgião-dentista',p:'r'},
      {...ddA('https://consultaprofissional.confea.org.br/',`Pesquisar: "${nome}"`),label:'CREA — engenheiro / técnico (busca manual)',p:'r'},
      {...ddA('https://acheumarquiteto.caubr.gov.br/',`Pesquisar: "${nome}"`),label:'CAU — arquiteto (busca manual)',p:'r'},
      {...ddA('https://www3.cfc.org.br/spw/consultanacionalcfc/cfc',`Pesquisar: "${nome}"`),label:'CFC/CRC — contador (busca manual)',p:'r'},
      {...ddA('https://www.cofeci.gov.br/',`Pesquisar: "${nome}"`),label:'CRECI/COFECI — corretor de imóveis',p:'r'},
      {...ddA('https://www.bcb.gov.br/',`Pesquisar: "${nome}"`),label:'BACEN — operador financeiro / câmbio',p:'r'},
      {...ddA('https://www.cvm.gov.br/',`Pesquisar: "${nome}"`),label:'CVM — agente autônomo de investimentos',p:'r'},
      {...ddA('https://portaldatransparencia.gov.br/sancoes/ceis?termo='+encodeURIComponent(nome),nome),label:'🔴 CEIS — impedido de contratar com o governo',p:'r',v:ddVfPortal('ceis','nomeSancionado='+encodeURIComponent(nome))},
      {...ddA('https://portaldatransparencia.gov.br/sancoes/cnep?termo='+encodeURIComponent(nome),nome),label:'🔴 CNEP — punições e sanções',p:'r',v:ddVfPortal('cnep','nomeSancionado='+encodeURIComponent(nome))},
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
function ddRenderGrupos(grupos){
  ddVfFila=[]; // descarta selos de uma geração anterior de links
  return grupos.map(g=>{
    const linksHtml=g.items.map(l=>ddLiHTML(l)).join('');
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
      <div style="background:#f0fdf9;border:1px solid #6ee7b7;border-radius:7px;padding:8px 12px;margin-bottom:13px;font-size:.77rem;color:#065f46;display:flex;gap:7px;align-items:center"><span>ℹ️</span><span>Fontes com selo <strong style="color:#15803d">✅</strong>/<strong style="color:#b91c1c">🔴</strong> foram consultadas automaticamente na própria base oficial — o número indica quantos registros a fonte retornou. Selo <strong>manual</strong> = a fonte não tem API pública (CAPTCHA/bloqueio): abra o link e confira. Selos <strong>🟣 MÍDIA NEG.</strong> indicam queries booleanas voltadas a achar conteúdo negativo.</span></div>
      ${ddRenderGrupos(grupos)}
    </div>
  </div>
  <div class="dd-disc">⚠️ Busca exata com aspas duplas · Queries booleanas para mídias negativas eliminam ruído de redes sociais · Não substitui due diligence jurídica · ${dtStr}</div>
  <div style="display:flex;gap:10px;margin-top:14px">
    <button class="btn btn-outline" onclick="window.print()" style="flex:1;justify-content:center">🖨️ Imprimir / Salvar como PDF</button>
  </div>`;

  const res=document.getElementById('pj-result');
  res.innerHTML=html;res.style.display='block';
  res.scrollIntoView({behavior:'smooth',block:'start'});
  ddRodarVerificacoes();
}

// ── RENDER PF ─────────────────────────────
function pfRender(nome,cpf,cpfFmt,end,empresa,pep){
  const alertas=[],atencao=[];
  if(pep==='sim') alertas.push('Pessoa Politicamente Exposta (PEP) — diligência ampliada obrigatória conforme normativa BACEN');
  else if(pep==='relacionado') atencao.push('Relacionado a PEP — verificar grau de relacionamento e exigir documentação adicional');

  const nivel=alertas.length?'alto':atencao.length?'medio':'baixo';
  const nivelLabel=nivel==='alto'?'⛔ ALTO RISCO — PEP identificado':nivel==='medio'?'⚠️ RISCO MÉDIO — Verificar pontos sinalizados':'✅ RISCO INICIAL BAIXO — Complete a pesquisa';

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
      <div style="background:#f0fdf9;border:1px solid #6ee7b7;border-radius:7px;padding:8px 12px;margin-bottom:13px;font-size:.77rem;color:#065f46;display:flex;gap:7px;align-items:center"><span>ℹ️</span><span>Fontes com selo <strong style="color:#15803d">✅</strong>/<strong style="color:#b91c1c">🔴</strong> foram consultadas automaticamente na própria base oficial — o número indica quantos registros a fonte retornou. Selo <strong>manual</strong> = a fonte não tem API pública (CAPTCHA/bloqueio): abra o link e confira. Selos <strong>🟣 MÍDIA NEG.</strong> indicam queries booleanas voltadas a achar conteúdo negativo.</span></div>
      ${ddRenderGrupos(grupos)}
    </div>
  </div>
  <div class="dd-disc">⚠️ Busca booleana com aspas duplas e operadores AND/OR/NOT · Ruído de redes sociais filtrado com -site: · Não substitui due diligence jurídica · ${dtStr}</div>
  <button class="btn btn-outline" onclick="window.print()" style="margin-top:10px;width:100%;justify-content:center">🖨️ Imprimir / Salvar como PDF</button>`;

  const res=document.getElementById('pf-result');
  res.innerHTML=html;res.style.display='block';
  res.scrollIntoView({behavior:'smooth',block:'start'});
  ddRodarVerificacoes();
}

// ── AÇÕES PJ ──────────────────────────────
async function pjConsultar(){
  const raw=ddV('pj-cnpj').replace(/\D/g,'');
  if(raw.length!==14){alert('Informe um CNPJ válido com 14 dígitos.');return;}
  ddCnpjN=raw;
  if(typeof auditLog==='function') auditLog('pesquisa','due-diligence',`Consulta CNPJ ${ddFmt(raw)}`,{tipo:'cnpj'});
  const btn=document.getElementById('pj-btnapi');
  btn.disabled=true;document.getElementById('pj-bico').textContent='⏳';document.getElementById('pj-btxt').textContent='Consultando APIs...';
  document.getElementById('pj-log').innerHTML='';document.getElementById('pj-logwrap').style.display='block';
  document.getElementById('pj-result').style.display='none';document.getElementById('pj-result').innerHTML='';
  document.getElementById('pj-manbox').style.display='none';
  ddAddLog('pj','Consultando 3 APIs públicas...','ok');
  const apis=[{name:'BrasilAPI',url:`https://brasilapi.com.br/api/cnpj/v1/${raw}`},{name:'ReceitaWS',url:`https://www.receitaws.com.br/v1/cnpj/${raw}`},{name:'CNPJ.ws',url:`https://publica.cnpj.ws/cnpj/${raw}`}];
  let found=null;
  for(const a of apis){const l=ddAddLog('pj',`Tentando ${a.name}...`,'spin');found=await ddTryApi(a.url,a.name,l);if(found)break;await new Promise(r=>setTimeout(r,350));}
  btn.disabled=false;document.getElementById('pj-bico').textContent='🔍';document.getElementById('pj-btxt').textContent='Consultar APIs + gerar links';
  if(!found){ddAddLog('pj','Todas as APIs bloqueadas — ativando modo manual','err');pjBuildManLinks(raw);document.getElementById('pj-manbox').style.display='block';pjSomenteLinks(true);return;}
  const info=ddNorm(found.data,found.api);if(!info){ddAddLog('pj','Erro ao processar resposta','err');return;}
  ddSet('pj-razao',info.razao);if(info.endereco&&!ddV('pj-end'))ddSet('pj-end',info.endereco);
  if(info.socios?.length&&!ddV('pj-socios'))ddSet('pj-socios',info.socios.map(s=>s.nome).filter(Boolean).join(', '));
  if(info.uf){const sel=document.getElementById('pj-estado');if(sel&&!sel.value)for(let o of sel.options){if(o.value===info.uf){sel.value=info.uf;break;}}}
  pjRender(info,raw,found.api);
}

// interno=true quando chamado pelo próprio pjConsultar() como fallback (todas
// as APIs falharam) — evita logar a mesma pesquisa duas vezes.
function pjSomenteLinks(interno){
  const raw=ddV('pj-cnpj').replace(/\D/g,'');if(!raw){alert('Informe o CNPJ primeiro.');return;}
  if(!interno && typeof auditLog==='function') auditLog('pesquisa','due-diligence',`Consulta CNPJ ${ddFmt(raw)} (links manuais)`,{tipo:'cnpj'});
  ddCnpjN=raw;const cnpjFmt=ddFmt(raw);
  const razao=ddV('pj-razao')||ddV('pj-fantasia')||cnpjFmt;
  const fantasia=ddV('pj-fantasia');const endStr=ddV('pj-end');
  const socios=ddV('pj-socios').split(',').map(s=>s.trim()).filter(Boolean).map(n=>({nome:n,qual:''}));
  const uf=ddV('pj-estado');
  const grupos=pjBuildGrupos(razao,fantasia,raw,cnpjFmt,endStr,socios,uf);
  const res=document.getElementById('pj-result');
  res.innerHTML=`
    <div class="dd-rb"><div class="dd-rt baixo"><div><div class="dd-rl baixo">📋 Links gerados — complete a pesquisa</div><div class="dd-rs" style="color:#065f46">Busca exata + mídias negativas + operadores booleanos</div></div></div></div>
    ${ddMidiasHTML(razao,cnpjFmt)}
    <div class="section"><div class="section-header"><h2>🔗 Links de pesquisa</h2></div><div class="section-body">${ddRenderGrupos(grupos)}</div></div>
    <div class="dd-disc">Todos os links usam aspas duplas para busca exata. Se não encontrar resultado, remova as aspas manualmente no Google.</div>`;
  res.style.display='block';res.scrollIntoView({behavior:'smooth',block:'start'});
  ddRodarVerificacoes();
}

function pfGerar(){
  const nome=ddV('pf-nome');
  if(!nome){alert('Informe o nome completo da pessoa física.');return;}
  const cpf=ddV('pf-cpf').replace(/\D/g,'');
  const cpfFmt=cpf.length===11?cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4'):ddV('pf-cpf');
  if(typeof auditLog==='function') auditLog('pesquisa','due-diligence',`Consulta CPF de "${nome}"${cpfFmt?' — '+cpfFmt:''}`,{tipo:'cpf'});
  const end=ddV('pf-end');const empresa=ddV('pf-empresa');const pep=ddV('pf-pep');
  document.getElementById('pf-result').style.display='none';document.getElementById('pf-result').innerHTML='';
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
}
// ══════════════════════════════════════════
// END DUE DILIGENCE MODULE v4
// ══════════════════════════════════════════
