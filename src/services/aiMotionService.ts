import { AiVisionAnalysis, SynthesizedCode } from '../types';

const STORAGE_KEY = 'motion_studio_google_api_key';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function storeApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

/**
 * Check if the backend environment already has a GEMINI_API_KEY provisioned.
 */
export async function checkServerApiKeyStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/gemini/status');
    if (res.ok) {
      const data = await res.json();
      return !!data.hasServerKey;
    }
  } catch (e) {}
  return false;
}

/**
 * Ensures ANY image format (SVG data URL, PNG, WebP, external URL)
 * is cleanly rasterized to a valid JPEG Base64 payload under 1024px.
 * This completely prevents "INVALID_ARGUMENT" errors from Gemini API.
 */
export async function rasterizeToCleanBase64(
  imageUrlOrDataUrl: string
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    // If it's already a standard JPEG data URL and small, we can extract it directly
    if (imageUrlOrDataUrl.startsWith('data:image/jpeg;base64,')) {
      const comma = imageUrlOrDataUrl.indexOf(',');
      return resolve({
        base64: imageUrlOrDataUrl.substring(comma + 1),
        mimeType: 'image/jpeg',
      });
    }

    const img = new Image();
    // Only set crossOrigin if not a local data URL or blob
    if (!imageUrlOrDataUrl.startsWith('data:') && !imageUrlOrDataUrl.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      const maxDim = 1024;
      let w = img.naturalWidth || img.width || 800;
      let h = img.naturalHeight || img.height || 600;

      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Cannot initialize 2D canvas context.'));
      }

      // Fill with solid white backing in case image has transparency (SVG/PNG)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const comma = dataUrl.indexOf(',');
        resolve({
          base64: dataUrl.substring(comma + 1),
          mimeType: 'image/jpeg',
        });
      } catch (e: any) {
        reject(new Error('Image rasterization failed: ' + e.message));
      }
    };

    img.onerror = () => {
      reject(new Error('Could not load image into canvas for analysis.'));
    };

    img.src = imageUrlOrDataUrl;
  });
}

/**
 * Validate the user's Google AI API Key using a lightweight call.
 */
export async function validateGoogleApiKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string; isServerKey?: boolean }> {
  const cleanKey = apiKey.trim();

  // First try server-side validate endpoint
  try {
    const res = await fetch('/api/gemini/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: cleanKey }),
    });

    const data = await res.json();
    if (res.ok && data.valid) {
      return { valid: true, isServerKey: data.isServerKey };
    }
    if (data.error) {
      return { valid: false, error: data.error };
    }
  } catch (err) {
    // If server route is unavailable, fallback to direct fetch
  }

  if (!cleanKey) {
    return { valid: false, error: 'API key cannot be empty.' };
  }

  try {
    // Direct call WITHOUT invalid GET headers or parameters
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData?.error?.message ||
        `Google API returned status ${response.status} (${response.statusText})`;
      return { valid: false, error: message };
    }

    return { valid: true };
  } catch (err: any) {
    return {
      valid: false,
      error: err.message || 'Network connection failed while verifying API key.',
    };
  }
}

/**
 * Perform Gemini Vision Image Motion Analysis:
 * Analyzes the composition, depth layers, and motion vectors to direct motion.
 */
