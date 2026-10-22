import {
  AdditiveBlending, AmbientLight, BufferAttribute, BufferGeometry, Color, DirectionalLight, DynamicDrawUsage, Group, IcosahedronGeometry,
  InstancedMesh, Matrix4, MeshStandardMaterial, Object3D, PerspectiveCamera, Points, Quaternion, Scene, ShaderMaterial, Vector2, Vector3, Vector4, WebGLRenderer,
} from "three";
import { createFormation, createGalaxy } from "./galaxy-data";
import { storyProgress, storyScroll } from "./story-progress";

export function mountGalaxy(canvas: HTMLCanvasElement, region: HTMLElement, onFailure: () => void) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);
  const group = new Group();
  const data = createGalaxy();
  const trails = Array.from({ length: 8 }, () => new Vector4(0, 0, -10, 0));
  const cursorDrift = new Vector2();
  const targetDrift = new Vector2();
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(data.positions, 3));
  geometry.setAttribute("color", new BufferAttribute(data.colors, 3));
  geometry.setAttribute("size", new BufferAttribute(data.sizes, 1));
  geometry.setAttribute("flow", new BufferAttribute(data.flow, 4));
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      brightness: { value: 0.88 }, pixelScale: { value: 500 },
      dispersion: { value: 0 }, clock: { value: 0 }, trails: { value: trails },
      flowClock: { value: 0 }, cursorDrift: { value: cursorDrift },
      formation: { value: new Vector2() },
      pointerForce: { value: 0 },
      starMorph: { value: 1 }, sourceTransform: { value: new Matrix4() },
    },
    vertexShader: `
      attribute vec3 color;
      attribute float size;
      attribute vec4 flow;
      attribute vec3 origin;
      uniform float pixelScale;
      uniform float dispersion;
      uniform float clock;
      uniform float flowClock;
      uniform vec4 trails[8];
      uniform vec2 cursorDrift;
      uniform vec2 formation;
      uniform float pointerForce;
      uniform float starMorph;
      uniform mat4 sourceTransform;
      varying vec3 tint;
      varying float life;
      float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      void main() {
        tint = color;
        // Preserve each population's radial density while recycling stars invisibly at the ends.
        float phase = fract(pow(flow.x / flow.z, 1.0 / flow.w) - flowClock * 0.012);
        float radius = pow(phase, flow.w) * flow.z;
        float originalWarmth = max(0.0, 1.0 - flow.x / 4.0);
        float warmth = max(0.0, 1.0 - radius / 4.0);
        tint = color / vec3(0.65 + originalWarmth * 0.35, 0.75 + originalWarmth * 0.13, 1.0 - originalWarmth * 0.25)
          * vec3(0.65 + warmth * 0.35, 0.75 + warmth * 0.13, 1.0 - warmth * 0.25);
        float angle = flow.y + (radius - flow.x) * 0.57 - flowClock * 0.025;
        vec2 jitter = position.xy - vec2(cos(flow.y), sin(flow.y)) * flow.x;
        vec3 flowing = vec3(vec2(cos(angle), sin(angle)) * radius + jitter, position.z);
        life = smoothstep(0.0, 0.025, phase) * smoothstep(0.0, 0.045, 1.0 - phase);
        vec3 scatter = vec3(hash(position), hash(position.yzx), hash(position.zxy)) * 2.0 - 1.0;
        vec3 direction = normalize(position * vec3(0.25, 0.25, 0.1) + scatter + vec3(0.001));
        vec3 expanded = flowing + direction * dispersion * (18.0 + hash(position + 1.0) * 36.0);
        float seed = hash(position + 2.0);
        // Small reversible ambient offsets compose with the scroll-driven blast.
        expanded += dispersion * vec3(sin(clock * 0.19 + seed * 23.0), cos(clock * 0.14 + seed * 31.0), sin(clock * 0.12 + seed * 17.0)) * 0.65;
        life = mix(life, 0.68 + 0.22 * sin(clock * (0.35 + seed * 0.5) + seed * 40.0), dispersion);
        // Each story star starts on the asteroid surface, then curls into its arm.
        vec3 source = (sourceTransform * vec4(origin, 1.0)).xyz;
        vec3 curl = vec3(-flowing.y, flowing.x, sin(seed * 12.0)) * sin(starMorph * 3.14159265) * 0.38;
        expanded = mix(source, expanded, starMorph) + curl;
        life = mix(1.0, life, starMorph);
        vec4 p = modelViewMatrix * vec4(expanded, 1.0);
        // Dispersed stars return to the hero galaxy in the final chapter.
        vec2 displacement = vec2(0.0);
        float totalWeight = 0.0;
        if (pointerForce > 0.001) for (int i = 0; i < 8; i++) {
          float age = max(0.0, clock - trails[i].z);
          float weight = exp(-age * 3.2) * trails[i].w;
          vec2 cursor = trails[i].xy * -p.z / vec2(projectionMatrix[0][0], projectionMatrix[1][1]);
          vec2 away = p.xy - cursor;
          float distance = length(away);
          // A broad, smooth field bends the stream sideways and carries a little cursor momentum.
          vec2 push = (away * 0.85 + vec2(-away.y, away.x) * 0.4 + cursorDrift * 0.18)
            * exp(-distance * distance / 2.2);
          // An expanding, soft wave carries dispersed stars away from the cursor path.
          float waveRadius = age * 2.8;
          float wave = exp(-pow(distance - waveRadius, 2.0) / 0.8);
          vec2 ripple = away / max(0.12, distance) * wave * 0.9;
          displacement += mix(push, push * 0.45 + ripple, dispersion) * weight;
          totalWeight += weight;
        }
        p.xy += displacement / max(1.0, totalWeight) * 1.5 * (1.0 - formation.x * 0.8);
        gl_Position = projectionMatrix * p;
        gl_PointSize = p.z < -0.1 ? clamp(size * pixelScale / -p.z, 1.0, 10.0) : 0.0;
      }`,
    fragmentShader: `
      varying vec3 tint;
      varying float life;
      uniform float brightness;
      void main() {
        float distance = length(gl_PointCoord - 0.5) * 2.0;
        if (distance > 1.0) discard;
        float glow = exp(-distance * distance * 4.0);
        gl_FragColor = vec4(tint, glow * brightness * life);
      }`,
  });
  const stars = new Points(geometry, material);
  stars.renderOrder = 1;
  group.add(stars);
  scene.add(group);
  // Reuse the hero buffers for the story, without reassembling/exploding its background.
  const galaxyMaterial = material.clone();
  galaxyMaterial.uniforms.dispersion.value = 0;
  const galaxyStars = new Points(geometry, galaxyMaterial);
  const galaxyGroup = new Group();
  galaxyGroup.add(galaxyStars);
  galaxyGroup.visible = false;
  scene.add(galaxyGroup);
  // Eighty tapered, interlocking wedges build the asteroid itself; there is no
  // solid core underneath them. The recessed sides remain visible as dark seams.
  const shell = new IcosahedronGeometry(1, 1);
  const vertices = shell.getAttribute("position");
  const fragmentCount = vertices.count / 3;
  const bodies = createFormation(fragmentCount);
  const wedge = new BufferGeometry();
  const corners = [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 0, 1], [0.3, 0.3, 1.08]];
  const faces = [[1, 2, 4], [2, 3, 4], [3, 1, 4], [0, 2, 1], [0, 3, 2], [0, 1, 3]];
  wedge.setAttribute("position", new BufferAttribute(new Float32Array(faces.flatMap(face => face.flatMap(index => corners[index]))), 3));
  wedge.computeVertexNormals();
  const rockMaterial = new MeshStandardMaterial({ color: 0xc2b4a0, roughness: 1, flatShading: true });
  const fragments = new InstancedMesh(wedge, rockMaterial, fragmentCount);
  const rockGeometry = new IcosahedronGeometry(1, 1);
  const rockVertices = rockGeometry.getAttribute("position");
  for (let i = 0; i < rockVertices.count; i++) {
    const x = rockVertices.getX(i), y = rockVertices.getY(i), z = rockVertices.getZ(i);
    const radius = 1 + Math.sin(x * 12 + y * 7 + z * 5) * 0.16;
    rockVertices.setXYZ(i, x * radius, y * radius * 0.8, z * radius * 0.9);
  }
  rockGeometry.computeVertexNormals();
  const rocks = new InstancedMesh(rockGeometry, rockMaterial, bodies.length - fragmentCount);
  const storyGroup = new Group();
  const core = new Group();
  core.add(fragments);
  storyGroup.add(core, rocks);
  storyGroup.visible = false;
  scene.add(storyGroup, new AmbientLight(0xc2cce0, 0.65));
  const bases: Matrix4[] = [];
  const centers: Vector3[] = [];
  const shade = new Color();
  const a = new Vector3(), b = new Vector3(), c = new Vector3();
  const shape = (vertex: Vector3) => {
    const radius = 2.05 * (1 + Math.sin(vertex.x * 4 + vertex.y * 3) * 0.13 + Math.cos(vertex.z * 5 - vertex.y * 4) * 0.09);
    return vertex.multiplyScalar(radius).multiply(new Vector3(1.05, 1.12, 0.92));
  };
  for (let i = 0; i < fragmentCount; i++) {
    shape(a.fromBufferAttribute(vertices, i * 3));
    shape(b.fromBufferAttribute(vertices, i * 3 + 1));
    shape(c.fromBufferAttribute(vertices, i * 3 + 2));
    const center = a.clone().add(b).add(c).multiplyScalar(0.25);
    centers.push(center);
    // Map the shared tetrahedral wedge onto an actual asteroid surface triangle.
    const basis = new Matrix4().makeBasis(a.clone().sub(c), b.clone().sub(c), c);
    basis.scale(new Vector3(0.975, 0.975, 0.975));
    basis.setPosition(center.clone().multiplyScalar(-0.975));
    bases.push(basis);
  }
  shell.dispose();
  const origins = new Float32Array(data.positions.length);
  for (let i = 0; i < data.sizes.length; i++) {
    const face = i % fragmentCount;
    shape(a.fromBufferAttribute(vertices, face * 3));
    shape(b.fromBufferAttribute(vertices, face * 3 + 1));
    shape(c.fromBufferAttribute(vertices, face * 3 + 2));
    let u = (i * 0.754877666) % 1;
    let v = (i * 0.569840296) % 1;
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    a.multiplyScalar(u).addScaledVector(b, v).addScaledVector(c, 1 - u - v).toArray(origins, i * 3);
  }
  geometry.setAttribute("origin", new BufferAttribute(origins, 3));
  for (const mesh of [fragments, rocks]) {
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    // Positions are rewritten on scroll; a stale bounding sphere would cull arrivals.
    mesh.frustumCulled = false;
  }
  bodies.forEach((body, index) => {
    shade.setRGB(body.shade, body.shade * 0.94, body.shade * 0.85);
    if (index < fragmentCount) fragments.setColorAt(index, shade);
    else rocks.setColorAt(index - fragmentCount, shade);
  });
  const transform = new Object3D();
  const matrix = new Matrix4();
  const smooth = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
  const rockLight = new DirectionalLight(0xffe4bf, 3);
  rockLight.position.set(-3, 5, 8);
  const rimLight = new DirectionalLight(0xadcfff, 2);
  rimLight.position.set(8, 1, -4);
  scene.add(rockLight, rimLight);
  let frame = 0;
  let disposed = false;
  let paused = false;
  let visible = true;
  let elapsed = 0;
  let flowTime = 0;
  let previous = 0;
  let progress = 0;
  let targetProgress = 0;
  let targetGather = 0;
  let targetSystem = 0;
  let storyPresence = 0;
  let targetPresence = 0;
  let galaxyX = 5.4;
  let galaxyScale = 0.84;
  let inParticleChapters = false;
  let inGalaxyChapter = false;
  let galaxyExit = 1;
  const formation = material.uniforms.formation.value as Vector2;
  const story = region.querySelector<HTMLElement>("#tiers");
  const storyJourney = story?.querySelector<HTMLElement>("[data-horizontal-journey]");
  let drag: { id: number; x: number; y: number } | null = null;
  let trailIndex = 0;
  let lastTrail = -1;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, active: false };
  const velocity = { x: 0, y: 0 };
  const turn = new Quaternion();
  const axis = new Vector3();
  camera.position.set(0, 0, 19);
  camera.lookAt(0, 0, 0);
  group.position.set(5.4, -0.55, 0);
  group.scale.setScalar(0.84);
  group.rotation.set(0.18, -0.68, -0.24);

  function rotate(x: number, y: number) {
    const angle = Math.hypot(x, y);
    if (!angle) return;
    axis.set(y, x, 0).normalize();
    group.quaternion.premultiply(turn.setFromAxisAngle(axis, angle));
  }

  function draw(time: number) {
    frame = 0;
    if (disposed) return;
    const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
    previous = time;
    if (!paused) {
      elapsed += delta;
      const ease = 1 - Math.exp(-delta * 5);
      progress += (targetProgress - progress) * ease;
      formation.x += (targetGather - formation.x) * ease;
      formation.y += (targetSystem - formation.y) * ease;
      storyPresence += (targetPresence - storyPresence) * ease;
      if ((progress < 0.02 && targetProgress < 0.02) || formation.y * storyPresence > 0.98) flowTime += delta;
      const pointerEase = 1 - Math.exp(-delta * 9);
      const dx = (pointer.targetX - pointer.x) * pointerEase;
      const dy = (pointer.targetY - pointer.y) * pointerEase;
      pointer.x += dx;
      pointer.y += dy;
      pointer.strength += ((pointer.active && !drag ? 1 : 0) - pointer.strength) * pointerEase;
      targetDrift.set(dx / Math.max(delta, 0.001), dy / Math.max(delta, 0.001)).clampLength(0, 2);
      cursorDrift.lerp(targetDrift, pointerEase);
      if (elapsed - lastTrail >= 0.06 && pointer.strength > 0.002) {
        trailIndex = (trailIndex + 1) % trails.length;
        trails[trailIndex].set(pointer.x, pointer.y, elapsed, pointer.strength);
        lastTrail = elapsed;
      }
      if (!drag) {
        rotate(velocity.x * delta, velocity.y * delta);
        velocity.x *= Math.exp(-delta * 7);
        velocity.y *= Math.exp(-delta * 7);
      }
    }
    const entrance = smooth(elapsed / 1.8);
    const galaxyPresence = formation.y * galaxyExit;
    const fracture = smooth(formation.y / 0.7);
    material.uniforms.dispersion.value = Math.max(progress, 1 - entrance);
    material.uniforms.clock.value = elapsed;
    material.uniforms.flowClock.value = flowTime;
    material.uniforms.pointerForce.value = progress > 0.99 ? pointer.strength : 0;
    galaxyGroup.position.set(galaxyX, -0.8, 0);
    galaxyGroup.scale.setScalar(galaxyScale);
    galaxyGroup.quaternion.copy(group.quaternion);
    galaxyGroup.visible = galaxyPresence > 0.001;
    galaxyMaterial.uniforms.brightness.value = 0.88 * smooth(formation.y / 0.35) * galaxyExit;
    galaxyMaterial.uniforms.starMorph.value = formation.y;
    galaxyMaterial.uniforms.pixelScale.value = material.uniforms.pixelScale.value;
    galaxyMaterial.uniforms.clock.value = elapsed;
    galaxyMaterial.uniforms.flowClock.value = flowTime;
    storyGroup.visible = inParticleChapters && !inGalaxyChapter && fracture < 0.999 && storyPresence > 0.001;
    storyGroup.position.z = -45 * (1 - storyPresence);
    core.rotation.set(0.12, elapsed * 0.045, -0.12);
    galaxyGroup.updateMatrixWorld(true);
    storyGroup.updateMatrixWorld(true);
    (galaxyMaterial.uniforms.sourceTransform.value as Matrix4).copy(galaxyGroup.matrixWorld).invert().multiply(core.matrixWorld);
    rockMaterial.emissive.setRGB(0.55, 0.62, 0.75);
    rockMaterial.emissiveIntensity = (1 - formation.x) * 0.55 + Math.sin(fracture * Math.PI) * 0.9;
    let assembly = 0;
    let settled = 0;
    if (storyGroup.visible) for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      const central = i < fragmentCount;
      const gather = smooth((formation.x - body.delay) / (1 - body.delay));
      const [sx, sy, sz] = body.start;
      if (central) {
        const center = centers[i];
        const arc = Math.sin(gather * Math.PI) * body.bend;
        transform.position.set(
          sx + (center.x - sx) * gather - sy * arc * 0.32,
          sy + (center.y - sy) * gather + sx * arc * 0.32,
          sz + (center.z - sz) * gather + arc,
        );
        transform.position.addScaledVector(center, fracture * 1.8);
        transform.rotation.set(body.rotation[0] * (1 - gather), body.rotation[1] * (1 - gather), body.rotation[2] * (1 - gather));
        transform.rotation.x += body.rotation[0] * fracture;
        transform.rotation.z += body.rotation[2] * fracture;
        // The initially small bright fragments keep their identity as they lock.
        transform.scale.setScalar((0.3 + gather * 0.7) * (1 - fracture));
        transform.updateMatrix();
        matrix.multiplyMatrices(transform.matrix, bases[i]);
        fragments.setMatrixAt(i, matrix);
        assembly += gather;
        if (gather > 0.995) settled++;
      } else {
        // Surrounding fragments stay with the asteroid, not the stellar galaxy.
        const waitingAngle = body.angle + elapsed * 0.018;
        const waitingRadius = 5.5 + body.delay * 2;
        const wx = Math.cos(waitingAngle) * waitingRadius;
        const wy = Math.sin(waitingAngle) * waitingRadius * 0.66;
        const wz = -2 + body.depth;
        const startX = sx + (wx - sx) * gather;
        const startY = sy + (wy - sy) * gather;
        const startZ = sz + (wz - sz) * gather;
        transform.position.set(startX, startY, startZ);
        transform.rotation.set(body.rotation[0] + elapsed * 0.07, body.rotation[1] + elapsed * 0.05, body.rotation[2]);
        transform.scale.setScalar(body.size * (1 - fracture));
        transform.updateMatrix();
        rocks.setMatrixAt(i - fragmentCount, transform.matrix);
      }
    }
    fragments.instanceMatrix.needsUpdate = true;
    rocks.instanceMatrix.needsUpdate = true;
    canvas.dataset.flowTime = flowTime.toFixed(3);
    canvas.dataset.progress = progress.toFixed(3);
    canvas.dataset.ambientTime = elapsed.toFixed(3);
    canvas.dataset.formation = `${formation.x.toFixed(3)},${formation.y.toFixed(3)}`;
    canvas.dataset.rotation = group.quaternion.toArray().map(value => value.toFixed(4)).join(",");
    canvas.dataset.disturbance = Math.max(...trails.map(trail => Math.exp(-(elapsed - trail.z) * 3.2) * trail.w)).toFixed(3);
    renderer.render(scene, camera);
    // Diagnostics acknowledge the submitted meshes, just like the pause receipt.
    canvas.dataset.storyBodyCount = String(storyGroup.visible ? fragments.count + rocks.count : 0);
    canvas.dataset.storyOrbitBodyCount = String(storyGroup.visible ? rocks.count : 0);
    canvas.dataset.storyStarCount = String(galaxyPresence > 0.995 ? data.sizes.length : 0);
    canvas.dataset.entrance = entrance.toFixed(3);
    canvas.dataset.galaxyOpacity = galaxyPresence.toFixed(3);
    canvas.dataset.starMorph = formation.y.toFixed(3);
    canvas.dataset.asteroidFracture = fracture.toFixed(3);
    canvas.dataset.starDispersion = material.uniforms.dispersion.value.toFixed(3);
    canvas.dataset.storyAssembly = (assembly / fragments.count).toFixed(3);
    canvas.dataset.storyLockedFragments = String(settled);
    canvas.dataset.storyPresence = storyPresence.toFixed(3);
    canvas.dataset.paused = String(paused);
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function schedule() {
    if (disposed || frame || !visible || document.hidden) return;
    previous = 0;
    frame = requestAnimationFrame(draw);
  }
  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const halfWidth = Math.tan(camera.fov * Math.PI / 360) * camera.position.z * camera.aspect;
    galaxyX = halfWidth * 0.32;
    galaxyScale = Math.min(0.84, halfWidth * 0.48 / 7.2);
    storyGroup.position.set(halfWidth * 0.32, -0.8, 0);
    storyGroup.scale.setScalar(Math.min(1, halfWidth * 0.48 / 6));
    material.uniforms.pixelScale.value = height * renderer.getPixelRatio();
    scroll();
    schedule();
  }
  function scroll() {
    targetProgress = Math.max(0, Math.min(1, -region.getBoundingClientRect().top / window.innerHeight));
    if (targetProgress > 0.15 && drag) release();
    if (storyJourney) {
      const rect = storyJourney.getBoundingClientRect();
      const chapter = storyProgress(storyJourney);
      const smooth = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
      const focus = window.innerHeight * 0.5;
      targetGather = smooth((chapter - 0.06) / 0.32) * smooth((rect.bottom - focus) / (window.innerHeight * 0.35));
      inParticleChapters = rect.top <= 0 && rect.bottom > focus;
      inGalaxyChapter = chapter >= 0.85;
      targetSystem = smooth((chapter - 0.5) / 0.35);
      targetPresence = smooth(-rect.top / (window.innerHeight * 0.16));
      // The final galaxy fades away; the already dispersed hero field stays intact.
      galaxyExit = smooth((rect.bottom - focus) / (window.innerHeight * 0.35)) * (1 - smooth((storyScroll(storyJourney) - 0.82) / 0.18));
    }
    // A paused scene stays frozen even while the document scrolls.
  }
  function move(event: PointerEvent) {
    if (paused) return;
    if (drag && drag.id === event.pointerId) {
      const x = (event.clientX - drag.x) * 0.006;
      const y = (event.clientY - drag.y) * 0.006;
      rotate(x, y);
      velocity.x = x * 12;
      velocity.y = y * 12;
      drag.x = event.clientX;
      drag.y = event.clientY;
      return;
    }
    if (event.pointerType === "touch") return;
    if (progress < 0.99) { leave(); return; }
    // Exposed text/background can disturb stars; opaque workspaces and controls cannot.
    if (event.target instanceof Element && event.target.closest("header, [data-ui], [data-reading-surface], a, button, input, select, textarea, [role='listbox']")) { leave(); return; }
    const rect = canvas.getBoundingClientRect();
    pointer.targetX = (event.clientX - rect.left) / rect.width * 2 - 1;
    pointer.targetY = 1 - (event.clientY - rect.top) / rect.height * 2;
    if (!pointer.active) { pointer.x = pointer.targetX; pointer.y = pointer.targetY; }
    pointer.active = true;
  }
  function leave() { pointer.active = false; }
  function down(event: PointerEvent) {
    if (paused || progress > 0.15 || event.button !== 0 || !event.isPrimary) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    velocity.x = velocity.y = 0;
    canvas.setPointerCapture(event.pointerId);
    canvas.dataset.dragging = "true";
    leave();
  }
  function release() {
    if (drag && canvas.hasPointerCapture(drag.id)) canvas.releasePointerCapture(drag.id);
    drag = null;
    canvas.dataset.dragging = "false";
    leave();
  }
  function visibility() {
    if (document.hidden) { release(); cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  }
  function contextLost(event: Event) {
    event.preventDefault();
    dispose();
    onFailure();
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else { cancelAnimationFrame(frame); frame = 0; }
  });
  observer.observe(region);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  window.addEventListener("scroll", scroll, { passive: true });
  region.addEventListener("pointermove", move, { passive: true });
  region.addEventListener("pointerleave", leave);
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("lostpointercapture", release);
  window.addEventListener("blur", release);
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", contextLost);
  try {
    scroll();
    progress = targetProgress;
    formation.set(targetGather, targetSystem);
    storyPresence = targetPresence;
    resize();
    // Draw once before the poster is removed; controls never wait for this scene.
    cancelAnimationFrame(frame);
    draw(performance.now());
  } catch (error) {
    // Failed uploads/first renders must clean up even though no controller was returned.
    dispose();
    throw error;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    release();
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener("scroll", scroll);
    region.removeEventListener("pointermove", move);
    region.removeEventListener("pointerleave", leave);
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointerup", release);
    canvas.removeEventListener("pointercancel", release);
    canvas.removeEventListener("lostpointercapture", release);
    window.removeEventListener("blur", release);
    document.removeEventListener("visibilitychange", visibility);
    canvas.removeEventListener("webglcontextlost", contextLost);
    geometry.dispose();
    material.dispose();
    galaxyMaterial.dispose();
    rockGeometry.dispose();
    wedge.dispose();
    fragments.dispose();
    rocks.dispose();
    rockMaterial.dispose();
    renderer.dispose();
  }
  return {
    dispose,
    setPaused(value: boolean) {
      paused = value;
      if (paused) { release(); velocity.x = velocity.y = 0; }
      cancelAnimationFrame(frame);
      frame = 0;
      schedule();
    },
  };
}
