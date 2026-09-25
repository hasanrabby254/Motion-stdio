import React from 'react';
import {
  X,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Film,
  Play,
  Clock,
  HardDrive
} from 'lucide-react';
import { RenderJob } from '../types';

interface RenderQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: RenderJob[];
  onCancelJob: (jobId: string) => void;
  onClearCompleted: () => void;
  onPreviewJob: (videoUrl: string) => void;
}

export const RenderQueueDrawer: React.FC<RenderQueueDrawerProps> = ({
  isOpen,
  onClose,
  jobs,
  onCancelJob,
  onClearCompleted,
  onPreviewJob,
}) => {
  if (!isOpen) return null;

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownload = (job: RenderJob) => {
    if (!job.videoUrl) return;
    const a = document.createElement('a');
    a.href = job.videoUrl;
    a.download = `${job.title.replace(/\s+/g, '_')}_${job.resolution}_${job.framerate}fps_${job.duration}s.${job.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50 animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Video Render Queue</h3>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
              {jobs.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {jobs.some((j) => j.status === 'completed') && (
              <button
                onClick={onClearCompleted}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Clear Done
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {jobs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2">
              <Film className="w-8 h-8 stroke-1 text-zinc-600" />
              <p className="text-xs text-zinc-400 font-medium">Render queue is empty</p>
              <p className="text-[11px] text-zinc-500 max-w-[220px]">
                Click "Export Stock Clip" in the studio player to queue video renders.
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-2.5"
              >
                {/* Job Title & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200 truncate" title={job.title}>
                      {job.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Template: {job.templateName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                      {job.resolution}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {job.framerate}fps
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400">
                      {job.duration}s
                    </span>
                  </div>
                </div>

                {/* Progress or Status */}
                {job.status === 'rendering' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-amber-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Rendering Frame {job.currentFrame} / {job.totalFrames}
                      </span>
                      <span className="text-zinc-300 font-bold">{job.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-150"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onCancelJob(job.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-mono"
                      >
                        Cancel Render
                      </button>
                    </div>
                  </div>
                ) : job.status === 'completed' ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Stock Upload
                      </span>
                      {job.fileSizeBytes && (
                        <span className="text-zinc-400 font-mono text-[10px]">
                          {formatFileSize(job.fileSizeBytes)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(job)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Download {job.format.toUpperCase()}</span>
                      </button>
                      {job.videoUrl && (
                        <button
                          onClick={() => onPreviewJob(job.videoUrl!)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors border border-zinc-700"
                          title="Preview in Main Studio Player"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : job.status === 'failed' ? (
                  <div className="text-[11px] text-red-400 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{job.error || 'Render failed.'}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-zinc-400 font-mono">
                    Queued in render pipeline...
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 text-[11px] text-zinc-500 font-mono text-center">
          Exports are generated client-side with deterministic framerate.
        </div>
      </div>
    </div>
  );
};
