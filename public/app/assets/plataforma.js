/* Comportamentos que valem para a casca inteira. Cada tela carrega o seu
   próprio módulo por cima deste. */

export const $ = (id) => document.getElementById(id)
export const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel))

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export const semAcento = (s) => String(s ?? '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const icone = (nome, classe = '') =>
  `<svg class="${classe}" aria-hidden="true"><use href="#${nome}"></use></svg>`

/** Guarda pequenas preferências sem quebrar quando o navegador bloqueia. */
export const memoria = {
  ler(chave, padrao = null) {
    try {
      const bruto = localStorage.getItem(chave)
      return bruto === null ? padrao : JSON.parse(bruto)
    } catch { return padrao }
  },
  gravar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true } catch { return false }
  },
  apagar(chave) {
    try { localStorage.removeItem(chave) } catch { /* nada a fazer */ }
  },
}

let relogioTorrada
export function avisar(texto) {
  const caixa = $('torrada')
  if (!caixa) return
  caixa.textContent = texto
  caixa.classList.add('vendo')
  clearTimeout(relogioTorrada)
  relogioTorrada = setTimeout(() => caixa.classList.remove('vendo'), 2600)
}

/**
 * Diálogo que no celular vira folha de baixo. Fecha ao tocar fora, ao apertar
 * Esc (nativo do <dialog>) e devolve o foco para quem abriu.
 */
export function prepararDialogo(dialogo) {
  if (!dialogo || dialogo.dataset.pronto) return dialogo
  dialogo.dataset.pronto = '1'
  dialogo.addEventListener('click', (evento) => {
    if (evento.target !== dialogo) return
    // clique no ::backdrop chega no próprio dialog; confere se caiu fora da caixa
    const area = dialogo.getBoundingClientRect()
    const fora = evento.clientY < area.top || evento.clientY > area.bottom ||
                 evento.clientX < area.left || evento.clientX > area.right
    if (fora) dialogo.close()
  })
  for (const botao of $$('[data-fechar]', dialogo)) {
    botao.addEventListener('click', () => dialogo.close())
  }
  return dialogo
}

/** Copia texto e avisa, com desvio para navegadores sem clipboard assíncrono. */
export async function copiar(texto, recado = 'Copiado.') {
  try {
    await navigator.clipboard.writeText(texto)
    avisar(recado)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = texto
    area.setAttribute('readonly', '')
    area.style.cssText = 'position:fixed;top:-1000px;opacity:0'
    document.body.appendChild(area)
    area.select()
    let deu = false
    try { deu = document.execCommand('copy') } catch { deu = false }
    area.remove()
    avisar(deu ? recado : 'Não consegui copiar. Selecione o texto na tela.')
    return deu
  }
}

/* A barra de abas some quando o teclado virtual abre: sem isso ela flutua no
   meio da tela em vários Android. */
const abas = document.querySelector('.abas')
if (abas && window.visualViewport) {
  const conferir = () => {
    const encolheu = window.innerHeight - window.visualViewport.height > 140
    abas.style.visibility = encolheu ? 'hidden' : ''
  }
  window.visualViewport.addEventListener('resize', conferir)
}
