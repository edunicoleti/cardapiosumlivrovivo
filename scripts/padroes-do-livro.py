"""
Leva para o acervo do Gerador de Cardápio a classificação de padrão que a
autora marcou no próprio livro (.docx), receita por receita, no Banco de
Receitas: P (popular), M (médio) e L (liberal, de luxo ou executivo).

Faz três coisas em public/app/acervo/assistente.json:
  1. grava o campo `padrao` de cada preparação que achar no livro;
  2. acrescenta as receitas que o livro tem e o acervo ainda não tem
     (com id novo, depois do maior id atual);
  3. lista o que ficou sem par dos dois lados, para conferir à mão.

Preparação sem `padrao` continua com a classificação provisória por custo
dos ingredientes (nivelDoPrato em public/app/assets/assistente.js).

Uso:
  python scripts/padroes-do-livro.py "LIVRO VIVO.docx"
  python scripts/padroes-do-livro.py "LIVRO VIVO.docx" --simular

Precisa de python-docx (pip install python-docx).

ATENÇÃO: este repositório é público. O .docx é o livro inteiro e não deve
ser comitado.
"""
import argparse
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
VALOR = {'P': 'popular', 'M': 'medio', 'L': 'luxo'}


def norm(s):
    s = unicodedata.normalize('NFD', s or '')
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()
    s = re.sub(r"[’'`]", '', s)
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


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
                itens.append({'secao': secao, 'categoria': CATEGORIA.get(norm(secao)),
                              'nome': nome, 'descricao': desc, 'padrao': VALOR[cs[i]]})
    return itens


def casar(itens, preparacoes):
    por_cat = {}
    for p in preparacoes:
        por_cat.setdefault(p['categoria'], []).append(p)
    par, sobra = {}, []
    # 1ª passada: mesmo nome na mesma categoria
    for it in itens:
        n = norm(it['nome'])
        cand = [p for p in por_cat.get(it['categoria'], []) if p['id'] not in par and norm(p['nome']) == n]
        if cand:
            par[cand[0]['id']] = it
        else:
            sobra.append(it)
    # 2ª passada: o livro rebatizou (ex.: "Bolonhesa" virou "Macarrão à bolonhesa"),
    # mas a descrição continua a mesma
    resto = []
    for it in sobra:
        d = norm(it['descricao'])
        cand = [p for p in por_cat.get(it['categoria'], [])
                if p['id'] not in par and d and norm(p.get('descricao')) == d]
        if len(cand) == 1:
            par[cand[0]['id']] = it
        else:
            resto.append(it)
    return par, resto


def receita_nova(it, pid, molde):
    texto = norm(f"{it['nome']} {it['descricao']}")
    metodo = next((m for chave, m in METODOS if chave in texto), None)
    return {'id': pid, 'slot': molde['slot'], 'referencia': molde['referencia'],
            'categoria': it['categoria'], 'nome': it['nome'], 'metodo': metodo,
            'descricao': it['descricao']}


ap = argparse.ArgumentParser()
ap.add_argument('livro')
ap.add_argument('--simular', action='store_true', help='mostra o resultado sem gravar')
args = ap.parse_args()

itens = receitas_do_livro(args.livro)
sem_categoria = {it['secao'] for it in itens if not it['categoria']}
if sem_categoria:
    raise SystemExit(f'Seção do livro sem categoria no acervo: {sorted(sem_categoria)}')

acervo = json.loads(ACERVO.read_text(encoding='utf-8'))
preps = acervo['preparacoes']
par, novas = casar(itens, preps)

mudou = 0
for p in preps:
    if p['id'] in par and p.get('padrao') != par[p['id']]['padrao']:
        p['padrao'] = par[p['id']]['padrao']
        mudou += 1

proximo = max(p['id'] for p in preps) + 1
moldes = {}
for p in preps:
    moldes.setdefault(p['categoria'], p)
acrescentadas = []
for it in novas:
    nova = receita_nova(it, proximo, moldes[it['categoria']])
    nova['padrao'] = it['padrao']
    acrescentadas.append(nova)
    proximo += 1
preps.extend(acrescentadas)

print(f'{len(itens)} receitas marcadas no livro: {dict(Counter(it["padrao"] for it in itens))}')
print(f'{len(par)} casadas com o acervo, {mudou} com padrão novo ou trocado.')
print(f'{len(acrescentadas)} receitas novas acrescentadas:')
for n in acrescentadas:
    print(f'  {n["id"]} [{n["padrao"]}] {n["categoria"]}: {n["nome"][:70]}')
sem_par = [p for p in preps if 'padrao' not in p]
print(f'{len(sem_par)} preparações do acervo ficaram sem marca do livro (seguem na regra provisória):')
for p in sem_par:
    print(f'  {p["id"]} {p["categoria"]}: {p["nome"][:70]}')

if args.simular:
    print('\nSimulação: nada foi gravado.')
else:
    acervo['meta']['padroesDoLivro'] = pathlib.Path(args.livro).name
    acervo['meta']['totalReal'] = len(preps)
    ACERVO.write_text(json.dumps(acervo, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'\nGravado em {ACERVO.relative_to(RAIZ)}.')
