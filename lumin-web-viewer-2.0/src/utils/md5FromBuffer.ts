import { md5 } from 'js-md5';

import logger from 'helpers/logger';

export const md5FromBuffer = (buffer: ArrayBuffer): string => {
  try {
    const u8 = new Uint8Array(buffer);
    return md5(u8);
  } catch (error: unknown) {
    logger.logError({
      error: error as Error,
      message: `Failed to calculate MD5 hash`,
    });
    throw error;
  }
};
