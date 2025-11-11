console.log('Server file is loading...');
console.log('Express version:', require('express/package.json').version);
const express = require('express');
const app = express();
const PORT = 3001;

// Middleware
app.use(require('cors')());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Working!' });
});

app.get('/api/models', (req, res) => {
  res.json([
    { id: 'gemini-pro', name: 'Gemini Pro' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'grok-beta', name: 'Grok Beta' }
  ]);
});

app.get('/api/key-status', (req, res) => {
  res.json({
    gemini: true,
    anthropic: true,
    deepseek: true,
    openai: true,
    xai: true
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
