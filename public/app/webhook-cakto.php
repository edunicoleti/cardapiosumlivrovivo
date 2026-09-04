<?php
declare(strict_types=1);

/**
 * Recebe o aviso de compra da Cakto e libera ou revoga acesso.
 *
 * PENDENTE: o mapeamento dos campos. A Cakto envia o payload no formato dela e
 * eu ainda nao vi um exemplo real, entao a leitura abaixo tenta os nomes mais
 * provaveis e, quando nao encontra, grava o corpo inteiro em
 * webhook-nao-mapeado.log. Basta abrir esse arquivo depois da primeira compra
 * de teste para descobrir os nomes certos e ajustar CAMPOS_EMAIL/NOME/EVENTO.
 *
 * SEGURANCA: o "secret" da Cakto nao e assinatura HMAC, e sim um valor que volta
 * dentro do proprio payload. Isso significa que quem descobrir esta URL pode
 * forjar uma compra. Por isso o segredo e conferido em tempo constante e, quando
 * nao confere, nada e liberado. Assim que houver token de API, o passo seguinte
 * e confirmar a transacao na Cakto antes de liberar.
 */
require __DIR__ . '/lib/acesso.php';

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'use POST']);
    exit;
}

$bruto = file_get_contents('php://input') ?: '';
$dados = json_decode($bruto, true);
if (!is_array($dados)) {
    // algumas plataformas mandam form-urlencoded em vez de JSON
    $dados = $_POST;
}

/** Procura uma chave em qualquer profundidade do payload. */
function buscar(array $dados, array $chaves): ?string
{
    foreach ($chaves as $chave) {
        foreach ($dados as $k => $v) {
            if (is_array($v)) {
                $achado = buscar($v, [$chave]);
                if ($achado !== null) {
                    return $achado;
                }
            } elseif (strcasecmp((string) $k, $chave) === 0 && is_scalar($v) && (string) $v !== '') {
                return (string) $v;
            }
        }
    }
    return null;
}

const CAMPOS_SEGREDO = ['secret', 'segredo', 'token'];
const CAMPOS_EMAIL   = ['email', 'customer_email', 'buyer_email', 'e-mail'];
const CAMPOS_NOME    = ['name', 'nome', 'customer_name', 'buyer_name'];
const CAMPOS_EVENTO  = ['event', 'evento', 'status', 'type', 'tipo'];

$segredoEsperado = segredoWebhook();
$segredoRecebido = buscar($dados, CAMPOS_SEGREDO) ?? '';

if ($segredoEsperado === '' || !hash_equals($segredoEsperado, $segredoRecebido)) {
    registrarLog('webhook-recusado.log', [
        'motivo' => $segredoEsperado === '' ? 'segredo nao configurado no admin' : 'segredo nao confere',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ]);
    http_response_code(403);
    echo json_encode(['erro' => 'segredo invalido']);
    exit;
}

$email = buscar($dados, CAMPOS_EMAIL);
$nome = buscar($dados, CAMPOS_NOME) ?? '';
$evento = strtolower(buscar($dados, CAMPOS_EVENTO) ?? '');

if ($email === null || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    registrarLog('webhook-nao-mapeado.log', ['corpo' => $bruto]);
    http_response_code(202);
    echo json_encode(['aviso' => 'recebido, mas nao achei o e-mail no payload']);
    exit;
}

$liberadores = ['aprovad', 'approved', 'paid', 'pago', 'complet', 'purchase'];
$revogadores = ['reembols', 'refund', 'chargeback', 'estorn', 'cancel'];

$acao = 'ignorado';
foreach ($revogadores as $marca) {
    if (str_contains($evento, $marca)) {
        revogarAcesso($email, 'cakto: ' . $evento);
        $acao = 'revogado';
        break;
    }
}
if ($acao === 'ignorado') {
    foreach ($liberadores as $marca) {
        if (str_contains($evento, $marca)) {
            // o codigo em texto claro so existe aqui; fica no log para a Lucia
            // reenviar caso a entrega automatica ainda nao esteja pronta
            $resultado = liberarAcesso($email, $nome, 'cakto: ' . $evento);
            registrarLog('acessos-liberados.log', $resultado);
            $acao = 'liberado';
            break;
        }
    }
}

if ($acao === 'ignorado') {
    registrarLog('webhook-nao-mapeado.log', ['evento' => $evento, 'corpo' => $bruto]);
}

registrarLog('webhook.log', ['evento' => $evento, 'email' => $email, 'acao' => $acao]);
echo json_encode(['ok' => true, 'acao' => $acao]);
