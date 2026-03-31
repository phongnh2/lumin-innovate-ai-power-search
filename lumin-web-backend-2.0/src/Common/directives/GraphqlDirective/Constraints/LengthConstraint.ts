import ValidatorJS from 'validator';
import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { Utils } from 'Common/utils/Utils';

type ILengthConstraintInterface = {
  min: number
  max: number
  isOptional?: boolean,
}

export class LengthConstraint implements InterfaceConstraint {
  private readonly hashPathConstraint;

  constructor(private readonly options: ILengthConstraintInterface, private readonly fieldName:string, private readonly typeName?: string) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}-${this.typeName}`);
  }

  getName(): string {
    return `LengthConstraint_${this.hashPathConstraint}`;
  }

  getErrorMessage(value: string): string {
    return `${this.fieldName} - ${value} length must be in range [${this.options.min}, ${this.options.max}]`;
  }

  validate(value: string): boolean {
    const validatorValue = value.trim();
    const optional = typeof validatorValue === 'undefined' && this.options.isOptional;
    return optional || typeof validatorValue === 'string'
    && ValidatorJS.isLength(validatorValue, { min: this.options.min, max: this.options.max });
  }

  parse(value: string): string {
    return value.trim();
  }
}
