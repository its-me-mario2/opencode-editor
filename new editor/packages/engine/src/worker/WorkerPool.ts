type WorkerTask = {
  id: string;
  type: string;
  payload: unknown;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: WorkerTask[] = [];
  private active: Map<string, WorkerTask> = new Map();
  private workerAvailable: number[] = [];
  private maxWorkers: number;

  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4) {
    this.maxWorkers = maxWorkers;
  }

  async spawnWorker(url: string): Promise<number> {
    const worker = new Worker(url, { type: 'module' });
    const index = this.workers.length;

    worker.onmessage = (event) => {
      const { id, type, data, error } = event.data;
      const task = this.active.get(id);

      if (type === 'complete' && task) {
        task.resolve(data);
        this.active.delete(id);
        this.workerAvailable.push(index);
        this.processQueue();
      } else if (type === 'error' && task) {
        task.reject(new Error(error));
        this.active.delete(id);
        this.workerAvailable.push(index);
        this.processQueue();
      }
    };

    worker.onerror = (error) => {
      const task = Array.from(this.active.values()).find(
        (t) => t.type === 'error',
      );
      if (task) {
        task.reject(error);
        this.active.delete(task.id);
      }
      this.workerAvailable.push(index);
      this.processQueue();
    };

    this.workers.push(worker);
    this.workerAvailable.push(index);
    return index;
  }

  postTask(type: string, payload: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        id: crypto.randomUUID(),
        type,
        payload,
        resolve,
        reject,
      };

      this.queue.push(task);
      this.processQueue();
    });
  }

  private processQueue(): void {
    while (this.queue.length > 0 && this.workerAvailable.length > 0) {
      const workerIndex = this.workerAvailable.shift()!;
      const task = this.queue.shift()!;
      const worker = this.workers[workerIndex]!;

      this.active.set(task.id, task);
      worker.postMessage({
        id: task.id,
        type: task.type,
        payload: task.payload,
      });
    }
  }

  terminate(): void {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.queue = [];
    this.active.clear();
    this.workerAvailable = [];
  }

  getWorkerCount(): number {
    return this.workers.length;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getActiveCount(): number {
    return this.active.size;
  }
}
