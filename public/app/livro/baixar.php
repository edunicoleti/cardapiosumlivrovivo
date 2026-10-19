<?php
declare(strict_types=1);

/**
 * Entrega o PDF do livro so para quem esta autenticado.
 *
 * O arquivo fica na pasta de dados, fora do site (arquivoLivroPdf), porque o
 * repositorio e publico: comitar o PDF seria publicar o livro inteiro. Ele
 * sobe pela administracao.
 */
require dirname(__DIR__) . '/lib/acesso.php';
require dirname(__DIR__) . '/lib/tela.php';

exigirLogin();

$caminho = arquivoLivroPdf();
if (!is_readable($caminho)) {
    http_response_code(404);
    abrirTela('Livro indisponível', null);
    ?>
    <h1 style="text-align:center">O PDF ainda não está disponível</h1>
    <p class="sub" style="text-align:center;margin:0 auto 24px">
      Estamos preparando o arquivo. Tente de novo mais tarde.
    </p>
    <p style="text-align:center"><a href="/app/livro/">Voltar</a></p>
    <?php
    fecharTela();
    exit;
}

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="Cardapios-um-livro-vivo.pdf"');
header('Content-Length: ' . (string) filesize($caminho));
header('Cache-Control: private, no-store');
header('X-Content-Type-Options: nosniff');
readfile($caminho);
