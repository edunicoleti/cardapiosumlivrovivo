/* ==========================================================================
   O livro — leitor
   O conteúdo chega como JSON (blocos normalizados do Notion) e vira HTML aqui.
   Quem rola é a página, não uma caixa interna: no celular isso é a diferença
   entre um leitor que funciona e um que trava.
   ========================================================================== */

import { $, $$, esc, semAcento, memoria, avisar, prepararDialogo } from './plataforma.js'

/* O livro guarda cor como nome do Notion ("red", "red_background"), não como
   hexadecimal. O leitor antigo escrevia background:#red_background — inválido —
   e por isso as tabelas de sazonalidade apareciam em branco. */
const CORES_TEXTO = {
  red: '#A33A2A', orange: '#B85F10', yellow: '#8A6A0B', green: '#2F6F5C',
  teal: '#0C718B', blue: '#1F5FA8', purple: '#6B4E9B', pink: '#A8437A',
  brown: '#7A5A3C', gray: '#6B7770',
}
const FUNDOS = {
  red_background: '#FBEDEA', orange_background: '#FDF1E3', yellow_background: '#FAF3DC',
  green_background: '#EAF2ED', teal_background: '#E6F1F4', blue_background: '#EAF0F9',
  purple_background: '#F1ECF8', pink_background: '#FAECF3', brown_background: '#F4EEE8',
  gray_background: '#F1F2EC',
}

const CHAVE_POSICAO = 'livro-posicao'
const CHAVE_TAMANHO = 'livro-tamanho'

let livro = null
let secoes = []   // sumário achatado
let indice = []   // trechos pesquisáveis
let atual = 0
let termoAtivo = ''
let achados = []
let achadoAtual = 0

/* ------------------------------------------------------------ texto rico */
function runs(lista) {
  return (lista ?? []).map((r) => {
    let t = esc(r.txt)
    if (r.cod) t = `<code>${t}</code>`
    if (r.b) t = `<strong>${t}</strong>`
    if (r.i) t = `<em>${t}</em>`
    if (r.u) t = `<u>${t}</u>`
    const cor = CORES_TEXTO[r.cor]
    if (cor) t = `<span style="color:${cor}">${t}</span>`
    return t
  }).join('')
}
const texto = (lista) => (lista ?? []).map((r) => r.txt).join('')

/* ------------------------------------------------------------ blocos */
function bloco(b) {
  switch (b.t) {
    case 'h1': return `<h3>${runs(b.runs)}</h3>`
    case 'h2': return `<h4>${runs(b.runs)}</h4>`
    case 'h3': return `<h5>${runs(b.runs)}</h5>`
    case 'p': {
      const t = runs(b.runs)
      return (t ? `<p>${t}</p>` : '') + filhos(b)
    }
    case 'li': return `<ul><li>${runs(b.runs)}${filhos(b)}</li></ul>`
    case 'citacao':
    case 'destaque': return `<blockquote>${runs(b.runs)}${filhos(b)}</blockquote>`
    case 'separador':
    case 'video': return ''
    case 'secao': return `<h4>${esc(b.titulo)}</h4>${(b.blocos ?? []).map(bloco).join('')}`
    case 'imagem':
      if (b.semArquivo || !b.arquivo) return ''
      return `<figure><img class="ilustra" loading="lazy" decoding="async" alt=""
        src="/app/imagem.php?f=${encodeURIComponent(b.arquivo)}"></figure>`
    case 'tabela': return tabela(b)
    default: return ''
  }
}
const filhos = (b) => (b.filhos ?? []).map(bloco).join('')

function tabela(b) {
  const linhas = (b.linhas ?? []).map((linha, i) => {
    const cabecalho = b.cabecalho && i === 0
    const celulas = linha.map((c) => {
      const conteudo = runs(c.runs)
      // célula sem texto e só com cor: no livro isso quer dizer "marcado neste mês".
      // Sem uma marca visível o dado some — e some de vez para quem não vê cor.
      if (!conteudo && c.cor && c.cor.endsWith('_background')) {
        return '<td class="marcada"><span class="so-leitor">marcado</span></td>'
      }
      const fundo = FUNDOS[c.cor] ? ` style="background:${FUNDOS[c.cor]}"` : ''
      return `<td${fundo}>${conteudo}</td>`
    }).join('')
    return `<tr${cabecalho ? ' class="cab"' : ''}>${celulas}</tr>`
  }).join('')
  return `<div class="tab" tabindex="0" role="region" aria-label="Tabela do livro">
    <table><tbody>${linhas}</tbody></table></div>`
}

