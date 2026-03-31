import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { Utils } from 'Common/utils/Utils';

const regex: Record<string, RegExp> = {
  url: /(((https?|ftp):\/\/[a-zA-z0-9]+)|([a-zA-Z0-9]+\.[a-zA-Z]{2,})|([0-9]{1,3}\.){3}([0-9]{1,3})\b)/,
  html: /<([a-z1-6]+)>?.*?|<(.*) \/>/,
};

export class NotIncludesConstraint implements InterfaceConstraint {
  private readonly hashPathConstraint;

  constructor(
    private readonly options: {
      patterns: string[],
      isOptional: boolean,
    },
    private readonly fieldName?: string,
    private readonly typeName?: string,
  ) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}${this.typeName}`);
  }

  getName(): string {
    return `NotIncludesConstraint_${this.hashPathConstraint}`;
  }

  getErrorMessage(value: string): string {
    return `${this.fieldName} - ${value} must be a valid name`;
  }

  validate(value: string): boolean {
    const optional = this.options.isOptional && typeof value === 'undefined';
    return optional || typeof value === 'string'
    && this.options.patterns.every((patternKey) => !regex[patternKey].test(value));
  }

  parse(value: string): string {
    return value;
  }
}
