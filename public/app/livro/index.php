<?php
declare(strict_types=1);
require dirname(__DIR__) . '/lib/acesso.php';
require dirname(__DIR__) . '/lib/tela.php';

$usuario = exigirLogin();
$versao = e(versaoDosAssets());

renderizarTela([
    'titulo' => 'O livro',
    'chave' => 'livro',
    'usuario' => $usuario,
    'topoTitulo' => 'O livro',
    'classeMain' => 'colado',
    'cabeca' => '<link rel="stylesheet" href="/app/assets/livro.css?v=' . $versao . '">',
    'conteudo' => tela('livro'),
]);
