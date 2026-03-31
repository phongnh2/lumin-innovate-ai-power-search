import busboy from 'busboy';
import { FileTypeResult, MimeType } from 'file-type';
import { t } from 'i18next';
import { NextApiRequest } from 'next';

import { randomUUID } from 'node:crypto';

import { ALLOW_IMAGE_MIMETYPE } from '@/constants/common';
import { ErrorCode } from '@/constants/errorCode';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { ValidatorRule } from '@/constants/validator-rule';
import { HttpErrorException } from '@/lib/exceptions/HttpErrorException';

import { getErrorMessageTranslated } from './error.utils';

/**
 * Parse multipart/form-data Content-Type and return bytes buffer
 */

export const bufferAvatar = (req: NextApiRequest): Promise<{ avatarBuffer?: Buffer; error?: unknown }> => {
  return new Promise(resolve => {
    const bb = busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: ValidatorRule.Avatar.MaximumAvatarSize // bytes
      }
    });

    bb.on('file', (_, file) => {
      const buf: Uint8Array[] = [];
      file
        .on('error', err => resolve({ error: err }))
        .on('data', chunk => buf.push(chunk))
        .on('end', () => {
          // busboy @types is not up to date so we use any
          if ((file as any).truncated) {
            resolve({
              error: HttpErrorException.BadRequest({
                message: getErrorMessageTranslated(CommonErrorMessage.Avatar.LIMIT_FILE_SIZE, t),
                code: ErrorCode.Avatar.LIMIT_FILE_SIZE
              })
            });
          }
        })
        .on('close', () => resolve({ avatarBuffer: Buffer.concat(buf) }));
    })
      .on('filesLimit', () =>
        resolve({
          error: HttpErrorException.BadRequest({
            message: getErrorMessageTranslated(CommonErrorMessage.Avatar.ONLY_ONE_FILE_ALLOWED, t),
            code: ErrorCode.Avatar.ONLY_ONE_FILE_ALLOWED
          })
        })
      )
      .on('error', err => resolve({ error: err }));

    req.pipe(bb);
  });
};

export const avatarFilename = (ft?: FileTypeResult): string => {
  return `${randomUUID()}.${ft?.ext ?? 'unknown'}`;
};

export const validateFileType = (mimeType: MimeType) => ALLOW_IMAGE_MIMETYPE.some(mime => mime === mimeType);
