(function () {
  'use strict';

  const container = document.getElementById('hero-canvas');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // === LIGHTS ===
  const ambient = new THREE.AmbientLight(0x222244, 0.4);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffe8c8, 1.8);
  keyLight.position.set(4, 8, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x4466aa, 0.6);
  fillLight.position.set(-4, 2, -6);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xc9a84c, 0.3);
  rimLight.position.set(0, -4, -8);
  scene.add(rimLight);

  const pointLight = new THREE.PointLight(0xc9a84c, 0.8, 12);
  pointLight.position.set(0, 2, 3);
  scene.add(pointLight);

  // === MAIN GROUP ===
  const world = new THREE.Group();
  scene.add(world);

  // ---- JUSTICE SCALE ----
  const scaleGroup = new THREE.Group();

  function createScalePart(geo, color, metalness, roughness, pos) {
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness,
      envMapIntensity: 0.6
    });
    const mesh = new THREE.Mesh(geo, mat);
    if (pos) {
      mesh.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
    }
    return mesh;
  }

  // Base platform
  const base = createScalePart(
    new THREE.CylinderGeometry(0.65, 0.75, 0.12, 48),
    0x1a1a1a, 0.3, 0.5,
    { y: -1.4 }
  );
  scaleGroup.add(base);

  const baseRim = createScalePart(
    new THREE.TorusGeometry(0.7, 0.03, 8, 48),
    0xc9a84c, 0.8, 0.2,
    { y: -1.34 }
  );
  scaleGroup.add(baseRim);

  // Pillar
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c,
    metalness: 0.9,
    roughness: 0.15,
    envMapIntensity: 0.8
  });
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 2.6, 12), pillarMat);
  pillar.position.y = -0.1;
  scaleGroup.add(pillar);

  // Pillar details - rings
  for (let i = 0; i < 3; i++) {
    const ring = createScalePart(
      new THREE.TorusGeometry(0.08 + i * 0.02, 0.012, 6, 16),
      0xc9a84c, 0.7, 0.25,
      { y: -0.9 + i * 0.9 }
    );
    scaleGroup.add(ring);
  }

  // Top beam
  const beam = createScalePart(
    new THREE.BoxGeometry(2.0, 0.06, 0.1),
    0xc9a84c, 0.9, 0.1,
    { y: 1.2 }
  );
  scaleGroup.add(beam);

  // Beam end caps
  for (let side of [-1, 1]) {
    const cap = createScalePart(
      new THREE.SphereGeometry(0.06, 8, 8),
      0xc9a84c, 0.8, 0.2,
      { x: side * 1.0, y: 1.2 }
    );
    scaleGroup.add(cap);
  }

  // Scale pans
  function createPan(x) {
    const group = new THREE.Group();

    const pan = createScalePart(
      new THREE.CylinderGeometry(0.55, 0.6, 0.04, 32),
      0xc9a84c, 0.7, 0.2
    );
    group.add(pan);

    const panInner = createScalePart(
      new THREE.CylinderGeometry(0.4, 0.4, 0.02, 32),
      0x2a2a2a, 0.5, 0.4,
      { y: 0.03 }
    );
    group.add(panInner);

    // Chain strings
    const chainMat = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      metalness: 0.8,
      roughness: 0.2
    });
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
      const cx = Math.cos(angle) * 0.35;
      const cz = Math.sin(angle) * 0.35;
      for (let j = 0; j < 4; j++) {
        const link = new THREE.Mesh(new THREE.TorusGeometry(0.015, 0.005, 4, 6), chainMat);
        link.position.set(cx, 0.35 + j * 0.08, cz);
        group.add(link);
      }
    }

    group.position.set(x, 0.65, 0);
    return group;
  }

  const leftPan = createPan(-1.0);
  scaleGroup.add(leftPan);

  const rightPan = createPan(1.0);
  scaleGroup.add(rightPan);

  // ---- GAVEL on right pan ----
  const gavelGroup = new THREE.Group();

  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x3a2510,
    metalness: 0.2,
    roughness: 0.7
  });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 8), handleMat);
  handle.rotation.z = Math.PI / 2.2;
  handle.position.set(0.15, 0.04, 0);
  gavelGroup.add(handle);

  const headMat = new THREE.MeshStandardMaterial({
    color: 0x4a3018,
    metalness: 0.3,
    roughness: 0.6
  });
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.12), headMat);
  head.position.set(-0.03, 0.04, 0);
  head.rotation.z = 0.15;
  gavelGroup.add(head);

  const goldRing = createScalePart(
    new THREE.TorusGeometry(0.06, 0.01, 6, 12),
    0xc9a84c, 0.9, 0.1,
    { x: 0.08, y: 0.04 }
  );
  gavelGroup.add(goldRing);

  gavelGroup.position.set(1.0, 0.75, 0);
  scaleGroup.add(gavelGroup);

  // ---- LAW BOOKS on left pan ----
  const bookGroup = new THREE.Group();
  const bookColors = [0x1a1a1a, 0x2a1f14, 0x1f1f1f];
  for (let i = 0; i < 3; i++) {
    const book = createScalePart(
      new THREE.BoxGeometry(0.25, 0.05 + i * 0.02, 0.18),
      bookColors[i], 0.1, 0.8,
      { x: 0.02, y: 0.04 + i * 0.06, z: 0.01 }
    );
    bookGroup.add(book);

    if (i < 2) {
      const ribbon = createScalePart(
        new THREE.BoxGeometry(0.01, 0.02, 0.19),
        0xc9a84c, 0.5, 0.3,
        { x: 0.06, y: 0.07 + i * 0.06 }
      );
      bookGroup.add(ribbon);
    }
  }
  bookGroup.position.set(-1.0, 0.74, 0);
  scaleGroup.add(bookGroup);

  // Position scale
  scaleGroup.position.y = 0.2;
  world.add(scaleGroup);

  // ---- FLOATING PARTICLES ----
  const particleCount = 600;
  const particlePos = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  const particleSpeeds = new Float32Array(particleCount);
  const particleData = [];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePos[i3] = (Math.random() - 0.5) * 22;
    particlePos[i3 + 1] = (Math.random() - 0.5) * 16;
    particlePos[i3 + 2] = (Math.random() - 0.5) * 12 - 4;
    particleSizes[i] = 0.01 + Math.random() * 0.04;
    particleSpeeds[i] = 0.1 + Math.random() * 0.3;
    particleData.push({
      baseY: particlePos[i3 + 1],
      phase: Math.random() * Math.PI * 2,
      speed: particleSpeeds[i]
    });
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

  const particleMat = new THREE.PointsMaterial({
    size: 0.03,
    transparent: true,
    opacity: 0.4,
    color: 0xc9a84c,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  world.add(particles);

  // ---- ORBITING RINGS ----
  const rings = [];
  for (let i = 0; i < 4; i++) {
    const radius = 2.0 + i * 0.45;
    const ringGeo = new THREE.TorusGeometry(radius, 0.012, 12, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.15 + i * 0.05,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.8 + (i - 1.5) * 0.12;
    ring.rotation.y = i * 0.8;
    ring.position.y = -0.6 + i * 0.3;
    ring.userData = {
      speed: 0.08 + i * 0.03,
      tilt: (i - 1.5) * 0.05
    };
    world.add(ring);
    rings.push(ring);
  }

  // ---- FLOATING LINES (elegant curves) ----
  const lineGroup = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xc9a84c,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending
  });

  for (let i = 0; i < 8; i++) {
    const points = [];
    const startAngle = (i / 8) * Math.PI * 2;
    const radius = 2.5 + Math.random() * 1.5;
    for (let t = 0; t <= 1; t += 0.02) {
      const angle = startAngle + t * Math.PI * 2;
      const x = Math.cos(angle) * radius * (0.8 + t * 0.2);
      const z = Math.sin(angle) * radius * (0.8 + t * 0.2);
      const y = Math.sin(t * Math.PI * 3) * 1.5 - 0.5;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(60);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const line = new THREE.Line(curveGeo, lineMat);
    line.userData = { speed: 0.05 + Math.random() * 0.05, phase: i };
    lineGroup.add(line);
  }
  world.add(lineGroup);

  // Camera position
  camera.position.set(0, 0.8, 5.8);
  camera.lookAt(0, 0, 0);

  // === MOUSE INTERACTION ===
  let mouseX = 0, mouseY = 0;
  let targetRotX = 0, targetRotY = 0;

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
    }
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: true });

  // === ANIMATION LOOP ===
  let time = 0;
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    time += delta;

    // Smooth mouse follow
    targetRotY += (mouseX * 0.35 - targetRotY) * 0.025;
    targetRotX += (mouseY * 0.2 - targetRotX) * 0.025;

    world.rotation.y = targetRotY;
    world.rotation.x = Math.sin(time * 0.15) * 0.04 + targetRotX * 0.08;

    // Scale sway
    scaleGroup.rotation.z = Math.sin(time * 0.4) * 0.025;

    // Gavel move
    gavelGroup.rotation.z = Math.sin(time * 1.3) * 0.06;
    gavelGroup.position.y = 0.75 + Math.sin(time * 0.8) * 0.01;

    // Books float
    bookGroup.position.y = 0.74 + Math.sin(time * 0.6) * 0.008;

    // Pans balance
    leftPan.rotation.z = Math.sin(time * 0.5) * 0.02;
    rightPan.rotation.z = -Math.sin(time * 0.5 + 0.5) * 0.02;

    // Rings animate
    rings.forEach((ring, i) => {
      ring.rotation.y += delta * ring.userData.speed;
      ring.rotation.x = Math.PI / 2.8 + (i - 1.5) * 0.12 + Math.sin(time * 0.2 + i) * 0.03;
    });

    // Floating lines
    lineGroup.children.forEach((line, i) => {
      line.rotation.y += delta * line.userData.speed;
      line.rotation.x = Math.sin(time * 0.1 + i) * 0.02;
    });

    // Particles float
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const d = particleData[i];
      pos[i * 3 + 1] = d.baseY + Math.sin(time * d.speed + d.phase) * 0.4;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Point light orbit
    pointLight.position.x = Math.sin(time * 0.25) * 3.5;
    pointLight.position.z = Math.cos(time * 0.25) * 3.5;
    pointLight.position.y = 1.5 + Math.sin(time * 0.3) * 0.5;

    renderer.render(scene, camera);
  }

  animate();

  // === RESIZE ===
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);

  // === CLEANUP ===
  window.addEventListener('beforeunload', function () {
    renderer.dispose();
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('touchmove', onTouchMove);
  });

})();
