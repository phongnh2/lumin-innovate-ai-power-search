/* eslint-disable import/no-extraneous-dependencies */
import { Types } from 'mongoose';

import { InterfaceConstraint } from 'Common/directives/GraphqlDirective/Constraints/InterfaceConstraint';
import { Utils } from 'Common/utils/Utils';

export class MongoIdConstraint implements InterfaceConstraint {
  private readonly hashPathConstraint;

  constructor(
    private readonly options?: { isOptional?: boolean },
    private readonly fieldName?: string,
    private readonly typeName?: string,
  ) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}${this.typeName}`);
  }

  getName(): string {
    return `MongoIdConstraint_${this.hashPathConstraint}`;
  }

  getErrorMessage(value: string): string {
    return `${this.fieldName} - ${value} must be an ObjectId`;
  }

  validate(value: string): boolean {
    return (!value && this.options?.isOptional) || (value && Types.ObjectId.isValid(value));
  }

  parse(value: string): string {
    return value;
  }
}
