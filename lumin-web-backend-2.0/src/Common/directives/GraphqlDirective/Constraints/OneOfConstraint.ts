import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { Utils } from 'Common/utils/Utils';

export class OneOfConstraint implements InterfaceConstraint {
  private readonly hashPathConstraint;

  constructor(
    private readonly options: { isOptional?: boolean, values: Array<number | string> },
    private readonly fieldName?: string,
    private readonly typeName?: string,
  ) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}${this.typeName}`);
  }

  getName(): string {
    return `oneOfConstraint_${this.hashPathConstraint}`;
  }

  getErrorMessage(value: string): string {
    return `${this.fieldName} - ${value} must be one of the allowed values [${this.options.values.join(', ')}]`;
  }

  validate(value: number | string): boolean {
    return (!value && this.options.isOptional) || (value && this.options.values.includes(value));
  }

  parse(value: number | string): string {
    if (typeof value === 'string') {
      return value;
    }
    return value.toString();
  }
}
