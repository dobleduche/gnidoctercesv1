// server/auth.ts
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from './supabaseClient.js';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set');
}

export interface AuthContext {
  userId: string;
  workspaceId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

// Create or fetch user + workspace, then issue JWT
export async function handleLogin(req: Request, res: Response) {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email is required' });
  }

  // upsert user
  const { data: user, error: userErr } = await supabaseAdmin
    .from('users')
    .upsert({ email })
    .select('*')
    .single();

  if (userErr || !user) {
    console.error('login user error', userErr);
    return res.status(500).json({ error: 'Failed to create user' });
  }

  // ensure default workspace
  const { data: workspace, error: wsErr } = await supabaseAdmin
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .single();

  let workspaceId: string;

  if (wsErr || !workspace) {
    const { data: created, error: createErr } = await supabaseAdmin
      .from('workspaces')
      .insert({
        owner_id: user.id,
        name: `${email.split('@')[0]}'s workspace`,
        plan: 'free'
      })
      .select('*')
      .single();

    if (createErr || !created) {
      console.error('workspace create error', createErr);
      return res.status(500).json({ error: 'Failed to create workspace' });
    }
    workspaceId = created.id;
  } else {
    workspaceId = workspace.id;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email,
      workspaceId
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    userId: user.id,
    workspaceId,
    plan: workspace?.plan ?? 'free'
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      email: string;
      workspaceId: string;
    };

    req.auth = {
      userId: decoded.sub,
      workspaceId: decoded.workspaceId,
      email: decoded.email
    };

    next();
  } catch (err) {
    console.error('auth error', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
