"""
Vitalis Farma - Backend Python
Servidor Flask com endpoints para:
- Modelos 3D interativos (Three.js integration)
- API de recomendacao de produtos
- Geracao de relatorios
- Analise de dados farmaceuticos
"""

import os
import json
import random
import math
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, send_from_directory, render_template_string
from flask_cors import CORS

app = Flask(__name__, static_folder='../static', static_url_path='/static')
CORS(app)

# ============================================================
# DADOS DE EXEMPLO - MODELOS 3D
# ============================================================

MOLECULA_DNA = {
    "name": "DNA_Hélix",
    "type": "molecular",
    "description": "Hélice dupla de DNA representando a base da vida e da saúde",
    "color_scheme": ["#FF6B6B", "#4ECDC4", "#FFE66D"],
    "particles": [
        {"x": 0, "y": 0, "z": 0, "color": "#FF6B6B", "size": 0.3},
        {"x": 0.5, "y": 0.2, "z": 0, "color": "#4ECDC4", "size": 0.25},
        {"x": -0.5, "y": -0.2, "z": 0, "color": "#FFE66D", "size": 0.25},
        {"x": 0.3, "y": 0.5, "z": 0.3, "color": "#FF6B6B", "size": 0.2},
        {"x": -0.3, "y": -0.5, "z": -0.3, "color": "#4ECDC4", "size": 0.2},
    ],
    "rotation_speed": 0.005,
    "connections": [
        [0, 1], [1, 2], [2, 0],
        [0, 3], [1, 4], [3, 4]
    ]
}

MOLECULA_MEDICAMENTO = {
    "name": "Molecular_Compound",
    "type": "drug",
    "description": "Estrutura molecular de composto farmaceutico em 3D",
    "color_scheme": ["#4ECDC4", "#FF6B6B", "#2C3E50"],
    "atoms": [
        {"element": "C", "x": 0, "y": 0, "z": 0, "radius": 0.4, "color": "#2C3E50"},
        {"element": "O", "x": 0.8, "y": 0.5, "z": 0.3, "radius": 0.5, "color": "#FF6B6B"},
        {"element": "N", "x": -0.7, "y": 0.6, "z": -0.2, "radius": 0.45, "color": "#4ECDC4"},
        {"element": "H", "x": 0.3, "y": -0.4, "z": -0.5, "radius": 0.25, "color": "#FFE66D"},
        {"element": "C", "x": -0.4, "y": -0.3, "z": 0.6, "radius": 0.4, "color": "#2C3E50"},
    ],
    "bonds": [
        [0, 1, 1.0], [0, 2, 1.0], [0, 3, 1.0], [0, 4, 1.0]
    ]
}

