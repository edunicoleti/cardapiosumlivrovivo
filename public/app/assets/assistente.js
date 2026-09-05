/* ==========================================================================
   Assistente de cardápio
   O motor é determinístico e vem do capítulo VI: não há modelo de linguagem
   aqui, e nenhum prato é inventado. A interface só mostra o que ele decidiu e
   por quê, e deixa a nutricionista ter a palavra final em cada espaço.
   ========================================================================== */

import { $, $$, esc, semAcento, memoria, avisar, copiar, prepararDialogo } from './plataforma.js'

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

const PERFIL_PADRAO = {
  servico: 'institucional', padrao: 'medio', refeicoes: 200,
  equipamentos: ['forno', 'fritadeira', 'chapa'], restricoes: [],
}

// Estrutura do dia, derivada da matriz do capítulo VI. O serviço ajusta o que entra.
const BASE_ESTRUTURA = [
  { espaco: 'Prato principal', slot: 'principal', rodizio: true },
  { espaco: 'Arroz', slot: 'base', referencia: 'Arroz' },
  { espaco: 'Feijão', slot: 'base', referencia: 'Feijão' },
  { espaco: 'Acompanhamento', slot: 'acompanhamento' },
  { espaco: 'Salada crua', slot: 'salada', referencias: ['Crua', 'Mista'] },
  { espaco: 'Salada cozida', slot: 'salada', referencias: ['Cozida'] },
  { espaco: 'Sobremesa', slot: 'sobremesa' },
]
const RODIZIO = ['Carne bovina', 'Carne de frango', 'Pescados', 'Carne suína', 'Carnes diversas']

let base = null
let estrutura = BASE_ESTRUTURA
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

function estruturaDoServico(servico) {
  const e = BASE_ESTRUTURA.map((l) => ({ ...l }))
  if (servico === 'bufe') {
    // bufê oferece mais opções de salada e acompanhamento na mesma refeição
    e.splice(4, 0, { espaco: 'Acompanhamento 2', slot: 'acompanhamento' })
    e.push({ espaco: 'Salada extra', slot: 'salada', referencias: ['Mista', 'Elaborada com molho'] })
  }
  if (servico === 'infantil' || servico === 'repouso') {
    // sobremesa de fruta em vez de elaborada
    const i = e.findIndex((l) => l.espaco === 'Sobremesa')
    e[i] = { ...e[i], referencias: ['Fruta in natura'] }
  }
  return e
}

