// Fix: Use default express import to avoid type conflicts.
import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';
import util from 'util';
import { exec } from 'child_process';
import process from 'process';

const execPromise = util.promisify(exec);
export const github = express.Router();

// Strict rate limiting for GitHub operations (system commands)
const githubLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  message: 'Too many GitHub repository creation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Fix: Use explicit express types for req and res.
github.post('/create-repo', githubLimiter, async (req: express.Request, res: express.Response) => {
  const { projectId, appName } = req.body;
  if (!projectId || !appName) {
    return res.status(400).json({ ok: false, error: 'Missing projectId or appName' });
  }
  // Basic validation to prevent directory traversal
  if (projectId.includes('..') || projectId.includes('/')) {
    return res.status(400).send('Invalid Project ID');
  }

  const projectDir = path.join(process.cwd(), 'generated', projectId);

  try {
    console.log(`[${projectId}] Initializing git repository...`);
    await execPromise('git init', { cwd: projectDir });

    console.log(`[${projectId}] Staging files...`);
    await execPromise('git add .', { cwd: projectDir });

    console.log(`[${projectId}] Committing files...`);
    await execPromise(
      'git config user.email "bot@gnidoc.xyz" && git config user.name "gnidoC terceS Bot"',
      { cwd: projectDir }
    );
    await execPromise('git commit -m "Initial commit from gnidoC terceS"', { cwd: projectDir });

    // --- GitHub API Simulation ---
    console.log(`[${projectId}] SIMULATING: Creating GitHub repository for '${appName}'...`);
    // In a real app, you would use the GitHub API (e.g., Octokit) here.
    // await octokit.repos.createForAuthenticatedUser({ name: appName });

    const repoUrl = `https://github.com/your-username/${appName.replace(/\s+/g, '-').toLowerCase()}`;

    console.log(`[${projectId}] SIMULATING: Adding remote origin: ${repoUrl}`);
    // await execPromise(`git remote add origin ${repoUrl}`, { cwd: projectDir });

    console.log(`[${projectId}] SIMULATING: Pushing to origin main...`);
    // await execPromise('git push -u origin main', { cwd: projectDir });
    // --- End Simulation ---

    // Add a small delay to make the simulation more realistic
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return res.json({ ok: true, repoUrl });
  } catch (err: any) {
    console.error('[%s] GitHub process failed:', projectId, err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? 'Failed to create repository' });
  }
});
