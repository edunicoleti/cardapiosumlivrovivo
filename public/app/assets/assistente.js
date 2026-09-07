/* ==========================================================================
   Assistente de cardápio
   O motor é determinístico e vem do capítulo VI: não há modelo de linguagem
   aqui, e nenhum prato é inventado. A interface só mostra o que ele decidiu e
   por quê, e deixa a nutricionista ter a palavra final em cada espaço.
   ========================================================================== */

import { $, $$, esc, semAcento, memoria, avisar, copiar, prepararDialogo, abrirDialogo } from './plataforma.js'

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
  { id: 'institucional', rot: 'Coletiva institucional', desc: 'Empresa, indústria, hospital' },
  { id: 'bufe', rot: 'Bufê por peso', desc: 'Comercial, self-service' },
  { id: 'infantil', rot: 'Escola ou creche', desc: 'Público infantil' },
  { id: 'repouso', rot: 'Casa de repouso', desc: 'Preparações mais macias' },
]
const PADROES = [
  { id: 'popular', rot: 'Popular', desc: 'Preparações simples, custo menor' },
  { id: 'medio', rot: 'Médio ou diferenciado', desc: 'Mais elaborado, maior variedade' },
  { id: 'luxo', rot: 'Executivo ou de luxo', desc: 'Cardápio mais sofisticado' },
]
const EQUIPAMENTOS = [
  { id: 'forno', rot: 'Forno', desc: 'Assados e gratinados', metodos: ['assado', 'gratinado'] },
  { id: 'fritadeira', rot: 'Fritadeira', desc: 'Fritos e empanados', metodos: ['frito', 'empanado'] },
  { id: 'chapa', rot: 'Chapa ou grelha', desc: 'Grelhados', metodos: ['grelhado'] },
]
// Restringir pela categoria do livro nao basta: bacon, presunto, linguica e
// calabresa aparecem em salada, arroz, feijao e ate em ovo. Filtrar so a
// categoria "Carne Suína" deixaria passar cinco de cada seis pratos com suino.
// Por isso a restricao le o nome e a descricao de cada preparacao. Num filtro
// alimentar o erro tem de cair para o lado de excluir demais.
const RESTRICOES = [
  { id: 'sem-suina', rot: 'Sem carne suína', desc: 'Inclui bacon, presunto e embutidos',
    referencias: ['Carne suína'],
    termos: ['suin', 'porco', 'bacon', 'presunto', 'linguic', 'calabres', 'pernil', 'pancetta',
             'copa lombo', 'copa-lombo', 'tender', 'torresmo', 'paio', 'salsich', 'lombo'] },
  { id: 'sem-mar', rot: 'Sem frutos do mar', desc: 'Peixes, crustáceos e moluscos',
    referencias: ['Pescados'],
    termos: ['peixe', 'pescad', 'camarao', 'lula', 'polvo', 'mexilh', 'marisco', 'siri', 'caranguejo',
             'bacalhau', 'atum', 'sardinha', 'salmao', 'tilapia', 'merluza', 'anchova', 'fruto do mar'] },
  { id: 'sem-bovina', rot: 'Sem carne bovina', desc: 'Inclui charque e carne seca',
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
  { id: 'sopa', rot: 'Sopa na entrada', desc: '50 sopas e caldos do acervo' },
  { id: 'molho', rot: 'Molho como complemento', desc: '51 molhos quentes e frios' },
  { id: 'tipico', rot: 'Prato típico brasileiro', desc: 'Capítulo X: 321 preparações típicas, doces e salgadas' },
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

/* ================================================================== tela */

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

/* A grade tinha uma etiqueta colorida por informação em cada célula, e num
   cardápio de 50 células isso vira ruído: as etiquetas ficavam com mais peso
   visual que o nome do prato. Agora o nome manda, e o resto é uma linha de
   apoio. A folha marca safra; o detalhe do prato conta o resto. */
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
  const r = montar(estado)
  estado.cardapio = r.cardapio
  estrutura = r.estrutura
  if (estado.diaVisivel >= estado.cardapio.length) estado.diaVisivel = 0
  pintar()
}

/** Redesenha a partir do estado, sem passar pelo motor. */
function pintar() {
  const c = estado.cardapio

  $('perfil').innerHTML = rotuloPerfil()
  $('ajustarPerfil').addEventListener('click', () => abrirPerfil())

  pintarConferencia()
  pintarAvisos()

  // grade da semana (telas largas)
  $('grade').querySelector('thead').innerHTML =
    '<tr><th scope="col">Espaço</th>' + c.map((d) => `<th scope="col">${d.dia}</th>`).join('') + '</tr>'

  $('grade').querySelector('tbody').innerHTML = estrutura.map((linha, li) => {
    const celulas = c.map((dia, di) => {
      const item = dia.itens[li]
      if (!item || item.vazio) return '<td><div class="vazio">sem opção disponível</div></td>'
      return `<td>
        <button class="prato" data-dia="${di}" data-linha="${li}" type="button">
          <span class="nome">${esc(item.nome)}</span>
          ${sinais(item)}
        </button></td>`
    }).join('')
    return `<tr><th scope="row">${esc(linha.espaco)}</th>${celulas}</tr>`
  }).join('')

  pintarTiraDias()
  pintarDia()

  for (const botao of $$('.prato')) {
    botao.addEventListener('click', () => abrirPrato(+botao.dataset.dia, +botao.dataset.linha))
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
  $('tiraDias').innerHTML = estado.cardapio.map((d, i) => `
    <button type="button" role="tab" data-dia="${i}" aria-selected="${i === estado.diaVisivel}">
      <span class="d">${CURTOS[d.dia] ?? d.dia}</span>
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
    if (!item || item.vazio) {
      return `<div class="cartao-prato sem-opcao">
        <span class="miolo"><span class="espaco">${esc(item?.espaco ?? estrutura[li]?.espaco ?? '')}</span>
        <span class="nome">sem opção disponível com os filtros de agora</span></span></div>`
    }
    return `<button class="cartao-prato" type="button" data-dia="${estado.diaVisivel}" data-linha="${li}">
      <span class="miolo">
        <span class="espaco">${esc(item.espaco)}</span>
        <span class="nome">${esc(item.nome)}</span>
        ${sinais(item)}
      </span>
      <svg aria-hidden="true"><use href="#i-dir"></use></svg>
    </button>`
  }).join('')
  for (const b of $$('#cartoesDia .cartao-prato[data-dia]')) {
    b.addEventListener('click', () => abrirPrato(+b.dataset.dia, +b.dataset.linha))
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

/* ---------------------------------------------- detalhe e troca do prato */
let alvoAtual = { di: 0, li: 0 }

function itemAtual() {
  return estado.cardapio[alvoAtual.di].itens[alvoAtual.li]
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

  $('pratoDescricao').textContent = item.descricao
    ? item.descricao
    : 'O livro não traz descrição para esta preparação.'
  $('pratoDescricao').classList.toggle('sem-texto', !item.descricao)

  $('pratoMotivos').innerHTML = motivosDoPrato(item)
    .map((m) => `<li>${m}</li>`).join('')

  mostrarDetalhe()
  abrirDialogo($('dlgPrato'))
}

/** Traduz para texto a regra do capítulo VI que colocou o prato naquele espaço. */
function motivosDoPrato(item) {
  const motivos = []
  if (item.espaco === 'Prato principal' && item.referencia) {
    motivos.push(`Rodízio de proteína do dia: <b>${esc(item.referencia)}</b>. É a regra 3.7,
      variedade de ingredientes, aplicada ao longo da semana.`)
  } else if (item.referencia) {
    motivos.push(`Escolhido dentro de <b>${esc(item.referencia)}</b>, a categoria que o livro
      define para o espaço <b>${esc(item.espaco.toLowerCase())}</b>.`)
  }
  if (item.safra) {
    motivos.push(`Ganhou peso porque <b>${esc(item.safra)}</b> está na safra do mês. Regra 3.1,
      estação do ano.`)
  }
  if (item.metodo) {
    motivos.push(`Método de cocção <b>${esc(item.metodo)}</b>, diferente do resto do dia
      sempre que o acervo permite. Regra 3.2, variedade de cocção.`)
  }
  if (estado.perfil.digestao) {
    motivos.push(`A semana evita concentrar alimentos de difícil digestão no mesmo dia,
      pelas listas de 3.9.1 e 3.9.2.`)
  }
  return motivos
}

function mostrarDetalhe() {
  $('pratoDetalhe').hidden = false
  $('pratoTroca').hidden = true
  $('voltarDetalhe').hidden = true
  $('verOutras').hidden = false
}

function mostrarTroca() {
  $('pratoDetalhe').hidden = true
  $('pratoTroca').hidden = false
  $('voltarDetalhe').hidden = false
  $('verOutras').hidden = true
  $('filtroTroca').value = ''
  pintarTroca('')
}

function pintarTroca(filtro) {
  const item = itemAtual()
  const alvo = semAcento(filtro.trim())
  const lista = item.alternativas
    .map((a, i) => ({ a, i }))
    .filter(({ a }) => !alvo || semAcento(`${a.nome} ${a.descricao || ''}`).includes(alvo))

  $('trocaLista').innerHTML = lista.length
    ? lista.map(({ a, i }) => `
      <button class="escolha" data-i="${i}" type="button">
        <span class="n">${esc(a.nome)}</span>
        ${a.descricao ? `<span class="d">${esc(a.descricao)}</span>` : ''}
        ${sinais(a)}
      </button>`).join('')
    : `<div class="sem-salvos">Nenhuma outra opção${alvo ? ' com esse filtro' : ''} neste espaço.</div>`

  for (const opcao of $$('.escolha', $('trocaLista'))) {
    opcao.addEventListener('click', () => trocarPor(+opcao.dataset.i))
  }
}

function trocarPor(indice) {
  const item = itemAtual()
  const nova = item.alternativas[indice]
  const antigo = {
    nome: item.nome, metodo: item.metodo, safra: item.safra,
    descricao: item.descricao, referencia: item.referencia, categoria: item.categoria,
  }
  Object.assign(item, {
    nome: nova.nome, metodo: nova.metodo, safra: nova.safra,
    descricao: nova.descricao, referencia: nova.referencia, categoria: nova.categoria,
  })
  item.alternativas = item.alternativas.filter((_, k) => k !== indice)
  item.alternativas.unshift(antigo)
  $('dlgPrato').close()
  // trocar um prato não pode refazer o resto da semana
  redesenharCelulas()
  avisar('Prato trocado.')
}

function redesenharCelulas() {
  pintarConferencia()
  for (const botao of $$('.prato')) {
    const item = estado.cardapio[+botao.dataset.dia].itens[+botao.dataset.linha]
    botao.innerHTML = `<span class="nome">${esc(item.nome)}</span>${sinais(item)}`
  }
  pintarDia()
}

/* ------------------------------------------------------ perfil em passos */
const TOTAL_PASSOS = 7
let passo = 1

function pintarOpcoes() {
  const mapa = {
    servico: SERVICOS, padrao: PADROES, equipamentos: EQUIPAMENTOS,
    restricoes: RESTRICOES, composicao: COMPOSICAO,
    digestao: [{ id: 'sim', rot: 'Evitar concentrar alimentos pesados no mesmo dia',
                 desc: 'Fator 3.9: difícil digestão e flatulentos, pelas listas do livro' }],
  }
  for (const caixa of $$('.opcoes')) {
    const campo = caixa.dataset.campo
    const booleano = caixa.dataset.tipo === 'booleano'
    const multiplo = caixa.dataset.tipo === 'multiplo'
    caixa.innerHTML = mapa[campo].map((o) => {
      const marcado = booleano ? estado.perfil[campo] === true
        : multiplo ? estado.perfil[campo].includes(o.id) : estado.perfil[campo] === o.id
      return `<button class="opt" type="button" data-campo="${campo}" data-id="${o.id}"
        data-tipo="${caixa.dataset.tipo}" aria-pressed="${marcado}">${esc(o.rot)}${
        o.desc ? `<span class="desc">${esc(o.desc)}</span>` : ''}</button>`
    }).join('')
  }
  for (const botao of $$('.opt')) {
    botao.addEventListener('click', () => {
      const { campo, id, tipo } = botao.dataset
      if (tipo === 'booleano') {
        estado.perfil[campo] = !estado.perfil[campo]
      } else if (tipo === 'multiplo') {
        const lista = estado.perfil[campo]
        estado.perfil[campo] = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]
      } else {
        estado.perfil[campo] = id
      }
      pintarOpcoes()
    })
  }
}

function mostrarPasso(n) {
  passo = Math.max(1, Math.min(n, TOTAL_PASSOS))
  for (const grupo of $$('#formPerfil .grupo')) grupo.hidden = +grupo.dataset.passo !== passo
  $('trilhaPassos').innerHTML = Array.from({ length: TOTAL_PASSOS }, (_, i) =>
    `<span class="${i < passo ? 'feito' : ''}"></span>`).join('')
  $('perfilVoltar').hidden = passo === 1
  $('pularPerfil').hidden = passo !== 1
  $('perfilAvancar').textContent = passo === TOTAL_PASSOS ? 'Montar meu cardápio' : 'Continuar'
  $('dlgPerfil').querySelector('.modal-corpo')?.scrollTo({ top: 0 })
  atualizarNotaVolume()
  atualizarNotaSafra()
}

function atualizarNotaVolume() {
  const n = Number($('refeicoes').value) || 0
  $('notaVolume').textContent = n >= 400
    ? 'Acima de 400 refeições o assistente deixa de sugerir grelhados e empanados: no volume, prato feito um a um não sai.'
    : 'Até 400 refeições o assistente considera todos os métodos que o seu equipamento permite.'
}

function abrirPerfil() {
  $('refeicoes').value = estado.perfil.refeicoes
  $('mesWizard').value = estado.mes
  $('diasWizard').value = String(estado.dias)
  pintarOpcoes()
  mostrarPasso(1)
  abrirDialogo($('dlgPerfil'))
}

/** Diz quantos itens estão na safra do mês escolhido, com a lista do livro. */
function atualizarNotaSafra() {
  if (!base?.sazonalidade) return
  const mes = $('mesWizard').value
  const itens = base.sazonalidade.filter((s) => s.meses.includes(mes)).map((s) => s.item)
  const nome = MESES.find(([v]) => v === mes)?.[1] ?? ''
  $('notaSafra').textContent = itens.length
    ? `Em ${nome} o livro marca ${itens.length} itens na safra, entre eles ${itens.slice(0, 4).join(', ').toLowerCase()}.`
    : `O livro não marca nenhum item de safra em ${nome}.`
}

function guardarPerfil() {
  estado.perfil.refeicoes = Math.max(10, Math.min(5000, Number($('refeicoes').value) || 200))
  estado.mes = $('mesWizard').value
  estado.dias = Number($('diasWizard').value) || 5
  // a barra de cima continua servindo para trocar mês e dias depois de montado
  $('mes').value = estado.mes
  $('dias').value = String(estado.dias)
  memoria.gravar(CHAVE_PERFIL, estado.perfil)
}

/* ------------------------------------------------------------ salvos */
const lerSalvos = () => memoria.ler(CHAVE_SALVOS, [])

function salvarCardapio() {
  const mes = MESES.find(([v]) => v === estado.mes)?.[1] ?? ''
  const salvos = lerSalvos()
  salvos.unshift({
    id: Date.now(),
    nome: `${mes} · ${estado.dias} dias`,
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
  estrutura = s.estrutura ?? estruturaDoServico(estado.perfil.servico)
  $('mes').value = estado.mes
  $('dias').value = String(estado.dias)
  $('dlgSalvos').close()
  pintar()
  avisar('Cardápio carregado.')
}

/* ------------------------------------------------------------ texto */
function cardapioEmTexto() {
  const mes = MESES.find(([v]) => v === estado.mes)?.[1] ?? ''
  const linhas = [`Cardápio — ${mes}, ${estado.dias} dias`, '']
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

/* ------------------------------------------------------------ início */
function ligarEventos() {
  for (const d of [$('dlgPerfil'), $('dlgPrato'), $('dlgSalvos'), $('dlgAjuda')]) prepararDialogo(d)
  $('verOutras').addEventListener('click', mostrarTroca)
  $('voltarDetalhe').addEventListener('click', mostrarDetalhe)

  $('mes').addEventListener('change', (e) => { estado.mes = e.target.value; gerar() })
  $('dias').addEventListener('change', (e) => { estado.dias = +e.target.value; gerar() })
  $('outra').addEventListener('click', () => { estado.semente++; gerar(); avisar('Nova sugestão montada.') })
  $('salvar').addEventListener('click', salvarCardapio)
  $('imprimir').addEventListener('click', () => window.print())
  $('copiar').addEventListener('click', () => copiar(cardapioEmTexto(), 'Cardápio copiado como texto.'))

  $('btPerfil')?.addEventListener('click', () => abrirPerfil())
  $('btAjuda')?.addEventListener('click', () => abrirDialogo($('dlgAjuda')))
  $('btSalvos')?.addEventListener('click', () => { pintarSalvos(); abrirDialogo($('dlgSalvos')) })

  $('perfilVoltar').addEventListener('click', () => mostrarPasso(passo - 1))
  $('perfilAvancar').addEventListener('click', () => {
    if (passo < TOTAL_PASSOS) { mostrarPasso(passo + 1); return }
    guardarPerfil()
    $('dlgPerfil').close()
    gerar()
  })
  $('pularPerfil').addEventListener('click', () => {
    guardarPerfil()
    $('dlgPerfil').close()
  })
  $('refeicoes').addEventListener('input', atualizarNotaVolume)
  $('mesWizard').addEventListener('change', atualizarNotaSafra)
  for (const b of $$('[data-passo-num]')) {
    b.addEventListener('click', () => {
      const atual = Number($('refeicoes').value) || 200
      $('refeicoes').value = Math.max(10, Math.min(5000, atual + Number(b.dataset.passoNum)))
      atualizarNotaVolume()
    })
  }

  let debounceFiltro
  $('filtroTroca').addEventListener('input', (e) => {
    clearTimeout(debounceFiltro)
    const valor = e.target.value
    debounceFiltro = setTimeout(() => pintarTroca(valor), 130)
  })
}

async function iniciar() {
  ligarEventos()

  let resposta
  try {
    resposta = await fetch('/app/conteudo.php?arquivo=assistente')
  } catch {
    return falhar('Não consegui carregar o acervo. Confira a conexão e recarregue a página.')
  }
  if (resposta.status === 403) { location.href = '/app/'; return }
  if (!resposta.ok) return falhar('O acervo não está disponível agora. Tente de novo em instantes.')
  base = await resposta.json()

  const opcoesDeMes = MESES.map(([v, n]) =>
    `<option value="${v}"${v === estado.mes ? ' selected' : ''}>${n}</option>`).join('')
  $('mes').innerHTML = opcoesDeMes
  $('mesWizard').innerHTML = opcoesDeMes

  // Cabeçalhos das tabelas do livro que a extração trouxe como preparação
  base.preparacoes = base.preparacoes.filter((p) => !ehCabecalho(p))

  const salvo = memoria.ler(CHAVE_PERFIL)
  if (salvo) estado.perfil = { ...PERFIL_PADRAO, ...salvo }

  // A tela abre pelo questionário, sempre: é ele que explica o que a ferramenta
  // faz e de onde vem cada pergunta. Quem já respondeu tem o atalho de um toque
  // no primeiro passo, então não perde tempo.
  gerar()
  abrirPerfil()
}

function falhar(recado) {
  $('avisos').innerHTML = `<div class="recado erro">
    <svg aria-hidden="true"><use href="#i-atencao"></use></svg><span>${esc(recado)}</span></div>`
}

iniciar()