function montar({ mes, dias, semente, perfil }) {
  const sorteio = gerador(semente)
  const itensSafra = base.sazonalidade.filter((s) => s.meses.includes(mes)).map((s) => semAcento(s.item))
  const bloqMetodos = metodosBloqueados(perfil)
  const bloqRefs = referenciasBloqueadas(perfil)
  const bloqTermos = termosBloqueados(perfil)
  const estruturaDoDia = estruturaDoServico(perfil.servico)
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
        return { p, nota, safra, chave }
      }).sort((a, b) => b.nota - a.nota)

      const escolhida = avaliadas[0]
      usadas.add(escolhida.p.id)
      if (escolhida.p.metodo) metodosDoDia.push(escolhida.p.metodo)
      if (escolhida.p.metodo === 'frito') frituras.push(d)
      if (escolhida.chave) {
        ;(ingredientePorEspaco[linha.espaco] ??= []).push(escolhida.chave)
        ingredientesDoDia.push(escolhida.chave)
      }

      dia.itens.push({
        espaco: linha.espaco, nome: escolhida.p.nome, metodo: escolhida.p.metodo,
        safra: escolhida.safra?.mostrar ? escolhida.safra.item : null,
        alternativas: avaliadas.slice(1, 24).map((a) => ({
          id: a.p.id, nome: a.p.nome, metodo: a.p.metodo,
          descricao: a.p.descricao, safra: a.safra?.mostrar ? a.safra.item : null,
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
  const extras = [...semEquip.map((e) => `sem ${e}`), ...restr]
  return `<span class="rot">Seu serviço</span>
    <span class="val"><b>${esc(servico)}</b> · padrão ${esc(padrao)} · ${p.refeicoes} refeições${
      extras.length ? ` · ${esc(extras.join(' · '))}` : ''}</span>
    <button class="ajustar" id="ajustarPerfil" type="button">
      <svg aria-hidden="true"><use href="#i-ajuste"></use></svg>Ajustar</button>`
}

const etiquetas = (item) => [
  item.metodo ? `<span class="etiq">${esc(item.metodo)}</span>` : '',
  item.safra ? `<span class="etiq safra">${esc(item.safra)} na safra</span>` : '',
].join('')

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
          <span class="meta">${etiquetas(item)}</span>
          <span class="trocar"><svg aria-hidden="true"><use href="#i-troca"></use></svg>trocar</span>
        </button></td>`
    }).join('')
    return `<tr><th scope="row">${esc(linha.espaco)}</th>${celulas}</tr>`
  }).join('')

  pintarTiraDias()
  pintarDia()

  for (const botao of $$('.prato')) {
    botao.addEventListener('click', () => abrirTroca(+botao.dataset.dia, +botao.dataset.linha))
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
        <span class="meta">${etiquetas(item)}</span>
      </span>
      <svg aria-hidden="true"><use href="#i-troca"></use></svg>
    </button>`
  }).join('')
  for (const b of $$('#cartoesDia .cartao-prato[data-dia]')) {
    b.addEventListener('click', () => abrirTroca(+b.dataset.dia, +b.dataset.linha))
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

/* ------------------------------------------------------------ troca */
let trocaAlvo = { di: 0, li: 0 }

function abrirTroca(di, li) {
  trocaAlvo = { di, li }
  const item = estado.cardapio[di].itens[li]
  $('trocaEspaco').textContent = `${item.espaco} · ${estado.cardapio[di].dia}`
  $('trocaAtual').textContent = item.nome
  $('filtroTroca').value = ''
  pintarTroca('')
  $('dlgTroca').showModal()
}

function pintarTroca(filtro) {
  const item = estado.cardapio[trocaAlvo.di].itens[trocaAlvo.li]
  const alvo = semAcento(filtro.trim())
  const lista = item.alternativas
    .map((a, i) => ({ a, i }))
    .filter(({ a }) => !alvo || semAcento(`${a.nome} ${a.descricao || ''}`).includes(alvo))

  $('trocaLista').innerHTML = lista.length
    ? lista.map(({ a, i }) => `
      <button class="escolha" data-i="${i}" type="button">
        <span class="n">${esc(a.nome)}</span>
        ${a.descricao ? `<span class="d">${esc(a.descricao)}</span>` : ''}
        <span class="meta">${etiquetas(a)}</span>
      </button>`).join('')
    : `<div class="sem-salvos">Nenhuma outra opção${alvo ? ' com esse filtro' : ''} neste espaço.</div>`

  for (const opcao of $$('.escolha', $('trocaLista'))) {
    opcao.addEventListener('click', () => trocarPor(+opcao.dataset.i))
  }
}

function trocarPor(indice) {
  const item = estado.cardapio[trocaAlvo.di].itens[trocaAlvo.li]
  const nova = item.alternativas[indice]
  const antigo = { nome: item.nome, metodo: item.metodo, safra: item.safra, descricao: '' }
  item.nome = nova.nome; item.metodo = nova.metodo; item.safra = nova.safra
  item.alternativas = item.alternativas.filter((_, k) => k !== indice)
  item.alternativas.unshift(antigo)
  $('dlgTroca').close()
  // trocar um prato não pode refazer o resto da semana
  redesenharCelulas()
  avisar('Prato trocado.')
}

function redesenharCelulas() {
  pintarConferencia()
  for (const botao of $$('.prato')) {
    const item = estado.cardapio[+botao.dataset.dia].itens[+botao.dataset.linha]
    botao.innerHTML = `<span class="nome">${esc(item.nome)}</span>
      <span class="meta">${etiquetas(item)}</span>
      <span class="trocar"><svg aria-hidden="true"><use href="#i-troca"></use></svg>trocar</span>`
  }
  pintarDia()
}

/* ------------------------------------------------------ perfil em passos */
const TOTAL_PASSOS = 5
let passo = 1

function pintarOpcoes() {
  const mapa = { servico: SERVICOS, padrao: PADROES, equipamentos: EQUIPAMENTOS, restricoes: RESTRICOES }
  for (const caixa of $$('.opcoes')) {
    const campo = caixa.dataset.campo
    const multiplo = caixa.dataset.tipo === 'multiplo'
    caixa.innerHTML = mapa[campo].map((o) => {
      const marcado = multiplo ? estado.perfil[campo].includes(o.id) : estado.perfil[campo] === o.id
      return `<button class="opt" type="button" data-campo="${campo}" data-id="${o.id}"
        data-multiplo="${multiplo}" aria-pressed="${marcado}">${esc(o.rot)}${
        o.desc ? `<span class="desc">${esc(o.desc)}</span>` : ''}</button>`
    }).join('')
  }
  for (const botao of $$('.opt')) {
    botao.addEventListener('click', () => {
      const { campo, id, multiplo } = botao.dataset
      if (multiplo === 'true') {
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
  $('perfilAjuda').textContent = passo === 1
    ? 'Cinco perguntas rápidas. Não são invenção da ferramenta: são os fatores administrativos que o capítulo VI manda considerar antes de fechar um cardápio.'
    : `Pergunta ${passo} de ${TOTAL_PASSOS}.`
  $('modalCorpoPerfil')?.scrollTo({ top: 0 })
  atualizarNotaVolume()
}

function atualizarNotaVolume() {
  const n = Number($('refeicoes').value) || 0
  $('notaVolume').textContent = n >= 400
    ? 'Acima de 400 refeições o assistente deixa de sugerir grelhados e empanados: no volume, prato feito um a um não sai.'
    : 'Até 400 refeições o assistente considera todos os métodos que o seu equipamento permite.'
}

function abrirPerfil() {
  $('refeicoes').value = estado.perfil.refeicoes
  pintarOpcoes()
  mostrarPasso(1)
  $('dlgPerfil').showModal()
}

function guardarPerfil() {
  estado.perfil.refeicoes = Math.max(10, Math.min(5000, Number($('refeicoes').value) || 200))
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
  for (const d of [$('dlgPerfil'), $('dlgTroca'), $('dlgSalvos'), $('dlgAjuda')]) prepararDialogo(d)

  $('mes').addEventListener('change', (e) => { estado.mes = e.target.value; gerar() })
  $('dias').addEventListener('change', (e) => { estado.dias = +e.target.value; gerar() })
  $('outra').addEventListener('click', () => { estado.semente++; gerar(); avisar('Nova sugestão montada.') })
  $('salvar').addEventListener('click', salvarCardapio)
  $('imprimir').addEventListener('click', () => window.print())
  $('copiar').addEventListener('click', () => copiar(cardapioEmTexto(), 'Cardápio copiado como texto.'))

  $('btPerfil')?.addEventListener('click', () => abrirPerfil())
  $('btAjuda')?.addEventListener('click', () => $('dlgAjuda').showModal())
  $('btSalvos')?.addEventListener('click', () => { pintarSalvos(); $('dlgSalvos').showModal() })

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

  $('mes').innerHTML = MESES.map(([v, n]) =>
    `<option value="${v}"${v === estado.mes ? ' selected' : ''}>${n}</option>`).join('')

  const salvo = memoria.ler(CHAVE_PERFIL)
  if (salvo) estado.perfil = { ...PERFIL_PADRAO, ...salvo }

  gerar()

  // Quem chega pela primeira vez responde o perfil; quem já respondeu vai direto
  // para a grade, com o cardápio do serviço dele já montado.
  if (!salvo) abrirPerfil()
}

function falhar(recado) {
  $('avisos').innerHTML = `<div class="recado erro">
    <svg aria-hidden="true"><use href="#i-atencao"></use></svg><span>${esc(recado)}</span></div>`
}

iniciar()
