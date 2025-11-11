import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// All the routes your React app needs
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is working!' });
});

app.get('/api/models', (req, res) => {
  res.json([
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'deepseek' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
    { id: 'grok-beta', name: 'Grok Beta', provider: 'xai' }
  ]);
});

app.get('/api/key-status', (req, res) => {
  res.json({
    gemini: !!process.env.GEMINI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    xai: !!process.env.XAI_API_KEY
  });
});

app.get('/api/ai/key-status', (req, res) => {
  res.json({
    gemini: !!process.env.GEMINI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    xai: !!process.env.XAI_API_KEY
  });
});

app.post('/api/proxy/anthropic', (req, res) => {
  res.json({ message: "Anthropic API proxy working!" });
});

app.get('/api/ai/list-gemini-models', (req, res) => {
  res.json({
    models: [
      { name: "gemini-pro", description: "Gemini Pro" },
      { name: "gemini-pro-vision", description: "Gemini Pro Vision" }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`✅ Simple server running on http://localhost:${PORT}`);
});
