import React from 'react';
import { X, CheckCircle2, Film, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StockSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockSpecsModal: React.FC<StockSpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Stock Footage Technical Guidelines</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Specs Content */}
        <div className="p-5 space-y-4 text-xs text-zinc-300 max-h-[80vh] overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
            <h4 className="font-semibold text-amber-400 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Built Specifically for Stock Contributors
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Motion Studio is tuned to the exact technical rejection criteria enforced by Adobe Stock, Shutterstock, Envato VideoHive, and Pond5 reviewers.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="border border-zinc-800 rounded-lg p-3 space-y-1 bg-zinc-950/40">
              <span className="font-semibold text-zinc-100 block">1. Duration Restrictions (5s - 30s)</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Stock platforms reject any video clip shorter than <strong className="text-amber-400 font-mono">5.0 seconds</strong>. Motion Studio enforces 5s, 10s, 15s, and 30s presets so your submissions will not get automated duration rejections.
              </p>
            </div>

            <div className="border border-zinc-800 rounded-lg p-3 space-y-1 bg-zinc-950/40">
              <span className="font-semibold text-zinc-100 block">2. Standard Framerate (30fps & 60fps)</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Variable framerates cause immediate ingest failures. Motion Studio renders offline frame-by-frame with deterministic timestamps ensuring steady 30.0 or 60.0 Constant Framerate (CFR).
              </p>
            </div>

            <div className="border border-zinc-800 rounded-lg p-3 space-y-1 bg-zinc-950/40">
              <span className="font-semibold text-zinc-100 block">3. Resolution Standards</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Accepted resolutions: <strong className="text-zinc-200">1920×1080 (Full HD)</strong> and <strong className="text-zinc-200">3840×2160 (4K UHD)</strong>. Vertical 9:16 (1080×1920) is supported for TikTok / Reels stock collections.
              </p>
            </div>

            <div className="border border-zinc-800 rounded-lg p-3 space-y-1 bg-zinc-950/40">
              <span className="font-semibold text-zinc-100 block">4. Zero Watermarks</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Never upload watermarked content. All exports from Motion Studio are 100% clean and unbranded with commercial rights.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
