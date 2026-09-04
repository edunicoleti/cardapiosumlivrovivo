// O Vite nao copia arquivos ocultos de public/ para dist/, e a protecao das
// pastas da plataforma depende justamente de .htaccess. Este passo roda depois
// do build e leva os ocultos junto.
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)))
const ORIGEM = join(RAIZ, 'public')
const DESTINO = join(RAIZ, 'dist')

let copiados = 0

function varrer(pasta) {
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome)
    if (statSync(caminho).isDirectory()) {
      varrer(caminho)
      continue
    }
    if (!nome.startsWith('.')) continue
    const alvo = join(DESTINO, relative(ORIGEM, caminho))
    mkdirSync(dirname(alvo), { recursive: true })
    cpSync(caminho, alvo)
    copiados++
    console.log('  oculto ->', relative(DESTINO, alvo))
  }
}

if (existsSync(ORIGEM)) varrer(ORIGEM)
console.log(`pos-build: ${copiados} arquivo(s) oculto(s) copiado(s) para dist/`)
