<?php
declare(strict_types=1);

/** Casca visual compartilhada pelas telas da plataforma. */

function e(?string $texto): string
{
    return htmlspecialchars((string) $texto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function abrirTela(string $titulo, ?array $usuario = null, string $atual = ''): void
{
    $itens = [
        ['/app/', 'Início', 'inicio'],
        ['/app/livro/', 'O livro', 'livro'],
        ['/app/assistente/', 'Assistente de cardápio', 'assistente'],
    ];
    ?><!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= e($titulo) ?> · Cardápios: Um Livro Vivo</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap">
<style>
  :root {
    --verde:#448D76; --verde-esc:#2F6F5C; --verde-prof:#1F4B3E;
    --teal:#0C718B; --laranja:#ED8627; --laranja-esc:#B85F10;
    --creme:#EEF0D2; --creme-cl:#F7F8EC; --creme-md:#E2E5BE;
    --tinta:#2D2D2D; --tinta-sv:#5A5A5A; --tinta-fr:#8A8A80;
    --linha:#DDE0C8; --branco:#fff; --risco:#A33A2A;
    --display:'League Spartan','Trebuchet MS',sans-serif;
    --corpo:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:var(--corpo);color:var(--tinta);background:var(--creme-cl);
       font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1180px;margin:0 auto;padding:0 20px}
  a{color:var(--verde-esc)}

  header.topo{background:var(--verde-prof);color:#fff;padding:16px 0}
  .topo .barra{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
  .topo .marca{font-family:var(--display);font-size:1.15rem;font-weight:700;color:#fff;text-decoration:none}
  .topo .quem{font-size:12.5px;color:#9FC4B6}
  .topo .quem a{color:#CFE3DA;margin-left:10px}
  nav.menu{background:var(--verde-esc);padding:0}
  nav.menu ul{display:flex;list-style:none;gap:2px;flex-wrap:wrap}
  nav.menu a{display:block;padding:12px 16px;color:#CFE3DA;text-decoration:none;
             font-size:13.5px;font-weight:500}
  nav.menu a:hover{background:rgba(255,255,255,.1);color:#fff}
  nav.menu a[aria-current="page"]{background:var(--creme-cl);color:var(--verde-prof);font-weight:600}

  main{padding:28px 0 72px}
  h1{font-family:var(--display);font-size:1.7rem;font-weight:700;color:var(--verde-prof);
     letter-spacing:-.01em;margin-bottom:6px}
  h2{font-family:var(--display);font-size:1.2rem;font-weight:600;color:var(--verde-prof);margin-bottom:8px}
  .sub{color:var(--tinta-sv);font-size:14.5px;max-width:68ch;margin-bottom:22px}

  .cartao{background:var(--branco);border:1px solid var(--linha);border-radius:12px;padding:22px}
  .cartoes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
  .cartao h3{font-family:var(--display);font-size:1.1rem;font-weight:600;color:var(--teal);margin-bottom:6px}
  .cartao p{font-size:14px;color:var(--tinta-sv)}
  .cartao a.acao{display:inline-block;margin-top:14px;background:var(--laranja);color:#fff;
                 text-decoration:none;font-weight:600;font-size:14px;padding:9px 16px;border-radius:8px}
  .cartao a.acao:hover{background:var(--laranja-esc)}

  form.caixa{background:var(--branco);border:1px solid var(--linha);border-radius:12px;
             padding:26px;max-width:420px;margin:0 auto}
  label{display:block;font-family:var(--display);font-size:10.5px;font-weight:600;
        letter-spacing:.09em;text-transform:uppercase;color:var(--tinta-fr);margin-bottom:5px}
  input[type=text],input[type=email],input[type=password]{
    width:100%;font-family:var(--corpo);font-size:15px;padding:10px 12px;
    border:1px solid var(--linha);border-radius:8px;margin-bottom:16px;background:#fff;color:var(--tinta)}
  input[name=codigo]{text-transform:uppercase;letter-spacing:.12em;font-weight:600}
  button{font-family:var(--corpo);font-size:15px;font-weight:600;padding:11px 18px;
         border-radius:8px;border:none;cursor:pointer;background:var(--laranja);color:#fff;width:100%}
  button:hover{background:var(--laranja-esc)}
  button.secundario{background:var(--branco);color:var(--verde-esc);border:1px solid var(--creme-md);width:auto}
  :focus-visible{outline:2px solid var(--laranja);outline-offset:2px}

  .erro{background:#F8E9E5;border:1px solid #E8C4BB;color:var(--risco);
        border-radius:9px;padding:11px 14px;font-size:13.5px;margin-bottom:16px}
  .ok{background:#E9F1EC;border:1px solid #C6DCCB;color:var(--verde-esc);
      border-radius:9px;padding:11px 14px;font-size:13.5px;margin-bottom:16px}
  .aviso{background:#FBEEDF;border:1px solid #F0D6B4;color:var(--laranja-esc);
         border-radius:9px;padding:11px 14px;font-size:13.5px;margin-bottom:16px}
  code{font-family:ui-monospace,Menlo,Consolas,monospace;background:var(--creme-cl);
       border:1px solid var(--linha);border-radius:4px;padding:1px 5px;font-size:.9em}
  table{border-collapse:collapse;width:100%;font-size:13.8px;background:#fff}
  th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--linha);vertical-align:top}
  thead th{font-family:var(--display);font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;
           color:var(--tinta-fr);background:var(--creme-cl)}
  .rolagem{overflow-x:auto;border:1px solid var(--linha);border-radius:10px}
</style>
</head>
<body>
<header class="topo">
  <div class="wrap barra">
    <a class="marca" href="/app/">Cardápios: Um Livro Vivo</a>
    <?php if ($usuario !== null): ?>
      <div class="quem"><?= e($usuario['nome'] !== '' ? $usuario['nome'] : $usuario['email']) ?>
        <a href="/app/sair.php">sair</a></div>
    <?php endif; ?>
  </div>
</header>
<?php if ($usuario !== null): ?>
<nav class="menu">
  <div class="wrap"><ul>
    <?php foreach ($itens as [$url, $rotulo, $chave]): ?>
      <li><a href="<?= e($url) ?>"<?= $chave === $atual ? ' aria-current="page"' : '' ?>><?= e($rotulo) ?></a></li>
    <?php endforeach; ?>
  </ul></div>
</nav>
<?php endif; ?>
<main><div class="wrap">
<?php
}

function fecharTela(): void
{
    ?>
</div></main>
</body>
</html>
<?php
}
