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
   acompanhamento, prato base, complemento e sobremesa. Cada item é uma
   quantidade que a pessoa digita: antes o assistente oferecia uma opção de
   cada, e na prática o serviço decide quantas saladas e quantos
   acompanhamentos põe no balcão. Zero tira o item da refeição. A ordem aqui é
   a ordem das linhas do cardápio. */
const QUANTIDADES = [
  { id: 'sopa', secao: 'Entrada', rot: 'Sopas', um: 'Sopa', desc: 'Entrada quente, comum no inverno' },
  { id: 'saladaCrua', secao: 'Entrada', rot: 'Saladas cruas', um: 'Salada crua', desc: 'Folhosos, ralados, picados e mistas' },
  { id: 'saladaCozida', secao: 'Entrada', rot: 'Saladas cozidas', um: 'Salada cozida', desc: 'Vegetais cozidos simples' },
  { id: 'saladaMolho', secao: 'Entrada', rot: 'Saladas com molho', um: 'Salada com molho', desc: 'Maionese, salpicão e outras elaboradas' },
  { id: 'principal', secao: 'Prato principal', rot: 'Pratos principais', um: 'Prato principal', desc: 'Proteína em rodízio ao longo da semana' },
  { id: 'tipico', secao: 'Prato principal', rot: 'Pratos típicos', um: 'Prato típico', desc: 'Preparações regionais do capítulo X' },
  { id: 'acompanhamento', secao: 'Acompanhamento', rot: 'Acompanhamentos', um: 'Acompanhamento', desc: 'Massas, farinhas, ovos e vegetais' },
  { id: 'arrozComposto', secao: 'Prato base', rot: 'Arroz composto', um: 'Arroz composto', desc: 'Além do arroz branco, que é fixo' },
  { id: 'leguminosa', secao: 'Prato base', rot: 'Leguminosas', um: 'Leguminosa', desc: 'Lentilha, grão-de-bico, fava... além do feijão, que é fixo' },
  { id: 'molho', secao: 'Complemento', rot: 'Molhos', um: 'Molho', desc: 'Molhos quentes e frios' },
  { id: 'fruta', secao: 'Sobremesa', rot: 'Frutas', um: 'Fruta', desc: 'Sobremesa de fruta' },
  { id: 'doce', secao: 'Sobremesa', rot: 'Sobremesas doces', um: 'Sobremesa doce', desc: 'Sobremesas elaboradas' },
]
const MAX_QUANTIDADE = 12

/* Fator 1.1: o livro diz quantas opções cada padrão costuma ter (1.1.1 a
   1.1.3). É só o ponto de partida: a pessoa muda o que quiser. */
const SUGESTAO_DO_LIVRO = {
  popular: { sopa: 0, saladaCrua: 1, saladaCozida: 1, saladaMolho: 0, principal: 1, tipico: 0,
             acompanhamento: 1, arrozComposto: 0, leguminosa: 0, molho: 0, fruta: 1, doce: 0 },
  medio:   { sopa: 0, saladaCrua: 2, saladaCozida: 1, saladaMolho: 1, principal: 2, tipico: 0,
             acompanhamento: 2, arrozComposto: 1, leguminosa: 0, molho: 0, fruta: 1, doce: 2 },
  luxo:    { sopa: 0, saladaCrua: 3, saladaCozida: 2, saladaMolho: 2, principal: 3, tipico: 0,
             acompanhamento: 2, arrozComposto: 1, leguminosa: 1, molho: 0, fruta: 2, doce: 2 },
}
const FAIXA_DO_LIVRO = {
  popular: '1 ou 2 pratos proteicos, 1 acompanhamento, de 1 a 5 entradas e 1 fruta e/ou 1 doce',
  medio: '2 ou 3 pratos proteicos, 1 ou 2 acompanhamentos, de 1 a 8 entradas e 3 sobremesas ou mais',
  luxo: 'pelo menos 3 pratos proteicos e 2 acompanhamentos, sobremesas mais elaboradas e frutas mais diversificadas',
}

function sugestaoDoLivro(perfil) {
  const q = { ...(SUGESTAO_DO_LIVRO[perfil.padrao] ?? SUGESTAO_DO_LIVRO.medio) }
  // bufê por peso põe mais salada e mais prato quente no balcão
  if (perfil.servico === 'bufe') { q.saladaCrua += 1; q.acompanhamento += 1 }
  // criança e idoso: sobremesa de fruta em vez de doce elaborado
  if (perfil.servico === 'infantil' || perfil.servico === 'repouso') {
    q.fruta = Math.max(q.fruta, 1)
    q.doce = 0
  }
  return q
}

/** As quantidades do perfil, sempre completas e dentro do limite. */
function quantidadesDo(perfil) {
  const base = perfil.quantidadesProprias && perfil.quantidades ? perfil.quantidades : sugestaoDoLivro(perfil)
  const q = {}
  for (const item of QUANTIDADES) {
    const n = Math.round(Number(base[item.id]))
    q[item.id] = Number.isFinite(n) ? Math.max(0, Math.min(MAX_QUANTIDADE, n)) : 0
  }
  return q
}

/* ------------------------------------------------- arroz e feijão fixos
   O prato base do cardápio brasileiro não entra em sorteio: arroz branco e
   feijão saem todo dia. O que varia são o arroz composto e a leguminosa, que
   entram como linhas próprias, com quantidade. */
