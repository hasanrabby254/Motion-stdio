import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, ExternalLink, X, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { getStoredApiKey, storeApiKey, validateGoogleApiKey, checkServerApiKeyStatus } from '../services/aiMotionService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyStatusChange: (hasKey: boolean) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyStatusChange,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [hasServerKey, setHasServerKey] = useState(false);
  const [status, setStatus] = useState<{ valid: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = getStoredApiKey();
      setApiKey(saved);
      checkServerApiKeyStatus().then((serverActive) => {
        setHasServerKey(serverActive);
        if (saved) {
          setStatus({ valid: true, message: 'Custom API Key active in browser session.' });
        } else if (serverActive) {
          setStatus({ valid: true, message: 'AI Studio default key connected and ready.' });
          onKeyStatusChange(true);
        } else {
          setStatus(null);
        }
      });
    }
  }, [isOpen, onKeyStatusChange]);

  if (!isOpen) return null;

  const handleValidateAndSave = async () => {
    const clean = apiKey.trim();
    if (!clean) {
      if (hasServerKey) {
        storeApiKey('');
        setStatus({ valid: true, message: 'Connected using AI Studio environment key.' });
        onKeyStatusChange(true);
        setTimeout(() => onClose(), 800);
        return;
      }
      storeApiKey('');
      setStatus(null);
      onKeyStatusChange(false);
      onClose();
      return;
    }

    setIsValidating(true);
    setStatus(null);

    const res = await validateGoogleApiKey(clean);
    setIsValidating(false);

    if (res.valid) {
      storeApiKey(clean);
      setStatus({ valid: true, message: 'API key verified! Google AI Studio connected.' });
      onKeyStatusChange(true);
      setTimeout(() => onClose(), 1000);
    } else {
      setStatus({ valid: false, message: res.error || 'Failed to authenticate key.' });
      onKeyStatusChange(false);
    }
  };

  const handleClear = () => {
    storeApiKey('');
    setApiKey('');
    if (hasServerKey) {
      setStatus({ valid: true, message: 'Reset to AI Studio environment key.' });
      onKeyStatusChange(true);
    } else {
      setStatus(null);
      onKeyStatusChange(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Google AI Studio (BYOK)</h3>
              <p className="text-[11px] text-zinc-400">Bring Your Own Key Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Server Key Detected Banner */}
        {hasServerKey && (
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-3 flex items-start gap-2.5 text-xs text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-emerald-200">AI Studio Key Detected</span>
              <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                Your Google AI Studio environment is pre-configured with a working Gemini key. You can generate motion immediately or paste a custom key below to use your personal quota.
              </p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Cost Serverless Model</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Your custom key is stored strictly in your browser session (<code className="text-zinc-300">localStorage</code>) and communicates directly with Google AI Studio.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-300 font-medium flex items-center justify-between">
            <span>Custom Google AI API Key (Optional)</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              Get Free Key <ExternalLink className="w-3 h-3" />
            </a>
          </label>
          <input
            type="password"
            placeholder={hasServerKey ? "Using AI Studio environment key (or paste AIzaSy...)" : "AIzaSy..."}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setStatus(null);
            }}
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center gap-2 font-mono ${
              status.valid
                ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                : 'bg-red-950/40 border border-red-800/60 text-red-300'
            }`}
          >
            {status.valid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span className="truncate">{status.message}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {apiKey ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Reset to Default
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleValidateAndSave}
              disabled={isValidating}
              className="px-4 py-1.5 rounded-md text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              {isValidating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{apiKey.trim() ? "Save & Connect" : hasServerKey ? "Use Environment Key" : "Save"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
