import { isNumber } from 'lodash';
import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { Utils } from 'Common/utils/Utils';

export class RangeConstraint implements InterfaceConstraint {
  private readonly hashPathConstraint;

  constructor(private readonly options: { min: number, max: number }, private readonly fieldName?: string, private readonly typeName?: string) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}${this.typeName}`);
  }

  getName(): string {
    return `RangeConstraint_${this.hashPathConstraint}`;
  }

  getErrorMessage(value: number): string {
    if (this.options.min && this.options.max) {
      return `${this.fieldName} - ${value} must be between [${this.options.min}, ${this.options.max}]`;
    }
    if (this.options.min) {
      return `${this.fieldName} - ${value} must be greater than ${this.options.min}`;
    }
    if (this.options.max) {
      return `${this.fieldName} - ${value} must be less than ${this.options.max}`;
    }
    return 'Must be specify min or max';
  }

  validate(value: number): boolean {
    if ((this.options.min && this.options.max) || (isNumber(this.options.min) && isNumber(this.options.max))) {
      return value >= Number(this.options.min) && value <= Number(this.options.max);
    }
    if (this.options.min || isNumber(this.options.min)) {
      return value >= Number(this.options.min);
    }
    if (this.options.max || isNumber(this.options.max)) {
      return value <= Number(this.options.max);
    }
    return false;
  }

  parse(value: number): number {
    return value;
  }
}