# ============================================================
# ENDPOINTS DA API
# ============================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Verifica se o servidor esta operacional"""
    return jsonify({
        "status": "online",
        "service": "Vitalis Farma - Backend 3D",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/3d/dna', methods=['GET'])
def get_dna_model():
    """Retorna dados do modelo 3D de DNA"""
    return jsonify(MOLECULA_DNA)

@app.route('/api/3d/molecule', methods=['GET'])
def get_molecule_model():
    """Retorna dados do modelo molecular 3D"""
    return jsonify(MOLECULA_MEDICAMENTO)

@app.route('/api/3d/particles', methods=['GET'])
def generate_particles():
    """Gera sistema de particulas 3D animado"""
    count = request.args.get('count', 150, type=int)
    particles = []
    for i in range(count):
        theta = random.uniform(0, 2 * math.pi)
        phi = random.uniform(0, math.pi)
        radius = random.uniform(2, 8)
        particles.append({
            "x": radius * math.sin(phi) * math.cos(theta),
            "y": radius * math.sin(phi) * math.sin(theta),
            "z": radius * math.cos(phi),
            "size": random.uniform(0.02, 0.08),
            "color": random.choice(["#FF6B6B", "#4ECDC4", "#FFE66D", "#FFFFFF"]),
            "speed": random.uniform(0.001, 0.005),
            "phase": random.uniform(0, 2 * math.pi)
        })
    return jsonify({"particles": particles, "count": count})

@app.route('/api/3d/scene-config', methods=['GET'])
def get_scene_config():
    """Configuracao da cena 3D para o Three.js"""
    return jsonify({
        "background_color": 0x0a0a0a,
        "fog_color": 0x0a0a0a,
        "fog_density": 0.0025,
        "ambient_light_color": 0x404060,
        "ambient_light_intensity": 0.5,
        "directional_light_color": 0xffffff,
        "directional_light_intensity": 0.8,
        "camera_position": {"x": 0, "y": 2, "z": 8},
        "orbit_controls": {
            "enable_damping": True,
            "damping_factor": 0.05,
            "min_distance": 3,
            "max_distance": 20
        },
        "colors": {
            "primary": "#FF6B6B",
            "secondary": "#4ECDC4",
            "accent": "#FFE66D",
            "light": "#FFFFFF",
            "gray": "#95A5A6",
            "dark": "#2C3E50"
        }
    })

@app.route('/api/3d/medication-pill', methods=['GET'])
def generate_medication_pill():
    """Gera modelo 3D de capsula de medicamento"""
    colors = request.args.get('colors', '["#FF6B6B","#FFE66D"]')
    try:
        color_list = json.loads(colors)
    except:
        color_list = ["#FF6B6B", "#FFE66D"]

    pill = {
        "name": "Capsula Vitalis",
        "type": "capsule",
        "height": 1.2,
        "radius": 0.4,
        "segments": 32,
        "colors": color_list,
        "top_color": color_list[0] if len(color_list) > 0 else "#FF6B6B",
        "bottom_color": color_list[1] if len(color_list) > 1 else "#FFE66D",
        "body_color": "#FFFFFF",
        "emissive": 0x222222,
        "rotation_speed": 0.01,
        "floating_amplitude": 0.2,
        "floating_frequency": 1.5
    }
    return jsonify(pill)

@app.route('/api/analytics/recommendations', methods=['GET'])
def get_recommendations():
    """Sistema de recomendacao simples baseado em tendencias"""
    recommendations = [
        {
            "id": 1,
            "name": "Vitamina D 2000UI",
            "reason": "Baixa exposicao solar no inverno",
            "confidence": random.uniform(0.7, 0.95)
        },
        {
            "id": 2,
            "name": "Protetor Solar FPS 60",
            "reason": "Protecao essencial durante todo o ano",
            "confidence": random.uniform(0.8, 0.98)
        },
        {
            "id": 3,
            "name": "Omega 3 1000mg",
            "reason": "Saude cardiovascular e cerebral",
            "confidence": random.uniform(0.75, 0.92)
        },
        {
            "id": 4,
            "name": "Complexo B",
            "reason": "Energia e disposicao para o dia a dia",
            "confidence": random.uniform(0.65, 0.88)
        },
        {
            "id": 5,
            "name": "Probióticos",
            "reason": "Saude intestinal e imunidade",
            "confidence": random.uniform(0.7, 0.9)
        }
    ]
    return jsonify({
        "recommendations": recommendations,
        "generated_at": datetime.now().isoformat()
    })

@app.route('/api/analytics/trends', methods=['GET'])
def get_trends():
    """Dados de tendencias de saude sazonais"""
    current_month = datetime.now().month
    seasonal_trends = {
        "summer": ["Protetor Solar", "Hidratante", "Repelente", "Anti-histaminico"],
        "winter": ["Vitamina D", "Xarope", "Descongestionante", "Vitamina C"],
        "spring": ["Antialergico", "Polen", "Colirio", "Probiotico"],
        "fall": ["Imunomodulador", "Omega 3", "Vitamina C", "Zinco"]
    }

    if 12 <= current_month <= 2:
        season = "summer"
    elif 3 <= current_month <= 5:
        season = "fall"
    elif 6 <= current_month <= 8:
        season = "winter"
    else:
        season = "spring"

    return jsonify({
        "current_season": season,
        "trending_products": seasonal_trends[season],
        "period": {
            "start": (datetime.now() - timedelta(days=30)).isoformat(),
            "end": datetime.now().isoformat()
        }
    })

@app.route('/api/reports/health-tips', methods=['GET'])
def get_health_tips():
    """Dicas de saude geradas pelo sistema"""
    tips = [
        "Beba pelo menos 2 litros de agua por dia para manter o corpo hidratado.",
        "A vitamina C ajuda a fortalecer o sistema imunologico - consuma frutas citricas diariamente.",
        "Nao se automedique. Consulte sempre um farmaceutico ou medico antes de usar medicamentos.",
        "Mantenha a vacinacao em dia para prevenir doencas sazonais.",
        "O uso de protetor solar e recomendado mesmo em dias nublados.",
        "Armazene medicamentos em local fresco e seco, longe da luz solar direta.",
        "Realize exames de rotina pelo menos uma vez ao ano.",
        "Uma alimentacao balanceada e a base para uma vida saudavel.",
        "Pratique exercicios fisicos regularmente - 30 minutos por dia fazem diferenca.",
        "Durma de 7 a 8 horas por noite para uma recuperacao adequada do organismo.",
        "Evite o consumo excessivo de alcool e nao fume.",
        "Mantenha um peso saudavel para prevenir doencas cardiovasculares.",
        "Lave as maos frequentemente para prevenir infeccoes.",
        "Gerencie o estresse com tecnicas de relaxamento e meditacao.",
        "Consulte um farmaceutico antes de combinar medicamentos."
    ]

    count = request.args.get('count', 3, type=int)
    return jsonify({
        "tips": random.sample(tips, min(count, len(tips))),
        "total_available": len(tips)
    })

@app.route('/api/3d/scene-script', methods=['GET'])
def get_scene_script():
    """Retorna script Three.js completo para a cena 3D"""
    script = '''
// Vitalis Farma - Three.js Scene
// Gerado pelo backend Python

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.0025);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0xff6b6b, 1, 15);
pointLight1.position.set(-3, 2, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x4ecdc4, 1, 15);
pointLight2.position.set(3, -1, 2);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xffe66d, 0.5, 10);
pointLight3.position.set(0, 3, -2);
scene.add(pointLight3);

// DNA Helix
function createDNAHelix() {
    const group = new THREE.Group();
    const points = [];
    const height = 4;
    const radius = 1.2;
    const turns = 4;
    const segments = 60;

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = t * Math.PI * 2 * turns;
        const y = (t - 0.5) * height;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, y, z));

        const sphereMat = new THREE.MeshPhongMaterial({
            color: i % 2 === 0 ? 0xff6b6b : 0x4ecdc4,
            emissive: i % 2 === 0 ? 0xff6b6b : 0x4ecdc4,
            emissiveIntensity: 0.3,
            shininess: 100
        });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), sphereMat);
        sphere.position.set(x, y, z);
        group.add(sphere);

        // Cross connections
        if (i < segments) {
            const nextAngle = ((i + 1) / segments) * Math.PI * 2 * turns;
            const nextY = ((i + 1) / segments - 0.5) * height;
            const nextX = Math.cos(nextAngle) * radius;
            const nextZ = Math.sin(nextAngle) * radius;

            // Rung
            const rungMat = new THREE.MeshPhongMaterial({
                color: 0xffe66d,
                emissive: 0xffe66d,
                emissiveIntensity: 0.1,
                transparent: true,
                opacity: 0.6
            });
            const midX = (x + -x) / 2;
            const midZ = (z + -z) / 2;
            const rungLength = Math.sqrt(Math.pow(2 * x, 2) + Math.pow(2 * z, 2));
            const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, rungLength, 4), rungMat);
            rung.position.set(midX, y, midZ);
            rung.rotation.z = Math.PI / 2;
            group.add(rung);
        }
    }

    // Center axis
    const axisMat = new THREE.MeshPhongMaterial({
        color: 0x95a5a6,
        transparent: true,
        opacity: 0.2
    });
    const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, height, 8), axisMat);
    axis.position.set(0, 0, 0);
    group.add(axis);

    return group;
}

const dnaHelix = createDNAHelix();
scene.add(dnaHelix);

// Particle system
function createParticles() {
    const count = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 5 + Math.random() * 3;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.5;
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const color = new THREE.Color();
        color.setHSL(0.6 + Math.random() * 0.3, 0.8, 0.5 + Math.random() * 0.3);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = 0.02 + Math.random() * 0.06;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    return new THREE.Points(geometry, material);
}

const particles = createParticles();
scene.add(particles);

// Floating pills
function createPill(color1, color2, x, y, z) {
    const group = new THREE.Group();

    // Body
    const bodyMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        shininess: 100
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16), bodyMat);
    body.position.y = 0;
    group.add(body);

    // Top cap
    const topMat = new THREE.MeshPhongMaterial({
        color: color1,
        emissive: color1,
        emissiveIntensity: 0.2,
        shininess: 100
    });
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), topMat);
    top.position.y = 0.3;
    group.add(top);

    // Bottom cap
    const bottomMat = new THREE.MeshPhongMaterial({
        color: color2,
        emissive: color2,
        emissiveIntensity: 0.2,
        shininess: 100
    });
    const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), bottomMat);
    bottom.position.y = -0.3;
    group.add(bottom);

    group.position.set(x, y, z);
    return group;
}

const pill1 = createPill(0xff6b6b, 0xffe66d, -2.5, -1, 1);
const pill2 = createPill(0x4ecdc4, 0xff6b6b, 2.5, 0.5, -1);
const pill3 = createPill(0xffe66d, 0x4ecdc4, 0, -1.5, 2);
scene.add(pill1);
scene.add(pill2);
scene.add(pill3);

// Floating animation
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    dnaHelix.rotation.y += 0.005;
    dnaHelix.rotation.x = Math.sin(elapsed * 0.1) * 0.1;

    particles.rotation.y += 0.0005;
    particles.rotation.x = Math.sin(elapsed * 0.05) * 0.05;

    pill1.position.y = -1 + Math.sin(elapsed * 1.5) * 0.3;
    pill1.rotation.x = Math.sin(elapsed * 0.5) * 0.2;
    pill1.rotation.y += 0.01;

    pill2.position.y = 0.5 + Math.sin(elapsed * 1.2 + 1) * 0.3;
    pill2.rotation.x = Math.sin(elapsed * 0.7 + 1) * 0.2;
    pill2.rotation.y += 0.015;

    pill3.position.y = -1.5 + Math.sin(elapsed * 1.8 + 2) * 0.3;
    pill3.rotation.x = Math.sin(elapsed * 0.6 + 2) * 0.2;
    pill3.rotation.y += 0.012;

    pointLight1.position.x = -3 + Math.sin(elapsed * 0.5) * 0.5;
    pointLight1.position.y = 2 + Math.cos(elapsed * 0.7) * 0.5;

    pointLight2.position.x = 3 + Math.sin(elapsed * 0.3 + 2) * 0.5;
    pointLight2.position.y = -1 + Math.cos(elapsed * 0.5 + 1) * 0.5;

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
    '''
    return jsonify({"script": script, "length": len(script)})

@app.route('/api/model/3d/drug-interaction', methods=['GET'])
def drug_interaction_model():
    """Modelo 3D de interacao medicamentosa"""
    drug_a = request.args.get('drug_a', 'Paracetamol')
    drug_b = request.args.get('drug_b', 'Ibuprofeno')

    model = {
        "title": f"Interacao: {drug_a} + {drug_b}",
        "type": "interaction_3d",
        "drugs": [drug_a, drug_b],
        "interaction_level": random.choice(["Leve", "Moderada", "Grave"]),
        "description": f"Modelo 3D representando a interacao molecular entre {drug_a} e {drug_b}",
        "molecular_structure": {
            "atoms": [
                {"element": "C", "x": 0, "y": 0, "z": 0, "color": "#2C3E50"},
                {"element": "O", "x": 0.8, "y": 0.5, "z": 0.3, "color": "#FF6B6B"},
                {"element": "H", "x": -0.5, "y": -0.3, "z": 0.5, "color": "#FFFFFF"},
                {"element": "N", "x": 0.2, "y": 0.8, "z": -0.3, "color": "#4ECDC4"},
                {"element": "C", "x": -0.7, "y": 0.2, "z": -0.4, "color": "#2C3E50"},
            ]
        },
        "warning": "Consulte um farmaceutico antes de combinar medicamentos"
    }
    return jsonify(model)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    print(f" Vitalis Farma - Backend 3D rodando na porta {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
