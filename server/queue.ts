// server/queue.ts
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { runBuildPipeline, BuildRequest, BuildResult } from './orchestrator.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const buildQueue = new Queue<BuildRequest>('buildQueue', { connection });

export function initBuildWorker() {
  const worker = new Worker<BuildRequest>(
    'buildQueue',
    async (job: Job<BuildRequest>) => {
      const result: BuildResult = await runBuildPipeline(job.data);
      return result;
    },
    { connection }
  );

  worker.on('completed', (job, result) => {
    console.log(`✅ Build job ${job.id} completed (${result.artifactType})`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Build job ${job?.id} failed:`, err);
  });

  return worker;
}
