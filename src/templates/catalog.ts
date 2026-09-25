import { TemplateDefinition, UploadedImage } from '../types';
import { createSvgStockDataUrl } from '../utils/sampleImages';

export const TEMPLATES: TemplateDefinition[] = [
  // --- CANVAS TEMPLATES ---
  {
    id: 'atmospheric-particles',
    name: 'Atmospheric Drift & Embers',
    subtitle: 'Drifting light motes & embers with bokeh depth',
    category: 'canvas',
    description: 'Generates floating atmospheric micro-particles, bokeh spheres, and embers drifting through the 3D space of the photograph.',
    tags: ['Ethereal', 'Nature', 'Cinematic', 'Bokeh'],
    defaultConfig: {
      speed: 1.0,
      intensity: 1.2,
      accentColor: '#f59e0b', // warm amber
      particleCount: 65,
      particleType: 'ember',
      direction: 'diagonal',
      glowIntensity: 1.3,
      vignette: true,
      filmGrain: true,
    }
  },
  {
    id: 'parallax-depth-zoom',
    name: '3D Parallax & Depth Push',
    subtitle: 'Multi-layer focal push-in with lens curvature',
    category: 'canvas',
    description: 'Simulates a high-end cine prime lens dolly-in with peripheral stretch and center focal locking, creating 3D depth from 2D.',
    tags: ['Camera Push', 'Architectural', 'Commercial'],
    defaultConfig: {
      speed: 0.8,
      intensity: 1.4,
      accentColor: '#38bdf8',
      direction: 'in',
      glowIntensity: 0.5,
      vignette: true,
      filmGrain: false,
    }
  },
  {
    id: 'anamorphic-lens-flare',
    name: 'Anamorphic Flare & Streak',
    subtitle: 'Cinema horizontal beam sweeping highlights',
    category: 'canvas',
    description: 'Adds horizontal anamorphic cyan and gold light streaks that react to light points, sweeping smoothly across the horizon.',
    tags: ['Sci-Fi', 'Automotive', 'Editorial', 'Cinema'],
    defaultConfig: {
      speed: 0.9,
      intensity: 1.5,
      accentColor: '#06b6d4', // cyan flare
      direction: 'left',
      glowIntensity: 1.6,
      vignette: true,
      filmGrain: true,
    }
  },
  {
    id: 'water-surface-ripple',
    name: 'Liquid Caustic & Wave Drift',
    subtitle: 'Undulating refraction wave mesh with light caustics',
    category: 'canvas',
    description: 'Applies organic trigonometric displacement across the lower and upper waterlines, generating shimmering liquid motion.',
    tags: ['Ocean', 'Liquid', 'Relaxation', 'Luxury'],
    defaultConfig: {
      speed: 1.1,
      intensity: 1.2,
      accentColor: '#0ea5e9',
      rippleFrequency: 2.2,
      direction: 'diagonal',
      vignette: true,
    }
  },
  {
    id: 'starburst-sparkle',
    name: 'Luxury Specular Starbursts',
    subtitle: 'Pinpoint cross-star sparkles on specular reflections',
    category: 'canvas',
    description: 'Detects brightest specular highlights and blooms radiant 4-point and 8-point cross starbursts that twinkle dynamically.',
    tags: ['Jewelry', 'Watches', 'Night City', 'Cosmetics'],
    defaultConfig: {
      speed: 1.2,
      intensity: 1.6,
      accentColor: '#fef08a', // diamond gold
      particleCount: 40,
      particleType: 'stars',
      glowIntensity: 1.8,
      vignette: false,
    }
  },
  {
    id: 'mist-fog-flow',
    name: 'Atmospheric Fog & Mist Drift',
    subtitle: 'Volumetric rolling ground haze & clouds',
    category: 'canvas',
    description: 'Renders soft layered perlin-noise mist drifting across foreground and midground planes, adding mood and mystery.',
    tags: ['Landscape', 'Mood', 'Horror', 'Forest'],
    defaultConfig: {
      speed: 0.7,
      intensity: 1.1,
      accentColor: '#e2e8f0',
      direction: 'right',
      glowIntensity: 0.8,
      vignette: true,
      filmGrain: true,
    }
  },

  // --- CSS TEMPLATES ---
  {
    id: 'cinematic-ken-burns',
    name: 'Cinematic Ken Burns & Tilt',
    subtitle: 'Precision bezier camera pan, slow drift & breathe',
    category: 'css',
    description: 'Smooth slow-motion camera trajectory mimicking documentary masterclasses, with subtle organic breathing easing.',
    tags: ['Documentary', 'Portraits', 'Editorial', 'Classic'],
    defaultConfig: {
      speed: 0.7,
      intensity: 1.0,
      accentColor: '#f59e0b',
      direction: 'in',
      vignette: true,
    }
  },
  {
    id: 'kinetic-pulse-shimmer',
    name: 'Kinetic Pulse & Chromatic Shift',
    subtitle: 'Rhythmic zoom pulse with optical RGB fringe splitting',
    category: 'css',
    description: 'Dynamic bass-like micro-pulses paired with subtle chromatic aberration on edges, ideal for fashion, music and energy stock.',
    tags: ['Music', 'Fashion', 'Glitch', 'High Energy'],
    defaultConfig: {
      speed: 1.4,
      intensity: 1.5,
      accentColor: '#ec4899',
      chromaticShift: 0.8,
      direction: 'in',
      filmGrain: true,
    }
  },
  {
    id: 'color-grade-drift',
    name: 'Golden Hour Spectrum Drift',
    subtitle: 'Dynamic warm light leaks & shifting color temperature',
    category: 'css',
    description: 'Simulates rotating color grading gels and organic warm lens light leaks flowing across the perimeter of the frame.',
    tags: ['Sunset', 'Lifestyle', 'Travel', 'Wedding'],
    defaultConfig: {
      speed: 0.9,
      intensity: 1.3,
      accentColor: '#f97316',
      direction: 'left',
      vignette: true,
    }
  },

  // --- SVG TEMPLATES ---
  {
    id: 'neon-edge-trace',
    name: 'Luminous Edge & Contour Trace',
    subtitle: 'Glowing neon vector lines tracing image silhouettes',
    category: 'svg',
    description: 'Draws pulsating laser and neon vector contours that scan across the composition, ideal for sports, cars, and silhouette clips.',
    tags: ['Futuristic', 'Silhouette', 'Automotive', 'Cyber'],
    defaultConfig: {
      speed: 1.2,
      intensity: 1.5,
      accentColor: '#10b981', // emerald neon
      glowIntensity: 1.7,
      direction: 'diagonal',
    }
  },
  {
    id: 'cyber-wireframe-grid',
    name: 'Holographic Cyber Grid',
    subtitle: 'Perspective 3D floor grid & HUD crosshairs',
    category: 'svg',
    description: 'Projects an animated futuristic vector wireframe grid receding towards the vanishing point, with tactical tech HUD telemetry.',
    tags: ['Fintech', 'Crypto', 'AI / Tech', 'HUD'],
    defaultConfig: {
      speed: 1.0,
      intensity: 1.3,
      accentColor: '#06b6d4',
      direction: 'in',
      glowIntensity: 1.4,
    }
  },
  {
    id: 'audio-wave-aura',
    name: 'Resonant Wave Aura',
    subtitle: 'Concentric vector ripples expanding from focal point',
    category: 'svg',
    description: 'Radiates concentric harmonic waveform ripples with variable frequency and luminous stroke gradients from the focal center.',
    tags: ['Podcast', 'Sound', 'Meditation', 'Abstract'],
    defaultConfig: {
      speed: 1.0,
      intensity: 1.2,
      accentColor: '#8b5cf6', // violet
      direction: 'out',
      glowIntensity: 1.3,
    }
  }
];

