import { ProceduralConfig } from '../types';

export interface RenderContextOptions {
  width: number;
  height: number;
  time: number;          // in seconds
  duration: number;      // loop duration in seconds
  image: HTMLImageElement | ImageBitmap | null;
  config: ProceduralConfig;
  customCode?: string;
}

const compiledFnCache = new Map<string, Function>();

function getCompiledRenderFn(code: string): Function {
  let fn = compiledFnCache.get(code);
  if (!fn) {
    fn = new Function('ctx', 'width', 'height', 'time', 'duration', 'config', code);
    compiledFnCache.set(code, fn);
  }
  return fn;
}

// Particle state memory for consistent motion
interface Particle {
  x: number;
  y: number;
  z: number;            // depth 0 to 1
  size: number;
  speed: number;
  phase: number;
  alpha: number;
  colorVar: number;
}

let cachedParticles: { count: number; list: Particle[] } = { count: 0, list: [] };

function getParticles(count: number): Particle[] {
  if (cachedParticles.count === count && cachedParticles.list.length === count) {
    return cachedParticles.list;
  }
  const list: Particle[] = [];
  for (let i = 0; i < count; i++) {
    list.push({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 0.8,
      size: 1.5 + Math.random() * 4.5,
      speed: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.3 + Math.random() * 0.7,
      colorVar: Math.random(),
    });
  }
  cachedParticles = { count, list };
  return list;
}

export function getResolvedBackgroundColor(config: ProceduralConfig): string {
  switch (config.backgroundMode) {
    case 'greenscreen':
      return '#00FF00'; // Pure Chroma Key Green
    case 'black':
      return '#000000'; // Pure Studio Black
    case 'custom':
      return config.customBackgroundColor || '#000000';
    case 'default':
    default:
      return '#09090b';
  }
}

