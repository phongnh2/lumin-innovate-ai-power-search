import { t } from 'i18next';

import { enqueueSnackbar } from '@libs/snackbar';

import selectors from 'selectors';
import { store } from 'store';

import { documentSyncSelectors } from 'features/Document/slices';

import { TOAST_DURATION } from 'constants/lumin-common';

export class ToolSwitchableChecker {
  private static isLoaded: boolean;

  static setIsAnnotationLoaded(value: boolean) {
    ToolSwitchableChecker.isLoaded = value;
  }

  static isAnnotationLoaded() {
    return ToolSwitchableChecker.isLoaded;
  }

  static isDocumentSyncing() {
    return (
      documentSyncSelectors.isSyncing(store.getState()) ||
      selectors.getCurrentDocument(store.getState())?.status?.isSyncing
    );
  }

  static showWarningMessage() {
    enqueueSnackbar({
      message: String(t('toast.warningDocumentLoading')),
      variant: 'warning',
      autoHideDuration: TOAST_DURATION,
    });
  }

  static createToolSwitchableHandler(callback: (...arg: unknown[]) => unknown) {
    return (...arg: unknown[]) => {
      if (!ToolSwitchableChecker.isAnnotationLoaded()) {
        ToolSwitchableChecker.showWarningMessage();
        return;
      }
      callback(...arg);
    };
  }
}