export async function analyzeImageMotionWithGemini(
  apiKey: string,
  imageUrlOrDataUrl: string,
  userPrompt?: string
): Promise<AiVisionAnalysis> {
  // Step 1: Clean and rasterize to guaranteed valid JPEG Base64
  const { base64, mimeType } = await rasterizeToCleanBase64(imageUrlOrDataUrl);

  const cleanKey = apiKey.trim();

  // Try server-side endpoint first
  try {
    const res = await fetch('/api/gemini/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: cleanKey || undefined,
        imageBase64: base64,
        mimeType: mimeType,
        prompt: userPrompt,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.analysis) {
        return data.analysis;
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData.error) {
        throw new Error(errData.error);
      }
    }
  } catch (err: any) {
    // If server returned a meaningful error, surface it
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
  }

  // Fallback to direct client-side Google AI REST call if server route was unreachable
  if (!cleanKey) {
    throw new Error('Please enter a valid Google AI API Key to use Vision Director.');
  }

  const prompt = `You are a professional film cinematographer and After Effects motion designer for Adobe Stock and Shutterstock.
Analyze this still photograph to create a cinematic motion clip.
User's desired motion direction: "${userPrompt || 'Cinematic, high-value stock motion'}"

Respond in STRICT JSON with this exact schema:
{
  "focalPoint": "coordinate or description like center-left subject eye / horizon vanishing point",
  "detectedSubject": "main subject description",
  "depthEstimate": "shallow depth of field / deep landscape / layered foreground-midground",
  "lightingDirection": "rim light from top right / diffused ambient / backlit golden hour",
  "suggestedMotionPrompt": "highly detailed motion prompt for video generation like Veo (e.g. slow cinematic dolly push-in with drifting golden bokeh...)",
  "suggestedTemplateId": "one of: atmospheric-particles, parallax-depth-zoom, anamorphic-lens-flare, water-surface-ripple, starburst-sparkle, mist-fog-flow, cinematic-ken-burns, kinetic-pulse-shimmer, neon-edge-trace"
}`;

  const restResp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(cleanKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64,
                  mimeType: 'image/jpeg',
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    }
  );

  if (!restResp.ok) {
    const errData = await restResp.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gemini API returned status ${restResp.status}`);
  }

  const restData = await restResp.json();
  const text = restData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  try {
    const parsed = JSON.parse(text);
    return {
      focalPoint: parsed.focalPoint || 'Center focal subject',
      detectedSubject: parsed.detectedSubject || 'Main photographic subject',
      depthEstimate: parsed.depthEstimate || 'Layered depth',
      lightingDirection: parsed.lightingDirection || 'Natural lighting',
      suggestedMotionPrompt:
        parsed.suggestedMotionPrompt ||
        userPrompt ||
        'Slow cinematic push-in with drifting ambient particles',
      suggestedTemplateId: parsed.suggestedTemplateId || 'atmospheric-particles',
    };
  } catch (e) {
    return {
      focalPoint: 'Center',
      detectedSubject: 'Composition',
      depthEstimate: 'Layered',
      lightingDirection: 'Ambient',
      suggestedMotionPrompt: userPrompt || 'Slow cinematic zoom with subtle particle drift',
      suggestedTemplateId: 'atmospheric-particles',
    };
  }
}

/**
 * Synthesize pure deterministic Canvas2D procedural animation code from either:
 * - A reference photograph + prompt
 * - OR pure text prompt alone (Prompt-to-Code Motion Graphics)
 * This code generates 100% compliant CGI Motion Graphics (Zero neural AI detection).
 */
export async function synthesizeProceduralCode(
  apiKey: string,
  userPrompt: string,
  imageUrlOrDataUrl?: string | null
): Promise<SynthesizedCode> {
  const cleanKey = apiKey.trim();
  let base64: string | undefined = undefined;
  let mimeType: string | undefined = undefined;

  if (imageUrlOrDataUrl) {
    const rasterized = await rasterizeToCleanBase64(imageUrlOrDataUrl);
    base64 = rasterized.base64;
    mimeType = rasterized.mimeType;
  }

  // Try server proxy endpoint first
  try {
    const res = await fetch('/api/gemini/synthesize-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: cleanKey || undefined,
        imageBase64: base64,
        mimeType: mimeType,
        prompt: userPrompt,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        return data.data;
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData.error) {
        throw new Error(errData.error);
      }
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
  }

  // Fallback to direct client-side Google AI REST call if server route was unreachable
  if (!cleanKey) {
    throw new Error('Please enter a valid Google AI API Key to synthesize procedural code.');
  }

  const prompt = `You are a world-class Creative Technologist and HTML5 Canvas Generative Designer.
The user wants to generate pure deterministic procedural JavaScript Canvas2D animation code.
Stock platforms (Shutterstock, Adobe Stock) accept 100% CODE-BASED CGI Motion Graphics!

${base64
  ? `User's motion prompt: "${userPrompt || 'Procedural cinematic motion graphic recreating the reference image'}"
Analyze the reference photograph and write a complete, standalone Canvas 2D render function body.`
  : `User's motion prompt: "${userPrompt}"
Analyze the prompt and write a complete, standalone Canvas 2D render function body bringing this concept to life using pure geometry, gradients, particles, and easing.`}

Return STRICT JSON:
{
  "title": "Creative title",
  "explanation": "2-3 sentences explaining procedural mathematical elements",
  "dominantColors": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "stockTags": ["cgi motion", "procedural graphics", "cinematic backdrop", "abstract 3d", "vector animation"],
  "code": "/* EXECUTABLE JAVASCRIPT BODY */\\n// Arguments available: ctx, width, height, time, duration, config"
}
Arguments in scope: ctx, width, height, time, duration, config ({ speed, intensity, accentColor, backgroundColor }).
If config.backgroundColor is provided, use it to fill the canvas background.
Ensure seamless loop using Math.sin((time % duration) / duration * Math.PI * 2). Provide only the inner function body for code.`;

  const parts: any[] = [];
  if (base64) {
    parts.push({
      inlineData: {
        data: base64,
        mimeType: 'image/jpeg',
      },
    });
  }
  parts.push({ text: prompt });

  const restResp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(cleanKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    }
  );

  if (!restResp.ok) {
    const errData = await restResp.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gemini API returned status ${restResp.status}`);
  }

  const restData = await restResp.json();
  const text = restData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const parsed = JSON.parse(text);

  return {
    id: 'synth_' + Date.now(),
    title: parsed.title || 'Synthesized Procedural Motion',
    explanation: parsed.explanation || 'Procedural Canvas2D recreation with mathematical animation layers.',
    dominantColors: parsed.dominantColors || ['#f59e0b', '#3b82f6', '#10b981'],
    stockTags: parsed.stockTags || ['cgi motion', 'procedural animation', 'stock footage'],
    code: parsed.code || '',
    createdAt: Date.now(),
  };
}

/**
 * Backward compatibility wrapper
 */
export async function synthesizeProceduralCodeFromImage(
  apiKey: string,
  imageUrlOrDataUrl: string,
  userPrompt?: string
): Promise<SynthesizedCode> {
  return synthesizeProceduralCode(apiKey, userPrompt || '', imageUrlOrDataUrl);
}

