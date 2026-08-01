/**
 * VITALIS FARMA - Three.js 3D Scene
 * Cena 3D interativa com moleculas, particulas e animacoes
 * 
 * Requer: Three.js (CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js)
 */

class Vitalis3DScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2();
    this.targetRotation = new THREE.Vector2();
    this.currentRotation = new THREE.Vector2();

    this.moleculeGroup = null;
    this.particleSystem = null;
    this.pills = [];
    this.lights = [];

    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
    this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.0015);

    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    this.camera.position.set(0, 1.5, 7);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Lights
    this.setupLights();
    this.createMolecule();
    this.createParticleSystem();
    this.createFloatingPills();
    this.bindEvents();
    this.animate();
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0x404060, 0.4);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    const lightConfigs = [
      { color: 0x3b82f6, intensity: 0.8, pos: [-3, 2, 2] },
      { color: 0xef4444, intensity: 0.6, pos: [3, -1, 2] },
      { color: 0x94a3b8, intensity: 0.4, pos: [0, 3, -2] }
    ];

    lightConfigs.forEach(cfg => {
      const light = new THREE.PointLight(cfg.color, cfg.intensity, 12);
      light.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      this.scene.add(light);
      this.lights.push(light);
    });
  }

  createMolecule() {
    this.moleculeGroup = new THREE.Group();

    const points = [];
    const height = 3.5;
    const radius = 1.0;
    const turns = 3.5;
    const segments = 50;

    const helixMat1 = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.15,
      shininess: 100,
      transparent: true,
      opacity: 0.8
    });

    const helixMat2 = new THREE.MeshPhongMaterial({
      color: 0x64748b,
      emissive: 0x64748b,
      emissiveIntensity: 0.1,
      shininess: 100,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const mat = i % 2 === 0 ? helixMat1 : helixMat2;
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), mat);
      sphere.position.set(x, y, z);
      this.moleculeGroup.add(sphere);

      if (i > 0) {
        const prev = points[i - 1];
        this.createConnection(prev, new THREE.Vector3(x, y, z), 0x94a3b8, 0.15);
      }

      points.push(new THREE.Vector3(x, y, z));
    }

    // Cross connections (rungs)
    for (let i = 0; i <= segments; i += 4) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      this.createConnection(
        new THREE.Vector3(x1, y, z1),
        new THREE.Vector3(x2, y, z2),
        0x3b82f6, 0.15, 0.3
      );
    }

    // Center glow
    const glowMat = new THREE.MeshPhongMaterial({
      color: 0x95a5a6,
      transparent: true,
      opacity: 0.1,
      emissive: 0x95a5a6,
      emissiveIntensity: 0.1
    });
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, height, 8), glowMat);
    glow.position.set(0, 0, 0);
    this.moleculeGroup.add(glow);

    this.scene.add(this.moleculeGroup);
  }

  createConnection(start, end, color, opacity = 1, thickness = 0.03) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const mat = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: opacity
    });

    const geo = new THREE.CylinderGeometry(thickness, thickness, length, 4, 1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(mid);

    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize());
    mesh.quaternion.copy(quat);

    this.moleculeGroup.add(mesh);
  }

  createParticleSystem() {
    const count = 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const colorPalette = [
      new THREE.Color(0x3b82f6),
      new THREE.Color(0x94a3b8),
      new THREE.Color(0x64748b),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 4 + Math.random() * 4;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 0.015 + Math.random() * 0.04;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  createFloatingPills() {
    const configs = [
      { c1: 0x3b82f6, c2: 0xffffff, pos: [-2.2, -0.8, 0.8] },
      { c1: 0x64748b, c2: 0xef4444, pos: [2.2, 0.3, -0.8] },
      { c1: 0x94a3b8, c2: 0x3b82f6, pos: [0, -1.2, 1.8] },
      { c1: 0xef4444, c2: 0x94a3b8, pos: [-1.8, 1.5, -1.2] },
      { c1: 0xffffff, c2: 0x3b82f6, pos: [1.5, -1.5, -1.5] }
    ];

    configs.forEach(cfg => {
      const group = new THREE.Group();

      const bodyMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
        shininess: 120,
        specular: 0x444444
      });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 16), bodyMat);
      body.position.y = 0;
      group.add(body);

      const topMat = new THREE.MeshPhongMaterial({
        color: cfg.c1,
        emissive: cfg.c1,
        emissiveIntensity: 0.15,
        shininess: 100
      });
      const top = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        topMat
      );
      top.position.y = 0.25;
      group.add(top);

      const bottomMat = new THREE.MeshPhongMaterial({
        color: cfg.c2,
        emissive: cfg.c2,
        emissiveIntensity: 0.15,
        shininess: 100
      });
      const bottom = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        bottomMat
      );
      bottom.position.y = -0.25;
      group.add(bottom);

      // Glow ring
      const ringMat = new THREE.MeshPhongMaterial({
        color: cfg.c1,
        transparent: true,
        opacity: 0.2,
        emissive: cfg.c1,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.45, 24), ringMat);
      ring.position.y = 0;
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      group.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);

      const data = {
        group: group,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.7,
        rotSpeed: 0.005 + Math.random() * 0.01,
        floatAmp: 0.2 + Math.random() * 0.15,
        startY: cfg.pos[1]
      };

      this.scene.add(group);
      this.pills.push(data);
    });
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.targetRotation.x = this.mouse.y * 0.15;
      this.targetRotation.y = this.mouse.x * 0.15;
    });

    // Touch support
    this.container.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      this.targetRotation.x = this.mouse.y * 0.15;
      this.targetRotation.y = this.mouse.x * 0.15;
    }, { passive: true });
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();
    const delta = this.clock.getDelta();

    // Smooth camera rotation based on mouse
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.05;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.05;

    // Molecule animation
    if (this.moleculeGroup) {
      this.moleculeGroup.rotation.y += 0.003;
      this.moleculeGroup.rotation.x = Math.sin(elapsed * 0.08) * 0.05 + this.currentRotation.x;
      this.moleculeGroup.rotation.z = Math.sin(elapsed * 0.05) * 0.03;

      // Pulse effect
      const pulse = 1 + Math.sin(elapsed * 0.5) * 0.02;
      this.moleculeGroup.scale.set(pulse, pulse, pulse);
    }

    // Particles
    if (this.particleSystem) {
      this.particleSystem.rotation.y += 0.0003;
      this.particleSystem.rotation.x = Math.sin(elapsed * 0.03) * 0.03;

      const positions = this.particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const idx = i / 3;
        const speed = 0.0005 + (idx % 5) * 0.0002;
        const theta = Math.atan2(positions[i + 2], positions[i]);
        const phi = Math.asin(positions[i + 1] / Math.sqrt(
          positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2
        ));
        const radius = Math.sqrt(
          positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2
        );

        const newTheta = theta + speed;
        positions[i] = radius * Math.cos(phi) * Math.cos(newTheta);
        positions[i + 2] = radius * Math.cos(phi) * Math.sin(newTheta);
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Floating pills
    this.pills.forEach(pill => {
      const offset = Math.sin(elapsed * pill.speed + pill.phase) * pill.floatAmp;
      pill.group.position.y = pill.startY + offset;
      pill.group.rotation.x = Math.sin(elapsed * 0.6 + pill.phase) * 0.15;
      pill.group.rotation.z = Math.cos(elapsed * 0.4 + pill.phase) * 0.1;
      pill.group.rotation.y += pill.rotSpeed;
    });

    // Animate lights
    this.lights.forEach((light, i) => {
      const speed = 0.3 + i * 0.2;
      const phase = i * 1.5;
      light.position.x += Math.sin(elapsed * speed + phase) * 0.003;
      light.position.y += Math.cos(elapsed * speed * 0.7 + phase) * 0.003;
    });

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const heroScene = document.getElementById('hero3d');
  if (heroScene) {
    new Vitalis3DScene('hero3d');
  }
});
