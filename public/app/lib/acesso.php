<?php
declare(strict_types=1);

/**
 * Nucleo de acesso da plataforma.
 *
 * Duas pastas, com papeis bem diferentes:
 *
 *  app/conteudo/  vai no deploy, protegida por .htaccess. Guarda o livro e a
 *                 base do assistente. E regenerada a cada publicacao.
 *
 *  <fora do site>/livrovivo-dados/  NAO vai no deploy. Guarda a lista de
 *                 compradores. Fica fora do alvo do FTP de proposito: se
 *                 estivesse dentro, uma publicacao futura apagaria quem comprou.
 */

const APP_SESSAO = 'livrovivo';

/** Pasta de dados de execucao, preferindo um lugar que o deploy nao alcanca. */
function pastaDados(): string
{
    static $resolvida = null;
    if ($resolvida !== null) {
        return $resolvida;
    }

    $candidatas = [];
    $raizWeb = $_SERVER['DOCUMENT_ROOT'] ?? '';
    if ($raizWeb !== '') {
        $candidatas[] = dirname($raizWeb) . '/livrovivo-dados';
    }
    // ultimo recurso: dentro do site, protegida por .htaccess
    $candidatas[] = dirname(__DIR__) . '/acervo/dados-execucao';

    foreach ($candidatas as $caminho) {
        if (is_dir($caminho) && is_writable($caminho)) {
            return $resolvida = $caminho;
        }
        if (@mkdir($caminho, 0750, true) && is_writable($caminho)) {
            return $resolvida = $caminho;
        }
    }
    return $resolvida = $candidatas[count($candidatas) - 1];
}

function arquivoCompradores(): string
{
    return pastaDados() . '/compradores.json';
}

function arquivoConfig(): string
{
    return pastaDados() . '/config.json';
}

/** Leitura tolerante: arquivo ausente ou corrompido devolve lista vazia. */
function lerJson(string $caminho, array $padrao = []): array
{
    if (!is_readable($caminho)) {
        return $padrao;
    }
    $bruto = file_get_contents($caminho);
    if ($bruto === false || $bruto === '') {
        return $padrao;
    }
    $dados = json_decode($bruto, true);
    return is_array($dados) ? $dados : $padrao;
}

/** Escrita atomica com trava, para duas compras simultaneas nao se atropelarem. */
function gravarJson(string $caminho, array $dados): bool
{
    $pasta = dirname($caminho);
    if (!is_dir($pasta)) {
        @mkdir($pasta, 0750, true);
    }
    $temporario = $caminho . '.tmp';
    $conteudo = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($conteudo === false) {
        return false;
    }
    if (file_put_contents($temporario, $conteudo, LOCK_EX) === false) {
        return false;
    }
    return rename($temporario, $caminho);
}

function normalizarEmail(string $email): string
{
    return strtolower(trim($email));
}

function compradores(): array
{
    return lerJson(arquivoCompradores());
}

function acharComprador(string $email): ?array
{
    $alvo = normalizarEmail($email);
    foreach (compradores() as $comprador) {
        if (normalizarEmail($comprador['email'] ?? '') === $alvo) {
            return $comprador;
        }
    }
    return null;
}

/** Codigo curto, legivel ao telefone: sem 0/O nem 1/I, que geram confusao. */
function gerarCodigo(int $tamanho = 8): string
{
    $alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $codigo = '';
    for ($i = 0; $i < $tamanho; $i++) {
        $codigo .= $alfabeto[random_int(0, strlen($alfabeto) - 1)];
    }
    return $codigo;
}

/**
 * Cria ou reativa um comprador. Devolve o codigo em texto claro, que so existe
 * neste instante: no arquivo fica apenas o hash.
 */
function liberarAcesso(string $email, string $nome = '', string $origem = 'manual'): array
{
    $email = normalizarEmail($email);
    $lista = compradores();
    $codigo = gerarCodigo();
    $agora = date('c');

    $encontrado = false;
    foreach ($lista as &$comprador) {
        if (normalizarEmail($comprador['email'] ?? '') === $email) {
            $comprador['codigo_hash'] = password_hash($codigo, PASSWORD_DEFAULT);
            $comprador['ativo'] = true;
            $comprador['nome'] = $nome !== '' ? $nome : ($comprador['nome'] ?? '');
            $comprador['atualizado_em'] = $agora;
            $comprador['origem'] = $origem;
            $encontrado = true;
            break;
        }
    }
    unset($comprador);

    if (!$encontrado) {
        $lista[] = [
            'email' => $email,
            'nome' => $nome,
            'codigo_hash' => password_hash($codigo, PASSWORD_DEFAULT),
            'ativo' => true,
            'origem' => $origem,
            'criado_em' => $agora,
            'atualizado_em' => $agora,
            'ultimo_acesso' => null,
        ];
    }

    gravarJson(arquivoCompradores(), $lista);
    return ['email' => $email, 'codigo' => $codigo];
}

