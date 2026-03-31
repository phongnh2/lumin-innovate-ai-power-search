import { useEffect, useState } from 'react';

import logger from 'helpers/logger';

export const useOpenDocumentErrorLogging = () => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (error) {
      logger.logError({
        reason: 'OPEN_DOCUMENT_FAILED',
        message: error.message ?? 'User cannot open document due to unknown reason',
        error,
      });
    }
  }, [error]);

  return {
    error,
    setError,
  };
};