/* ------------------------------------------------------------ montagem */
function achatar() {
  secoes = []
  if (livro.preTextuais?.length) {
    secoes.push({ nivel: 1, titulo: 'Apresentação', pai: '', blocos: livro.preTextuais, faixa: null })
  }
  for (const cap of livro.capitulos) {
    secoes.push({ nivel: 1, titulo: cap.titulo, pai: '', blocos: cap.blocos, faixa: cap.faixa })
    for (const s of cap.secoes ?? []) {
      secoes.push({ nivel: 2, titulo: s.titulo, pai: cap.titulo, blocos: s.blocos, faixa: s.faixa })
      for (const ss of s.secoes ?? []) {
        secoes.push({ nivel: 2, titulo: ss.titulo, pai: cap.titulo, blocos: ss.blocos, faixa: ss.faixa })
      }
    }
  }
  // seções sem título aparecem no sumário como uma linha em branco
  secoes = secoes.filter((s) => String(s.titulo ?? '').trim() !== '')
}

function indexar() {
  indice = []
  secoes.forEach((secao, i) => {
    const anda = (blocos) => {
      for (const b of blocos ?? []) {
        const t = texto(b.runs).trim()
        if (t.length > 2) indice.push({ i, t })
        if (b.t === 'tabela') {
          for (const linha of b.linhas ?? []) {
            const ct = linha.map((c) => texto(c.runs)).filter(Boolean).join(' · ').trim()
            if (ct.length > 2) indice.push({ i, t: ct })
          }
        }
        anda(b.filhos); anda(b.blocos)
      }
    }
    anda(secao.blocos)
  })
  for (const r of indice) r.chave = semAcento(r.t)
}

/* ------------------------------------------------------------ sumário */
function htmlSumario() {
  return '<ul class="sumario">' + secoes.map((s, i) =>
    `<li class="${s.nivel === 2 ? 'n2' : ''}">
      <button data-i="${i}" aria-current="${i === atual}">${esc(s.titulo)}</button></li>`).join('') + '</ul>'
}

function desenharSumario() {
  for (const caixa of [$('navegacao'), $('navegacaoFolha')]) {
    if (!caixa) continue
    caixa.innerHTML = htmlSumario()
    for (const b of $$('button', caixa)) {
      b.addEventListener('click', () => { abrir(+b.dataset.i); fecharFolha() })
    }
  }
  rolarSumarioAteAtual()
}

function rolarSumarioAteAtual() {
  const alvo = $('navegacao')?.querySelector('[aria-current="true"]')
  if (alvo) alvo.scrollIntoView({ block: 'nearest' })
}

/* ------------------------------------------------------------ leitura */
function abrir(i, termo, y = 0) {
  atual = Math.max(0, Math.min(i, secoes.length - 1))
  const secao = secoes[atual]

  const capa = secao.faixa
    ? `<img class="capa-cap" alt="" loading="eager" src="/app/imagem.php?f=${encodeURIComponent(secao.faixa)}">`
    : ''
  const trilha = secao.pai ? `<div class="trilha-cap">${esc(secao.pai)}</div>` : ''

  $('leitura').innerHTML = capa +
    `<div class="corpo">${trilha}<h1 class="titulo-cap">${esc(secao.titulo)}</h1><div class="regua"></div>` +
    (secao.blocos ?? []).map(bloco).join('') + '</div>' + htmlPassos()

  for (const b of $$('.passo', $('leitura'))) {
    b.addEventListener('click', () => abrir(+b.dataset.i))
  }

  const tituloTopo = document.querySelector('.topo .titulo')
  if (tituloTopo) tituloTopo.textContent = secao.titulo
  document.title = secao.titulo + ' · Cardápios: Um Livro Vivo'

  if (!buscaAtiva()) desenharSumario()
  else marcarAtualNoSumario()

  if (termo) {
    realcar(termo)
  } else {
    limparAchados()
    window.scrollTo({ top: y, behavior: 'auto' })
  }
  guardarPosicao()
}

function marcarAtualNoSumario() {
  for (const b of $$('.sumario button')) b.setAttribute('aria-current', String(+b.dataset.i === atual))
}

function htmlPassos() {
  const anterior = secoes[atual - 1]
  const proximo = secoes[atual + 1]
  return `<div class="passos">
    <button class="passo" type="button" data-i="${atual - 1}" ${anterior ? '' : 'disabled'}>
      <svg aria-hidden="true"><use href="#i-esq"></use></svg>
      <span class="txt"><span class="q">Anterior</span>
        <span class="t">${anterior ? esc(anterior.titulo) : '—'}</span></span>
    </button>
    <button class="passo adiante" type="button" data-i="${atual + 1}" ${proximo ? '' : 'disabled'}>
      <svg aria-hidden="true"><use href="#i-dir"></use></svg>
      <span class="txt"><span class="q">Próximo</span>
        <span class="t">${proximo ? esc(proximo.titulo) : '—'}</span></span>
    </button>
  </div>`
}

