import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Get Express version using ES modules
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const expressVersion = require('express/package.json').version;

console.log('Server file is loading...');
console.log('Express version:', expressVersion);

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route - should work immediately
app.get('/api/health', (req, res) => {
  console.log('Health check called!');
  res.json({ status: 'OK', message: 'Server is working!' });
});

// Models endpoint
app.get('/api/models', (req, res) => {
  console.log('Models endpoint called!');
  res.json([
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'deepseek' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
    { id: 'grok-beta', name: 'Grok Beta', provider: 'xai' }
  ]);
});

// API key status endpoint
app.get('/api/key-status', (req, res) => {
  res.json({
    gemini: !!process.env.GEMINI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    xai: !!process.env.XAI_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`✅ Test with: curl http://localhost:${PORT}/api/health`);
});
