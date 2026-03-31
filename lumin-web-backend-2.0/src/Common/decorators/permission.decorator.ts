import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const AcceptancePermissions = (...permissions: string[]): CustomDecorator<string> => SetMetadata('permissions', permissions);
