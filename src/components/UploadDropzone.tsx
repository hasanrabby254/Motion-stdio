import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, Image as ImageIcon, Sparkles, RefreshCw, X, FileImage, Layers } from 'lucide-react';
import { UploadedImage } from '../types';
import { SAMPLE_STOCK_IMAGES } from '../templates/catalog';

interface UploadDropzoneProps {
  currentImage: UploadedImage | null;
  onImageSelected: (image: UploadedImage) => void;
  onRemoveImage: () => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  currentImage,
  onImageSelected,
  onRemoveImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  // Helper to load file and extract dimensions and base64
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const uploaded: UploadedImage = {
          id: 'img_' + Date.now(),
          url: result,
          base64: result,
          name: file.name,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          sizeBytes: file.size,
          format: file.type,
        };
        onImageSelected(uploaded);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  // Paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleLoadSample = async (sample: typeof SAMPLE_STOCK_IMAGES[0]) => {
    setIsLoadingSample(true);
    try {
      // Create image element to get natural dimensions
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Also convert to data URL for AI APIs
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        let dataUrl = sample.url;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          } catch (e) {
            // cross origin fallback
            dataUrl = sample.url;
          }
        }

        const uploaded: UploadedImage = {
          id: 'sample_' + Date.now(),
          url: sample.url,
          base64: dataUrl,
          name: sample.name,
          width: img.naturalWidth || sample.width,
          height: img.naturalHeight || sample.height,
          sizeBytes: sample.sizeBytes,
          format: sample.format,
        };
        onImageSelected(uploaded);
        setIsLoadingSample(false);
      };
      img.onerror = () => {
        setIsLoadingSample(false);
      };
      img.src = sample.url;
    } catch (err) {
      setIsLoadingSample(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getAspectRatioLabel = (w: number, h: number): string => {
    const ratio = w / h;
    if (Math.abs(ratio - 16 / 9) < 0.05) return '16:9 Landscape';
    if (Math.abs(ratio - 9 / 16) < 0.05) return '9:16 Vertical';
    if (Math.abs(ratio - 1) < 0.05) return '1:1 Square';
    if (Math.abs(ratio - 4 / 5) < 0.05) return '4:5 Portrait';
    if (Math.abs(ratio - 3 / 2) < 0.05) return '3:2 Classic Photo';
    return `${w}:${h}`;
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
          }
        }}
      />

      {/* Image Loaded Card */}
      {currentImage ? (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 relative group">
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-md overflow-hidden bg-zinc-950 border border-zinc-700/60 flex-shrink-0 relative">
              <img
                src={currentImage.url}
                alt={currentImage.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-zinc-100 truncate" title={currentImage.name}>
                {currentImage.name}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-400 font-mono">
                <span className="text-zinc-200">
                  {currentImage.width} × {currentImage.height} px
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400/90">
                  {getAspectRatioLabel(currentImage.width, currentImage.height)}
                </span>
                <span className="text-zinc-600">•</span>
                <span>{formatFileSize(currentImage.sizeBytes)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors border border-zinc-700"
                title="Replace image"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRemoveImage}
                className="p-1.5 rounded bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors border border-zinc-700"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-500 bg-amber-500/5 scale-[0.99]'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/80'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto mb-2.5 text-zinc-300">
            <Upload className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs font-medium text-zinc-200">
            Drop image here, paste with <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300">Ctrl+V</kbd>, or browse
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            JPG, PNG, WebP • Up to 4K resolution supported
          </p>
        </div>
      )}

      {/* Instant Sample Presets for Stock Creators */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Instant Stock Samples (1-Click Test)
          </span>
          {isLoadingSample && (
            <span className="text-[10px] font-mono text-amber-400 animate-pulse">
              Loading...
            </span>
          )}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {SAMPLE_STOCK_IMAGES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoadingSample}
              onClick={() => handleLoadSample(sample)}
              className="group relative aspect-video rounded-md overflow-hidden border border-zinc-800 hover:border-amber-500/60 transition-all focus:outline-none focus:ring-1 focus:ring-amber-500"
              title={sample.name}
            >
              <img
                src={sample.url}
                alt={sample.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                <span className="text-[9px] text-zinc-200 truncate font-mono">
                  {sample.name.split(' ')[0]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
