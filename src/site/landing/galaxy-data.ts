/** Original, deterministic stellar geometry. Shared by the scene and its still export. */
export function createGalaxy(count = 28000) {
  let seed = 7349;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const flow = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const bulge = i % 5 === 0;
    const radius = bulge ? Math.pow(random(), 1.5) * 1.8 : Math.pow(random(), 0.72) * 7.2;
    const scatter = (random() + random() + random() - 1.5);
    const angle = bulge ? random() * Math.PI * 2 : (i % 3) * Math.PI * 2 / 3 + radius * 0.57 + scatter * (0.23 + radius * 0.065);
    flow.set([radius, angle, bulge ? 1.8 : 7.2, bulge ? 1.5 : 0.72], i * 4);
    positions[i * 3] = Math.cos(angle) * radius + (random() - 0.5) * 0.35;
    positions[i * 3 + 1] = Math.sin(angle) * radius + (random() - 0.5) * 0.35;
    positions[i * 3 + 2] = (random() + random() - 1) * (bulge ? 1.1 : 0.3);
    const warmth = Math.max(0, 1 - radius / 4);
    const light = 0.3 + random() * 0.65;
    colors[i * 3] = (0.65 + warmth * 0.35) * light;
    colors[i * 3 + 1] = (0.75 + warmth * 0.13) * light;
    colors[i * 3 + 2] = (1 - warmth * 0.25) * light;
    sizes[i] = (0.035 + Math.pow(random(), 5) * 0.15) * (bulge ? 1.15 : 1);
  }
  return { positions, colors, sizes, flow };
}

/** Independent seed: changing the story never changes hero/poster stars. */
export function createFormation(fragmentCount = 80, orbitCount = 120) {
  let seed = 28117;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  return Array.from({ length: fragmentCount + orbitCount }, (_, index) => {
    const angle = index * 2.3999632297 + random() * 0.24;
    const radius = 2.8 + Math.sqrt(random()) * 2.3;
    const orbit = Math.max(0, index - fragmentCount);
    const orbitRadius = 2.1 + Math.pow((orbit + 1) / orbitCount, 0.8) * 3.2;
    return {
      start: [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, 1 + random() * 2] as const,
      angle,
      delay: random() * 0.3,
      bend: (random() > 0.5 ? 1 : -1) * (0.5 + random()),
      rotation: [random() * 3, random() * 3, random() * 3] as const,
      size: 0.11 + random() * 0.16,
      shade: 0.5 + random() * 0.45,
      orbitRadius,
      orbitAngle: (orbit % 3) * Math.PI * 2 / 3 + orbitRadius * 0.92 + (random() - 0.5) * 0.18,
      depth: (random() - 0.5) * 0.5,
    };
  });
}
