/* ==========================================================================
   Assistente de cardápio
   O motor é determinístico e vem do capítulo VI: não há modelo de linguagem
   aqui, e nenhum prato é inventado. A interface só mostra o que ele decidiu e
   por quê, e deixa a nutricionista ter a palavra final em cada espaço.
   ========================================================================== */

import { $, $$, esc, semAcento, memoria, avisar, copiar, prepararDialogo, abrirDialogo } from './nucleo.js'

const MESES = [
  ['jan', 'Janeiro'], ['fev', 'Fevereiro'], ['mar', 'Março'], ['abr', 'Abril'],
  ['mai', 'Maio'], ['jun', 'Junho'], ['jul', 'Julho'], ['ago', 'Agosto'],
  ['set', 'Setembro'], ['out', 'Outubro'], ['nov', 'Novembro'], ['dez', 'Dezembro'],
]
const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const CURTOS = { Segunda: 'Seg', Terça: 'Ter', Quarta: 'Qua', Quinta: 'Qui',
                 Sexta: 'Sex', Sábado: 'Sáb', Domingo: 'Dom' }

const CHAVE_PERFIL = 'assistente-perfil'
const CHAVE_SALVOS = 'assistente-salvos'

/* ---------------------------------------------------- perfil do serviço
   As opções vêm dos fatores administrativos do capítulo VI e dos quatro
   cardápios de exemplo dos anexos. */
const SERVICOS = [
  { id: 'institucional', rot: 'Coletiva institucional', desc: 'Empresa, indústria, hospital', icone: 'i-predio' },
  { id: 'bufe', rot: 'Bufê por peso', desc: 'Comercial, self-service', icone: 'i-bandeja' },
  { id: 'infantil', rot: 'Escola ou creche', desc: 'Público infantil', icone: 'i-crianca' },
  { id: 'repouso', rot: 'Casa de repouso', desc: 'Preparações mais macias', icone: 'i-coracao' },
]
const PADROES = [
  { id: 'popular', rot: 'Popular', desc: 'Preparações simples, custo menor', icone: 'i-prato' },
  { id: 'medio', rot: 'Médio ou diferenciado', desc: 'Mais elaborado, maior variedade', icone: 'i-cardapio' },
  { id: 'luxo', rot: 'Executivo ou de luxo', desc: 'Cardápio mais sofisticado', icone: 'i-estrela' },
]
const EQUIPAMENTOS = [
  { id: 'forno', rot: 'Forno', desc: 'Assados e gratinados', icone: 'i-forno', metodos: ['assado', 'gratinado'] },
  { id: 'fritadeira', rot: 'Fritadeira', desc: 'Fritos e empanados', icone: 'i-fritadeira', metodos: ['frito', 'empanado'] },
  { id: 'chapa', rot: 'Chapa ou grelha', desc: 'Grelhados', icone: 'i-grelha', metodos: ['grelhado'] },
]
// Restringir pela categoria do livro nao basta: bacon, presunto, linguica e
// calabresa aparecem em salada, arroz, feijao e ate em ovo. Filtrar so a
// categoria "Carne Suína" deixaria passar cinco de cada seis pratos com suino.
// Por isso a restricao le o nome e a descricao de cada preparacao. Num filtro
// alimentar o erro tem de cair para o lado de excluir demais.
const RESTRICOES = [
  { id: 'sem-suina', rot: 'Sem carne suína', desc: 'Inclui bacon, presunto e embutidos', icone: 'i-proibido',
    referencias: ['Carne suína'],
    termos: ['suin', 'porco', 'bacon', 'presunto', 'linguic', 'calabres', 'pernil', 'pancetta',
             'copa lombo', 'copa-lombo', 'tender', 'torresmo', 'paio', 'salsich', 'lombo'] },
  { id: 'sem-mar', rot: 'Sem frutos do mar', desc: 'Peixes, crustáceos e moluscos', icone: 'i-proibido',
    referencias: ['Pescados'],
    termos: ['peixe', 'pescad', 'camarao', 'lula', 'polvo', 'mexilh', 'marisco', 'siri', 'caranguejo',
             'bacalhau', 'atum', 'sardinha', 'salmao', 'tilapia', 'merluza', 'anchova', 'fruto do mar'] },
  { id: 'sem-bovina', rot: 'Sem carne bovina', desc: 'Inclui charque e carne seca', icone: 'i-proibido',
    referencias: ['Carne bovina'],
    termos: ['bovin', 'bife', 'alcatra', 'patinho', 'coxao', 'acem', 'musculo', 'costela', 'picanha',
             'maminha', 'file mignon', 'charque', 'carne seca', 'carne moida', 'contrafil',
             'fraldinha', 'matambre', 'cupim'] },
]

/* Capítulo VI, B: a refeição principal tem entrada, prato principal,
   acompanhamento, prato base, complemento e sobremesa. Sopa, molho e prato
   típico existem no acervo e ficavam de fora da grade: 444 preparações que
   nenhum cardápio alcançava. Entram como escolha, porque nem todo serviço
   oferece os três. */
const COMPOSICAO = [
  { id: 'sopa', rot: 'Sopa na entrada', desc: '50 sopas e caldos do acervo', icone: 'i-sopa' },
  { id: 'molho', rot: 'Molho como complemento', desc: '51 molhos quentes e frios', icone: 'i-gota' },
  { id: 'tipico', rot: 'Prato típico brasileiro', desc: 'Capítulo X: 321 preparações típicas', icone: 'i-mapa' },
]

/* Fator sensorial 3.9: o livro manda evitar a oferta CONCENTRADA de alimentos
   de difícil digestão e flatulentos, e lista quais são em 3.9.1 e 3.9.2. Não é
   restrição, é limite por dia: por isso pesa na nota em vez de excluir. */
const DIGESTAO_PESADA = [
  'abacate', 'agriao', 'alho', 'banana d agua', 'batata-doce', 'brocolis', 'carne gorda',
  'cebola', 'creme de leite', 'couve-flor', 'couve', 'embutido', 'fava', 'feijao',
  'goiaba', 'grao-de-bico', 'jaca', 'lentilha', 'melao', 'melancia', 'milho', 'nabo',
  'pepino', 'pimentao', 'rabanete', 'repolho', 'uva', 'viscera', 'acelga', 'aipo',
  'amendoim', 'castanha', 'couve-de-bruxelas', 'ervilha', 'gengibre', 'maca',
  'mostarda', 'nozes', 'ovo',
]

const PERFIL_PADRAO = {
  servico: 'institucional', padrao: 'medio', refeicoes: 200,
  equipamentos: ['forno', 'fritadeira', 'chapa'], restricoes: [],
  composicao: [], digestao: false,
}

const RODIZIO = ['Carne bovina', 'Carne de frango', 'Pescados', 'Carne suína', 'Carnes diversas']

/* Linhas de cabeçalho das tabelas do livro que a extração trouxe como se fossem
   preparação: "MACARRÃO (MASSAS ALIMENTÍCIAS)", "REGIÃO SUL", "FRUTAS". Nome
   sem nenhuma minúscula é a assinatura delas; prato de verdade vem capitalizado. */
const ehCabecalho = (p) => !/[a-zà-ÿ]/.test(String(p.nome ?? ''))

let base = null
let estrutura = []
let estado = {
  mes: MESES[new Date().getMonth()][0], dias: 5, semente: 1, cardapio: null,
  perfil: { ...PERFIL_PADRAO }, relaxados: [], repetidos: [], diaVisivel: 0,
}

