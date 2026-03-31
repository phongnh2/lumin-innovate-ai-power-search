import { SetMetadata, CustomDecorator } from '@nestjs/common';

import { CustomRuleAction } from 'CustomRules/custom-rule.enum';

export const CustomRuleValidator = (
  ...actions: CustomRuleAction[]
): CustomDecorator<string> => SetMetadata('CustomRuleAction', actions);

/**
 * Decorator to specify which storage service(s) should be validated for upload restrictions.
 * Used in conjunction with CustomRuleAction.RESTRICTED_FROM_UPLOADING_DOCUMENT
 *
 * @param storageServices - Array of storage services to validate
 */
export const StorageUploadValidator = (
  storageServices: string[],
): CustomDecorator<string> => SetMetadata('StorageService', storageServices);