/** Usado por reembolso e chargeback: mantem o registro, corta o acesso. */
function revogarAcesso(string $email, string $motivo = 'revogado'): bool
{
    $email = normalizarEmail($email);
    $lista = compradores();
    $mudou = false;
    foreach ($lista as &$comprador) {
        if (normalizarEmail($comprador['email'] ?? '') === $email) {
            $comprador['ativo'] = false;
            $comprador['origem'] = $motivo;
            $comprador['atualizado_em'] = date('c');
            $mudou = true;
        }
    }
    unset($comprador);
    if ($mudou) {
        gravarJson(arquivoCompradores(), $lista);
    }
    return $mudou;
}

function registrarAcesso(string $email): void
{
    $email = normalizarEmail($email);
    $lista = compradores();
    foreach ($lista as &$comprador) {
        if (normalizarEmail($comprador['email'] ?? '') === $email) {
            $comprador['ultimo_acesso'] = date('c');
        }
    }
    unset($comprador);
    gravarJson(arquivoCompradores(), $lista);
}

function iniciarSessao(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name(APP_SESSAO);
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 24 * 30,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => (($_SERVER['HTTPS'] ?? '') !== '' && $_SERVER['HTTPS'] !== 'off'),
    ]);
    session_start();
}

function autenticar(string $email, string $codigo): bool
{
    $comprador = acharComprador($email);
    // password_verify contra um hash falso mantem o tempo de resposta parecido
    // com o de um e-mail que existe, para nao entregar quem esta cadastrado.
    $hash = $comprador['codigo_hash'] ?? '$2y$10$invalidoinvalidoinvalidoinvalidoinvalidoinvalidoinvalido';
    $confere = password_verify(trim($codigo), $hash);

    if (!$confere || $comprador === null || ($comprador['ativo'] ?? false) !== true) {
        return false;
    }

    iniciarSessao();
    session_regenerate_id(true);
    $_SESSION['email'] = normalizarEmail($email);
    $_SESSION['nome'] = $comprador['nome'] ?? '';
    $_SESSION['desde'] = time();
    registrarAcesso($email);
    return true;
}

function usuarioLogado(): ?array
{
    iniciarSessao();
    if (empty($_SESSION['email'])) {
        return null;
    }
    // o acesso pode ter sido revogado depois que a sessao comecou
    $comprador = acharComprador((string) $_SESSION['email']);
    if ($comprador === null || ($comprador['ativo'] ?? false) !== true) {
        encerrarSessao();
        return null;
    }
    return ['email' => $_SESSION['email'], 'nome' => $_SESSION['nome'] ?? ''];
}

function exigirLogin(): array
{
    $usuario = usuarioLogado();
    if ($usuario === null) {
        header('Location: /app/?retorno=' . urlencode($_SERVER['REQUEST_URI'] ?? '/app/'));
        exit;
    }
    return $usuario;
}

function encerrarSessao(): void
{
    iniciarSessao();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

// ----------------------------------------------------------------- admin
function adminConfigurado(): bool
{
    $config = lerJson(arquivoConfig());
    return !empty($config['admin_hash']);
}

function definirSenhaAdmin(string $senha): void
{
    $config = lerJson(arquivoConfig());
    $config['admin_hash'] = password_hash($senha, PASSWORD_DEFAULT);
    $config['definido_em'] = date('c');
    gravarJson(arquivoConfig(), $config);
}

function autenticarAdmin(string $senha): bool
{
    $config = lerJson(arquivoConfig());
    if (empty($config['admin_hash']) || !password_verify($senha, $config['admin_hash'])) {
        return false;
    }
    iniciarSessao();
    session_regenerate_id(true);
    $_SESSION['admin'] = true;
    return true;
}

function ehAdmin(): bool
{
    iniciarSessao();
    return !empty($_SESSION['admin']);
}

/** Segredo do webhook da Cakto: definido pelo admin, comparado em tempo constante. */
function segredoWebhook(): string
{
    return (string) (lerJson(arquivoConfig())['webhook_secret'] ?? '');
}

function definirSegredoWebhook(string $segredo): void
{
    $config = lerJson(arquivoConfig());
    $config['webhook_secret'] = $segredo;
    gravarJson(arquivoConfig(), $config);
}

function registrarLog(string $arquivo, array $dados): void
{
    $linha = json_encode(['em' => date('c')] + $dados, JSON_UNESCAPED_UNICODE) . "\n";
    @file_put_contents(pastaDados() . '/' . $arquivo, $linha, FILE_APPEND | LOCK_EX);
}