const ehArrozBranco = (p) => p.slot === 'base' && semAcento(p.nome) === 'arroz'
const ehFeijaoDoDia = (p) => p.slot === 'base' && /^feijao \(/.test(semAcento(p.nome))

/* Leguminosa além do feijão do dia. O capítulo G tem só seis preparações, e
   uma delas é o próprio feijão; as outras estão espalhadas: lentilha, fava,
   grão-de-bico e feijão branco cozidos nas saladas cozidas, e favada, feijão
   fradinho, feijão verde e baião nos pratos típicos. O livro avisa que ervilha
   e fava frescas trata como vegetal, por isso ficam fora. */
const LEGUMINOSA_NO_NOME = /(^|[^a-z])(lentilha|fava|favada|grao-de-bico|grao de bico|feijao|baiao|tutu|andu|soja)([^a-z]|$)/
const NAO_E_LEGUMINOSA = /feijoada|caldo|farofa|mocoto|acaraje|abara|sopa|broto/
const SALADA_DE_GRAO = new Set(['fava', 'feijao branco', 'grao-de-bico', 'lentilha'])
function ehLeguminosa(p) {
  if (ehFeijaoDoDia(p)) return false
  const nome = semAcento(p.nome)
  if (p.slot === 'base') return p.referencia === 'Feijão'
  if (p.slot === 'salada') return p.referencia === 'Cozida' && SALADA_DE_GRAO.has(nome)
  if (p.slot === 'regional') return LEGUMINOSA_NO_NOME.test(nome) && !NAO_E_LEGUMINOSA.test(nome)
  return false
}

/* ------------------------------------------------ padrão de cada prato
   O livro define o padrão pelo cardápio inteiro (fator 1.1: complexidade e
   custo), mas não marca prato por prato. Até a autora marcar o acervo, a
   classificação é provisória e lê os ingredientes de custo alto no nome e na
   descrição. Conferida contra o exemplo de cardápio popular do Anexo III:
   todos os pratos dele que existem no acervo saem como popular. Quando a
   preparação trouxer o campo `padrao`, vindo da planilha da autora, ele
   manda e a lista abaixo deixa de valer para ela. */
const NIVEL = { popular: 0, medio: 1, luxo: 2 }
const CUSTO_DE_LUXO = [
  'camarao', 'lagosta', 'lagostim', 'lula', 'polvo', 'marisco', 'mexilhao', 'ostra', 'siri',
  'caranguejo', 'bacalhau', 'mignon', 'picanha', 'cordeiro', 'pato', 'marreco', 'coelho', 'javali',
  'aspargo', 'alcachofra', 'trufa', 'gorgonzola', 'brie', 'mascarpone', 'champanhe', 'conhaque',
  'licor', 'framboesa', 'amendoa', 'nozes', 'castanha', 'damasco', 'avela', 'tamara', 'shitake',
  'funghi', 'endivia', 'fruto do mar', 'frutos do mar',
]
const CUSTO_MEDIO = [
  'champignon', 'cogumelo', 'palmito', 'tomate seco', 'alcaparra', 'vinho', 'cerveja', 'rum',
  'catupiry', 'provolone', 'rucula', 'cereja', 'peru', 'chester', 'tender', 'parmesao',
]
const regexTermo = (t) => new RegExp(`(^|[^a-z])${t.replace(/ /g, '[ -]')}(s|es)?([^a-z]|$)`)
const REGEX_LUXO = CUSTO_DE_LUXO.map(regexTermo)
const REGEX_MEDIO = CUSTO_MEDIO.map(regexTermo)
const cacheNivel = new Map()
function nivelDoPrato(p) {
  if (NIVEL[p.padrao] !== undefined) return { nivel: p.padrao, provisorio: false }
  if (!cacheNivel.has(p.id)) {
    const alvo = semAcento(`${p.nome} ${p.descricao || ''}`)
    const nivel = REGEX_LUXO.some((r) => r.test(alvo)) ? 'luxo'
      : REGEX_MEDIO.some((r) => r.test(alvo)) ? 'medio' : 'popular'
    cacheNivel.set(p.id, { nivel, provisorio: true })
  }
  return cacheNivel.get(p.id)
}
/** O prato serve no padrão pedido se o nível dele não passa do padrão. */
const cabeNoPadrao = (p, padrao) => NIVEL[nivelDoPrato(p).nivel] <= (NIVEL[padrao] ?? 1)

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
  digestao: false,
  // null = segue a sugestão do livro para o padrão; vira objeto quando a
  // pessoa mexe em alguma quantidade
  quantidades: null, quantidadesProprias: false,
}

/* Perfis guardados antes das quantidades marcavam sopa, molho e prato típico
   como "entra ou não entra" em `composicao`. Vira quantidade 1. */
