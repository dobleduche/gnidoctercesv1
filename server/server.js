// server.js - Backend API Server for gnidoC terceS
// Run this separately from your Vite frontend

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ============================================
// API KEY STATUS ENDPOINT
// ============================================
app.get('/api/ai/key-status', (req, res) => {
  const status = {
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    xai: !!process.env.XAI_API_KEY,
  };

  res.json({
    ok: true,
    status: status
  });
});

// ============================================
// GOOGLE GEMINI API
// ============================================
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, model = 'gemini-pro' } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Gemini API key not configured' 
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    res.json({
      ok: true,
      text: text,
      model: model
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

app.get('/api/gemini/models', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Gemini API key not configured' 
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    res.json({
      ok: true,
      models: data.models || []
    });
  } catch (error) {
    console.error('Gemini models fetch error:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// ============================================
// ANTHROPIC CLAUDE API
// ============================================
app.post('/api/anthropic/generate', async (req, res) => {
  try {
    const { prompt, model = 'claude-sonnet-4-20250514', max_tokens = 1024 } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Anthropic API key not configured' 
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: max_tokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.content?.map(c => c.text).join('\n') || '';

    res.json({
      ok: true,
      text: text,
      model: model
    });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// ============================================
// DEEPSEEK API
// ============================================
app.post('/api/deepseek/generate', async (req, res) => {
  try {
    const { prompt, model = 'deepseek-chat', max_tokens = 1024 } = req.body;
    
    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(400).json({ 
        ok: false, 
        error: 'DeepSeek API key not configured' 
      });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: max_tokens
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    res.json({
      ok: true,
      text: text,
      model: model
    });
  } catch (error) {
    console.error('DeepSeek API error:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// ============================================
// XAI GROK API
// ============================================
app.post('/api/xai/generate', async (req, res) => {
  try {
    const { prompt, model = 'grok-beta', max_tokens = 1024 } = req.body;
    
    if (!process.env.XAI_API_KEY) {
      return res.status(400).json({ 
        ok: false, 
        error: 'xAI API key not configured' 
      });
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: max_tokens
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`xAI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    res.json({
      ok: true,
      text: text,
      model: model
    });
  } catch (error) {
    console.error('xAI API error:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// ============================================
// OPENAI API (NO GPT-4)
// ============================================
app.post('/api/openai/generate', async (req, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo', max_tokens = 1024 } = req.body;
    
    if (model.includes('gpt-4')) {
      return res.status(400).json({ 
        ok: false, 
        error: 'GPT-4 not allowed. Use gpt-3.5-turbo or o1.' 
      });
    }
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ 
        ok: false, 
        error: 'OpenAI API key not configured' 
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: max_tokens
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    res.json({
      ok: true,
      text: text,
      model: model
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// ============================================
// ORCHESTRATE ALL MODELS
// ============================================
app.post('/api/orchestrate', async (req, res) => {
  try {
    const { prompt, models = ['gemini', 'anthropic', 'deepseek', 'xai', 'openai'] } = req.body;
    
    const results = {};
    const promises = [];

    const modelConfigs = {
      gemini: { 
        url: `http://localhost:${PORT}/api/gemini/generate`,
        enabled: process.env.GEMINI_API_KEY 
      },
      anthropic: { 
        url: `http://localhost:${PORT}/api/anthropic/generate`,
        enabled: process.env.ANTHROPIC_API_KEY 
      },
      deepseek: { 
        url: `http://localhost:${PORT}/api/deepseek/generate`,
        enabled: process.env.DEEPSEEK_API_KEY 
      },
      xai: { 
        url: `http://localhost:${PORT}/api/xai/generate`,
        enabled: process.env.XAI_API_KEY 
      },
      openai: { 
        url: `http://localhost:${PORT}/api/openai/generate`,
        enabled: process.env.OPENAI_API_KEY 
      }
    };

    for (const model of models) {
      const config = modelConfigs[model];
      if (config && config.enabled) {
        promises.push(
          fetch(config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
          })
          .then(r => r.json())
          .then(data => { results[model] = data; })
          .catch(err => { results[model] = { ok: false, error: err.message }; })
        );
      }
    }

    await Promise.all(promises);

    res.json({
      ok: true,
      results: results
    });
  } catch (error) {
    console.error('Orchestration error:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Backend API Server running on http://localhost:${PORT}`);
  console.log('\n📡 Configured APIs:');
  console.log(`  Gemini:    ${process.env.GEMINI_API_KEY ? '✓' : '✗'}`);
  console.log(`  Claude:    ${process.env.ANTHROPIC_API_KEY ? '✓' : '✗'}`);
  console.log(`  DeepSeek:  ${process.env.DEEPSEEK_API_KEY ? '✓' : '✗'}`);
  console.log(`  xAI:       ${process.env.XAI_API_KEY ? '✓' : '✗'}`);
  console.log(`  OpenAI:    ${process.env.OPENAI_API_KEY ? '✓' : '✗'}`);
  console.log('\n🔗 Frontend should connect to: http://localhost:3001');
});
