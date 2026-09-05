<?php
declare(strict_types=1);
require dirname(__DIR__) . '/lib/acesso.php';
require dirname(__DIR__) . '/lib/tela.php';

$usuario = exigirLogin();
$corpo = tela('assistente');
$versao = e(versaoDosAssets());

renderizarTela([
    'titulo' => 'Assistente de cardápio',
    'chave' => 'assistente',
    'usuario' => $usuario,
    'topoTitulo' => 'Assistente',
    'topoAcoes' => pedacoDoGabarito($corpo, 'topo-acoes'),
    'classeMain' => 'colado',
    'cabeca' => '<link rel="stylesheet" href="/app/assets/assistente.css?v=' . $versao . '">',
    'rodape' => '<script src="/app/assets/assistente.js?v=' . $versao . '" type="module"></script>',
    'conteudo' => semPedacos($corpo),
]);
