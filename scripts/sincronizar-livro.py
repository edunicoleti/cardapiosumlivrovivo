"""
Sincroniza o Gerador de Cardápio com uma versão nova do livro (.docx).

O Gerador não lê o PDF: ele sorteia de public/app/acervo/assistente.json.
Sempre que a autora mudar o livro, rode este script com o .docx novo. Ele
compara o Banco de Receitas do livro com o acervo e:

  1. troca nome, descrição, padrão (P/M/L) e seção das receitas que mudaram;
  2. acrescenta as receitas novas (id novo, depois do maior id atual);
  3. marca `foraDoLivro` nas receitas que saíram do livro. Elas somem do
     Gerador, mas o id continua reservado, e se voltarem ao livro voltam;
  4. grava a versão do livro em acervo/versao.json, que o admin mostra.

Sem --aplicar, só simula. Nos dois casos escreve um relatório HTML do que
mudou ao lado do .docx, para a autora conferir antes de publicar.

Uso:
  python scripts/sincronizar-livro.py "C:/.../LIVRO VIVO PRONTO.docx"
  python scripts/sincronizar-livro.py "C:/.../LIVRO VIVO PRONTO.docx" --aplicar

Depois de --aplicar: conferir no harness (npm run app), commit e push na main.
O deploy do GitHub Actions publica.

Precisa de python-docx (pip install python-docx).

ATENÇÃO: este repositório é público. O .docx e o relatório têm o livro
inteiro e NUNCA vão para o repositório; por isso o relatório fica ao lado
do .docx, fora daqui.
"""
import argparse
import datetime
import difflib
import hashlib
import html
import json
import pathlib
import re
import unicodedata
from collections import Counter

import docx
from docx.table import Table
from docx.text.paragraph import Paragraph

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ACERVO = RAIZ / 'public' / 'app' / 'acervo' / 'assistente.json'
VERSAO = RAIZ / 'public' / 'app' / 'acervo' / 'versao.json'
VALOR = {'P': 'popular', 'M': 'medio', 'L': 'luxo'}
ROTULO_PADRAO = {'popular': 'P', 'medio': 'M', 'luxo': 'L', None: 'sem marca'}


def norm(s):
    s = unicodedata.normalize('NFD', s or '')
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()
    s = re.sub(r"[’'`]", '', s)
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def limpo(s):
    """Texto do livro sem espaços sobrando, para comparar e gravar."""
    return re.sub(r'\s+', ' ', (s or '').replace('\xad', '')).strip()


# Título da seção no livro -> categoria no acervo
CATEGORIA = {norm(k): v for k, v in {
    'CARNE BOVINA': 'Carne Bovina',
    'CARNE DE AVES': 'Carne de Aves',
    'CARNE SUÍNA': 'Carne Suína',
    'PEIXES E FRUTOS DO MAR': 'Peixes e Frutos do Mar',
    'CARNES E EMBUTIDOS DIVERSOS': 'Carnes e Embutidos Diversos',
    'OVOS': 'Ovos',
    'LEGUMINOSAS': 'Leguminosas',
    'ARROZ': 'Arroz',
    'MACARRÃO (MASSAS ALIMENTÍCIAS)': 'Macarrão',
    'ACOMPANHAMENTOS DIVERSOS COM FARINHAS': 'Acompanhamentos Diversos com Farinha',
    'BATATA INGLESA': 'Batatas Inglesas',
    'ACOMPANHAMENTOS COM VEGETAIS RICOS EM CARBOIDRATOS': 'Acompanhamentos com Vegetais Ricos em Carboidratos',
    'ACOMPANHAMENTOS VEGETAIS': 'Acompanhamentos Vegetais',
    'MOLHOS QUENTES': 'Molhos Quentes',
    'MOLHOS FRIOS': 'Molhos Frios',
    'SOPAS': 'Sopas',
    'SALADAS MISTAS COM MOLHO DE LIGAÇÃO': 'Saladas Mistas com Molho de Ligação',
    'SALADAS MISTAS SEM MOLHO DE LIGAÇÃO': 'Saladas Mistas sem Molho de Ligação',
    'SALADAS COZIDAS SIMPLES': 'Saladas Cozidas Simples',
    'SALADAS CRUAS SIMPLES': 'Saladas Cruas Simples',
    'SOBREMESAS – FRUTAS': 'Sobremesas - Frutas',
    'SOBREMESAS ELABORADAS': 'Sobremesas Elaboradas',
    'ALIMENTOS E PREPARAÇÕES TÍPICAS POR REGIÃO DO BRASIL': 'Alimentos e Preparações Típicas por Região do Brasil',
}.items()}

