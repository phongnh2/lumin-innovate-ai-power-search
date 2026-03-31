/* eslint-disable max-classes-per-file */
import { v4 as uuidV4 } from 'uuid';

import { IMonitorHeapUsage } from 'Common/common.interface';

import { LoggerService } from 'Logger/Logger.service';

class HeapTracerTask {
  // eslint-disable-next-line no-use-before-define
  private _tracer: HeapTracer;

  private _metric: IMonitorHeapUsage;

  private _taskId: string;

  // eslint-disable-next-line no-use-before-define
  constructor(tracer: HeapTracer, private readonly _logger: LoggerService) {
    this._tracer = tracer;
    this._taskId = uuidV4();
  }

  get taskId(): string {
    return this._taskId;
  }

  init(taskName: string, metadata?: IMonitorHeapUsage['metadata']) {
    this._metric = {
      hrtime: process.hrtime(),
      heapBefore: process.memoryUsage(),
      taskName,
      metadata,
    };
  }

  /**
   * Calculate the difference between the before and after memory usage
   * @param before - The memory usage before the task
   * @param after - The memory usage after the task
   * @returns The difference in MB
   */
  private calcHeapDiff(before: number, after: number): number {
    return Number(((after - before) / 1024 / 1024).toFixed(2));
  }

  submit(): void {
    const hrTime = process.hrtime(this._metric.hrtime);
    const totalTime = hrTime[0] * 1000 + hrTime[1] / 1000000;
    const heapAfter = process.memoryUsage();
    this._logger.info({
      context: this._tracer.contextName,
      extraInfo: {
        processId: this._tracer.processId,
        taskName: this._metric.taskName,
        metadata: this._metric.metadata,
        totalTime,
        heapAfter: {
          rss: this.calcHeapDiff(this._metric.heapBefore.rss, heapAfter.rss),
          heapUsed: this.calcHeapDiff(this._metric.heapBefore.heapUsed, heapAfter.heapUsed),
        },
      },
    });
    this._tracer.delete(this.taskId);
  }
}

export class HeapTracer {
  private _tasks: Map<string, HeapTracerTask> = new Map();

  private readonly _processId: string;

  private readonly _context: string;

  private readonly _logger: LoggerService;

  constructor(context: string, logger: LoggerService) {
    this._context = context;
    this._processId = uuidV4();
    this._logger = logger;
  }

  get processId(): string {
    return this._processId;
  }

  get contextName(): string {
    return this._context;
  }

  start(taskName: string, metadata?: IMonitorHeapUsage['metadata']): HeapTracerTask {
    const task = new HeapTracerTask(this, this._logger);
    task.init(taskName, metadata);
    this._tasks.set(task.taskId, task);
    return task;
  }

  delete(taskId: string): void {
    this._tasks.delete(taskId);
  }
}
