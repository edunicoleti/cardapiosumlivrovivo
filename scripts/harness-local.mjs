/* ==========================================================================
   Harness local da plataforma /app
   Nao ha PHP nesta maquina, e as telas de /app sao servidas por lib/tela.php.
   Este servidor faz o mesmo trabalho em Node: le lib/casca.html e
   lib/telas/*.html, troca os {{TOKENS}}, recorta os pedacos <!--{nome}--> e
   finge conteudo.php e imagem.php. Serve para ver e testar /app fora da
   Hostinger; nao vai para producao (vive fora de public/).

   Uso: npm run app  →  http://localhost:5178/app/
   ========================================================================== */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.join(AQUI, '..', 'public')
const APP = path.join(RAIZ, 'app')
const PORTA = Number(process.env.PORTA || 5178)

const ler = (p) => { try { return fs.readFileSync(p, 'utf8') } catch { return '' } }

const pedaco = (html, nome) => {
  const ini = html.indexOf(`<!--{${nome}}-->`)
  const fim = html.indexOf(`<!--{/${nome}}-->`)
  if (ini < 0 || fim < 0) return ''
  return html.slice(ini + `<!--{${nome}}-->`.length, fim).trim()
}
const semPedacos = (html) => html.replace(/<!--\{[^}]*\}-->[\s\S]*?<!--\{\/[^}]*\}-->/g, '')
const trocar = (html, toks) => {
  let out = html
  for (const [k, v] of Object.entries(toks)) out = out.split(`{{${k}}}`).join(String(v ?? ''))
  return out
}

const DESTINOS = [
  { chave: 'inicio', url: '/app/', rotulo: 'Início', curto: 'Início', icone: 'i-casa', desc: 'Seu painel' },
  { chave: 'livro', url: '/app/livro/', rotulo: 'O livro', curto: 'Livro', icone: 'i-livro', desc: 'Ler e buscar' },
  { chave: 'assistente', url: '/app/assistente/', rotulo: 'Assistente de cardápio', curto: 'Cardápio', icone: 'i-cardapio', desc: 'Montar a semana' },
]

function renderizar({ titulo, chave, topoTitulo, topoAcoes = '', classeMain = '', cabeca = '', rodape = '', conteudo }) {
  let casca = ler(path.join(APP, 'lib/casca.html'))
  const mTrilho = pedaco(casca, 'item-trilho')
  const mAbas = pedaco(casca, 'item-abas')
  const mQuem = pedaco(casca, 'quem')
  casca = semPedacos(casca)

  let navTrilho = '', navAbas = ''
  for (const d of DESTINOS) {
    const c = { URL: d.url, ICONE: d.icone, ROTULO: d.rotulo, CURTO: d.curto, DESC: d.desc,
                ATUAL: d.chave === chave ? ' aria-current="page"' : '' }
    navTrilho += trocar(mTrilho, c) + '\n'
    navAbas += trocar(mAbas, c) + '\n'
  }
  const quem = trocar(mQuem, { INICIAL: 'D', NOME: 'Desenvolvimento local' })

  return trocar(casca, {
    TITULO: titulo, VERSAO: Date.now(), CABECA: cabeca, RODAPE: rodape,
    CLASSE_CASCA: '', CLASSE_MAIN: classeMain,
    NAV_TRILHO: navTrilho, NAV_ABAS: navAbas, QUEM: quem,
    TOPO_TITULO: topoTitulo ?? titulo, TOPO_ACOES: topoAcoes, CONTEUDO: conteudo,
  })
}

const TIPOS = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.html': 'text/html' }

process.on('uncaughtException', (e) => console.error('erro ignorado:', e.message))

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x')
  const p = decodeURIComponent(u.pathname)

  if (p === '/app/conteudo.php') {
    const mapa = { livro: 'livro.json', assistente: 'assistente.json' }
    const arq = mapa[u.searchParams.get('arquivo')]
    if (!arq) { res.writeHead(404).end(); return }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    fs.createReadStream(path.join(APP, 'acervo', arq)).pipe(res)
    return
  }

  if (p === '/app/imagem.php') {
    // o app usa ?f=<arquivo>; ?id= era chute meu e deixava o livro sem imagem
    const id = u.searchParams.get('f') || u.searchParams.get('id') || ''
    const alvo = path.join(APP, 'acervo/imagens', path.basename(id))
    if (id && fs.existsSync(alvo) && fs.statSync(alvo).isFile()) {
      const tipo = TIPOS[path.extname(alvo).toLowerCase()] || 'image/jpeg'
      res.writeHead(200, { 'Content-Type': tipo })
      fs.createReadStream(alvo).pipe(res).on('error', () => res.end()); return
    }
    res.writeHead(404).end(); return
  }

  if (p === '/app/' || p === '/app' || p === '/') {
    const corpo = trocar(ler(path.join(APP, 'lib/telas/inicio.html')), { VERSAO: Date.now() })
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, must-revalidate' })
    res.end(renderizar({ titulo: 'Início', chave: 'inicio', topoTitulo: 'Plataforma', conteudo: corpo }))
    return
  }

  if (p === '/app/assistente/' || p === '/app/assistente') {
    const corpo = ler(path.join(APP, 'lib/telas/assistente.html'))
    const v = Date.now()
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, must-revalidate' })
    res.end(renderizar({
      titulo: 'Assistente de cardápio', chave: 'assistente', topoTitulo: 'Assistente',
      topoAcoes: pedaco(corpo, 'topo-acoes'), classeMain: 'colado',
      cabeca: `<link rel="stylesheet" href="/app/assets/assistente.css?v=${v}">`,
      rodape: `<script src="/app/assets/assistente.js?v=${v}" type="module"></script>`,
      conteudo: semPedacos(corpo),
    }))
    return
  }

  if (p === '/app/livro/' || p === '/app/livro') {
    const corpo = ler(path.join(APP, 'lib/telas/livro.html'))
    const v = Date.now()
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, must-revalidate' })
    res.end(renderizar({
      titulo: 'O livro', chave: 'livro', topoTitulo: 'O livro',
      topoAcoes: pedaco(corpo, 'topo-acoes'), classeMain: 'colado',
      cabeca: `<link rel="stylesheet" href="/app/assets/livro.css?v=${v}">`,
      rodape: `<script src="/app/assets/livro.js?v=${v}" type="module"></script>`,
      conteudo: semPedacos(corpo),
    }))
    return
  }

  // estáticos
  const alvo = path.join(RAIZ, p.replace(/^\//, ''))
  if (fs.existsSync(alvo) && fs.statSync(alvo).isFile()) {
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(alvo)] || 'application/octet-stream',
                         'Cache-Control': 'no-store' })
    fs.createReadStream(alvo).pipe(res)
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' }).end('nao achei ' + p)
}).listen(PORTA, () => console.log('harness em http://localhost:' + PORTA + '/app/'))
