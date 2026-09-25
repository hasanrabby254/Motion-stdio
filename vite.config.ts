import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // Only intercept /api/gemini/* routes
        if (!url.startsWith('/api/gemini')) {
          return next();
        }

        // Helper to parse JSON body
        const getBody = async (): Promise<any> => {
          return new Promise((resolve) => {
            let data = '';
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch (e) {
                resolve({});
              }
            });
          });
        };

        const sendJson = (statusCode: number, payload: any) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(payload));
        };

        try {
          if (url === '/api/gemini/status' && req.method === 'GET') {
            const hasKey = !!process.env.GEMINI_API_KEY;
            return sendJson(200, { hasServerKey: hasKey });
          }

          if (url === '/api/gemini/validate' && req.method === 'POST') {
            const body = await getBody();
            const key = (body.apiKey && body.apiKey.trim()) || process.env.GEMINI_API_KEY || '';

            if (!key) {
              return sendJson(400, {
                valid: false,
                error: 'No API key provided. Please enter a valid Google AI Studio API key.',
              });
            }

            const checkResp = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`
            );

            if (!checkResp.ok) {
              const errData = await checkResp.json().catch(() => ({}));
              const msg = errData?.error?.message || `API returned HTTP ${checkResp.status}`;
              return sendJson(400, { valid: false, error: msg });
            }

            const checkData = await checkResp.json();
            const modelNames = (checkData.models || []).map((m: any) => m.name);
            return sendJson(200, {
              valid: true,
              isServerKey: !body.apiKey && !!process.env.GEMINI_API_KEY,
              modelCount: modelNames.length,
            });
          }

          if (url === '/api/gemini/analyze' && req.method === 'POST') {
            const body = await getBody();
            const key = (body.apiKey && body.apiKey.trim()) || process.env.GEMINI_API_KEY || '';

            if (!key) {
              return sendJson(400, {
                error: 'No Google AI API Key available. Please configure your API key in the studio.',
              });
            }

            let base64Data = body.imageBase64 || '';
            let mimeType = body.mimeType || 'image/jpeg';

            // Clean data url if passed with prefix
            if (base64Data.includes(',')) {
              const match = base64Data.match(/^data:([^;]+);base64,/);
              if (match) {
                mimeType = match[1];
              }
              base64Data = base64Data.substring(base64Data.indexOf(',') + 1);
            }

            if (!base64Data) {
              return sendJson(400, {
                error: 'No image data provided for analysis.',
              });
            }

            // Verify base64 can be decoded into binary
            try {
              const buffer = Buffer.from(base64Data, 'base64');
              if (buffer.length === 0) {
                throw new Error('Empty image payload');
              }
            } catch (e) {
              return sendJson(400, {
                error: 'Invalid image base64 format. Ensure image is properly rasterized.',
              });
            }

            const ai = new GoogleGenAI({ apiKey: key });
            const prompt = `You are an expert film director, cinematographer, and motion animator for Adobe Stock and Shutterstock.
Analyze this still photograph to direct a cinematic motion video clip.
User's desired motion direction: "${body.prompt || 'Cinematic, high-value stock motion'}"

Respond in STRICT JSON with this exact schema:
{
  "focalPoint": "description of focal center or vanishing point",
  "detectedSubject": "main subject description",
  "depthEstimate": "shallow / medium / deep volumetric layers",
  "lightingDirection": "rim light / soft ambient / backlight",
  "suggestedMotionPrompt": "cinematic prompt for video animation (e.g. slow cinematic push-in with drifting warm embers)",
  "suggestedTemplateId": "one of: atmospheric-particles, parallax-depth-zoom, anamorphic-lens-flare, water-surface-ripple, starburst-sparkle, mist-fog-flow, cinematic-ken-burns, kinetic-pulse-shimmer, neon-edge-trace"
}`;

            let responseText = '';
            const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
            let lastErr: any = null;

            for (const modelName of modelsToTry) {
              try {
                const result = await ai.models.generateContent({
                  model: modelName,
                  contents: [
                    {
                      role: 'user',
                      parts: [
                        {
                          inlineData: {
                            data: base64Data,
                            mimeType: mimeType === 'image/svg+xml' ? 'image/jpeg' : mimeType,
                          },
                        },
                        {
                          text: prompt,
                        },
                      ],
                    },
                  ],
                  config: {
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                  },
                });
                responseText = result.text || '{}';
                break;
              } catch (err: any) {
                lastErr = err;
                // If model is busy (503), try next fallback
                if (err.message && err.message.includes('503')) {
                  continue;
                }
                throw err;
              }
            }

            if (!responseText && lastErr) {
              throw lastErr;
            }

            let parsed: any = {};
            try {
              parsed = JSON.parse(responseText);
            } catch (e) {
              parsed = {
                focalPoint: 'Center focal subject',
                detectedSubject: 'Composition',
                depthEstimate: 'Layered',
                lightingDirection: 'Ambient',
                suggestedMotionPrompt: body.prompt || 'Slow cinematic zoom with subtle particle drift',
                suggestedTemplateId: 'parallax-depth-zoom',
              };
            }

            return sendJson(200, {
              success: true,
              analysis: {
                focalPoint: parsed.focalPoint || 'Center focal plane',
                detectedSubject: parsed.detectedSubject || 'Main photographic subject',
                depthEstimate: parsed.depthEstimate || 'Layered depth',
                lightingDirection: parsed.lightingDirection || 'Cinematic natural lighting',
                suggestedMotionPrompt: parsed.suggestedMotionPrompt || body.prompt || 'Slow cinematic push-in with drifting particles',
                suggestedTemplateId: parsed.suggestedTemplateId || 'atmospheric-particles',
              },
            });
          }

          if (url === '/api/gemini/synthesize-code' && req.method === 'POST') {
            const body = await getBody();
            const key = (body.apiKey && body.apiKey.trim()) || process.env.GEMINI_API_KEY || '';

            if (!key) {
              return sendJson(400, {
                error: 'No Google AI API Key available. Please configure your API key in the studio.',
              });
            }

            let base64Data = body.imageBase64 || '';
            let mimeType = body.mimeType || 'image/jpeg';
            const userPrompt = (body.prompt && body.prompt.trim()) || '';

            if (base64Data.includes(',')) {
              const match = base64Data.match(/^data:([^;]+);base64,/);
              if (match) {
                mimeType = match[1];
              }
              base64Data = base64Data.substring(base64Data.indexOf(',') + 1);
            }

            if (!base64Data && !userPrompt) {
              return sendJson(400, {
                error: 'Please provide either a reference image or a motion prompt to synthesize code.',
              });
            }

            const ai = new GoogleGenAI({ apiKey: key });
            const prompt = `You are a world-class Creative Technologist, Generative Motion Designer, and HTML5 Canvas Graphics Master.
The user wants to generate pure deterministic, mathematical procedural JavaScript Canvas2D animation code.
Stock marketplaces like Shutterstock, Adobe Stock, and Pond5 reject neural AI video, but enthusiastically accept and monetize 100% CODE-BASED CGI Motion Graphics!

${base64Data
  ? `User's creative motion prompt: "${userPrompt || 'Procedural cinematic motion graphic recreating the reference image'}"
Analyze the reference photograph's composition, subject geometry, lighting, depth planes, horizon, and color palette.
Then write a complete, standalone Canvas 2D render function body that recreates and animates this scene using pure geometry, gradients, paths, particle physics, atmospheric layers, and smooth camera motion.`
  : `User's prompt request: "${userPrompt}"
Analyze the user's creative prompt and conceptualize a stunning, high-production-value CGI motion graphic scene.
Then write a complete, standalone Canvas 2D render function body that brings this concept to life using pure mathematics, generative geometry, harmonic waveforms, volumetric gradients, depth planes, particle systems, and cinematic easing.`}

Return STRICT JSON matching this schema:
{
  "title": "Creative motion graphic title (e.g. Minimalist Monolith Sunset Drift)",
  "explanation": "2-3 sentences explaining the procedural mathematical elements (foreground geometry, volumetric gradients, particle systems, parallax easing) used to generate this motion graphic without neural AI",
  "dominantColors": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "stockTags": ["cgi motion", "procedural graphics", "cinematic backdrop", "abstract 3d", "vector animation", "4k stock footage"],
  "code": "/* EXECUTABLE JAVASCRIPT BODY */\\n// Arguments available in scope: ctx, width, height, time, duration, config\\n// Return nothing, just render onto ctx."
}

CRITICAL RULES FOR "code":
1. It MUST be pure vanilla Canvas2D JavaScript. No imports, no require, no external libraries.
2. The function arguments provided in scope are:
   - ctx: CanvasRenderingContext2D
   - width: number (e.g. 1920)
   - height: number (e.g. 1080)
   - time: number (current playback time in seconds, e.g. 2.45)
   - duration: number (total loop duration in seconds, e.g. 10)
   - config: object with { speed: number, intensity: number, accentColor: string, backgroundColor?: string }
3. It MUST seamlessly loop. Use trigonometric math like:
   const t = (time % duration) / duration;
   const loopT = Math.sin(t * Math.PI * 2);
4. Visual design:
   - If config.backgroundColor is provided (e.g. '#00FF00' for chroma green, '#000000' for black, or custom color), respect it for background fill:
     ctx.fillStyle = config.backgroundColor;
     ctx.fillRect(0, 0, width, height);
     Otherwise, render background sky/environment gradient or space.
   - Structural silhouettes / shapes / perspective grid / fluid ribbons / particle fields
   - Multi-layer depth motion (background moves slower, foreground moves faster)
   - Animated lighting, flares, organic floating particles, or caustic waves
5. High performance (60 FPS): no heavy while loops or slow allocations.
6. Provide ONLY the inner function body for code.`;

            let responseText = '';
            const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
            let lastErr: any = null;

            const parts: any[] = [];
            if (base64Data) {
              parts.push({
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType === 'image/svg+xml' ? 'image/jpeg' : mimeType,
                },
              });
            }
            parts.push({ text: prompt });

            for (const modelName of modelsToTry) {
              try {
                const result = await ai.models.generateContent({
                  model: modelName,
                  contents: [
                    {
                      role: 'user',
                      parts,
                    },
                  ],
                  config: {
                    responseMimeType: 'application/json',
                    temperature: 0.3,
                  },
                });
                responseText = result.text || '{}';
                break;
              } catch (err: any) {
                lastErr = err;
                if (err.message && err.message.includes('503')) {
                  continue;
                }
                throw err;
              }
            }

            if (!responseText && lastErr) {
              throw lastErr;
            }

            let parsed: any = {};
            try {
              parsed = JSON.parse(responseText);
            } catch (e) {
              return sendJson(500, {
                error: 'Failed to parse generated procedural code from AI response.',
              });
            }

            return sendJson(200, {
              success: true,
              data: {
                id: 'synth_' + Date.now(),
                title: parsed.title || 'Synthesized Procedural Motion',
                explanation: parsed.explanation || 'Procedural Canvas2D recreation of reference composition with mathematical animation layers.',
                dominantColors: parsed.dominantColors || ['#f59e0b', '#3b82f6', '#10b981'],
                stockTags: parsed.stockTags || ['cgi motion', 'procedural animation', 'stock background'],
                code: parsed.code || '',
                createdAt: Date.now(),
              },
            });
          }

          next();
        } catch (err: any) {
          return sendJson(500, {
            error: err.message || 'An error occurred during Gemini API operation.',
          });
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
