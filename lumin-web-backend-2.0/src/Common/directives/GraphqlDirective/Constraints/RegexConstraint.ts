import Validator from 'validator';
import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { Utils } from 'Common/utils/Utils';

export class RegexConstraint implements InterfaceConstraint {
  private readonly hashPathConstraint;

  constructor(
    private readonly options: {
      pattern: string,
      isOptional?: boolean,
    },
    private readonly fieldName: string,
    private readonly typeName?: string,
  ) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}${this.typeName}`);
  }

  getName(): string {
    return `RegexConstraint_${this.hashPathConstraint}`;
  }

  getErrorMessage(value: string): string {
    return `${this.fieldName} - ${value} is not valid`;
  }

  validate(value: string): boolean {
    return (this.options.isOptional && typeof value === 'undefined') || Validator.matches(value.trim(), this.options.pattern);
  }

  parse(value: string): string {
    return value;
  }
}