/* ================================================================== motor */
const cacheRegex = new Map()
function regexItem(item) {
  if (!cacheRegex.has(item)) {
    const escapado = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    cacheRegex.set(item, new RegExp(`(^|[^a-z])${escapado}s?([^a-z]|$)`))
  }
  return cacheRegex.get(item)
}
function gerador(semente) {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function naSafra(p, itens) {
  const nome = semAcento(p.nome), desc = semAcento(p.descricao || '')
  const noNome = itens.find((i) => i.length > 3 && regexItem(i).test(nome))
  if (noNome) return { item: noNome, peso: 3, mostrar: true }
  const naDesc = itens.find((i) => i.length > 3 && regexItem(i).test(desc))
  if (naDesc) return { item: naDesc, peso: 1, mostrar: false }
  return null
}
/** 3.9.1 e 3.9.2: procura os itens das listas do livro no nome e na descrição. */
function ehPesada(p) {
  const alvo = semAcento(`${p.nome} ${p.descricao || ''}`)
  return DIGESTAO_PESADA.some((item) => regexItem(item).test(alvo))
}

const VAZIAS = new Set(['com', 'sem', 'ao', 'aos', 'de', 'da', 'do', 'em', 'na', 'no', 'uma', 'para'])
function ingredienteChave(p, safra) {
  if (safra) return safra.item
  const palavra = semAcento(p.nome).replace(/[^a-z\s-]/g, ' ').split(/\s+/)
    .find((t) => t.length > 3 && !VAZIAS.has(t))
  return palavra ?? null
}

/* ------------------------------------------- o perfil vira restrição */
// Métodos que o equipamento ausente torna impossível.
function metodosBloqueados(perfil) {
  const bloqueados = new Set()
  for (const eq of EQUIPAMENTOS) {
    if (!perfil.equipamentos.includes(eq.id)) for (const m of eq.metodos) bloqueados.add(m)
  }
  // Fator 1.8: em volume alto, prato feito na hora um a um não escala.
  if (perfil.refeicoes >= 400) { bloqueados.add('grelhado'); bloqueados.add('empanado') }
  return bloqueados
}

function referenciasBloqueadas(perfil) {
  const bloqueadas = new Set()
  for (const r of RESTRICOES) {
    if (perfil.restricoes.includes(r.id)) for (const ref of r.referencias) bloqueadas.add(ref)
  }
  if (perfil.servico === 'infantil') bloqueadas.add('Pescados')
  return bloqueadas
}

// Ingredientes proibidos, procurados no nome e na descricao de qualquer prato.
function termosBloqueados(perfil) {
  const termos = []
  for (const r of RESTRICOES) {
    if (perfil.restricoes.includes(r.id)) termos.push(...r.termos)
  }
  return termos.map(semAcento)
}

function temIngredienteProibido(p, termos) {
  if (!termos.length) return false
  const alvo = semAcento(`${p.nome} ${p.descricao || ''}`)
  return termos.some((t) => alvo.includes(t))
}

// Fator 1.1: a autora já separou o simples do elaborado nas próprias categorias.
const SIMPLES = new Set(['Crua', 'Cozida', 'Fruta in natura'])
const ELABORADO = new Set(['Mista', 'Elaborada com molho', 'Sobremesa elaborada'])
function pesoDoPadrao(p, padrao) {
  if (padrao === 'popular') {
    if (SIMPLES.has(p.referencia)) return 1.5
    if (ELABORADO.has(p.referencia)) return -1.5
  }
  if (padrao === 'luxo') {
    if (ELABORADO.has(p.referencia)) return 1.5
    if (SIMPLES.has(p.referencia)) return -1
  }
  return 0
}

/**
 * A ordem das linhas é a da composição do capítulo VI, B: entrada, prato
 * principal, acompanhamento, prato base, complemento e sobremesa. Antes as
 * saladas vinham depois do arroz e do feijão, que é o inverso do que o livro
 * manda; e sopa, molho e prato típico não tinham lugar nenhum.
 */
function estruturaDoServico(perfil) {
  const servico = perfil.servico
  const inclui = (x) => (perfil.composicao ?? []).includes(x)
  const linhas = []

  if (inclui('sopa')) linhas.push({ espaco: 'Entrada · sopa', slot: 'sopa' })
  linhas.push({ espaco: 'Entrada · salada crua', slot: 'salada', referencias: ['Crua', 'Mista'] })
  linhas.push({ espaco: 'Entrada · salada cozida', slot: 'salada', referencias: ['Cozida'] })
  if (servico === 'bufe') {
    // bufê oferece mais opções de salada e acompanhamento na mesma refeição
    linhas.push({ espaco: 'Entrada · salada extra', slot: 'salada', referencias: ['Mista', 'Elaborada com molho'] })
  }

  linhas.push({ espaco: 'Prato principal', slot: 'principal', rodizio: true })
  if (inclui('tipico')) linhas.push({ espaco: 'Prato típico', slot: 'regional' })

  linhas.push({ espaco: 'Acompanhamento', slot: 'acompanhamento' })
  if (servico === 'bufe') linhas.push({ espaco: 'Acompanhamento 2', slot: 'acompanhamento' })

  linhas.push({ espaco: 'Prato base · arroz', slot: 'base', referencia: 'Arroz' })
  linhas.push({ espaco: 'Prato base · feijão', slot: 'base', referencia: 'Feijão' })

  if (inclui('molho')) linhas.push({ espaco: 'Complemento · molho', slot: 'molho' })

  // sobremesa de fruta em vez de elaborada para público infantil e casa de repouso
  const soFruta = servico === 'infantil' || servico === 'repouso'
  linhas.push(soFruta
    ? { espaco: 'Sobremesa', slot: 'sobremesa', referencias: ['Fruta in natura'] }
    : { espaco: 'Sobremesa', slot: 'sobremesa' })

  return linhas
}

function montar({ mes, dias, semente, perfil }) {
  const sorteio = gerador(semente)
  const itensSafra = base.sazonalidade.filter((s) => s.meses.includes(mes)).map((s) => semAcento(s.item))
  const bloqMetodos = metodosBloqueados(perfil)
  const bloqRefs = referenciasBloqueadas(perfil)
  const bloqTermos = termosBloqueados(perfil)
  const estruturaDoDia = estruturaDoServico(perfil)
  const usadas = new Set()
  const frituras = []
  const ingredientePorEspaco = {}
  const cardapio = []
  const relaxados = new Set()
  const repetidos = new Set()

  for (let d = 0; d < dias; d++) {
    const dia = { dia: DIAS[d % 7], itens: [] }
    const metodosDoDia = []
    const ingredientesDoDia = []
    let pesadosDoDia = 0
    // Método básico do capítulo VI: "às segundas-feiras usar preparações mais
    // simples, que não necessitem de pré-preparo, pois muitas UANs não
    // funcionam aos domingos".
    const segunda = dia.dia === 'Segunda'

    for (const linha of estruturaDoDia) {
      const rodizioDisponivel = RODIZIO.filter((r) => !bloqRefs.has(r))
      const alvo = linha.rodizio
        ? (rodizioDisponivel[d % (rodizioDisponivel.length || 1)] ?? null)
        : linha.referencia

      // Restrição alimentar nunca é afrouxada. O resto cede em ordem, do menos
      // custoso para o mais: primeiro o equipamento, depois a regra de não
      // repetir. Feijão só tem 6 preparações no livro, e com uma restrição
      // ativa a semana não fecha sem repetir — que é o que uma UAN faz mesmo.
      const podeEntrar = (p) => {
        if (p.slot !== linha.slot) return false
        if (alvo && p.referencia !== alvo) return false
        if (linha.referencias && !linha.referencias.includes(p.referencia)) return false
        if (bloqRefs.has(p.referencia)) return false
        return !temIngredienteProibido(p, bloqTermos)
      }
      const inedita = (p) => !usadas.has(p.id)

      let candidatas = base.preparacoes.filter((p) => podeEntrar(p) && inedita(p) && !bloqMetodos.has(p.metodo))
      if (!candidatas.length) {
        candidatas = base.preparacoes.filter((p) => podeEntrar(p) && inedita(p))
        if (candidatas.length) relaxados.add(linha.espaco)
      }
      if (!candidatas.length) {
        candidatas = base.preparacoes.filter((p) => podeEntrar(p) && !bloqMetodos.has(p.metodo))
        if (candidatas.length) repetidos.add(linha.espaco)
      }
      if (!candidatas.length) {
        candidatas = base.preparacoes.filter(podeEntrar)
        if (candidatas.length) repetidos.add(linha.espaco)
      }
      if (!candidatas.length) { dia.itens.push({ espaco: linha.espaco, vazio: true }); continue }

      const avaliadas = candidatas.map((p) => {
        let nota = sorteio() * 0.6
        const safra = naSafra(p, itensSafra)
        if (safra) nota += safra.peso
        nota += pesoDoPadrao(p, perfil.padrao)
        if (p.metodo && metodosDoDia.includes(p.metodo)) nota -= 2.5
        if (p.metodo === 'frito' && frituras.length >= 1) nota -= 4
        const chave = ingredienteChave(p, safra)
        if (chave && (ingredientePorEspaco[linha.espaco] ?? []).includes(chave)) nota -= 3
        if (chave && ingredientesDoDia.includes(chave)) nota -= 3.5
        if (segunda) {
          if (SIMPLES.has(p.referencia)) nota += 1
          if (ELABORADO.has(p.referencia)) nota -= 1.5
        }
        const pesado = perfil.digestao && ehPesada(p)
        // 3.9 fala em oferta concentrada, entao o peso so entra a partir do
        // terceiro prato pesado do dia: o feijao sozinho ja e um deles
        if (pesado && pesadosDoDia >= 2) nota -= 2.5
        return { p, nota, safra, chave, pesado }
      }).sort((a, b) => b.nota - a.nota)

      const escolhida = avaliadas[0]
      usadas.add(escolhida.p.id)
      if (escolhida.p.metodo) metodosDoDia.push(escolhida.p.metodo)
      if (escolhida.p.metodo === 'frito') frituras.push(d)
      if (escolhida.chave) {
        ;(ingredientePorEspaco[linha.espaco] ??= []).push(escolhida.chave)
        ingredientesDoDia.push(escolhida.chave)
      }
      if (escolhida.pesado) pesadosDoDia++

      dia.itens.push({
        espaco: linha.espaco,
        nome: escolhida.p.nome,
        metodo: escolhida.p.metodo,
        // a descrição é o que o livro traz de ingredientes e preparo; sem ela a
        // grade vira uma lista de nomes soltos
        descricao: escolhida.p.descricao,
        referencia: escolhida.p.referencia,
        categoria: escolhida.p.categoria,
        safra: escolhida.safra?.mostrar ? escolhida.safra.item : null,
        alternativas: avaliadas.slice(1, 24).map((a) => ({
          id: a.p.id, nome: a.p.nome, metodo: a.p.metodo, descricao: a.p.descricao,
          referencia: a.p.referencia, categoria: a.p.categoria,
          safra: a.safra?.mostrar ? a.safra.item : null,
        })),
      })
    }
    cardapio.push(dia)
  }
  estado.relaxados = [...relaxados]
  estado.repetidos = [...repetidos]
  return { cardapio, estrutura: estruturaDoDia }
}

function conferir(cardapio) {
  const itens = cardapio.flatMap((d) => d.itens).filter((i) => !i.vazio)
  const principais = new Set(cardapio.map((d) => d.itens.find((i) => i.espaco === 'Prato principal')?.nome))
  const fritos = itens.filter((i) => i.metodo === 'frito').length
  const repetido = cardapio.filter((d) => {
    const m = d.itens.map((i) => i.metodo).filter(Boolean)
    return new Set(m).size !== m.length
  }).length
  return [
    ['i-troca', '3.7 Variedade de ingredientes',
     `${principais.size} pratos principais distintos em ${cardapio.length} dias`],
    ['i-ajuste', '3.2 Variedade de cocção',
     `${fritos} fritura(s); ${repetido} dia(s) com método repetido`],
    ['i-folha', '3.1 Estação do ano',
     `${itens.filter((i) => i.safra).length} pratos com ingrediente da safra`],
  ]
}

/* ================================================================== tela
   Três estados na mesma página: apresentação, montagem e resultado. A
   montagem era um <dialog> de 680px que crescia e encolhia a cada passo,
   sem saída visível e sem endereço: agora é a própria página, cada passo
   tem hash, e o botão Voltar do navegador anda no fluxo em vez de sair
   dele. */

const TELAS = { abertura: 'apresentacao', wizard: 'wizard', resultado: 'painelCardapio' }
let telaAtual = 'abertura'

function mostrarTela(qual) {
  telaAtual = qual
  for (const [chave, id] of Object.entries(TELAS)) $(id).hidden = chave !== qual
  if (qual !== 'resultado') fecharGaveta()
  const acoes = qual === 'resultado'
  $('btPerfil')?.toggleAttribute('hidden', !acoes)
}

/* ------------------------------------------------------- acervo vivo
   Quanto do livro sobra depois dos filtros. É o retorno que faltava: dava
   para marcar três restrições sem nenhuma pista de que a semana não fecharia. */
let cacheAcervo = { chave: null, valor: null }
function acervoDisponivel(perfil) {
  if (!base) return { livres: 0, total: 0, pct: 0 }
  const chave = JSON.stringify([perfil.restricoes, perfil.equipamentos, perfil.refeicoes, perfil.servico])
  if (cacheAcervo.chave === chave) return cacheAcervo.valor
  const bloqRefs = referenciasBloqueadas(perfil)
  const bloqTermos = termosBloqueados(perfil)
  const bloqMetodos = metodosBloqueados(perfil)
  let livres = 0
  for (const p of base.preparacoes) {
    if (bloqRefs.has(p.referencia)) continue
    if (p.metodo && bloqMetodos.has(p.metodo)) continue
    if (temIngredienteProibido(p, bloqTermos)) continue
    livres++
  }
  const total = base.preparacoes.length
  cacheAcervo = { chave, valor: { livres, total, pct: total ? Math.round((livres / total) * 100) : 0 } }
  return cacheAcervo.valor
}

const nomeDoMes = (v) => MESES.find(([x]) => x === v)?.[1] ?? ''
const itensNaSafra = (v) => (base?.sazonalidade ?? []).filter((s) => s.meses.includes(v))

/* ==================================================== 1. apresentação */

function pintarNumeros() {
  const total = base.meta?.totalReal ?? base.preparacoes.length
  const categorias = new Set(base.preparacoes.map((p) => p.categoria)).size
  $('numerosAcervo').innerHTML = [
    [total.toLocaleString('pt-BR'), 'preparações no livro'],
    [String(categorias), 'categorias de preparação'],
    [String(base.sazonalidade.length), 'itens com safra mapeada'],
  ].map(([n, q]) => `<li><span class="n">${esc(n)}</span><span class="q">${esc(q)}</span></li>`).join('')
}

/** Três dias montados pelo motor de verdade: a prévia não é maquete. */
function pintarPrevia() {
  const guardaRelax = estado.relaxados
  const guardaRepete = estado.repetidos
  let r
  try {
    r = montar({ mes: estado.mes, dias: 3, semente: 7, perfil: { ...PERFIL_PADRAO } })
  } catch {
    $('previa').hidden = true
    return
  } finally {
    estado.relaxados = guardaRelax
    estado.repetidos = guardaRepete
  }

  // nome inteiro numa célula de prévia estica a linha para 260px no celular:
  // aqui a prévia só precisa dizer que tipo de prato sai em cada espaço
  const curto = (n) => (n.length > 46 ? `${n.slice(0, 45).replace(/[\s,]+$/, '')}…` : n)
  const linhas = r.estrutura.map((l) => l.espaco).slice(0, 5)
  const cabeca = `<tr><th></th>${r.cardapio.map((d) =>
    `<th>${esc(CURTOS[d.dia] ?? d.dia)}</th>`).join('')}</tr>`
  const corpo = linhas.map((espaco, li) => {
    const celulas = r.cardapio.map((d) => {
      const item = d.itens[li]
      return `<td>${item && !item.vazio ? esc(curto(item.nome)) : '—'}</td>`
    }).join('')
    return `<tr><th>${esc(espaco.replace(' · ', ' '))}</th>${celulas}</tr>`
  }).join('')

  $('previaGrade').innerHTML = `<table><thead>${cabeca}</thead><tbody>${corpo}</tbody></table>`
}

/* ========================================================== 2. wizard */

const PASSOS = [
  { curto: 'Serviço', rot: 'Que serviço você atende?' },
  { curto: 'Padrão', rot: 'Qual o padrão do cardápio?' },
  { curto: 'Volume', rot: 'Quantas refeições por dia?' },
  { curto: 'Cozinha', rot: 'O que você tem na cozinha?' },
  { curto: 'Composição', rot: 'O que entra na composição?' },
  { curto: 'Restrições', rot: 'O que evitar?' },
  { curto: 'Quando', rot: 'Para quando é este cardápio?' },
  { curto: 'Revisar', rot: 'Confira antes de montar' },
]
const TOTAL_PASSOS = PASSOS.length
const DIGESTAO = { id: 'sim', rot: 'Evitar concentrar alimentos pesados no mesmo dia',
                   desc: 'Fator 3.9: difícil digestão e flatulentos, pelas listas do livro',
                   icone: 'i-relogio' }
let passo = 1
let maiorPassoVisto = 1

const OPCOES = {
  servico: SERVICOS, padrao: PADROES, equipamentos: EQUIPAMENTOS,
  restricoes: RESTRICOES, composicao: COMPOSICAO, digestao: [DIGESTAO],
}

function marcado(campo, id, tipo) {
  if (tipo === 'booleano') return estado.perfil[campo] === true
  if (tipo === 'multiplo') return estado.perfil[campo].includes(id)
  return estado.perfil[campo] === id
}

function pintarOpcoes() {
  for (const caixa of $$('#formPerfil .opcoes')) {
    const campo = caixa.dataset.campo
    const tipo = caixa.dataset.tipo
    const unico = tipo === 'unico'
    if (unico) caixa.setAttribute('role', 'radiogroup')
    caixa.innerHTML = (OPCOES[campo] ?? []).map((o) => {
      const on = marcado(campo, o.id, tipo)
      // escolha única é rádio de verdade: uma parada de tab para o grupo todo e
      // seta para andar entre as opções, em vez de sete paradas seguidas
      const papel = unico
        ? `role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}"`
        : `aria-pressed="${on}"`
      return `<button class="opt" type="button" ${papel}
        data-campo="${campo}" data-id="${esc(o.id)}" data-tipo="${tipo}">
        ${o.icone ? `<span class="opt-icone"><svg aria-hidden="true"><use href="#${o.icone}"></use></svg></span>` : ''}
        <span class="opt-texto">
          <span class="opt-rot">${esc(o.rot)}</span>
          ${o.desc ? `<span class="opt-desc">${esc(o.desc)}</span>` : ''}
        </span>
        <span class="opt-marca" aria-hidden="true"><svg><use href="#i-check"></use></svg></span>
      </button>`
    }).join('')
    // nenhum rádio marcado deixaria o grupo fora da ordem de tabulação
    if (unico && !caixa.querySelector('[tabindex="0"]')) {
      caixa.querySelector('.opt')?.setAttribute('tabindex', '0')
    }
  }
}

function escolher(campo, id, tipo) {
  if (tipo === 'booleano') {
    estado.perfil[campo] = !estado.perfil[campo]
  } else if (tipo === 'multiplo') {
    const lista = estado.perfil[campo]
    estado.perfil[campo] = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]
  } else {
    if (estado.perfil[campo] === id) return
    estado.perfil[campo] = id
  }
  pintarOpcoes()
  aposMudar()
}

