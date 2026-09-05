<?php
declare(strict_types=1);
require dirname(__DIR__) . '/lib/acesso.php';
require dirname(__DIR__) . '/lib/tela.php';

$usuario = exigirLogin();
$corpo = tela('livro');
$versao = e(versaoDosAssets());

renderizarTela([
    'titulo' => 'O livro',
    'chave' => 'livro',
    'usuario' => $usuario,
    'topoTitulo' => 'O livro',
    'topoAcoes' => pedacoDoGabarito($corpo, 'topo-acoes'),
    'classeMain' => 'colado',
    'cabeca' => '<link rel="stylesheet" href="/app/assets/livro.css?v=' . $versao . '">',
    'rodape' => '<script src="/app/assets/livro.js?v=' . $versao . '" type="module"></script>',
    'conteudo' => semPedacos($corpo),
]);
