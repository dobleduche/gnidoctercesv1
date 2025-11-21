// FIX: Changed express import to default and used explicit types (express.Request, express.Response) to resolve type errors.
// Fix: Use default express import to avoid type conflicts.
import express from 'express';

export const proxy = express.Router();

// FIX: Use explicit express.Request and express.Response types to resolve type errors.
// Fix: Use explicit express types for req and res.
proxy.post('/anthropic', async (req: express.Request, res: express.Response) => {
  try {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return res
        .status(500)
        .json({ ok: false, error: 'Anthropic API key is not configured on the server.' });
    }

    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Forward the content-type header from Anthropic's response
    res.setHeader('Content-Type', apiResponse.headers.get('content-type') || 'application/json');

    // Forward the response body and status code
    const responseBody = await apiResponse.text();
    res.status(apiResponse.status).send(responseBody);
  } catch (err: any) {
    console.error('[proxy/anthropic] error:', err);
    return res.status(500).json({ ok: false, error: err?.message ?? 'Proxy request failed' });
  }
});
