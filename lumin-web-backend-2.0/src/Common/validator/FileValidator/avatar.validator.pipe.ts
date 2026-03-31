/* eslint-disable @typescript-eslint/ban-types */
import {
  PipeTransform, Type,
} from '@nestjs/common';
import { MAX_AVATAR_SIZE } from 'Common/constants/OrganizationConstants';
// eslint-disable-next-line import/extensions
import { createFilePipe } from './file.validator.pipe';

const pipeCondition = { validateExtensions: ['image/jpg', 'image/jpeg', 'image/png'], limitSize: MAX_AVATAR_SIZE };

export const AvatarFilePipe = (): Type<PipeTransform> => createFilePipe(pipeCondition);