/** Redesenha tudo que depende do perfil e guarda no aparelho. */
function aposMudar() {
  pintarLado()
  pintarForma()
  atualizarNotaVolume()
  atualizarNotaEquipamento()
  if (passo === TOTAL_PASSOS) pintarRevisao()
  guardarPerfil()
}

function pintarTrilha() {
  $('trilha').innerHTML = PASSOS.map((p, i) => {
    const n = i + 1
    const estadoP = n === passo ? 'atual' : n < passo || n <= maiorPassoVisto ? 'feito' : ''
    return `<li class="${estadoP}">
      <button type="button" data-ir="${n}"${n === passo ? ' aria-current="step"' : ''}>
        <span class="n">${n < passo ? '<svg aria-hidden="true"><use href="#i-check"></use></svg>' : n}</span>
        <span class="r">${esc(p.curto)}</span>
      </button></li>`
  }).join('')
}

function pintarLado() {
  const { livres, total, pct } = acervoDisponivel(estado.perfil)
  const apertado = livres < total * 0.45
  $('acervoVivo').innerHTML = `
    <span class="rot">Acervo disponível</span>
    <span class="n">${livres.toLocaleString('pt-BR')}</span>
    <span class="q">preparações passam pelo que você marcou</span>
    <span class="barra${apertado ? ' apertado' : ''}"><i style="width:${Math.max(pct, 2)}%"></i></span>
    <span class="pe">${pct}% do acervo do livro${apertado ? ' · a semana pode precisar repetir prato' : ''}</span>`

  $('resumoVivo').innerHTML = `<span class="rot">Suas respostas</span>` +
    resumoDoPerfil().map(({ n, rot, valor }) => `
      <button class="linha-resumo${n === passo ? ' atual' : ''}${n > maiorPassoVisto ? ' futuro' : ''}"
              type="button" data-ir="${n}">
        <span class="q">${esc(rot)}</span>
        <span class="v">${esc(valor)}</span>
      </button>`).join('')
}