/* ------------------------------------------------------------ realce */
function realcar(termo) {
  limparAchados()
  const alvo = semAcento(termo)
  if (alvo.length < 2) return

  const caminhante = document.createTreeWalker($('leitura'), NodeFilter.SHOW_TEXT, {
    acceptNode: (no) => no.parentElement.closest('.passos')
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  })
  const alvos = []
  let no
  while ((no = caminhante.nextNode())) {
    const pos = semAcento(no.nodeValue).indexOf(alvo)
    if (pos >= 0) alvos.push({ no, pos })
  }

  for (const { no, pos } of alvos.slice(0, 200)) {
    const marca = document.createElement('span')
    marca.className = 'marca-busca'
    const meio = no.splitText(pos)
    meio.splitText(alvo.length)
    marca.textContent = meio.nodeValue
    meio.parentNode.replaceChild(marca, meio)
  }

  achados = $$('.marca-busca', $('leitura'))
  termoAtivo = termo
  if (!achados.length) return
  achadoAtual = 0
  irParaAchado(0)
  $('achados').hidden = false
}

function irParaAchado(k) {
  if (!achados.length) return
  achadoAtual = (k + achados.length) % achados.length
  achados.forEach((m, j) => m.classList.toggle('ativa', j === achadoAtual))
  achados[achadoAtual].scrollIntoView({ block: 'center', behavior: 'smooth' })
  $('achadosConta').textContent = `${achadoAtual + 1} de ${achados.length}`
}

function limparAchados() {
  achados = []
  $('achados').hidden = true
  for (const m of $$('.marca-busca', $('leitura'))) {
    m.replaceWith(document.createTextNode(m.textContent))
  }
}

/* ------------------------------------------------------------ busca */
const buscaAtiva = () => String($('busca').value || $('buscaFolha').value).trim().length >= 2

function buscar(termo) {
  const limpo = termo.trim()
  const alvo = semAcento(limpo)
  $('limparBusca').hidden = limpo === ''
  $('limparBuscaFolha').hidden = limpo === ''

  if (alvo.length < 2) { desenharSumario(); return }

  const encontrados = []
  for (const r of indice) {
    const pos = r.chave.indexOf(alvo)
    if (pos < 0) continue
    encontrados.push({ ...r, pos })
    if (encontrados.length >= 120) break
  }

  const html = !encontrados.length
    ? `<div class="vazio-busca">Nada encontrado para <mark>${esc(limpo)}</mark>.<br>
       Tente uma palavra sozinha, sem o plural.</div>`
    : `<div class="contagem-busca">
         <span>${encontrados.length}${encontrados.length === 120 ? '+' : ''} trecho${encontrados.length > 1 ? 's' : ''}</span>
       </div>
       <ul class="resultados">` + encontrados.map((a, k) => {
      const ini = Math.max(0, a.pos - 42)
      const bruto = a.t.slice(ini, ini + 150)
      const trecho = (ini > 0 ? '…' : '') + esc(bruto) + (a.t.length > ini + 150 ? '…' : '')
      return `<li><button data-k="${k}">
        <span class="onde">${esc(secoes[a.i].titulo)}</span>
        <span class="trecho">${trecho}</span></button></li>`
    }).join('') + '</ul>'

  for (const caixa of [$('navegacao'), $('navegacaoFolha')]) {
    if (!caixa) continue
    caixa.innerHTML = html
    for (const b of $$('button[data-k]', caixa)) {
      b.addEventListener('click', () => {
        abrir(encontrados[+b.dataset.k].i, limpo)
        fecharFolha()
      })
    }
  }
}

function sincronizarBusca(valor, origem) {
  const outro = origem === 'lateral' ? $('buscaFolha') : $('busca')
  if (outro.value !== valor) outro.value = valor
  buscar(valor)
}

function limparBusca() {
  $('busca').value = ''
  $('buscaFolha').value = ''
  $('limparBusca').hidden = true
  $('limparBuscaFolha').hidden = true
  limparAchados()
  desenharSumario()
}

/* ------------------------------------------------------------ progresso */
let ticando = false
function aoRolar() {
  if (ticando) return
  ticando = true
  requestAnimationFrame(() => {
    ticando = false
    const alto = document.documentElement.scrollHeight - window.innerHeight
    const parte = alto > 0 ? Math.min(1, window.scrollY / alto) : 0
    $('progresso').style.width = (parte * 100).toFixed(1) + '%'
    adiarPosicao()
  })
}

