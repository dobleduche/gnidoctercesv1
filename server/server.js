import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Models endpoint
app.get('/api/models', (req, res) => {
  const models = [
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'deepseek' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
    { id: 'grok-beta', name: 'Grok Beta', provider: 'xai' }
  ];
  res.json(models);
});

// API key status endpoint
app.get('/api/key-status', (req, res) => {
  const status = {
    gemini: !!process.env.GEMINI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    xai: !!process.env.XAI_API_KEY
  };
  res.json(status);
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
            content: 'Hello! This is a test response from the backend server. Your API is working correctly!'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 15,
        total_tokens: 25
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Chat completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Models endpoint: http://localhost:${PORT}/api/models`);
  console.log(`✅ Key status: http://localhost:${PORT}/api/key-status`);
});
