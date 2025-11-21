// Fix: Use default express import to avoid type conflicts.
import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { AIClients, AIRequest } from '../lib/ai/providers';
import { AIModel, RefinedPrompt } from '../../types';

export const ai = express.Router();
const clients = new AIClients();

const DETECT_ORDER: AIModel[] = ['gemini', 'openai', 'anthropic', 'deepseek', 'qwen', 'xai'];

// --- Logic moved from lib/promptRefiner.ts ---

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    goals: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'High-level goals of the application.',
    },
    constraints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Technical or business constraints for the project.',
    },
    stack: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'The recommended technology stack.',
    },
    data: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A description of the data models or schema.',
    },
    evaluation: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Key success metrics or evaluation criteria.',
    },
    final_prompt: {
      type: Type.STRING,
      description: 'The final, detailed prompt for the build agents.',
    },
  },
  required: ['goals', 'constraints', 'stack', 'data', 'evaluation', 'final_prompt'],
};

const fallbackPrompt = (userText: string): RefinedPrompt => ({
  goals: ["Build the user's requested application."],
  constraints: ['Implement standard security practices.'],
  stack: ['React', 'Node.js', 'Supabase'],
  data: [],
  evaluation: ["The app should be functional and follow the prompt's instructions."],
  final_prompt: `Build a full-stack application based on the following user request: "${userText}"`,
});

