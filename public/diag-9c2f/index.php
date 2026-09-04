<?php
// Sonda temporaria: descobre o que a hospedagem oferece sem expor detalhes do
// servidor. Nao imprime phpinfo, caminhos, versoes de SO nem credenciais.
// Apagar (sobrescrevendo) assim que a resposta for lida.
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');

$maiorQue = static fn(string $minimo): bool => version_compare(PHP_VERSION, $minimo, '>=');

echo json_encode([
  'php'            => true,
  'php_8_ou_mais'  => $maiorQue('8.0'),
  'mysqli'         => extension_loaded('mysqli'),
  'pdo_mysql'      => extension_loaded('pdo_mysql'),
  'sessoes'        => function_exists('session_start'),
  'password_hash'  => function_exists('password_hash'),
  'openssl'        => extension_loaded('openssl'),
  'curl'           => extension_loaded('curl'),
  'json'           => extension_loaded('json'),
  'mbstring'       => extension_loaded('mbstring'),
  'zlib'           => extension_loaded('zlib'),
  'pode_ler_fora_do_publico' => is_readable(dirname(__DIR__)),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
