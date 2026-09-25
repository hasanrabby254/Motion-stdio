export type AnimationCategory = 'canvas' | 'css' | 'svg';

export type MotionDirection = 'in' | 'out' | 'left' | 'right' | 'diagonal' | 'orbit';

export type BackgroundMode = 'default' | 'greenscreen' | 'black' | 'custom';

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
  base64?: string;
}

export interface ProceduralConfig {
  templateId: string;
  category: AnimationCategory;
  speed: number;          // 0.2 to 3.0 (default 1.0)
  intensity: number;      // 0.1 to 2.5 (default 1.0)
  accentColor: string;    // hex
  loopDuration: number;   // 5, 10, 15, 30 seconds
  direction: MotionDirection;
  particleCount: number;  // 10 to 120
  particleType: 'ember' | 'dust' | 'bokeh' | 'stars';
  glowIntensity: number;  // 0 to 2.0
  vignette: boolean;
  filmGrain: boolean;
  chromaticShift: number; // 0 to 1
  rippleFrequency: number;// for water/liquid
  flarePosition: { x: number; y: number };
  backgroundMode?: BackgroundMode;       // 'default' | 'greenscreen' | 'black' | 'custom'
  customBackgroundColor?: string;        // Hex value for custom background (e.g. #00ff00, #000000, #1e1b4b, etc.)
}

export interface TemplateDefinition {
  id: string;
  name: string;
  subtitle: string;
  category: AnimationCategory;
  description: string;
  tags: string[];
  defaultConfig: Partial<ProceduralConfig>;
}

export interface CustomPreset {
  id: string;
  name: string;
  createdAt: number;
  config: ProceduralConfig;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';
export type VideoResolution = '1080p' | '4k';
export type VideoFramerate = 30 | 60;
export type VideoFormat = 'mp4' | 'webm';

export interface ExportSettings {
  duration: number;        // 5, 10, 15, 30
  resolution: VideoResolution;
  aspectRatio: AspectRatio;
  framerate: VideoFramerate;
  format: VideoFormat;
  bitrateMbps: number;    // 10 to 50
}

export interface RenderJob {
  id: string;
  title: string;
  templateName: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  progress: number;        // 0 to 100
  currentFrame: number;
  totalFrames: number;
  duration: number;
  resolution: string;
  framerate: number;
  format: VideoFormat;
  videoUrl: string | null;
  blob: Blob | null;
  fileSizeBytes: number | null;
  timestamp: number;
  error?: string | null;
}

export interface SynthesizedCode {
  id: string;
  title: string;
  explanation: string;
  code: string;
  dominantColors: string[];
  stockTags: string[];
  createdAt: number;
}

export interface AiVisionAnalysis {
  focalPoint: string;
  detectedSubject: string;
  depthEstimate: string;
  lightingDirection: string;
  suggestedMotionPrompt: string;
  suggestedTemplateId: string;
}

