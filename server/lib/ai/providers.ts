import { GoogleGenAI } from '@google/genai';
import { AIModel } from '../../../types';

// Minimal drivers. Add streaming later if needed.
export interface AIRequest {
  model: AIModel;
  system?: string;
  prompt: string;
  temperature?: number;
  json?: boolean;
}

export interface AIResponse {
  text: string;
  provider: AIModel;
  costCents?: number; // optional accounting hook
}

export class AIClients {
  private ai: GoogleGenAI | null = null;

  constructor(private env = process.env) {
    // Constructor is now empty to prevent startup errors from invalid keys.
  }

  private getGeminiClient(): GoogleGenAI {
    if (!this.ai) {
      if (this.hasGemini()) {
        this.ai = new GoogleGenAI({ apiKey: this.env.API_KEY });
      } else {
        throw new Error('Gemini API key not configured. Please set API_KEY in your environment.');
      }
    }
    return this.ai;
  }

  hasOpenAI() {
    return !!this.env.OPENAI_API_KEY;
  }
  hasAnthropic() {
    return !!this.env.ANTHROPIC_API_KEY;
  }
  hasGemini() {
    return !!this.env.API_KEY;
  }
  hasDeepseek() {
    return !!this.env.DEEPSEEK_API_KEY;
  }
  hasQwen() {
    return !!this.env.QWEN_API_KEY;
  }
  hasXai() {
    return !!this.env.XAI_API_KEY;
  }

  async run(req: AIRequest): Promise<AIResponse> {
    try {
      switch (req.model) {
        case 'openai':
          return await this.openai(req);
        case 'anthropic':
          return await this.anthropic(req);
        case 'deepseek':
          return await this.openaiCompatible(
            req,
            'https://api.deepseek.com/v1/chat/completions',
            this.env.DEEPSEEK_API_KEY!,
            'deepseek-chat'
          );
        case 'qwen':
          return await this.openaiCompatible(
            req,
            'https://api.qwen.com/v1/chat/completions',
            this.env.QWEN_API_KEY!,
            'qwen-turbo'
          );
        case 'xai':
          return await this.openaiCompatible(
            req,
            'https://api.x.ai/v1/chat/completions',
            this.env.XAI_API_KEY!,
            'grok-1.5-flash'
          );
        default:
          return await this.gemini(req);
      }
    } catch (error) {
      console.error(`[AI Provider Error - ${req.model}]`, error);
      // Re-throw the error to be handled by the calling route
      throw error;
    }
  }

  private async openaiCompatible(
    req: AIRequest,
    url: string,
    key: string,
    defaultModel: string
  ): Promise<AIResponse> {
    const body: any = {
      model: defaultModel,
      messages: [
        ...(req.system ? [{ role: 'system', content: req.system }] : []),
        { role: 'user', content: req.prompt },
      ],
      temperature: req.temperature ?? 0.4,
      max_tokens: 4096,
    };
    if (req.json) {
      body.response_format = { type: 'json_object' };
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const textResponse = await res.text();
    if (!res.ok) throw new Error(`${req.model} API Error: ${res.status} ${textResponse}`);
    const json = JSON.parse(textResponse);

    const text = json?.choices?.[0]?.message?.content ?? '';
    return { text, provider: req.model };
  }

  private async gemini(req: AIRequest): Promise<AIResponse> {
    const ai = this.getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: req.prompt,
      config: {
        systemInstruction: req.system,
        temperature: req.temperature ?? 0.4,
      },
    });

    return { text: response.text, provider: 'gemini' };
  }

  private async openai(req: AIRequest): Promise<AIResponse> {
    const key = this.env.OPENAI_API_KEY!;
    const url = 'https://api.openai.com/v1/chat/completions';
    const body: any = {
      model: 'gpt-3.5-turbo',
      messages: [
        ...(req.system ? [{ role: 'system', content: req.system }] : []),
        { role: 'user', content: req.prompt },
      ],
      temperature: req.temperature ?? 0.4,
    };
    if (req.json) {
      body.response_format = { type: 'json_object' };
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const textResponse = await res.text();
    if (!res.ok) throw new Error(`OpenAI API Error: ${res.status} ${textResponse}`);
    const json = JSON.parse(textResponse);

    const text = json?.choices?.[0]?.message?.content ?? '';
    return { text, provider: 'openai' };
  }

  private async anthropic(req: AIRequest): Promise<AIResponse> {
    const key = this.env.ANTHROPIC_API_KEY!;
    const url = 'https://api.anthropic.com/v1/messages';
    const body = {
      model: 'claude-3-5-sonnet-20240620',
      system: req.system,
      messages: [{ role: 'user', content: req.prompt }],
      max_tokens: 4096,
      temperature: req.temperature ?? 0.3,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const textResponse = await res.text();
    if (!res.ok) throw new Error(`Anthropic API Error: ${res.status} ${textResponse}`);
    const json = JSON.parse(textResponse);

    const text = json?.content?.[0]?.text ?? '';
    return { text, provider: 'anthropic' };
  }
}
