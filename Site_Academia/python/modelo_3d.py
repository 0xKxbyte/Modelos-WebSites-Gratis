"""
Modelo 3D da Academia Iron Gym
Gera visualizacoes 3D interativas da estrutura da academia usando matplotlib e numpy.
Pode ser executado standalone ou importado pelo servidor Flask.

Uso:
    python modelo_3d.py              # Mostra visualizacao interativa
    python modelo_3d.py --output grafico.png  # Salva imagem PNG
"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import argparse
import os
import sys


class IronGym3D:
    """Gerador de modelo 3D da academia Iron Gym."""

    def __init__(self):
        self.fig = None
        self.ax = None
        self.colors = {
            'blue': '#0066ff',
            'dark_blue': '#0044cc',
            'light_blue': '#3388ff',
            'white': '#ffffff',
            'gray': '#6b7280',
            'dark_gray': '#2a2a2a',
            'black': '#0a0a0a',
            'floor': '#1a1a1a',
        }

    def _setup_plot(self):
        """Configura a figura 3D."""
        plt.style.use('dark_background')
        self.fig = plt.figure(figsize=(16, 10), facecolor='#0a0a0a')
        self.ax = self.fig.add_subplot(111, projection='3d', facecolor='#0a0a0a')
        self.ax.set_facecolor('#0a0a0a')
        self.fig.patch.set_facecolor('#0a0a0a')

        # Remover eixos e grades
        self.ax.grid(False)
        self.ax.xaxis.pane.fill = False
        self.ax.yaxis.pane.fill = False
        self.ax.zaxis.pane.fill = False
        self.ax.xaxis.pane.set_edgecolor('none')
        self.ax.yaxis.pane.set_edgecolor('none')
        self.ax.zaxis.pane.set_edgecolor('none')

        # Remover ticks
        self.ax.set_xticks([])
        self.ax.set_yticks([])
        self.ax.set_zticks([])

        # Ajustar limite dos eixos
        self.ax.set_xlim(-10, 10)
        self.ax.set_ylim(-10, 10)
        self.ax.set_zlim(0, 8)

        # Definir angulo de visualizacao
        self.ax.view_init(elev=25, azim=-60)

    def _add_cuboid(self, position, size, color='#ffffff', alpha=0.8, edge_color='#2a2a2a'):
        """Adiciona um paralelepipedo a cena 3D."""
        x, y, z = position
        dx, dy, dz = size

        vertices = [
            # Base inferior
            [(x, y, z), (x + dx, y, z), (x + dx, y + dy, z), (x, y + dy, z)],
            # Base superior
            [(x, y, z + dz), (x + dx, y, z + dz), (x + dx, y + dy, z + dz), (x, y + dy, z + dz)],
            # Lateral frontal
            [(x, y, z), (x + dx, y, z), (x + dx, y, z + dz), (x, y, z + dz)],
            # Lateral traseira
            [(x, y + dy, z), (x + dx, y + dy, z), (x + dx, y + dy, z + dz), (x, y + dy, z + dz)],
            # Lateral esquerda
            [(x, y, z), (x, y + dy, z), (x, y + dy, z + dz), (x, y, z + dz)],
            # Lateral direita
            [(x + dx, y, z), (x + dx, y + dy, z), (x + dx, y + dy, z + dz), (x + dx, y, z + dz)],
        ]

        collection = Poly3DCollection(
            vertices,
            facecolors=color,
            edgecolors=edge_color,
            linewidths=0.5,
            alpha=alpha,
            antialiased=True
        )
        self.ax.add_collection3d(collection)

    def _add_cylinder(self, position, radius, height, color='#ffffff', alpha=0.8):
        """Adiciona um cilindro simplificado (usando poligonos)."""
        x, y, z = position
        theta = np.linspace(0, 2 * np.pi, 20)
        circle_x = x + radius * np.cos(theta)
        circle_y = y + radius * np.sin(theta)

        # Base inferior
        verts_bottom = [list(zip(circle_x, circle_y, [z] * len(theta)))]
        # Base superior
        verts_top = [list(zip(circle_x, circle_y, [z + height] * len(theta)))]

        self.ax.add_collection3d(Poly3DCollection(verts_bottom, facecolors=color, alpha=alpha, edgecolors='#2a2a2a', linewidths=0.5))
        self.ax.add_collection3d(Poly3DCollection(verts_top, facecolors=color, alpha=alpha, edgecolors='#2a2a2a', linewidths=0.5))

        # Lateral
        for i in range(len(theta) - 1):
            verts_side = [
                (circle_x[i], circle_y[i], z),
                (circle_x[i + 1], circle_y[i + 1], z),
                (circle_x[i + 1], circle_y[i + 1], z + height),
                (circle_x[i], circle_y[i], z + height)
            ]
            self.ax.add_collection3d(Poly3DCollection([verts_side], facecolors=color, alpha=alpha, edgecolors='#2a2a2a', linewidths=0.5))

    def _add_text(self, x, y, z, text, color='#0066ff', size=12, ha='center'):
        """Adiciona texto 3D a cena."""
        self.ax.text(x, y, z, text, color=color, fontsize=size,
                     ha=ha, va='center', fontweight='bold',
                     fontfamily='sans-serif')

    def build_structure(self):
        """Constroi a estrutura 3D completa da academia."""
        self._setup_plot()

        # Chao
        self._add_cuboid((-9, -9, -0.1), (18, 18, 0.1), color='#1a1a1a', alpha=1.0, edge_color='#2a2a2a')

        # Paredes principais (vidro)
        self._add_cuboid((-8, -8, 0), (16, 0.3, 6), color='#0066ff', alpha=0.15, edge_color='#0066ff')
        self._add_cuboid((-8, 7.7, 0), (16, 0.3, 6), color='#0066ff', alpha=0.15, edge_color='#0066ff')
        self._add_cuboid((-8, -8, 0), (0.3, 16, 6), color='#0066ff', alpha=0.15, edge_color='#0066ff')
        self._add_cuboid((7.7, -8, 0), (0.3, 16, 6), color='#0066ff', alpha=0.15, edge_color='#0066ff')

        # Piso superior (mezanino)
        self._add_cuboid((-8, -5, 3.5), (15, 5, 0.2), color='#2a2a2a', alpha=0.6, edge_color='#0066ff')

        # --- Equipamentos de musculacao ---

        # Supinos/halteres (fileira 1)
        for i in range(5):
            x = -6 + i * 2.5
            self._add_cuboid((x, -6, 0.5), (1.5, 0.8, 1.2), color='#2a2a2a', alpha=0.9)
            # Anilhas
            self._add_cuboid((x - 0.2, -6.5, 0.3), (0.4, 0.4, 0.6), color='#0066ff', alpha=0.7)
            self._add_cuboid((x + 1.3, -6.5, 0.3), (0.4, 0.4, 0.6), color='#0066ff', alpha=0.7)

        # Fileira 2 de equipamentos
        for i in range(4):
            x = -5 + i * 3
            # Leg press
            self._add_cuboid((x, -3.5, 0.3), (2, 1.2, 1.5), color='#1a1a1a', alpha=0.9)
            self._add_cuboid((x + 0.3, -3.5, 1.8), (1.4, 1.2, 0.5), color='#0044cc', alpha=0.7)

        # --- Area de Crossfit ---
        self._add_cuboid((-8, 1, 0), (4, 6, 0.1), color='#0044cc', alpha=0.2, edge_color='#0066ff')

        # Barras de crossfit
        for i in range(4):
            x = -6 + i * 1.5
            self._add_cuboid((x, 2, 0), (0.2, 0.2, 4), color='#ffffff', alpha=0.6)
            # Barra horizontal
            self._add_cuboid((x, 3, 4), (0, 3, 0.1), color='#ffffff', alpha=0.8)

        # Cordas
        for i in range(2):
            x = -5 + i * 3
            self._add_cuboid((x, 6.5, 0.1), (0.1, 0.1, 3.5), color='#6b7280', alpha=0.7)

        # --- Area de cardio ---
        self._add_cuboid((2, -8, 0), (6, 4, 0.1), color='#3388ff', alpha=0.15, edge_color='#0066ff')

        # Esteiras
        for i in range(3):
            x = 3 + i * 1.8
            self._add_cuboid((x, -6, 0.2), (1.2, 0.8, 1.2), color='#2a2a2a', alpha=0.9)
            # Display
            self._add_cuboid((x + 0.2, -6, 1.4), (0.8, 0.8, 0.4), color='#0066ff', alpha=0.6)

        # Bicicletas
        for i in range(3):
            x = 3 + i * 1.8
            self._add_cuboid((x, -4, 0.2), (0.8, 0.5, 1.0), color='#1a1a1a', alpha=0.9)

        # --- Colunas estruturais ---
        for x in [-7, 7, -7, 7]:
            for y in [-7, 7]:
                self._add_cuboid((x - 0.3, y - 0.3, 0), (0.6, 0.6, 6), color='#2a2a2a', alpha=0.8, edge_color='#0066ff')

        # --- Teto com luzes ---
        for x in range(-6, 8, 3):
            self._add_cuboid((x, -7, 5.8), (0.1, 14, 0.1), color='#0066ff', alpha=0.3)

        # Luzes pontuais no teto
        for x in range(-5, 6, 3):
            for y in range(-5, 6, 3):
                self._add_cylinder((x, y, 5.9), 0.15, 0.1, color='#3388ff', alpha=0.5)

        # --- Placa Iron Gym nas paredes ---
        # Placa central (parede fundos)
        self._add_cuboid((-1.5, -7.8, 3), (3, 0.1, 0.8), color='#0066ff', alpha=0.8)
        self._add_cuboid((-2, -7.8, 2.8), (4, 0.1, 0.1), color='#ffffff', alpha=0.5)

        # Texto no centro
        self._add_text(0, -7.5, 4.2, 'IRON GYM', color='#0066ff', size=16)
        self._add_text(0, -7.5, 3.6, 'ACADEMIA', color='#ffffff', size=10)

        # --- Banco/Recepcao ---
        self._add_cuboid((4, 6, 0.2), (3, 1.5, 1.2), color='#0066ff', alpha=0.7)
        self._add_cuboid((4.5, 6.5, 1.4), (2, 0.5, 0.3), color='#ffffff', alpha=0.8)

        # --- Halteres pequenos (ornamentacao) ---
        for i in range(8):
            x = -7 + i * 1.8
            self._add_cuboid((x, -7, 0.2), (0.3, 0.3, 0.1), color='#0066ff', alpha=0.6)
            self._add_cuboid((x, -7, 0.35), (0.1, 0.1, 0.3), color='#ffffff', alpha=0.7)

        return self.fig, self.ax

    def add_animated_elements(self):
        """Adiciona elementos animados (particulas) - efeito visual estatico."""
        # Elementos decorativos flutuantes
        np.random.seed(42)
        for _ in range(30):
            x = np.random.uniform(-7, 7)
            y = np.random.uniform(-7, 7)
            z = np.random.uniform(0.5, 5)
            size = np.random.uniform(0.05, 0.15)
            alpha = np.random.uniform(0.1, 0.3)
            self.ax.scatter(x, y, z, c='#0066ff', s=size * 100, alpha=alpha, marker='o')

    def save_image(self, filename='grafico.png'):
        """Salva a visualizacao como imagem PNG."""
        try:
            # Garantir que o diretorio existe
            output_dir = os.path.dirname(filename)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir, exist_ok=True)

            self.build_structure()
            self.add_animated_elements()
            self.fig.savefig(filename, dpi=150, bbox_inches='tight',
                           facecolor='#0a0a0a', edgecolor='none')
            print(f"Imagem salva em: {os.path.abspath(filename)}")
            plt.close(self.fig)
            return True
        except Exception as e:
            print(f"Erro ao salvar imagem: {e}", file=sys.stderr)
            return False

    def show_interactive(self):
        """Exibe a visualizacao interativa 3D."""
        self.build_structure()
        self.add_animated_elements()
        plt.tight_layout()
        plt.show()


def generate_gym_animation_frames(output_dir='frames', n_frames=36):
    """
    Gera frames de animacao girando o modelo 3D.
    Pode ser combinado para criar GIF.
    """
    import os
    os.makedirs(output_dir, exist_ok=True)

    gym = IronGym3D()
    gym.build_structure()
    gym.add_animated_elements()

    for i in range(n_frames):
        angle = i * (360 / n_frames)
        gym.ax.view_init(elev=20, azim=angle)
        gym.fig.savefig(
            os.path.join(output_dir, f'frame_{i:03d}.png'),
            dpi=100,
            bbox_inches='tight',
            facecolor='#0a0a0a'
        )
        print(f"Frame {i+1}/{n_frames} salvo")

    plt.close(gym.fig)
    print(f"Frames salvos em: {os.path.abspath(output_dir)}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Iron Gym - Modelo 3D')
    parser.add_argument('--output', '-o', type=str, default=None,
                       help='Salvar imagem em arquivo (ex: grafico.png)')
    parser.add_argument('--frames', '-f', type=int, default=0,
                       help='Gerar N frames para animacao')
    parser.add_argument('--frames-dir', type=str, default='frames',
                       help='Diretorio para salvar frames')

    args = parser.parse_args()

    if args.output:
        gym = IronGym3D()
        gym.save_image(args.output)
    elif args.frames > 0:
        generate_gym_animation_frames(args.frames_dir, args.frames)
    else:
        gym = IronGym3D()
        print("Exibindo visualizacao 3D interativa. Feche a janela para sair.")
        gym.show_interactive()
