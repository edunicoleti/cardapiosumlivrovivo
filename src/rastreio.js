// Pixel da Meta (conjunto de dados 1671697287627598, portfolio "Cardapios: Um Livro Vivo").
// O codigo base fica no index.html e dispara o PageView. Aqui ficam os outros
// eventos da LP e as UTMs do anuncio, que seguem para o checkout da Cakto.
// A Cakto, com o mesmo pixel, manda InitiateCheckout quando o checkout abre e
// Purchase quando a compra e aprovada; por isso o clique aqui e um evento
// proprio (CliqueComprar), senao o checkout seria contado duas vezes.

const ORIGEM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid']
const CHAVE = 'lv-origem'

export const OFERTA = {
  value: 120,
  currency: 'BRL',
  content_name: 'Cardápios: Um Livro Vivo',
  content_type: 'product',
}

// Guarda as UTMs da chegada: se a pessoa navegar pela pagina e a URL perder a
// query, o checkout ainda sabe de qual anuncio ela veio.
export function guardarOrigem() {
  try {
    const q = new URLSearchParams(location.search)
    const origem = {}
    for (const k of ORIGEM) if (q.get(k)) origem[k] = q.get(k)
    if (Object.keys(origem).length) sessionStorage.setItem(CHAVE, JSON.stringify(origem))
  } catch {
    // navegacao privada ou armazenamento bloqueado: segue sem guardar
  }
}

export function linkDeCheckout(base) {
  let origem = {}
  try {
    origem = JSON.parse(sessionStorage.getItem(CHAVE) || '{}')
  } catch {
    origem = {}
  }
  const q = new URLSearchParams(location.search)
  for (const k of ORIGEM) if (q.get(k)) origem[k] = q.get(k)
  const url = new URL(base)
  for (const [k, v] of Object.entries(origem)) url.searchParams.set(k, v)
  return url.toString()
}

export function evento(nome, dados, proprio = false) {
  try {
    if (typeof window.fbq === 'function') window.fbq(proprio ? 'trackCustom' : 'track', nome, dados)
  } catch {
    // bloqueador de anuncio derruba o fbq; a pagina nao pode quebrar por isso
  }
}

// Clique em Comprar: registra o CliqueComprar e so entao navega, para o
// evento nao ser cortado pela troca de pagina. Ctrl/Cmd+clique abre em outra
// aba normalmente.
export function aoIrParaCheckout(e) {
  evento('CliqueComprar', OFERTA, true)
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const destino = e.currentTarget.href
  e.preventDefault()
  setTimeout(() => { location.href = destino }, 300)
}

// ViewContent uma vez, quando o bloco de preco aparece na tela.
export function observarOferta(id) {
  const alvo = document.getElementById(id)
  if (!alvo || !('IntersectionObserver' in window)) return () => {}
  const obs = new IntersectionObserver((entradas) => {
    if (entradas.some((x) => x.isIntersecting)) {
      evento('ViewContent', OFERTA)
      obs.disconnect()
    }
  }, { threshold: 0.35 })
  obs.observe(alvo)
  return () => obs.disconnect()
}
