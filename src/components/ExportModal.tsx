import React, { useState } from 'react';
import {
  Download,
  X,
  Sliders,
  Clock,
  Tv,
  Film,
  Sparkles,
  Layers,
  HelpCircle,
  CheckCircle2,
  Check,
  HardDrive
} from 'lucide-react';
import {
  AspectRatio,
  ExportSettings,
  ProceduralConfig,
  RenderJob,
  UploadedImage,
  VideoFormat,
  VideoFramerate,
  VideoResolution
} from '../types';
import { getTargetDimensions } from '../services/videoExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: UploadedImage | null;
  config: ProceduralConfig;
  videoUrl: string | null;
  onQueueRender: (settings: ExportSettings) => void;
  activeTab?: 'code-synthesizer' | 'procedural';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  image,
  config,
  videoUrl,
  onQueueRender,
  activeTab,
}) => {
  const [settings, setSettings] = useState<ExportSettings>({
    duration: config.loopDuration || 10,
    resolution: '1080p',
    aspectRatio: '16:9',
    framerate: 60,
    format: 'mp4',
    bitrateMbps: 25,
  });

  React.useEffect(() => {
    if (isOpen && config.loopDuration) {
      setSettings((prev) => ({ ...prev, duration: config.loopDuration }));
    }
  }, [config.loopDuration, isOpen]);

  if (!isOpen) return null;

  const targetDim = getTargetDimensions(settings.resolution, settings.aspectRatio);

  // Quick Preset Handlers
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'adobe-stock-4k':
        setSettings({
          ...settings,
          duration: 10,
          resolution: '4k',
          aspectRatio: '16:9',
          framerate: 60,
          format: 'mp4',
          bitrateMbps: 45,
        });
        break;
      case 'shutterstock-1080p':
        setSettings({
          ...settings,
          duration: 10,
          resolution: '1080p',
          aspectRatio: '16:9',
          framerate: 30,
          format: 'mp4',
          bitrateMbps: 25,
        });
        break;
      case 'social-vertical':
        setSettings({
          ...settings,
          duration: 15,
          resolution: '1080p',
          aspectRatio: '9:16',
          framerate: 60,
          format: 'mp4',
          bitrateMbps: 25,
        });
        break;
      case 'envato-loop':
        setSettings({
          ...settings,
          duration: 5,
          resolution: '1080p',
          aspectRatio: '16:9',
          framerate: 60,
          format: 'mp4',
          bitrateMbps: 30,
        });
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQueueRender(settings);
    onClose();
  };

  const estimatedFileSizeMb = Math.round(((settings.bitrateMbps * settings.duration) / 8) * 1.1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Export Stock Motion Video</h3>
              <p className="text-[11px] text-zinc-400">Zero watermark • Commercial stock compliant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Marketplace Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-mono tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Platform Target Presets</span>
              <span className="text-zinc-500">Quick Specs</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('adobe-stock-4k')}
                className="p-2 rounded bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all"
              >
                <span className="block text-[11px] font-semibold text-amber-400">Adobe Stock 4K</span>
                <span className="block text-[10px] text-zinc-400 font-mono">3840×2160 @ 60fps</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('shutterstock-1080p')}
                className="p-2 rounded bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all"
              >
                <span className="block text-[11px] font-semibold text-zinc-200">Shutterstock HD</span>
                <span className="block text-[10px] text-zinc-400 font-mono">1920×1080 @ 30fps</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('social-vertical')}
                className="p-2 rounded bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all"
              >
                <span className="block text-[11px] font-semibold text-zinc-200">9:16 Vertical</span>
                <span className="block text-[10px] text-zinc-400 font-mono">1080×1920 @ 60fps</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('envato-loop')}
                className="p-2 rounded bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all"
              >
                <span className="block text-[11px] font-semibold text-zinc-200">Envato 5s Loop</span>
                <span className="block text-[10px] text-zinc-400 font-mono">1080p Seamless</span>
              </button>
            </div>
          </div>

          {/* Duration Options */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Clip Duration</span>
              </label>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                Stock Platforms require 5s minimum
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 30].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSettings({ ...settings, duration: dur })}
                  className={`py-2 rounded-lg text-xs font-mono border transition-all ${
                    settings.duration === dur
                      ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800 border-zinc-800'
                  }`}
                >
                  {dur} Seconds
                </button>
              ))}
            </div>
          </div>

          {/* Resolution & Framerate */}
          <div className="grid grid-cols-2 gap-3">
            {/* Resolution */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-zinc-400" />
                <span>Resolution</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['1080p', '4k'] as VideoResolution[]).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setSettings({ ...settings, resolution: res })}
                    className={`py-2 rounded-lg text-xs font-mono uppercase border transition-all ${
                      settings.resolution === res
                        ? 'bg-zinc-800 text-amber-400 font-bold border-amber-500/50'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                    }`}
                  >
                    {res === '4k' ? '4K UHD' : '1080p HD'}
                  </button>
                ))}
              </div>
            </div>

            {/* Framerate */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-zinc-400" />
                <span>Framerate</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {([30, 60] as VideoFramerate[]).map((fps) => (
                  <button
                    key={fps}
                    type="button"
                    onClick={() => setSettings({ ...settings, framerate: fps })}
                    className={`py-2 rounded-lg text-xs font-mono border transition-all ${
                      settings.framerate === fps
                        ? 'bg-zinc-800 text-amber-400 font-bold border-amber-500/50'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                    }`}
                  >
                    {fps} FPS
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aspect Ratio & Format */}
          <div className="grid grid-cols-2 gap-3">
            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-300 font-medium">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-1">
                {(['16:9', '9:16', '1:1', '4:5'] as AspectRatio[]).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setSettings({ ...settings, aspectRatio: ar })}
                    className={`py-1.5 rounded text-xs font-mono border transition-all ${
                      settings.aspectRatio === ar
                        ? 'bg-zinc-800 text-amber-400 font-bold border-amber-500/50'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-300 font-medium">Container Format</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['mp4', 'webm'] as VideoFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setSettings({ ...settings, format: fmt })}
                    className={`py-1.5 rounded-lg text-xs font-mono uppercase border transition-all ${
                      settings.format === fmt
                        ? 'bg-zinc-800 text-amber-400 font-bold border-amber-500/50'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                    }`}
                  >
                    {fmt === 'mp4' ? 'MP4 (H.264)' : 'WebM (VP9)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bitrate Slider */}
          <div className="space-y-1 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300">Encoding Bitrate / Quality</span>
              <span className="font-mono text-amber-400">{settings.bitrateMbps} Mbps</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={settings.bitrateMbps}
              onChange={(e) => setSettings({ ...settings, bitrateMbps: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>10 Mbps (Standard Web)</span>
              <span>25 Mbps (Stock HD)</span>
              <span>50 Mbps (Master UHD)</span>
            </div>
          </div>

          {/* Stock Certification Banner */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-2.5 flex items-center gap-2 text-xs text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Certified 100% Code CGI:</strong> Pure mathematical Canvas2D animation. Zero neural AI metadata or artifacts. Approved for Shutterstock, Adobe Stock, and Envato CGI Motion Graphics categories.
            </span>
          </div>

          {/* Render Specifications Summary */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400">
              <span>OUTPUT DIMENSIONS:</span>
              <span className="text-zinc-200">{targetDim.width} × {targetDim.height} px</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>BACKGROUND SCREEN:</span>
              <span className="text-zinc-200 font-semibold">
                {config.backgroundMode === 'greenscreen'
                  ? '🟢 Chroma Green (#00FF00)'
                  : config.backgroundMode === 'black'
                  ? '⚫ Studio Black (#000000)'
                  : config.backgroundMode === 'custom'
                  ? `🎨 Custom (${(config.customBackgroundColor || '#0047BB').toUpperCase()})`
                  : 'Default Studio Backdrop'}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>TOTAL FRAMES:</span>
              <span className="text-zinc-200">{settings.duration * settings.framerate} frames</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>ESTIMATED FILE SIZE:</span>
              <span className="text-amber-400">~{estimatedFileSizeMb} MB</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Queue & Render Video</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
