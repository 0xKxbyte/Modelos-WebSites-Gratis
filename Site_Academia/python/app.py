"""
Iron Gym - API Flask para Modelo 3D
Servico web que gera e serve visualizacoes 3D da academia.

Instalacao:
    pip install flask matplotlib numpy pillow

Uso:
    python app.py                    # Inicia servidor na porta 5000
    python app.py --port 8080        # Porta personalizada
    python app.py --no-web           # Apenas gera imagem, nao inicia servidor
"""

import os
import sys
import io
import base64
import json
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Verificar dependencias
try:
    import numpy as np
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
except ImportError as e:
    print(f"Erro: {e}")
    print("Execute: pip install flask matplotlib numpy pillow")
    sys.exit(1)

# Importar o modelo 3D
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modelo_3d import IronGym3D


class Gym3DAPI:
    """API para geracao de modelos 3D."""

    def __init__(self):
        self.gym = IronGym3D()

    def generate_image(self, view_angle=-60, elevation=25, fmt='png'):
        """Gera imagem da academia 3D e retorna como bytes."""
        fig, ax = self.gym.build_structure()
        self.gym.add_animated_elements()
        ax.view_init(elev=elevation, azim=view_angle)

        buf = io.BytesIO()
        fig.savefig(buf, format=fmt, dpi=120, bbox_inches='tight',
                   facecolor='#0a0a0a', edgecolor='none')
        plt.close(fig)
        buf.seek(0)
        return buf.getvalue()

    def generate_base64(self, view_angle=-60, elevation=25):
        """Gera imagem e retorna como base64."""
        img_bytes = self.generate_image(view_angle, elevation)
        return base64.b64encode(img_bytes).decode('utf-8')

    def get_rotation_frames(self, n_frames=12):
        """Gera multiplos frames em diferentes angulos."""
        frames = []
        for i in range(n_frames):
            angle = i * (360 / n_frames)
            img = self.generate_image(view_angle=angle)
            frames.append(base64.b64encode(img).decode('utf-8'))
        return frames