function resumoDoPerfil() {
  const p = estado.perfil
  const nomes = (lista, fonte) => fonte.filter((x) => lista.includes(x.id)).map((x) => x.rot)
  const comp = nomes(p.composicao ?? [], COMPOSICAO)
  const restr = nomes(p.restricoes, RESTRICOES)
  if (p.digestao) restr.push('Sem concentrar pesados')
  return [
    { n: 1, rot: 'Serviço', valor: SERVICOS.find((x) => x.id === p.servico)?.rot ?? '—' },
    { n: 2, rot: 'Padrão', valor: PADROES.find((x) => x.id === p.padrao)?.rot ?? '—' },
    { n: 3, rot: 'Volume', valor: `${p.refeicoes} refeições por dia` },
    { n: 4, rot: 'Cozinha', valor: p.equipamentos.length
        ? nomes(p.equipamentos, EQUIPAMENTOS).join(', ') : 'Nenhum equipamento' },
    { n: 5, rot: 'Composição', valor: comp.length ? comp.join(', ') : 'A composição padrão do livro' },
    { n: 6, rot: 'Restrições', valor: restr.length ? restr.join(', ') : 'Nenhuma' },
    { n: 7, rot: 'Quando', valor: `${nomeDoMes(estado.mes)}, ${estado.dias} dias` },
  ]
}

function pintarRevisao() {
  $('revisao').innerHTML = resumoDoPerfil().map(({ n, rot, valor }) => `
    <button class="linha-revisao" type="button" data-ir="${n}">
      <span class="q">${esc(rot)}</span>
      <span class="v">${esc(valor)}</span>
      <span class="e" aria-hidden="true">Mudar</span>
    </button>`).join('')
}

/** Desenha a ordem da refeição que sai do que foi marcado no passo 5. */
function pintarForma() {
  $('formaLinhas').innerHTML = estruturaDoServico(estado.perfil)
    .map((l) => `<li>${esc(l.espaco.replace(' · ', ': '))}</li>`).join('')
}

function pintarMeses() {
  $('meses').innerHTML = MESES.map(([v, n]) => {
    const on = estado.mes === v
    return `<button class="chip-mes" type="button" role="radio" aria-checked="${on}"
      tabindex="${on ? 0 : -1}" data-mes="${v}" aria-label="${esc(n)}, ${itensNaSafra(v).length} itens na safra">
      <span class="m">${esc(n.slice(0, 3))}</span>
      <span class="q">${itensNaSafra(v).length}</span>
    </button>`
  }).join('')
}

