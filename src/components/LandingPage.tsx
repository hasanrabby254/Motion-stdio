import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Play,
  Layers,
  Zap,
  Code2,
  Cpu,
  MonitorPlay,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Video,
  FileCheck,
  Compass,
  Eye,
  Check
} from 'lucide-react';
import { SYNTHESIZED_PRESETS } from '../utils/synthesizedPresets';
import { TEMPLATES } from '../templates/catalog';
import { SynthesizedCode } from '../types';

interface LandingPageProps {
  onLaunchApp: (presetId?: string) => void;
  onOpenSpecsModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onOpenSpecsModal,
}) => {
  // Preset selector for the interactive Hero Live Canvas
  const [activeHeroPresetKey, setActiveHeroPresetKey] = useState<string>('cyberpunk');
  const [isLiveRunning, setIsLiveRunning] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const heroPresetKeys = [
    { key: 'cyberpunk', label: 'Neon Sector', tag: 'Sci-Fi VFX' },
    { key: 'architecture', label: 'Monolith Drift', tag: 'Minimal 3D' },
    { key: 'luxury', label: 'Gold Shimmer', tag: 'Luxury Caustics' },
    { key: 'space', label: 'Quantum Nebula', tag: 'Particle Void' },
    { key: 'portrait', label: 'Golden Silhouette', tag: 'Volumetric' },
  ];

  // Live Canvas 60fps render loop for landing page hero
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();
    const duration = 10; // 10 second loop

    const render = (now: number) => {
      if (!isLiveRunning) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const elapsed = (now - startTime) / 1000;
      const time = elapsed % duration;

      const width = canvas.width;
      const height = canvas.height;

      const preset = SYNTHESIZED_PRESETS[activeHeroPresetKey] || SYNTHESIZED_PRESETS.cyberpunk;

      try {
        ctx.clearRect(0, 0, width, height);
        // Execute synthesized procedural code safely
        const codeFn = new Function('ctx', 'width', 'height', 'time', 'duration', 'config', 'image', preset.code);
        codeFn(
          ctx,
          width,
          height,
          time,
          duration,
          {
            speed: 1.0,
            intensity: 1.2,
            accentColor: preset.dominantColors[0] || '#f59e0b',
            particleCount: 50,
            glowIntensity: 1.3,
          },
          null
        );
      } catch (e) {
        // Fallback procedural animation if error occurs
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [activeHeroPresetKey, isLiveRunning]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950 overflow-x-hidden">
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-zinc-950">
            <Film className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold tracking-tight text-zinc-100 text-lg sm:text-xl">
              MOTION STUDIO
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-zinc-900 text-amber-400 border border-amber-500/20">
              CGI Engine
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <a href="#features" className="hover:text-zinc-100 transition-colors">
            Core Features
          </a>
          <a href="#showcase" className="hover:text-zinc-100 transition-colors">
            Interactive Showcase
          </a>
          <a href="#clearance" className="hover:text-zinc-100 transition-colors">
            Stock Clearance
          </a>
          <a href="#specifications" className="hover:text-zinc-100 transition-colors">
            Technical Specs
          </a>
        </nav>

        {/* Top CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSpecsModal}
            className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
          >
            <span>Stock Guidelines</span>
          </button>

          <button
            onClick={() => onLaunchApp()}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[250px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Hero Header Content */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-zinc-400">Deterministic 60 FPS Engine · Zero AI Watermark</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.15]">
            Turn Images & Prompts Into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
              Commercial Motion Graphics
            </span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Produce broadcast-grade 60 FPS cinematic loops, stock footage assets, and procedural VFX. 
            Powered by mathematical Canvas2D execution and Google AI code synthesis—100% compliant with Shutterstock, Adobe Stock, and Envato guidelines.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onLaunchApp()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-zinc-950" />
              <span>Launch Studio (Start Generating)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#showcase"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4 text-zinc-400" />
              <span>Explore Interactive Demos</span>
            </a>
          </div>

          {/* Micro Trust Indicators */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>4K UHD & 60 FPS Export</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Green Screen & Keying Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side Private</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Live Canvas Player */}
        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-3 sm:p-5 shadow-2xl relative overflow-hidden">
          {/* Top Bar of Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-zinc-800/80 gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-xs font-mono text-zinc-400 ml-2">
                Live Procedural Canvas Preview • 60 FPS Real-time
              </span>
            </div>

            {/* Quick Preset Selector Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              {heroPresetKeys.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setActiveHeroPresetKey(p.key)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    activeHeroPresetKey === p.key
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actual Canvas */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800/80 shadow-inner group">
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-contain"
            />

            {/* Overlay Info & Instant Launch Trigger */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-300 pointer-events-auto">
                <span className="text-amber-400 font-bold">ACTIVE:</span>{' '}
                {SYNTHESIZED_PRESETS[activeHeroPresetKey]?.title || 'Motion Loop'}
              </div>

              <button
                onClick={() => onLaunchApp(activeHeroPresetKey)}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-500/30 transition-all pointer-events-auto cursor-pointer"
              >
                <span>Open This in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>Deterministic Mathematical Trigonometry · Zero Hallucinations</span>
            <button
              onClick={() => setIsLiveRunning(!isLiveRunning)}
              className="text-amber-400 hover:underline"
            >
              {isLiveRunning ? 'Pause Canvas' : 'Resume Canvas'}
            </button>
          </div>
        </div>
      </section>

      {/* Differentiator / Commercial Clearance Section */}
      <section id="clearance" className="py-16 bg-zinc-900/40 border-y border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-mono uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Guaranteed Commercial Stock Approval</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              Why Stock Platforms Love Code-Based Motion Graphics
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Traditional AI diffusion models create unpredictable frame jitters, morphing faces, and copyright flags. 
              Motion Studio translates vision into clean procedural JavaScript code that produces pristine, artifact-free CGI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">100% Commercial Clearance</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Shutterstock, Adobe Stock, and Pond5 require clean copyright ownership. Because our engine writes math code rather than stitching stolen video frames, your footage is 100% original CGI.
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Frame-Perfect 60 FPS</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                No interpolation stutter or frame dropping. Every single frame is mathematically calculated in real-time, delivering seamless looping backgrounds and smooth organic physics.
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Green Screen & Alpha Keying</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Instantly switch background output to Green Screen (#00FF00), Blue Screen (#0000FF), or Pure Black for effortless drag-and-drop blending in Premiere Pro, DaVinci Resolve, or After Effects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Studio Pipelines / Features Section */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-amber-400 text-xs font-mono uppercase tracking-widest">
            Creative Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100">
            Three Creative Engines In One Studio
          </h2>
          <p className="text-zinc-400 text-sm">
            Whether you have a still photo, a text description, or want a ready-to-render template, Motion Studio equips you with professional controls.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Text-to-Motion */}
          <div className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Code2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-amber-400 uppercase">Pipeline 01</span>
                <h3 className="text-lg font-bold text-zinc-100">Prompt-to-Motion Synthesis</h3>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Describe any visual aesthetic—from liquid metallic waves to cyberpunk neon rain. The engine generates executable Canvas2D mathematics that run natively in your browser.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Natural language to JavaScript synthesis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Fine-tune code live in browser</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Real-time speed and color modulation</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onLaunchApp()}
              className="mt-6 w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Try Prompt-to-Motion</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Image-to-Motion */}
          <div className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Video className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-blue-400 uppercase">Pipeline 02</span>
                <h3 className="text-lg font-bold text-zinc-100">Still Image to Cinematic Motion</h3>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Upload any photography, product visual, or graphic. Add continuous atmospheric dust, lens flares, water caustics, and cinematic camera drifts to breathe life into static shots.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Automatic subject & depth analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Parallax Ken Burns camera motion</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Atmospheric floating embers & mist</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onLaunchApp()}
              className="mt-6 w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Animate a Photo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Procedural Preset Engine */}
          <div className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 uppercase">Pipeline 03</span>
                <h3 className="text-lg font-bold text-zinc-100">12 Certified Procedural Presets</h3>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Zero load latency. Instant 0-token procedural presets designed specifically for corporate stock categories: tech backgrounds, luxury gold sweeps, and ambient nature loops.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>0ms generation & 0 API tokens</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Full control of speed, count, intensity</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Multi-aspect ratio support (16:9, 9:16, 1:1)</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onLaunchApp()}
              className="mt-6 w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Explore Procedural Presets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Preset Showcase Carousel Section */}
      <section id="showcase" className="py-16 bg-zinc-900/30 border-y border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-amber-400 text-xs font-mono uppercase tracking-wider">
                Instant Library
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-1">
                Production-Ready Motion Templates
              </h2>
            </div>
            <button
              onClick={() => onLaunchApp()}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold group cursor-pointer"
            >
              <span>Open Studio to view all presets</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(SYNTHESIZED_PRESETS).map(([key, item]) => (
              <div
                key={key}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-amber-500/50 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                      60 FPS
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.explanation}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.stockTags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] text-zinc-500 font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {item.dominantColors.slice(0, 3).map((c, i) => (
                      <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-zinc-800"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => onLaunchApp(key)}
                    className="text-xs font-semibold text-zinc-300 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Launch in Studio</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications & Export Breakdown */}
      <section id="specifications" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest">
                Technical Specifications
              </span>
              <h2 className="text-3xl font-extrabold text-zinc-100">
                Engineered for High-End Video Production
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Export directly to industry-standard WebM and MP4 container formats. Zero server upload bottlenecks—all rendering happens right on your graphics hardware via high-speed WebCodecs.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80">
                  <span className="text-2xl font-black text-amber-400 font-mono">4K UHD</span>
                  <p className="text-xs text-zinc-400 mt-1">3840×2160 native resolution with lossless vector detail</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80">
                  <span className="text-2xl font-black text-emerald-400 font-mono">60 FPS</span>
                  <p className="text-xs text-zinc-400 mt-1">Frame-accurate deterministic timeline without temporal jitter</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80">
                  <span className="text-2xl font-black text-blue-400 font-mono">0ms</span>
                  <p className="text-xs text-zinc-400 mt-1">Instant browser preview with zero waiting queue</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80">
                  <span className="text-2xl font-black text-purple-400 font-mono">0 Watermark</span>
                  <p className="text-xs text-zinc-400 mt-1">100% royalty-free commercial ownership</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold text-zinc-200">Stock Agency Compatibility Matrix</span>
                <span className="text-[10px] text-emerald-400 font-mono">ALL PASS</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-900">
                  <span className="text-zinc-300 font-medium">Shutterstock Video</span>
                  <span className="text-emerald-400 font-mono">✓ Approved CGI</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-900">
                  <span className="text-zinc-300 font-medium">Adobe Stock Footage</span>
                  <span className="text-emerald-400 font-mono">✓ 4K 60FPS Validated</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-900">
                  <span className="text-zinc-300 font-medium">Pond5 Marketplace</span>
                  <span className="text-emerald-400 font-mono">✓ Seamless Loop Ready</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-900">
                  <span className="text-zinc-300 font-medium">Envato / VideoHive</span>
                  <span className="text-emerald-400 font-mono">✓ Motion Graphics Pass</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenSpecsModal}
                  className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors cursor-pointer"
                >
                  <span>View Detailed Stock Metadata Specs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto w-full text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100">
          Ready to Create Stock-Grade Motion?
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Open the studio now to synthesize motion graphics, apply live green screen keying, and render 4K video clips in seconds.
        </p>

        <div className="pt-2 flex justify-center">
          <button
            onClick={() => onLaunchApp()}
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-base flex items-center gap-3 shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-zinc-950" />
            <span>Launch Motion Studio</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-10 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-zinc-300">MOTION STUDIO</span>
            <span>— Professional Procedural & AI Motion Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onLaunchApp()}
              className="hover:text-amber-400 transition-colors"
            >
              Open Studio
            </button>
            <span>•</span>
            <button
              onClick={onOpenSpecsModal}
              className="hover:text-amber-400 transition-colors"
            >
              Stock Specifications
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
