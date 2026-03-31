import { CommonConstants } from 'Common/constants/CommonConstants';
import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { Utils } from 'Common/utils/Utils';

export class HexColorConstraint implements InterfaceConstraint {
  private readonly hashPathConstraint;

  constructor(
    private readonly options: { isOptional?: boolean },
    private readonly fieldName?: string,
    private readonly typeName?: string,
  ) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}${this.typeName}`);
  }

  getName(): string {
    return `HexColorConstraint_${this.hashPathConstraint}`;
  }

  getErrorMessage(value: string): string {
    return `${this.fieldName} - ${value} must be a hex color`;
  }

  validate(value: string): boolean {
    return (!value && this.options.isOptional) || (value && typeof value === 'string' && CommonConstants.HEX_COLOR_REGEX.test(value));
  }

  parse(value: string): string {
    return value;
  }
}
