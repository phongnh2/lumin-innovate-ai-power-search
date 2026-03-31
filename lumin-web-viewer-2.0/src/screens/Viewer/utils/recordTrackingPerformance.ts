import DatadogAdaptor from 'utils/Factory/DatadogAdaptor';
import { getCommonAttributes } from 'utils/getCommonAttributes';

import UserEventConstants from 'constants/eventConstants';
import { GET_ANNOTATIONS, GET_DOCUMENT, GET_ME, TRACKING_PERFORMANCE_REF } from 'constants/timeTracking';

import { IDocumentBase } from 'interfaces/document/document.interface';

import timeTracking from '../time-tracking';

interface ITrackingData {
  startTime: number;
  endTime: number;
}

export const recordTrackingPerformance = async ({ currentDocument }: { currentDocument: IDocumentBase }) => {
  const getMeTrackingData = timeTracking.getTrackingInfo(GET_ME) as ITrackingData;
  const getDocumentTrackingData = timeTracking.getTrackingInfo(GET_DOCUMENT) as ITrackingData;
  const getAnnotationsTrackingData = timeTracking.getTrackingInfo(GET_ANNOTATIONS) as ITrackingData;
  const getTrackingReference = timeTracking.getTrackingInfo(TRACKING_PERFORMANCE_REF) as ITrackingData;
  if (!getDocumentTrackingData || !getAnnotationsTrackingData) {
    return;
  }

  const referenceTime = getMeTrackingData ? getMeTrackingData.startTime : getTrackingReference?.startTime;

  const documentSize = currentDocument.size / (1024 * 1024); // bytes to mb
  const trackingPerformanceMetrics = {
    fileSize: documentSize,
    startGetMe: 0,
    endGetMe: getMeTrackingData ? getMeTrackingData.endTime - referenceTime : 0,
    startGetDocument: getDocumentTrackingData.startTime - referenceTime,
    endGetDocument: getDocumentTrackingData.endTime - referenceTime,
    startGetAnnotations: getAnnotationsTrackingData.startTime - referenceTime,
    endGetAnnotations: getAnnotationsTrackingData.endTime - referenceTime,
    completeLoadedAnnotation: new Date().getTime() - referenceTime,
  };

  const commonAttributes = await getCommonAttributes();
  const recordData = {
    name: UserEventConstants.EventType.TRACKING_PERFORMANCE,
    attributes: commonAttributes,
    metrics: trackingPerformanceMetrics,
  };

  DatadogAdaptor.send(recordData);

  timeTracking.unRegister(GET_ME);
  timeTracking.unRegister(GET_DOCUMENT);
  timeTracking.unRegister(GET_ANNOTATIONS);
  timeTracking.unRegister(TRACKING_PERFORMANCE_REF);
};