export function renderProceduralFrame(
  ctx: CanvasRenderingContext2D,
  options: RenderContextOptions
) {
  const { width, height, time, duration, image, config, customCode } = options;
  const loopT = (time % duration) / duration; // 0.0 -> 1.0 normalized progress
  const speed = config.speed || 1.0;
  const intensity = config.intensity || 1.0;
  const accent = config.accentColor || '#f59e0b';
  const targetBgColor = getResolvedBackgroundColor(config);
  const isCustomBg = Boolean(config.backgroundMode && config.backgroundMode !== 'default');

  // Clear background
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // If custom synthesized code is active, execute it directly
  if (customCode && customCode.trim()) {
    const originalFillRect = ctx.fillRect.bind(ctx);
    let firstBgReplaced = false;

    try {
      if (isCustomBg) {
        // Pre-fill canvas with user's selected background color
        ctx.fillStyle = targetBgColor;
        originalFillRect(0, 0, width, height);

        // Intercept first full-canvas background fill in the synthesized script
        // so it preserves the green screen, black screen, or custom color
        ctx.fillRect = function (x: number, y: number, w: number, h: number) {
          if (!firstBgReplaced && x <= 5 && y <= 5 && w >= width * 0.88 && h >= height * 0.88) {
            firstBgReplaced = true;
            const prevFill = ctx.fillStyle;
            ctx.fillStyle = targetBgColor;
            originalFillRect(0, 0, width, height);
            ctx.fillStyle = prevFill;
            return;
          }
          originalFillRect(x, y, w, h);
        };
      }

      const renderFn = getCompiledRenderFn(customCode);
      renderFn(ctx, width, height, time, duration, {
        ...config,
        backgroundColor: targetBgColor,
      });

      // Restore fillRect
      if (isCustomBg) {
        ctx.fillRect = originalFillRect;
      }

      // Post-processing overlays (skip vignette/grain on green screen to keep chroma 100% keyable)
      if (config.vignette && config.backgroundMode !== 'greenscreen') {
        renderVignette(ctx, width, height, intensity);
      }
      if (config.filmGrain && config.backgroundMode !== 'greenscreen') {
        renderFilmGrain(ctx, width, height, time);
      }

      ctx.restore();
      return;
    } catch (err: any) {
      if (isCustomBg) {
        ctx.fillRect = originalFillRect;
      }
      // Draw friendly visual error overlay if user edited code contains an error
      ctx.fillStyle = targetBgColor;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('SYNTHESIZED CODE EXECUTION ERROR:', 40, 80);
      ctx.fillStyle = '#fca5a5';
      ctx.font = '14px monospace';
      ctx.fillText(err.message || 'Syntax or runtime error in procedural code.', 40, 120);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText('Check the code editor on the left and fix any typo.', 40, 160);
      ctx.restore();
      return;
    }
  }

  // Preset execution:
  ctx.fillStyle = targetBgColor;
  ctx.fillRect(0, 0, width, height);

  if (!image) {
    if (!isCustomBg) {
      // Render standard atmospheric studio backdrop only in default mode
      renderStudioBackdrop(ctx, width, height, loopT, speed, intensity);
    }
  } else {
    // Draw base image with template-specific transform
    ctx.save();

    switch (config.templateId) {
      case 'parallax-depth-zoom':
        renderParallaxZoom(ctx, width, height, image, loopT, speed, intensity, config.direction);
        break;
      case 'cinematic-ken-burns':
        renderKenBurns(ctx, width, height, image, loopT, speed, intensity, config.direction);
        break;
      case 'kinetic-pulse-shimmer':
        renderKineticPulse(ctx, width, height, image, loopT, speed, intensity, config.chromaticShift);
        break;
      case 'water-surface-ripple':
        renderWaterRipple(ctx, width, height, image, loopT, speed, intensity, config.rippleFrequency);
        break;
      default:
        // Standard gentle breathing camera transform for other templates
        renderStandardImage(ctx, width, height, image, loopT, speed, intensity, config.direction);
        break;
    }
    ctx.restore();
  }

  // Overlay procedural effects on top of the image
  ctx.save();
  switch (config.templateId) {
    case 'atmospheric-particles':
      renderAtmosphericParticles(ctx, width, height, loopT, speed, intensity, accent, config);
      break;
    case 'anamorphic-lens-flare':
      renderAnamorphicFlare(ctx, width, height, loopT, speed, intensity, accent);
      break;
    case 'starburst-sparkle':
      renderStarburstSparkles(ctx, width, height, loopT, speed, intensity, accent, config.particleCount);
      break;
    case 'mist-fog-flow':
      renderMistFog(ctx, width, height, loopT, speed, intensity, accent);
      break;
    case 'color-grade-drift':
      renderColorGradeDrift(ctx, width, height, loopT, speed, intensity, accent);
      break;
    case 'neon-edge-trace':
      renderNeonEdgeTrace(ctx, width, height, loopT, speed, intensity, accent);
      break;
    case 'cyber-wireframe-grid':
      renderCyberGrid(ctx, width, height, loopT, speed, intensity, accent);
      break;
    case 'audio-wave-aura':
      renderAudioWaveAura(ctx, width, height, loopT, speed, intensity, accent);
      break;
    default:
      break;
  }
  ctx.restore();

  // Master Post-Processing (Vignette, Film Grain, Color Grade)
  if (config.vignette) {
    renderVignette(ctx, width, height, intensity);
  }

  if (config.filmGrain) {
    renderFilmGrain(ctx, width, height, time);
  }

  ctx.restore();
}