# Método de cocção pelo texto, para as receitas novas. A ordem decide quando
# o texto cita mais de um: o que marca a preparação vem primeiro.
METODOS = [('empanad', 'empanado'), ('frit', 'frito'), ('gratinad', 'gratinado'),
           ('grelhad', 'grelhado'), ('assad', 'assado'), ('refogad', 'refogado'),
           ('cozid', 'cozido')]


# ------------------------------------------------------------------ leitura
def receitas_do_livro(caminho):
    d = docx.Document(caminho)
    dentro, secao, itens = False, None, []
    for el in d.element.body.iterchildren():
        tag = el.tag.split('}')[1]
        if tag == 'p':
            p = Paragraph(el, d)
            if p.style.name == 'Heading 1':
                dentro = p.text.strip() == 'BANCO DE RECEITAS'
            elif p.style.name == 'Heading 2' and dentro:
                secao = p.text.strip()
        elif tag == 'tbl' and dentro and secao:
            da_tabela = []
            for linha in Table(el, d).rows:
                celulas = []
                for c in linha.cells:  # célula mesclada aparece repetida
                    if not celulas or celulas[-1][0] is not c._tc:
                        celulas.append((c._tc, c.text.strip()))
                cs = [t for _, t in celulas]
                marca = [i for i, t in enumerate(cs) if t in VALOR]
                if not marca:
                    continue  # cabeçalho, tabela de cortes, tipos de grão
                i = marca[0]
                if len(cs) >= 3:
                    nome, desc = cs[0], (cs[i + 1] if i + 1 < len(cs) else '')
                else:
                    nome, desc = cs[1 - i], ''
                da_tabela.append({'secao': secao, 'categoria': CATEGORIA.get(norm(secao)),
                                  'nome': limpo(nome), 'descricao': limpo(desc), 'padrao': VALOR[cs[i]]})
            # Célula mesclada de várias linhas (a lista "À crioula, À americana..."
            # dos acompanhamentos vegetais) não é descrição de cada receita.
            repetidas = Counter(it['descricao'] for it in da_tabela if it['descricao'])
            for it in da_tabela:
                if repetidas[it['descricao']] >= 3:
                    it['descricao'] = ''
            itens.extend(da_tabela)
    return d, itens


def acentos(s):
    return sum(1 for c in (s or '') if ord(c) > 127)


def so_grafia(antes, depois):
    """Mesma palavra, só acento ou maiúscula diferente, e o livro perdeu acento
    ("Filé" virou "File"): nesse caso o acervo fica como está."""
    return norm(antes) == norm(depois) and acentos(depois) < acentos(antes)


# ------------------------------------------------------------------ casamento
def casar(itens, preparacoes):
    """Liga cada receita do livro a uma preparação do acervo, do critério mais
    seguro para o mais solto. Devolve {id: (item, como)} e os itens sem par."""
    por_cat = {}
    for p in preparacoes:
        por_cat.setdefault(p['categoria'], []).append(p)
    par, usados = {}, set()

    def ligar(it, p, como):
        par[p['id']] = (it, como)
        usados.add(id(it))

    passadas = [
        # mesmo nome, mesma seção
        ('nome', lambda it: [p for p in por_cat.get(it['categoria'], [])
                             if norm(p['nome']) == norm(it['nome'])]),
        # o livro rebatizou, mas a descrição é a mesma
        ('descricao', lambda it: [p for p in por_cat.get(it['categoria'], [])
                                  if norm(it['descricao']) and norm(p.get('descricao')) == norm(it['descricao'])]),
        # a receita mudou de seção: nome e descrição iguais em outra categoria
        ('secao', lambda it: [p for p in preparacoes
                              if norm(p['nome']) == norm(it['nome'])
                              and norm(p.get('descricao')) == norm(it['descricao'])]),
    ]
    for como, candidatos in passadas:
        for it in itens:
            if id(it) in usados:
                continue
            cand = [p for p in candidatos(it) if p['id'] not in par]
            if len(cand) == 1 or (cand and como == 'nome'):
                ligar(it, cand[0], como)

    # última passada: nome parecido na mesma seção (correção de grafia,
    # palavra acrescentada). Só aceita quando a semelhança é alta e única.
    for it in itens:
        if id(it) in usados:
            continue
        alvo = norm(it['nome'])
        notas = []
        for p in por_cat.get(it['categoria'], []):
            if p['id'] in par:
                continue
            r = difflib.SequenceMatcher(None, alvo, norm(p['nome'])).ratio()
            if r >= 0.86:
                notas.append((r, p))
        notas.sort(key=lambda x: -x[0])
        if notas and (len(notas) == 1 or notas[0][0] - notas[1][0] > 0.05):
            ligar(it, notas[0][1], 'parecido')

    sobra = [it for it in itens if id(it) not in usados]
    return par, sobra


