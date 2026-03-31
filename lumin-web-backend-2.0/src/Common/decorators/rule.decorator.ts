import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const AcceptanceRules = (...rules: string[]): CustomDecorator<string> => SetMetadata('rules', rules);