// Studio Procedural Backdrop when no user image is loaded
function renderStudioBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  loopT: number,
  speed: number,
  intensity: number
) {
  const ease = (Math.sin(loopT * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  const zoom = 1.0 + ease * 0.05 * intensity * speed;

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-width / 2, -height / 2);

  // Cinematic deep atmospheric gradient
  const bgGrad = ctx.createRadialGradient(
    width * 0.5, height * 0.45, width * 0.1,
    width * 0.5, height * 0.5, width * 0.7
  );
  bgGrad.addColorStop(0, '#1e293b');
  bgGrad.addColorStop(0.5, '#0f172a');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft horizon glow
  const horizonY = height * 0.65;
  const hGrad = ctx.createLinearGradient(0, horizonY - 120, 0, horizonY + 60);
  hGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
  hGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.18)');
  hGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, horizonY - 120, width, 180);

  // Architectural silhouette blocks
  ctx.fillStyle = '#090d16';
  ctx.fillRect(width * 0.15, height * 0.35, width * 0.18, height * 0.4);
  ctx.fillRect(width * 0.38, height * 0.25, width * 0.24, height * 0.5);
  ctx.fillRect(width * 0.68, height * 0.4, width * 0.16, height * 0.35);

  // Golden rim highlight on central structure
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.38, height * 0.25);
  ctx.lineTo(width * 0.62, height * 0.25);
  ctx.lineTo(width * 0.62, height * 0.75);
  ctx.stroke();

  // Grid floor perspective
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
  ctx.lineWidth = 1;
  const vanishingX = width / 2;
  for (let i = 0; i <= 12; i++) {
    ctx.beginPath();
    ctx.moveTo(vanishingX, horizonY);
    ctx.lineTo((width / 12) * i, height);
    ctx.stroke();
  }

  // Cinematic watermark / label in corner
  ctx.fillStyle = 'rgba(203, 213, 225, 0.5)';
  ctx.font = '600 16px monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText('MOTION STUDIO // LIVE VIEWPORT MONITOR', width * 0.05, height * 0.94);

  ctx.restore();
}

