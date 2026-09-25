import React, { useState, useEffect } from 'react';
import {
  Code2,
  Sparkles,
  ShieldCheck,
  Play,
  RotateCcw,
  Copy,
  Check,
  Sliders,
  Palette,
  Clock,
  Layers,
  FileCheck2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Type,
  Image as ImageIcon,
  Wand2
} from 'lucide-react';
import { UploadedImage, ProceduralConfig, SynthesizedCode } from '../types';
import { synthesizeProceduralCode, getStoredApiKey, checkServerApiKeyStatus } from '../services/aiMotionService';
import { SYNTHESIZED_PRESETS } from '../utils/synthesizedPresets';
import { BackgroundSelector } from './BackgroundSelector';

interface CodeSynthesizerControlsProps {
  currentImage: UploadedImage | null;
  config: ProceduralConfig;
  onConfigChange: (updated: Partial<ProceduralConfig>) => void;
  activeSynthesizedCode: SynthesizedCode | null;
  onSynthesizedCodeChange: (synth: SynthesizedCode | null) => void;
  onOpenApiKeyModal: () => void;
  onOpenSpecsModal: () => void;
}

export const CodeSynthesizerControls: React.FC<CodeSynthesizerControlsProps> = ({
  currentImage,
  config,
  onConfigChange,
  activeSynthesizedCode,
  onSynthesizedCodeChange,
  onOpenApiKeyModal,
  onOpenSpecsModal,
}) => {
  const [synthesisMode, setSynthesisMode] = useState<'prompt' | 'image'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editableCode, setEditableCode] = useState('');
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isTagsCopied, setIsTagsCopied] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(true);
  const [hasServerKey, setHasServerKey] = useState(false);

  // Sync editable code whenever activeSynthesizedCode changes
  useEffect(() => {
    if (activeSynthesizedCode) {
      setEditableCode(activeSynthesizedCode.code);
    } else {
      // Default to architecture preset if none is active
      const defaultPreset = SYNTHESIZED_PRESETS.architecture;
      onSynthesizedCodeChange(defaultPreset);
      setEditableCode(defaultPreset.code);
    }
  }, [activeSynthesizedCode, onSynthesizedCodeChange]);

  useEffect(() => {
    checkServerApiKeyStatus().then((active) => setHasServerKey(active));
  }, []);

  const handleSynthesize = async () => {
    if (synthesisMode === 'prompt' && !prompt.trim()) {
      setErrorMessage('Please enter a description or prompt for the motion graphics you want to generate.');
      return;
    }

    if (synthesisMode === 'image' && !currentImage) {
      setErrorMessage('Please select or upload a reference image first, or switch to Prompt Mode.');
      return;
    }

    const key = getStoredApiKey();
    if (!key && !hasServerKey) {
      setErrorMessage('Please connect your Google AI Key (or use AI Studio key) to synthesize procedural code.');
      onOpenApiKeyModal();
      return;
    }

    setIsSynthesizing(true);
    setErrorMessage(null);

    try {
      const imgUrl = synthesisMode === 'image' ? currentImage?.url : null;
      const result = await synthesizeProceduralCode(key, prompt, imgUrl);
      onSynthesizedCodeChange(result);
      setEditableCode(result.code);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to synthesize procedural code. Please check your prompt or API key.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleApplyEditedCode = () => {
    if (!activeSynthesizedCode) return;
    const updated: SynthesizedCode = {
      ...activeSynthesizedCode,
      code: editableCode,
    };
    onSynthesizedCodeChange(updated);
  };

  const handleResetCode = () => {
    if (!activeSynthesizedCode) return;
    // Check if it's one of the presets
    const presetKey = Object.keys(SYNTHESIZED_PRESETS).find(
      (k) => SYNTHESIZED_PRESETS[k].id === activeSynthesizedCode.id
    );
    if (presetKey) {
      const orig = SYNTHESIZED_PRESETS[presetKey].code;
      setEditableCode(orig);
      onSynthesizedCodeChange({ ...activeSynthesizedCode, code: orig });
    }
  };

  const handleSelectPreset = (presetKey: keyof typeof SYNTHESIZED_PRESETS) => {
    const preset = SYNTHESIZED_PRESETS[presetKey];
    if (preset) {
      onSynthesizedCodeChange(preset);
      setEditableCode(preset.code);
      if (preset.dominantColors && preset.dominantColors[2]) {
        onConfigChange({ accentColor: preset.dominantColors[2] });
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode);
    setIsCodeCopied(true);
    setTimeout(() => setIsCodeCopied(false), 2000);
  };

  const handleCopyTags = () => {
    if (!activeSynthesizedCode) return;
    navigator.clipboard.writeText(activeSynthesizedCode.stockTags.join(', '));
    setIsTagsCopied(true);
    setTimeout(() => setIsTagsCopied(false), 2000);
  };

  const promptModeSuggestions = [
    'Liquid gold organic waves undulating with caustic reflections',
    'Cyberpunk neon perspective grid with floating luminous prisms',
    'Atmospheric dust embers and warm volumetric sunbeams',
    'Kinetic minimalist typography with geometric orbits',
    'Quantum particles spiraling into a cosmic vortex',
    'Deep ocean bioluminescent ripples with glowing particles',
  ];

  const imageModeSuggestions = [
    'Volumetric sunlight rays with drifting warm embers',
    'Layered parallax mountain ridges with lake wave shimmer',
    'Futuristic neon window matrix and wet pavement reflections',
    'Ultra-luxury brushed metal watch with specular sweep flare',
    'Minimalist architectural cantilever beam with shadow drift',
  ];

  return (
    <div className="space-y-5">
      {/* Stock Marketplace Clearance Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-500/40 rounded-xl p-3.5 space-y-2 shadow-lg shadow-emerald-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% CODE-BASED CGI MOTION GRAPHICS</span>
          </div>
          <button
            onClick={onOpenSpecsModal}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium"
          >
            Stock Specs
          </button>
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          Stock agencies (Shutterstock, Adobe Stock, Envato) reject neural AI video, but <strong className="text-emerald-300">enthusiastically approve code-generated CGI graphics</strong>. Google AI translates your prompt or reference image into real JavaScript Canvas2D mathematical code—ensuring zero AI hallucination and 100% commercial clearance!
        </p>
      </div>

      {/* Synthesis Trigger Panel */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-4 shadow-sm">
        {/* Mode Selector: Prompt-to-Code vs Image-to-Code */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-800 rounded-lg gap-1">
          <button
            type="button"
            onClick={() => {
              setSynthesisMode('prompt');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
              synthesisMode === 'prompt'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Prompt-to-Code</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSynthesisMode('image');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
              synthesisMode === 'image'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image-to-Code</span>
          </button>
        </div>

        {/* Prompt Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 flex items-center justify-between">
            <span>
              {synthesisMode === 'prompt'
                ? 'Describe Motion Graphic / Scene'
                : 'Visual Direction / Motion Request (Optional)'}
            </span>
            <span className="text-[10px] text-zinc-500">
              {synthesisMode === 'prompt' ? 'Text to Motion' : 'Guides Motion Generation'}
            </span>
          </label>
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              synthesisMode === 'prompt'
                ? 'e.g. Liquid gold metallic waves undulating in slow motion with subtle caustic lighting and floating embers...'
                : 'e.g. Recreate composition with parallax depth, moving sunlight rays, and seamless particles...'
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
          />
        </div>

        {/* Suggestion Chips */}
        <div className="space-y-1">
          <span className="text-[10px] text-zinc-500 block">Click a creative prompt idea:</span>
          <div className="flex flex-wrap gap-1.5">
            {(synthesisMode === 'prompt' ? promptModeSuggestions : imageModeSuggestions).map((s, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(s)}
                className="text-[10px] bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded border border-zinc-800/80 transition-colors text-left"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Synthesize Button */}
        <button
          onClick={handleSynthesize}
          disabled={
            isSynthesizing ||
            (synthesisMode === 'prompt' ? !prompt.trim() : !currentImage)
          }
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          {isSynthesizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
              <span>Generating Motion...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-zinc-950 fill-zinc-950" />
              <span className="font-bold text-xs uppercase tracking-wider">Generate Motion</span>
            </>
          )}
        </button>

        {errorMessage && (
          <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-2.5 flex items-start gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Instant 1-Click Code Presets */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-400 font-medium flex items-center justify-between">
          <span>Instant Procedural Code Presets (0ms Load)</span>
          <span className="text-[10px] text-zinc-500">Stock Certified</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(
            [
              ['architecture', 'Monolith Drift'],
              ['portrait', 'Golden Silhouette'],
              ['cyberpunk', 'Neon Sector'],
              ['nature', 'Alpine Mist'],
              ['watch', 'Horology Sweep'],
            ] as const
          ).map(([key, label]) => {
            const isSelected = activeSynthesizedCode?.id === SYNTHESIZED_PRESETS[key]?.id;
            return (
              <button
                key={key}
                onClick={() => handleSelectPreset(key)}
                className={`p-2 rounded-lg text-left text-xs border transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-medium shadow-sm'
                    : 'bg-zinc-900/80 hover:bg-zinc-800/80 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="truncate font-semibold text-[11px]">{label}</div>
                <div className="text-[10px] text-zinc-500 truncate">100% Canvas2D</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Synthesized Scene Info */}
      {activeSynthesizedCode && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeSynthesizedCode.title}</span>
              </h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                {activeSynthesizedCode.explanation}
              </p>
            </div>
          </div>

          {/* Color Palette */}
          {activeSynthesizedCode.dominantColors && activeSynthesizedCode.dominantColors.length > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60">
              <span className="text-[10px] text-zinc-500 font-medium">Palette:</span>
              <div className="flex items-center gap-1.5">
                {activeSynthesizedCode.dominantColors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => onConfigChange({ accentColor: color })}
                    title={`Click to set accent to ${color}`}
                    className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stock Tags */}
          {activeSynthesizedCode.stockTags && activeSynthesizedCode.stockTags.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {activeSynthesizedCode.stockTags.slice(0, 4).map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800 font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <button
                onClick={handleCopyTags}
                className="text-[10px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 flex-shrink-0"
              >
                {isTagsCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isTagsCopied ? 'Copied' : 'Copy Tags'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Code Editor (Collapsible) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-zinc-300">
              Live Canvas2D Render Code
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              title="Copy code to clipboard"
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition-colors"
            >
              {isCodeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleResetCode}
              title="Reset to default code"
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowCodeEditor(!showCodeEditor)}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition-colors"
            >
              {showCodeEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {showCodeEditor && (
          <div className="p-3 space-y-2.5">
            <div className="relative">
              <textarea
                rows={12}
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                spellCheck={false}
                className="w-full bg-zinc-950 font-mono text-[11px] leading-relaxed text-emerald-400 p-3 rounded-lg border border-zinc-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-y select-text"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">
                Scope args: <code className="text-zinc-400">ctx, width, height, time, duration, config</code>
              </span>
              <button
                onClick={handleApplyEditedCode}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-all active:scale-[0.98]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Apply & Run Code</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Motion Background & Screen Keying (Green Screen / Black Screen / Custom Color) */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
        <BackgroundSelector
          config={config}
          onChangeConfig={(newCfg) => onConfigChange(newCfg)}
        />
      </div>

      {/* Global Real-time Sliders */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Mathematical Parameters
          </span>
        </div>

        {/* Speed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Time Progression Speed</span>
            <span className="font-mono text-zinc-200">{config.speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={3.0}
            step={0.1}
            value={config.speed}
            onChange={(e) => onConfigChange({ speed: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Intensity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Motion Amplitude & Parallax</span>
            <span className="font-mono text-zinc-200">{config.intensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={2.5}
            step={0.1}
            value={config.intensity}
            onChange={(e) => onConfigChange({ intensity: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Loop Duration */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>Stock Loop Duration</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Stock Compliant</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[5, 10, 15, 30].map((sec) => (
              <button
                key={sec}
                onClick={() => onConfigChange({ loopDuration: sec })}
                className={`py-1.5 rounded text-xs font-mono font-medium transition-colors ${
                  config.loopDuration === sec
                    ? 'bg-amber-500 text-zinc-950 font-semibold'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Palette className="w-3 h-3 text-zinc-500" />
              <span>Accent Glow / Lighting Vector</span>
            </span>
            <span className="font-mono text-zinc-200 text-[11px]">{config.accentColor}</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.accentColor}
              onChange={(e) => onConfigChange({ accentColor: e.target.value })}
              className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
            />
            <div className="flex-1 flex gap-1.5">
              {['#f59e0b', '#fbbf24', '#06b6d4', '#ec4899', '#10b981', '#ffffff'].map((hex) => (
                <button
                  key={hex}
                  onClick={() => onConfigChange({ accentColor: hex })}
                  className="w-6 h-6 rounded-full border border-zinc-700 hover:scale-110 transition-transform"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
