<?php
declare(strict_types=1);

/**
 * Entrega os dados do livro e do assistente. O arquivo em si mora numa pasta
 * que o navegador nao alcanca: so chega aqui quem tem sessao valida.
 */
require __DIR__ . '/lib/acesso.php';

if (usuarioLogado() === null) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['erro' => 'sessao expirada']);
    exit;
}

$permitidos = ['livro' => 'livro.json', 'assistente' => 'assistente.json'];
$chave = (string) ($_GET['arquivo'] ?? '');
if (!isset($permitidos[$chave])) {
    http_response_code(404);
    exit;
}

$caminho = __DIR__ . '/acervo/' . $permitidos[$chave];
if (!is_readable($caminho)) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['erro' => 'conteúdo ainda não publicado']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: private, max-age=3600');
header('X-Content-Type-Options: nosniff');
readfile($caminho);
