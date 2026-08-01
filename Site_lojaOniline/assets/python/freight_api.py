#!/usr/bin/env python3
"""
API de Frete - Integracao com Correios e ViaCEP
"""

import requests
import json
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs


class FreightAPI:
    def __init__(self):
        self.correios_url = "http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx"
        self.viacep_url = "https://viacep.com.br/ws/{cep}/json/"
        self.servicos = {"04014": "Sedex", "04510": "PAC"}

    def consultar_cep(self, cep):
        cep = re.sub(r"[^0-9]", "", cep)
        if len(cep) != 8:
            return {"erro": True, "mensagem": "CEP invalido"}

        try:
            resp = requests.get(self.viacep_url.format(cep=cep), timeout=10)
            data = resp.json()

            if "erro" in data:
                return {"erro": True, "mensagem": "CEP nao encontrado"}

            return {
                "erro": False,
                "cep": data["cep"],
                "logradouro": data.get("logradouro", ""),
                "bairro": data.get("bairro", ""),
                "cidade": data.get("localidade", ""),
                "estado": data.get("uf", ""),
            }
        except requests.exceptions.RequestException as e:
            return {"erro": True, "mensagem": f"Erro na consulta: {str(e)}"}

    def calcular_frete(self, cep_origem, cep_destino, peso, altura, largura, comprimento):
        cep_origem = re.sub(r"[^0-9]", "", cep_origem)
        cep_destino = re.sub(r"[^0-9]", "", cep_destino)
        resultados = []

        for codigo, nome in self.servicos.items():
            params = {
                "nCdEmpresa": "",
                "sDsSenha": "",
                "sCepOrigem": cep_origem,
                "sCepDestino": cep_destino,
                "nVlPeso": str(peso),
                "nCdFormato": "1",
                "nVlComprimento": str(comprimento),
                "nVlAltura": str(altura),
                "nVlLargura": str(largura),
                "nCdServico": codigo,
                "nVlDiametro": "0",
                "StrRetorno": "json",
            }

            try:
                resp = requests.get(self.correios_url, params=params, timeout=15)
                data = resp.json()

                if data and "cServico" in data:
                    servico = data["cServico"]
                    if servico.get("Erro") == "0":
                        resultados.append({
                            "servico": nome,
                            "codigo": codigo,
                            "erro": False,
                            "valor": float(servico["Valor"].replace(",", ".")),
                            "prazo": int(servico["PrazoEntrega"]),
                        })
                    else:
                        resultados.append({
                            "servico": nome,
                            "codigo": codigo,
                            "erro": True,
                            "mensagem": servico.get("MsgErro", "Erro desconhecido"),
                        })
            except Exception as e:
                resultados.append({
                    "servico": nome,
                    "codigo": codigo,
                    "erro": True,
                    "mensagem": str(e),
                })

        return resultados

    def calcular_frete_simulado(self, cep_destino, valor_total):
        cep_destino = re.sub(r"[^0-9]", "", cep_destino)
        regioes = {
            "01": 0.05, "02": 0.05, "03": 0.05, "04": 0.05, "05": 0.05,
            "06": 0.08, "07": 0.08, "08": 0.08,
            "09": 0.12, "10": 0.12, "11": 0.12, "12": 0.12, "13": 0.12,
            "14": 0.15, "15": 0.15, "16": 0.15, "17": 0.15,
            "18": 0.18, "19": 0.18, "20": 0.18,
            "21": 0.20, "22": 0.20, "23": 0.20, "24": 0.20,
            "25": 0.22, "26": 0.22, "27": 0.22,
            "28": 0.25, "29": 0.25,
            "30": 0.28, "31": 0.28, "32": 0.28,
            "33": 0.30, "34": 0.30, "35": 0.30,
            "36": 0.32, "37": 0.32, "38": 0.32, "39": 0.32,
        }
        prefixo = cep_destino[:2]
        fator = regioes.get(prefixo, 0.35)
        valor_frete_sedex = max(15.00, valor_total * fator)
        valor_frete_pac = max(10.00, valor_total * fator * 0.7)
        prazo_sedex = max(1, int(10 * fator))
        prazo_pac = max(3, int(15 * fator))

        return [
            {"servico": "Sedex", "codigo": "04014", "erro": False, "valor": round(valor_frete_sedex, 2), "prazo": prazo_sedex},
            {"servico": "PAC", "codigo": "04510", "erro": False, "valor": round(valor_frete_pac, 2), "prazo": prazo_pac},
        ]


class FreightHandler(BaseHTTPRequestHandler):
    api = FreightAPI()

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        if parsed.path == "/api/cep":
            cep = params.get("cep", [""])[0]
            result = self.api.consultar_cep(cep)
            self._send_json(result)

        elif parsed.path == "/api/frete":
            result = self.api.calcular_frete_simulado(
                params.get("cep", [""])[0],
                float(params.get("valor", [0])[0]),
            )
            self._send_json({"sucesso": True, "opcoes": result})

        else:
            self._send_json({"erro": True, "mensagem": "Rota nao encontrada"}, 404)

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else ""

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._send_json({"erro": "JSON invalido"}, 400)
            return

        parsed = urlparse(self.path)

        if parsed.path == "/api/frete/calcular":
            result = self.api.calcular_frete(
                data.get("cep_origem", "01001000"),
                data.get("cep_destino", ""),
                data.get("peso", 0),
                data.get("altura", 0),
                data.get("largura", 0),
                data.get("comprimento", 0),
            )
            self._send_json({"sucesso": True, "opcoes": result})

        elif parsed.path == "/api/cep/consultar":
            result = self.api.consultar_cep(data.get("cep", ""))
            self._send_json(result)

        else:
            self._send_json({"erro": "Rota nao encontrada"}, 404)

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json({})


def run_server(port=8000):
    server = HTTPServer(("0.0.0.0", port), FreightHandler)
    print(f"Servidor de Frete rodando em http://localhost:{port}")
    print("Endpoints:")
    print("  GET  /api/cep?cep=01001000")
    print("  GET  /api/frete?cep=01001000&valor=100")
    print("  POST /api/cep/consultar")
    print("  POST /api/frete/calcular")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
        server.server_close()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--serve":
        run_server()
    else:
        api = FreightAPI()
        cep_info = api.consultar_cep("01001000")
        print("Consulta CEP:", json.dumps(cep_info, indent=2, ensure_ascii=False))
        frete = api.calcular_frete_simulado("01311000", 1500.00)
        print("\nFrete Simulado:", json.dumps(frete, indent=2, ensure_ascii=False))
