import logger from 'helpers/logger';

import {
  CNC_LOCAL_STORAGE_KEY,
  PROMPTS_TO_DOWNLOAD_EXTENSION_ORDER,
  PROMPTS_TO_DOWNLOAD_APP_ORDER,
} from 'features/CNC/constants/customConstant';

type TrackerType = 'app' | 'extension';

type TrackerState = {
  status: boolean;
  time: number | null;
};

type AppTrackerPayload = {
  [K in typeof PROMPTS_TO_DOWNLOAD_APP_ORDER[number]]: TrackerState;
};

type ExtensionTrackerPayload = {
  [K in typeof PROMPTS_TO_DOWNLOAD_EXTENSION_ORDER[number]]: TrackerState;
};

const trackerMap = {
  app: {
    key: CNC_LOCAL_STORAGE_KEY.PROMPT_TO_DOWNLOAD_APP_CYCLE,
    initial: {
      hasViewedDownloadAppPage: { status: false, time: null },
      hasDownloadedApp: { status: false, time: null },
      hasOpenApp: { status: false, time: null },
    },
  },
  extension: {
    key: CNC_LOCAL_STORAGE_KEY.PROMPT_TO_DOWNLOAD_EXTENSION_CYCLE,
    initial: {
      hasViewedDownloadExtensionPage: { status: false, time: null },
      hasDownloadedExtension: { status: false, time: null },
      hasOpenExtension: { status: false, time: null },
    },
  },
} as Record<TrackerType, { key: string; initial: AppTrackerPayload | ExtensionTrackerPayload }>;

export class PromptToDownloadTracker {
  private static getTrackerInfo(type: TrackerType) {
    return trackerMap[type];
  }

  static registerTracker(type: TrackerType) {
    const { key, initial } = this.getTrackerInfo(type);
    try {
      localStorage.setItem(key, JSON.stringify(initial));
    } catch (err) {
      logger.logError({ message: 'Failed to register tracker', error: err });
    }
  }

  static updateTracker<T extends TrackerType>(
    type: T,
    payload: T extends 'app' ? Partial<AppTrackerPayload> : Partial<ExtensionTrackerPayload>
  ) {
    const { key, initial } = this.getTrackerInfo(type);

    try {
      const raw = localStorage.getItem(key);
      const existing = raw ? (JSON.parse(raw) as typeof initial) : initial;
      const updated = { ...existing, ...payload };
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      logger.logError({ message: 'Failed to update tracker', error: err });
    }
  }

  static removeTracker(type: TrackerType) {
    const { key } = this.getTrackerInfo(type);
    try {
      localStorage.removeItem(key);
    } catch (err) {
      logger.logError({ message: 'Failed to remove tracker', error: err });
    }
  }
}
