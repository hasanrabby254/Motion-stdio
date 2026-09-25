import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Camera,
  Grid,
  Crop,
  ShieldAlert,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Sliders,
  Download
} from 'lucide-react';
import { AspectRatio, ProceduralConfig, UploadedImage } from '../types';
import { renderProceduralFrame } from '../services/proceduralRenderer';

interface StudioViewportProps {
  image: UploadedImage | null;
  config: ProceduralConfig;
  videoUrl: string | null; // Set when previewing an exported clip from queue
  onOpenExportModal: () => void;
  aspectRatio: AspectRatio;
  onSelectAspectRatio: (ratio: AspectRatio) => void;
  activeTab?: 'code-synthesizer' | 'procedural';
  customCode?: string;
}

export const StudioViewport: React.FC<StudioViewportProps> = ({
  image,
  config,
  videoUrl,
  onOpenExportModal,
  aspectRatio,
  onSelectAspectRatio,
  activeTab = 'code-synthesizer',
  customCode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [duration, setDuration] = useState(config.loopDuration || 10);
  const [isLooping, setIsLooping] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(60);

  // Overlays
  const [showGrid, setShowGrid] = useState(false);
  const [showSafeMargins, setShowSafeMargins] = useState(false);
  const [showCropGuides, setShowCropGuides] = useState(true);

  // Loaded Image HTML object
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Load image whenever currentImage url changes
  useEffect(() => {
    if (!image?.url) {
      setImgElement(null);
      return;
    }

    let isMounted = true;
    const img = new Image();

    // Data URIs and blob URLs don't need anonymous crossOrigin
    if (!image.url.startsWith('data:') && !image.url.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      if (isMounted) {
        setImgElement(img);
      }
    };

    img.onerror = () => {
      // Fallback: If anonymous load failed, try loading without crossOrigin for preview
      if (img.crossOrigin) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          if (isMounted) {
            setImgElement(fallbackImg);
          }
        };
        fallbackImg.src = image.url;
      }
    };

    img.src = image.url;

    return () => {
      isMounted = false;
    };
  }, [image?.url]);

  // Keep duration synced
  useEffect(() => {
    setDuration(config.loopDuration || 10);
  }, [config.loopDuration]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Main Procedural Animation Loop
  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const currentTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const renderCurrentState = useCallback((timeSec: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderProceduralFrame(ctx, {
      width: canvas.width,
      height: canvas.height,
      time: timeSec,
      duration: config.loopDuration || 10,
      image: imgElement,
      config,
      customCode: activeTab === 'code-synthesizer' ? customCode : undefined,
    });
  }, [config, imgElement, activeTab, customCode]);

  useEffect(() => {
    if (videoUrl) {
      // If displaying an AI video clip, video element handles playback
      return;
    }

    let frameCount = 0;
    let fpsTimer = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlayingRef.current) {
        currentTimeRef.current += delta;
        const dur = config.loopDuration || 10;
        if (currentTimeRef.current >= dur) {
          currentTimeRef.current = currentTimeRef.current % dur;
        }
        setCurrentTime(currentTimeRef.current);
      }

      renderCurrentState(currentTimeRef.current);

      // FPS tracking
      frameCount++;
      if (now - fpsTimer >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimer = now;
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [config, imgElement, renderCurrentState, videoUrl]);

  // Spacebar toggle playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Timecode Formatter (HH:MM:SS:FF)
  const formatTimecode = (sec: number, totalSec: number): string => {
    const s = Math.floor(sec % 60);
    const m = Math.floor((sec / 60) % 60);
    const f = Math.floor((sec % 1) * 30); // 30fps timecode standard
    const pad = (n: number) => String(n).padStart(2, '0');

    const totS = Math.floor(totalSec % 60);
    const totM = Math.floor((totalSec / 60) % 60);

    return `${pad(m)}:${pad(s)}:${pad(f)} / ${pad(totM)}:${pad(totS)}:00`;
  };

  const currentFrameNumber = Math.floor(currentTime * 30);
  const totalFrames = Math.floor(duration * 30);

  // Snapshot PNG
  const handleCaptureSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `MOTION_STUDIO_FRAME_${currentFrameNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Timeline Scrubber Click & Drag
  const handleTimelineScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * duration;
    currentTimeRef.current = newTime;
    setCurrentTime(newTime);
    if (!isPlaying) {
      renderCurrentState(newTime);
    }
  };

  // Dynamic aspect ratio container styling
  const getContainerAspectClass = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case '9:16':
        return 'aspect-[9/16] max-h-[70vh]';
      case '1:1':
        return 'aspect-square max-h-[70vh]';
      case '4:5':
        return 'aspect-[4/5] max-h-[70vh]';
      default:
        return 'aspect-video';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Viewport Top Toolbar */}
      <div className="h-10 bg-zinc-900/90 border-b border-zinc-800/80 px-3 flex items-center justify-between text-xs text-zinc-400 select-none">
        {/* Left: Resolution & FPS Badges */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-zinc-300 font-semibold bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {videoUrl
              ? 'RENDER PREVIEW'
              : activeTab === 'code-synthesizer'
              ? '100% CODE CGI SYNTHESIZER'
              : 'PROCEDURAL CANVAS ENGINE'}
          </span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-300 bg-zinc-800/40 px-1.5 py-0.5 rounded">
            {aspectRatio}
          </span>
          <span className="text-amber-400 font-medium">
            {fps} FPS
          </span>
          {config.backgroundMode && config.backgroundMode !== 'default' && (
            <>
              <span className="text-zinc-600">|</span>
              <span
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                  config.backgroundMode === 'greenscreen'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                    : config.backgroundMode === 'black'
                    ? 'bg-black text-zinc-300 border-zinc-700'
                    : 'bg-zinc-900 text-zinc-200 border-zinc-700'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      config.backgroundMode === 'greenscreen'
                        ? '#00FF00'
                        : config.backgroundMode === 'black'
                        ? '#000000'
                        : config.customBackgroundColor || '#0047bb',
                    boxShadow:
                      config.backgroundMode === 'greenscreen' ? '0 0 6px #00FF00' : 'none',
                  }}
                />
                <span>
                  {config.backgroundMode === 'greenscreen'
                    ? 'GREEN SCREEN'
                    : config.backgroundMode === 'black'
                    ? 'BLACK SCREEN'
                    : `CUSTOM BG (${(config.customBackgroundColor || '#0047BB').toUpperCase()})`}
                </span>
              </span>
            </>
          )}
        </div>

        {/* Center: Aspect Ratio Quick Presets */}
        <div className="flex items-center gap-1 bg-zinc-950/80 p-0.5 rounded-md border border-zinc-800">
          {(['16:9', '9:16', '1:1', '4:5'] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              onClick={() => onSelectAspectRatio(ratio)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                aspectRatio === ratio
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>

        {/* Right: Studio Overlay Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGrid((v) => !v)}
            className={`p-1.5 rounded transition-colors ${
              showGrid
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Toggle Rule of Thirds Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowSafeMargins((v) => !v)}
            className={`p-1.5 rounded transition-colors ${
              showSafeMargins
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Toggle Stock Broadcast Safe Margins (Title/Action Safe)"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCaptureSnapshot}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Download Current Frame as Pristine PNG"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Stage / Canvas Area */}
      <div className="flex-1 bg-zinc-950/90 flex items-center justify-center p-4 relative overflow-hidden min-h-[420px]">
        {/* Subtle studio backdrop grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Viewport Frame Container */}
        <div
          className={`relative max-w-full rounded-md overflow-hidden bg-black shadow-2xl border border-zinc-800 flex items-center justify-center ${getContainerAspectClass()}`}
        >
          {videoUrl ? (
            /* Render AI Video Clip */
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop={isLooping}
              muted
              playsInline
              className="w-full h-full object-contain"
              onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
            />
          ) : (
            /* Render Procedural Canvas */
            <canvas
              ref={canvasRef}
              width={aspectRatio === '9:16' ? 1080 : aspectRatio === '1:1' ? 1080 : 1920}
              height={aspectRatio === '9:16' ? 1920 : aspectRatio === '1:1' ? 1080 : 1080}
              className="w-full h-full object-contain"
            />
          )}

          {/* Rule of Thirds Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none border border-white/20">
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20"></div>
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20"></div>
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20"></div>
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20"></div>
            </div>
          )}

          {/* Broadcast / Stock Safe Margins Overlay */}
          {showSafeMargins && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Action Safe (90%) */}
              <div className="w-[90%] h-[90%] border border-cyan-400/40 border-dashed relative">
                <span className="absolute top-1 left-1.5 text-[9px] font-mono text-cyan-400/70 uppercase">
                  Action Safe (90%)
                </span>
                {/* Title Safe (80%) */}
                <div className="w-[88.8%] h-[88.8%] m-auto border border-amber-400/40 relative">
                  <span className="absolute top-1 left-1.5 text-[9px] font-mono text-amber-400/70 uppercase">
                    Title Safe (80%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Watermark-free Pro Badge */}
          <div className="absolute bottom-2 left-2 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-mono tracking-widest text-zinc-300 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
              STOCK COMPLIANT • ZERO WATERMARK
            </span>
          </div>
        </div>
      </div>

      {/* Scrubbable Timeline & Transport Controls */}
      <div className="bg-zinc-900/95 border-t border-zinc-800 px-4 py-2.5 space-y-2 select-none">
        {/* Scrubber Bar */}
        <div
          onClick={handleTimelineScrub}
          className="relative h-4 bg-zinc-950 rounded cursor-pointer group flex items-center border border-zinc-800"
        >
          {/* Loop duration background notches */}
          <div className="absolute inset-0 flex justify-between px-2 pointer-events-none">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="w-px h-1.5 bg-zinc-800 my-auto"></div>
            ))}
          </div>

          {/* Active progress fill */}
          <div
            className="h-full bg-gradient-to-r from-amber-600/70 to-amber-500 rounded-l transition-all pointer-events-none"
            style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
          />

          {/* Draggable Playhead pin */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 shadow-md shadow-amber-500/50 border-2 border-zinc-950 pointer-events-none group-hover:scale-125 transition-transform"
            style={{ left: `${Math.min(100, (currentTime / duration) * 100)}%` }}
          />
        </div>

        {/* Transport Toolbar */}
        <div className="flex items-center justify-between">
          {/* Left: Play/Pause, Rewind, Loop */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (videoRef.current) {
                  if (isPlaying) videoRef.current.pause();
                  else videoRef.current.play();
                }
                setIsPlaying((v) => !v);
              }}
              className="p-1.5 rounded-md bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold transition-all shadow-sm"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => {
                currentTimeRef.current = 0;
                setCurrentTime(0);
                if (videoRef.current) videoRef.current.currentTime = 0;
                renderCurrentState(0);
              }}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Reset to frame 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsLooping((v) => !v)}
              className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                isLooping
                  ? 'bg-zinc-800 text-amber-400 border border-amber-500/30 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Seamless Stock Loop Mode"
            >
              LOOP
            </button>
          </div>

          {/* Center: SMPTE Timecode & Frame Counter */}
          <div className="flex items-center gap-3 font-mono text-xs text-zinc-300 bg-zinc-950 px-3 py-1 rounded border border-zinc-800">
            <span className="text-amber-400 font-medium">
              {formatTimecode(currentTime, duration)}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400 text-[11px]">
              Frame {currentFrameNumber} / {totalFrames}
            </span>
          </div>

          {/* Right: Export CTA Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 hover:from-amber-400 hover:to-amber-300 transition-all shadow-md shadow-amber-500/20 active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export Stock Clip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
