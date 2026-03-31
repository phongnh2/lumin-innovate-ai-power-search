import chunk from 'lodash/chunk';
import range from 'lodash/range';

import logger from 'helpers/logger';

import { ManipChangedParams } from 'features/PageTracker/types/pageTracker.type';
import { PageManipulation } from 'features/PageTracker/utils/pageManipulation';

import { LOGGER } from 'constants/lumin-common';
import { AUTO_DETECT_QUEUE_THROTTLE_TIME } from 'constants/urls';

type Task = { pages: number[] };

const DEFAULT_AUTO_DETECT_QUEUE_THROTTLE_TIME = 18000;
const PROCESS_CHUNK_SIZE = 2;

type AutoDetectQueueOptions = {
  handleSendDocumentForDetect: (pages: number[]) => Promise<string>;
  handleListenForResult: (sessionId: string, pages: number[]) => void;
};

export class AutoDetectQueue {
  private static instance: AutoDetectQueue | null = null;

  private queue: Task[] = [];

  private processedPages: Set<number> = new Set();

  private totalPages: number;

  private processingLoopActive = false;

  private processingInterval: NodeJS.Timeout | null = null;

  private processingAttempts = 0;

  private readonly MAX_PROCESSING_ATTEMPTS = 10;

  private autoDetectQueueThrottleTime = AUTO_DETECT_QUEUE_THROTTLE_TIME || DEFAULT_AUTO_DETECT_QUEUE_THROTTLE_TIME;

  private handleSendDocumentForDetect: (pages: number[]) => Promise<string>;

  private handleListenForResult: (sessionId: string, pages: number[]) => void;

  private constructor({ handleSendDocumentForDetect, handleListenForResult }: AutoDetectQueueOptions) {
    this.handleSendDocumentForDetect = handleSendDocumentForDetect;
    this.handleListenForResult = handleListenForResult;
  }

  private processNextInQueue() {
    if (this.processingAttempts >= this.MAX_PROCESSING_ATTEMPTS) {
      this.stopProcessingLoop();
      return;
    }

    const taskToProcess = this.queue[0];
    this.processedPages = new Set([...Array.from(this.processedPages), ...taskToProcess.pages]);
    this.processingAttempts++;
    this.handleSendDocumentForDetect(taskToProcess.pages)
      .then((sessionId: string) => {
        this.handleListenForResult(sessionId, taskToProcess.pages);
      })
      .catch((error) => {
        logger.logError({
          reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
          message: 'Error in AutoDetectQueue',
          error: error as Error,
        });
      });
    this.queue = this.queue.slice(1);
    if (this.queue.length === 0) {
      this.stopProcessingLoop();
    }
  }

  private startProcessingLoop() {
    if (!this.processingLoopActive) {
      this.processingLoopActive = true;
      this.processingInterval = setInterval(() => {
        this.processNextInQueue();
      }, DEFAULT_AUTO_DETECT_QUEUE_THROTTLE_TIME);

      this.processNextInQueue();
    }
  }

  private stopProcessingLoop() {
    this.processingLoopActive = false;
    this.processingAttempts = 0;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  public static getInstance(options: AutoDetectQueueOptions): AutoDetectQueue {
    if (!AutoDetectQueue.instance) {
      AutoDetectQueue.instance = new AutoDetectQueue(options);
    }
    return AutoDetectQueue.instance;
  }

  public static clearInstance(): void {
    if (AutoDetectQueue.instance) {
      AutoDetectQueue.instance.stopProcessingLoop();
      AutoDetectQueue.instance = null;
    }
  }

  public handleTypeToolActivation() {
    if (this.processingLoopActive || this.processedPages.size === this.totalPages) {
      return;
    }

    if (!this.totalPages) {
      throw new Error('Total pages is not set for class AutoDetectQueue');
    }

    const pages = range(1, this.totalPages + 1);
    const unprocessedPages = pages.filter((page) => !this.processedPages.has(page));
    if (!unprocessedPages.length) {
      return;
    }

    const processedPagesChunk = chunk(unprocessedPages, PROCESS_CHUNK_SIZE);
    processedPagesChunk.forEach((pagesChunk) => {
      this.processedPages = new Set([...Array.from(this.processedPages), ...pagesChunk]);
      this.queue.push({ pages: pagesChunk });
    });

    this.startProcessingLoop();
  }

  public updateProcessedPages(pages: number[]) {
    this.processedPages = new Set([...Array.from(this.processedPages), ...pages]);
  }

  public getPageMapper(data: ManipChangedParams) {
    const { type, manipulationPages, movedOriginPage, mergedPagesCount } = data;
    return PageManipulation.MANIPULATION_HANDLERS[type]({
      originalPages: Array.from(this.processedPages),
      manipulationData: {
        manipulationPages,
        movedOriginPage,
        mergedPagesCount,
      },
    });
  }

  public updateProcessedPagesByManipulation(pageMapper: Map<number, number>) {
    this.processedPages = new Set(pageMapper.values());
  }

  set setTotalPages(pages: number) {
    this.totalPages = pages;
  }

  set setProcessedPages(pages: number[]) {
    this.processedPages = new Set(pages);
  }

  get getProcessedPages() {
    return this.processedPages;
  }
}
