// Fix: Use default express import to avoid type conflicts.
import express from 'express';
import { buildProject } from '../scaffold/build';

export const scaffold = express.Router();

// Fix: Use explicit express types for req and res.
scaffold.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const { engineered } = req.body;
    if (!engineered) {
      return res.status(400).json({ ok: false, error: 'Missing engineered prompt' });
    }

    // In a production app, this long-running task would be offloaded to a job queue.
    // For this implementation, we run it synchronously to simplify frontend integration.
    console.log('Starting scaffold build...');
    const { projectId, projectDir } = await buildProject(engineered);
    console.log(`Scaffold build complete: ${projectDir}`);

    return res.json({ ok: true, projectId, projectDir });
  } catch (err: any) {
    console.error('[scaffold] error:', err);
    return res.status(500).json({ ok: false, error: err?.message ?? 'Scaffold failed' });
  }
});
