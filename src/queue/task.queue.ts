import { Queue, Worker } from "bullmq";
import { redisClient } from "../config/redis";
let taskQueue: Queue | null = null;
export const getTaskQueue = () => {
  if (!taskQueue) {
    taskQueue = new Queue("task-queue", { connection: redisClient });
  }
  return taskQueue;
};
export const addTaskJob = async (name: string, data: any) => {
  try {
    if (process.env.NODE_ENV === "test") return;
    const queue = getTaskQueue();
    await queue.add(name, data);
  } catch (error) {
    console.log("redis offline")
  }
};

export const startTaskWorker = () => {
    if(process.env.NODE_ENV === 'test' || process.env.DISABLE_BULLMQ_WORKER === 'true'){
        return;
    }
    const worker = new Worker(
        'task-queue',
        async (job) => {
            console.log(`Task Queue Processing ${job.name}  ${job.data} `)
        },
        {connection: redisClient}
    )
    worker.on('completed', (job) => {
        console.log(`Task Queue Job ${job.id} completed`)
    });
    worker.on('failed', (job, err) => {
        console.log(`Task Queue Job ${job?.id} failed with error ${err.message}`)
    });
}
