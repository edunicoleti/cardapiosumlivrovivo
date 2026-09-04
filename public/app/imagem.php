<?php
declare(strict_types=1);

/** Serve as imagens do livro so para quem esta autenticado. */
require __DIR__ . '/lib/acesso.php';

if (usuarioLogado() === null) {
    http_response_code(403);
    exit;
}

// basename corta qualquer tentativa de subir de pasta pelo nome do arquivo
$nome = basename((string) ($_GET['f' ] ?? ''));
if ($nome === '' || !preg_match('/^[\w.\-]+\.(jpg|jpeg|png)$/i', $nome)) {
    http_response_code(404);
    exit;
}

$caminho = __DIR__ . '/acervo/imagens/' . $nome;
if (!is_readable($caminho)) {
    http_response_code(404);
    exit;
}

$tipo = strtolower(pathinfo($nome, PATHINFO_EXTENSION)) === 'png' ? 'image/png' : 'image/jpeg';
header('Content-Type: ' . $tipo);
header('Content-Length: ' . (string) filesize($caminho));
header('Cache-Control: private, max-age=86400');
header('X-Content-Type-Options: nosniff');
readfile($caminho);
