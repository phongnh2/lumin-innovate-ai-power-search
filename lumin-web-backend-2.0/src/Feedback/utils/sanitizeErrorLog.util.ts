import { omit } from 'lodash';

export const sanitizeErrorLog = (error) => omit(error, ['config.params.apiKey']);
