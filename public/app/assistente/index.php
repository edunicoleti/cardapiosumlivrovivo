<?php
declare(strict_types=1);
require dirname(__DIR__) . '/lib/acesso.php';
exigirLogin();
?>
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Assistente de Cardápio · Cardápios: Um Livro Vivo</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap">
<style>
  :root {
    --verde: #448D76; --verde-esc: #2F6F5C; --verde-prof: #1F4B3E;
    --teal: #0C718B; --laranja: #ED8627; --laranja-esc: #B85F10;
    --creme: #EEF0D2; --creme-cl: #F7F8EC; --creme-md: #E2E5BE;
    --tinta: #2D2D2D; --tinta-sv: #5A5A5A; --tinta-fr: #8A8A80;
    --linha: #DDE0C8; --branco: #fff;
    --display: 'League Spartan', 'Trebuchet MS', sans-serif;
    --corpo: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: var(--corpo); color: var(--tinta); background: var(--creme-cl);
         font-size: 15px; line-height: 1.55; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 1280px; margin: 0 auto; padding: 0 20px 64px; }

  /* ---------- topo ---------- */
  header { background: var(--verde-prof); color: #fff; padding: 20px 0 22px; }
  header .wrap { padding-bottom: 0; }
  .marca { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .marca h1 { font-family: var(--display); font-size: 1.55rem; font-weight: 700; letter-spacing: -.01em; }
  .marca .sub { color: #BFD9CE; font-size: 13.5px; margin-top: 3px; max-width: 60ch; }
  .btn-ajuda { background: transparent; border: 1px solid rgba(255,255,255,.35); color: #fff;
               font-family: var(--corpo); font-size: 13px; font-weight: 500; padding: 8px 14px;
               border-radius: 999px; cursor: pointer; }
  .btn-ajuda:hover { background: rgba(255,255,255,.12); }

  /* perfil do serviço, sempre à vista */
  .perfil { margin-top: 16px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
            background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.16);
            border-radius: 10px; padding: 10px 14px; }
  .perfil .rot { font-family: var(--display); font-size: 10.5px; font-weight: 600;
                 letter-spacing: .09em; text-transform: uppercase; color: #9FC4B6; }
  .perfil .val { font-size: 13.5px; color: #fff; }
  .perfil .val b { font-weight: 600; }
  .perfil button { margin-left: auto; background: rgba(255,255,255,.14); border: none; color: #fff;
                   font-family: var(--corpo); font-size: 12.5px; font-weight: 600; padding: 7px 13px;
                   border-radius: 7px; cursor: pointer; }
  .perfil button:hover { background: rgba(255,255,255,.24); }

  /* ---------- controles ---------- */
  .controles { background: var(--branco); border-bottom: 1px solid var(--linha); padding: 14px 0;
               position: sticky; top: 0; z-index: 20; }
  .controles .wrap { display: flex; gap: 14px; align-items: flex-end; flex-wrap: wrap; padding-bottom: 0; }
  .campo { display: flex; flex-direction: column; gap: 5px; }
  .campo label { font-family: var(--display); font-size: 10.5px; font-weight: 600; letter-spacing: .09em;
                 text-transform: uppercase; color: var(--tinta-fr); }
  select { font-family: var(--corpo); font-size: 14px; padding: 8px 11px; border: 1px solid var(--linha);
           border-radius: 8px; background: var(--branco); color: var(--tinta); min-width: 120px; }
  .btn { font-family: var(--corpo); font-size: 14px; font-weight: 600; padding: 9px 16px; border-radius: 8px;
         border: 1px solid transparent; cursor: pointer; }
  .btn-prim { background: var(--laranja); color: #fff; }
  .btn-prim:hover { background: var(--laranja-esc); }
  .btn-sec { background: var(--branco); color: var(--verde-esc); border-color: var(--creme-md); }
  .btn-sec:hover { background: var(--creme-cl); }
  .espaco-flex { flex: 1 1 auto; }
  select:focus-visible, .btn:focus-visible, .btn-ajuda:focus-visible, .prato:focus-visible,
  .opt:focus-visible, .perfil button:focus-visible {
    outline: 2px solid var(--laranja); outline-offset: 2px; }

  /* ---------- conferência ---------- */
  .conferencia { display: flex; gap: 10px; flex-wrap: wrap; padding: 18px 0 4px; }
  .selo { background: var(--branco); border: 1px solid var(--linha); border-radius: 10px;
          padding: 10px 14px; display: flex; flex-direction: column; gap: 2px; min-width: 190px; }
  .selo .regra { font-family: var(--display); font-size: 10.5px; font-weight: 600; letter-spacing: .07em;
                 text-transform: uppercase; color: var(--laranja-esc); }
  .selo .valor { font-size: 13.5px; color: var(--tinta-sv); }

  /* ---------- grade ---------- */
  .rolagem { overflow-x: auto; margin-top: 18px; border: 1px solid var(--linha); border-radius: 12px; background: var(--branco); }
  table { border-collapse: collapse; width: 100%; min-width: 900px; }
  th, td { border-bottom: 1px solid var(--linha); border-right: 1px solid var(--linha); vertical-align: top; }
  th:last-child, td:last-child { border-right: none; }
  tr:last-child th, tr:last-child td { border-bottom: none; }
  thead th { background: var(--verde-esc); color: #fff; font-family: var(--display); font-size: 12px;
             font-weight: 600; letter-spacing: .07em; text-transform: uppercase; padding: 11px 12px;
             text-align: left; position: sticky; top: 0; }
  thead th:first-child { background: var(--verde-prof); }
  tbody th { background: var(--creme-cl); font-family: var(--display); font-size: 11.5px; font-weight: 600;
             letter-spacing: .05em; text-transform: uppercase; color: var(--verde-prof);
             padding: 12px; text-align: left; white-space: nowrap; width: 150px; }
  td { padding: 0; }

  .prato { width: 100%; text-align: left; background: none; border: none; font-family: var(--corpo);
           padding: 11px 12px; cursor: pointer; display: block; }
  .prato:hover { background: var(--creme-cl); }
  .prato .nome { font-size: 13.6px; color: var(--tinta); font-weight: 500; line-height: 1.4; }
  .prato .meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 5px; }
  .tag { font-size: 10.5px; font-weight: 600; letter-spacing: .03em; text-transform: uppercase;
         padding: 2px 7px; border-radius: 999px; background: var(--creme); color: var(--verde-esc); }
  .tag.safra { background: #FBEEDF; color: var(--laranja-esc); }
  .prato .trocar { font-size: 11px; color: var(--tinta-fr); margin-top: 6px; opacity: 0; transition: opacity .12s; }
  .prato:hover .trocar, .prato:focus-visible .trocar { opacity: 1; }
  .vazio { padding: 11px 12px; font-size: 13px; color: var(--tinta-fr); font-style: italic; }

  /* ---------- diálogos ---------- */
  /* o reset zera a margem de tudo, e o dialog depende de margin:auto para centralizar */
  dialog { border: none; border-radius: 14px; padding: 0; max-width: 460px; width: calc(100% - 32px);
           margin: auto; box-shadow: 0 20px 60px rgba(0,0,0,.22); }
  dialog.largo { max-width: 620px; }
  dialog::backdrop { background: rgba(31,75,62,.46); }
  .dlg-topo { padding: 20px 22px 14px; border-bottom: 1px solid var(--linha); }
  .dlg-topo .espaco { font-family: var(--display); font-size: 11px; font-weight: 600; letter-spacing: .08em;
                      text-transform: uppercase; color: var(--laranja-esc); }
  .dlg-topo h2 { font-family: var(--display); font-size: 1.2rem; font-weight: 700; color: var(--verde-prof); margin-top: 3px; }
  .dlg-topo p { font-size: 13px; color: var(--tinta-sv); margin-top: 6px; }
  .dlg-lista { max-height: 46vh; overflow-y: auto; }
  .opcao { width: 100%; text-align: left; background: none; border: none; border-bottom: 1px solid var(--linha);
           padding: 13px 22px; cursor: pointer; font-family: var(--corpo); }
  .opcao:hover { background: var(--creme-cl); }
  .opcao .n { font-size: 13.8px; color: var(--tinta); font-weight: 500; }
  .opcao .d { font-size: 12.2px; color: var(--tinta-fr); margin-top: 3px; }
  .dlg-pe { padding: 14px 22px; display: flex; justify-content: flex-end; gap: 10px; align-items: center;
            border-top: 1px solid var(--linha); }
  .dlg-pe .pular { margin-right: auto; background: none; border: none; color: var(--tinta-fr);
                   font-family: var(--corpo); font-size: 13px; cursor: pointer; text-decoration: underline; }

  /* ---------- wizard ---------- */
  .form { padding: 6px 22px 20px; max-height: 62vh; overflow-y: auto; }
  .grupo { padding: 16px 0; border-bottom: 1px solid var(--linha); }
  .grupo:last-child { border-bottom: none; }
  .grupo > legend, .grupo > .titulo { font-family: var(--display); font-size: .98rem; font-weight: 600;
                                      color: var(--verde-prof); }
  .grupo .origem { font-size: 11.5px; color: var(--tinta-fr); margin: 2px 0 10px; }
  .opcoes { display: flex; flex-wrap: wrap; gap: 8px; }
  .opt { border: 1px solid var(--creme-md); background: var(--branco); border-radius: 9px;
         padding: 9px 13px; cursor: pointer; font-family: var(--corpo); font-size: 13.4px;
         color: var(--tinta-sv); text-align: left; }
  .opt:hover { background: var(--creme-cl); }
  .opt[aria-pressed="true"] { background: var(--verde-esc); border-color: var(--verde-esc); color: #fff; font-weight: 600; }
  .opt .desc { display: block; font-size: 11.5px; opacity: .8; margin-top: 2px; font-weight: 400; }
  .num { display: flex; align-items: center; gap: 10px; }
  .num input { font-family: var(--corpo); font-size: 15px; padding: 9px 12px; border: 1px solid var(--linha);
               border-radius: 8px; width: 130px; }

  .creditos { font-size: 12.5px; color: var(--tinta-fr); margin-top: 22px; max-width: 74ch; }
  .aviso { background: #FBEEDF; border: 1px solid #F0D6B4; color: var(--laranja-esc);
           border-radius: 10px; padding: 11px 14px; font-size: 12.8px; margin-top: 18px; }
  .aviso.relaxado { background: #E9F1EC; border-color: #C6DCCB; color: var(--verde-esc); }

  @media (max-width: 860px) {
    table, thead, tbody, th, td, tr { display: block; }
    thead { display: none; }
    .rolagem { min-width: 0; overflow-x: visible; }
    table { min-width: 0; }
    tbody th { background: var(--verde-esc); color: #fff; }
    tbody tr { display: block; border-bottom: 8px solid var(--creme-cl); }
    td { border-right: none; }
    td::before { content: attr(data-dia); display: block; font-family: var(--display); font-size: 10.5px;
                 font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
                 color: var(--tinta-fr); padding: 9px 12px 0; }
    .perfil button { margin-left: 0; }
  }

  @media print {
    header, .controles, .aviso, .prato .trocar, .btn-ajuda { display: none !important; }
    body { background: #fff; font-size: 11px; }
    .rolagem { border: 1px solid #999; }
    table { min-width: 0; }
    .prato { cursor: default; }
    thead th { background: #eee !important; color: #000 !important; -webkit-print-color-adjust: exact; }
    tbody th { background: #f6f6f6 !important; color: #000 !important; -webkit-print-color-adjust: exact; }
  }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
</head>
<body>

<header>
  <div class="wrap">
    <div class="marca">
      <div>
        <h1>Assistente de Cardápio</h1>
        <div class="sub">
          Monta a semana escolhendo dentro das preparações do livro e seguindo as regras
          de composição do capítulo VI.
        </div>
      </div>
      <div style="display:flex;gap:10px"><a class="btn-ajuda" href="/app/" style="text-decoration:none">Voltar</a><button class="btn-ajuda" id="abrirAjuda" type="button">Como funciona</button></div>
    </div>
    <div class="perfil" id="perfil"></div>
  </div>
</header>

<div class="controles">
  <div class="wrap">
    <div class="campo">
      <label for="mes">Mês do cardápio</label>
      <select id="mes"></select>
    </div>
    <div class="campo">
      <label for="dias">Dias</label>
      <select id="dias">
        <option value="5">5 dias (seg a sex)</option>
        <option value="6">6 dias</option>
        <option value="7">7 dias</option>
      </select>
    </div>
    <div class="espaco-flex"></div>
    <button class="btn btn-prim" id="outra" type="button">Gerar outra sugestão</button>
    <button class="btn btn-sec" id="imprimir" type="button">Imprimir</button>
  </div>
</div>

<div class="wrap">
  <div class="conferencia" id="conferencia"></div>
  <div class="rolagem"><table id="grade"><thead></thead><tbody></tbody></table></div>

  <div class="aviso relaxado" id="avisoRelaxado" style="display:none"></div>
  <div class="aviso" id="avisoAmostra"></div>

  <p class="creditos">
    Todas as preparações, os índices e as regras de composição vêm de
    <strong>Cardápios: um livro vivo</strong>, de Lúcia Chaise Borjes. As perguntas do
    início são os fatores administrativos do capítulo VI. A ferramenta não inventa pratos:
    escolhe dentro do acervo do livro e mostra qual regra determinou cada escolha.
  </p>
</div>

<!-- ------------------------------------------------------------ wizard -->
<dialog id="dlgPerfil" class="largo">
  <div class="dlg-topo">
    <div class="espaco">Antes de montar</div>
    <h2>Me conta sobre o seu serviço</h2>
    <p>São cinco perguntas. Elas não são invenção da ferramenta: são os fatores
       administrativos que o capítulo VI manda considerar antes de fechar um cardápio.</p>
  </div>
  <form class="form" id="formPerfil">
    <fieldset class="grupo">
      <legend class="titulo">Que serviço você atende?</legend>
      <div class="origem">Define a estrutura do dia e o que costuma entrar em cada refeição</div>
      <div class="opcoes" data-campo="servico" data-tipo="unico"></div>
    </fieldset>

    <fieldset class="grupo">
      <legend class="titulo">Qual o padrão do cardápio?</legend>
      <div class="origem">Fator 1.1 do capítulo VI</div>
      <div class="opcoes" data-campo="padrao" data-tipo="unico"></div>
    </fieldset>

    <fieldset class="grupo">
      <legend class="titulo">Quantas refeições por dia?</legend>
      <div class="origem">Fator 1.8: o volume influencia o método de preparo possível</div>
      <div class="num">
        <input type="number" id="refeicoes" min="10" max="5000" step="10" value="200">
        <span style="font-size:13px;color:var(--tinta-fr)">refeições</span>
      </div>
    </fieldset>

    <fieldset class="grupo">
      <legend class="titulo">O que você tem na cozinha?</legend>
      <div class="origem">Fator 1.6: o equipamento disponível limita os métodos de cocção</div>
      <div class="opcoes" data-campo="equipamentos" data-tipo="multiplo"></div>
    </fieldset>

    <fieldset class="grupo">
      <legend class="titulo">Alguma restrição?</legend>
      <div class="origem">O que não pode entrar no cardápio deste serviço</div>
      <div class="opcoes" data-campo="restricoes" data-tipo="multiplo"></div>
    </fieldset>
  </form>
  <div class="dlg-pe">
    <button class="pular" id="pularPerfil" type="button">Pular, quero só ver funcionando</button>
    <button class="btn btn-prim" id="salvarPerfil" type="button">Montar meu cardápio</button>
  </div>
</dialog>

<dialog id="dlgTroca">
  <div class="dlg-topo">
    <div class="espaco" id="trocaEspaco"></div>
    <h2 id="trocaAtual"></h2>
    <p>Estas são as outras opções que o assistente considerou para este espaço.</p>
  </div>
  <div class="dlg-lista" id="trocaLista"></div>
  <div class="dlg-pe"><button class="btn btn-sec" id="fecharTroca" type="button">Cancelar</button></div>
</dialog>

<dialog id="dlgAjuda">
  <div class="dlg-topo">
    <div class="espaco">Como funciona</div>
    <h2>Três coisas para saber</h2>
  </div>
  <div class="form">
    <div class="grupo">
      <div class="titulo">Ele monta a partir do seu serviço</div>
      <p style="font-size:13.4px;color:var(--tinta-sv);margin-top:4px">
        O padrão, o volume, o equipamento e as restrições que você informou entram na escolha
        de cada prato. Dá para ajustar isso a qualquer momento no topo da página.</p>
    </div>
    <div class="grupo">
      <div class="titulo">Cada escolha tem um motivo</div>
      <p style="font-size:13.4px;color:var(--tinta-sv);margin-top:4px">
        Quando um prato foi escolhido pela safra do mês, isso aparece na célula. A conferência
        mostra se a semana respeitou o rodízio de proteína, o limite de fritura e a variedade
        de cocção.</p>
    </div>
    <div class="grupo">
      <div class="titulo">Você tem a palavra final</div>
      <p style="font-size:13.4px;color:var(--tinta-sv);margin-top:4px">
        Clique em qualquer prato para ver as outras opções e trocar. Trocar um prato não
        refaz o resto da semana.</p>
    </div>
  </div>
  <div class="dlg-pe"><button class="btn btn-prim" id="fecharAjuda" type="button">Entendi</button></div>
</dialog>

<script type="module">
const MESES = [
  ['jan','Janeiro'],['fev','Fevereiro'],['mar','Março'],['abr','Abril'],
  ['mai','Maio'],['jun','Junho'],['jul','Julho'],['ago','Agosto'],
  ['set','Setembro'],['out','Outubro'],['nov','Novembro'],['dez','Dezembro'],
]
const DIAS = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo']

// ------------------------------------------------------- perfil do serviço
// As opções vêm dos fatores administrativos do capítulo VI e dos quatro
// cardápios de exemplo dos anexos.
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
  { id: 'forno', rot: 'Forno', metodos: ['assado','gratinado'] },
  { id: 'fritadeira', rot: 'Fritadeira', metodos: ['frito','empanado'] },
  { id: 'chapa', rot: 'Chapa ou grelha', metodos: ['grelhado'] },
]
// Restringir pela categoria do livro nao basta: bacon, presunto, linguica e
// calabresa aparecem em salada, arroz, feijao e ate em ovo. Filtrar so a
// categoria "Carne Suína" deixaria passar cinco de cada seis pratos com suino.
// Por isso a restricao le o nome e a descricao de cada preparacao. Num filtro
// alimentar o erro tem de cair para o lado de excluir demais.
const RESTRICOES = [
  { id: 'sem-suina', rot: 'Sem carne suína', referencias: ['Carne suína'],
    termos: ['suin','porco','bacon','presunto','linguic','calabres','pernil','pancetta',
             'copa lombo','copa-lombo','tender','torresmo','paio','salsich','lombo'] },
  { id: 'sem-mar', rot: 'Sem frutos do mar', referencias: ['Pescados'],
    termos: ['peixe','pescad','camarao','lula','polvo','mexilh','marisco','siri','caranguejo',
             'bacalhau','atum','sardinha','salmao','tilapia','merluza','anchova','fruto do mar'] },
  { id: 'sem-bovina', rot: 'Sem carne bovina', referencias: ['Carne bovina'],
    termos: ['bovin','bife','alcatra','patinho','coxao','acem','musculo','costela','picanha',
             'maminha','file mignon','charque','carne seca','carne moida','contrafil',
             'fraldinha','matambre','cupim'] },
]

const PERFIL_PADRAO = {
  servico: 'institucional', padrao: 'medio', refeicoes: 200,
  equipamentos: ['forno','fritadeira','chapa'], restricoes: [],
}

// Estrutura do dia, derivada da matriz do capítulo VI. O serviço ajusta o que entra.
const BASE_ESTRUTURA = [
  { espaco: 'Prato principal', slot: 'principal', rodizio: true },
  { espaco: 'Arroz',           slot: 'base', referencia: 'Arroz' },
  { espaco: 'Feijão',          slot: 'base', referencia: 'Feijão' },
  { espaco: 'Acompanhamento',  slot: 'acompanhamento' },
  { espaco: 'Salada crua',     slot: 'salada', referencias: ['Crua','Mista'] },
  { espaco: 'Salada cozida',   slot: 'salada', referencias: ['Cozida'] },
  { espaco: 'Sobremesa',       slot: 'sobremesa' },
]
const RODIZIO = ['Carne bovina','Carne de frango','Pescados','Carne suína','Carnes diversas']

let base = null
let estado = { mes: MESES[new Date().getMonth()][0], dias: 5, semente: 1, cardapio: null,
               perfil: { ...PERFIL_PADRAO }, relaxados: [], repetidos: [] }

// ------------------------------------------------------------------ motor
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()
const cacheRegex = new Map()
function regexItem(item) {
  if (!cacheRegex.has(item)) {
    const esc = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    cacheRegex.set(item, new RegExp(`(^|[^a-z])${esc}s?([^a-z]|$)`))
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
const VAZIAS = new Set(['com','sem','ao','aos','de','da','do','em','na','no','uma','para'])
function ingredienteChave(p, safra) {
  if (safra) return safra.item
  const palavra = semAcento(p.nome).replace(/[^a-z\s-]/g,' ').split(/\s+/)
    .find((t) => t.length > 3 && !VAZIAS.has(t))
  return palavra ?? null
}

// --------------------------------------------------- o perfil vira restrição
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
const SIMPLES = new Set(['Crua','Cozida','Fruta in natura'])
const ELABORADO = new Set(['Mista','Elaborada com molho','Sobremesa elaborada'])
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
    e.push({ espaco: 'Salada extra', slot: 'salada', referencias: ['Mista','Elaborada com molho'] })
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
  const estrutura = estruturaDoServico(perfil.servico)
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

    for (const linha of estrutura) {
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

      const esc = avaliadas[0]
      usadas.add(esc.p.id)
      if (esc.p.metodo) metodosDoDia.push(esc.p.metodo)
      if (esc.p.metodo === 'frito') frituras.push(d)
      if (esc.chave) {
        ;(ingredientePorEspaco[linha.espaco] ??= []).push(esc.chave)
        ingredientesDoDia.push(esc.chave)
      }

      dia.itens.push({
        espaco: linha.espaco, nome: esc.p.nome, metodo: esc.p.metodo,
        safra: esc.safra?.mostrar ? esc.safra.item : null,
        alternativas: avaliadas.slice(1, 9).map((a) => ({
          id: a.p.id, nome: a.p.nome, metodo: a.p.metodo,
          descricao: a.p.descricao, safra: a.safra?.mostrar ? a.safra.item : null,
        })),
      })
    }
    cardapio.push(dia)
  }
  estado.relaxados = [...relaxados]
  estado.repetidos = [...repetidos]
  return { cardapio, estrutura }
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
    ['3.7 Variedade de ingredientes', `${principais.size} pratos principais distintos em ${cardapio.length} dias`],
    ['3.2 Variedade de cocção', `${fritos} fritura(s); ${repetido} dia(s) com método repetido`],
    ['3.1 Estação do ano', `${itens.filter((i) => i.safra).length} pratos com ingrediente da safra`],
  ]
}

// ------------------------------------------------------------------ tela
const $ = (id) => document.getElementById(id)
let estrutura = BASE_ESTRUTURA

function rotuloPerfil() {
  const p = estado.perfil
  const servico = SERVICOS.find((s) => s.id === p.servico)?.rot ?? ''
  const padrao = PADROES.find((x) => x.id === p.padrao)?.rot?.toLowerCase() ?? ''
  const semEquip = EQUIPAMENTOS.filter((e) => !p.equipamentos.includes(e.id)).map((e) => e.rot.toLowerCase())
  const restr = RESTRICOES.filter((r) => p.restricoes.includes(r.id)).map((r) => r.rot.toLowerCase())
  const extras = [...semEquip.map((e) => `sem ${e}`), ...restr]
  return `<span class="rot">Seu serviço</span>
    <span class="val"><b>${servico}</b> · padrão ${padrao} · ${p.refeicoes} refeições${
      extras.length ? ` · ${extras.join(' · ')}` : ''}</span>
    <button id="ajustarPerfil" type="button">Ajustar</button>`
}

function desenhar() {
  const r = montar(estado)
  estado.cardapio = r.cardapio
  estrutura = r.estrutura
  const c = estado.cardapio

  $('perfil').innerHTML = rotuloPerfil()
  $('ajustarPerfil').addEventListener('click', () => abrirPerfil())

  $('conferencia').innerHTML = conferir(c).map(([regra, valor]) =>
    `<div class="selo"><span class="regra">${regra}</span><span class="valor">${valor}</span></div>`).join('')

  $('grade').querySelector('thead').innerHTML =
    '<tr><th>Espaço</th>' + c.map((d) => `<th>${d.dia}</th>`).join('') + '</tr>'

  $('grade').querySelector('tbody').innerHTML = estrutura.map((linha, li) => {
    const celulas = c.map((dia, di) => {
      const item = dia.itens[li]
      if (!item || item.vazio) return `<td data-dia="${dia.dia}"><div class="vazio">sem opção disponível</div></td>`
      const tags = [
        item.metodo ? `<span class="tag">${item.metodo}</span>` : '',
        item.safra ? `<span class="tag safra">${item.safra} na safra</span>` : '',
      ].join('')
      return `<td data-dia="${dia.dia}">
        <button class="prato" data-dia="${di}" data-linha="${li}" type="button">
          <span class="nome">${item.nome}</span>
          ${tags ? `<span class="meta">${tags}</span>` : ''}
          <span class="trocar">clique para trocar</span>
        </button></td>`
    }).join('')
    return `<tr><th>${linha.espaco}</th>${celulas}</tr>`
  }).join('')

  for (const botao of document.querySelectorAll('.prato')) {
    botao.addEventListener('click', () => abrirTroca(+botao.dataset.dia, +botao.dataset.linha))
  }

  const avisos = []
  if (estado.relaxados.length) {
    avisos.push(
      `<strong>Equipamento:</strong> em ${estado.relaxados.join(', ').toLowerCase()} o acervo não ` +
      `tinha opção compatível com o que você informou, então o assistente usou o que havia. ` +
      `Confira esses pratos antes de fechar.`)
  }
  if (estado.repetidos?.length) {
    avisos.push(
      `<strong>Repetição:</strong> em ${estado.repetidos.join(', ').toLowerCase()} o acervo do livro ` +
      `não tem preparações suficientes para a semana inteira sem repetir, com os filtros ativos. ` +
      `O assistente repetiu em vez de deixar o espaço vazio.`)
  }
  if (estado.perfil.restricoes.length) {
    avisos.push(
      `<strong>Restrições:</strong> o assistente exclui pratos lendo o nome e a descrição de cada ` +
      `preparação. É uma leitura de texto, não uma ficha de ingredientes: uma preparação que não ` +
      `mencione o item pode passar. Confira antes de servir.`)
  }
  if (avisos.length) {
    $('avisoRelaxado').style.display = ''
    $('avisoRelaxado').innerHTML = avisos.map((a) => `<div>${a}</div>`).join('<div style="height:8px"></div>')
  } else {
    $('avisoRelaxado').style.display = 'none'
  }
}

function abrirTroca(di, li) {
  const item = estado.cardapio[di].itens[li]
  $('trocaEspaco').textContent = `${estrutura[li].espaco} · ${estado.cardapio[di].dia}`
  $('trocaAtual').textContent = item.nome
  $('trocaLista').innerHTML = item.alternativas.map((a, i) => `
    <button class="opcao" data-i="${i}" type="button">
      <div class="n">${a.nome}</div>
      <div class="d">${[a.metodo, a.safra ? `${a.safra} na safra` : '', a.descricao].filter(Boolean).join(' · ')}</div>
    </button>`).join('') || '<div class="vazio" style="padding:18px 22px">Não há outras opções neste espaço.</div>'

  for (const opcao of $('trocaLista').querySelectorAll('.opcao')) {
    opcao.addEventListener('click', () => {
      const nova = item.alternativas[+opcao.dataset.i]
      const antigo = { nome: item.nome, metodo: item.metodo, safra: item.safra, descricao: '' }
      item.nome = nova.nome; item.metodo = nova.metodo; item.safra = nova.safra
      item.alternativas = item.alternativas.filter((_, k) => k !== +opcao.dataset.i)
      item.alternativas.unshift(antigo)
      $('dlgTroca').close()
      redesenharCelulas()
    })
  }
  $('dlgTroca').showModal()
}

// redesenha sem remontar, para a troca não mexer no resto da semana
function redesenharCelulas() {
  $('conferencia').innerHTML = conferir(estado.cardapio).map(([regra, valor]) =>
    `<div class="selo"><span class="regra">${regra}</span><span class="valor">${valor}</span></div>`).join('')
  document.querySelectorAll('.prato').forEach((botao) => {
    const item = estado.cardapio[+botao.dataset.dia].itens[+botao.dataset.linha]
    const tags = [
      item.metodo ? `<span class="tag">${item.metodo}</span>` : '',
      item.safra ? `<span class="tag safra">${item.safra} na safra</span>` : '',
    ].join('')
    botao.innerHTML = `<span class="nome">${item.nome}</span>
      ${tags ? `<span class="meta">${tags}</span>` : ''}
      <span class="trocar">clique para trocar</span>`
  })
}

// ------------------------------------------------------------------ wizard
function pintarOpcoes() {
  const mapa = {
    servico: SERVICOS, padrao: PADROES, equipamentos: EQUIPAMENTOS, restricoes: RESTRICOES,
  }
  for (const caixa of document.querySelectorAll('.opcoes')) {
    const campo = caixa.dataset.campo
    const multiplo = caixa.dataset.tipo === 'multiplo'
    caixa.innerHTML = mapa[campo].map((o) => {
      const marcado = multiplo
        ? estado.perfil[campo].includes(o.id)
        : estado.perfil[campo] === o.id
      return `<button class="opt" type="button" data-campo="${campo}" data-id="${o.id}"
        data-multiplo="${multiplo}" aria-pressed="${marcado}">${o.rot}${
        o.desc ? `<span class="desc">${o.desc}</span>` : ''}</button>`
    }).join('')
  }
  for (const botao of document.querySelectorAll('.opt')) {
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

function abrirPerfil() {
  $('refeicoes').value = estado.perfil.refeicoes
  pintarOpcoes()
  $('dlgPerfil').showModal()
}

function salvarPerfil() {
  estado.perfil.refeicoes = Math.max(10, Number($('refeicoes').value) || 200)
  try { localStorage.setItem('assistente-perfil', JSON.stringify(estado.perfil)) } catch (e) {}
  $('dlgPerfil').close()
  desenhar()
}

// ------------------------------------------------------------------ início
async function iniciar() {
  base = await (await fetch('/app/conteudo.php?arquivo=assistente')).json()

  $('mes').innerHTML = MESES.map(([v, n]) =>
    `<option value="${v}"${v === estado.mes ? ' selected' : ''}>${n}</option>`).join('')

  if (base.meta?.amostra) {
    $('avisoAmostra').textContent =
      `Versão de teste: sorteando dentro de ${base.preparacoes.length} preparações, ` +
      `uma amostra do acervo de ${base.meta.totalReal} do livro.`
  } else {
    $('avisoAmostra').style.display = 'none'
  }

  let salvo = null
  try { salvo = JSON.parse(localStorage.getItem('assistente-perfil') || 'null') } catch (e) {}
  if (salvo) estado.perfil = { ...PERFIL_PADRAO, ...salvo }

  $('mes').addEventListener('change', (e) => { estado.mes = e.target.value; desenhar() })
  $('dias').addEventListener('change', (e) => { estado.dias = +e.target.value; desenhar() })
  $('outra').addEventListener('click', () => { estado.semente++; desenhar() })
  $('imprimir').addEventListener('click', () => window.print())
  $('fecharTroca').addEventListener('click', () => $('dlgTroca').close())
  $('abrirAjuda').addEventListener('click', () => $('dlgAjuda').showModal())
  $('fecharAjuda').addEventListener('click', () => $('dlgAjuda').close())
  $('salvarPerfil').addEventListener('click', salvarPerfil)
  $('pularPerfil').addEventListener('click', () => {
    try { localStorage.setItem('assistente-perfil', JSON.stringify(estado.perfil)) } catch (e) {}
    $('dlgPerfil').close()
  })

  desenhar()

  // Quem chega pela primeira vez responde o perfil; quem já respondeu vai direto
  // para a grade, com o cardápio do serviço dele já montado.
  if (!salvo) abrirPerfil()
}

iniciar()
</script>
</body>
</html>