// 1. Standard Easing Image Rendering
function renderStandardImage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  image: HTMLImageElement | ImageBitmap,
  loopT: number,
  speed: number,
  intensity: number,
  direction: string
) {
  // Smooth sine breathing zoom
  const ease = (Math.sin(loopT * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  const zoom = 1.0 + (ease * 0.06 * intensity * speed);
  
  let panX = 0;
  let panY = 0;
  if (direction === 'left') panX = (ease - 0.5) * 30 * intensity;
  else if (direction === 'right') panX = (0.5 - ease) * 30 * intensity;
  else if (direction === 'diagonal') {
    panX = (ease - 0.5) * 20 * intensity;
    panY = (ease - 0.5) * 20 * intensity;
  }

  drawImageCover(ctx, image, width, height, zoom, panX, panY);
}

// 2. Parallax Depth Push-In
function renderParallaxZoom(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  image: HTMLImageElement | ImageBitmap,
  loopT: number,
  speed: number,
  intensity: number,
  direction: string
) {
  // Smooth continuous or ping-pong dolly
  const ease = (Math.sin(loopT * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  const dirMultiplier = direction === 'out' ? -1 : 1;
  const zoom = 1.0 + (ease * 0.12 * intensity * speed * dirMultiplier);
  const panY = (ease - 0.5) * 15 * intensity;

  drawImageCover(ctx, image, width, height, Math.max(1.0, zoom), 0, panY);

  // Subtle radial lens curvature depth overlay
  const grad = ctx.createRadialGradient(
    width / 2, height / 2, width * 0.2,
    width / 2, height / 2, width * 0.75
  );
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${0.25 * intensity})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

// 3. Cinematic Ken Burns Pan & Push
function renderKenBurns(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  image: HTMLImageElement | ImageBitmap,
  loopT: number,
  speed: number,
  intensity: number,
  direction: string
) {
  // Smooth cubic ease-in-out ping-pong
  const t = (Math.sin(loopT * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  const smooth = t * t * (3 - 2 * t);

  let zoom = 1.05 + smooth * 0.1 * intensity * speed;
  let panX = (smooth - 0.5) * 50 * intensity;
  let panY = (0.5 - smooth) * 30 * intensity;

  if (direction === 'out') zoom = 1.15 - smooth * 0.1 * intensity * speed;

  drawImageCover(ctx, image, width, height, zoom, panX, panY);
}

// 4. Kinetic Pulse with Chromatic Aberration
function renderKineticPulse(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  image: HTMLImageElement | ImageBitmap,
  loopT: number,
  speed: number,
  intensity: number,
  chromaticShift = 0.8
) {
  // Rhythmic beat pulse
  const beat = Math.pow(Math.sin(loopT * Math.PI * 4 * speed), 4);
  const zoom = 1.0 + (beat * 0.04 * intensity);
  const shift = beat * 7 * chromaticShift * intensity;

  if (shift > 0.5) {
    // Red channel
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    drawImageCover(ctx, image, width, height, zoom, -shift, 0);
    ctx.fillStyle = 'rgba(255, 0, 50, 0.25)';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // Cyan / Green channel
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    drawImageCover(ctx, image, width, height, zoom, shift, 0);
    ctx.fillStyle = 'rgba(0, 220, 255, 0.25)';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Master image blend
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  drawImageCover(ctx, image, width, height, zoom, 0, 0);
  ctx.restore();
}

// 5. Water Ripple / Fluid Caustics
function renderWaterRipple(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  image: HTMLImageElement | ImageBitmap,
  loopT: number,
  speed: number,
  intensity: number,
  frequency = 2.2
) {
  // Base render
  drawImageCover(ctx, image, width, height, 1.04, 0, 0);

  // Organic wave slice displacement
  const slices = 40;
  const sliceH = height / slices;
  const waveTime = loopT * Math.PI * 2 * speed;

  ctx.save();
  ctx.globalAlpha = 0.5 * intensity;
  ctx.globalCompositeOperation = 'overlay';

  // Caustic highlight bands
  for (let i = 0; i < slices; i++) {
    const y = i * sliceH;
    const offset = Math.sin((i / slices) * Math.PI * frequency * 4 + waveTime) * (8 * intensity);
    const alpha = (Math.sin((i / slices) * Math.PI * 6 + waveTime) + 1) * 0.12;

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, y + offset, width, sliceH);
  }
  ctx.restore();
}

// 6. Atmospheric Embers & Bokeh Particles
function renderAtmosphericParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  loopT: number,
  speed: number,
  intensity: number,
  accent: string,
  config: ProceduralConfig
) {
  const particles = getParticles(config.particleCount || 60);
  const timeSec = loopT * (config.loopDuration || 10) * speed;

  ctx.save();
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    // Dynamic drift
    const yDrift = ((p.y - timeSec * 0.05 * p.speed) % 1 + 1) % 1;
    const xSway = Math.sin(timeSec * 1.5 + p.phase) * 0.04 * intensity;
    const px = ((p.x + xSway) % 1 + 1) % 1 * width;
    const py = yDrift * height;

    const pulse = (Math.sin(timeSec * 2.0 + p.phase) + 1) / 2;
    const currentAlpha = p.alpha * (0.4 + pulse * 0.6) * Math.min(1.0, intensity);
    const radius = p.size * (1.0 + p.z * 1.5) * intensity;

    // Glowing particle with radial gradient
    const grad = ctx.createRadialGradient(px, py, 0, px, py, radius * 2.5);
    grad.addColorStop(0, hexToRgba(accent, currentAlpha));
    grad.addColorStop(0.3, hexToRgba(accent, currentAlpha * 0.5));
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Hot bright core
    ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1, radius * 0.35), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// 7. Anamorphic Lens Flare Sweeps
function renderAnamorphicFlare(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  loopT: number,
  speed: number,
  intensity: number,
  accent: string
) {
  const ease = (Math.sin(loopT * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  const flareX = width * (0.2 + ease * 0.6);
  const flareY = height * (0.4 + Math.sin(loopT * Math.PI * 4) * 0.1);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Horizontal Anamorphic Streak
  const streakW = width * 0.85;
  const streakH = 8 * intensity;

  const streakGrad = ctx.createLinearGradient(flareX - streakW / 2, flareY, flareX + streakW / 2, flareY);
  streakGrad.addColorStop(0, 'rgba(0,0,0,0)');
  streakGrad.addColorStop(0.35, hexToRgba(accent, 0.4 * intensity));
  streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
  streakGrad.addColorStop(0.65, hexToRgba(accent, 0.4 * intensity));
  streakGrad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = streakGrad;
  ctx.fillRect(flareX - streakW / 2, flareY - streakH / 2, streakW, streakH);

  // Secondary diffuse horizontal halo
  const haloH = 26 * intensity;
  const haloGrad = ctx.createLinearGradient(flareX - streakW * 0.6, flareY, flareX + streakW * 0.6, flareY);
  haloGrad.addColorStop(0, 'rgba(0,0,0,0)');
  haloGrad.addColorStop(0.5, hexToRgba(accent, 0.25 * intensity));
  haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = haloGrad;
  ctx.fillRect(flareX - streakW * 0.6, flareY - haloH / 2, streakW * 1.2, haloH);

  // Radiant central star core
  const coreRadius = 45 * intensity;
  const coreGrad = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, coreRadius);
  coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  coreGrad.addColorStop(0.3, hexToRgba(accent, 0.5));
  coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(flareX, flareY, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 8. Luxury Starburst Sparkles
function renderStarburstSparkles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  loopT: number,
  speed: number,
  intensity: number,
  accent: string,
  count = 35
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Seeded positions across the frame
  for (let i = 0; i < count; i++) {
    const seed = (i * 137.5) % 360;
    const px = ((Math.sin(i * 99) * 0.5 + 0.5) * 0.8 + 0.1) * width;
    const py = ((Math.cos(i * 33) * 0.5 + 0.5) * 0.8 + 0.1) * height;

    const phase = i * 0.7;
    const twinkle = Math.pow((Math.sin(loopT * Math.PI * 6 * speed + phase) + 1) / 2, 3);

    if (twinkle > 0.15) {
      const size = (8 + (i % 6) * 6) * twinkle * intensity;
      const angle = (loopT * Math.PI * 2 * speed + i) * 0.2;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);

      // 4-point cross starburst
      const starGrad = ctx.createLinearGradient(-size, 0, size, 0);
      starGrad.addColorStop(0, 'rgba(255,255,255,0)');
      starGrad.addColorStop(0.5, hexToRgba(accent, twinkle * 0.9));
      starGrad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.fillStyle = starGrad;
      ctx.fillRect(-size, -1, size * 2, 2);
      ctx.fillRect(-1, -size, 2, size * 2);

      // Diagonal cross
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-size * 0.6, -1, size * 1.2, 2);
      ctx.fillRect(-1, -size * 0.6, 2, size * 1.2);

      // Center point
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1, size * 0.12), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
  ctx.restore();
}

// 9. Atmospheric Rolling Mist & Fog
function renderMistFog(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  loopT: number,
  speed: number,
  intensity: number,
  accent: string
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const layers = 3;
  for (let l = 0; l < layers; l++) {
    const layerSpeed = (0.5 + l * 0.4) * speed;
    const driftX = ((loopT * layerSpeed) % 1) * width * 0.5;
    const yPos = height * (0.55 + l * 0.15);
    const fogHeight = height * (0.35 + l * 0.1);

    const grad = ctx.createLinearGradient(0, yPos - fogHeight / 2, 0, yPos + fogHeight / 2);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.5, hexToRgba(accent, 0.18 * intensity / layers));
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    // Layered elliptical drifts
    for (let j = -1; j <= 2; j++) {
      const puffX = j * (width * 0.7) + driftX;
      ctx.beginPath();
      ctx.ellipse(puffX, yPos, width * 0.45, fogHeight * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// 10. Golden Hour Chromatic Spectrum Drift
function renderColorGradeDrift(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  loopT: number,
  speed: number,
  intensity: number,
  accent: string
) {
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';

  const angle = loopT * Math.PI * 2 * speed;
  const cx = width / 2 + Math.cos(angle) * (width * 0.3);
  const cy = height / 2 + Math.sin(angle) * (height * 0.25);

  const leakGrad = ctx.createRadialGradient(cx, cy, width * 0.1, cx, cy, width * 0.7);
  leakGrad.addColorStop(0, hexToRgba(accent, 0.6 * intensity));
  leakGrad.addColorStop(0.5, hexToRgba('#ec4899', 0.25 * intensity));
  leakGrad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = leakGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}

// 11. Neon Edge & Contour Trace
function renderNeonEdgeTrace(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  loopT: number,
  speed: number,
  intensity: number,
  accent: string
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 18 * intensity;
  ctx.lineWidth = 2.5;

  const t = loopT * Math.PI * 2 * speed;
  const inset = 30;

  // Animated stylized scanner border
  const borderProgress = (loopT * speed) % 1;
  const perimeter = (width + height) * 2;
  const dashLength = perimeter * 0.25;

  ctx.setLineDash([dashLength, dashLength * 1.5]);
  ctx.lineDashOffset = -perimeter * borderProgress;

  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

  // Dynamic laser sweep beam
  const sweepY = ((loopT * speed * 1.5) % 1) * height;
  const laserGrad = ctx.createLinearGradient(0, sweepY, width, sweepY);
  laserGrad.addColorStop(0, 'rgba(0,0,0,0)');
  laserGrad.addColorStop(0.5, hexToRgba(accent, 0.7 * intensity));
  laserGrad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = laserGrad;
  ctx.fillRect(0, sweepY - 1.5, width, 3);

  ctx.restore();
}

// 12. Cyber Hologram Floor Grid
function renderCyberGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  loopT: number,
  speed: number,
  intensity: number,
  accent: string
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const horizonY = height * 0.58;
  const gridFloorH = height - horizonY;
  const t = (loopT * speed) % 1;

  ctx.strokeStyle = hexToRgba(accent, 0.4 * intensity);
  ctx.lineWidth = 1.2;

  // Perspective vertical rays converging to vanishing point
  const vanishingX = width / 2;
  const rayCount = 18;
  for (let i = 0; i <= rayCount; i++) {
    const bottomX = (width / rayCount) * i;
    ctx.beginPath();
    ctx.moveTo(vanishingX, horizonY);
    ctx.lineTo(bottomX, height);
    ctx.stroke();
  }

  // Horizontal receding grid rungs moving forward
  const rungs = 12;
  for (let r = 1; r <= rungs; r++) {
    const norm = Math.pow((r + t) / rungs, 2.2);
    const rungY = horizonY + norm * gridFloorH;
    const alpha = norm * 0.6 * intensity;
    ctx.strokeStyle = hexToRgba(accent, alpha);
    ctx.beginPath();
    ctx.moveTo(0, rungY);
    ctx.lineTo(width, rungY);
    ctx.stroke();
  }

  // Horizon laser line
  ctx.strokeStyle = hexToRgba(accent, 0.8 * intensity);
  ctx.shadowColor = accent;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(width, horizonY);
  ctx.stroke();

  ctx.restore();
}

// 13. Audio Wave Aura
function renderAudioWaveAura(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  loopT: number,
  speed: number,
  intensity: number,
  accent: string
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const cx = width / 2;
  const cy = height / 2;
  const rings = 5;
  const maxRadius = Math.min(width, height) * 0.48;

  for (let i = 0; i < rings; i++) {
    const phase = (loopT * speed + i / rings) % 1;
    const radius = phase * maxRadius;
    const alpha = (1 - phase) * 0.7 * intensity;

    ctx.strokeStyle = hexToRgba(accent, alpha);
    ctx.lineWidth = 2 + (1 - phase) * 3;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

// Post Processing: Vignette
function renderVignette(ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) {
  ctx.save();
  const radius = Math.max(width, height) * 0.75;
  const grad = ctx.createRadialGradient(
    width / 2, height / 2, radius * 0.4,
    width / 2, height / 2, radius
  );
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${Math.min(0.7, 0.45 * intensity)})`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// Post Processing: Micro Film Grain
function renderFilmGrain(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  
  // High performance deterministic noise dots
  const step = 6;
  const seed = Math.floor(time * 30);
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      if ((Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453) % 1 > 0.72) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }
  ctx.restore();
}

// Helper: draw image with cover aspect ratio, zoom, and pan offset
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | ImageBitmap,
  cw: number,
  ch: number,
  zoom = 1.0,
  panX = 0,
  panY = 0
) {
  const iw = img.width || 1;
  const ih = img.height || 1;
  const imgRatio = iw / ih;
  const canvasRatio = cw / ch;

  let renderW = cw;
  let renderH = ch;

  if (imgRatio > canvasRatio) {
    renderH = ch * zoom;
    renderW = renderH * imgRatio;
  } else {
    renderW = cw * zoom;
    renderH = renderW / imgRatio;
  }

  const drawX = (cw - renderW) / 2 + panX;
  const drawY = (ch - renderH) / 2 + panY;

  ctx.drawImage(img, drawX, drawY, renderW, renderH);
}

// Helper: Hex to RGBA
export function hexToRgba(hex: string, alpha = 1): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (cleanHex.length >= 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(255, 255, 255, ${alpha})`;
}
