<?php
declare(strict_types=1);
require dirname(__DIR__) . '/lib/acesso.php';
require dirname(__DIR__) . '/lib/tela.php';
$usuario = exigirLogin();
abrirTela('O livro', $usuario, 'livro');
?>
<style>
  main{padding-top:0}
  .leitor{display:grid;grid-template-columns:290px 1fr;gap:0;min-height:70vh;
          background:#fff;border:1px solid var(--linha);border-radius:12px;overflow:hidden;margin-top:22px}
  .lateral{border-right:1px solid var(--linha);background:var(--creme-cl);
           max-height:78vh;overflow-y:auto;position:sticky;top:0}
  .busca{padding:14px;border-bottom:1px solid var(--linha);background:var(--creme-cl);position:sticky;top:0;z-index:2}
  .busca input{width:100%;font-family:var(--corpo);font-size:14px;padding:9px 12px;
               border:1px solid var(--linha);border-radius:8px;margin:0}
  .sumario{list-style:none;padding:8px 0 20px}
  .sumario li{margin:0}
  .sumario button{width:100%;text-align:left;background:none;border:none;cursor:pointer;
                  font-family:var(--corpo);font-size:13.4px;color:var(--tinta-sv);
                  padding:8px 14px;line-height:1.35}
  .sumario button:hover{background:#fff;color:var(--verde-esc)}
  .sumario button[aria-current="true"]{background:#fff;color:var(--verde-prof);font-weight:600;
                                       box-shadow:inset 3px 0 0 var(--laranja)}
  .sumario .nivel2 button{padding-left:28px;font-size:12.8px}

  .conteudo{padding:0 0 48px;max-height:78vh;overflow-y:auto}
  .faixa{width:100%;display:block}
  .corpo{padding:26px 34px;max-width:74ch}
  .corpo h2.cap{font-family:var(--display);font-size:1.55rem;color:var(--verde-prof);margin:0 0 16px}
  .corpo h3{font-family:var(--display);font-size:1.15rem;color:var(--verde-esc);margin:26px 0 8px}
  .corpo h4{font-family:var(--display);font-size:1rem;color:var(--tinta);margin:20px 0 6px}
  .corpo h5{font-family:var(--corpo);font-size:.85rem;font-weight:600;letter-spacing:.05em;
            text-transform:uppercase;color:var(--teal);margin:18px 0 6px}
  .corpo p{margin:0 0 12px;font-size:14.6px;line-height:1.66;color:var(--tinta)}
  .corpo ul{margin:0 0 12px 20px}
  .corpo li{font-size:14.6px;line-height:1.6;margin-bottom:5px;color:var(--tinta)}
  .corpo blockquote{border-left:3px solid var(--verde);background:var(--creme-cl);
                    padding:12px 16px;margin:0 0 14px;border-radius:0 8px 8px 0;color:var(--verde-esc)}
  .corpo img.ilustra{max-width:100%;height:auto;border-radius:8px;margin:12px 0;display:block}
  .corpo .tab{overflow-x:auto;margin:0 0 16px;border:1px solid var(--linha);border-radius:8px}
  .corpo table{min-width:100%;font-size:13px}
  .corpo table td{border-bottom:1px solid var(--linha);border-right:1px solid var(--linha);
                  padding:7px 10px;vertical-align:top}
  .corpo table tr.cab td{background:var(--verde-esc);color:#fff;font-weight:600}
  .marca-busca{background:#FBEEDF;color:var(--laranja-esc);border-radius:3px;padding:0 2px}

  .resultados{list-style:none;padding:6px 0 20px}
  .resultados li{border-bottom:1px solid var(--linha)}
  .resultados button{width:100%;text-align:left;background:none;border:none;cursor:pointer;
                     font-family:var(--corpo);padding:11px 14px}
  .resultados button:hover{background:#fff}
  .resultados .onde{font-size:10.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
                    color:var(--laranja-esc);display:block;margin-bottom:3px}
  .resultados .trecho{font-size:12.8px;color:var(--tinta-sv);line-height:1.45}
  .vazio{padding:16px 14px;font-size:13px;color:var(--tinta-fr)}
  .carregando{padding:40px;text-align:center;color:var(--tinta-fr)}
  @media(max-width:860px){
    .leitor{grid-template-columns:1fr}
    .lateral{max-height:none;position:static;border-right:none;border-bottom:1px solid var(--linha)}
    .conteudo{max-height:none}
    .corpo{padding:22px 18px}
  }
</style>

<h1>O livro</h1>
<p class="sub">Onze capítulos, glossário e anexos. Use a busca para achar um termo,
   um fator de correção ou uma preparação sem folhear nada.</p>

<div class="leitor">
  <aside class="lateral">
    <div class="busca">
      <input type="search" id="busca" placeholder="Buscar no livro inteiro" autocomplete="off">
    </div>
    <div id="navegacao"><div class="carregando">Carregando…</div></div>
  </aside>
  <section class="conteudo" id="conteudo">
    <div class="carregando">Carregando o livro…</div>
  </section>
</div>

<script type="module">
const $ = (id) => document.getElementById(id)
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

let livro = null
let secoes = []      // lista plana para o sumario
let indice = []      // trechos pesquisaveis
let atual = 0

// ------------------------------------------------------------- texto rico
function runs(lista) {
  return (lista ?? []).map((r) => {
    let t = esc(r.txt)
    if (r.cod) t = `<code>${t}</code>`
    if (r.b) t = `<strong>${t}</strong>`
    if (r.i) t = `<em>${t}</em>`
    if (r.u) t = `<u>${t}</u>`
    if (r.cor) t = `<span style="color:#${esc(r.cor)}">${t}</span>`
    return t
  }).join('')
}
const texto = (lista) => (lista ?? []).map((r) => r.txt).join('')

// ------------------------------------------------------------- blocos
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
    case 'citacao': return `<blockquote>${runs(b.runs)}${filhos(b)}</blockquote>`
    case 'destaque': return `<blockquote>${runs(b.runs)}${filhos(b)}</blockquote>`
    case 'separador': return ''
    case 'video': return ''
    case 'secao': return `<h4>${esc(b.titulo)}</h4>${(b.blocos ?? []).map(bloco).join('')}`
    case 'imagem':
      if (b.semArquivo || !b.arquivo) return ''
      return `<img class="ilustra" loading="lazy" alt="" src="/app/imagem.php?f=${encodeURIComponent(b.arquivo)}">`
    case 'tabela': return tabela(b)
    default: return ''
  }
}
const filhos = (b) => (b.filhos ?? []).map(bloco).join('')

function tabela(b) {
  const linhas = (b.linhas ?? []).map((linha, i) => {
    const cabecalho = b.cabecalho && i === 0
    const celulas = linha.map((c) => {
      const fundo = c.cor ? ` style="background:#${esc(c.cor)}"` : ''
      return `<td${fundo}>${runs(c.runs)}</td>`
    }).join('')
    return `<tr${cabecalho ? ' class="cab"' : ''}>${celulas}</tr>`
  }).join('')
  return `<div class="tab"><table><tbody>${linhas}</tbody></table></div>`
}

// ------------------------------------------------------------- montagem
function achatar() {
  secoes = []
  if (livro.preTextuais?.length) {
    secoes.push({ nivel: 1, titulo: 'Apresentação', blocos: livro.preTextuais, faixa: null })
  }
  for (const cap of livro.capitulos) {
    secoes.push({ nivel: 1, titulo: cap.titulo, blocos: cap.blocos, faixa: cap.faixa })
    for (const s of cap.secoes ?? []) {
      secoes.push({ nivel: 2, titulo: s.titulo, blocos: s.blocos, faixa: s.faixa })
      for (const ss of s.secoes ?? []) {
        secoes.push({ nivel: 2, titulo: ss.titulo, blocos: ss.blocos, faixa: ss.faixa })
      }
    }
  }
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
  indice.forEach((r) => { r.chave = semAcento(r.t) })
}

function desenharSumario() {
  $('navegacao').innerHTML = '<ul class="sumario">' + secoes.map((s, i) =>
    `<li class="${s.nivel === 2 ? 'nivel2' : ''}">
      <button data-i="${i}" aria-current="${i === atual}">${esc(s.titulo)}</button></li>`).join('') + '</ul>'
  for (const b of $('navegacao').querySelectorAll('button')) {
    b.addEventListener('click', () => abrir(+b.dataset.i))
  }
}

function abrir(i, termo) {
  atual = i
  const secao = secoes[i]
  const faixa = secao.faixa
    ? `<img class="faixa" alt="" src="/app/imagem.php?f=${encodeURIComponent(secao.faixa)}">`
    : ''
  $('conteudo').innerHTML = faixa +
    `<div class="corpo"><h2 class="cap">${esc(secao.titulo)}</h2>` +
    (secao.blocos ?? []).map(bloco).join('') + '</div>'
  $('conteudo').scrollTop = 0
  if (!$('busca').value) desenharSumario()
  if (termo) realcar(termo)
}

// realce simples: percorre os nos de texto e envolve o que casou
function realcar(termo) {
  const alvo = semAcento(termo)
  if (alvo.length < 2) return
  const caminhante = document.createTreeWalker($('conteudo'), NodeFilter.SHOW_TEXT)
  const achados = []
  let no
  while ((no = caminhante.nextNode())) {
    const pos = semAcento(no.nodeValue).indexOf(alvo)
    if (pos >= 0) achados.push({ no, pos })
  }
  for (const { no, pos } of achados.slice(0, 60)) {
    const span = document.createElement('span')
    span.className = 'marca-busca'
    const meio = no.splitText(pos)
    meio.splitText(alvo.length)
    span.textContent = meio.nodeValue
    meio.parentNode.replaceChild(span, meio)
  }
  const primeiro = $('conteudo').querySelector('.marca-busca')
  if (primeiro) primeiro.scrollIntoView({ block: 'center' })
}

function buscar(termo) {
  const alvo = semAcento(termo.trim())
  if (alvo.length < 2) { desenharSumario(); return }

  const achados = []
  for (const r of indice) {
    const pos = r.chave.indexOf(alvo)
    if (pos < 0) continue
    achados.push({ ...r, pos })
    if (achados.length >= 80) break
  }

  if (!achados.length) {
    $('navegacao').innerHTML = '<div class="vazio">Nada encontrado para esse termo.</div>'
    return
  }

  $('navegacao').innerHTML = `<ul class="resultados">` + achados.map((a, k) => {
    const ini = Math.max(0, a.pos - 40)
    const trecho = (ini > 0 ? '…' : '') + a.t.slice(ini, ini + 130) + (a.t.length > ini + 130 ? '…' : '')
    return `<li><button data-k="${k}">
      <span class="onde">${esc(secoes[a.i].titulo)}</span>
      <span class="trecho">${esc(trecho)}</span></button></li>`
  }).join('') + '</ul>'

  for (const b of $('navegacao').querySelectorAll('button')) {
    b.addEventListener('click', () => abrir(achados[+b.dataset.k].i, termo.trim()))
  }
}

// ------------------------------------------------------------- inicio
let debounce
$('busca').addEventListener('input', (e) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => buscar(e.target.value), 140)
})

try {
  const resposta = await fetch('/app/conteudo.php?arquivo=livro')
  if (resposta.status === 403) { location.href = '/app/'; }
  livro = await resposta.json()
  achatar()
  indexar()
  desenharSumario()
  abrir(0)
} catch (erro) {
  $('conteudo').innerHTML =
    '<div class="carregando">Não consegui carregar o livro. Recarregue a página.</div>'
  $('navegacao').innerHTML = ''
}
</script>
<?php
fecharTela();
