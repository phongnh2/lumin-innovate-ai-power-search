import { useEffect, useState } from 'react';

import { HttpErrorCode } from '@/constants/errorCode';
import { frontendApi } from '@/lib/ory';

const useVerifyAuthencationMethod = (
  flowId: string | null
): {
  error:
    | {
        status: number;
        data: {
          message: string;
          code: string;
          meta: any;
        };
      }
    | undefined;
} => {
  const [error, setError] = useState<{
    status: number;
    data: {
      message: string;
      code: string;
      meta: any;
    };
  }>();
  const getError = async () => {
    if (flowId) {
      const { data } = await frontendApi.getRegistrationFlow({ flowId });
      const errorMessage: any | undefined = data.ui.messages?.find(message => (message.context as any)?.code)?.context;
      if (errorMessage) {
        setError({
          status: HttpErrorCode.NOT_ACCEPTABLE,
          data: {
            message: errorMessage.message,
            code: errorMessage.code,
            meta: errorMessage.meta
          }
        });
      }
    }
  };
  useEffect(() => {
    getError();
  }, [flowId]);
  return { error };
};

export default useVerifyAuthencationMethod;