function pintarDiasOpcao() {
  $('diasOpcao').innerHTML = [[5, '5 dias', 'Segunda a sexta'], [6, '6 dias', 'Inclui sábado'],
    [7, '7 dias', 'Semana inteira']].map(([v, rot, desc]) => {
    const on = estado.dias === v
    return `<button class="chip-dia" type="button" role="radio" aria-checked="${on}"
      tabindex="${on ? 0 : -1}" data-dias="${v}">
      <span class="m">${rot}</span><span class="q">${desc}</span></button>`
  }).join('')
}

function atualizarNotaVolume() {
  const n = estado.perfil.refeicoes
  $('notaVolume').innerHTML = n >= 400
    ? `Acima de 400 refeições o assistente deixa de sugerir <b>grelhados e empanados</b>:
       no volume, prato feito um a um não sai.`
    : `Até 400 refeições o assistente considera todos os métodos que o seu equipamento permite.`
}

function atualizarNotaEquipamento() {
  const faltando = EQUIPAMENTOS.filter((e) => !estado.perfil.equipamentos.includes(e.id))
  $('notaEquipamento').innerHTML = faltando.length
    ? `Sem ${esc(faltando.map((e) => e.rot.toLowerCase()).join(' e '))}, o assistente não sugere
       ${esc(faltando.flatMap((e) => e.metodos).join(', '))}.`
    : `Com os três, nenhum método de cocção do livro fica de fora.`
}

function atualizarNotaSafra() {
  const itens = itensNaSafra(estado.mes).map((s) => s.item)
  $('notaSafra').innerHTML = itens.length
    ? `Em <b>${esc(nomeDoMes(estado.mes))}</b> o livro marca ${itens.length} itens na safra,
       entre eles ${esc(itens.slice(0, 5).join(', ').toLowerCase())}.`
    : `O livro não marca nenhum item de safra em ${esc(nomeDoMes(estado.mes))}.`
}

function mostrarPasso(n, comFoco = true) {
  passo = Math.max(1, Math.min(n, TOTAL_PASSOS))
  maiorPassoVisto = Math.max(maiorPassoVisto, passo)

  let atual = null
  for (const etapa of $$('#formPerfil .etapa')) {
    const dela = +etapa.dataset.passo === passo
    etapa.hidden = !dela
    if (dela) atual = etapa
  }

  pintarTrilha()
  pintarLado()
  if (passo === 3) {
    $('refeicoes').value = estado.perfil.refeicoes
    sincronizarRange()
    atualizarNotaVolume()
  }
  if (passo === 4) atualizarNotaEquipamento()
  if (passo === 5) pintarForma()
  if (passo === 7) { pintarMeses(); pintarDiasOpcao(); atualizarNotaSafra() }
  if (passo === TOTAL_PASSOS) pintarRevisao()

  $('wizVoltar').innerHTML = '<svg aria-hidden="true"><use href="#i-esq"></use></svg>Voltar'
  $('wizAvancar').textContent = passo === TOTAL_PASSOS ? 'Montar minha semana' : 'Continuar'
  $('wizConta').textContent = `Passo ${passo} de ${TOTAL_PASSOS}`
  $('wizAviso').textContent = `Passo ${passo} de ${TOTAL_PASSOS}: ${PASSOS[passo - 1].rot}`

  // a caixa tem altura mínima, então o botão Continuar não anda de lugar entre
  // um passo e outro: antes ele descia 80px e a pessoa reposicionava o mouse
  if (comFoco) atual?.focus({ preventScroll: true })
  const topo = $('wizard').getBoundingClientRect().top + window.scrollY - 12
  if (window.scrollY > topo) window.scrollTo({ top: topo, behavior: 'smooth' })
}

