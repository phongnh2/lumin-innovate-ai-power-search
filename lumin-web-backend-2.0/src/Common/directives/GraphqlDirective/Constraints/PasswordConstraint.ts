import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { Utils } from 'Common/utils/Utils';

export class PasswordConstraint implements InterfaceConstraint {
  private readonly hashPathConstraint;

  constructor(
    private readonly options: {
      level: string,
      min: number,
    },
    private readonly fieldName?: string,
    private readonly typeName?: string,
  ) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}${this.typeName}`);
  }

  getName(): string {
    return `PasswordConstraint_${this.hashPathConstraint}`;
  }

  getErrorMessage(value: string): string {
    return `${this.fieldName} - ${value} is not valid`;
  }

  private isMatchConditions(value: string): boolean {
    const numberValidator = (input: string) => (/[0-9]+/.test(input));
    const lowerCaseValidator = (input: string) => (/[a-z]+/.test(input));
    const upperCaseValidator = (input: string) => (/[A-Z]+/.test(input));

    const conditions = [
      numberValidator(value),
      lowerCaseValidator(value),
      upperCaseValidator(value),
    ];

    const matchedConditionCount = conditions.filter(Boolean).length;

    switch (this.options.level) {
      case 'weak':
        return matchedConditionCount >= 0;
      case 'medium':
        return matchedConditionCount >= 2;
      case 'strong':
        return matchedConditionCount === conditions.length;
      default:
        return false;
    }
  }

  validate(value: string): boolean {
    const spaceValidator = (input: string) => (/^\S+$/.test(input));
    return value
    && typeof value === 'string'
    && spaceValidator(value)
    && value.length >= this.options.min
    && this.isMatchConditions(value);
  }

  parse(value: string): string {
    return value;
  }
}