def receita_nova(it, pid, molde):
    texto = norm(f"{it['nome']} {it['descricao']}")
    metodo = next((m for chave, m in METODOS if chave in texto), None)
    return {'id': pid, 'slot': molde['slot'], 'referencia': molde['referencia'],
            'categoria': it['categoria'], 'nome': it['nome'], 'metodo': metodo,
            'descricao': it['descricao'], 'padrao': it['padrao']}


# ------------------------------------------------------------------ relatório
CSS = """
body{font:15px/1.55 -apple-system,'Segoe UI',Roboto,sans-serif;color:#24291F;background:#F6F7E6;margin:0}
main{max-width:1000px;margin:0 auto;padding:28px 18px 60px}
h1{font-size:26px;color:#2F6B57;margin:0 0 4px}
h2{font-size:19px;color:#2F6B57;margin:34px 0 8px}
.sub{color:#4A5344;margin:0 0 18px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.card{background:#fff;border:1px solid #DDE2BC;border-radius:12px;padding:12px 14px}
.card b{display:block;font-size:26px;color:#2F6B57}
.card span{font-size:13px;color:#4A5344}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #DDE2BC;border-radius:10px;overflow:hidden;font-size:14px}
th{text-align:left;background:#EEF0D2;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#6B7463;padding:8px 10px}
td{border-top:1px solid #E8EBD3;padding:8px 10px;vertical-align:top}
del{color:#B0412E;text-decoration:line-through;background:#F6E1DC}
ins{color:#2F7A4F;text-decoration:none;background:#E3F0EA}
.nada{color:#6B7463;font-style:italic}
.aviso{background:#FDEBD8;border-radius:10px;padding:10px 14px;color:#9A5108}
"""


def diff_palavras(a, b):
    a_, b_ = a.split(' '), b.split(' ')
    out = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a_, b_, autojunk=False).get_opcodes():
        if op == 'equal':
            out.append(html.escape(' '.join(a_[i1:i2])))
        if op in ('delete', 'replace'):
            out.append('<del>' + html.escape(' '.join(a_[i1:i2])) + '</del>')
        if op in ('insert', 'replace'):
            out.append('<ins>' + html.escape(' '.join(b_[j1:j2])) + '</ins>')
    return ' '.join(x for x in out if x)


def tabela(titulo, cabecalho, linhas, explicacao=''):
    h = [f'<h2>{html.escape(titulo)} ({len(linhas)})</h2>']
    if explicacao:
        h.append(f'<p class="sub">{explicacao}</p>')
    if not linhas:
        h.append('<p class="nada">Nenhuma.</p>')
        return '\n'.join(h)
    h.append('<table><thead><tr>' + ''.join(f'<th>{c}</th>' for c in cabecalho) + '</tr></thead><tbody>')
    for l in linhas:
        h.append('<tr>' + ''.join(f'<td>{c}</td>' for c in l) + '</tr>')
    h.append('</tbody></table>')
    return '\n'.join(h)