let relogioPosicao
function adiarPosicao() {
  clearTimeout(relogioPosicao)
  relogioPosicao = setTimeout(guardarPosicao, 400)
}
function guardarPosicao() {
  const secao = secoes[atual]
  if (!secao) return
  memoria.gravar(CHAVE_POSICAO, { i: atual, titulo: secao.titulo, y: Math.round(window.scrollY) })
}

/* ------------------------------------------------------------ tamanho */
function aplicarTamanho(t) {
  $('leitura').dataset.tamanho = t
  for (const b of $$('#opcoesTamanho button')) b.setAttribute('aria-pressed', String(b.dataset.t === t))
  memoria.gravar(CHAVE_TAMANHO, t)
}

/* ------------------------------------------------------------ folha */
const fecharFolha = () => $('folhaSumario').open && $('folhaSumario').close()

function abrirFolha(focoNaBusca = false) {
  $('folhaSumario').showModal()
  if (focoNaBusca) setTimeout(() => $('buscaFolha').focus(), 120)
}

/* ------------------------------------------------------------ início */
function ligarEventos() {
  let debounce
  const digitou = (origem) => (evento) => {
    clearTimeout(debounce)
    const valor = evento.target.value
    debounce = setTimeout(() => sincronizarBusca(valor, origem), 150)
  }
  $('busca').addEventListener('input', digitou('lateral'))
  $('buscaFolha').addEventListener('input', digitou('folha'))
  $('limparBusca').addEventListener('click', () => { limparBusca(); $('busca').focus() })
  $('limparBuscaFolha').addEventListener('click', () => { limparBusca(); $('buscaFolha').focus() })

  $('achadoAnterior').addEventListener('click', () => irParaAchado(achadoAtual - 1))
  $('achadoProximo').addEventListener('click', () => irParaAchado(achadoAtual + 1))
  $('acharFim').addEventListener('click', limparAchados)

  for (const b of $$('#opcoesTamanho button')) {
    b.addEventListener('click', () => aplicarTamanho(b.dataset.t))
  }

  prepararDialogo($('folhaSumario'))
  prepararDialogo($('dlgLeitura'))

  $('btSumario')?.addEventListener('click', () => abrirFolha(false))
  $('btBusca')?.addEventListener('click', () => abrirFolha(true))
  for (const b of $$('[data-abre="leitura"]')) b.addEventListener('click', () => $('dlgLeitura').showModal())

  window.addEventListener('scroll', aoRolar, { passive: true })

  document.addEventListener('keydown', (evento) => {
    if (evento.target.matches('input, textarea') || evento.metaKey || evento.ctrlKey) return
    if (evento.key === 'ArrowRight' || evento.key === 'j') abrir(atual + 1)
    if (evento.key === 'ArrowLeft' || evento.key === 'k') abrir(atual - 1)
    if (evento.key === '/') { evento.preventDefault(); ($('busca').offsetParent ? $('busca') : $('buscaFolha')).focus() }
  })
}

async function iniciar() {
  aplicarTamanho(memoria.ler(CHAVE_TAMANHO, 'm'))
  ligarEventos()

  let resposta
  try {
    resposta = await fetch('/app/conteudo.php?arquivo=livro')
  } catch {
    return falhar('Não consegui carregar o livro. Confira a conexão e recarregue a página.')
  }
  if (resposta.status === 403) { location.href = '/app/'; return }
  if (!resposta.ok) return falhar('O livro não está disponível agora. Tente de novo em instantes.')

  try {
    livro = await resposta.json()
  } catch {
    return falhar('O arquivo do livro veio incompleto. Recarregue a página.')
  }

  achatar()
  indexar()
  desenharSumario()

  const marca = memoria.ler(CHAVE_POSICAO)
  if (marca && Number.isInteger(marca.i) && secoes[marca.i] && marca.titulo === secoes[marca.i].titulo) {
    abrir(marca.i, '', marca.y || 0)
    if ((marca.y || 0) > 200 || marca.i > 0) avisar('Voltamos para onde você parou.')
  } else {
    abrir(0)
  }
}

function falhar(recado) {
  $('leitura').innerHTML = `<div class="carregando">
    <svg style="width:26px;height:26px;color:var(--laranja-esc)" aria-hidden="true"><use href="#i-atencao"></use></svg>
    ${esc(recado)}</div>`
  $('navegacao').innerHTML = ''
}

iniciar()
