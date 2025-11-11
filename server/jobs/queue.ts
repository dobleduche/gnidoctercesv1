
type Job = () => Promise<void>;

const jobQueue: Job[] = [];
let isProcessing = false;

export const addJob = (job: Job) => {
  jobQueue.push(job);
  if (!isProcessing) {
    processQueue();
  }
};

const processQueue = async () => {
  if (jobQueue.length === 0) {
    isProcessing = false;
    return;
  }
  isProcessing = true;
  const job = jobQueue.shift();
  if (job) {
    try {
      await job();
    } catch (error) {
      console.error("Error processing job:", error);
    }
  }
  
  // Simulate async agent execution with a small delay
  setTimeout(processQueue, 500);
};
