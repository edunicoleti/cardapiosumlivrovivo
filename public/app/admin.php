<?php
declare(strict_types=1);
require __DIR__ . '/lib/acesso.php';
require __DIR__ . '/lib/tela.php';

$erro = '';
$ok = '';
$codigoGerado = null;
$codigoRecuperacao = null;
$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

/** Entrada da administracao, no layout da entrada dos compradores. */
function telaDeEntradaAdmin(string $pedaco, string $titulo, string $erro = '', string $aviso = ''): void
{
    $recado = '';
    if ($erro !== '') {
        $recado = '<div class="recado erro"><svg aria-hidden="true"><use href="#i-atencao"></use></svg>'
            . '<span>' . e($erro) . '</span></div>';
    } elseif ($aviso !== '') {
        $recado = '<div class="recado ok"><span>' . e($aviso) . '</span></div>';
    }
    $gabarito = tela('admin-entrar', ['RECADO' => $recado]);
    renderizarTela([
        'titulo' => $titulo,
        'usuario' => null,
        'classeCasca' => ' sem-trilho limpa',
        'classeMain' => 'colado nu',
        'conteudo' => str_replace('<!--formulario-->', pedacoDoGabarito($gabarito, $pedaco), semPedacos($gabarito)),
    ]);
    exit;
}

$travado = 'Muitas tentativas erradas. Espere 15 minutos e tente de novo.';

// Na primeira visita ninguem tem senha ainda: quem chega primeiro define a dele.
if (!adminConfigurado()) {
    if ($metodo === 'POST' && isset($_POST['definir'])) {
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
    telaDeEntradaAdmin('definir', 'Configurar administração', $erro);
}

// ------------------------------------------------------- esqueci a senha
if (!ehAdmin() && isset($_GET['esqueci'])) {
    if ($metodo === 'POST' && isset($_POST['recuperar'])) {
        $nova = (string) ($_POST['nova'] ?? '');
        if (adminTravado()) {
            $erro = $travado;
        } elseif (strlen($nova) < 10) {
            $erro = 'A senha nova precisa de pelo menos 10 caracteres.';
        } elseif ($nova !== (string) ($_POST['confirma'] ?? '')) {
            $erro = 'As duas senhas não são iguais.';
        } elseif (recuperarSenhaAdmin((string) ($_POST['codigo'] ?? ''), $nova)) {
            header('Location: /app/admin.php?recuperada=1');
            exit;
        } else {
            registrarFalhaAdmin('codigo');
            $erro = 'Código de recuperação inválido ou já usado.';
        }
    }
    telaDeEntradaAdmin('recuperar', 'Recuperar acesso', $erro);
}

// ------------------------------------------------------------------ login
if (!ehAdmin()) {
    if ($metodo === 'POST' && isset($_POST['entrar'])) {
        if (adminTravado()) {
            $erro = $travado;
        } elseif (autenticarAdmin((string) ($_POST['senha'] ?? ''))) {
            header('Location: /app/admin.php');
            exit;
        } else {
            registrarFalhaAdmin('senha');
            $erro = 'Senha incorreta.';
        }
    }
    $aviso = isset($_GET['saiu']) ? 'Você saiu da administração.' : '';
    telaDeEntradaAdmin('entrar', 'Administração', $erro, $aviso);
}

if (isset($_GET['recuperada'])) {
    $ok = 'Senha nova salva. O código que você usou não vale mais: gere outro no quadro "Sua senha".';
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
    if (isset($_POST['sair'])) {
        sairDoAdmin();
        header('Location: /app/admin.php?saiu=1');
        exit;
    }
    if (isset($_POST['trocar_senha'])) {
        $nova = (string) ($_POST['nova'] ?? '');
        if (strlen($nova) < 10) {
            $erro = 'A senha nova precisa de pelo menos 10 caracteres.';
        } elseif ($nova !== (string) ($_POST['confirma'] ?? '')) {
            $erro = 'As duas senhas novas não são iguais.';
        } elseif (!trocarSenhaAdmin((string) ($_POST['atual'] ?? ''), $nova)) {
            $erro = 'A senha atual não confere.';
        } else {
            $ok = 'Senha trocada.';
        }
    }
    if (isset($_POST['gerar_recuperacao'])) {
        $codigoRecuperacao = gerarCodigoRecuperacao();
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
<form method="post" style="float:right;margin:4px 0 0">
  <button type="submit" name="sair" value="1" class="secundario">Sair</button>
</form>
<h1>Administração</h1>
<p class="sub"><?= count($lista) ?> pessoa(s) cadastrada(s), <?= $ativos ?> com acesso ativo.
   Dados guardados em <code><?= e(pastaDados()) ?></code>.</p>

<?php if ($ok !== ''): ?><div class="ok"><?= $ok ?></div><?php endif; ?>
<?php if ($erro !== ''): ?><div class="erro"><?= e($erro) ?></div><?php endif; ?>

<?php if ($codigoRecuperacao !== null): ?>
  <div class="aviso">
    <strong>Seu código de recuperação:</strong>
    <code style="font-size:1.15em;letter-spacing:.08em"><?= e($codigoRecuperacao) ?></code><br>
    Guarde num gerenciador de senhas agora: ele não aparece de novo. É ele que libera o
    "Esqueci a senha", e vale uma vez só. O código anterior deixou de valer.
  </div>
<?php endif; ?>

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

  <div class="cartao">
    <h3>Sua senha</h3>
    <form method="post">
      <p style="margin-bottom:14px">Para trocar, confirme a senha atual.</p>
      <label for="atual">Senha atual</label>
      <input type="password" id="atual" name="atual" required autocomplete="current-password">
      <label for="nova">Senha nova</label>
      <input type="password" id="nova" name="nova" required minlength="10" autocomplete="new-password">
      <label for="confirma">Repita a senha nova</label>
      <input type="password" id="confirma" name="confirma" required minlength="10" autocomplete="new-password">
      <button type="submit" name="trocar_senha" value="1" class="secundario" style="width:100%">Trocar senha</button>
    </form>
    <form method="post" style="margin-top:18px">
      <p style="margin-bottom:10px">
        <b>Código de recuperação</b>, para o "Esqueci a senha".
        <?= temCodigoRecuperacao()
            ? 'Existe um válido. Gerar outro invalida o atual.'
            : 'Nenhum válido agora: gere um e guarde.' ?>
      </p>
      <button type="submit" name="gerar_recuperacao" value="1" class="secundario" style="width:100%">Gerar código novo</button>
    </form>
  </div>

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
