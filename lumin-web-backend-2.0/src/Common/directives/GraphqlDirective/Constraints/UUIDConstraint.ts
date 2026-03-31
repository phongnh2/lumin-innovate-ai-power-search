import { isUUID } from 'class-validator';

import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { Utils } from 'Common/utils/Utils';

export class UUIDConstraint implements InterfaceConstraint {
  private readonly hashPathConstraint;

  constructor(
    private readonly options?: { isOptional?: boolean },
    private readonly fieldName?: string,
    private readonly typeName?: string,
  ) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}${this.typeName}`);
  }

  getName(): string {
    return `UUIDConstraint${this.hashPathConstraint}`;
  }

  getErrorMessage(value: string): string {
    return `${this.fieldName} - ${value} must be an UUID`;
  }

  validate(value: string): boolean {
    return (!value && this.options?.isOptional) || (value && isUUID(value));
  }

  parse(value: string): string {
    return value;
  }
}
