import * as Joi from 'joi';
import { isUndefined } from 'lodash';
import { Utils } from 'Common/utils/Utils';

export type IArrayConstraintOptions = {
  max: number,
  min: number,
  unique: boolean,
  isOptional: boolean,
}

export class ArrayConstraint {
  private readonly hashPathConstraint;

  constructor(private readonly options: IArrayConstraintOptions, private readonly fieldName: string, private readonly typeName?: string) {
    this.hashPathConstraint = Utils.hashConstraintKey(`${this.fieldName}${this.typeName}`);
  }

  getName(): string {
    return `ArrayConstraint_${this.hashPathConstraint}`;
  }

  private buildSchema() {
    const {
      min, max, unique,
    } = this.options;
    let schema = Joi.array().required();

    if (!isUndefined(min)) {
      schema = schema.min(Number(min));
    }
    if (!isUndefined(max)) {
      schema = schema.max(Number(max));
    }
    if (unique) {
      schema = schema.unique((a, b) => a === b);
    }
    return schema;
  }

  getErrorMessage(value: any[]): string {
    const schema = this.buildSchema();

    const validationResults = schema.validate(value);
    const { details } = validationResults.error;
    return `${this.fieldName} - ${value} - ${details?.[0]?.message}`;
  }

  validate(value: any[]): boolean {
    const {
      isOptional,
    } = this.options;
    if (isOptional && isUndefined(value)) {
      return true;
    }

    const schema = this.buildSchema();
    const validationResults = schema.validate(value);
    return !validationResults.error;
  }

  parse(value: any[]): any[] {
    return value;
  }
}
