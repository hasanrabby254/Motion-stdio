// High-resolution, self-contained SVG Data URIs for instant 0ms offline stock images with zero CORS errors
export function createSvgStockDataUrl(type: 'architecture' | 'portrait' | 'cyberpunk' | 'nature' | 'watch'): string {
  let svgContent = '';

  if (type === 'architecture') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="60%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <linearGradient id="wallGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="50%" stop-color="#94a3b8"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
        <linearGradient id="wallGrad2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
        <linearGradient id="sunbeam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.35"/>
          <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </linearGradient>
        <filter id="blurFilter">
          <feGaussianBlur stdDeviation="30"/>
        </filter>
      </defs>
      <!-- Deep Sky / Interior Base -->
      <rect width="1920" height="1080" fill="url(#skyGrad)"/>
      <!-- Soft Sun Glow -->
      <circle cx="1550" cy="220" r="320" fill="#f59e0b" opacity="0.2" filter="url(#blurFilter)"/>
      <circle cx="1550" cy="220" r="140" fill="#fef08a" opacity="0.4" filter="url(#blurFilter)"/>
      <!-- Concrete Minimalist Architecture Shapes -->
      <!-- Left Angled Monolith -->
      <polygon points="0,0 650,0 520,1080 0,1080" fill="url(#wallGrad1)"/>
      <!-- Shadow Crease -->
      <polygon points="520,0 720,0 580,1080 500,1080" fill="#1e293b" opacity="0.75"/>
      <!-- Dramatic Cantilever Beam -->
      <polygon points="400,280 1700,280 1520,520 280,520" fill="url(#wallGrad2)"/>
      <!-- Under-beam Shadow -->
      <polygon points="280,520 1520,520 1480,620 220,620" fill="#090d16" opacity="0.85"/>
      <!-- Diagonal Sunbeam Cut -->
      <polygon points="1200,0 1800,0 1300,1080 800,1080" fill="url(#sunbeam)"/>
      <!-- Floor Plane with Concrete Texture lines -->
      <polygon points="0,850 1920,850 1920,1080 0,1080" fill="#1e293b"/>
      <line x1="0" y1="850" x2="1920" y2="850" stroke="#64748b" stroke-width="2" opacity="0.4"/>
      <line x1="400" y1="850" x2="200" y2="1080" stroke="#475569" stroke-width="1.5" opacity="0.3"/>
      <line x1="900" y1="850" x2="800" y2="1080" stroke="#475569" stroke-width="1.5" opacity="0.3"/>
      <line x1="1400" y1="850" x2="1500" y2="1080" stroke="#475569" stroke-width="1.5" opacity="0.3"/>
      <!-- Horizon Highlight Edge -->
      <line x1="400" y1="280" x2="1700" y2="280" stroke="#ffffff" stroke-width="3" opacity="0.7"/>
      <!-- Text label in corner for cinematic feel -->
      <text x="80" y="1020" font-family="sans-serif" font-size="28" font-weight="600" fill="#94a3b8" letter-spacing="8" opacity="0.6">ARCHITECTURAL FORM // MONOLITH 01</text>
    </svg>`;
  } else if (type === 'portrait') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
      <defs>
        <radialGradient id="sunBackdrop" cx="65%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="30%" stop-color="#f97316"/>
          <stop offset="65%" stop-color="#be185d"/>
          <stop offset="100%" stop-color="#18181b"/>
        </radialGradient>
        <linearGradient id="rimGlow" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="25"/>
        </filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#sunBackdrop)"/>
      <!-- Big Golden Sunset Orb -->
      <circle cx="1250" cy="380" r="260" fill="#fef08a" opacity="0.6" filter="url(#glow)"/>
      <circle cx="1250" cy="380" r="160" fill="#ffffff" opacity="0.75" filter="url(#glow)"/>
      <!-- Silhouette Profile Figure -->
      <path d="M 680,1080 Q 720,860 820,780 Q 890,720 920,620 Q 940,550 930,480 Q 980,480 1040,430 Q 1070,370 1060,300 Q 1030,220 950,200 Q 860,190 790,240 Q 730,290 710,380 Q 700,430 710,480 Q 660,540 640,640 Q 610,760 550,880 Q 480,980 440,1080 Z" fill="#09090b"/>
      <!-- Glowing Hair Rim Light -->
      <path d="M 850,200 Q 950,200 1040,280 Q 1080,360 1050,450 Q 980,520 930,620 Q 900,720 840,780" fill="none" stroke="#fef08a" stroke-width="8" opacity="0.85" filter="url(#glow)"/>
      <path d="M 850,200 Q 950,200 1040,280 Q 1080,360 1050,450 Q 980,520 930,620 Q 900,720 840,780" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.95"/>
      <!-- Soft Dust / Bokeh Orbs -->
      <circle cx="450" cy="320" r="60" fill="#fbbf24" opacity="0.25" filter="url(#glow)"/>
      <circle cx="1550" cy="620" r="90" fill="#f43f5e" opacity="0.3" filter="url(#glow)"/>
      <circle cx="1100" cy="780" r="40" fill="#f59e0b" opacity="0.4" filter="url(#glow)"/>
      <!-- Warm Cinema Grain Overlay Base -->
      <rect width="1920" height="1080" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.1"/>
      <text x="80" y="1020" font-family="sans-serif" font-size="28" font-weight="600" fill="#fed7aa" letter-spacing="8" opacity="0.6">GOLDEN HOUR PROFILE // CINEMATIC RIM LIGHT</text>
    </svg>`;
  } else if (type === 'cyberpunk') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
      <defs>
        <linearGradient id="neonSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#030712"/>
          <stop offset="70%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="15"/>
        </filter>
        <filter id="superGlow">
          <feGaussianBlur stdDeviation="35"/>
        </filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#neonSky)"/>
      <!-- Futuristic Skyscraper Silhouettes -->
      <rect x="180" y="240" width="220" height="840" fill="#030712"/>
      <rect x="440" y="180" width="180" height="900" fill="#020617"/>
      <rect x="660" y="320" width="260" height="760" fill="#030712"/>
      <rect x="1020" y="140" width="300" height="940" fill="#020617"/>
      <rect x="1360" y="260" width="220" height="820" fill="#030712"/>
      <rect x="1620" y="360" width="240" height="720" fill="#020617"/>
      <!-- Glowing Windows Grid -->
      <g fill="#06b6d4" opacity="0.5">
        <rect x="220" y="280" width="12" height="18"/>
        <rect x="250" y="320" width="12" height="18"/>
        <rect x="220" y="360" width="12" height="18"/>
        <rect x="280" y="440" width="12" height="18"/>
        <rect x="1060" y="180" width="14" height="20" fill="#ec4899"/>
        <rect x="1100" y="220" width="14" height="20" fill="#ec4899"/>
        <rect x="1140" y="280" width="14" height="20" fill="#06b6d4"/>
        <rect x="1080" y="340" width="14" height="20" fill="#ec4899"/>
      </g>
      <!-- Neon Vertical Signs -->
      <rect x="400" y="350" width="16" height="280" fill="#ec4899" filter="url(#neonGlow)"/>
      <rect x="400" y="350" width="16" height="280" fill="#ffffff"/>
      <rect x="980" y="420" width="14" height="220" fill="#06b6d4" filter="url(#neonGlow)"/>
      <rect x="980" y="420" width="14" height="220" fill="#ffffff"/>
      <!-- Wet Street Horizon & Reflections -->
      <rect x="0" y="780" width="1920" height="300" fill="#090d16"/>
      <!-- Neon Street Pools -->
      <ellipse cx="400" cy="920" rx="140" ry="25" fill="#ec4899" opacity="0.45" filter="url(#superGlow)"/>
      <ellipse cx="980" cy="950" rx="180" ry="30" fill="#06b6d4" opacity="0.5" filter="url(#superGlow)"/>
      <ellipse cx="1450" cy="900" rx="120" ry="20" fill="#a855f7" opacity="0.4" filter="url(#superGlow)"/>
      <text x="80" y="1020" font-family="sans-serif" font-size="28" font-weight="600" fill="#38bdf8" letter-spacing="8" opacity="0.7">NEON METROPOLIS // SECTOR 07</text>
    </svg>`;
  } else if (type === 'nature') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
      <defs>
        <linearGradient id="mistSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="50%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
        <linearGradient id="lakeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <filter id="softFog">
          <feGaussianBlur stdDeviation="28"/>
        </filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#mistSky)"/>
      <!-- Distant Mountain Ridges -->
      <polygon points="0,520 400,280 850,560 1400,220 1920,480 1920,1080 0,1080" fill="#0f172a" opacity="0.6"/>
      <polygon points="0,620 520,380 980,680 1520,360 1920,600 1920,1080 0,1080" fill="#090d16" opacity="0.8"/>
      <!-- Soft Volumetric Morning Fog Band -->
      <ellipse cx="960" cy="580" rx="900" ry="120" fill="#e2e8f0" opacity="0.3" filter="url(#softFog)"/>
      <ellipse cx="600" cy="620" rx="500" ry="90" fill="#94a3b8" opacity="0.25" filter="url(#softFog)"/>
      <!-- Alpine Lake Mirror Plane -->
      <rect x="0" y="720" width="1920" height="360" fill="url(#lakeGrad)"/>
      <!-- Waterline Shimmer Edge -->
      <line x1="0" y1="720" x2="1920" y2="720" stroke="#94a3b8" stroke-width="1.5" opacity="0.4"/>
      <!-- Foreground Pine Silhouettes -->
      <polygon points="120,540 160,740 80,740" fill="#020617"/>
      <polygon points="220,480 270,760 170,760" fill="#020617"/>
      <polygon points="1750,490 1810,750 1690,750" fill="#020617"/>
      <text x="80" y="1020" font-family="sans-serif" font-size="28" font-weight="600" fill="#cbd5e1" letter-spacing="8" opacity="0.6">ALPINE LAKE // VOLUMETRIC MIST</text>
    </svg>`;
  } else {
    // Watch / Luxury Product
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
      <defs>
        <radialGradient id="studioDark" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#18181b"/>
          <stop offset="50%" stop-color="#09090b"/>
          <stop offset="100%" stop-color="#000000"/>
        </radialGradient>
        <linearGradient id="goldBezel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="40%" stop-color="#ca8a04"/>
          <stop offset="70%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#854d0e"/>
        </linearGradient>
        <filter id="sparkleGlow">
          <feGaussianBlur stdDeviation="10"/>
        </filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#studioDark)"/>
      <!-- Watch Dial Case -->
      <circle cx="960" cy="540" r="340" fill="#18181b" stroke="url(#goldBezel)" stroke-width="24"/>
      <!-- Inner Bezel Ring with Ticks -->
      <circle cx="960" cy="540" r="310" fill="#09090b" stroke="#3f3f46" stroke-width="2"/>
      <!-- Chronograph Subdials -->
      <circle cx="960" cy="420" r="70" fill="#18181b" stroke="#52525b" stroke-width="1.5"/>
      <circle cx="850" cy="560" r="70" fill="#18181b" stroke="#52525b" stroke-width="1.5"/>
      <circle cx="1070" cy="560" r="70" fill="#18181b" stroke="#52525b" stroke-width="1.5"/>
      <!-- Golden Watch Hands (10:10 classic aesthetic) -->
      <line x1="960" y1="540" x2="840" y2="390" stroke="#fef08a" stroke-width="8" stroke-linecap="round"/>
      <line x1="960" y1="540" x2="1110" y2="440" stroke="#fef08a" stroke-width="6" stroke-linecap="round"/>
      <!-- Center Pin -->
      <circle cx="960" cy="540" r="14" fill="#ca8a04" stroke="#fef08a" stroke-width="3"/>
      <!-- Specular Highlight Reflections -->
      <path d="M 720,320 A 320 320 0 0 1 1200,320" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.6" filter="url(#sparkleGlow)"/>
      <text x="80" y="1020" font-family="sans-serif" font-size="28" font-weight="600" fill="#e4e4e7" letter-spacing="8" opacity="0.6">CHRONOGRAPH 40MM // LUXURY HOROLOGY</text>
    </svg>`;
  }

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
}
