// Export the original procedural scene as a compact no-WebGL fallback, not a hero mockup.
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import { Euler, PerspectiveCamera, Vector3 } from "three";
import { createGalaxy } from "../src/site/landing/galaxy-data.ts";

const width = 1600;
const height = 1000;
const camera = new PerspectiveCamera(45, width / height, 0.1, 100);
camera.position.set(0, 0, 19);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();
const rotation = new Euler(0.18, -0.68, -0.24);
const points = createGalaxy();
const circles = [];
for (let i = 0; i < points.sizes.length; i++) {
  const point = new Vector3(...points.positions.slice(i * 3, i * 3 + 3)).multiplyScalar(0.84).applyEuler(rotation);
  point.x += 5.4;
  point.y += 0.15;
  const depth = 19 - point.z;
  point.project(camera);
  const x = (point.x * 0.5 + 0.5) * width;
  const y = (-point.y * 0.5 + 0.5) * height;
  const radius = Math.max(0.4, Math.min(3, points.sizes[i] * height / depth * 0.33));
  const color = [...points.colors.slice(i * 3, i * 3 + 3)].map(c => Math.round(c * 255));
  circles.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius.toFixed(2)}" fill="rgb(${color.join(',')})" opacity=".65"/>`);
}
await mkdir('public/landing', { recursive: true });
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#111111"/>${circles.join('')}</svg>`)).webp({ quality: 86 }).toFile('public/landing/galaxy-poster.webp');
console.log('Exported original scene poster. No third-party imagery.');