function migrarPerfil(perfil) {
  const p = { ...PERFIL_PADRAO, ...perfil }
  if (Array.isArray(p.composicao)) {
    if (p.composicao.length && !p.quantidadesProprias) {
      p.quantidades = sugestaoDoLivro(p)
      for (const id of p.composicao) if (id in p.quantidades) p.quantidades[id] = 1
      p.quantidadesProprias = true
    }
    delete p.composicao
  }
  return p
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
  perfil: { ...PERFIL_PADRAO }, relaxados: [], repetidos: [], foraDoPadrao: [], diaVisivel: 0,
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

// Método básico do capítulo VI: segunda-feira pede preparação mais simples.
const SIMPLES = new Set(['Crua', 'Cozida', 'Fruta in natura'])
const ELABORADO = new Set(['Mista', 'Elaborada com molho', 'Sobremesa elaborada'])

/* Fator 1.1. O padrão popular e o médio são filtro: prato acima do padrão não
   entra (cabeNoPadrao). No luxo tudo entra, e o que é de luxo ganha peso.
   Antes o padrão só mexia em salada e sobremesa, pela categoria, e o prato
   principal, o acompanhamento e o arroz saíam de qualquer nível: o popular
   sugeria bacalhau com tomate seco. */
function pesoDoPadrao(p, padrao) {
  const nivel = nivelDoPrato(p).nivel
  if (padrao === 'luxo') return nivel === 'luxo' ? 1.5 : nivel === 'medio' ? 0.6 : 0
  if (padrao === 'medio') return nivel === 'medio' ? 0.4 : 0
  return 0
}

/* Cada item de QUANTIDADES vira uma ou mais linhas. `filtro` diz quais
   preparações do acervo cabem na linha; `grupo` junta as linhas do mesmo item
   para a regra de não repetir ingrediente. */
const LINHAS_DO_ITEM = {
  sopa: { slot: 'sopa' },
  saladaCrua: { slot: 'salada', referencias: ['Crua', 'Mista'] },
  saladaCozida: { slot: 'salada', referencias: ['Cozida'] },
  saladaMolho: { slot: 'salada', referencias: ['Elaborada com molho'] },
  principal: { slot: 'principal', rodizio: true },
  tipico: { slot: 'regional' },
  acompanhamento: { slot: 'acompanhamento' },
  arrozComposto: { slot: 'base', referencias: ['Arroz'], filtro: (p) => !ehArrozBranco(p) },
  leguminosa: { filtro: ehLeguminosa },
  molho: { slot: 'molho' },
  fruta: { slot: 'sobremesa', referencias: ['Fruta in natura'] },
  doce: { slot: 'sobremesa', referencias: ['Sobremesa elaborada'] },
}

/**
 * A ordem das linhas é a da composição do capítulo VI, B: entrada, prato
 * principal, acompanhamento, prato base, complemento e sobremesa. No prato
 * base, arroz branco e feijão são fixos e vêm antes do arroz composto e da
 * leguminosa.
 */
function estruturaDoServico(perfil) {
  const q = quantidadesDo(perfil)
  const linhas = []
  const repetir = (id) => {
    const item = QUANTIDADES.find((x) => x.id === id)
    for (let i = 0; i < q[id]; i++) {
      linhas.push({
        ...LINHAS_DO_ITEM[id],
        grupo: id,
        ordem: i,
        secao: item.secao,
        espaco: q[id] > 1 ? `${item.um} ${i + 1}` : item.um,
      })
    }
  }
  for (const item of QUANTIDADES) {
    if (item.id === 'arrozComposto') {
      linhas.push({ espaco: 'Arroz branco', secao: 'Prato base', grupo: 'arroz', fixo: ehArrozBranco })
    }
    if (item.id === 'leguminosa') {
      linhas.push({ espaco: 'Feijão', secao: 'Prato base', grupo: 'feijao', fixo: ehFeijaoDoDia })
    }
    repetir(item.id)
  }
  return linhas
}

/* A preparação do livro que ocupa uma linha fixa. O feijão do livro se chama
   "Feijão (preto, roxinho, fradinho...)": no cardápio fica só o nome curto. */
function pratoFixo(linha) {
  const p = base.preparacoes.find(linha.fixo)
  if (!p) return { espaco: linha.espaco, nome: linha.espaco, fixo: true, grupo: linha.grupo, secao: linha.secao }
  return {
    espaco: linha.espaco, grupo: linha.grupo, secao: linha.secao, fixo: true,
    nome: linha.espaco, metodo: p.metodo, descricao: p.descricao,
    referencia: p.referencia, categoria: p.categoria, safra: null, alternativas: [],
  }
}

function montar({ mes, dias, semente, perfil }) {
  const sorteio = gerador(semente)
  const itensSafra = base.sazonalidade.filter((s) => s.meses.includes(mes)).map((s) => semAcento(s.item))
  const bloqMetodos = metodosBloqueados(perfil)
  const bloqRefs = referenciasBloqueadas(perfil)
  const bloqTermos = termosBloqueados(perfil)
  const estruturaDoDia = estruturaDoServico(perfil)
  const rodizioDisponivel = RODIZIO.filter((r) => !bloqRefs.has(r))
  const principaisPorDia = estruturaDoDia.filter((l) => l.rodizio).length
  const usadas = new Set()
  const frituras = []
  const ingredientePorGrupo = {}
  const cardapio = []
  const relaxados = new Set()
  const repetidos = new Set()
  const foraDoPadrao = new Set()

  for (let d = 0; d < dias; d++) {
    const dia = { dia: DIAS[d % 7], itens: [] }
    const metodosDoDia = []
    const ingredientesDoDia = []
    // 3.9 fala em oferta concentrada: o feijão, que é fixo, já é um pesado
    let pesadosDoDia = perfil.digestao ? 1 : 0
    // Método básico do capítulo VI: "às segundas-feiras usar preparações mais
    // simples, que não necessitem de pré-preparo, pois muitas UANs não
    // funcionam aos domingos".
    const segunda = dia.dia === 'Segunda'

    for (const linha of estruturaDoDia) {
      if (linha.fixo) { dia.itens.push(pratoFixo(linha)); continue }

      // Com dois ou mais pratos principais, o rodízio anda dentro do dia
      // também: segunda bovina e frango, terça peixe e suína, e assim por
      // diante. Passando do número de proteínas, a linha aceita qualquer uma.
      let alvo = null
      if (linha.rodizio && rodizioDisponivel.length && linha.ordem < rodizioDisponivel.length) {
        alvo = rodizioDisponivel[(d * principaisPorDia + linha.ordem) % rodizioDisponivel.length]
      }

      // Restrição alimentar nunca é afrouxada. O resto cede em ordem, do menos
      // custoso para o mais: o equipamento, a regra de não repetir e, por
      // último, o padrão. Com uma restrição ativa a leguminosa não fecha a
      // semana sem repetir, que é o que uma UAN faz mesmo.
      const podeEntrar = (p) => {
        if (linha.slot && p.slot !== linha.slot) return false
        if (linha.filtro && !linha.filtro(p)) return false
        if (alvo && p.referencia !== alvo) return false
        if (linha.referencias && !linha.referencias.includes(p.referencia)) return false
        if (bloqRefs.has(p.referencia)) return false
        return !temIngredienteProibido(p, bloqTermos)
      }
      const noPadrao = (p) => cabeNoPadrao(p, perfil.padrao)
      const inedita = (p) => !usadas.has(p.id)
      const comEquipamento = (p) => !bloqMetodos.has(p.metodo)

      const tentativas = [
        [[noPadrao, inedita, comEquipamento], null],
        [[noPadrao, inedita], relaxados],
        [[noPadrao, comEquipamento], repetidos],
        [[noPadrao], repetidos],
        [[inedita, comEquipamento], foraDoPadrao],
        [[], foraDoPadrao],
      ]
      let candidatas = []
      for (const [regras, aviso] of tentativas) {
        candidatas = base.preparacoes.filter((p) => podeEntrar(p) && regras.every((r) => r(p)))
        if (candidatas.length) { aviso?.add(linha.espaco); break }
      }
      if (!candidatas.length) { dia.itens.push({ espaco: linha.espaco, grupo: linha.grupo, vazio: true }); continue }

      const avaliadas = candidatas.map((p) => {
        let nota = sorteio() * 0.6
        const safra = naSafra(p, itensSafra)
        if (safra) nota += safra.peso
        nota += pesoDoPadrao(p, perfil.padrao)
        if (p.metodo && metodosDoDia.includes(p.metodo)) nota -= 2.5
        if (p.metodo === 'frito' && frituras.length >= 1) nota -= 4
        const chave = ingredienteChave(p, safra)
        if (chave && (ingredientePorGrupo[linha.grupo] ?? []).includes(chave)) nota -= 3
        if (chave && ingredientesDoDia.includes(chave)) nota -= 3.5
        if (segunda) {
          if (SIMPLES.has(p.referencia)) nota += 1
          if (ELABORADO.has(p.referencia)) nota -= 1.5
        }
        const pesado = perfil.digestao && ehPesada(p)
        if (pesado && pesadosDoDia >= 2) nota -= 2.5
        return { p, nota, safra, chave, pesado }
      }).sort((a, b) => b.nota - a.nota)

      const escolhida = avaliadas[0]
      usadas.add(escolhida.p.id)
      if (escolhida.p.metodo) metodosDoDia.push(escolhida.p.metodo)
      if (escolhida.p.metodo === 'frito') frituras.push(d)
      if (escolhida.chave) {
        ;(ingredientePorGrupo[linha.grupo] ??= []).push(escolhida.chave)
        ingredientesDoDia.push(escolhida.chave)
      }
      if (escolhida.pesado) pesadosDoDia++

      const resumo = (a) => ({
        id: a.p.id, nome: a.p.nome, metodo: a.p.metodo,
        // a descrição é o que o livro traz de ingredientes e preparo; sem ela a
        // grade vira uma lista de nomes soltos
        descricao: a.p.descricao,
        referencia: a.p.referencia, categoria: a.p.categoria,
        safra: a.safra?.mostrar ? a.safra.item : null,
        nivel: nivelDoPrato(a.p).nivel, nivelProvisorio: nivelDoPrato(a.p).provisorio,
      })
      // na troca só aparece o que cabe no padrão, salvo quando nada cabe
      const alternativas = avaliadas.slice(1).filter((a) => noPadrao(a.p) || !noPadrao(escolhida.p))
      dia.itens.push({
        ...resumo(escolhida),
        espaco: linha.espaco, grupo: linha.grupo, secao: linha.secao,
        alternativas: alternativas.slice(0, 23).map(resumo),
      })
    }
    cardapio.push(dia)
  }
  estado.relaxados = [...relaxados]
  estado.repetidos = [...repetidos]
  estado.foraDoPadrao = [...foraDoPadrao]
  return { cardapio, estrutura: estruturaDoDia }
}

function conferir(cardapio) {
  // arroz branco e feijão são fixos: repetir todo dia é o que se espera deles
  const itens = cardapio.flatMap((d) => d.itens).filter((i) => !i.vazio && !i.fixo)
  const principais = new Set(itens.filter((i) => i.grupo === 'principal').map((i) => i.nome))
  const fritos = itens.filter((i) => i.metodo === 'frito').length
  const repetido = cardapio.filter((d) => {
    const m = d.itens.filter((i) => !i.fixo).map((i) => i.metodo).filter(Boolean)
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

/* ========================================================== 2. wizard */

const PASSOS = [
  { curto: 'Serviço', rot: 'Que serviço você atende?' },
  { curto: 'Padrão', rot: 'Qual o padrão do cardápio?' },
  { curto: 'Volume', rot: 'Quantas refeições por dia?' },
  { curto: 'Cozinha', rot: 'O que você tem na cozinha?' },
  { curto: 'Quantidades', rot: 'Quantas opções de cada item?' },
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
  restricoes: RESTRICOES, digestao: [DIGESTAO],
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

/* ------------------------------------------------------- quantidades
   As linhas são desenhadas uma vez só. Redesenhar a cada tecla tiraria o
   foco do campo em que a pessoa está digitando: depois disso só os valores
   são atualizados, e o campo em foco fica como a pessoa deixou. */
function pintarQuantidades() {
  const caixa = $('quantidades')
  if (!caixa.childElementCount) {
    let secao = ''
    caixa.innerHTML = QUANTIDADES.map((item) => {
      const titulo = item.secao !== secao ? `<span class="qtd-secao">${esc(item.secao)}</span>` : ''
      secao = item.secao
      return `${titulo}<div class="qtd-linha">
        <label class="qtd-texto" for="qtd-${item.id}">
          <span class="qtd-rot">${esc(item.rot)}</span>
          <span class="qtd-desc">${esc(item.desc)}</span>
        </label>
        <div class="qtd-controle">
          <button class="bt-icone contornado" type="button" data-qtd-passo="-1" data-qtd-id="${item.id}"
                  aria-label="Uma opção a menos de ${esc(item.rot.toLowerCase())}">
            <svg aria-hidden="true"><use href="#i-menos"></use></svg>
          </button>
          <input type="number" id="qtd-${item.id}" data-qtd="${item.id}" min="0" max="${MAX_QUANTIDADE}"
                 step="1" inputmode="numeric">
          <button class="bt-icone contornado" type="button" data-qtd-passo="1" data-qtd-id="${item.id}"
                  aria-label="Uma opção a mais de ${esc(item.rot.toLowerCase())}">
            <svg aria-hidden="true"><use href="#i-mais"></use></svg>
          </button>
        </div>
      </div>`
    }).join('')
  }
  const q = quantidadesDo(estado.perfil)
  for (const campo of $$('#quantidades [data-qtd]')) {
    const n = q[campo.dataset.qtd]
    campo.closest('.qtd-linha').classList.toggle('zerada', n === 0)
    if (campo !== document.activeElement) campo.value = String(n)
  }
  const proprias = estado.perfil.quantidadesProprias
  const padrao = PADROES.find((x) => x.id === estado.perfil.padrao)?.rot.toLowerCase() ?? ''
  $('notaQuantidades').innerHTML = `Para o padrão <b>${esc(padrao)}</b> o livro fala em
    ${esc(FAIXA_DO_LIVRO[estado.perfil.padrao] ?? '')} (fator 1.1).${proprias
      ? ' Os números acima são os seus.' : ' Os números acima partem daí.'}`
  $('usarSugestao').hidden = !proprias
}

/** Grava uma quantidade digitada ou tocada. A partir daqui os números são da pessoa. */
function mudarQuantidade(id, valor) {
  const q = quantidadesDo(estado.perfil)
  const n = Math.round(Number(valor))
  if (!Number.isFinite(n)) return
  q[id] = Math.max(0, Math.min(MAX_QUANTIDADE, n))
  estado.perfil.quantidades = q
  estado.perfil.quantidadesProprias = true
  aposMudar()
}

function usarSugestao() {
  estado.perfil.quantidades = null
  estado.perfil.quantidadesProprias = false
  aposMudar()
}

/** "2 saladas cruas, 1 arroz composto": o que sai além do arroz e do feijão. */
function resumoQuantidades(perfil) {
  const q = quantidadesDo(perfil)
  const partes = QUANTIDADES.filter((x) => q[x.id] > 0)
    .map((x) => `${q[x.id]} ${(q[x.id] === 1 ? x.um : x.rot).toLowerCase()}`)
  return partes.length ? `Arroz branco, feijão, ${partes.join(', ')}` : 'Só arroz branco e feijão'
}

/**
 * Desenha o conteúdo de TODAS as etapas, não só a visível. Medir a etapa mais
 * alta exige que ela já esteja preenchida: com os meses ainda por desenhar, o
 * passo 7 media 471px e renderizava 627px.
 */
function pintarEtapas() {
  pintarQuantidades()
  atualizarNotaVolume()
  atualizarNotaEquipamento()
  atualizarNotaRestricoes()
  pintarForma()
  pintarMeses()
  pintarDiasOpcao()
  atualizarNotaSafra()
  pintarRevisao()
}

/** Redesenha tudo que depende do perfil e guarda no aparelho. */
function aposMudar() {
  pintarEtapas()
  medirPalco()
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

/** Quantas preparações sobram, dito na própria pergunta que mexe nisso. */
function frasedoAcervo() {
  const { livres, total } = acervoDisponivel(estado.perfil)
  if (livres === total) return 'Nada excluído até aqui: o acervo inteiro do livro está disponível.'
  const apertado = livres < total * 0.45
  return `Com o que você marcou, <b>${livres.toLocaleString('pt-BR')}</b> das
    ${total.toLocaleString('pt-BR')} preparações do livro continuam disponíveis.${
    apertado ? ' Nessa faixa a semana costuma precisar repetir algum prato.' : ''}`
}

function resumoDoPerfil() {
  const p = estado.perfil
  const nomes = (lista, fonte) => fonte.filter((x) => lista.includes(x.id)).map((x) => x.rot)
  const restr = nomes(p.restricoes, RESTRICOES)
  if (p.digestao) restr.push('Sem concentrar pesados')
  return [
    { n: 1, rot: 'Serviço', valor: SERVICOS.find((x) => x.id === p.servico)?.rot ?? '—' },
    { n: 2, rot: 'Padrão', valor: PADROES.find((x) => x.id === p.padrao)?.rot ?? '—' },
    { n: 3, rot: 'Volume', valor: `${p.refeicoes} refeições por dia` },
    { n: 4, rot: 'Cozinha', valor: p.equipamentos.length
        ? nomes(p.equipamentos, EQUIPAMENTOS).join(', ') : 'Nenhum equipamento' },
    { n: 5, rot: 'Quantidades', valor: resumoQuantidades(p) },
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
  const q = quantidadesDo(estado.perfil)
  const itens = []
  for (const x of QUANTIDADES) {
    if (x.id === 'arrozComposto') itens.push('Arroz branco')
    if (x.id === 'leguminosa') itens.push('Feijão')
    if (q[x.id] === 1) itens.push(x.um)
    if (q[x.id] > 1) itens.push(`${x.rot} × ${q[x.id]}`)
  }
  $('formaLinhas').innerHTML = itens.map((t) => `<li>${esc(t)}</li>`).join('')
}

function pintarMeses() {
  $('meses').innerHTML = MESES.map(([v, n]) => {
    const on = estado.mes === v
    const qt = itensNaSafra(v).length
    return `<button class="chip-mes" type="button" role="radio" aria-checked="${on}"
      tabindex="${on ? 0 : -1}" data-mes="${v}" aria-label="${esc(n)}, ${qt} itens na safra">
      <span class="m">${esc(n.slice(0, 3))}</span>
      <span class="q"><svg aria-hidden="true"><use href="#i-folha"></use></svg>${qt}</span>
    </button>`
  }).join('')
}

function pintarDiasOpcao() {
  $('diasOpcao').innerHTML = [[5, '5 dias', 'De segunda a sexta'], [6, '6 dias', 'Inclui o sábado'],
    [7, '7 dias', 'A semana inteira']].map(([v, rot, desc]) => {
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
  const recado = faltando.length
    ? `Sem ${esc(faltando.map((e) => e.rot.toLowerCase()).join(' e '))}, o assistente não sugere
       ${esc(faltando.flatMap((e) => e.metodos).join(', '))}.`
    : `Com os três, nenhum método de cocção do livro fica de fora.`
  $('notaEquipamento').innerHTML = `${recado} ${frasedoAcervo()}`
}

function atualizarNotaRestricoes() {
  $('notaRestricoes').innerHTML = `${frasedoAcervo()}
    A exclusão lê o nome e a descrição de cada preparação, não uma ficha de
    ingredientes. Confira antes de servir.`
}

function atualizarNotaSafra() {
  const itens = itensNaSafra(estado.mes).map((s) => s.item)
  $('notaSafra').innerHTML = itens.length
    ? `Em <b>${esc(nomeDoMes(estado.mes))}</b> o livro marca ${itens.length} itens na safra,
       entre eles ${esc(itens.slice(0, 5).join(', ').toLowerCase())}.`
    : `O livro não marca nenhum item de safra em ${esc(nomeDoMes(estado.mes))}.`
}

/**
 * Fixa a altura do palco na etapa mais alta. Sem isso o rodape sobe e desce a
 * cada passo; com uma altura chutada, os passos curtos ficam com um vazio de
 * 200px embaixo. Medir da o menor valor que segura todas.
 */
function medirPalco() {
  const palco = document.querySelector('.wizard-palco')
  if (!palco || $('wizard').hidden) return
  // sincrono de proposito: requestAnimationFrame nao roda em aba que o
  // navegador nao esta desenhando, e ai a altura nunca era aplicada. Sao oito
  // leituras de offsetHeight numa subarvore pequena.
  palco.style.minHeight = '0px'
  let maior = 0
  for (const etapa of $$('#formPerfil .etapa')) {
    const oculta = etapa.hidden
    etapa.hidden = false
    etapa.style.flex = 'none'
    maior = Math.max(maior, etapa.getBoundingClientRect().height)
    etapa.style.flex = ''
    etapa.hidden = oculta
  }
  // 2px de folga: medida e render diferem por arredondamento de subpixel, e
  // dois pixels de diferenca ja fazem o botao piscar de lugar
  palco.style.minHeight = `${Math.ceil(maior) + 2}px`
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
  $('refeicoes').value = estado.perfil.refeicoes
  sincronizarRange()
  pintarEtapas()

  $('wizVoltar').innerHTML = '<svg aria-hidden="true"><use href="#i-esq"></use></svg>Voltar'
  $('wizAvancar').textContent = passo === TOTAL_PASSOS ? 'Montar minha semana' : 'Continuar'
  $('wizConta').textContent = `Passo ${passo} de ${TOTAL_PASSOS}`
  $('wizAviso').textContent = `Passo ${passo} de ${TOTAL_PASSOS}: ${PASSOS[passo - 1].rot}`
  medirPalco()

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
    if (telaAtual !== 'wizard') { mostrarTela('wizard'); pintarOpcoes(); pintarEtapas() }
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
  pintarEtapas()
  maiorPassoVisto = Math.max(maiorPassoVisto, n)
  irPara(`#montar/${n}`)
  if (telaAtual !== 'wizard') { mostrarTela('wizard'); mostrarPasso(n) }
}

function guardarPerfil() {
  memoria.gravar(CHAVE_PERFIL, { ...estado.perfil, mes: estado.mes, dias: estado.dias })
}

/* ======================================================= 3. resultado */

/**
 * O perfil era uma linha corrida de pontos numa barra verde escura, e com sete
 * filtros ativos virava um parágrafo. Agora é ficha por ficha: as três
 * primeiras dizem o serviço, as demais são o que ele exclui ou acrescenta.
 */
function fichasDoPerfil() {
  const p = estado.perfil
  const fichas = [
    ['forte', SERVICOS.find((s) => s.id === p.servico)?.rot ?? ''],
    ['', `Padrão ${PADROES.find((x) => x.id === p.padrao)?.rot?.toLowerCase() ?? ''}`],
    ['', `${p.refeicoes} refeições/dia`],
  ]
  const q = quantidadesDo(p)
  const saladas = q.saladaCrua + q.saladaCozida + q.saladaMolho
  const sobremesas = q.fruta + q.doce
  const conta = (n, um, varios) => `${n} ${n === 1 ? um : varios}`
  fichas.push(['mais', conta(q.principal, 'prato principal', 'pratos principais')])
  fichas.push(['mais', conta(saladas, 'salada', 'saladas')])
  fichas.push(['mais', conta(q.acompanhamento, 'acompanhamento', 'acompanhamentos')])
  fichas.push(['mais', conta(sobremesas, 'sobremesa', 'sobremesas')])
  for (const id of ['sopa', 'tipico', 'arrozComposto', 'leguminosa', 'molho']) {
    const x = QUANTIDADES.find((i) => i.id === id)
    if (q[id] > 0) fichas.push(['mais', conta(q[id], x.um.toLowerCase(), x.rot.toLowerCase())])
  }
  for (const e of EQUIPAMENTOS) {
    if (!p.equipamentos.includes(e.id)) fichas.push(['menos', `Sem ${e.rot.toLowerCase()}`])
  }
  for (const r of RESTRICOES) {
    if (p.restricoes.includes(r.id)) fichas.push(['menos', r.rot])
  }
  if (p.digestao) fichas.push(['menos', 'Sem concentrar pesados'])
  return fichas.map(([tipo, texto]) =>
    `<span class="ficha ${tipo}">${esc(texto)}</span>`).join('')
}

const sinais = (item) => {
  if (item.fixo) return `<span class="sinais">todos os dias</span>`
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

  $('perfil').innerHTML = fichasDoPerfil()

  pintarConferencia()
  pintarTiraDias()
  pintarDia()
  pintarAvisos()

  const cabeca = `<tr><th>Espaço</th>${c.map((d) =>
    `<th>${esc(d.dia)}</th>`).join('')}</tr>`
  $('grade').tHead.innerHTML = cabeca

  let secao = ''
  const corpo = estrutura.map((linha, li) => {
    const celulas = c.map((dia, di) => {
      const item = dia.itens[li]
      if (!item || item.vazio) {
        return `<td><div class="vazio">sem opção com os filtros de hoje</div></td>`
      }
      return `<td><button class="prato${item.fixo ? ' fixo' : ''}" type="button" data-di="${di}" data-li="${li}">
        <span class="nome">${esc(item.nome)}</span>${sinais(item)}</button></td>`
    }).join('')
    // cardápio salvo antes das seções não tem `secao`: segue sem o cabeçalho
    const titulo = linha.secao && linha.secao !== secao
      ? `<tr class="secao"><th colspan="${c.length + 1}">${esc(linha.secao)}</th></tr>` : ''
    secao = linha.secao ?? secao
    return `${titulo}<tr><th>${esc(linha.espaco)}</th>${celulas}</tr>`
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
  let secao = ''
  $('cartoesDia').innerHTML = dia.itens.map((item, li) => {
    const titulo = item.secao && item.secao !== secao
      ? `<span class="secao-dia">${esc(item.secao)}</span>` : ''
    secao = item.secao ?? secao
    return titulo + cartaoDoPrato(item, li)
  }).join('')
  for (const b of $$('#cartoesDia .cartao-prato[data-di]')) {
    b.addEventListener('click', () => abrirPrato(+b.dataset.di, +b.dataset.li))
  }
}

function cartaoDoPrato(item, li) {
  if (item.vazio) {
    return `<div class="cartao-prato sem-opcao">
      <span class="miolo"><span class="espaco">${esc(item.espaco)}</span>
      <span class="nome">sem opção com os filtros de hoje</span></span></div>`
  }
  return `<button class="cartao-prato${item.fixo ? ' fixo' : ''}" type="button" data-di="${estado.diaVisivel}" data-li="${li}">
    <span class="miolo">
      <span class="espaco">${esc(item.espaco)}</span>
      <span class="nome">${esc(item.nome)}</span>${sinais(item)}
    </span>
    <svg aria-hidden="true"><use href="#i-dir"></use></svg>
  </button>`
}

/**
 * Eram três faixas laranja no topo, altas o bastante para empurrar a grade para
 * fora da tela toda vez. Duas delas falam desta semana e viram uma linha que
 * abre; a terceira é uma ressalva permanente sobre o filtro e desce para o pé
 * da grade, onde não compete com o cardápio.
 */
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
  if (estado.foraDoPadrao?.length) {
    avisos.push(['atencao', `<b>Padrão:</b> em ${esc(estado.foraDoPadrao.join(', ').toLowerCase())} o acervo ` +
      `não tinha preparação suficiente dentro do padrão escolhido, então entrou prato de outro padrão. ` +
      `Confira esses pratos antes de fechar.`])
  }
  if (estado.repetidos.length) {
    avisos.push(['atencao', `<b>Repetição:</b> em ${esc(estado.repetidos.join(', ').toLowerCase())} o acervo ` +
      `do livro não tem preparações suficientes para a semana inteira sem repetir, com os filtros ativos.`])
  }

  const caixa = $('observacoes')
  caixa.hidden = !avisos.length
  caixa.open = false
  if (avisos.length) {
    $('observacoesResumo').textContent = avisos.length === 1
      ? 'Uma observação sobre esta semana'
      : `${avisos.length} observações sobre esta semana`
    $('avisos').innerHTML = avisos.map(([tipo, texto]) =>
      `<div class="recado ${tipo}">
        <svg aria-hidden="true"><use href="#${tipo === 'atencao' ? 'i-atencao' : 'i-ajuda'}"></use></svg>
        <span>${texto}</span></div>`).join('')
  }

  const temRestricao = estado.perfil.restricoes.length > 0
  $('ressalvaRestricoes').hidden = !temRestricao
  if (temRestricao) {
    $('ressalvaRestricoes').innerHTML = `<b>Sobre as exclusões:</b> o assistente lê o nome e a
      descrição de cada preparação, não uma ficha de ingredientes. Uma preparação que não
      mencione o item pode passar. Confira antes de servir.`
  }
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
  $('abaTroca').hidden = !!item.fixo

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
  if (item.fixo) {
    motivos.push(`<b>Fixo em todos os dias.</b> Arroz e feijão são o prato base do cardápio
      brasileiro (capítulo VI, 1.1.1). O que varia é o arroz composto e a leguminosa, nas
      linhas próprias.`)
    if (item.grupo === 'feijao' && estado.perfil.restricoes.length) {
      motivos.push(`Com as restrições que você marcou, prepare o feijão sem as carnes que o
        livro deixa como opcionais.`)
    }
    return motivos
  }
  if (item.nivel) {
    const rot = PADROES.find((x) => x.id === item.nivel)?.rot.toLowerCase()
    motivos.push(item.nivelProvisorio
      ? `Preparação de padrão <b>${esc(rot)}</b> numa classificação <b>provisória</b>, feita pelo
         custo dos ingredientes do nome e da descrição, até a autora marcar o acervo. Fator 1.1.`
      : `Preparação de padrão <b>${esc(rot)}</b>, como a autora marcou no acervo. Fator 1.1.`)
  }
  const principal = item.grupo ? item.grupo === 'principal' : item.espaco === 'Prato principal'
  if (principal && item.referencia) {
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
  const { espaco, grupo, secao, alternativas, ...antiga } = item
  const restantes = (alternativas ?? []).filter((a) => a.id !== nova.id)
  estado.cardapio[alvoAtual.di].itens[alvoAtual.li] = {
    ...nova, espaco, grupo, secao, alternativas: [antiga, ...restantes],
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
  estado.perfil = migrarPerfil(s.perfil)
  estado.cardapio = s.cardapio
  estado.relaxados = []
  estado.repetidos = []
  estado.foraDoPadrao = []
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
  $('ajustarPerfil').addEventListener('click', () => abrirWizard(1))

  /* --- wizard --- */
  const form = $('formPerfil')
  form.addEventListener('click', (ev) => {
    const opt = ev.target.closest('.opt')
    if (opt) { escolher(opt.dataset.campo, opt.dataset.id, opt.dataset.tipo); return }
    const mes = ev.target.closest('[data-mes]')
    if (mes) {
      estado.mes = mes.dataset.mes
      pintarMeses(); atualizarNotaSafra(); guardarPerfil()
      $('meses').querySelector(`[data-mes="${CSS.escape(estado.mes)}"]`)?.focus()
      return
    }
    const dias = ev.target.closest('[data-dias]')
    if (dias) {
      estado.dias = +dias.dataset.dias
      pintarDiasOpcao(); guardarPerfil()
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

  $('quantidades').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-qtd-passo]')
    if (!b) return
    const id = b.dataset.qtdId
    mudarQuantidade(id, quantidadesDo(estado.perfil)[id] + Number(b.dataset.qtdPasso))
  })
  $('quantidades').addEventListener('input', (ev) => {
    const campo = ev.target.closest('[data-qtd]')
    // campo vazio no meio da digitação não vira zero: espera o número
    if (campo && campo.value !== '') mudarQuantidade(campo.dataset.qtd, campo.value)
  })
  $('quantidades').addEventListener('focusout', (ev) => {
    const campo = ev.target.closest('[data-qtd]')
    if (campo) campo.value = String(quantidadesDo(estado.perfil)[campo.dataset.qtd])
  })
  $('usarSugestao').addEventListener('click', usarSugestao)

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
  let relogioMedida
  window.addEventListener('resize', () => {
    clearTimeout(relogioMedida)
    relogioMedida = setTimeout(medirPalco, 120)
  })
}

/* ------------------------------------------------------------ início */
async function iniciar() {
  ligarEventos()

  const salvo = memoria.ler(CHAVE_PERFIL)
  if (salvo) {
    estado.perfil = migrarPerfil(salvo)
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

  aplicarHash()
}

function falhar(recado) {
  // sem acervo não há tela nenhuma para mostrar: o recado vai para a abertura,
  // que é onde a pessoa está quando isso acontece
  $('comecar').insertAdjacentHTML('afterend', `<p class="recado erro">
    <svg aria-hidden="true"><use href="#i-atencao"></use></svg><span>${esc(recado)}</span></p>`)
  $('comecar').disabled = true
}

iniciar()
