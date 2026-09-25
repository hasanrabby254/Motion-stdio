import { ExportSettings, ProceduralConfig, RenderJob } from '../types';
import { renderProceduralFrame } from './proceduralRenderer';
import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4ArrayBufferTarget } from 'mp4-muxer';
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmArrayBufferTarget } from 'webm-muxer';

export function getTargetDimensions(
  resolution: '1080p' | '4k',
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5'
): { width: number; height: number } {
  const is4K = resolution === '4k';
  switch (aspectRatio) {
    case '16:9':
      return is4K ? { width: 3840, height: 2160 } : { width: 1920, height: 1080 };
    case '9:16':
      return is4K ? { width: 2160, height: 3840 } : { width: 1080, height: 1920 };
    case '1:1':
      return is4K ? { width: 2160, height: 2160 } : { width: 1080, height: 1080 };
    case '4:5':
      return is4K ? { width: 2160, height: 2700 } : { width: 1080, height: 1350 };
  }
}

export function getSupportedMimeType(preferredFormat: 'mp4' | 'webm'): { mimeType: string; extension: string } {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return { mimeType: 'video/webm', extension: 'webm' };
  }

  if (preferredFormat === 'mp4') {
    const mp4Types = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1.4d002a',
      'video/mp4;codecs=h264',
      'video/mp4',
    ];
    for (const t of mp4Types) {
      if (MediaRecorder.isTypeSupported(t)) {
        return { mimeType: t, extension: 'mp4' };
      }
    }
  }

  // WebM fallback or preference
  const webmTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const t of webmTypes) {
    if (MediaRecorder.isTypeSupported(t)) {
      return { mimeType: t, extension: 'webm' };
    }
  }

  return { mimeType: '', extension: preferredFormat };
}

export interface RenderProgressCallback {
  (progress: number, currentFrame: number, totalFrames: number): void;
}

export class VideoExportEngine {
  private abortController: AbortController | null = null;

  public cancel() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  public async exportProceduralVideo(
    image: HTMLImageElement | ImageBitmap | null,
    config: ProceduralConfig,
    settings: ExportSettings,
    onProgress: RenderProgressCallback,
    customCode?: string
  ): Promise<{ blob: Blob; format: string; url: string; fileSizeBytes: number }> {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const { width, height } = getTargetDimensions(settings.resolution, settings.aspectRatio);
    const framerate = settings.framerate;
    const duration = settings.duration;
    const totalFrames = Math.round(duration * framerate);

    // Try WebCodecs + Muxer first (Frame-accurate microsecond timestamps guarantee exact duration)
    const hasWebCodecs =
      typeof window !== 'undefined' &&
      'VideoEncoder' in window &&
      'VideoFrame' in window;

    if (hasWebCodecs) {
      try {
        return await this.exportWithWebCodecs(
          image,
          config,
          settings,
          width,
          height,
          framerate,
          duration,
          totalFrames,
          onProgress,
          signal,
          customCode
        );
      } catch (err: any) {
        if (signal.aborted) {
          throw err;
        }
        console.warn('WebCodecs export failed or unsupported on this configuration, falling back to MediaRecorder:', err);
      }
    }

    // Fallback: Wall-Clock Synchronized MediaRecorder
    return await this.exportWithMediaRecorderRealTime(
      image,
      config,
      settings,
      width,
      height,
      framerate,
      duration,
      totalFrames,
      onProgress,
      signal,
      customCode
    );
  }

