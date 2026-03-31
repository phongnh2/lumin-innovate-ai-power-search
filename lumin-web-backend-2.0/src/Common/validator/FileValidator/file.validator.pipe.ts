/* eslint-disable @typescript-eslint/ban-types */
import {
  PipeTransform, mixin, Type,
} from '@nestjs/common';
import { ReadStream } from 'fs';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import type {
  ValidationType, FileTransformType, FileInput, FilesTransformListType, UploadFileType,
} from 'Common/validator/FileValidator/file.validator.interface';
import { MAX_THUMBNAIL_SIZE } from 'Document/documentConstant';
import { CustomDocumentFilePipeType } from './document.validator.pipe';

export const MAX_COVER_SIZE = 2 * 1024 * 1024;
export const imageValidationRules = ['image/png', 'image/jpg', 'image/jpeg'];

export type FileData = {
  mimetype: string,
  filename: string,
  filesize: number,
  fileBuffer: Buffer,
  type?: UploadFileType,
}

export function createFilePipe(
  { validateExtensions, limitSize, isRequestFromMobile } : ValidationType & CustomDocumentFilePipeType,
): Type<PipeTransform> {
  const multipleFileTypeUploadedRule = {
    thumbnail: { validateExtensions: imageValidationRules, limitSize: MAX_THUMBNAIL_SIZE, optional: true },
    document: { validateExtensions, limitSize },
    template: { validateExtensions, limitSize },
  };
  class FilePipe implements PipeTransform<FileTransformType | FilesTransformListType> {
    private async getFile(data, optional: boolean) {
      const file = await (await data.file).promise;
      if (!file) {
        if (optional) {
          return null;
        }
        throw GraphErrorException.BadRequest('File is required');
      }
      return file;
    }

    async transform(value: FileTransformType | FilesTransformListType): Promise<FileData | FileData[]> {
      if (!value) {
        return null;
      }

      if (Array.isArray(value)) {
        return Promise.all(value.map(async (data) => {
          const rule = multipleFileTypeUploadedRule[data.type];
          if (!rule) {
            throw GraphErrorException.BadRequest('Kind of file not supported');
          }
          const validationRules = rule.validateExtensions;
          const limitRule = rule.limitSize;
          const file = await this.getFile(data, rule.optional as boolean);
          const fileData = await this.destructFile(file as FileInput, { validateExtensions: validationRules, limitSize: limitRule });
          return {
            ...fileData,
            type: data.type,
          };
        }));
      }

      return this.destructFile(value.file as FileInput, { validateExtensions, limitSize });
    }

    async destructFile(data: FileInput, { validateExtensions: validationRules, limitSize: limitRule }: ValidationType)
    : Promise<FileData> {
      if (!data) {
        return null;
      }

      const {
        createReadStream,
        mimetype,
        filename,
      } = data;
      if (!validationRules.includes(mimetype)) {
        throw GraphErrorException.BadRequest('File type not supported');
      }
      let bytes = 0;
      const fileBuffer = await new Promise((resolve, reject) => {
        const readStream = createReadStream() as ReadStream;
        const buffers = [];
        readStream.on('data', (buffer) => {
          buffers.push(buffer);
          bytes += (buffer as Buffer).byteLength;
          if (bytes > limitRule && !isRequestFromMobile) {
            readStream.destroy();
            reject(new Error(`File size over ${Math.round(limitRule / 1024 / 1024)}MB`));
          }
        });
        readStream.on('error', (e) => {
          reject(e);
        });
        readStream.on('end', () => {
          resolve(buffers);
        });
      }).catch((e) => {
        throw GraphErrorException.BadRequest(e.message as string);
      });
      return {
        mimetype,
        filename,
        filesize: bytes,
        fileBuffer: Buffer.concat((fileBuffer as Uint8Array[])),
      };
    }
  }

  return mixin(FilePipe);
}
