<?php
declare(strict_types=1);
require __DIR__ . '/lib/acesso.php';
require __DIR__ . '/lib/tela.php';

$erro = '';
$ok = '';
$codigoGerado = null;

// Na primeira visita ninguem tem senha ainda: quem chega primeiro define a dele.
// Por isso vale abrir esta pagina logo depois de publicar, e nao dias depois.
if (!adminConfigurado()) {
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['definir'])) {
        $senha = (string) ($_POST['senha'] ?? '');
        if (strlen($senha) < 10) {
            $erro = 'Use pelo menos 10 caracteres.';
        } else {
            definirSenhaAdmin($senha);
            autenticarAdmin($senha);
            header('Location: /app/admin.php');
            exit;
        }
    }
    abrirTela('Configurar administração', null);
    ?>
    <h1 style="text-align:center">Definir a senha de administração</h1>
    <p class="sub" style="text-align:center;margin:0 auto 24px">
      Ninguém definiu ainda. A primeira pessoa que abrir esta página escolhe a senha,
      então faça isso agora.
    </p>
    <form class="caixa" method="post">
      <?php if ($erro !== ''): ?><div class="erro"><?= e($erro) ?></div><?php endif; ?>
      <label for="senha">Senha de administração</label>
      <input type="password" id="senha" name="senha" required minlength="10" autocomplete="new-password">
      <button type="submit" name="definir" value="1">Definir senha</button>
    </form>
    <?php
    fecharTela();
    exit;
}

// ------------------------------------------------------------------ login
if (!ehAdmin()) {
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['entrar'])) {
        if (autenticarAdmin((string) ($_POST['senha'] ?? ''))) {
            header('Location: /app/admin.php');
            exit;
        }
        $erro = 'Senha incorreta.';
        registrarLog('admin-negado.log', ['ip' => $_SERVER['REMOTE_ADDR'] ?? '']);
    }
    abrirTela('Administração', null);
    ?>
    <h1 style="text-align:center">Administração</h1>
    <form class="caixa" method="post" style="margin-top:22px">
      <?php if ($erro !== ''): ?><div class="erro"><?= e($erro) ?></div><?php endif; ?>
      <label for="senha">Senha</label>
      <input type="password" id="senha" name="senha" required autocomplete="current-password">
      <button type="submit" name="entrar" value="1">Entrar</button>
    </form>
    <?php
    fecharTela();
    exit;
}

// ------------------------------------------------------------------ acoes
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (isset($_POST['liberar'])) {
        $email = trim((string) ($_POST['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $erro = 'E-mail inválido.';
        } else {
            $codigoGerado = liberarAcesso($email, trim((string) ($_POST['nome'] ?? '')), 'manual');
            $ok = 'Acesso liberado. Envie o código abaixo para a pessoa: ele não aparece de novo.';
        }
    }
    if (isset($_POST['revogar'])) {
        $email = (string) ($_POST['email_revogar'] ?? '');
        $ok = revogarAcesso($email, 'revogado manualmente')
            ? 'Acesso de ' . e($email) . ' revogado.'
            : 'Não encontrei esse e-mail.';
    }
    if (isset($_POST['segredo'])) {
        definirSegredoWebhook(trim((string) ($_POST['webhook_secret'] ?? '')));
        $ok = 'Segredo do webhook salvo.';
    }
}

$lista = compradores();
$ativos = count(array_filter($lista, static fn(array $c): bool => ($c['ativo'] ?? false) === true));

abrirTela('Administração', null);
?>
<h1>Administração</h1>
<p class="sub"><?= count($lista) ?> pessoa(s) cadastrada(s), <?= $ativos ?> com acesso ativo.
   Dados guardados em <code><?= e(pastaDados()) ?></code>.</p>

<?php if ($ok !== ''): ?><div class="ok"><?= $ok ?></div><?php endif; ?>
<?php if ($erro !== ''): ?><div class="erro"><?= e($erro) ?></div><?php endif; ?>

<?php if ($codigoGerado !== null): ?>
  <div class="aviso">
    <strong>Código de <?= e($codigoGerado['email']) ?>:</strong>
    <code style="font-size:1.15em;letter-spacing:.12em"><?= e($codigoGerado['codigo']) ?></code><br>
    Guardamos apenas o hash, então este código não pode ser consultado depois.
    Se a pessoa perder, gere outro liberando o mesmo e-mail de novo.
  </div>
<?php endif; ?>

<div class="cartoes" style="margin-bottom:26px">
  <form class="cartao" method="post">
    <h3>Liberar acesso</h3>
    <p style="margin-bottom:14px">Para quem comprou e ainda não tem código.</p>
    <label for="email">E-mail da compra</label>
    <input type="email" id="email" name="email" required>
    <label for="nome">Nome (opcional)</label>
    <input type="text" id="nome" name="nome">
    <button type="submit" name="liberar" value="1">Gerar código</button>
  </form>

  <form class="cartao" method="post">
    <h3>Revogar acesso</h3>
    <p style="margin-bottom:14px">Use em reembolso ou chargeback. O cadastro permanece.</p>
    <label for="email_revogar">E-mail</label>
    <input type="email" id="email_revogar" name="email_revogar" required>
    <button type="submit" name="revogar" value="1" class="secundario" style="width:100%">Revogar</button>
  </form>

  <form class="cartao" method="post">
    <h3>Segredo do webhook</h3>
    <p style="margin-bottom:14px">O mesmo valor configurado na Cakto, em Integrações.</p>
    <label for="webhook_secret">Segredo</label>
    <input type="text" id="webhook_secret" name="webhook_secret"
           value="<?= e(segredoWebhook()) ?>">
    <button type="submit" name="segredo" value="1" class="secundario" style="width:100%">Salvar</button>
  </form>
</div>

<h2>Quem tem acesso</h2>
<div class="rolagem" style="margin-top:10px">
  <table>
    <thead><tr><th>E-mail</th><th>Nome</th><th>Situação</th><th>Origem</th><th>Último acesso</th></tr></thead>
    <tbody>
    <?php if (!$lista): ?>
      <tr><td colspan="5" style="color:var(--tinta-fr)">Ninguém cadastrado ainda.</td></tr>
    <?php endif; ?>
    <?php foreach (array_reverse($lista) as $c): ?>
      <tr>
        <td><?= e($c['email'] ?? '') ?></td>
        <td><?= e($c['nome'] ?? '') ?></td>
        <td><?= ($c['ativo'] ?? false) ? 'ativo' : 'revogado' ?></td>
        <td><?= e($c['origem'] ?? '') ?></td>
        <td><?= e($c['ultimo_acesso'] ? date('d/m/Y H:i', strtotime($c['ultimo_acesso'])) : 'nunca') ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php
fecharTela();