/* ---------------------------------------------------- endereço de cada passo */
function aplicarHash() {
  const bruto = decodeURIComponent(location.hash.replace(/^#/, ''))
  if (bruto.startsWith('montar')) {
    const n = Number(bruto.split('/')[1]) || 1
    if (telaAtual !== 'wizard') { mostrarTela('wizard'); pintarOpcoes() }
    mostrarPasso(n)
    return
  }
  if (bruto === 'cardapio') {
    if (!estado.cardapio) gerar(); else mostrarTela('resultado')
    return
  }
  mostrarTela('abertura')
}

const irPara = (hash) => { if (location.hash !== hash) location.hash = hash }

function abrirWizard(n = 1) {
  pintarOpcoes()
  maiorPassoVisto = Math.max(maiorPassoVisto, n)
  irPara(`#montar/${n}`)
  if (telaAtual !== 'wizard') { mostrarTela('wizard'); mostrarPasso(n) }
}

function guardarPerfil() {
  memoria.gravar(CHAVE_PERFIL, { ...estado.perfil, mes: estado.mes, dias: estado.dias })
}

/* ======================================================= 3. resultado */

function rotuloPerfil() {
  const p = estado.perfil
  const servico = SERVICOS.find((s) => s.id === p.servico)?.rot ?? ''
  const padrao = PADROES.find((x) => x.id === p.padrao)?.rot?.toLowerCase() ?? ''
  const semEquip = EQUIPAMENTOS.filter((e) => !p.equipamentos.includes(e.id)).map((e) => e.rot.toLowerCase())
  const restr = RESTRICOES.filter((r) => p.restricoes.includes(r.id)).map((r) => r.rot.toLowerCase())
  const comp = COMPOSICAO.filter((c) => (p.composicao ?? []).includes(c.id)).map((c) => c.rot.toLowerCase())
  const extras = [...comp, ...semEquip.map((e) => `sem ${e}`), ...restr,
                  ...(p.digestao ? ['sem concentrar pesados'] : [])]
  return `<span class="rot">Seu serviço</span>
    <span class="val"><b>${esc(servico)}</b> · padrão ${esc(padrao)} · ${p.refeicoes} refeições${
      extras.length ? ` · ${esc(extras.join(' · '))}` : ''}</span>
    <button class="ajustar" id="ajustarPerfil" type="button">
      <svg aria-hidden="true"><use href="#i-ajuste"></use></svg>Ajustar</button>`
}

const sinais = (item) => {
  const partes = []
  if (item.safra) {
    partes.push(`<svg class="folha" aria-hidden="true"><use href="#i-folha"></use></svg>`)
  }
  if (item.metodo) partes.push(esc(item.metodo))
  if (!partes.length) return ''
  const titulo = item.safra ? ` title="${esc(item.safra)} está na safra deste mês"` : ''
  return `<span class="sinais"${titulo}>${partes.join(' ')}</span>`
}

/** Roda o motor e redesenha. */
function gerar() {
  mostrarTela('resultado')
  irPara('#cardapio')
  const r = montar(estado)
  estado.cardapio = r.cardapio
  estado.trocas = 0
  estrutura = r.estrutura
  if (estado.diaVisivel >= estado.cardapio.length) estado.diaVisivel = 0
  pintar()
}

/**
 * Remontar joga fora as trocas feitas na mão. Antes trocar o mês fazia isso em
 * silêncio, e o trabalho sumia sem aviso.
 */
function regerar(motivo) {
  if (estado.trocas > 0 &&
      !confirm(`${motivo} refaz a semana inteira e descarta ${estado.trocas} troca${
        estado.trocas > 1 ? 's' : ''} que você fez na mão. Continuar?`)) {
    $('mes').value = estado.mes
    $('dias').value = String(estado.dias)
    return false
  }
  return true
}

function pintar() {
  const c = estado.cardapio

  $('perfil').innerHTML = rotuloPerfil()
  $('ajustarPerfil').addEventListener('click', () => abrirWizard(1))

  pintarConferencia()
  pintarTiraDias()
  pintarDia()
  pintarAvisos()

  const cabeca = `<tr><th>Espaço</th>${c.map((d) =>
    `<th>${esc(d.dia)}</th>`).join('')}</tr>`
  $('grade').tHead.innerHTML = cabeca

  const corpo = estrutura.map((linha, li) => {
    const celulas = c.map((dia, di) => {
      const item = dia.itens[li]
      if (!item || item.vazio) {
        return `<td><div class="vazio">sem opção com os filtros de hoje</div></td>`
      }
      return `<td><button class="prato" type="button" data-di="${di}" data-li="${li}">
        <span class="nome">${esc(item.nome)}</span>${sinais(item)}</button></td>`
    }).join('')
    return `<tr><th>${esc(linha.espaco)}</th>${celulas}</tr>`
  }).join('')
  $('grade').tBodies[0].innerHTML = corpo

  for (const b of $$('#grade .prato')) {
    b.addEventListener('click', () => abrirPrato(+b.dataset.di, +b.dataset.li))
  }
}

function pintarConferencia() {
  $('conferencia').innerHTML = conferir(estado.cardapio).map(([icone, regra, valor]) =>
    `<div class="selo">
      <span class="marca-selo"><svg aria-hidden="true"><use href="#${icone}"></use></svg></span>
      <span><span class="regra">${esc(regra)}</span><span class="valor">${esc(valor)}</span></span>
    </div>`).join('')
}

function pintarTiraDias() {
  $('tiraDias').innerHTML = estado.cardapio.map((d, i) =>
    `<button type="button" role="tab" aria-selected="${i === estado.diaVisivel}" data-dia="${i}">
      <span class="d">${esc(CURTOS[d.dia] ?? d.dia)}</span>
      <span class="n">${i + 1}</span>
    </button>`).join('')
  for (const b of $$('#tiraDias button')) {
    b.addEventListener('click', () => {
      estado.diaVisivel = +b.dataset.dia
      pintarTiraDias()
      pintarDia()
    })
  }
}

function pintarDia() {
  const dia = estado.cardapio[estado.diaVisivel]
  if (!dia) return
  $('cartoesDia').innerHTML = dia.itens.map((item, li) => {
    if (item.vazio) {
      return `<div class="cartao-prato sem-opcao">
        <span class="miolo"><span class="espaco">${esc(item.espaco)}</span>
        <span class="nome">sem opção com os filtros de hoje</span></span></div>`
    }
    return `<button class="cartao-prato" type="button" data-di="${estado.diaVisivel}" data-li="${li}">
      <span class="miolo">
        <span class="espaco">${esc(item.espaco)}</span>
        <span class="nome">${esc(item.nome)}</span>${sinais(item)}
      </span>
      <svg aria-hidden="true"><use href="#i-dir"></use></svg>
    </button>`
  }).join('')
  for (const b of $$('#cartoesDia .cartao-prato[data-di]')) {
    b.addEventListener('click', () => abrirPrato(+b.dataset.di, +b.dataset.li))
  }
}

function pintarAvisos() {
  const avisos = []
  if (base?.meta?.amostra) {
    avisos.push(['neutro', `Versão de teste: sorteando dentro de ${base.preparacoes.length} preparações, ` +
      `uma amostra do acervo de ${base.meta.totalReal} do livro.`])
  }
  if (estado.relaxados.length) {
    avisos.push(['atencao', `<b>Equipamento:</b> em ${esc(estado.relaxados.join(', ').toLowerCase())} o acervo ` +
      `não tinha opção compatível com o que você informou, então o assistente usou o que havia. ` +
      `Confira esses pratos antes de fechar.`])
  }
  if (estado.repetidos.length) {
    avisos.push(['atencao', `<b>Repetição:</b> em ${esc(estado.repetidos.join(', ').toLowerCase())} o acervo ` +
      `do livro não tem preparações suficientes para a semana inteira sem repetir, com os filtros ativos.`])
  }
  if (estado.perfil.restricoes.length) {
    avisos.push(['atencao', `<b>Restrições:</b> o assistente exclui pratos lendo o nome e a descrição de cada ` +
      `preparação. É uma leitura de texto, não uma ficha de ingredientes: uma preparação que não ` +
      `mencione o item pode passar. Confira antes de servir.`])
  }
  $('avisos').innerHTML = avisos.map(([tipo, texto]) =>
    `<div class="recado ${tipo}">
      <svg aria-hidden="true"><use href="#${tipo === 'atencao' ? 'i-atencao' : 'i-ajuda'}"></use></svg>
      <span>${texto}</span></div>`).join('')
}

/* ============================================ gaveta: detalhe e troca
   No desktop ela é <dialog> não modal e o palco encolhe do lado: a semana
   continua visível e clicável, então dá para pular de um prato para outro
   sem fechar nada. No celular não sobra tela para as duas coisas, e aí ela
   volta a ser folha modal. */
let alvoAtual = { di: 0, li: 0 }
let quemAbriuGaveta = null
const telaLarga = () => window.matchMedia('(min-width: 1024px)').matches

function itemAtual() {
  return estado.cardapio?.[alvoAtual.di]?.itens?.[alvoAtual.li]
}

function abrirGaveta() {
  const g = $('gavetaPrato')
  prepararDialogo(g)
  if (telaLarga()) {
    document.querySelector('.casca').classList.add('com-gaveta')
    if (!g.open) g.show()
  } else {
    document.querySelector('.casca').classList.remove('com-gaveta')
    if (!g.open) abrirDialogo(g)
  }
}

function fecharGaveta() {
  const g = $('gavetaPrato')
  if (g?.open) g.close()
}

/** Devolve a tela ao estado sem gaveta, venha o fechamento de onde vier. */
function limparGaveta() {
  document.querySelector('.casca').classList.remove('com-gaveta')
  for (const b of $$('.prato.vendo, .cartao-prato.vendo')) b.classList.remove('vendo')
  // a folha do celular tranca a rolagem da página ao abrir
  if (!document.querySelector('dialog[open]')) document.documentElement.style.overflow = ''
  if (quemAbriuGaveta?.isConnected) quemAbriuGaveta.focus({ preventScroll: true })
  quemAbriuGaveta = null
}

function abrirPrato(di, li) {
  alvoAtual = { di, li }
  const item = itemAtual()
  if (!item || item.vazio) return

  $('pratoEspaco').textContent = `${item.espaco} · ${estado.cardapio[di].dia}`
  $('pratoNome').textContent = item.nome
  $('pratoSinais').innerHTML = [
    item.metodo ? `<span class="etiq">${esc(item.metodo)}</span>` : '',
    item.categoria ? `<span class="etiq teal">${esc(item.categoria)}</span>` : '',
    item.safra ? `<span class="etiq safra">${esc(item.safra)} na safra</span>` : '',
  ].join('')

  $('pratoDescricao').textContent = item.descricao || 'O livro não traz descrição para esta preparação.'
  $('pratoDescricao').classList.toggle('sem-texto', !item.descricao)
  $('pratoMotivos').innerHTML = motivosDoPrato(item).map((m) => `<li>${m}</li>`).join('')
  $('contaTroca').textContent = (item.alternativas ?? []).length

  mostrarAba('detalhe')
  $('filtroTroca').value = ''
  // a gaveta do desktop não é modal, então o foco não entra sozinho: sem isso
  // quem navega por teclado abria a gaveta e continuava tabulando na grade
  const jaAberta = $('gavetaPrato').open
  if (!jaAberta) quemAbriuGaveta = document.activeElement
  abrirGaveta()
  $('pratoNome').focus({ preventScroll: true })
  // realça na grade o prato que a gaveta está mostrando
  for (const b of $$('#grade .prato, #cartoesDia .cartao-prato')) {
    b.classList.toggle('vendo', +b.dataset.di === di && +b.dataset.li === li)
  }
}

function mostrarAba(qual) {
  const detalhe = qual === 'detalhe'
  $('abaDetalhe').setAttribute('aria-selected', String(detalhe))
  $('abaTroca').setAttribute('aria-selected', String(!detalhe))
  $('painelDetalhe').hidden = !detalhe
  $('painelTroca').hidden = detalhe
  if (!detalhe) pintarTroca($('filtroTroca').value)
  $('gavetaPrato').querySelector('.gaveta-corpo').scrollTo({ top: 0 })
}

/** Traduz para texto a regra do capítulo VI que colocou o prato naquele espaço. */
function motivosDoPrato(item) {
  const motivos = []
  if (item.espaco === 'Prato principal' && item.referencia) {
    motivos.push(`Rodízio de proteína do dia: <b>${esc(item.referencia)}</b>. É a regra 3.7,
      variedade de ingredientes, aplicada ao longo da semana.`)
  } else if (item.referencia) {
    motivos.push(`Escolhido dentro de <b>${esc(item.referencia)}</b>, a categoria que o livro
      indica para este espaço da refeição.`)
  }
  if (item.safra) {
    motivos.push(`Ganhou peso porque <b>${esc(item.safra)}</b> está na safra do mês. Regra 3.1,
      estação do ano.`)
  }
  if (item.metodo) {
    motivos.push(`Método de cocção <b>${esc(item.metodo)}</b>, diferente do resto do dia sempre
      que o acervo permite. Regra 3.2, variedade de cocção.`)
  }
  if (!motivos.length) {
    motivos.push(`Sorteado entre as preparações que cabem neste espaço com os filtros do seu serviço.`)
  }
  return motivos
}

function pintarTroca(filtro) {
  const item = itemAtual()
  const alvo = semAcento(filtro ?? '')
  const lista = (item?.alternativas ?? []).filter((a) =>
    !alvo || semAcento(`${a.nome} ${a.descricao ?? ''}`).includes(alvo))

  $('trocaLista').innerHTML = lista.length
    ? lista.map((a, i) => `<button class="escolha" type="button" data-troca="${i}">
        <span class="n">${esc(a.nome)}</span>
        ${a.descricao ? `<span class="d">${esc(a.descricao)}</span>` : ''}
        <span class="meta">
          ${a.metodo ? `<span class="etiq">${esc(a.metodo)}</span>` : ''}
          ${a.categoria ? `<span class="etiq teal">${esc(a.categoria)}</span>` : ''}
          ${a.safra ? `<span class="etiq safra">${esc(a.safra)} na safra</span>` : ''}
        </span></button>`).join('')
    : `<div class="sem-salvos">Nenhuma opção com esse filtro.</div>`

  for (const b of $$('#trocaLista .escolha')) {
    b.addEventListener('click', () => trocarPor(lista[+b.dataset.troca]))
  }
}

function trocarPor(nova) {
  if (!nova) return
  const item = itemAtual()
  const antiga = { id: nova.id, nome: item.nome, metodo: item.metodo, descricao: item.descricao,
                   referencia: item.referencia, categoria: item.categoria, safra: item.safra }
  const restantes = (item.alternativas ?? []).filter((a) => a.id !== nova.id)
  estado.cardapio[alvoAtual.di].itens[alvoAtual.li] = {
    espaco: item.espaco, nome: nova.nome, metodo: nova.metodo, descricao: nova.descricao,
    referencia: nova.referencia, categoria: nova.categoria, safra: nova.safra,
    alternativas: [antiga, ...restantes],
  }
  estado.trocas = (estado.trocas ?? 0) + 1
  redesenharCelulas()
  pintarConferencia()
  abrirPrato(alvoAtual.di, alvoAtual.li)
  avisar('Prato trocado. O resto da semana ficou como estava.')
}

function redesenharCelulas() {
  const celula = $$('#grade .prato').find((b) =>
    +b.dataset.di === alvoAtual.di && +b.dataset.li === alvoAtual.li)
  const item = itemAtual()
  if (celula && item) {
    celula.innerHTML = `<span class="nome">${esc(item.nome)}</span>${sinais(item)}`
  }
  pintarDia()
}

/* ------------------------------------------------------------ salvos */
const lerSalvos = () => memoria.ler(CHAVE_SALVOS, [])

function salvarCardapio() {
  const salvos = lerSalvos()
  salvos.unshift({
    id: Date.now(),
    nome: `${nomeDoMes(estado.mes)} · ${estado.dias} dias`,
    criadoEm: new Date().toISOString(),
    mes: estado.mes,
    dias: estado.dias,
    perfil: { ...estado.perfil },
    cardapio: estado.cardapio,
    estrutura,
  })
  if (memoria.gravar(CHAVE_SALVOS, salvos.slice(0, 30))) {
    avisar('Cardápio salvo neste aparelho.')
  } else {
    avisar('Não consegui salvar: o navegador bloqueou o armazenamento.')
  }
}

function pintarSalvos() {
  const salvos = lerSalvos()
  $('listaSalvos').innerHTML = salvos.length
    ? salvos.map((s) => {
      const quando = new Date(s.criadoEm).toLocaleDateString('pt-BR',
        { day: '2-digit', month: 'short', year: 'numeric' })
      const servico = SERVICOS.find((x) => x.id === s.perfil?.servico)?.rot ?? ''
      return `<div class="salvo">
        <button class="abrir" type="button" data-id="${s.id}">
          <span class="n">${esc(s.nome)}</span>
          <span class="q">${esc(servico)} · salvo em ${esc(quando)}</span>
        </button>
        <button class="bt-icone apagar" type="button" data-apagar="${s.id}" aria-label="Apagar este cardápio">
          <svg aria-hidden="true"><use href="#i-fechar"></use></svg>
        </button>
      </div>`
    }).join('')
    : `<div class="sem-salvos">Você ainda não salvou nenhum cardápio.<br>
       Monte uma semana e toque em <b>Salvar</b>.</div>`

  for (const b of $$('#listaSalvos .abrir')) {
    b.addEventListener('click', () => carregarSalvo(+b.dataset.id))
  }
  for (const b of $$('#listaSalvos .apagar')) {
    b.addEventListener('click', () => {
      memoria.gravar(CHAVE_SALVOS, lerSalvos().filter((s) => s.id !== +b.dataset.apagar))
      pintarSalvos()
      avisar('Cardápio apagado.')
    })
  }
}

function carregarSalvo(id) {
  const s = lerSalvos().find((x) => x.id === id)
  if (!s) return
  estado.mes = s.mes
  estado.dias = s.dias
  estado.perfil = { ...PERFIL_PADRAO, ...s.perfil }
  estado.cardapio = s.cardapio
  estado.relaxados = []
  estado.repetidos = []
  estado.diaVisivel = 0
  estado.trocas = 0
  estrutura = s.estrutura ?? estruturaDoServico(estado.perfil)
  $('mes').value = estado.mes
  $('dias').value = String(estado.dias)
  $('dlgSalvos').close()
  mostrarTela('resultado')
  irPara('#cardapio')
  pintar()
  avisar('Cardápio carregado.')
}

/* ------------------------------------------------------------ texto */
function cardapioEmTexto() {
  const linhas = [`Cardápio — ${nomeDoMes(estado.mes)}, ${estado.dias} dias`, '']
  for (const dia of estado.cardapio) {
    linhas.push(dia.dia.toUpperCase())
    for (const item of dia.itens) {
      linhas.push(`  ${item.espaco}: ${item.vazio ? '(sem opção)' : item.nome}`)
    }
    linhas.push('')
  }
  linhas.push('Montado com o Assistente de Cardápio de "Cardápios: um livro vivo".')
  return linhas.join('\n')
}

/* ------------------------------------------------------------ eventos */

function sincronizarRange() {
  $('refeicoesRange').value = String(Math.min(estado.perfil.refeicoes, 1000))
}

function mudarVolume(valor) {
  estado.perfil.refeicoes = Math.max(10, Math.min(5000, Math.round(valor / 10) * 10 || 200))
  $('refeicoes').value = estado.perfil.refeicoes
  sincronizarRange()
  aposMudar()
}

/** Setas dentro de um grupo de rádio, como manda o padrão de teclado. */
function andarNoGrupo(grupo, atual, passoTeclado) {
  const itens = $$('[role=radio]', grupo)
  const i = itens.indexOf(atual)
  if (i < 0) return
  const alvo = itens[(i + passoTeclado + itens.length) % itens.length]
  alvo.click()
  // o clique redesenha o grupo inteiro, então o botão de antes já saiu do
  // documento: focar nele mandaria o foco para o body
  const chave = alvo.dataset.id ?? alvo.dataset.mes ?? alvo.dataset.dias
  const atributo = alvo.dataset.id ? 'data-id' : alvo.dataset.mes ? 'data-mes' : 'data-dias'
  grupo.querySelector(`[${atributo}="${CSS.escape(chave)}"]`)?.focus()
}

function ligarEventos() {
  prepararDialogo($('dlgSalvos'))
  prepararDialogo($('gavetaPrato'))

  /* --- apresentação --- */
  $('comecar').addEventListener('click', () => abrirWizard(1))
  $('verSalvosApresentacao').addEventListener('click', () => { pintarSalvos(); abrirDialogo($('dlgSalvos')) })
  $('btSalvos')?.addEventListener('click', () => { pintarSalvos(); abrirDialogo($('dlgSalvos')) })
  $('btPerfil')?.addEventListener('click', () => abrirWizard(1))

  /* --- wizard --- */
  const form = $('formPerfil')
  form.addEventListener('click', (ev) => {
    const opt = ev.target.closest('.opt')
    if (opt) { escolher(opt.dataset.campo, opt.dataset.id, opt.dataset.tipo); return }
    const mes = ev.target.closest('[data-mes]')
    if (mes) {
      estado.mes = mes.dataset.mes
      pintarMeses(); atualizarNotaSafra(); pintarLado(); guardarPerfil()
      $('meses').querySelector(`[data-mes="${CSS.escape(estado.mes)}"]`)?.focus()
      return
    }
    const dias = ev.target.closest('[data-dias]')
    if (dias) {
      estado.dias = +dias.dataset.dias
      pintarDiasOpcao(); pintarLado(); guardarPerfil()
      $('diasOpcao').querySelector(`[data-dias="${estado.dias}"]`)?.focus()
      return
    }
    const ir = ev.target.closest('[data-ir]')
    if (ir) irPara(`#montar/${ir.dataset.ir}`)
  })

  form.addEventListener('keydown', (ev) => {
    const alvo = ev.target.closest('[role=radio]')
    if (!alvo) return
    const direcao = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key]
    if (!direcao) return
    ev.preventDefault()
    andarNoGrupo(alvo.closest('[role=radiogroup]'), alvo, direcao)
  })

  $('wizard').addEventListener('click', (ev) => {
    const ir = ev.target.closest('[data-ir]')
    if (ir) irPara(`#montar/${ir.dataset.ir}`)
  })

  $('wizVoltar').addEventListener('click', () => {
    if (passo === 1) { irPara(estado.cardapio ? '#cardapio' : '#'); return }
    irPara(`#montar/${passo - 1}`)
  })
  $('wizAvancar').addEventListener('click', () => {
    if (passo < TOTAL_PASSOS) { irPara(`#montar/${passo + 1}`); return }
    guardarPerfil()
    gerar()
  })
  $('sairWizard').addEventListener('click', () => irPara(estado.cardapio ? '#cardapio' : '#'))

  // Enter em qualquer lugar do formulário avança, menos dentro de um campo de
  // número, onde Enter costuma significar "confirmei este valor"
  form.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' || ev.target.matches('input[type=number], input[type=range]')) return
    if (ev.target.closest('.opt, [data-mes], [data-dias], [data-ir]')) return
    ev.preventDefault()
    $('wizAvancar').click()
  })

  $('refeicoes').addEventListener('input', (ev) => {
    const n = Number(ev.target.value)
    if (!Number.isFinite(n) || n <= 0) return
    estado.perfil.refeicoes = Math.max(10, Math.min(5000, n))
    sincronizarRange()
    aposMudar()
  })
  $('refeicoes').addEventListener('blur', () => mudarVolume(Number($('refeicoes').value)))
  $('refeicoesRange').addEventListener('input', (ev) => mudarVolume(Number(ev.target.value)))
  for (const b of $$('[data-passo-num]')) {
    b.addEventListener('click', () => mudarVolume(estado.perfil.refeicoes + Number(b.dataset.passoNum)))
  }

  /* --- resultado --- */
  $('mes').addEventListener('change', (e) => {
    if (!regerar('Trocar o mês')) return
    estado.mes = e.target.value
    guardarPerfil()
    gerar()
  })
  $('dias').addEventListener('change', (e) => {
    if (!regerar('Trocar o número de dias')) return
    estado.dias = +e.target.value
    guardarPerfil()
    gerar()
  })
  $('outra').addEventListener('click', () => {
    if (!regerar('Gerar outra semana')) return
    estado.semente++
    gerar()
    avisar('Nova sugestão montada.')
  })
  $('salvar').addEventListener('click', salvarCardapio)
  $('imprimir').addEventListener('click', () => window.print())
  $('copiar').addEventListener('click', () => copiar(cardapioEmTexto(), 'Cardápio copiado como texto.'))

  /* --- gaveta --- */
  $('abaDetalhe').addEventListener('click', () => mostrarAba('detalhe'))
  $('abaTroca').addEventListener('click', () => mostrarAba('troca'))
  // O evento close do <dialog> não chega em todo navegador; observar o atributo
  // open pega qualquer caminho de fechamento: botão, Esc, clique fora.
  const gaveta = $('gavetaPrato')
  new MutationObserver(() => { if (!gaveta.open) limparGaveta() })
    .observe(gaveta, { attributes: true, attributeFilter: ['open'] })
  // <dialog> não modal não fecha sozinho no Esc
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && $('gavetaPrato').open && telaLarga()) fecharGaveta()
  })
  window.matchMedia('(min-width: 1024px)').addEventListener('change', fecharGaveta)

  let relogioFiltro
  $('filtroTroca').addEventListener('input', (ev) => {
    clearTimeout(relogioFiltro)
    const valor = ev.target.value
    relogioFiltro = setTimeout(() => pintarTroca(valor), 130)
  })

  window.addEventListener('hashchange', aplicarHash)
}

