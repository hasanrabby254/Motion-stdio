import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Layers,
  Wand2,
  ListVideo,
  Download,
  Key,
  Film,
  Code2,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import {
  AspectRatio,
  ExportSettings,
  ProceduralConfig,
  RenderJob,
  TemplateDefinition,
  UploadedImage,
  SynthesizedCode
} from './types';
import { TEMPLATES, SAMPLE_STOCK_IMAGES } from './templates/catalog';
import { SYNTHESIZED_PRESETS } from './utils/synthesizedPresets';
import { getStoredApiKey } from './services/aiMotionService';
import { videoExporter } from './services/videoExporter';
import { Header } from './components/Header';
import { UploadDropzone } from './components/UploadDropzone';
import { StudioViewport } from './components/StudioViewport';
import { ProceduralControls } from './components/ProceduralControls';
import { CodeSynthesizerControls } from './components/CodeSynthesizerControls';
import { ExportModal } from './components/ExportModal';
import { RenderQueueDrawer } from './components/RenderQueueDrawer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { StockSpecsModal } from './components/StockSpecsModal';
import { LandingPage } from './components/LandingPage';

export default function App() {
  // Navigation view: 'landing' | 'studio'
  const [currentView, setCurrentView] = useState<'landing' | 'studio'>('landing');

  // Initial sample image for instant demo experience
  const [currentImage, setCurrentImage] = useState<UploadedImage | null>(null);

  // Tab mode: 'code-synthesizer' | 'procedural'
  const [activeTab, setActiveTab] = useState<'code-synthesizer' | 'procedural'>('code-synthesizer');

  // Active Synthesized Procedural Code
  const [activeSynthesizedCode, setActiveSynthesizedCode] = useState<SynthesizedCode | null>(
    SYNTHESIZED_PRESETS.architecture
  );

  // Procedural Configuration
  const defaultTemplate = TEMPLATES[0];
  const [proceduralConfig, setProceduralConfig] = useState<ProceduralConfig>({
    templateId: defaultTemplate.id,
    category: defaultTemplate.category,
    speed: defaultTemplate.defaultConfig.speed ?? 1.0,
    intensity: defaultTemplate.defaultConfig.intensity ?? 1.2,
    accentColor: defaultTemplate.defaultConfig.accentColor ?? '#f59e0b',
    loopDuration: defaultTemplate.defaultConfig.loopDuration ?? 10,
    direction: defaultTemplate.defaultConfig.direction ?? 'diagonal',
    particleCount: defaultTemplate.defaultConfig.particleCount ?? 65,
    particleType: defaultTemplate.defaultConfig.particleType ?? 'ember',
    glowIntensity: defaultTemplate.defaultConfig.glowIntensity ?? 1.3,
    vignette: defaultTemplate.defaultConfig.vignette ?? true,
    filmGrain: defaultTemplate.defaultConfig.filmGrain ?? true,
    chromaticShift: 0.5,
    rippleFrequency: 2.2,
    flarePosition: { x: 0.5, y: 0.5 },
  });

  // Aspect Ratio selection
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  // Active video url (set only when user previews an exported video from queue)
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Modals & Drawers state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);

  // BYOK API key status
  const [hasApiKey, setHasApiKey] = useState(false);

  // Render Queue state
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);

  // Load initial sample image on mount
  useEffect(() => {
    const sample = SAMPLE_STOCK_IMAGES[0];
    const initialImg: UploadedImage = {
      id: 'default_init',
      url: sample.url,
      name: sample.name,
      width: sample.width,
      height: sample.height,
      sizeBytes: sample.sizeBytes,
      format: sample.format,
      base64: sample.url,
    };
    setCurrentImage(initialImg);

    // Check API Key
    const key = getStoredApiKey();
    setHasApiKey(!!key);
  }, []);

  // Handle template selection
  const handleSelectTemplate = (tpl: TemplateDefinition) => {
    setProceduralConfig((prev) => ({
      ...prev,
      templateId: tpl.id,
      category: tpl.category,
      ...tpl.defaultConfig,
    }));
    setActiveVideoUrl(null);
  };

  // Start background render job
  const handleQueueRender = async (settings: ExportSettings) => {
    if (!currentImage) return;

    const isCodeMode = activeTab === 'code-synthesizer' && activeSynthesizedCode;
    const tpl = TEMPLATES.find((t) => t.id === proceduralConfig.templateId) || TEMPLATES[0];
    const jobId = 'job_' + Date.now();
    const cleanTitle = isCodeMode
      ? activeSynthesizedCode.title
      : currentImage.name.replace(/\.[^/.]+$/, '') || 'Stock_Motion';

    const newJob: RenderJob = {
      id: jobId,
      title: cleanTitle,
      templateName: isCodeMode ? 'CGI Code: ' + activeSynthesizedCode.title : tpl.name,
      status: 'queued',
      progress: 0,
      currentFrame: 0,
      totalFrames: Math.floor(settings.duration * settings.framerate),
      duration: settings.duration,
      resolution: settings.resolution,
      framerate: settings.framerate,
      format: settings.format,
      videoUrl: null,
      blob: null,
      fileSizeBytes: null,
      timestamp: Date.now(),
    };

    setRenderJobs((prev) => [newJob, ...prev]);
    setIsQueueDrawerOpen(true);

    // Begin render process
    setRenderJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'rendering' } : j))
    );

    try {
      // Load source image if available
      let img: HTMLImageElement | null = null;
      if (currentImage && currentImage.url) {
        img = new Image();
        if (!currentImage.url.startsWith('data:') && !currentImage.url.startsWith('blob:')) {
          img.crossOrigin = 'anonymous';
        }
        await new Promise<void>((resolve) => {
          if (!img) return resolve();
          img.onload = () => resolve();
          img.onerror = () => {
            // Non-blocking fallback
            resolve();
          };
          img.src = currentImage.url;
        });
      }

      const result = await videoExporter.exportProceduralVideo(
        img,
        proceduralConfig,
        settings,
        (progress, currentFrame, totalFrames) => {
          setRenderJobs((prev) =>
            prev.map((j) =>
              j.id === jobId
                ? { ...j, progress, currentFrame, totalFrames }
                : j
            )
          );
        },
        isCodeMode ? activeSynthesizedCode.code : undefined
      );

      // Complete job
      setRenderJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: 'completed',
                progress: 100,
                videoUrl: result.url,
                blob: result.blob,
                fileSizeBytes: result.fileSizeBytes,
                format: result.format as any,
              }
            : j
        )
      );
    } catch (err: any) {
      if (err.message !== 'Export canceled by user.') {
        setRenderJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? { ...j, status: 'failed', error: err.message || 'Render failed' }
              : j
          )
        );
      }
    }
  };

  const handleCancelJob = (jobId: string) => {
    videoExporter.cancel();
    setRenderJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const handleClearCompleted = () => {
    setRenderJobs((prev) => prev.filter((j) => j.status !== 'completed'));
  };

  const activeRendersCount = renderJobs.filter((j) => j.status === 'rendering').length;

  const handleLaunchStudio = (presetKey?: string) => {
    if (presetKey && SYNTHESIZED_PRESETS[presetKey]) {
      setActiveSynthesizedCode(SYNTHESIZED_PRESETS[presetKey]);
      setActiveTab('code-synthesizer');
    }
    setCurrentView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      {currentView === 'landing' ? (
        <LandingPage
          onLaunchApp={handleLaunchStudio}
          onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
        />
      ) : (
        <>
          {/* Top Application Header */}
          <Header
            hasApiKey={hasApiKey}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            onOpenQueue={() => setIsQueueDrawerOpen(true)}
            queueCount={renderJobs.length}
            activeRendersCount={activeRendersCount}
            onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
            onNavigateHome={() => setCurrentView('landing')}
          />

          {/* Main Studio Workspace: Viewport first on smaller viewports, two-column on desktop */}
          <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
            {/* Left Column: Controls & Configuration Sidebar (Order 2 on mobile, Order 1 on lg) */}
            <aside className="order-2 lg:order-1 w-full lg:w-[450px] xl:w-[480px] border-t lg:border-t-0 lg:border-r border-zinc-800/80 bg-zinc-950 flex flex-col lg:overflow-y-auto lg:max-h-[calc(100vh-3.5rem)] scrollbar-thin">
          <div className="p-4 sm:p-5 space-y-5">
            {/* Module A: Upload & Live Preview Zone */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200 uppercase font-mono tracking-wider">
                  Module A • Source Image
                </span>
                {currentImage && (
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Ready for Motion
                  </span>
                )}
              </div>
              <UploadDropzone
                currentImage={currentImage}
                onImageSelected={(img) => {
                  setCurrentImage(img);
                  setActiveVideoUrl(null);
                }}
                onRemoveImage={() => {
                  setCurrentImage(null);
                  setActiveVideoUrl(null);
                }}
              />
            </section>

            {/* Mode Switcher: Code Synthesizer vs Procedural Presets */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <div className="grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('code-synthesizer');
                    setActiveVideoUrl(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'code-synthesizer'
                      ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-emerald-500/40 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span className="truncate">AI Code Synthesizer (Prompt/Image)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('procedural');
                    setActiveVideoUrl(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'procedural'
                      ? 'bg-zinc-800 text-amber-400 shadow-sm border border-zinc-700/60 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="truncate">Procedural Presets (12)</span>
                </button>
              </div>

              {/* Mode Description Subtitle */}
              <div className="px-1 flex items-center justify-between text-[11px] text-zinc-400">
                {activeTab === 'code-synthesizer' ? (
                  <span className="text-emerald-400 font-medium">✓ 100% Code CGI • Approved for Shutterstock & Adobe Stock</span>
                ) : (
                  <span className="text-amber-400 font-medium">Instant 60 FPS mathematical loops • 0 API tokens</span>
                )}
              </div>
            </div>

            {/* Active Mode Panels: Code Synthesizer OR Procedural Presets */}
            {activeTab === 'code-synthesizer' ? (
              <section className="space-y-3">
                <CodeSynthesizerControls
                  currentImage={currentImage}
                  config={proceduralConfig}
                  onConfigChange={(newCfg) => setProceduralConfig((prev) => ({ ...prev, ...newCfg }))}
                  activeSynthesizedCode={activeSynthesizedCode}
                  onSynthesizedCodeChange={(synth) => {
                    setActiveSynthesizedCode(synth);
                    setActiveVideoUrl(null);
                  }}
                  onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                  onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
                />
              </section>
            ) : (
              <section className="space-y-3">
                <ProceduralControls
                  config={proceduralConfig}
                  onChangeConfig={(newCfg) => {
                    setProceduralConfig(newCfg);
                    setActiveVideoUrl(null);
                  }}
                  onSelectTemplate={handleSelectTemplate}
                />
              </section>
            )}
          </div>
        </aside>

        {/* Right Column: Studio Viewport & Monitor (Order 1 on mobile, Order 2 on lg) */}
        <section className="order-1 lg:order-2 flex-1 bg-zinc-950/60 p-3 sm:p-5 flex flex-col justify-start lg:justify-between lg:overflow-y-auto lg:max-h-[calc(100vh-3.5rem)]">
          <div className="max-w-6xl w-full mx-auto space-y-4">
            <StudioViewport
              image={currentImage}
              config={proceduralConfig}
              videoUrl={activeVideoUrl}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              aspectRatio={aspectRatio}
              onSelectAspectRatio={(ratio) => setAspectRatio(ratio)}
              activeTab={activeTab}
              customCode={activeSynthesizedCode?.code}
            />

            {/* Stock Platform Specifications Quick Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                  ADOBE STOCK / SHUTTERSTOCK
                </span>
                <p className="text-xs font-semibold text-zinc-200">
                  Minimum 5.0s Clip Duration
                </p>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Automated ingest gates reject clips under 5 seconds. All presets guarantee compliance.
                </p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                  EXPORT FIDELITY
                </span>
                <p className="text-xs font-semibold text-zinc-200">
                  Deterministic Constant 60 FPS
                </p>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Frame-by-frame pipeline prevents dropped frames, stutter, and variable framerate flags.
                </p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                  COMMERCIAL RIGHTS
                </span>
                <p className="text-xs font-semibold text-zinc-200">
                  Zero Watermark & Full License
                </p>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Pristine master renders ready for direct marketplace upload without branding tags.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      </>
      )}

      {/* Modals & Drawers */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        image={currentImage}
        config={proceduralConfig}
        videoUrl={activeVideoUrl}
        onQueueRender={handleQueueRender}
        activeTab={activeTab}
      />

      <RenderQueueDrawer
        isOpen={isQueueDrawerOpen}
        onClose={() => setIsQueueDrawerOpen(false)}
        jobs={renderJobs}
        onCancelJob={handleCancelJob}
        onClearCompleted={handleClearCompleted}
        onPreviewJob={(url) => {
          setActiveVideoUrl(url);
          setIsQueueDrawerOpen(false);
        }}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyStatusChange={(valid) => setHasApiKey(valid)}
      />

      <StockSpecsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
      />
    </div>
  );
}
