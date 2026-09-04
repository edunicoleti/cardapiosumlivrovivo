<?php
// A sonda cumpriu a funcao e foi neutralizada. Mantida como arquivo vazio
// porque, neste servidor, a acao de deploy nao consegue apagar pasta: para
// tirar algo do ar, sobrescreve-se.
http_response_code(410);
header('X-Robots-Tag: noindex, nofollow');
echo 'gone';
