<?php
declare(strict_types=1);
require __DIR__ . '/lib/acesso.php';
require __DIR__ . '/lib/tela.php';

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
    abrirTela('Entrar', null);
    ?>
    <h1 style="text-align:center">Sua área do Livro Vivo</h1>
    <p class="sub" style="text-align:center;margin:0 auto 26px">
      Entre com o e-mail da compra e o código de acesso que você recebeu.
    </p>
    <form class="caixa" method="post" action="/app/?retorno=<?= e(rawurlencode($retorno)) ?>">
      <?php if ($erro !== ''): ?><div class="erro"><?= e($erro) ?></div><?php endif; ?>
      <label for="email">E-mail da compra</label>
      <input type="email" id="email" name="email" required autocomplete="email"
             value="<?= e((string) ($_POST['email'] ?? '')) ?>">
      <label for="codigo">Código de acesso</label>
      <input type="text" id="codigo" name="codigo" required autocomplete="one-time-code"
             placeholder="XXXXXXXX" maxlength="16">
      <button type="submit">Entrar</button>
    </form>
    <p style="text-align:center;font-size:13px;color:var(--tinta-fr);margin-top:18px">
      Perdeu o código? Responda o e-mail da compra que reenviamos.
    </p>
    <?php
    fecharTela();
    exit;
}

// ---------------------------------------------------------------- logado
abrirTela('Início', $usuario, 'inicio');
$primeiroNome = trim(explode(' ', (string) $usuario['nome'])[0] ?? '');
?>
<h1>Olá<?= $primeiroNome !== '' ? ', ' . e($primeiroNome) : '' ?>.</h1>
<p class="sub">
  Tudo o que você comprou fica aqui. O livro completo para consultar e o assistente
  que monta o cardápio da semana seguindo as regras do capítulo VI.
</p>

<div class="cartoes">
  <div class="cartao">
    <h3>O livro</h3>
    <p>Os onze capítulos, o glossário e os anexos, com busca em todo o conteúdo.
       Encontre um fator de correção ou um termo técnico sem folhear nada.</p>
    <a class="acao" href="/app/livro/">Abrir o livro</a>
  </div>
  <div class="cartao">
    <h3>Assistente de cardápio</h3>
    <p>Monta a semana a partir do seu serviço, escolhendo dentro das preparações
       do livro e mostrando qual regra determinou cada prato.</p>
    <a class="acao" href="/app/assistente/">Montar um cardápio</a>
  </div>
</div>
<?php
fecharTela();