def relatorio(caminho, livro, resumo, mud, aplicado):
    e = html.escape
    titulo = 'O que mudou no Gerador de Cardápio'
    estado = ('Já aplicado no acervo. Falta conferir e publicar.' if aplicado
              else 'Simulação: nada foi gravado ainda.')
    cards = ''.join(f'<div class="card"><b>{v}</b><span>{e(k)}</span></div>' for k, v in resumo)
    partes = [
        f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        f'<title>{titulo}</title><style>{CSS}</style></head><body><main>',
        f'<h1>{titulo}</h1>',
        f'<p class="sub">Livro: <b>{e(livro["arquivo"])}</b> (salvo em {e(livro["livroSalvoEm"] or "data desconhecida")}). '
        f'Comparado em {e(livro["sincronizadoEm"])}. {estado}</p>',
        f'<div class="cards">{cards}</div>',
    ]
    if mud['parecidos']:
        partes.append('<p class="aviso" style="margin-top:18px">Algumas receitas foram ligadas por nome '
                      '<b>parecido</b>. Vale uma olhada na lista "Nome corrigido": se alguma for outra '
                      'receita de verdade, me avise antes de publicar.</p>')
    partes.append(tabela('Receitas novas', ['Seção', 'Receita', 'Padrão', 'Descrição'],
                         [[e(n['categoria']), f'<b>{e(n["nome"])}</b>', ROTULO_PADRAO[n['padrao']], e(n['descricao'])]
                          for n in mud['novas']],
                         'Entram no Gerador com o padrão marcado no livro.'))
    partes.append(tabela('Receitas que saíram do livro', ['Seção', 'Receita', 'Descrição'],
                         [[e(p['categoria']), f'<b>{e(p["nome"])}</b>', e(p.get('descricao', ''))]
                          for p in mud['fora']],
                         'Deixam de ser sugeridas. Cardápios já salvos continuam como estão.'))
    partes.append(tabela('Receitas que voltaram ao livro', ['Seção', 'Receita'],
                         [[e(p['categoria']), f'<b>{e(p["nome"])}</b>'] for p in mud['voltaram']]))
    partes.append(tabela('Nome corrigido', ['Seção', 'Antes e depois', 'Como foi ligada'],
                         [[e(p['categoria']), diff_palavras(a, b), {'parecido': 'nome parecido'}.get(c, 'mesma descrição')]
                          for p, a, b, c in mud['nome']]))
    partes.append(tabela('Padrão trocado', ['Seção', 'Receita', 'Antes', 'Agora'],
                         [[e(p['categoria']), f'<b>{e(p["nome"])}</b>', ROTULO_PADRAO.get(a, a), ROTULO_PADRAO.get(b, b)]
                          for p, a, b in mud['padrao']]))
    partes.append(tabela('Mudou de seção', ['Receita', 'Antes', 'Agora'],
                         [[f'<b>{e(p["nome"])}</b>', e(a), e(b)] for p, a, b in mud['secao']]))
    partes.append(tabela('Descrição alterada', ['Seção', 'Receita', 'O que mudou'],
                         [[e(p['categoria']), f'<b>{e(p["nome"])}</b>', diff_palavras(a, b)]
                          for p, a, b in mud['descricao']]))
    partes.append('</main></body></html>')
    caminho.write_text('\n'.join(partes), encoding='utf-8')


