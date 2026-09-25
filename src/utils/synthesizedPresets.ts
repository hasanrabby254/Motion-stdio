import { SynthesizedCode } from '../types';

export const SYNTHESIZED_PRESETS: Record<string, SynthesizedCode> = {
  architecture: {
    id: 'synth_architecture',
    title: 'Minimalist Monolith Horizon Drift',
    explanation: 'Constructs an architectural concrete scene with three parallax monolith planes, sliding volumetric light beams, perspective horizon lines, and seamless micro-dust suspension.',
    dominantColors: ['#1e293b', '#94a3b8', '#f59e0b', '#020617'],
    stockTags: ['architectural cgi', 'monolith', 'minimalist motion', 'concrete structure', 'volumetric light', '4k background', 'stock graphics'],
    createdAt: Date.now(),
    code: `// Minimalist Monolith Horizon Drift (100% Deterministic Vector CGI)
const t = (time % duration) / duration;
const loopT = Math.sin(t * Math.PI * 2);
const speed = config.speed || 1.0;
const intensity = config.intensity || 1.0;
const accent = config.accentColor || '#f59e0b';

// 1. Cinematic Sky Background
const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
bgGrad.addColorStop(0, '#0f172a');
bgGrad.addColorStop(0.6, '#1e293b');
bgGrad.addColorStop(1, '#020617');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, width, height);

// 2. Slow Camera Drift
const camX = loopT * 18 * speed * intensity;
const camY = Math.cos(t * Math.PI * 2) * 8 * speed * intensity;
ctx.save();
ctx.translate(camX, camY);

// 3. Volumetric Sun Beam
ctx.save();
ctx.translate(width * 0.75 + loopT * 40, height * 0.2);
ctx.rotate(0.45);
const beamGrad = ctx.createLinearGradient(-150, 0, 150, height * 1.2);
beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
beamGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.08)');
beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
ctx.fillStyle = beamGrad;
ctx.fillRect(-150, 0, 300, height * 1.4);
ctx.restore();

// 4. Distant Architectural Horizon Wall
ctx.fillStyle = '#090d16';
ctx.fillRect(width * 0.05, height * 0.28, width * 0.35, height * 0.55);

// 5. Hero Monolith (Foreground Layer with Parallax)
const monoGrad = ctx.createLinearGradient(width * 0.35, 0, width * 0.65, height);
monoGrad.addColorStop(0, '#cbd5e1');
monoGrad.addColorStop(0.5, '#64748b');
monoGrad.addColorStop(1, '#1e293b');
ctx.fillStyle = monoGrad;
ctx.beginPath();
ctx.moveTo(width * 0.32 - loopT * 10, height * 0.15);
ctx.lineTo(width * 0.68 - loopT * 10, height * 0.15);
ctx.lineTo(width * 0.62 - loopT * 10, height * 0.85);
ctx.lineTo(width * 0.26 - loopT * 10, height * 0.85);
ctx.closePath();
ctx.fill();

// 6. Accent Specular Edge Rim Light
ctx.strokeStyle = accent;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(width * 0.32 - loopT * 10, height * 0.15);
ctx.lineTo(width * 0.68 - loopT * 10, height * 0.15);
ctx.stroke();

// 7. Perspective Ground Grid Floor
const groundY = height * 0.78;
ctx.fillStyle = '#050811';
ctx.fillRect(0, groundY, width, height - groundY);
ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
ctx.lineWidth = 1;
const vanishX = width * 0.5;
for (let i = -10; i <= 22; i++) {
  ctx.beginPath();
  ctx.moveTo(vanishX, groundY);
  ctx.lineTo((width / 12) * i + loopT * 25, height);
  ctx.stroke();
}

// 8. Atmospheric Floating Embers / Dust
ctx.fillStyle = accent;
for (let i = 0; i < 35; i++) {
  const seed = i * 137.5;
  const pY = (height * 0.85) - ((time * 40 * speed + seed * 9) % (height * 0.7));
  const pX = (width * 0.2) + ((seed * 31) % (width * 0.6)) + Math.sin(time * 1.5 + i) * 15;
  const rad = 1.2 + Math.sin(time * 2 + i) * 0.8;
  ctx.globalAlpha = 0.35 + Math.sin(time * 3 + i) * 0.35;
  ctx.beginPath();
  ctx.arc(pX, pY, Math.max(0.5, rad), 0, Math.PI * 2);
  ctx.fill();
}
ctx.globalAlpha = 1.0;
ctx.restore();`
  },

  portrait: {
    id: 'synth_portrait',
    title: 'Golden Hour Silhouette & Solar Rays',
    explanation: 'Renders a backlit profile figure with volumetric solar rays, mathematical rim light dispersion, and organic floating bokeh particles.',
    dominantColors: ['#f59e0b', '#fbbf24', '#f97316', '#18181b'],
    stockTags: ['golden hour', 'silhouette', 'solar rays', 'cinematic lighting', 'warm background', 'cgi animation'],
    createdAt: Date.now(),
    code: `// Golden Hour Silhouette & Solar Rays (Procedural Vector Animation)
const t = (time % duration) / duration;
const loopT = Math.sin(t * Math.PI * 2);
const speed = config.speed || 1.0;
const intensity = config.intensity || 1.0;
const accent = config.accentColor || '#fbbf24';

// 1. Sunset Sky Gradient
const sky = ctx.createRadialGradient(
  width * 0.65, height * 0.4, width * 0.05,
  width * 0.5, height * 0.5, width * 0.85
);
sky.addColorStop(0, '#fef08a');
sky.addColorStop(0.3, '#f59e0b');
sky.addColorStop(0.65, '#be185d');
sky.addColorStop(1, '#09090b');
ctx.fillStyle = sky;
ctx.fillRect(0, 0, width, height);

// 2. Solar Core & Moving Light Rays
const sunX = width * 0.65;
const sunY = height * 0.38 + loopT * 12 * speed;
ctx.save();
ctx.translate(sunX, sunY);
for (let r = 0; r < 12; r++) {
  const angle = (Math.PI * 2 / 12) * r + (time * 0.08 * speed);
  ctx.save();
  ctx.rotate(angle);
  const rayGrad = ctx.createLinearGradient(0, 0, width * 0.6, 0);
  rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
  rayGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.12)');
  rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rayGrad;
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.lineTo(width * 0.6, -60);
  ctx.lineTo(width * 0.6, 60);
  ctx.lineTo(0, 15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
ctx.restore();

// 3. Central Sun Orb
const orbGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 160);
orbGrad.addColorStop(0, '#ffffff');
orbGrad.addColorStop(0.4, 'rgba(254, 240, 138, 0.85)');
orbGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
ctx.fillStyle = orbGrad;
ctx.beginPath();
ctx.arc(sunX, sunY, 160, 0, Math.PI * 2);
ctx.fill();

// 4. Silhouette Profile (Deterministic Bezier Path)
const pOffset = loopT * 8 * speed;
ctx.fillStyle = '#030712';
ctx.beginPath();
ctx.moveTo(width * 0.38 + pOffset, height);
ctx.quadraticCurveTo(width * 0.42 + pOffset, height * 0.72, width * 0.48 + pOffset, height * 0.65);
ctx.quadraticCurveTo(width * 0.54 + pOffset, height * 0.58, width * 0.55 + pOffset, height * 0.46);
ctx.quadraticCurveTo(width * 0.59 + pOffset, height * 0.44, width * 0.62 + pOffset, height * 0.38);
ctx.quadraticCurveTo(width * 0.64 + pOffset, height * 0.32, width * 0.61 + pOffset, height * 0.24);
ctx.quadraticCurveTo(width * 0.55 + pOffset, height * 0.18, width * 0.48 + pOffset, height * 0.22);
ctx.quadraticCurveTo(width * 0.42 + pOffset, height * 0.28, width * 0.41 + pOffset, height * 0.38);
ctx.quadraticCurveTo(width * 0.36 + pOffset, height * 0.52, width * 0.32 + pOffset, height * 0.66);
ctx.quadraticCurveTo(width * 0.26 + pOffset, height * 0.82, width * 0.22 + pOffset, height);
ctx.closePath();
ctx.fill();

// 5. Rim Light Glow on Subject Silhouette Edge
ctx.strokeStyle = accent;
ctx.lineWidth = 4 * intensity;
ctx.beginPath();
ctx.moveTo(width * 0.48 + pOffset, height * 0.22);
ctx.quadraticCurveTo(width * 0.55 + pOffset, height * 0.18, width * 0.61 + pOffset, height * 0.24);
ctx.quadraticCurveTo(width * 0.64 + pOffset, height * 0.32, width * 0.62 + pOffset, height * 0.38);
ctx.quadraticCurveTo(width * 0.59 + pOffset, height * 0.44, width * 0.55 + pOffset, height * 0.46);
ctx.stroke();

// 6. Floating Ambient Bokeh Discs
for (let b = 0; b < 24; b++) {
  const bx = (width * 0.2) + ((b * 191) % (width * 0.7)) + Math.sin(time * 0.8 + b) * 35;
  const by = ((height * 0.9) - ((time * 30 * speed + b * 65) % (height * 0.8)));
  const bRad = 15 + (b % 5) * 8;
  const bAlpha = 0.12 + Math.sin(time * 2 + b) * 0.08;
  ctx.fillStyle = accent;
  ctx.globalAlpha = Math.max(0.04, bAlpha);
  ctx.beginPath();
  ctx.arc(bx, by, bRad, 0, Math.PI * 2);
  ctx.fill();
}
ctx.globalAlpha = 1.0;`
  },

  cyberpunk: {
    id: 'synth_cyberpunk',
    title: 'Neon Metropolis Sector Grid',
    explanation: 'Generates a futuristic nighttime cityscape with pulsating neon signs, high-frequency window matrix grids, wet pavement reflections, and chromatic light pulses.',
    dominantColors: ['#06b6d4', '#ec4899', '#a855f7', '#030712'],
    stockTags: ['cyberpunk cgi', 'neon city', 'futuristic metropolis', 'night loop', 'scifi motion graphics', 'shutterstock footage'],
    createdAt: Date.now(),
    code: `// Neon Metropolis Sector Grid (100% Procedural Vector Architecture)
const t = (time % duration) / duration;
const loopT = Math.sin(t * Math.PI * 2);
const speed = config.speed || 1.0;
const intensity = config.intensity || 1.0;
const neonCyan = '#06b6d4';
const neonPink = '#ec4899';

// 1. Dark Night Sky Gradient
const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
skyGrad.addColorStop(0, '#030712');
skyGrad.addColorStop(0.7, '#0f172a');
skyGrad.addColorStop(1, '#1e1b4b');
ctx.fillStyle = skyGrad;
ctx.fillRect(0, 0, width, height);

// 2. Skyscraper Silhouettes
const buildings = [
  { x: 0.08, w: 0.14, h: 0.75 },
  { x: 0.24, w: 0.11, h: 0.84 },
  { x: 0.38, w: 0.16, h: 0.68 },
  { x: 0.56, w: 0.18, h: 0.88 },
  { x: 0.76, w: 0.12, h: 0.72 },
  { x: 0.90, w: 0.12, h: 0.65 }
];

buildings.forEach((b, idx) => {
  const bx = width * b.x;
  const bw = width * b.w;
  const bh = height * b.h;
  const by = height * 0.85 - bh;

  ctx.fillStyle = '#050914';
  ctx.fillRect(bx, by, bw, bh);

  // Animated Glowing Windows Matrix
  const cols = 5;
  const rows = 18;
  const winW = bw / (cols + 2);
  const winH = 10;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const active = (Math.sin(r * 3 + c * 7 + idx + time * 1.5) > 0.15);
      if (active) {
        ctx.fillStyle = (r + c + idx) % 2 === 0 ? neonCyan : neonPink;
        ctx.globalAlpha = 0.5 + Math.sin(time * 3 + r + c) * 0.3;
        ctx.fillRect(bx + (c + 1) * winW, by + 30 + r * 24, winW * 0.7, winH);
      }
    }
  }
  ctx.globalAlpha = 1.0;
});

// 3. Wet Street Ground Plane
const roadY = height * 0.75;
ctx.fillStyle = '#060a12';
ctx.fillRect(0, roadY, width, height - roadY);

// 4. Horizontal Ground Perspective Grid Lines
ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
ctx.lineWidth = 1;
for (let y = roadY; y < height; y += (y - roadY) * 0.4 + 12) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
}

// 5. Neon Light Reflection Pools on Ground
const reflectPink = ctx.createRadialGradient(width * 0.32, height * 0.88, 10, width * 0.32, height * 0.88, 180);
reflectPink.addColorStop(0, 'rgba(236, 72, 153, 0.45)');
reflectPink.addColorStop(1, 'rgba(236, 72, 153, 0)');
ctx.fillStyle = reflectPink;
ctx.beginPath();
ctx.ellipse(width * 0.32, height * 0.88, 180 + loopT * 20, 25, 0, 0, Math.PI * 2);
ctx.fill();

const reflectCyan = ctx.createRadialGradient(width * 0.65, height * 0.9, 10, width * 0.65, height * 0.9, 220);
reflectCyan.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
reflectCyan.addColorStop(1, 'rgba(6, 182, 212, 0)');
ctx.fillStyle = reflectCyan;
ctx.beginPath();
ctx.ellipse(width * 0.65, height * 0.9, 220 + loopT * 25, 30, 0, 0, Math.PI * 2);
ctx.fill();

// 6. Vertical Beacon Light Sweeps
ctx.strokeStyle = neonPink;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(width * 0.3, height * 0.05);
ctx.lineTo(width * 0.3, height * 0.75);
ctx.stroke();

ctx.strokeStyle = neonCyan;
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.moveTo(width * 0.7, height * 0.12);
ctx.lineTo(width * 0.7, height * 0.75);
ctx.stroke();`
  },

  nature: {
    id: 'synth_nature',
    title: 'Alpine Valley Mist & Water Shimmer',
    explanation: 'Constructs three mountain ridges moving with organic parallax, volumetric horizontal mist strata, and sine wave water reflections.',
    dominantColors: ['#0f172a', '#334155', '#94a3b8', '#10b981'],
    stockTags: ['alpine lake', 'mountain mist', 'nature loop', 'procedural landscape', 'calm background', 'commercial stock video'],
    createdAt: Date.now(),
    code: `// Alpine Valley Mist & Water Shimmer (Procedural Landscape Math)
const t = (time % duration) / duration;
const loopT = Math.sin(t * Math.PI * 2);
const speed = config.speed || 1.0;
const intensity = config.intensity || 1.0;

// 1. Morning Fog Sky Gradient
const sky = ctx.createLinearGradient(0, 0, 0, height * 0.65);
sky.addColorStop(0, '#0f172a');
sky.addColorStop(0.5, '#1e293b');
sky.addColorStop(1, '#475569');
ctx.fillStyle = sky;
ctx.fillRect(0, 0, width, height * 0.65);

// 2. Far Mountain Ridge (Slowest Parallax)
ctx.fillStyle = '#1e293b';
ctx.beginPath();
ctx.moveTo(0, height * 0.5);
ctx.lineTo(width * 0.25, height * 0.25 - loopT * 6);
ctx.lineTo(width * 0.55, height * 0.45);
ctx.lineTo(width * 0.85, height * 0.22 - loopT * 6);
ctx.lineTo(width, height * 0.42);
ctx.lineTo(width, height * 0.65);
ctx.lineTo(0, height * 0.65);
ctx.closePath();
ctx.fill();

// 3. Mid-ground Ridge (Medium Parallax)
ctx.fillStyle = '#0f172a';
ctx.beginPath();
ctx.moveTo(0, height * 0.55);
ctx.lineTo(width * 0.35, height * 0.32 - loopT * 12);
ctx.lineTo(width * 0.7, height * 0.52);
ctx.lineTo(width, height * 0.35 - loopT * 10);
ctx.lineTo(width, height * 0.65);
ctx.lineTo(0, height * 0.65);
ctx.closePath();
ctx.fill();

// 4. Volumetric Flowing Mist Layer
for (let m = 0; m < 3; m++) {
  const mistY = height * 0.5 + m * 30;
  const mistGrad = ctx.createLinearGradient(0, mistY - 40, 0, mistY + 40);
  mistGrad.addColorStop(0, 'rgba(226, 232, 240, 0)');
  mistGrad.addColorStop(0.5, 'rgba(226, 232, 240, 0.22)');
  mistGrad.addColorStop(1, 'rgba(226, 232, 240, 0)');
  ctx.fillStyle = mistGrad;
  ctx.beginPath();
  ctx.ellipse(width * 0.5 + Math.sin(time * 0.4 + m) * 120, mistY, width * 0.65, 35, 0, 0, Math.PI * 2);
  ctx.fill();
}

// 5. Lake Surface Mirror
const lakeY = height * 0.65;
const lakeGrad = ctx.createLinearGradient(0, lakeY, 0, height);
lakeGrad.addColorStop(0, '#1e293b');
lakeGrad.addColorStop(1, '#020617');
ctx.fillStyle = lakeGrad;
ctx.fillRect(0, lakeY, width, height - lakeY);

// 6. Harmonic Shimmering Water Waves
for (let w = 0; w < 16; w++) {
  const lineY = lakeY + (w * w * 1.5) + 8;
  if (lineY > height) break;
  ctx.strokeStyle = 'rgba(203, 213, 225, ' + (0.35 - (w * 0.018)) + ')';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let x = 0; x < width; x += 40) {
    const wave = Math.sin((x * 0.015) + (time * 2.5 * speed) + w) * (2 + w * 0.3);
    if (x === 0) ctx.moveTo(x, lineY + wave);
    else ctx.lineTo(x, lineY + wave);
  }
  ctx.stroke();
}`
  },

  watch: {
    id: 'synth_watch',
    title: 'Luxury Horology Specular Sweep',
    explanation: 'Constructs an ultra-luxury chronograph dial with brushed metal circular bezel, rotating sweep hand, and traveling specular light flares.',
    dominantColors: ['#fef08a', '#ca8a04', '#18181b', '#000000'],
    stockTags: ['luxury watch', 'chronograph', 'horology', 'specular sweep', 'product motion', 'commercial video'],
    createdAt: Date.now(),
    code: `// Luxury Horology Specular Sweep (Mathematical Geometry)
const t = (time % duration) / duration;
const loopT = Math.sin(t * Math.PI * 2);
const speed = config.speed || 1.0;
const intensity = config.intensity || 1.0;
const gold = '#ca8a04';
const goldLight = '#fef08a';

// 1. Studio Dark Backdrop
const bg = ctx.createRadialGradient(width * 0.5, height * 0.5, 40, width * 0.5, height * 0.5, width * 0.6);
bg.addColorStop(0, '#18181b');
bg.addColorStop(0.6, '#09090b');
bg.addColorStop(1, '#000000');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, width, height);

const cx = width * 0.5;
const cy = height * 0.5;
const radius = Math.min(width, height) * 0.35;

// 2. Bezel Gold Ring
ctx.save();
ctx.translate(cx, cy);
const bezelGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
bezelGrad.addColorStop(0, goldLight);
bezelGrad.addColorStop(0.35, gold);
bezelGrad.addColorStop(0.7, goldLight);
bezelGrad.addColorStop(1, '#854d0e');
ctx.strokeStyle = bezelGrad;
ctx.lineWidth = 26;
ctx.beginPath();
ctx.arc(0, 0, radius, 0, Math.PI * 2);
ctx.stroke();

// 3. Inner Watch Face
ctx.fillStyle = '#09090b';
ctx.beginPath();
ctx.arc(0, 0, radius - 13, 0, Math.PI * 2);
ctx.fill();

// 4. Dial Hour Markers
for (let h = 0; h < 12; h++) {
  const angle = (Math.PI * 2 / 12) * h;
  ctx.save();
  ctx.rotate(angle);
  ctx.fillStyle = (h % 3 === 0) ? goldLight : '#71717a';
  ctx.fillRect(-3, -radius + 25, 6, (h % 3 === 0) ? 22 : 12);
  ctx.restore();
}

// 5. Traveling Specular Flare on Bezel
const flareAngle = (t * Math.PI * 2 * speed);
ctx.save();
ctx.rotate(flareAngle);
const flareGrad = ctx.createRadialGradient(radius, 0, 2, radius, 0, 70);
flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
flareGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.4)');
flareGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
ctx.fillStyle = flareGrad;
ctx.beginPath();
ctx.arc(radius, 0, 70, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

// 6. Chronograph Hands (10:10 classic composition)
// Hour Hand
ctx.save();
ctx.rotate(-0.8);
ctx.strokeStyle = goldLight;
ctx.lineWidth = 7;
ctx.lineCap = 'round';
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(0, -radius * 0.55);
ctx.stroke();
ctx.restore();

// Minute Hand
ctx.save();
ctx.rotate(0.65);
ctx.strokeStyle = goldLight;
ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(0, -radius * 0.8);
ctx.stroke();
ctx.restore();

// Second Hand (Continuous Smooth Sweep)
const secAngle = (t * Math.PI * 2 * speed * 2);
ctx.save();
ctx.rotate(secAngle);
ctx.strokeStyle = '#ef4444';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(0, 20);
ctx.lineTo(0, -radius * 0.88);
ctx.stroke();
ctx.restore();

// Center Pin
ctx.fillStyle = goldLight;
ctx.beginPath();
ctx.arc(0, 0, 12, 0, Math.PI * 2);
ctx.fill();
ctx.restore();`
  }
};
