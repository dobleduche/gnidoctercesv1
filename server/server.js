import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is working!' });
});

// Models endpoint
app.get('/api/models', (req, res) => {
  const models = [
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'deepseek' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
    { id: 'grok-beta', name: 'Grok Beta', provider: 'xai' },
  ];
  res.json(models);
});

// API key status endpoint
app.get('/api/key-status', (req, res) => {
  res.json({
    gemini: !!process.env.GEMINI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    xai: !!process.env.XAI_API_KEY,
  });
});

// AI Key Status (for the APIKeyConfigurator component)
app.get('/api/ai/key-status', (req, res) => {
  res.json({
    gemini: !!process.env.GEMINI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    xai: !!process.env.XAI_API_KEY,
  });
});

// Anthropic Proxy (for AnthropicFetcher component)
app.post('/api/proxy/anthropic', async (req, res) => {
  try {
    // Mock response since we don't have actual Anthropic API integration yet
    res.json({
      message:
        'Anthropic API proxy is working! Add your ANTHROPIC_API_KEY to .env to use real API.',
      status: 'mock_response',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gemini Models List (for GeminiModelFetcher component)
app.get('/api/ai/list-gemini-models', async (req, res) => {
  try {
    // Mock response with Gemini models
    res.json({
      models: [
        { name: 'gemini-pro', description: 'Gemini Pro' },
        { name: 'gemini-pro-vision', description: 'Gemini Pro Vision' },
      ],
      message: 'Add your GEMINI_API_KEY to .env to fetch real models from Google AI',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat completion endpoint
app.post('/api/chat/completions', async (req, res) => {
  try {
    const { model, messages } = req.body;

    const response = {
      id: 'chatcmpl-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content:
              'Hello! This is a test response from the backend server. Your API is working correctly! Configure your API keys in the .env file to use real AI models.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 15,
        total_tokens: 25,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`✅ Available endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/models`);
  console.log(`   - GET  /api/key-status`);
  console.log(`   - GET  /api/ai/key-status`);
  console.log(`   - GET  /api/ai/list-gemini-models`);
  console.log(`   - POST /api/proxy/anthropic`);
  console.log(`   - POST /api/chat/completions`);
});
