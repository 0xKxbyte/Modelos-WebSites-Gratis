<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

function calcularFrete($cepOrigem, $cepDestino, $peso, $altura, $largura, $comprimento) {
    $dados = [
        'sCepOrigem' => preg_replace('/[^0-9]/', '', $cepOrigem),
        'sCepDestino' => preg_replace('/[^0-9]/', '', $cepDestino),
        'nVlPeso' => $peso,
        'nCdFormato' => 1,
        'nVlComprimento' => $comprimento,
        'nVlAltura' => $altura,
        'nVlLargura' => $largura,
        'nCdServico' => ['04014', '04510'],
        'nVlDiametro' => 0,
        'StrRetorno' => 'xml'
    ];

    $resultados = [];
    $servicos = [
        '04014' => 'Sedex',
        '04510' => 'PAC'
    ];

    foreach ($dados['nCdServico'] as $servico) {
        $url = "http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?" . http_build_query([
            'nCdEmpresa' => '',
            'sDsSenha' => '',
            'sCepOrigem' => $dados['sCepOrigem'],
            'sCepDestino' => $dados['sCepDestino'],
            'nVlPeso' => $dados['nVlPeso'],
            'nCdFormato' => $dados['nCdFormato'],
            'nVlComprimento' => $dados['nVlComprimento'],
            'nVlAltura' => $dados['nVlAltura'],
            'nVlLargura' => $dados['nVlLargura'],
            'nCdServico' => $servico,
            'nVlDiametro' => $dados['nVlDiametro'],
            'StrRetorno' => $dados['StrRetorno']
        ]);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false
        ]);
        $resposta = curl_exec($ch);
        $erro = curl_error($ch);
        curl_close($ch);

        if ($erro) {
            $resultados[] = [
                'servico' => $servicos[$servico],
                'codigo' => $servico,
                'erro' => true,
                'mensagem' => 'Erro ao consultar frete'
            ];
            continue;
        }

        $xml = simplexml_load_string($resposta);
        if ($xml && isset($xml->cServico)) {
            $cServico = $xml->cServico;
            if ((string)$cServico->Erro === '0') {
                $resultados[] = [
                    'servico' => $servicos[$servico],
                    'codigo' => $servico,
                    'erro' => false,
                    'valor' => (float)str_replace(',', '.', (string)$cServico->Valor),
                    'prazo' => (int)$cServico->PrazoEntrega,
                    'valor_sem_adicional' => (float)str_replace(',', '.', (string)$cServico->ValorSemAdicionais)
                ];
            } else {
                $resultados[] = [
                    'servico' => $servicos[$servico],
                    'codigo' => $servico,
                    'erro' => true,
                    'mensagem' => (string)$cServico->MsgErro
                ];
            }
        }
    }

    return $resultados;
}

function consultarCEP($cep) {
    $cep = preg_replace('/[^0-9]/', '', $cep);
    $url = API_CEP_URL . "$cep/json/";

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10
    ]);
    $resposta = curl_exec($ch);
    $erro = curl_error($ch);
    curl_close($ch);

    if ($erro) {
        return ['erro' => true, 'mensagem' => 'Erro ao consultar CEP'];
    }

    $dados = json_decode($resposta, true);
    if (isset($dados['erro']) && $dados['erro']) {
        return ['erro' => true, 'mensagem' => 'CEP não encontrado'];
    }

    return [
        'erro' => false,
        'cep' => $dados['cep'],
        'logradouro' => $dados['logradouro'] ?? '',
        'bairro' => $dados['bairro'] ?? '',
        'cidade' => $dados['localidade'] ?? '',
        'estado' => $dados['uf'] ?? ''
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $acao = $_POST['acao'] ?? '';

    switch ($acao) {
        case 'calcular_frete':
            $cepDestino = $_POST['cep'] ?? '';
            $pesoTotal = (float)($_POST['peso_total'] ?? 0);
            $alturaTotal = (float)($_POST['altura_total'] ?? 0);
            $larguraTotal = (float)($_POST['largura_total'] ?? 0);
            $comprimentoTotal = (float)($_POST['comprimento_total'] ?? 0);

            $frete = calcularFrete('01001000', $cepDestino, $pesoTotal, $alturaTotal, $larguraTotal, $comprimentoTotal);
            echo json_encode(['sucesso' => true, 'opcoes' => $frete]);
            break;

        case 'consultar_cep':
            $cep = $_POST['cep'] ?? '';
            $endereco = consultarCEP($cep);
            echo json_encode($endereco);
            break;

        default:
            echo json_encode(['sucesso' => false, 'erro' => 'Ação inválida']);
    }
}
