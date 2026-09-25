import React from 'react';
import { Key, Film, ListVideo, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  onOpenQueue: () => void;
  queueCount: number;
  activeRendersCount: number;
  onOpenSpecsModal: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  onOpenApiKeyModal,
  onOpenQueue,
  queueCount,
  activeRendersCount,
  onOpenSpecsModal,
  onNavigateHome,
}) => {
  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between select-none z-30 sticky top-0">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity text-left cursor-pointer"
          title="Return to Landing Page"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-zinc-950 font-black tracking-wider text-sm">
            <Film className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold tracking-tight text-zinc-100 text-base">MOTION STUDIO</span>
            <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-500/20">
              PRO STOCK v1.0
            </span>
          </div>
        </button>

        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="hidden sm:inline-flex text-[11px] text-zinc-400 hover:text-amber-400 px-2 py-1 rounded hover:bg-zinc-900 border border-zinc-800/60 transition-colors ml-2 cursor-pointer"
          >
            ← Home
          </button>
        )}
      </div>

      {/* Center status info */}
      <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>STUDIO ENGINE READY</span>
        <span className="text-zinc-600">•</span>
        <span>ZERO WATERMARK</span>
        <span className="text-zinc-600">•</span>
        <span>DETERMINISTIC 60FPS</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Stock specs guidance button */}
        <button
          onClick={onOpenSpecsModal}
          className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 rounded-md hover:bg-zinc-800/60 transition-colors border border-transparent hover:border-zinc-700"
          title="Stock Platform Video Submission Guidelines"
        >
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>Stock Specs</span>
        </button>

        {/* BYOK Google AI API Key Button */}
        <button
          onClick={onOpenApiKeyModal}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border transition-all ${
            hasApiKey
              ? 'bg-zinc-900 border-zinc-700/80 text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-800'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
          }`}
          title="Bring Your Own Key (Google AI Studio)"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium">
            {hasApiKey ? 'Google AI Key: Connected' : 'Connect Google AI Key'}
          </span>
          {hasApiKey ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          )}
        </button>

        {/* Render Queue Button */}
        <button
          onClick={onOpenQueue}
          className="relative flex items-center gap-2 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-md transition-all"
          title="Open Render Queue"
        >
          <ListVideo className="w-3.5 h-3.5 text-zinc-300" />
          <span className="hidden sm:inline">Render Queue</span>
          {activeRendersCount > 0 ? (
            <span className="flex items-center justify-center px-1.5 py-0.2 rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px] animate-pulse">
              {activeRendersCount} active
            </span>
          ) : queueCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px] border border-zinc-700">
              {queueCount}
            </span>
          ) : null}
        </button>
      </div>
    </header>
  );
};
