import axios, { AxiosError } from 'axios';
import { unset } from 'lodash';

const sanitizedAxiosInstance = axios.create();

sanitizedAxiosInstance.interceptors.response.use(undefined, (error: AxiosError) => {
  // drop sensitive data from error to prevent accidental logging
  ['config.headers.Authorization', 'request._options', 'request._currentRequest', 'request._header'].forEach(path => unset(error, path));
  return Promise.reject(error);
});

export default sanitizedAxiosInstance;