async function refinePrompt(
  userText: string,
  models: string[],
  model: AIModel
): Promise<RefinedPrompt> {
  const schemaDescription = `{
    "goals": ["High-level goals of the application."],
    "constraints": ["Technical or business constraints for the project."],
    "stack": ["The recommended technology stack."],
    "data": ["A description of the data models or schema."],
    "evaluation": ["Key success metrics or evaluation criteria."],
    "final_prompt": "The final, detailed prompt for the build agents."
  }`;

  try {
    if (model === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sys = `You are a Product Build Prompt Engineer. Turn user intent into a precise, professional build brief.
Return JSON with {goals[], constraints[], stack[], data[], evaluation[], final_prompt}.`;
      const contents = `UserInput:\n${userText}\nAvailable Models:${models.join(',')}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: sys,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as RefinedPrompt;
    } else {
      const clients = new AIClients();
      const system = `You are a Product Build Prompt Engineer. Turn user intent into a precise, professional build brief.
You MUST respond with only a valid JSON object that conforms to the following structure. Do not include any other text, markdown, or commentary.
${schemaDescription}`;
      const prompt = `UserInput:\n${userText}\nAvailable Models:${models.join(',')}`;

      const req: AIRequest = {
        model,
        system,
        prompt,
        json: model === 'openai',
      };

      const response = await clients.run(req);
      const jsonText = response.text
        .trim()
        .replace(/```json/g, '')
        .replace(/```/g, '');
      return JSON.parse(jsonText) as RefinedPrompt;
    }
  } catch (error) {
    console.error(`Error refining prompt with ${model}:`, error);
    return fallbackPrompt(userText);
  }
}

// --- End of moved logic ---

export async function aiRoute(input: Omit<AIRequest, 'model'> & { model?: AIRequest['model'] }) {
  const chosen =
    input.model ??
    DETECT_ORDER.find(
      (m) =>
        (m === 'gemini' && clients.hasGemini()) ||
        (m === 'openai' && clients.hasOpenAI()) ||
        (m === 'anthropic' && clients.hasAnthropic())
    ) ??
    'gemini';
  return clients.run({ ...input, model: chosen });
}

// Fix: Use explicit express types for req and res.
ai.get('/key-status', (_req: express.Request, res: express.Response) => {
  try {
    const status = {
      gemini: clients.hasGemini(),
      openai: clients.hasOpenAI(),
      anthropic: clients.hasAnthropic(),
      deepseek: clients.hasDeepseek(),
      qwen: clients.hasQwen(),
      xai: clients.hasXai(),
    };
    res.json({ ok: true, status });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? 'Error checking key status' });
  }
});

// Fix: Use explicit express types for req and res.
ai.get('/available-models', (_req: express.Request, res: express.Response) => {
  try {
    const available = DETECT_ORDER.filter(
      (m) =>
        (m === 'gemini' && clients.hasGemini()) ||
        (m === 'openai' && clients.hasOpenAI()) ||
        (m === 'anthropic' && clients.hasAnthropic()) ||
        (m === 'deepseek' && clients.hasDeepseek()) ||
        (m === 'qwen' && clients.hasQwen()) ||
        (m === 'xai' && clients.hasXai())
    );
    res.json({ ok: true, models: available });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? 'Error checking models' });
  }
});

// Fix: Use explicit express types for req and res.
ai.get('/list-gemini-models', async (_req: express.Request, res: express.Response) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ ok: false, error: 'Google AI API key is not configured on the server.' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const apiResponse = await fetch(url);
    const text = await apiResponse.text();

    if (!apiResponse.ok) {
      throw new Error(JSON.parse(text).error?.message || 'Failed to fetch models from Google AI');
    }

    const data = JSON.parse(text);

    const models = data.models
      .filter(
        (model: any) =>
          model.supportedGenerationMethods.includes('generateContent') &&
          !model.name.includes('embedding') &&
          !model.name.includes('aqa')
      )
      .map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        version: model.version,
      }))
      .sort((a: any, b: any) => b.name.localeCompare(a.name));

    res.json({ ok: true, models });
  } catch (e: any) {
    console.error('Error in /list-gemini-models:', e);
    return res.status(500).json({ ok: false, error: e?.message ?? 'Failed to list Gemini models' });
  }
});

// Fix: Use explicit express types for req and res.
ai.post('/refine', async (req: express.Request, res: express.Response) => {
  try {
    const { prompt, model } = req.body ?? {};
    if (!prompt) return res.status(400).json({ ok: false, error: 'Missing prompt' });

    const availableModels = DETECT_ORDER.filter(
      (m) =>
        (m === 'gemini' && clients.hasGemini()) ||
        (m === 'openai' && clients.hasOpenAI()) ||
        (m === 'anthropic' && clients.hasAnthropic())
    );

    const selectedModel = model && availableModels.includes(model) ? model : availableModels[0];

    if (!selectedModel) {
      return res.status(500).json({ ok: false, error: 'No AI models configured on the server.' });
    }

    const engineered = await refinePrompt(prompt, availableModels, selectedModel);
    return res.json({ ok: true, engineered });
  } catch (e: any) {
    console.error('Error in /refine:', e);
    return res.status(500).json({ ok: false, error: e?.message ?? 'Refine error' });
  }
});

// Fix: Use explicit express types for req and res.
ai.post('/generate', async (req: express.Request, res: express.Response) => {
  try {
    const { prompt, system, temperature, model } = req.body ?? {};
    if (!prompt) return res.status(400).json({ ok: false, error: 'Missing prompt' });
    const out = await aiRoute({ prompt, system, temperature, model });
    return res.json({ ok: true, ...out });
  } catch (e: any) {
    console.error('Error in /generate:', e);
    return res.status(500).json({ ok: false, error: e?.message ?? 'AI error' });
  }
});

ai.post('/orchestrate', async (req: express.Request, res: express.Response) => {
  try {
    const { prompt, models } = req.body ?? {};
    if (!prompt) return res.status(400).json({ ok: false, error: 'Missing prompt' });

    const availableModels = DETECT_ORDER.filter(
      (m) =>
        (m === 'gemini' && clients.hasGemini()) ||
        (m === 'openai' && clients.hasOpenAI()) ||
        (m === 'anthropic' && clients.hasAnthropic()) ||
        (m === 'deepseek' && clients.hasDeepseek()) ||
        (m === 'qwen' && clients.hasQwen()) ||
        (m === 'xai' && clients.hasXai())
    );

    const modelsToRun =
      models && Array.isArray(models)
        ? models.filter((m) => availableModels.includes(m))
        : availableModels;

    const results: Partial<Record<AIModel, any>> = {};

    const promises = modelsToRun.map(async (model: AIModel) => {
      try {
        const result = await clients.run({ model, prompt });
        results[model] = { ok: true, ...result };
      } catch (err: any) {
        results[model] = { ok: false, error: err.message };
      }
    });

    await Promise.all(promises);

    return res.json({ ok: true, results });
  } catch (e: any) {
    console.error('Error in /orchestrate:', e);
    return res.status(500).json({ ok: false, error: e?.message ?? 'Orchestration error' });
  }
});
