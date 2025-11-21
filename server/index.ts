import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'crypto';
import { buildQueue, initBuildWorker } from './queue.js';
import { BuildRequest, BuildResult } from './orchestrator.js';
import { redisRateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: isDevelopment
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'http://localhost:*', 'ws://localhost:*'],
          },
        }
      : undefined,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// CORS configuration
const corsOptions = {
  origin: isDevelopment
    ? ['http://localhost:5173', 'http://localhost:3000']
    : process.env.APP_BASE_URL?.split(',') || [],
  credentials: true,
  optionsSuccessStatus: 200,
};


// Respect upstream proxy headers so rate limiting and logging use client IPs.
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(redisRateLimiter);
main

// In-memory store for demo; you can swap this with Redis/Postgres later.
const buildResults = new Map<string, BuildResult>();

// Initialize worker
initBuildWorker();

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is working!' });
});

// Key status
app.get('/api/key-status', (_req, res) => {
  res.json({
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  });
});

// ===== Build creation =====

app.post('/api/builds', async (req, res) => {
  const { target, stack, description, features, includeAuth, includeBilling } = req.body;

  if (!description || !stack || !target) {
    return res.status(400).json({ error: 'target, stack and description are required.' });
  }

  const id = randomUUID();

  const buildReq: BuildRequest = {
    id,
    target,
    stack,
    description,
    features: Array.isArray(features) ? features : [],
    includeAuth: !!includeAuth,
    includeBilling: !!includeBilling,
  };

  await buildQueue.add('build', buildReq, {
    removeOnComplete: true,
    removeOnFail: false,
  });

  res.status(202).json({
    buildId: id,
    status: 'queued',
  });
});

// ===== Build status =====

app.get('/api/builds/:id/status', async (req, res) => {
  const { id } = req.params;

  const jobs = await buildQueue.getJobCounts('completed', 'failed', 'waiting', 'active', 'delayed');
  // For real tracking per job, you’d use buildQueue.getJob(id). For now:
  const result = buildResults.get(id);
  if (result) {
    return res.json({ status: 'completed', buildId: id });
  }

  // minimal naive check: if not in results, treat as in-progress/unknown
  res.json({ status: 'pending', buildId: id, queue: jobs });
});

// ===== Build result =====

app.get('/api/builds/:id', (req, res) => {
  const { id } = req.params;
  const result = buildResults.get(id);

  if (!result) {
    return res.status(404).json({ error: 'Build not found or not completed yet.' });
  }

  res.json(result);
});

// ===== Live preview (Vite-like) =====

app.get('/api/builds/:id/preview', (req, res) => {
  const { id } = req.params;
  const result = buildResults.get(id);

  if (!result) {
    return res.status(404).send('Build not found or not completed yet.');
  }

  const indexHtml = result.files['index.html'] ?? '<h1>No index.html generated</h1>';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(indexHtml);
});

// Hook: receive completed builds from worker via queue events
// You can also store in Redis/Postgres instead of memory.
import { QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const events = new QueueEvents('buildQueue', { connection });

// Type guard to validate BuildResult structure
function isBuildResult(value: unknown): value is BuildResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'buildId' in value &&
    'files' in value &&
    typeof (value as BuildResult).buildId === 'string'
  );
}

events.on('completed', async ({ jobId, returnvalue }) => {
  if (isBuildResult(returnvalue)) {
    buildResults.set(returnvalue.buildId, returnvalue);
    console.log(`📦 Build ${returnvalue.buildId} stored in memory from job ${jobId}`);
  } else {
    console.error(`⚠️ Invalid build result received for job ${jobId}`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log('   - POST /api/builds           (create new build job)');
  console.log('   - GET  /api/builds/:id/status');
  console.log('   - GET  /api/builds/:id');
  console.log('   - GET  /api/builds/:id/preview');
});
