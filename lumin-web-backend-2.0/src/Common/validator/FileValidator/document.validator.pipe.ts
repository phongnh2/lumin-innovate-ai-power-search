/* eslint-disable @typescript-eslint/ban-types */
import {
  PipeTransform, Type,
} from '@nestjs/common';
import { SUPPORTED_MIME_TYPE } from 'Common/constants/DocumentConstants';
// eslint-disable-next-line import/extensions
import { createFilePipe } from './file.validator.pipe';

export const MAX_FILE_SIZE = 200 * 1024 * 1024;

const pipeCondition = { validateExtensions: SUPPORTED_MIME_TYPE, limitSize: MAX_FILE_SIZE };

export type CustomDocumentFilePipeType = {
  isRequestFromMobile?: boolean;
}
export const DocumentFilePipe = (params?: CustomDocumentFilePipeType): Type<PipeTransform> => createFilePipe({ ...pipeCondition, ...params });
