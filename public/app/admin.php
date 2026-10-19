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
// Envio maior que post_max_size chega com $_POST vazio: sem este aviso o
// formulario do PDF simplesmente nao fazia nada.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && !$_POST && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    $erro = 'O arquivo passou do limite de envio do servidor (' . ini_get('post_max_size') . ').';
}
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
    if (isset($_POST['enviar_pdf'])) {
        $envio = $_FILES['pdf'] ?? null;
        $codigo = (int) ($envio['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($codigo === UPLOAD_ERR_INI_SIZE || $codigo === UPLOAD_ERR_FORM_SIZE) {
            $erro = 'O arquivo passou do limite de envio do servidor (' . ini_get('upload_max_filesize') . ').';
        } elseif ($codigo !== UPLOAD_ERR_OK || !is_uploaded_file((string) $envio['tmp_name'])) {
            $erro = 'O envio não chegou inteiro. Tente de novo.';
        } elseif ((string) file_get_contents((string) $envio['tmp_name'], false, null, 0, 5) !== '%PDF-') {
            $erro = 'Esse arquivo não é um PDF.';
        } else {
            // grava ao lado e troca de nome: quem estiver baixando o antigo nao recebe meio arquivo
            $destino = arquivoLivroPdf();
            if (move_uploaded_file((string) $envio['tmp_name'], $destino . '.novo') && rename($destino . '.novo', $destino)) {
                $ok = 'PDF do livro atualizado.';
            } else {
                $erro = 'Não consegui gravar o PDF em ' . pastaDados() . '.';
            }
        }
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

  <form class="cartao" method="post" enctype="multipart/form-data">
    <h3>PDF do livro</h3>
    <?php $pdf = arquivoLivroPdf(); ?>
    <p style="margin-bottom:14px">
      <?php if (is_readable($pdf)): ?>
        No ar: <?= e(number_format(filesize($pdf) / 1048576, 1, ',', '.')) ?> MB,
        enviado em <?= e(date('d/m/Y H:i', (int) filemtime($pdf))) ?>.
      <?php else: ?>
        Nenhum PDF enviado ainda: o botão de download do livro mostra um aviso.
      <?php endif; ?>
      Limite do servidor: <?= e((string) ini_get('upload_max_filesize')) ?>.
    </p>
    <label for="pdf">Arquivo PDF</label>
    <input type="file" id="pdf" name="pdf" accept="application/pdf" required>
    <button type="submit" name="enviar_pdf" value="1" class="secundario" style="width:100%">Enviar</button>
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

<div class="aviso" style="margin-bottom:22px">
  <strong>Para testar sem gastar:</strong>
  <a href="/app/simular-compra-7d3e5a.php">simulação de compra</a>.
  Ela monta um payload no formato da Cakto e entrega ao webhook de verdade,
  então exercita a mesma engrenagem da venda real.
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
