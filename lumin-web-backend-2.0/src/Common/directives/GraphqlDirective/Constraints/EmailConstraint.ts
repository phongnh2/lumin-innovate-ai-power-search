import { isEmail, IsEmailOptions } from 'validator';

import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { Utils } from 'Common/utils/Utils';

export class EmailConstraint implements InterfaceConstraint {
  private readonly hashPathConstraint;

  constructor(
    private readonly options?:{
      options?: IsEmailOptions
    },
    private readonly fieldName?: string,
    private readonly typeName?: string,
  ) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}${this.typeName}`);
  }

  getName(): string {
    return `EmailConstraint_${this.hashPathConstraint}`;
  }

  getErrorMessage(value: string): string {
    return `${this.fieldName} - ${value} must be an email`;
  }

  validate(value: string): boolean {
    return value && typeof value === 'string' && isEmail(value, this.options?.options);
  }

  parse(value: string): string {
    return value.toLowerCase();
  }
}
