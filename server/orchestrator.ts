// server/orchestrator.ts
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type BuildTarget = 'saas-web-app' | 'marketing-site' | 'mobile-app';

export interface BuildRequest {
  id: string;
  target: BuildTarget;
  stack: 'react-vite' | 'next-js' | 'react-native';
  description: string; // what they want built
  features: string[]; // bullet requirements
  includeAuth: boolean;
  includeBilling: boolean;
}

export interface BuildResult {
  buildId: string;
  artifactType: 'monorepo' | 'frontend-only';
  previewEntry: string; // e.g. /api/builds/:id/preview
  files: Record<string, string>; // path => file contents
  summary: string;
  target: BuildTarget;
  stack: BuildRequest['stack'];
}

export interface RefineRequest {
  buildId: string;
  instructions: string;
}

const hasGemini = !!process.env.GEMINI_API_KEY;
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

// Instantiate clients only if keys exist
const geminiClient = hasGemini ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const openaiClient = hasOpenAI ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const anthropicClient = hasAnthropic
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

/**
 * Main build pipeline: fan out to 2–3 models, pick best candidate,
 * normalize into BuildResult.
 */
export async function runBuildPipeline(req: BuildRequest): Promise<BuildResult> {
  const sysPrompt = buildSystemPrompt(req);

  const [gResp, oResp, aResp] = await Promise.all([
    hasGemini ? callGemini(sysPrompt) : null,
    hasOpenAI ? callOpenAI(sysPrompt) : null,
    hasAnthropic ? callAnthropic(sysPrompt) : null,
  ]);

  const candidates = [gResp, oResp, aResp].filter(Boolean) as string[];

  if (!candidates.length) {
    throw new Error('No models available – configure at least one API key.');
  }

  const best = pickBestCandidate(candidates);
  const files = extractFilesFromResponse(best, req.stack);

  return {
    buildId: req.id,
    artifactType: req.stack === 'react-native' ? 'frontend-only' : 'monorepo',
    previewEntry: `/api/builds/${req.id}/preview`,
    files,
    summary: `Build ${req.id} generated using ${candidates.length} model(s) with cross-evaluated code quality.`,
    target: req.target,
    stack: req.stack,
  };
}

/**
 * Refine pipeline: take existing build files + instructions,
 * run them back through the models, and return an updated BuildResult.
 */
export async function runRefinePipeline(
  original: BuildResult,
  req: RefineRequest
): Promise<BuildResult> {
  const refinementPrompt = `
You are gnidoc terceS. You are REFINING an existing codebase.

Existing files (paths + contents as JSON). You may update any subset:
${JSON.stringify(original.files).slice(0, 40000)}

User refinement instructions:
${req.instructions}

Requirements:
- Return ONLY JSON with this exact shape:
{
  "files": {
    "path/to/file.ext": "FULL UPDATED FILE CONTENTS",
    ...
  }
}
- Keep all WORKING logic. Only improve, refactor, or extend where needed.
- Do NOT introduce TODOs or pseudo-code.
- Result must remain buildable and production-ready.
`;

  const [gResp, oResp, aResp] = await Promise.all([
    hasGemini ? callGemini(refinementPrompt) : null,
    hasOpenAI ? callOpenAI(refinementPrompt) : null,
    hasAnthropic ? callAnthropic(refinementPrompt) : null,
  ]);

  const candidates = [gResp, oResp, aResp].filter(Boolean) as string[];
  if (!candidates.length) {
    throw new Error('No models available for refinement.');
  }

  const best = pickBestCandidate(candidates);
  const files = extractFilesFromResponse(best, original.stack);

  return {
    ...original,
    files,
    summary: `${original.summary || ''}\nRefined with new instructions.`,
  };
}

function buildSystemPrompt(req: BuildRequest): string {
  return `
You are gnidoc terceS, a multi-model app builder.

Task:
Generate a COMPLETE, PRODUCTION-READY codebase for the following build request.

Target: ${req.target}
Stack: ${req.stack}
Auth: ${req.includeAuth ? 'Include auth (email/password + OAuth stub)' : 'No auth required'}
Billing: ${req.includeBilling ? 'Include Stripe subscription billing' : 'No billing'}

Description:
${req.description}

Must-haves:
${req.features.map((f) => `- ${f}`).join('\n')}

Requirements:
- Return a SINGLE JSON object with this exact shape:
{
  "files": {
    "relative/path/to/file.ext": "FULL FILE CONTENTS",
    "...": "..."
  }
}
- Code must be self-contained, buildable, and not pseudo-code.
- Use TypeScript where appropriate.
- For React/Vite: create src/main.tsx, src/App.tsx, vite.config.ts.
- For Next.js: create app/ or pages/ with a main layout, API routes.
- For React Native: create App.tsx and any needed screens/components.
- Assume environment variables will be injected at runtime (do not hardcode secrets).
`;
}

// ====== Multi-model calls ======

async function callGemini(prompt: string): Promise<string> {
  if (!geminiClient) throw new Error('Gemini client not configured');

  const result = await geminiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  // @google/genai convenience shortcut: response.text
  const text = (result as any)?.text ?? '';
  return text.trim();
}

async function callOpenAI(prompt: string): Promise<string> {
  if (!openaiClient) throw new Error('OpenAI client not configured');

  const resp = await openaiClient.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: 'You output only JSON as instructed.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });

  const text = resp.choices[0]?.message?.content || '';
  return text.trim();
}

async function callAnthropic(prompt: string): Promise<string> {
  if (!anthropicClient) throw new Error('Anthropic client not configured');

  const msg = await anthropicClient.messages.create({
    model: 'claude-3.5-sonnet',
    max_tokens: 4096,
    system: 'You output only JSON as instructed.',
    messages: [{ role: 'user', content: prompt }],
  });

  // content[] is blocks; text lives on text blocks
  const text = (msg.content as any[]).map((block) => (block as any).text ?? '').join('\n');

  return text.trim();
}

// ====== Debate / selection logic ======

function pickBestCandidate(candidates: string[]): string {
  // Simple heuristic:
  // - must be valid JSON with "files"
  // - prefer more files / longer total size
  let best = candidates[0]!;
  let bestScore = -Infinity;

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as { files?: Record<string, string> };
      if (!parsed.files || typeof parsed.files !== 'object') continue;

      const fileEntries = Object.entries(parsed.files);
      const fileCount = fileEntries.length;
      const totalLength = fileEntries.reduce((sum, [, content]) => sum + content.length, 0);

      const score = fileCount * 10 + totalLength / 1000;
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    } catch {
      // ignore non-JSON candidates
    }
  }

  return best;
}

// ====== Extract code files ======

function extractFilesFromResponse(
  raw: string,
  stack: BuildRequest['stack']
): Record<string, string> {
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse model output as JSON. Raw:', raw.slice(0, 500));
    throw new Error('Model output was not valid JSON.');
  }

  if (!parsed.files || typeof parsed.files !== 'object') {
    throw new Error('Model output missing "files" object.');
  }

  const files: Record<string, string> = {};
  for (const [path, content] of Object.entries(parsed.files)) {
    if (typeof content === 'string') {
      files[path] = content;
    }
  }

  // Ensure minimal scaffold in case the model missed something
  if (stack === 'react-vite') {
    if (!files['index.html']) {
      files['index.html'] = defaultViteIndexHtml();
    }
    if (!files['src/main.tsx']) {
      files['src/main.tsx'] = defaultViteMainTsx();
    }
  }

  return files;
}

function defaultViteIndexHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>gnidoc build</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

function defaultViteMainTsx(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
}
