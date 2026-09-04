<?php
declare(strict_types=1);
require __DIR__ . '/lib/acesso.php';
encerrarSessao();
header('Location: /app/');
