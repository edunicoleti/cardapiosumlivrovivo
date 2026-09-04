<?php
declare(strict_types=1);

/**
 * Checkout de mentira, para a equipe testar o caminho da compra sem gastar
 * dinheiro e sem depender da Cakto estar configurada.
 *
 * Duas decisoes que valem registrar:
 *
 * 1. Exige sessao de admin. Uma pagina que concede acesso a um produto pago nao
 *    pode depender so de um caminho dificil de adivinhar: se o endereco vazar,
 *    ela vira uma torneira aberta. Caminho obscuro e a segunda camada, nao a
 *    primeira.
 *
 * 2. Nao chama liberarAcesso() direto. Monta um payload no formato que a Cakto
 *    deve mandar e entrega ao proprio webhook-cakto.php. Assim o teste exercita
 *    a integracao inteira, e nao um atalho que funciona so aqui.
 */
require __DIR__ . '/lib/acesso.php';
require __DIR__ . '/lib/tela.php';

if (!ehAdmin()) {
    abrirTela('Simulação de compra', null);
    ?>
    <h1 style="text-align:center">Área da equipe</h1>
    <p class="sub" style="text-align:center;margin:0 auto 22px">
      Esta página simula uma compra e libera acesso de verdade. Por isso pede a
      senha de administração.
    </p>
    <div style="text-align:center">
      <a href="/app/admin.php" style="display:inline-block;background:var(--laranja);color:#fff;
         text-decoration:none;font-weight:600;padding:11px 20px;border-radius:8px">Entrar como admin</a>
    </div>
    <?php
    fecharTela();
    exit;
}

const PRODUTO = 'Cardápios: Um Livro Vivo';
const VALOR = '160.00';

$resultado = null;
$erro = '';
$payloadEnviado = null;
$respostaWebhook = null;
$viaWebhook = false;

/** Entrega o payload ao proprio webhook, como a Cakto faria. */
function chamarWebhook(array $payload): ?array
{
    $url = (($_SERVER['HTTPS'] ?? '') !== '' && $_SERVER['HTTPS'] !== 'off' ? 'https://' : 'http://')
        . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/app/webhook-cakto.php';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    $corpo = curl_exec($ch);
    $codigo = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $falha = curl_error($ch);
    curl_close($ch);

    if ($corpo === false || $codigo === 0) {
        return ['falhou' => true, 'motivo' => $falha !== '' ? $falha : 'sem resposta'];
    }
    return ['http' => $codigo, 'corpo' => $corpo];
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    // gerar segredo, se ainda nao existir, para o webhook poder aceitar
    if (isset($_POST['gerar_segredo'])) {
        definirSegredoWebhook(bin2hex(random_bytes(16)));
        header('Location: /app/simular-compra-7d3e5a.php?segredo=1');
        exit;
    }

    $email = trim((string) ($_POST['email'] ?? ''));
    $nome = trim((string) ($_POST['nome'] ?? ''));
    $evento = (string) ($_POST['evento'] ?? 'purchase_approved');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erro = 'Informe um e-mail válido.';
    } elseif (segredoWebhook() === '') {
        $erro = 'Nenhum segredo de webhook configurado ainda. Gere um abaixo antes de simular.';
    } else {
        // formato aproximado do que a Cakto deve enviar; quando o payload real
        // aparecer, so os nomes dos campos mudam
        $payloadEnviado = [
            'event' => $evento,
            'secret' => segredoWebhook(),
            'data' => [
                'id' => 'sim_' . bin2hex(random_bytes(6)),
                'amount' => VALOR,
                'product' => ['name' => PRODUTO],
                'customer' => ['name' => $nome, 'email' => $email],
            ],
            'simulado' => true,
        ];

        $respostaWebhook = chamarWebhook($payloadEnviado);

        if ($respostaWebhook !== null && empty($respostaWebhook['falhou'])) {
            $viaWebhook = true;
        } else {
            // hospedagem que bloqueia a propria origem: cai para a chamada direta,
            // mas o aviso deixa claro que o webhook nao foi exercitado
            if (str_contains($evento, 'refund') || str_contains($evento, 'chargeback')) {
                revogarAcesso($email, 'simulado: ' . $evento);
            } else {
                $resultado = liberarAcesso($email, $nome, 'simulado direto');
            }
        }

        // o codigo em texto claro so existe no log; aqui ele e lido de volta
        if ($viaWebhook && !str_contains($evento, 'refund') && !str_contains($evento, 'chargeback')) {
            $log = pastaDados() . '/acessos-liberados.log';
            if (is_readable($log)) {
                $linhas = array_filter(explode("\n", (string) file_get_contents($log)));
                $ultima = json_decode((string) end($linhas), true);
                if (is_array($ultima) && normalizarEmail((string) ($ultima['email'] ?? '')) === normalizarEmail($email)) {
                    $resultado = $ultima;
                }
            }
        }
    }
}

