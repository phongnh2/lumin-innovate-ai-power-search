import ValidatorJS from 'validator';
import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { Utils } from 'Common/utils/Utils';

export class MaxLengthConstraint implements InterfaceConstraint {
  private readonly hashPathConstraint;

  constructor(
    private readonly options: {
      max: number,
      isOptional?: boolean,
      strategy?: string,
    },
    private readonly fieldName?: string,
    private readonly typeName?: string,
  ) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}-${this.typeName}`);
  }

  MaxLengthStrategy = {
    default: (value: string): string => value.trim(),
    documentName: (value: string): string => {
      const lastIndexOfDot = value.lastIndexOf('.');
      const nameWithoutExtension = lastIndexOfDot === -1;
      const nameWithOnlyExtension = lastIndexOfDot === 0;
      if (nameWithoutExtension || nameWithOnlyExtension) {
        return value.trim();
      }
      return value.substring(0, lastIndexOfDot);
    },
  };

  getName(): string {
    return `MaxLengthConstraint_${this.hashPathConstraint}`;
  }

  getErrorMessage(value: string): string {
    return `${this.fieldName} - ${value} must be shorter than or equal to ${this.options.max} characters`;
  }

  validate(value: string): boolean {
    const validatorValue = this.MaxLengthStrategy[this.options.strategy](value);
    return (!validatorValue && this.options.isOptional)
    || (validatorValue && typeof validatorValue === 'string'
    && ValidatorJS.isLength(validatorValue, { min: 0, max: this.options.max }));
  }

  parse(value: string): string {
    return value.trim();
  }
}
