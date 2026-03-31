/// <reference path='./createFeatureAPI.d.ts' />
import actions from 'actions';
import core from 'core';

import localStorageManager from 'helpers/localStorageManager';
import logger from 'helpers/logger';
import TouchEventManager from 'helpers/TouchEventManager';

import { PRIORITY_ONE } from 'constants/actionPriority';
import Feature from 'constants/feature';
import { LOGGER } from 'constants/lumin-common';
import { ERROR_MESSAGE_PDFTRON } from 'constants/messages';

// a higher older function that creates the enableFeatures and disableFeatures APIs
export default (enable, store) => (features) => {
  // map a feature to the dataElements that should be enabled/disabled and the function to run
  const map = {
    [Feature.Measurement]: {
      dataElements: [
        'measurementToolGroupButton',
        'measurementOverlay',
        'distanceMeasurementToolButton',
        'perimeterMeasurementToolButton',
        'areaMeasurementToolButton',
        'ellipseMeasurementToolButton',
      ],
    },
    [Feature.Annotations]: {
      dataElements: [
        'notesPanel',
        'notesPanelButton',
        'toolsButton',
        'toggleToolsButton',
        'linkButton',
      ],
      fn: () => {
        if (enable) {
          core.showAnnotations(core.getAnnotationsList());
          core.enableTools(store);
        } else {
          core.hideAnnotations(core.getAnnotationsList());
          core.disableTools(store);
        }
      },
    },
    [Feature.Download]: {
      dataElements: ['downloadButton'],
    },
    [Feature.FilePicker]: {
      dataElements: ['filePickerHandler', 'filePickerButton'],
      fn: () => {
        // if (enable) {
        //   hotkeys.on('ctrl+o, command+o');
        // } else {
        //   hotkeys.off('ctrl+o, command+o');
        // }
      },
    },
    [Feature.LocalStorage]: {
      fn: () => {
        if (enable) {
          localStorageManager.enableLocalStorage();
        } else {
          localStorageManager.disableLocalStorage();
        }
      },
    },
    [Feature.NotesPanel]: {
      dataElements: [
        'annotationCommentButton',
        'notesPanelButton',
        'notesPanel',
      ],
    },
    [Feature.Print]: {
      dataElements: ['printButton', 'printModal'],
      fn: () => {
        // if (enable) {
        //   hotkeys.on('ctrl+p, command+p');
        // } else {
        //   hotkeys.off('ctrl+p, command+p');
        // }
      },
    },
    [Feature.Redaction]: {
      dataElements: ['redactionButton'],
      fn: () => {
        if (enable && !core.isFullPDFEnabled()) {
          logger.logInfo({
            message: ERROR_MESSAGE_PDFTRON.ENABLE_REDACTION,
            reason: LOGGER.Service.PDFTRON,
          });
        } else {
          core.setToolMode('AnnotationEdit');
        }

        if (enable) {
          core.enableRedaction();
        } else {
          core.disableRedaction();
        }
      },
    },
    [Feature.TextSelection]: {
      dataElements: ['textPopup', 'textSelectButton'],
      fn: () => {
        if (!enable) {
          core.clearSelection();
        }
        window.Core.Tools.Tool.ENABLE_TEXT_SELECTION = enable;
      },
    },
    [Feature.TouchScrollLock]: {
      fn: () => {
        TouchEventManager.enableTouchScrollLock = enable;
      },
    },
    [Feature.Copy]: {
      dataElements: ['copyTextButton'],
      fn: () => {
        // if (enable) {
        //   hotkeys.on('ctrl+c, command+c');
        // } else {
        //   hotkeys.off('ctrl+c, command+c');
        // }
      },
    },
    [Feature.MultipleViewerMerging]: {
      fn: () => {
        store.dispatch(actions.setIsMultipleViewerMerging(enable));
      },
    },
    [Feature.ThumbnailMerging]: {
      fn: () => {
        store.dispatch(actions.setThumbnailMerging(enable));
      },
    },
    [Feature.ThumbnailReordering]: {
      fn: () => {
        store.dispatch(actions.setThumbnailReordering(enable));
      },
    },
    [Feature.ThumbnailMultiselect]: {
      fn: () => {
        store.dispatch(actions.setThumbnailMultiselect(enable));
      },
    },
    [Feature.MouseWheelZoom]: {
      fn: () => {
        store.dispatch(actions.setMouseWheelZoom(enable));
      },
    },
  };

  if (!Array.isArray(features)) {
    features = [features];
  }

  features.forEach((feature) => {
    const { dataElements = [], fn = () => {} } = map[feature];

    if (enable) {
      store.dispatch(actions.enableElements(dataElements, PRIORITY_ONE));
    } else {
      store.dispatch(actions.disableElements(dataElements, PRIORITY_ONE));
    }

    fn();
  });
};
