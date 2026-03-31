import {
  PipeTransform, Type,
} from '@nestjs/common';
import { PDF_MIME_TYPE } from 'Common/constants/DocumentConstants';
import { createFilePipe } from 'Common/validator/FileValidator/file.validator.pipe';

const MAX_FILE_SIZE = 200 * 1024 * 1024;

const pipeCondition = { validateExtensions: PDF_MIME_TYPE, limitSize: MAX_FILE_SIZE };

export const TemplateFilePipe = (): Type<PipeTransform> => createFilePipe(pipeCondition);
