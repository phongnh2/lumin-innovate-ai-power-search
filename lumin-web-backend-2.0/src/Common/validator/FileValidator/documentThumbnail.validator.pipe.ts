import { mixin, PipeTransform, Type } from '@nestjs/common';
import { ValidationType, UploadFileTypeEnum } from 'Common/validator/FileValidator/file.validator.interface';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { MAX_THUMBNAIL_SIZE } from 'Document/documentConstant';
import { FileData, imageValidationRules } from './file.validator.pipe';

function createDocumentThumbnailPipe({ validateExtensions, limitSize, optional } : ValidationType): Type<PipeTransform> {
  class DocumentThumbnailPipe implements PipeTransform<FileData | FileData[]> {
    transform(value: FileData | FileData[]): FileData | FileData[] {
      if (!value) {
        return null;
      }
      if (Array.isArray(value)) {
        return value.map((file) => {
          if (!this.validateThumbnail(file)) {
            return null;
          }
          return file;
        }).filter(Boolean);
      }
      if (!this.validateThumbnail(value)) {
        return null;
      }
      return value;
    }

    validateThumbnail(file: FileData): boolean {
      if (!file.fileBuffer && optional) {
        return true;
      }
      if (file.type === UploadFileTypeEnum.Thumbnail && !validateExtensions.includes(file.mimetype)) {
        throw GraphErrorException.BadRequest('File type not supported');
      }
      return file.type !== UploadFileTypeEnum.Thumbnail || file.filesize <= limitSize;
    }
  }
  return mixin(DocumentThumbnailPipe);
}

const pipeCondition = { validateExtensions: imageValidationRules, limitSize: MAX_THUMBNAIL_SIZE };

interface IDocumentThumbnailPipe {
  optional?: boolean;
}

export const DocumentThumbnailPipe = (
  params?: IDocumentThumbnailPipe,
): Type<PipeTransform> => createDocumentThumbnailPipe({ ...pipeCondition, ...params });
