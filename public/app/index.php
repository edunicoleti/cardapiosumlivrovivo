<?php
declare(strict_types=1);
require __DIR__ . '/lib/acesso.php';
require __DIR__ . '/lib/tela.php';

// Convite de demonstracao: abre a sessao e limpa o token da barra de endereco,
// para o link nao ficar exposto em print, historico ou compartilhamento de tela.
if (isset($_GET['convite']) && conviteValido((string) $_GET['convite'])) {
    abrirSessaoDeConvite();
    $destino = (string) ($_GET['retorno'] ?? '/app/');
    if ($destino === '' || $destino[0] !== '/' || str_starts_with($destino, '//')) {
        $destino = '/app/';
    }
    header('Location: ' . $destino);
    exit;
}

$erro = '';
$usuario = usuarioLogado();

if ($usuario === null && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $email = (string) ($_POST['email'] ?? '');
    $codigo = (string) ($_POST['codigo'] ?? '');
    if (autenticar($email, $codigo)) {
        // o destino viaja na query, nao no corpo: o campo escondido chegava
        // vazio neste servidor, provavelmente filtrado por parecer um caminho
        $retorno = (string) ($_GET['retorno'] ?? ($_POST['retorno'] ?? '/app/'));
        // so aceita retorno interno, para o formulario nao virar trampolim
        if ($retorno === '' || $retorno[0] !== '/' || str_starts_with($retorno, '//')) {
            $retorno = '/app/';
        }
        header('Location: ' . $retorno);
        exit;
    }
    $erro = 'E-mail ou código não confere. Confira o e-mail usado na compra.';
    registrarLog('acessos-negados.log', ['email' => normalizarEmail($email)]);
}

// ------------------------------------------------------------- nao logado
if ($usuario === null) {
    $retorno = (string) ($_GET['retorno'] ?? '/app/');
    if ($retorno === '' || $retorno[0] !== '/' || str_starts_with($retorno, '//')) {
        $retorno = '/app/';
    }
    $recado = $erro === '' ? '' :
        '<div class="recado erro"><svg aria-hidden="true"><use href="#i-atencao"></use></svg>'
        . '<span>' . e($erro) . '</span></div>';

    renderizarTela([
        'titulo' => 'Entrar',
        'usuario' => null,
        'classeCasca' => ' sem-trilho limpa',
        'classeMain' => 'colado nu',
        'conteudo' => tela('entrar', [
            'RETORNO' => e(rawurlencode($retorno)),
            'EMAIL' => e((string) ($_POST['email'] ?? '')),
            'ERRO' => $recado,
        ]),
    ]);
    exit;
}

// ---------------------------------------------------------------- logado
renderizarTela([
    'titulo' => 'Início',
    'chave' => 'inicio',
    'usuario' => $usuario,
    'topoTitulo' => 'Sua área',
    'conteudo' => tela('inicio', ['VERSAO' => e(versaoDosAssets())]),
]);
