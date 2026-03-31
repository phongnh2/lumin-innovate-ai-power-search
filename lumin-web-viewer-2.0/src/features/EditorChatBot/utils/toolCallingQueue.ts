import { batch } from 'react-redux';
import { AnyAction } from 'redux';
import { v4 } from 'uuid';

import { setBackDropMessage } from 'actions/customActions';

import actions from 'actions';
import { store } from 'store';

import logger from 'helpers/logger';

import { setIsAiProcessing } from '../slices';

export interface QueueTask<F extends (...args: any[]) => any> {
  id: string;
  func: (...args: Parameters<F>) => Promise<void>;
  args: Parameters<F>;
}

class ToolCallingQueueManager {
  private queue: QueueTask<any>[] = [];

  private activeTask: QueueTask<any> | null = null;

  private isProcessing = false;

  private isPaused = false;

  addTask<F extends (...args: any[]) => any>(func: F, toolName: string, ...args: Parameters<F>): string {
    this.isPaused = false;
    const id = `${toolName}-${v4()}`;
    const newTask = { id, func, args };
    this.queue.push(newTask);
    return id;
  }

  public async processQueue(toolName?: string): Promise<void> {
    if (this.isProcessing || this.isPaused || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    if (toolName) {
      const taskIndex = this.queue.findIndex((task) => task.id.startsWith(`${toolName}-`));

      if (taskIndex === -1) {
        this.isProcessing = false;
        return;
      }

      this.activeTask = this.queue[taskIndex];
      this.queue.splice(taskIndex, 1);
    } else {
      this.activeTask = this.queue.shift() || null;
    }
    if (!this.activeTask) {
      this.isProcessing = false;
      return;
    }

    try {
      await this.activeTask.func(...this.activeTask.args);
    } catch (error) {
      logger.logError(error);
    } finally {
      this.activeTask = null;
      this.isProcessing = false;

      if (this.queue.length > 0 && !this.isPaused) {
        this.processQueue(toolName).catch(() => {});
      } else if (this.queue.length === 0) {
        batch(() => {
          store.dispatch(setIsAiProcessing(false));
          store.dispatch(
            actions.updateModalProperties({
              confirmButtonProps: {
                disabled: false,
              },
            }) as AnyAction
          );
          store.dispatch(setBackDropMessage(null));
        });
        logger.logInfo({
          reason: 'Queue completed',
          message: 'All tasks have been completed',
        });
      }
    }
  }

  cancelTask(taskId: string): boolean {
    const index = this.queue.findIndex((task) => task.id === taskId);

    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }

    return false;
  }

  clearQueue(toolName?: string): void {
    this.activeTask = null;
    this.isProcessing = false;
    this.isPaused = true;
    store.dispatch(setIsAiProcessing(false));
    if (toolName) {
      this.queue = this.queue.filter((task) => !task.id.startsWith(`${toolName}-`));
    } else {
      this.queue = [];
    }
  }

  pauseQueue(): void {
    if (!this.isPaused) {
      this.isPaused = true;
    }
  }

  resumeQueue(): void {
    if (this.isPaused) {
      this.isPaused = false;

      if (!this.isProcessing && this.queue.length > 0) {
        this.processQueue().catch(() => {});
      }
    }
  }

  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      isPaused: this.isPaused,
      activeTask: this.activeTask,
      pendingTasks: [...this.queue],
    };
  }
}

export const toolCallingQueue = new ToolCallingQueueManager();
export default toolCallingQueue;
