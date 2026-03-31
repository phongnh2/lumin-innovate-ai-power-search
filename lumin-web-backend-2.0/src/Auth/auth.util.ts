import { AxiosError } from 'axios';

export interface HydraErrorInfo {
  errorMessage: string;
  errorCode?: string;
  statusCode?: number;
  responseData?: any;
  url?: string;
  method?: string;
  stack?: string;
}

export function extractHydraError(error: unknown): HydraErrorInfo {
  const axiosError = error as AxiosError;
  const responseData = axiosError.response?.data as any;
  const statusCode = axiosError.response?.status;
  const url = axiosError.config?.url || (axiosError.request)?.responseURL;
  const method = axiosError.config?.method?.toUpperCase();

  let errorMessage = 'Something went wrong';
  if (responseData) {
    if (responseData.error_description) {
      errorMessage = responseData.error_description;
    } else if (responseData.error) {
      errorMessage = `OAuth2 error: ${responseData.error}`;
      if (responseData.error_hint) {
        errorMessage += ` - ${responseData.error_hint}`;
      }
    } else if (typeof responseData === 'string') {
      errorMessage = responseData;
    } else if (responseData.message) {
      errorMessage = responseData.message;
    }
  } else if (axiosError.message) {
    errorMessage = axiosError.message;
  }

  return {
    errorMessage,
    errorCode: responseData?.error as string,
    statusCode,
    responseData,
    url: url as string,
    method,
    stack: axiosError.stack,
  };
}