# ------------------------------------------------------------------ principal
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('livro', help='o .docx da versão nova do livro')
    ap.add_argument('--aplicar', action='store_true', help='grava no acervo (sem isto, só simula)')
    ap.add_argument('--forcar', action='store_true', help='aplica mesmo se o livro parecer incompleto')
    args = ap.parse_args()

    caminho = pathlib.Path(args.livro)
    documento, itens = receitas_do_livro(caminho)
    sem_categoria = sorted({it['secao'] for it in itens if not it['categoria']})
    if sem_categoria:
        raise SystemExit(f'Seção do livro sem categoria no acervo: {sem_categoria}. '
                         'Acrescente em CATEGORIA neste script.')

    acervo = json.loads(ACERVO.read_text(encoding='utf-8'))
    preps = acervo['preparacoes']
    do_livro_antes = [p for p in preps if p.get('padrao') and not p.get('foraDoLivro')]

    # Defesa contra .docx errado ou estilo de título trocado: se o livro novo
    # trouxer muito menos receitas que o acervo, algo quebrou na leitura.
    if len(itens) < 0.8 * len(do_livro_antes) and not args.forcar:
        raise SystemExit(f'O livro trouxe {len(itens)} receitas e o acervo tem {len(do_livro_antes)} vindas '
                         'do livro. Parece leitura incompleta (títulos BANCO DE RECEITAS / seções mudaram de '
                         'estilo?). Confira; para aplicar assim mesmo, use --forcar.')

    par, sobra = casar(itens, preps)
    moldes = {}
    for p in preps:
        moldes.setdefault(p['categoria'], p)

    mud = {'novas': [], 'fora': [], 'voltaram': [], 'nome': [], 'padrao': [], 'secao': [],
           'descricao': [], 'parecidos': 0}
    for p in preps:
        if p['id'] in par:
            it, como = par[p['id']]
            if como == 'parecido':
                mud['parecidos'] += 1
            if p.get('foraDoLivro'):
                del p['foraDoLivro']
                mud['voltaram'].append(p)
            if p['categoria'] != it['categoria']:
                mud['secao'].append((p, p['categoria'], it['categoria']))
                molde = moldes[it['categoria']]
                p['categoria'], p['slot'], p['referencia'] = it['categoria'], molde['slot'], molde['referencia']
            if limpo(p['nome']) != it['nome'] and not so_grafia(p['nome'], it['nome']):
                mud['nome'].append((p, limpo(p['nome']), it['nome'], como))
                p['nome'] = it['nome']
            if limpo(p.get('descricao')) != it['descricao'] and not so_grafia(p.get('descricao'), it['descricao']):
                if norm(p.get('descricao')) != norm(it['descricao']):
                    mud['descricao'].append((p, limpo(p.get('descricao')), it['descricao']))
                p['descricao'] = it['descricao']
            if p.get('padrao') != it['padrao']:
                mud['padrao'].append((p, p.get('padrao'), it['padrao']))
                p['padrao'] = it['padrao']
        elif p.get('padrao') and not p.get('foraDoLivro'):
            # veio do livro numa versão anterior e não está mais nele
            p['foraDoLivro'] = True
            mud['fora'].append(p)

    proximo = max(p['id'] for p in preps) + 1
    for it in sobra:
        nova = receita_nova(it, proximo, moldes[it['categoria']])
        mud['novas'].append(nova)
        preps.append(nova)
        proximo += 1

    salvo = documento.core_properties.modified
    sha = hashlib.sha256(caminho.read_bytes()).hexdigest()[:12]
    ativas = [p for p in preps if not p.get('foraDoLivro')]
    livro = {
        'arquivo': caminho.name,
        'livroSalvoEm': salvo.strftime('%Y-%m-%d') if salvo else None,
        'sincronizadoEm': datetime.date.today().isoformat(),
        'receitasNoLivro': len(itens),
        'preparacoesNoGerador': len(ativas),
        'sha256': sha,
    }

    resumo = [
        ('receitas no livro', len(itens)),
        ('novas', len(mud['novas'])),
        ('saíram do livro', len(mud['fora'])),
        ('nome corrigido', len(mud['nome'])),
        ('padrão trocado', len(mud['padrao'])),
        ('descrição alterada', len(mud['descricao'])),
        ('mudou de seção', len(mud['secao'])),
    ]
    destino = caminho.with_name(f'{caminho.stem} - o que mudou no Gerador.html')
    relatorio(destino, livro, resumo, mud, args.aplicar)

    print(f'{len(itens)} receitas no livro {caminho.name}: {dict(Counter(it["padrao"] for it in itens))}')
    for k, v in resumo[1:]:
        print(f'  {k}: {v}')
    if mud['parecidos']:
        print(f'  ({mud["parecidos"]} ligadas por nome parecido: conferir no relatório)')
    print(f'Relatório: {destino}')

    if not args.aplicar:
        print('\nSimulação: nada foi gravado. Rode de novo com --aplicar para gravar.')
        return
    acervo['meta']['livro'] = livro
    acervo['meta']['totalReal'] = len(ativas)
    acervo['meta'].pop('padroesDoLivro', None)
    ACERVO.write_text(json.dumps(acervo, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    VERSAO.write_text(json.dumps(livro, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'\nGravado em {ACERVO.relative_to(RAIZ)} e {VERSAO.relative_to(RAIZ)}.')


if __name__ == '__main__':
    main()