/* ------------------------------------------------------------ início */
async function iniciar() {
  ligarEventos()

  const salvo = memoria.ler(CHAVE_PERFIL)
  if (salvo) {
    estado.perfil = { ...PERFIL_PADRAO, ...salvo }
    if (salvo.mes) estado.mes = salvo.mes
    if (salvo.dias) estado.dias = salvo.dias
    // mes e dias moram fora do perfil; guardá-los juntos foi o jeito de a
    // pessoa voltar e achar tudo como deixou
    delete estado.perfil.mes
    delete estado.perfil.dias
  }

  let resposta
  try {
    resposta = await fetch('/app/conteudo.php?arquivo=assistente')
  } catch {
    return falhar('Não consegui carregar o acervo. Confira a conexão e recarregue a página.')
  }
  if (resposta.status === 403) { location.href = '/app/'; return }
  if (!resposta.ok) return falhar('O acervo não está disponível agora. Tente de novo em instantes.')
  base = await resposta.json()

  // Cabeçalhos das tabelas do livro que a extração trouxe como preparação
  base.preparacoes = base.preparacoes.filter((p) => !ehCabecalho(p))

  const opcoesDeMes = MESES.map(([v, n]) =>
    `<option value="${v}"${v === estado.mes ? ' selected' : ''}>${n}</option>`).join('')
  $('mes').innerHTML = opcoesDeMes
  $('mes').value = estado.mes
  $('dias').value = String(estado.dias)

  pintarNumeros()
  pintarPrevia()
  aplicarHash()
}

function falhar(recado) {
  const caixa = `<div class="recado erro">
    <svg aria-hidden="true"><use href="#i-atencao"></use></svg><span>${esc(recado)}</span></div>`
  $('avisos').innerHTML = caixa
  $('previaGrade').innerHTML = caixa
}

iniciar()
