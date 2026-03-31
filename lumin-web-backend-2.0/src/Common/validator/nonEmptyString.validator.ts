import { ValidateIf, ValidationOptions } from 'class-validator';

export function ValidateIfNonEmptyString(validationOptions?: ValidationOptions) {
  return ValidateIf((_obj, value: string) => !!value, validationOptions);
}
