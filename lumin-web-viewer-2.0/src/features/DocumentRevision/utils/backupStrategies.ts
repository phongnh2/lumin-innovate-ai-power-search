import { DebouncedFunc, throttle } from 'lodash';

import selectors from 'selectors';
import { store } from 'store';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';
import { BACK_UP_DOCUMENT_INTERVAL, CONTINUOUS_EDITS_BACKUP_TIMEOUT } from 'constants/urls';

const DEFAULT_BACKUP_DOCUMENT_INTERVAL = 1000 * 60 * 1;
const DEFAULT_CONTINUOUS_EDITS_BACKUP_TIMEOUT = 1000 * 18;
const DELAY_TIME_BETWEEN_BACKUPS = 5000;

const isPreviewOriginalVersionMode = () => selectors.isPreviewOriginalVersionMode(store.getState());

export class BackupStrategies {
  private timer: ReturnType<typeof setTimeout> | null = null;

  private backupInterval = BACK_UP_DOCUMENT_INTERVAL || DEFAULT_BACKUP_DOCUMENT_INTERVAL;

  private backupMinimumTimeout = CONTINUOUS_EDITS_BACKUP_TIMEOUT || DEFAULT_CONTINUOUS_EDITS_BACKUP_TIMEOUT;

  private continuousEditsTimer: ReturnType<typeof setTimeout> | null = null;

  private maxChanged = 5;

  private changedCount = 0;

  private backupCallback?: DebouncedFunc<() => Promise<void>>;

  private firstChangedTimestamp: number | null = null;

  private _stopDocumentBackup?: (params?: { keepChangedBackup?: boolean }) => void;

  constructor({ backupCallback }: { backupCallback?: () => Promise<void> }) {
    if (backupCallback) {
      this.overrideBackupCallback(backupCallback);
    }
  }

  private startTimer() {
    this.timer = setTimeout(async () => {
      if (isPreviewOriginalVersionMode()) {
        return;
      }

      if (this.changedCount > 0) {
        await this.backupCallback?.();
      }
    }, this.backupInterval);
  }

  private stopTimer() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  private restartTimer() {
    this.stopTimer();
    this.startTimer();
  }

  private stopContinuousEditsTimer() {
    clearTimeout(this.continuousEditsTimer);
    this.continuousEditsTimer = null;
  }

  private overrideBackupCallback(backupCallback: () => Promise<void>) {
    this.backupCallback = throttle(
      async () => {
        if (isPreviewOriginalVersionMode()) {
          return;
        }
        this.prepareNextBackup();
        await backupCallback();
      },
      DELAY_TIME_BETWEEN_BACKUPS,
      { trailing: true }
    );
  }

  private prepareNextBackup() {
    this.changedCount = 0;
    this.stopBackup();
    this._stopDocumentBackup?.({ keepChangedBackup: true });
  }

  public triggerChangedEvent = () => {
    this.changedCount += 1;
    this._stopDocumentBackup();
    const now = Date.now();
    if (!this.firstChangedTimestamp) {
      this.firstChangedTimestamp = now;
    }

    if (this.changedCount < this.maxChanged) {
      this.restartTimer();
      return;
    }

    this.stopTimer();
    if (this.changedCount === this.maxChanged && now - this.firstChangedTimestamp >= this.backupMinimumTimeout) {
      this.backupCallback?.().catch((err) => {
        logger.logError({
          error: err,
          reason: LOGGER.Service.BACK_UP_DOCUMENT_ERROR,
        });
      });
      return;
    }

    if (!this.continuousEditsTimer) {
      const timeToWait = Math.max(0, this.backupMinimumTimeout - (now - this.firstChangedTimestamp));
      this.continuousEditsTimer = setTimeout(() => {
        this.backupCallback?.().catch((err) => {
          logger.logError({
            error: err,
            reason: LOGGER.Service.BACK_UP_DOCUMENT_ERROR,
          });
        });
      }, timeToWait);
    }
  };

  public stopBackup() {
    this.stopTimer();
    this.stopContinuousEditsTimer();
    this.firstChangedTimestamp = null;
  }

  public cleanup() {
    this.stopBackup();
    this.backupCallback?.cancel();
    this._stopDocumentBackup?.();
  }

  public async restartBackup() {
    this.cleanup();
    if (this.changedCount > 0) {
      await this.backupCallback?.();
    }
  }

  public set stopDocumentBackup(stopDocumentBackupCallback: () => void) {
    this._stopDocumentBackup = stopDocumentBackupCallback;
  }

  public get getChangedCount() {
    return this.changedCount;
  }
}
