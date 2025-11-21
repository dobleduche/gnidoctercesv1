import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model = 'claude-3-5-sonnet-20240620', max_tokens = 1024, messages } = body || {};

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages[] required' }, { status: 400 });
    }

    // Anthropic requires a "system" separate from user/assistant; we’ll pass through as-is.
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages, // e.g., [{role:'user', content:'...'}]
        stream: false,
      }),
    });

    const json = await resp.json();

    if (!resp.ok) {
      // Normalize Anthropic errors to your component contract
      const msg = json?.error?.message || json?.error?.type || `Anthropic ${resp.status}`;
      return NextResponse.json({ error: msg }, { status: resp.status });
    }

    // Your component expects: { content: [{type:'text', text: '...'}], usage:{input_tokens,output_tokens}, ... }
    return NextResponse.json(json, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Proxy error' }, { status: 500 });
  }
}
