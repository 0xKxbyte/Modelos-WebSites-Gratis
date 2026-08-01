<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$acao = $_POST['acao'] ?? '';

switch ($acao) {
    case 'gerar_pix':
        $valor = (float)($_POST['valor'] ?? 0);
        $codigo = 'PIX-' . strtoupper(bin2hex(random_bytes(8)));
        
        echo json_encode([
            'sucesso' => true,
            'codigo_pix' => $codigo,
            'qr_code' => 'pix://' . $codigo,
            'valor' => $valor,
            'expiracao' => date('Y-m-d H:i:s', time() + 3600)
        ]);
        break;

    case 'gerar_boleto':
        $valor = (float)($_POST['valor'] ?? 0);
        $codigo = '34191.' . str_pad((string)rand(0, 99999), 5, '0', STR_PAD_LEFT) . ' ' .
                   str_pad((string)rand(0, 99999), 5, '0', STR_PAD_LEFT) . ' ' .
                   str_pad((string)rand(0, 99999), 5, '0', STR_PAD_LEFT) . ' ' .
                   str_pad((string)rand(0, 9), 1, '0', STR_PAD_LEFT) . ' ' .
                   str_pad((string)rand(0, 9999999), 7, '0', STR_PAD_LEFT) . ' ' .
                   str_pad((string)rand(0, 99999999), 8, '0', STR_PAD_LEFT) . ' ' .
                   str_pad((string)rand(0, 9), 1, '0', STR_PAD_LEFT);

        echo json_encode([
            'sucesso' => true,
            'codigo_boleto' => $codigo,
            'linha_digitavel' => $codigo,
            'valor' => $valor,
            'vencimento' => date('Y-m-d', time() + 86400 * 3)
        ]);
        break;

    case 'processar_cartao':
        $valor = (float)($_POST['valor'] ?? 0);
        $parcelas = (int)($_POST['parcelas'] ?? 1);
        $ultimos4 = substr(sanitizar($_POST['cartao_numero'] ?? '0000'), -4);

        $aprovado = rand(1, 100) > 5;
        $idTransacao = 'TXN-' . strtoupper(bin2hex(random_bytes(8)));

        if ($aprovado) {
            echo json_encode([
                'sucesso' => true,
                'transacao_id' => $idTransacao,
                'ultimos_4' => $ultimos4,
                'parcelas' => $parcelas,
                'valor_parcela' => $valor / $parcelas
            ]);
        } else {
            echo json_encode([
                'sucesso' => false,
                'erro' => 'Cartão recusado. Verifique os dados ou tente outro cartão.'
            ]);
        }
        break;

    case 'status_pagamento':
        $codigo = sanitizar($_POST['codigo'] ?? '');
        $status = ['pendente', 'confirmado', 'processando'][rand(0, 2)];

        echo json_encode([
            'sucesso' => true,
            'codigo' => $codigo,
            'status' => $status
        ]);
        break;

    default:
        echo json_encode(['sucesso' => false, 'erro' => 'Ação inválida']);
}
