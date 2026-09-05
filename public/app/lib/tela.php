<?php
declare(strict_types=1);

/**
 * Casca visual compartilhada pelas telas da plataforma.
 *
 * O HTML mora em arquivos, não em strings dentro do PHP: a casca em casca.html
 * e cada tela em telas/*.html. Isso mantém a marcação legível e permite abrir
 * as telas fora do servidor durante o desenvolvimento, já que nenhuma delas
 * depende do PHP para existir.
 */

function e(?string $texto): string
{
    return htmlspecialchars((string) $texto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Muda quando o CSS ou o JS mudam, para o navegador não servir versão velha. */
function versaoDosAssets(): string
{
    static $versao = null;
    if ($versao === null) {
        $marcas = [];
        foreach (glob(dirname(__DIR__) . '/assets/*') ?: [] as $arquivo) {
            $marcas[] = (int) @filemtime($arquivo);
        }
        $versao = $marcas === [] ? '1' : (string) max($marcas);
    }
    return $versao;
}

/** Lê um arquivo de marcação e troca os {{TOKENS}} pelos valores dados. */
function montarHtml(string $caminho, array $tokens): string
{
    $bruto = @file_get_contents($caminho);
    if ($bruto === false) {
        return '';
    }
    return trocarTokens($bruto, $tokens);
}

function trocarTokens(string $html, array $tokens): string
{
    $de = [];
    foreach ($tokens as $chave => $valor) {
        $de['{{' . $chave . '}}'] = (string) $valor;
    }
    return strtr($html, $de);
}

/** Corta um pedaço marcado com <!--{nome}--> ... <!--{/nome}--> do gabarito. */
function pedacoDoGabarito(string $html, string $nome): string
{
    $ini = strpos($html, '<!--{' . $nome . '}-->');
    $fim = strpos($html, '<!--{/' . $nome . '}-->');
    if ($ini === false || $fim === false) {
        return '';
    }
    $ini += strlen('<!--{' . $nome . '}-->');
    return trim(substr($html, $ini, $fim - $ini));
}

/** Remove do HTML os pedacos marcados com <!--{nome}--> ... <!--{/nome}-->. */
function semPedacos(string $html): string
{
    return (string) preg_replace('/<!--\{[^}]*\}-->.*?<!--\{\/[^}]*\}-->/s', '', $html);
}

/** Carrega o corpo de uma tela (telas/<nome>.html) já com os tokens trocados. */
function tela(string $nome, array $tokens = []): string
{
    return montarHtml(__DIR__ . '/telas/' . $nome . '.html', $tokens);
}

/** Os três destinos da plataforma, na ordem em que aparecem na navegação. */
function destinos(): array
{
    return [
        ['chave' => 'inicio', 'url' => '/app/', 'rotulo' => 'Início',
         'curto' => 'Início', 'icone' => 'i-casa', 'desc' => 'Seu painel'],
        ['chave' => 'livro', 'url' => '/app/livro/', 'rotulo' => 'O livro',
         'curto' => 'Livro', 'icone' => 'i-livro', 'desc' => 'Ler e buscar'],
        ['chave' => 'assistente', 'url' => '/app/assistente/', 'rotulo' => 'Assistente de cardápio',
         'curto' => 'Cardápio', 'icone' => 'i-cardapio', 'desc' => 'Montar a semana'],
    ];
}

/**
 * Monta a página inteira.
 *
 * Chaves aceitas: titulo, chave, usuario, topoTitulo, topoAcoes, classeMain,
 * cabeca, rodape, conteudo.
 */
function renderizarTela(array $opcoes): void
{
    $gabarito = (string) @file_get_contents(__DIR__ . '/casca.html');
    $usuario = $opcoes['usuario'] ?? null;
    $atual = (string) ($opcoes['chave'] ?? '');

    $modeloTrilho = pedacoDoGabarito($gabarito, 'item-trilho');
    $modeloAbas = pedacoDoGabarito($gabarito, 'item-abas');
    $modeloQuem = pedacoDoGabarito($gabarito, 'quem');
    $gabarito = (string) preg_replace('/<!--\{[^}]*\}-->.*?<!--\{\/[^}]*\}-->/s', '', $gabarito);

    $navTrilho = '';
    $navAbas = '';
    if ($usuario !== null) {
        foreach (destinos() as $d) {
            $comuns = [
                'URL' => e($d['url']),
                'ICONE' => e($d['icone']),
                'ROTULO' => e($d['rotulo']),
                'CURTO' => e($d['curto']),
                'DESC' => e($d['desc']),
                'ATUAL' => $d['chave'] === $atual ? ' aria-current="page"' : '',
            ];
            $navTrilho .= trocarTokens($modeloTrilho, $comuns) . "\n";
            $navAbas .= trocarTokens($modeloAbas, $comuns) . "\n";
        }
    }

    $nome = '';
    if ($usuario !== null) {
        $nome = trim((string) ($usuario['nome'] ?? ''));
        if ($nome === '') {
            $nome = (string) ($usuario['email'] ?? '');
        }
    }
    $quem = $usuario === null ? '' : trocarTokens($modeloQuem, [
        'INICIAL' => e(mb_strtoupper(mb_substr($nome, 0, 1))),
        'NOME' => e($nome),
    ]);

    echo trocarTokens($gabarito, [
        'TITULO' => e((string) ($opcoes['titulo'] ?? 'Plataforma')),
        'VERSAO' => e(versaoDosAssets()),
        'CABECA' => (string) ($opcoes['cabeca'] ?? ''),
        'RODAPE' => (string) ($opcoes['rodape'] ?? ''),
        'CLASSE_CASCA' => (string) ($opcoes['classeCasca'] ?? ($usuario === null ? ' sem-trilho' : '')),
        'CLASSE_MAIN' => (string) ($opcoes['classeMain'] ?? ''),
        'NAV_TRILHO' => $navTrilho,
        'NAV_ABAS' => $navAbas,
        'QUEM' => $quem,
        'TOPO_TITULO' => e((string) ($opcoes['topoTitulo'] ?? ($opcoes['titulo'] ?? ''))),
        'TOPO_ACOES' => (string) ($opcoes['topoAcoes'] ?? ''),
        'CONTEUDO' => (string) ($opcoes['conteudo'] ?? ''),
    ]);
}

/**
 * Compatibilidade com as telas antigas (administração e simulação de compra),
 * que imprimem o conteúdo direto em vez de devolver uma string.
 */
function abrirTela(string $titulo, ?array $usuario = null, string $atual = ''): void
{
    $GLOBALS['__tela'] = ['titulo' => $titulo, 'usuario' => $usuario, 'chave' => $atual];
    ob_start();
}

function fecharTela(): void
{
    $conteudo = (string) ob_get_clean();
    $abertura = $GLOBALS['__tela'] ?? ['titulo' => 'Plataforma', 'usuario' => null, 'chave' => ''];
    renderizarTela($abertura + [
        'classeMain' => 'legado',
        'conteudo' => '<div class="faixa estreita">' . $conteudo . '</div>',
    ]);
}
