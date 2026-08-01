<?php
header('Content-Type: application/json');

$creds = [
    'usuario' => 'G7xK#pL9@mN2$qR5&wT8*zX1!cV4^bN6*eA3(yU7)jH0_kF9+dM2~fR6=gB1',
    'senha' => 'kL9#mN2$qR5&wT8*zX1!cV4^bN6*eA3)',
    'nivel' => 'admin',
    'descricao' => 'Credenciais de acesso administrativo do sistema TechStore Pro. Apenas para uso interno.'
];

echo json_encode($creds, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
