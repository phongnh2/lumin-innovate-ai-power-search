import { v4 as uuidV4 } from 'uuid';

import { logger } from './logger';

// This function might not work on client side due to browser compatibility
export const executeWithTimeLogger = async ({ fn, extraPayload }: { fn: () => any; extraPayload?: Record<string, any> }) => {
  let haveError = false;
  // generate unique id so we don't accidentally clear mark of other execution
  const executionID = uuidV4();
  const startMark = `start-execute-${executionID}`;
  const measureName = `execute-time-${executionID}`;

  try {
    performance.mark(startMark);
    return await fn();
  } catch (error) {
    haveError = true;
    throw error;
  } finally {
    const payload = {
      executeTime: performance.measure(measureName, startMark).duration,
      haveError,
      ...extraPayload
    };
    logger.info({
      message: 'Measure execution time',
      meta: payload
    });
    performance.clearMarks(startMark);
    performance.clearMeasures(measureName);
  }
};
