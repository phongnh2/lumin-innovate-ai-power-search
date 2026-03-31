import { Injectable } from '@nestjs/common';

import { IDocument } from 'Document/interfaces/document.interface';
import { PaymentPlanEnums } from 'Payment/payment.enum';

import { IndexingBacklogScoreConstants } from './constants/documentIndexingBacklog.constants';
import { IDocumentIndexingBacklog } from './interfaces/documentIndexingBacklog.interface';

const {
  RECENT_ACCESS_THRESHOLD_MINUTES,
  DAILY_ACCESS_THRESHOLD_MINUTES,
  WEEKLY_ACCESS_THRESHOLD_MINUTES,
  MAX_SCORE,
  HIGH_SCORE,
  MEDIUM_SCORE,
  MIN_SCORE,
  SMALL_FILE_SIZE_MB,
  MEDIUM_FILE_SIZE_MB,
  LARGE_FILE_SIZE_MB,
  QUEUE_DECAY_RATE,
  QUEUE_LENGTH_WEIGHT,
  LAST_ACCESS_WEIGHT,
  SUBSCRIPTION_WEIGHT,
  FILE_SIZE_WEIGHT,
  BYTES_TO_MB_DIVISOR,
} = IndexingBacklogScoreConstants;

@Injectable()
export class IndexingBacklogScoreService {
  constructor() {}

  getLastAccessScore(lastAccess: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - lastAccess.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMinutes <= RECENT_ACCESS_THRESHOLD_MINUTES) {
      return MAX_SCORE;
    }
    if (diffMinutes <= DAILY_ACCESS_THRESHOLD_MINUTES) {
      return HIGH_SCORE;
    }
    if (diffMinutes <= WEEKLY_ACCESS_THRESHOLD_MINUTES) {
      return MEDIUM_SCORE;
    }
    return MIN_SCORE;
  }

  getSubscriptionScore(subscription: PaymentPlanEnums): number {
    switch (subscription) {
      case PaymentPlanEnums.BUSINESS:
        return MAX_SCORE;
      case PaymentPlanEnums.ORG_PRO:
        return HIGH_SCORE;
      case PaymentPlanEnums.ORG_STARTER:
        return MEDIUM_SCORE;
      case PaymentPlanEnums.FREE:
        return MIN_SCORE;
      default:
        return MIN_SCORE;
    }
  }

  getFileSizeScore(size: number): number {
    const fileSizeInMB = size / BYTES_TO_MB_DIVISOR;
    if (fileSizeInMB <= SMALL_FILE_SIZE_MB) {
      return MAX_SCORE;
    }
    if (fileSizeInMB <= MEDIUM_FILE_SIZE_MB) {
      return HIGH_SCORE;
    }
    if (fileSizeInMB <= LARGE_FILE_SIZE_MB) {
      return MEDIUM_SCORE;
    }
    return MIN_SCORE;
  }

  getQueueLengthBasedScore(estimatedTotalBacklogDocs: number): number {
    return Math.floor(MAX_SCORE / (1 + QUEUE_DECAY_RATE * estimatedTotalBacklogDocs));
  }

  calculatePriorityScore(
    backlogDoc: IDocumentIndexingBacklog,
    document: IDocument,
    estimatedTotalBacklogDocs: number,
  ): number {
    const queueLengthBasedScore = this.getQueueLengthBasedScore(estimatedTotalBacklogDocs);
    const lastAccessedBasedScore = this.getLastAccessScore(new Date(document.lastAccess));
    const subscriptionBasedScore = this.getSubscriptionScore(backlogDoc.paymentPlan);
    const fileSizeBasedScore = this.getFileSizeScore(document.size);

    return QUEUE_LENGTH_WEIGHT * queueLengthBasedScore
         + LAST_ACCESS_WEIGHT * lastAccessedBasedScore
         + SUBSCRIPTION_WEIGHT * subscriptionBasedScore
         + FILE_SIZE_WEIGHT * fileSizeBasedScore;
  }

  getPriorityScore(
    backlogDocs: IDocumentIndexingBacklog[],
    documentMap: Map<string, IDocument>,
    estimatedTotalBacklogDocs: number,
  ): Map<string, number> {
    const priorityScoreMap = new Map<string, number>();

    backlogDocs.forEach((backlogDoc) => {
      const document = documentMap.get(backlogDoc.documentId);
      const priorityScore = this.calculatePriorityScore(
        backlogDoc,
        document,
        estimatedTotalBacklogDocs,
      );

      priorityScoreMap.set(backlogDoc.documentId, priorityScore);
    });

    return priorityScoreMap;
  }
}
