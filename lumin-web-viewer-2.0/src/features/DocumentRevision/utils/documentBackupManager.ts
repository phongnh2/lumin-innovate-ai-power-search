import selectors from 'selectors';
import { store } from 'store';

import { BACK_UP_DOCUMENT_INTERVAL } from 'constants/urls';

import { BackupStrategies } from './backupStrategies';

const DEFAULT_BACKUP_DOCUMENT_INTERVAL = 1000 * 60 * 1;

const isPreviewOriginalVersionMode = () => selectors.isPreviewOriginalVersionMode(store.getState());

export class DocumentBackupManager {
  private static instance: DocumentBackupManager | null = null;

  private timer: ReturnType<typeof setTimeout> | null = null;

  private backupInterval = BACK_UP_DOCUMENT_INTERVAL || DEFAULT_BACKUP_DOCUMENT_INTERVAL;

  private annotationBackupStrategies: BackupStrategies;

  private manipulationBackupStrategies: BackupStrategies;

  constructor({
    backupAnnotationCallback,
    backupManipulationCallback,
  }: {
    backupAnnotationCallback?: () => Promise<void>;
    backupManipulationCallback?: () => Promise<void>;
  }) {
    if (backupAnnotationCallback) {
      this.annotationBackupStrategies = new BackupStrategies({
        backupCallback: backupAnnotationCallback,
      });
      this.annotationBackupStrategies.stopDocumentBackup = this.stopTimer.bind(this) as () => void;
    }
    if (backupManipulationCallback) {
      this.manipulationBackupStrategies = new BackupStrategies({
        backupCallback: backupManipulationCallback,
      });
      this.manipulationBackupStrategies.stopDocumentBackup = this.stopTimer.bind(this) as () => void;
    }
  }

  static getInstance(options: {
    backupAnnotationCallback?: () => Promise<void>;
    backupManipulationCallback?: () => Promise<void>;
  }): DocumentBackupManager {
    if (!DocumentBackupManager.instance) {
      DocumentBackupManager.instance = new DocumentBackupManager(options);
    }
    return DocumentBackupManager.instance;
  }

  static clearInstance() {
    DocumentBackupManager.instance = null;
  }

  public triggerAnnotationEvent = () => {
    this.annotationBackupStrategies.triggerChangedEvent();
  };

  public triggerManipulationEvent = () => {
    this.manipulationBackupStrategies.triggerChangedEvent();
  };

  public stopTimer({ keepChangedBackup = false }: { keepChangedBackup?: boolean } = {}) {
    clearTimeout(this.timer);
    if (!keepChangedBackup && this.timer) {
      this.annotationBackupStrategies.stopBackup();
      this.manipulationBackupStrategies.stopBackup();
    }
    this.timer = null;
  }

  startTimer() {
    if (
      this.annotationBackupStrategies.getChangedCount <= 0 &&
      this.manipulationBackupStrategies.getChangedCount <= 0
    ) {
      return;
    }

    this.timer = setTimeout(async () => {
      if (isPreviewOriginalVersionMode()) {
        return;
      }

      await this.annotationBackupStrategies.restartBackup?.();
      await this.manipulationBackupStrategies.restartBackup?.();
    }, this.backupInterval);
  }

  public restartTimer() {
    this.stopTimer();
    this.startTimer();
  }

  public cleanup() {
    this.annotationBackupStrategies.cleanup();
    this.manipulationBackupStrategies.cleanup();
    this.stopTimer();
  }
}
