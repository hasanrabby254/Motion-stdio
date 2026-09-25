import React from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { BackgroundMode, ProceduralConfig } from '../types';

interface BackgroundSelectorProps {
  config: ProceduralConfig;
  onChangeConfig: (newConfig: Partial<ProceduralConfig>) => void;
  compact?: boolean;
}

export const POPULAR_BG_SWATCHES = [
  { label: 'Broadcast Blue', hex: '#0047bb' },
  { label: 'Studio White', hex: '#ffffff' },
  { label: 'Deep Navy', hex: '#0a192f' },
  { label: 'Cyber Violet', hex: '#2e1065' },
  { label: 'Dark Charcoal', hex: '#18181b' },
  { label: 'Crimson Red', hex: '#7f1d1d' },
  { label: 'Gold Amber', hex: '#78350f' },
  { label: 'Neon Emerald', hex: '#064e3b' },
];

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  config,
  onChangeConfig,
  compact = false,
}) => {
  const currentMode: BackgroundMode = config.backgroundMode || 'default';
  const customColor = config.customBackgroundColor || '#0047bb';

  const handleSelectMode = (mode: BackgroundMode) => {
    if (mode === 'greenscreen') {
      onChangeConfig({
        backgroundMode: 'greenscreen',
        customBackgroundColor: '#00FF00',
      });
    } else if (mode === 'black') {
      onChangeConfig({
        backgroundMode: 'black',
        customBackgroundColor: '#000000',
      });
    } else if (mode === 'custom') {
      onChangeConfig({
        backgroundMode: 'custom',
        customBackgroundColor: config.customBackgroundColor || '#0047bb',
      });
    } else {
      onChangeConfig({
        backgroundMode: 'default',
      });
    }
  };

  return (
    <div className={`space-y-2.5 ${compact ? 'text-xs' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span>Motion Background & Screen Key</span>
        </label>
        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
          {currentMode === 'greenscreen'
            ? 'Chroma #00FF00'
            : currentMode === 'black'
            ? 'Black #000000'
            : currentMode === 'custom'
            ? customColor.toUpperCase()
            : 'Default Backdrop'}
        </span>
      </div>

      {/* Mode Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {/* Default Button */}
        <button
          type="button"
          onClick={() => handleSelectMode('default')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium border transition-all ${
            currentMode === 'default'
              ? 'bg-zinc-800 text-amber-400 border-amber-500/60 font-semibold shadow-sm'
              : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-zinc-800'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-zinc-600 to-zinc-400 flex-shrink-0" />
          <span className="truncate">Default</span>
        </button>

        {/* Green Screen Button */}
        <button
          type="button"
          onClick={() => handleSelectMode('greenscreen')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium border transition-all ${
            currentMode === 'greenscreen'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400 font-bold ring-1 ring-emerald-500 shadow-sm'
              : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-zinc-800'
          }`}
          title="Standard Broadcast Green Screen (#00FF00) for Ultra Key / Keylight"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#00FF00] shadow-[0_0_8px_#00FF00] flex-shrink-0" />
          <span className="truncate">Green Screen</span>
        </button>

        {/* Black Screen Button */}
        <button
          type="button"
          onClick={() => handleSelectMode('black')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium border transition-all ${
            currentMode === 'black'
              ? 'bg-zinc-900 text-zinc-100 border-zinc-500 font-bold ring-1 ring-zinc-400 shadow-sm'
              : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-zinc-800'
          }`}
          title="Pure Black (#000000) for Screen / Add blend mode"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-black border border-zinc-600 flex-shrink-0" />
          <span className="truncate">Black Screen</span>
        </button>

        {/* Custom Color Button */}
        <button
          type="button"
          onClick={() => handleSelectMode('custom')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium border transition-all ${
            currentMode === 'custom'
              ? 'bg-zinc-800 text-amber-400 border-amber-500/60 font-semibold shadow-sm'
              : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-zinc-800'
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full border border-white/40 flex-shrink-0"
            style={{ backgroundColor: customColor }}
          />
          <span className="truncate">Custom Color</span>
        </button>
      </div>

      {/* Explanatory Banner per Mode */}
      {currentMode === 'greenscreen' && (
        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-2 text-xs text-emerald-300">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-emerald-200">
              🟢 Pure Green Screen (#00FF00) Active
            </p>
            <p className="text-[11px] text-emerald-400/90 leading-snug">
              Instant 1-click chroma keying in Adobe Premiere (Ultra Key), After Effects (Keylight), DaVinci Resolve (3D Keyer), and CapCut. Dark vignettes are auto-disabled for clean matte edges.
            </p>
          </div>
        </div>
      )}

      {currentMode === 'black' && (
        <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700/60 flex items-start gap-2 text-xs text-zinc-300">
          <Check className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-zinc-100">
              ⚫ Studio Black Screen (#000000) Active
            </p>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Pure pitch-black background. Set your layer blending mode to <strong>Screen</strong> or <strong>Linear Dodge (Add)</strong> in any editor for instant seamless transparency without keying!
            </p>
          </div>
        </div>
      )}

      {/* Custom Color Palette & Picker */}
      {currentMode === 'custom' && (
        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Pick Any Custom Color:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) =>
                  onChangeConfig({
                    backgroundMode: 'custom',
                    customBackgroundColor: e.target.value,
                  })
                }
                className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                title="Open system color picker"
              />
              <span className="font-mono text-zinc-200 text-xs uppercase px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                {customColor}
              </span>
            </div>
          </div>

          {/* Quick Popular Backdrop Swatches */}
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 block">Popular Studio Backdrops:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {POPULAR_BG_SWATCHES.map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() =>
                    onChangeConfig({
                      backgroundMode: 'custom',
                      customBackgroundColor: swatch.hex,
                    })
                  }
                  className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] transition-all ${
                    customColor.toLowerCase() === swatch.hex.toLowerCase()
                      ? 'border-amber-400 bg-zinc-800 font-bold text-zinc-100 ring-1 ring-amber-400'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/30 flex-shrink-0"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="truncate">{swatch.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
