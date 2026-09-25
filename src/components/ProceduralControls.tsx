import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Sliders,
  Palette,
  Compass,
  Clock,
  Save,
  Trash2,
  Check,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { AnimationCategory, CustomPreset, MotionDirection, ProceduralConfig, TemplateDefinition } from '../types';
import { TEMPLATES } from '../templates/catalog';
import { BackgroundSelector } from './BackgroundSelector';

interface ProceduralControlsProps {
  config: ProceduralConfig;
  onChangeConfig: (newConfig: ProceduralConfig) => void;
  onSelectTemplate: (template: TemplateDefinition) => void;
}

const PRESETS_STORAGE_KEY = 'motion_studio_custom_presets';

export const ProceduralControls: React.FC<ProceduralControlsProps> = ({
  config,
  onChangeConfig,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | AnimationCategory>('all');
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [presetNameInput, setPresetNameInput] = useState('');
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Load custom presets on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (stored) {
        setCustomPresets(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const handleSavePreset = () => {
    if (!presetNameInput.trim()) return;
    const newPreset: CustomPreset = {
      id: 'preset_' + Date.now(),
      name: presetNameInput.trim(),
      createdAt: Date.now(),
      config: { ...config },
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
    setPresetNameInput('');
    setShowSavePresetModal(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = customPresets.filter((p) => p.id !== id);
    setCustomPresets(filtered);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(filtered));
  };

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    if (selectedCategory === 'all') return true;
    return tpl.category === selectedCategory;
  });

  const activeTemplate = TEMPLATES.find((t) => t.id === config.templateId) || TEMPLATES[0];

  // Curated color swatches for stock grading
  const COLOR_SWATCHES = [
    { label: 'Warm Amber', hex: '#f59e0b' },
    { label: 'Cinema Cyan', hex: '#06b6d4' },
    { label: 'Neon Emerald', hex: '#10b981' },
    { label: 'Sunset Coral', hex: '#f97316' },
    { label: 'Deep Violet', hex: '#8b5cf6' },
    { label: 'Diamond White', hex: '#fef08a' },
  ];

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg select-none">
        {(['all', 'canvas', 'css', 'svg'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium uppercase tracking-wider transition-all ${
              selectedCategory === cat
                ? 'bg-zinc-800 text-amber-400 font-semibold shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] uppercase font-mono tracking-wider text-zinc-400 flex items-center justify-between">
          <span>Animation Templates ({filteredTemplates.length})</span>
          <span className="text-zinc-500 font-normal">Zero API Cost • Instant</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
          {filteredTemplates.map((tpl) => {
            const isSelected = tpl.id === config.templateId;
            return (
              <button
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl)}
                className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 text-zinc-100 shadow-sm'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-zinc-100 truncate">{tpl.name}</span>
                  <span
                    className={`text-[9px] uppercase font-mono px-1 rounded ${
                      tpl.category === 'canvas'
                        ? 'bg-blue-950/60 text-blue-400 border border-blue-900/40'
                        : tpl.category === 'css'
                        ? 'bg-purple-950/60 text-purple-400 border border-purple-900/40'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40'
                    }`}
                  >
                    {tpl.category}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-1">{tpl.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parameter Sliders */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Motion Parameters</span>
          </div>
          <button
            onClick={() => {
              if (activeTemplate) {
                onChangeConfig({
                  ...config,
                  ...activeTemplate.defaultConfig,
                });
              }
            }}
            className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 hover:underline"
            title="Reset to template defaults"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Defaults
          </button>
        </div>

        {/* Speed Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300">Animation Speed</span>
            <span className="font-mono text-amber-400">{config.speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={config.speed}
            onChange={(e) => onChangeConfig({ ...config, speed: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>0.2x (Subtle)</span>
            <span>1.0x (Cinema)</span>
            <span>3.0x (Fast)</span>
          </div>
        </div>

        {/* Motion Intensity / Depth Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300">Motion Depth & Intensity</span>
            <span className="font-mono text-amber-400">{config.intensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={config.intensity}
            onChange={(e) => onChangeConfig({ ...config, intensity: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Loop Duration Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              Loop Duration
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              Stock Minimum: 5s
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[5, 10, 15, 30].map((dur) => (
              <button
                key={dur}
                onClick={() => onChangeConfig({ ...config, loopDuration: dur })}
                className={`py-1 rounded text-xs font-mono transition-all border ${
                  config.loopDuration === dur
                    ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>

        {/* Motion Background & Chroma Keying */}
        <div className="pt-2 border-t border-zinc-800/80">
          <BackgroundSelector
            config={config}
            onChangeConfig={(newCfg) => onChangeConfig({ ...config, ...newCfg })}
          />
        </div>

        {/* Color Accent Picker */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
          <label className="text-xs text-zinc-300 flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-zinc-400" />
            <span>Accent & Atmospheric Tone</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  onClick={() => onChangeConfig({ ...config, accentColor: swatch.hex })}
                  style={{ backgroundColor: swatch.hex }}
                  className={`w-6 h-6 rounded-full transition-transform border ${
                    config.accentColor === swatch.hex
                      ? 'scale-110 ring-2 ring-amber-400 border-white'
                      : 'border-black/40 hover:scale-105'
                  }`}
                  title={swatch.label}
                />
              ))}
            </div>
            <input
              type="color"
              value={config.accentColor}
              onChange={(e) => onChangeConfig({ ...config, accentColor: e.target.value })}
              className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
              title="Custom Hex Color"
            />
          </div>
        </div>

        {/* Direction Selector */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-300 flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-zinc-400" />
            <span>Camera Vector Direction</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['in', 'out', 'left', 'right', 'diagonal', 'orbit'] as MotionDirection[]).map((dir) => (
              <button
                key={dir}
                onClick={() => onChangeConfig({ ...config, direction: dir })}
                className={`py-1 px-2 rounded text-[11px] capitalize font-mono border transition-all ${
                  config.direction === dir
                    ? 'bg-zinc-800 text-amber-400 font-semibold border-amber-500/50'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                }`}
              >
                {dir === 'in' ? 'Push In' : dir === 'out' ? 'Pull Out' : dir}
              </button>
            ))}
          </div>
        </div>

        {/* Particle Count Slider if applicable */}
        {(config.templateId === 'atmospheric-particles' || config.templateId === 'starburst-sparkle') && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300">Particle Density</span>
              <span className="font-mono text-amber-400">{config.particleCount}</span>
            </div>
            <input
              type="range"
              min="15"
              max="120"
              step="5"
              value={config.particleCount}
              onChange={(e) => onChangeConfig({ ...config, particleCount: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {/* Toggles: Vignette & Film Grain */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={config.vignette}
              onChange={(e) => onChangeConfig({ ...config, vignette: e.target.checked })}
              className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span>Cinematic Vignette</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={config.filmGrain}
              onChange={(e) => onChangeConfig({ ...config, filmGrain: e.target.checked })}
              className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span>35mm Film Grain</span>
          </label>
        </div>
      </div>

      {/* Preset Management */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setShowSavePresetModal(true)}
          className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-md border border-amber-500/20 transition-all font-medium"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save As Preset</span>
        </button>

        {saveSuccessNotice && (
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <Check className="w-3 h-3" /> Preset Saved!
          </span>
        )}
      </div>

      {/* Custom Presets List */}
      {customPresets.length > 0 && (
        <div className="space-y-1 pt-1">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Your Saved Presets ({customPresets.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {customPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onChangeConfig(preset.config)}
                className="group flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-2.5 py-1 rounded text-xs cursor-pointer transition-all"
              >
                <span>{preset.name}</span>
                <button
                  onClick={(e) => handleDeletePreset(preset.id, e)}
                  className="text-zinc-500 hover:text-red-400 transition-colors p-0.5"
                  title="Delete preset"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Preset Dialog Modal */}
      {showSavePresetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-sm space-y-3 shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Save className="w-4 h-4 text-amber-400" />
              Save Preset Configuration
            </h3>
            <p className="text-xs text-zinc-400">
              Save your current speed, intensity, loop duration, and color settings for quick stock clip generation.
            </p>
            <input
              type="text"
              placeholder="e.g. Cinematic B-Roll Push (Warm)"
              value={presetNameInput}
              onChange={(e) => setPresetNameInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSavePresetModal(false)}
                className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!presetNameInput.trim()}
                className="px-3 py-1.5 rounded-md text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold disabled:opacity-50"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