export const SAMPLE_STOCK_IMAGES: Omit<UploadedImage, 'id'>[] = [
  {
    name: 'Architectural Minimalist (Concrete & Shadow)',
    url: createSvgStockDataUrl('architecture'),
    width: 1920,
    height: 1080,
    sizeBytes: 124000,
    format: 'image/svg+xml'
  },
  {
    name: 'Golden Hour Portrait (Cinematic Rim Light)',
    url: createSvgStockDataUrl('portrait'),
    width: 1920,
    height: 1080,
    sizeBytes: 154000,
    format: 'image/svg+xml'
  },
  {
    name: 'Cyberpunk Metropolis (Neon Rain Reflection)',
    url: createSvgStockDataUrl('cyberpunk'),
    width: 1920,
    height: 1080,
    sizeBytes: 182000,
    format: 'image/svg+xml'
  },
  {
    name: 'Alpine Forest Mist & Lake Reflection',
    url: createSvgStockDataUrl('nature'),
    width: 1920,
    height: 1080,
    sizeBytes: 198000,
    format: 'image/svg+xml'
  },
  {
    name: 'Luxury Chronograph Timepiece',
    url: createSvgStockDataUrl('watch'),
    width: 1920,
    height: 1080,
    sizeBytes: 141000,
    format: 'image/svg+xml'
  }
];

export const STOCK_PROMPT_PRESETS = [
  'Slow cinematic zoom with drifting light particles and warm golden rim light',
  'Gentle horizontal drone pan across the horizon with soft volumetric fog',
  'Subtle water wave ripples undulating across reflections with sparkling highlights',
  'Dynamic slow-motion push-in with gentle wind moving atmosphere and realistic depth',
  'Anamorphic cyan lens flare sweeping gently across specular highlights',
  'Architectural dolly-forward through soft ambient shadows and rising morning sunbeams'
];
