/**
 * Queue utility for PDFNet operations
 * Ensures that PDFNet operations execute in a sequential manner
 * preventing concurrent operations that might lead to bugs in Apryse PDFNet
 */

interface QueueItem<T> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

/**
 * Queue system for PDFNet operations to ensure sequential execution
 */
const pdfNetQueue = {
  queue: [] as QueueItem<unknown>[],
  isProcessing: false,

  /**
   * Enqueues a task to be executed sequentially
   * @param task - The task to execute
   * @returns Promise that resolves with the task result
   */
  enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        task,
        resolve: resolve as (value: unknown) => void,
        reject,
      });

      if (!this.isProcessing) {
        this.processQueue().catch(reject);
      }
    });
  },

  /**
   * Processes the queue sequentially
   */
  async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const item = this.queue.shift();
    if (!item) {
      this.isProcessing = false;
      return;
    }

    const { task, resolve, reject } = item;

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      await this.processQueue();
    }
  },
};

export default pdfNetQueue;