class SimpleHTTPHandler(BaseHTTPRequestHandler):
    """Servidor HTTP simples para servir a API 3D."""

    api = Gym3DAPI()

    def _set_headers(self, content_type='application/json', status=200):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _serve_html(self):
        """Serve pagina HTML de demonstracao."""
        html = self._get_demo_html()
        self._set_headers('text/html; charset=utf-8')
        self.wfile.write(html.encode('utf-8'))

    def _serve_image(self, query):
        """Serve imagem PNG diretamente."""
        params = parse_qs(query)
        angle = float(params.get('angle', [-60])[0])
        elev = float(params.get('elev', [25])[0])

        img_bytes = self.api.generate_image(view_angle=angle, elevation=elev)
        self._set_headers('image/png')
        self.wfile.write(img_bytes)

    def _serve_json(self, path, query):
        """Serve resposta JSON com dados 3D."""
        params = parse_qs(query)

        if path == '/api/3d/image':
            angle = float(params.get('angle', [-60])[0])
            elev = float(params.get('elev', [25])[0])
            b64 = self.api.generate_base64(view_angle=angle, elevation=elev)
            data = {'success': True, 'image': b64, 'format': 'png'}
            self._set_headers('application/json')
            self.wfile.write(json.dumps(data).encode('utf-8'))

        elif path == '/api/3d/rotation':
            frames = int(params.get('frames', [12])[0])
            frames_data = self.api.get_rotation_frames(n_frames=min(frames, 36))
            data = {
                'success': True,
                'frames': frames_data,
                'total_frames': len(frames_data),
                'format': 'png'
            }
            self._set_headers('application/json')
            self.wfile.write(json.dumps(data).encode('utf-8'))

        elif path == '/api/info':
            data = {
                'success': True,
                'name': 'Iron Gym 3D',
                'version': '1.0.0',
                'description': 'Modelo 3D da Academia Iron Gym',
                'endpoints': {
                    '/': 'Pagina de demonstracao',
                    '/api/3d/image': 'Imagem 3D (parametros: angle, elev)',
                    '/api/3d/rotation': 'Frames de rotacao (parametro: frames)',
                    '/api/3d.png': 'Imagem PNG direta (parametros: angle, elev)',
                    '/api/info': 'Informacoes da API'
                }
            }
            self._set_headers('application/json')
            self.wfile.write(json.dumps(data).encode('utf-8'))

        else:
            self._set_headers('application/json', 404)
            self.wfile.write(json.dumps({'success': False, 'error': 'Rota nao encontrada'}).encode('utf-8'))

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parsed.query

        try:
            if path == '/':
                self._serve_html()
            elif path == '/api/3d.png':
                self._serve_image(query)
            elif path.startswith('/api/'):
                self._serve_json(path, query)
            else:
                self._set_headers('application/json', 404)
                self.wfile.write(json.dumps({'success': False, 'error': 'Rota nao encontrada'}).encode('utf-8'))
        except Exception as e:
            self._set_headers('application/json', 500)
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))

    def do_OPTIONS(self):
        self._set_headers()

    def _get_demo_html(self):
        return """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Iron Gym 3D - Visualizador</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #fff; font-family: 'Inter', Arial, sans-serif; display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 40px; }
    h1 { font-family: 'Oswald', sans-serif; font-size: 36px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    h1 span { color: #0066ff; }
    p { color: #9ca3af; margin-bottom: 32px; font-size: 14px; }
    .viewer { width: 800px; max-width: 100%; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; background: #111; }
    .viewer img { width: 100%; height: auto; display: block; }
    .controls { display: flex; gap: 16px; margin-top: 24px; flex-wrap: wrap; justify-content: center; }
    .controls button { background: #1a1a1a; color: #fff; border: 1px solid #2a2a2a; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-family: 'Rajdhani', sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; }
    .controls button:hover { border-color: #0066ff; background: rgba(0,102,255,0.1); }
    .controls button.active { background: #0066ff; border-color: #0066ff; }
    .status { margin-top: 16px; color: #6b7280; font-size: 12px; }
</style>
</head>
<body>
    <h1>Iron <span>Gym</span> 3D</h1>
    <p>Visualizador 3D interativo da estrutura da academia</p>
    <div class="viewer">
        <img id="gym3d" src="/api/3d.png" alt="Iron Gym 3D">
    </div>
    <div class="controls">
        <button onclick="rotate(-15)">Girar Esquerda</button>
        <button onclick="rotate(15)">Girar Direita</button>
        <button onclick="elevate(5)">Elevar</button>
        <button onclick="elevate(-5)">Abaixar</button>
        <button onclick="resetView()">Reset</button>
        <button id="autoRotateBtn" onclick="toggleAutoRotate()">Rotacao Auto</button>
    </div>
    <div class="status" id="status">Angulo: -60 | Elevacao: 25</div>
    <script>
        let currentAngle = -60;
        let currentElev = 25;
        let autoRotate = false;
        let autoTimer = null;
        const img = document.getElementById('gym3d');
        const status = document.getElementById('status');

        function updateView() {
            img.src = '/api/3d.png?angle=' + currentAngle + '&elev=' + currentElev + '&t=' + Date.now();
            status.textContent = 'Angulo: ' + currentAngle + ' | Elevacao: ' + currentElev;
        }

        function rotate(deg) { currentAngle += deg; updateView(); }
        function elevate(deg) { currentElev = Math.max(-45, Math.min(90, currentElev + deg)); updateView(); }
        function resetView() { currentAngle = -60; currentElev = 25; updateView(); }

        function toggleAutoRotate() {
            autoRotate = !autoRotate;
            document.getElementById('autoRotateBtn').textContent = autoRotate ? 'Parar Rotacao' : 'Rotacao Auto';
            document.getElementById('autoRotateBtn').className = autoRotate ? 'active' : '';

            if (autoRotate) {
                autoTimer = setInterval(function() {
                    currentAngle = (currentAngle + 2) % 360;
                    updateView();
                }, 100);
            } else {
                clearInterval(autoTimer);
            }
        }
    </script>
</body>
</html>"""


def run_server(host='0.0.0.0', port=5000):
    """Inicia o servidor HTTP."""
    server = HTTPServer((host, port), SimpleHTTPHandler)
    print(f"Sistema 3D Iron Gym rodando em http://{host}:{port}")
    print(f"API: http://localhost:{port}/api/info")
    print(f"Visualizador: http://localhost:{port}/")
    print("Pressione Ctrl+C para parar.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
        server.server_close()


def generate_and_save(output_path='python/grafico_3d.png'):
    """Gera e salva a imagem 3D sem iniciar servidor."""
    # Garantir diretorio
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    # Usar diretorio do projeto para saida padrao
    if not os.path.isabs(output_path) and not output_dir:
        output_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            'assets',
            'img',
            'academia_3d.png'
        )
        output_dir = os.path.dirname(output_path)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)

    gym = IronGym3D()
    success = gym.save_image(output_path)
    if success:
        print(f"Modelo 3D salvo em: {output_path}")
    return success


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Iron Gym 3D Server')
    parser.add_argument('--port', '-p', type=int, default=5000,
                       help='Porta do servidor (padrao: 5000)')
    parser.add_argument('--host', type=str, default='0.0.0.0',
                       help='Host do servidor (padrao: 0.0.0.0)')
    parser.add_argument('--no-web', action='store_true',
                       help='Apenas gera imagem, nao inicia servidor')
    parser.add_argument('--output', '-o', type=str, default=None,
                       help='Caminho para salvar a imagem 3D')

    args = parser.parse_args()

    if args.no_web or args.output:
        output = args.output or 'assets/img/academia_3d.png'
        # Caminho relativo ao diretorio do projeto
        project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_path = os.path.join(project_dir, output) if not os.path.isabs(output) else output
        generate_and_save(output_path)
    else:
        run_server(host=args.host, port=args.port)