  /**
   * Primary: WebCodecs Frame-Accurate Hardware Muxer
   * Renders offline frame-by-frame and stamps exact mathematical microsecond timestamps.
   * Guarantees the output video is EXACTLY settings.duration seconds!
   */
  private async exportWithWebCodecs(
    image: HTMLImageElement | ImageBitmap | null,
    config: ProceduralConfig,
    settings: ExportSettings,
    width: number,
    height: number,
    framerate: number,
    duration: number,
    totalFrames: number,
    onProgress: RenderProgressCallback,
    signal: AbortSignal,
    customCode?: string
  ): Promise<{ blob: Blob; format: string; url: string; fileSizeBytes: number }> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Unable to create 2D canvas context.');
    }

    const isMp4 = settings.format === 'mp4';
    let mp4Muxer: any = null;
    let webmMuxer: any = null;

    if (isMp4) {
      mp4Muxer = new Mp4Muxer({
        target: new Mp4ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width,
          height,
        },
        fastStart: 'in-memory',
        firstTimestampBehavior: 'offset',
      });
    } else {
      webmMuxer = new WebmMuxer({
        target: new WebmArrayBufferTarget(),
        video: {
          codec: 'V_VP9',
          width,
          height,
          frameRate: framerate,
        },
      });
    }

    let encoderError: any = null;

    const videoEncoder = new (window as any).VideoEncoder({
      output: (chunk: any, meta: any) => {
        if (isMp4) {
          mp4Muxer.addVideoChunk(chunk, meta);
        } else {
          webmMuxer.addVideoChunk(chunk, meta);
        }
      },
      error: (e: any) => {
        encoderError = e;
      },
    });

    // Determine codec string
    // avc1.4d002a = H.264 Main Profile Level 4.2 (widely supported up to 1080p60)
    // avc1.640033 = H.264 High Profile Level 5.1 (supports 4K)
    const codecString = isMp4
      ? (width > 1920 || height > 1080 ? 'avc1.640033' : 'avc1.4d002a')
      : 'vp09.00.10.08';

    const encoderConfig: any = {
      codec: codecString,
      width,
      height,
      bitrate: (settings.bitrateMbps || 25) * 1_000_000,
      framerate,
    };

    // Check if configuration is supported
    const isSupported = await (window as any).VideoEncoder.isConfigSupported(encoderConfig).catch(() => null);
    if (!isSupported || !isSupported.supported) {
      // Fallback codec option for MP4 baseline
      if (isMp4) {
        encoderConfig.codec = 'avc1.42001f';
      } else {
        encoderConfig.codec = 'vp8';
      }
    }

    videoEncoder.configure(encoderConfig);

    const frameStepSec = 1 / framerate;
    const keyFrameInterval = framerate * 2; // keyframe every 2 seconds

    for (let frame = 0; frame < totalFrames; frame++) {
      if (signal.aborted) {
        videoEncoder.close();
        throw new Error('Export canceled by user.');
      }
      if (encoderError) {
        throw encoderError;
      }

      const currentTime = frame * frameStepSec;

      // Render exact frame
      renderProceduralFrame(ctx, {
        width,
        height,
        time: currentTime,
        duration: config.loopDuration || duration,
        image,
        config,
        customCode,
      });

      // Timestamp in microseconds
      const timestampMicros = Math.round(frame * (1_000_000 / framerate));
      const frameDurationMicros = Math.round(1_000_000 / framerate);

      const videoFrame = new (window as any).VideoFrame(canvas, {
        timestamp: timestampMicros,
        duration: frameDurationMicros,
      });

      videoEncoder.encode(videoFrame, {
        keyFrame: frame % keyFrameInterval === 0,
      });
      videoFrame.close();

      onProgress(Math.round(((frame + 1) / totalFrames) * 100), frame + 1, totalFrames);

      // Yield every 4 frames so encoder buffer drains and browser UI remains silky
      if (frame % 4 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    await videoEncoder.flush();
    videoEncoder.close();

    let finalBlob: Blob;
    if (isMp4) {
      mp4Muxer.finalize();
      finalBlob = new Blob([mp4Muxer.target.buffer], { type: 'video/mp4' });
    } else {
      webmMuxer.finalize();
      finalBlob = new Blob([webmMuxer.target.buffer], { type: 'video/webm' });
    }

    const url = URL.createObjectURL(finalBlob);
    return {
      blob: finalBlob,
      format: settings.format,
      url,
      fileSizeBytes: finalBlob.size,
    };
  }

  /**
   * Fallback: Wall-Clock Synchronized MediaRecorder Engine
   * Strictly paced to real-time wall clock so the recording stops precisely at duration seconds!
   */
  private async exportWithMediaRecorderRealTime(
    image: HTMLImageElement | ImageBitmap | null,
    config: ProceduralConfig,
    settings: ExportSettings,
    width: number,
    height: number,
    framerate: number,
    duration: number,
    totalFrames: number,
    onProgress: RenderProgressCallback,
    signal: AbortSignal,
    customCode?: string
  ): Promise<{ blob: Blob; format: string; url: string; fileSizeBytes: number }> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Unable to create 2D canvas context.');
    }

    const { mimeType, extension } = getSupportedMimeType(settings.format);
    const stream = canvas.captureStream(framerate);
    const videoTrack = stream.getVideoTracks()[0];

    const recorderOptions: MediaRecorderOptions = {
      videoBitsPerSecond: (settings.bitrateMbps || 25) * 1_000_000,
    };
    if (mimeType) {
      recorderOptions.mimeType = mimeType;
    }

    const mediaRecorder = new MediaRecorder(stream, recorderOptions);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    const completionPromise = new Promise<{ blob: Blob; format: string; url: string; fileSizeBytes: number }>(
      (resolve, reject) => {
        mediaRecorder.onstop = () => {
          const finalBlob = new Blob(chunks, { type: mimeType || 'video/webm' });
          resolve({
            blob: finalBlob,
            format: extension,
            url: URL.createObjectURL(finalBlob),
            fileSizeBytes: finalBlob.size,
          });
        };
        mediaRecorder.onerror = (e) => reject(e);
      }
    );

    // Initial first frame paint
    renderProceduralFrame(ctx, {
      width,
      height,
      time: 0,
      duration: config.loopDuration || duration,
      image,
      config,
      customCode,
    });

    mediaRecorder.start(100);

    const startTime = performance.now();
    const durationMs = duration * 1000;
    const frameIntervalMs = 1000 / framerate;
    let frameCount = 0;

    await new Promise<void>((resolve, reject) => {
      const renderTick = () => {
        if (signal.aborted) {
          mediaRecorder.stop();
          if (videoTrack) videoTrack.stop();
          return reject(new Error('Export canceled by user.'));
        }

        const now = performance.now();
        const elapsedMs = now - startTime;

        // When exact requested duration is reached, stop immediately
        if (elapsedMs >= durationMs) {
          onProgress(100, totalFrames, totalFrames);
          resolve();
          return;
        }

        const currentTime = elapsedMs / 1000;
        frameCount++;

        renderProceduralFrame(ctx, {
          width,
          height,
          time: currentTime,
          duration: config.loopDuration || duration,
          image,
          config,
          customCode,
        });

        const progress = Math.min(99, Math.round((elapsedMs / durationMs) * 100));
        onProgress(progress, Math.min(totalFrames, frameCount), totalFrames);

        // Schedule next frame paced to framerate
        setTimeout(renderTick, Math.max(1, frameIntervalMs * 0.7));
      };

      setTimeout(renderTick, 10);
    });

    // Small flush delay for final chunk
    await new Promise((r) => setTimeout(r, 150));

    mediaRecorder.stop();
    if (videoTrack) {
      videoTrack.stop();
    }

    return completionPromise;
  }
}

export const videoExporter = new VideoExportEngine();