abrirTela('Simulação de compra', null);
?>
<style>
  .checkout{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
  .produto{background:var(--verde-prof);color:#fff;border-radius:12px;padding:24px}
  .produto h3{font-family:var(--display);font-size:1.25rem;margin-bottom:6px;color:#fff}
  .produto .preco{font-family:var(--display);font-size:2.1rem;font-weight:700;margin:14px 0 4px}
  .produto .obs{font-size:12.5px;color:#9FC4B6}
  .produto ul{list-style:none;margin-top:16px;font-size:13.5px;color:#CFE3DA}
  .produto li{padding:4px 0}
  .selo-fake{display:inline-block;background:var(--laranja);color:#fff;font-size:10.5px;
             font-weight:700;letter-spacing:.09em;text-transform:uppercase;
             padding:3px 9px;border-radius:999px;margin-bottom:10px}
  pre{background:var(--creme-cl);border:1px solid var(--linha);border-radius:8px;padding:14px;
      overflow-x:auto;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.5}
  @media(max-width:760px){.checkout{grid-template-columns:1fr}}
</style>

<h1>Simulação de compra</h1>
<p class="sub">
  Um checkout de mentira para a equipe percorrer o caminho inteiro sem gastar nada.
  Ele não é um atalho: monta um payload no formato da Cakto e entrega ao webhook
  de verdade, então o que você testa aqui é a mesma engrenagem que vai rodar na
  primeira venda real.
</p>

<?php if (isset($_GET['segredo'])): ?>
  <div class="ok">Segredo do webhook gerado. Copie de <a href="/app/admin.php">Administração</a>
    e use o mesmo valor ao configurar o webhook na Cakto.</div>
<?php endif; ?>
<?php if ($erro !== ''): ?><div class="erro"><?= e($erro) ?></div><?php endif; ?>

<?php if ($resultado !== null): ?>
  <div class="ok">
    <strong>Compra simulada com sucesso<?= $viaWebhook ? ' pelo webhook' : ' (chamada direta)' ?>.</strong><br>
    Acesso liberado para <?= e((string) $resultado['email']) ?>.
    Código: <code style="font-size:1.15em;letter-spacing:.12em"><?= e((string) $resultado['codigo']) ?></code><br>
    Entre em <a href="/app/">/app/</a> com esse e-mail e código para ver a plataforma
    como o comprador vê.
  </div>
  <?php if (!$viaWebhook): ?>
    <div class="aviso">
      O servidor não conseguiu chamar o próprio webhook, então liberei o acesso
      direto. O fluxo terminou, mas o <code>webhook-cakto.php</code> não foi
      exercitado: quando a Cakto chamar de fora, ainda é preciso conferir.
    </div>
  <?php endif; ?>
<?php elseif ($respostaWebhook !== null && empty($respostaWebhook['falhou'])): ?>
  <div class="ok">
    Webhook respondeu <?= e((string) $respostaWebhook['http']) ?>:
    <code><?= e((string) $respostaWebhook['corpo']) ?></code>
  </div>
<?php endif; ?>

<div class="checkout">
  <div class="produto">
    <span class="selo-fake">Simulação · não cobra nada</span>
    <h3><?= e(PRODUTO) ?></h3>
    <div class="obs">E-book completo e assistente de cardápio</div>
    <div class="preco">R$ 160,00</div>
    <div class="obs">à vista no PIX ou em até 12x no cartão</div>
    <ul>
      <li>Livro completo com busca</li>
      <li>Assistente de cardápio</li>
      <li>Novas edições incluídas</li>
    </ul>
  </div>

  <form class="cartao" method="post">
    <h3 style="font-family:var(--display);color:var(--teal);margin-bottom:14px">Dados do comprador</h3>
    <label for="nome">Nome</label>
    <input type="text" id="nome" name="nome" placeholder="Maria da Silva" required>
    <label for="email">E-mail</label>
    <input type="email" id="email" name="email" placeholder="maria@exemplo.com.br" required>
    <label for="evento">O que simular</label>
    <select id="evento" name="evento" style="width:100%;font-family:var(--corpo);font-size:15px;
            padding:10px 12px;border:1px solid var(--linha);border-radius:8px;margin-bottom:16px">
      <option value="purchase_approved">Compra aprovada, libera acesso</option>
      <option value="pix_generated">PIX gerado, ainda não pago</option>
      <option value="refund">Reembolso, revoga acesso</option>
      <option value="chargeback">Chargeback, revoga acesso</option>
    </select>
    <button type="submit">Simular compra</button>
  </form>
</div>

<?php if (segredoWebhook() === ''): ?>
  <form method="post" style="margin-top:22px">
    <div class="aviso" style="margin-bottom:12px">
      O webhook recusa qualquer chamada enquanto não houver segredo configurado.
      Gere um agora: depois use o mesmo valor ao criar o webhook na Cakto.
    </div>
    <button type="submit" name="gerar_segredo" value="1" class="secundario">Gerar segredo do webhook</button>
  </form>
<?php endif; ?>

<?php if ($payloadEnviado !== null): ?>
  <h2 style="margin-top:30px">O que foi enviado ao webhook</h2>
  <p class="sub" style="margin-bottom:10px">
    É o formato que eu suponho que a Cakto use. Quando a primeira venda real
    chegar, compare com este exemplo: se os nomes dos campos diferirem, é só
    ajustar o mapeamento no <code>webhook-cakto.php</code>.
  </p>
  <pre><?= e(json_encode($payloadEnviado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) ?></pre>
<?php endif; ?>

<p style="margin-top:26px;font-size:13px;color:var(--tinta-fr)">
  As pessoas criadas aqui aparecem em <a href="/app/admin.php">Administração</a> com
  origem começando em <code>simulado</code> ou <code>cakto:</code>, então dá para
  distinguir teste de venda real e revogar depois.
</p>
<?php
fecharTela();
