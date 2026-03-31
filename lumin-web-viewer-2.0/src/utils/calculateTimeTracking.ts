import timeTracking from 'screens/Viewer/time-tracking';

import documentEvent from 'utils/Factory/EventCollection/DocumentEventCollection';

import { SAVING_DOCUMENT } from 'constants/timeTracking';

interface ITrackingData {
  startTime: number;
  endTime: number;
  timeTracking: number;
}
export const handleTrackTimeDocumentSaving = async <T>(operation: Promise<T>, serivce: string): Promise<T> => {
  timeTracking.register(SAVING_DOCUMENT);
  const result = await operation;

  timeTracking.finishTracking(SAVING_DOCUMENT);

  /**
   * https://lumin.atlassian.net/browse/LMV-5165
   * This is workaround when this function is called multiple times
   * The first call will register the time tracking, the second call will unregister the time tracking
   * But the first call will not have the time tracking info
   * So we need to check if the time tracking info is available
   */
  const timeToSaveTheDocument = (timeTracking.getTrackingInfo(SAVING_DOCUMENT) as ITrackingData)?.timeTracking;
  if (timeToSaveTheDocument) {
    documentEvent
      .documentSaving({
        timeToSaveTheDocument,
        source: serivce,
      })
      .catch(() => {});
  }
  timeTracking.unRegister(SAVING_DOCUMENT);
  return result;
};
